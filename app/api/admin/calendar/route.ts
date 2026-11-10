import { NextResponse } from 'next/server';
import { query } from '@/lib/db/mysql';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  try {
    const slots = await query<RowDataPacket[]>(
      `SELECT ls.id, ls.teacher_id, ls.starts_at, ls.ends_at, ls.capacity, ls.booked_count, ls.status, ls.teams_join_url,
              p.full_name AS teacher_name
       FROM lesson_slots ls
       JOIN profiles p ON ls.teacher_id = p.id
       ORDER BY ls.starts_at ASC`
    );

    const teachers = await query<RowDataPacket[]>(
      "SELECT id, full_name, email FROM profiles WHERE role IN ('teacher', 'admin')"
    );

    return NextResponse.json({ slots, teachers });
  } catch (error: any) {
    console.error('Admin calendar GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { teacherId, startsAt, endsAt, capacity = 1 } = body;

    if (!teacherId || !startsAt || !endsAt) {
      return NextResponse.json({ error: 'teacherId, startsAt, and endsAt are required' }, { status: 400 });
    }

    const slotId = `slot_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const meetingId = `teams_m_${Date.now()}`;
    const teamsUrl = `https://teams.microsoft.com/l/meetup-join/slow-darija-${slotId}`;

    await query(
      `INSERT INTO lesson_slots (id, teacher_id, starts_at, ends_at, capacity, booked_count, status, teams_meeting_id, teams_join_url)
       VALUES (?, ?, ?, ?, ?, 0, 'available', ?, ?)`,
      [slotId, teacherId, startsAt, endsAt, capacity, meetingId, teamsUrl]
    );

    return NextResponse.json({ success: true, slotId });
  } catch (error: any) {
    console.error('Admin calendar POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}