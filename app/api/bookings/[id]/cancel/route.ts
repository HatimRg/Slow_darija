import { NextResponse } from 'next/server';
import { withTransaction, query } from '@/lib/db/mysql';
import { RowDataPacket } from 'mysql2';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingOrSlotId } = await params;
    const body = await request.json().catch(() => ({}));
    const { userId = 'student-demo-uuid', isAdminOverride = false, role = 'student' } = body;

    const result = await withTransaction(async (connection) => {
      // 1. Find booking
      const [bookingRows]: any = await connection.query(
        `SELECT b.id AS booking_id, b.user_id, b.lesson_slot_id, b.status,
                ls.starts_at, ls.ends_at, ls.booked_count, ls.capacity
         FROM bookings b
         JOIN lesson_slots ls ON b.lesson_slot_id = ls.id
         WHERE (b.id = ? OR b.lesson_slot_id = ?) AND b.status = 'confirmed'
         FOR UPDATE`,
        [bookingOrSlotId, bookingOrSlotId]
      );

      const booking = bookingRows[0];
      if (!booking) {
        throw new Error('Active booking not found');
      }

      // Check 72h rule
      const lessonStartTime = new Date(booking.starts_at).getTime();
      const nowTime = Date.now();
      const hoursUntilLesson = (lessonStartTime - nowTime) / (1000 * 60 * 60);

      // Admins/teachers always get 100% refund. Students get refund ONLY if >= 72h away
      const isEligibleForRefund = isAdminOverride || role === 'admin' || role === 'teacher' || hoursUntilLesson >= 72;

      // 2. Mark booking canceled
      await connection.query(
        'UPDATE bookings SET status = ? WHERE id = ?',
        ['canceled', booking.booking_id]
      );

      // 3. Free up slot
      const newBookedCount = Math.max(0, booking.booked_count - 1);
      await connection.query(
        'UPDATE lesson_slots SET booked_count = ?, status = ? WHERE id = ?',
        [newBookedCount, 'available', booking.lesson_slot_id]
      );

      // 4. Refund credit if eligible
      let refunded = false;
      if (isEligibleForRefund) {
        await connection.query(
          'UPDATE user_entitlements SET remaining_lesson_credits = remaining_lesson_credits + 1 WHERE user_id = ?',
          [booking.user_id]
        );
        refunded = true;
      }

      // Get updated credits
      const [entitlementRows]: any = await connection.query(
        'SELECT remaining_lesson_credits FROM user_entitlements WHERE user_id = ?',
        [booking.user_id]
      );
      const remainingCredits = entitlementRows[0]?.remaining_lesson_credits ?? 0;

      return {
        bookingId: booking.booking_id,
        refunded,
        hoursUntilLesson: Math.round(hoursUntilLesson * 10) / 10,
        remainingCredits,
        message: refunded
          ? (isAdminOverride || role === 'admin')
            ? 'Lesson canceled by admin with 100% credit refund.'
            : 'Lesson canceled with full 1-credit refund (more than 72 hours notice).'
          : 'Lesson canceled. Per the 72-hour cancellation policy, this credit could not be refunded.',
      };
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Cancellation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to cancel lesson' }, { status: 400 });
  }
}