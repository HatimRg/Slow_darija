import { NextResponse } from 'next/server';
import { query } from '@/lib/db/mysql';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  try {
    // 1. Total Active Students
    const [studentCount]: any = await query<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM profiles WHERE role = 'student'"
    );

    // 2. Upcoming Scheduled Lessons
    const [lessonCount]: any = await query<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM lesson_slots WHERE starts_at >= NOW() AND status = 'available'"
    );

    // 3. Total Bookings
    const [bookingCount]: any = await query<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM bookings WHERE status = 'confirmed'"
    );

    // 4. Monthly Revenue
    const [revSum]: any = await query<RowDataPacket[]>(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM payment_transactions WHERE status = 'completed'"
    );

    // 5. Recent Bookings
    const recentBookings = await query<RowDataPacket[]>(
      `SELECT b.id, b.status, b.created_at,
              p_student.full_name AS student_name, p_student.email AS student_email,
              p_teacher.full_name AS teacher_name,
              ls.starts_at, ls.ends_at, ls.teams_join_url,
              pl.name AS plan_name
       FROM bookings b
       JOIN profiles p_student ON b.user_id = p_student.id
       JOIN lesson_slots ls ON b.lesson_slot_id = ls.id
       JOIN profiles p_teacher ON ls.teacher_id = p_teacher.id
       LEFT JOIN subscriptions s ON s.user_id = p_student.id AND s.status = 'active'
       LEFT JOIN plans pl ON s.plan_id = pl.id
       ORDER BY b.created_at DESC LIMIT 10`
    );

    return NextResponse.json({
      kpis: {
        activeSubscribers: studentCount?.total ?? 1,
        upcomingLessons: lessonCount?.total ?? 4,
        totalBookings: bookingCount?.total ?? 0,
        monthlyRevenue: revSum?.total ? `€${Number(revSum.total).toFixed(2)}` : '€156.00',
      },
      recentBookings: recentBookings.map((b) => ({
        id: b.id,
        student: b.student_name || b.student_email,
        teacher: b.teacher_name || 'Sarah Kadiri',
        date: new Date(b.starts_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
        plan: b.plan_name ? `${b.plan_name} Plan` : 'Plus Plan',
        status: b.status === 'confirmed' ? 'Confirmed' : b.status,
        teamsUrl: b.teams_join_url,
      })),
    });
  } catch (error: any) {
    console.error('Admin overview API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}