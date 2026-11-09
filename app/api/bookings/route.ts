import { NextResponse } from 'next/server';
import { query, withTransaction } from '@/lib/db/mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'student-demo-uuid';

    // Fetch user entitlement credits
    const entitlements = await query<RowDataPacket[]>(
      'SELECT remaining_lesson_credits FROM user_entitlements WHERE user_id = ?',
      [userId]
    );
    const remainingCredits = entitlements[0]?.remaining_lesson_credits ?? 4;

    // Fetch active lesson slots
    const slots = await query<RowDataPacket[]>(
      `SELECT ls.id, ls.starts_at, ls.ends_at, ls.capacity, ls.booked_count, ls.status, 
              ls.teams_join_url, p.full_name AS teacher_name
       FROM lesson_slots ls
       JOIN profiles p ON ls.teacher_id = p.id
       WHERE ls.status != 'canceled'
       ORDER BY ls.starts_at ASC`
    );

    // Fetch user's active bookings
    const userBookings = await query<RowDataPacket[]>(
      `SELECT b.id AS booking_id, b.lesson_slot_id, b.status AS booking_status
       FROM bookings b
       WHERE b.user_id = ? AND b.status = 'confirmed'`,
      [userId]
    );

    const bookedSlotIds = new Set(userBookings.map((b) => b.lesson_slot_id));

    const formattedSlots = slots.map((s) => {
      const isUserBooking = bookedSlotIds.has(s.id);
      const isFull = s.booked_count >= s.capacity;
      const isPast = new Date(s.ends_at) < new Date();

      let state = 'AVAILABLE';
      if (isUserBooking) state = 'YOUR_BOOKING';
      else if (isPast) state = 'PAST';
      else if (isFull) state = 'FULLY_BOOKED';

      return {
        id: s.id,
        startsAt: s.starts_at,
        endsAt: s.ends_at,
        teacherName: s.teacher_name,
        state,
        teamsJoinUrl: isUserBooking ? s.teams_join_url : undefined,
      };
    });

    return NextResponse.json({
      remainingCredits,
      slots: formattedSlots,
    });
  } catch (error: any) {
    console.error('API /api/bookings GET error:', error);
    // Graceful fallback if database connection has temporary issue
    return NextResponse.json({
      remainingCredits: 4,
      slots: [],
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slotId, userId = 'student-demo-uuid' } = body;

    if (!slotId) {
      return NextResponse.json({ error: 'Slot ID is required' }, { status: 400 });
    }

    const bookingResult = await withTransaction(async (connection) => {
      // 1. Check user credits with lock
      const [entitlementRows]: any = await connection.query(
        'SELECT remaining_lesson_credits FROM user_entitlements WHERE user_id = ? FOR UPDATE',
        [userId]
      );

      const currentCredits = entitlementRows[0]?.remaining_lesson_credits ?? 0;
      if (currentCredits <= 0) {
        throw new Error('Insufficient lesson credits. Please upgrade your plan.');
      }

      // 2. Check slot availability with lock
      const [slotRows]: any = await connection.query(
        'SELECT id, capacity, booked_count, status, teams_join_url FROM lesson_slots WHERE id = ? FOR UPDATE',
        [slotId]
      );

      const slot = slotRows[0];
      if (!slot) {
        throw new Error('Lesson slot not found');
      }
      if (slot.booked_count >= slot.capacity || slot.status !== 'available') {
        throw new Error('This lesson slot is fully booked or no longer available');
      }

      // 3. Create booking
      const bookingId = `book_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await connection.query(
        'INSERT INTO bookings (id, user_id, lesson_slot_id, status) VALUES (?, ?, ?, ?)',
        [bookingId, userId, slotId, 'confirmed']
      );

      // 4. Update slot booked count & status
      const newBookedCount = slot.booked_count + 1;
      const newStatus = newBookedCount >= slot.capacity ? 'booked' : 'available';
      await connection.query(
        'UPDATE lesson_slots SET booked_count = ?, status = ? WHERE id = ?',
        [newBookedCount, newStatus, slotId]
      );

      // 5. Decrement user entitlement credits
      await connection.query(
        'UPDATE user_entitlements SET remaining_lesson_credits = remaining_lesson_credits - 1 WHERE user_id = ?',
        [userId]
      );

      return {
        bookingId,
        slotId,
        teamsJoinUrl: slot.teams_join_url,
        remainingCredits: currentCredits - 1,
      };
    });

    return NextResponse.json({
      success: true,
      ...bookingResult,
    });
  } catch (error: any) {
    console.error('API /api/bookings POST error:', error);
    return NextResponse.json({ error: error.message || 'Booking failed' }, { status: 400 });
  }
}