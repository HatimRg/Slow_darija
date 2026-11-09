import { NextResponse } from 'next/server';
import { query } from '@/lib/db/mysql';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  try {
    const bookings = await query<RowDataPacket[]>(
      `SELECT b.id, b.status, b.created_at,
              p_student.full_name AS student_name, p_student.email AS student_email,
              p_teacher.full_name AS teacher_name,
              ls.starts_at, ls.ends_at, ls.teams_join_url
       FROM bookings b
       JOIN profiles p_student ON b.user_id = p_student.id
       JOIN lesson_slots ls ON b.lesson_slot_id = ls.id
       JOIN profiles p_teacher ON ls.teacher_id = p_teacher.id
       ORDER BY ls.starts_at DESC`
    );

    return NextResponse.json({
      bookings: bookings.map((b) => ({
        id: b.id,
        student: b.student_name || b.student_email,
        teacher: b.teacher_name || 'Sarah Kadiri',
        time: `${new Date(b.starts_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} – ${new Date(b.ends_at).toLocaleTimeString([], { timeStyle: 'short' })}`,
        teamsUrl: b.teams_join_url || 'https://teams.microsoft.com/l/meetup-join/slow-darija',
        status: b.status === 'confirmed' ? 'Confirmed' : b.status,
      })),
    });
  } catch (error: any) {
    console.error('Admin bookings GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}