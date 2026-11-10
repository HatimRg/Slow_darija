import { NextResponse } from 'next/server';
import { query } from '@/lib/db/mysql';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  try {
    const students = await query<RowDataPacket[]>(
      `SELECT p.id, p.full_name AS name, p.email, p.created_at,
              COALESCE(ue.remaining_lesson_credits, 0) AS credits,
              COALESCE(pl.name, 'Plus') AS plan_name,
              COALESCE(s.billing_interval, 'monthly') AS billing_interval
       FROM profiles p
       LEFT JOIN user_entitlements ue ON p.id = ue.user_id
       LEFT JOIN subscriptions s ON p.id = s.user_id AND s.status = 'active'
       LEFT JOIN plans pl ON s.plan_id = pl.id
       WHERE p.role = 'student'
       ORDER BY p.created_at DESC`
    );

    return NextResponse.json({
      students: students.map((s) => ({
        id: s.id,
        name: s.name || 'Student',
        email: s.email,
        plan: `${s.plan_name} (${s.billing_interval})`,
        credits: s.credits,
        joinedDate: new Date(s.created_at).toISOString().split('T')[0],
      })),
    });
  } catch (error: any) {
    console.error('Admin students GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, delta } = body;

    if (!studentId || typeof delta !== 'number') {
      return NextResponse.json({ error: 'studentId and delta are required' }, { status: 400 });
    }

    await query(
      `INSERT INTO user_entitlements (id, user_id, remaining_lesson_credits, credits_reset_at)
       VALUES (?, ?, GREATEST(0, ?), DATE_ADD(NOW(), INTERVAL 30 DAY))
       ON DUPLICATE KEY UPDATE remaining_lesson_credits = GREATEST(0, remaining_lesson_credits + ?)`,
      [`ent_${Date.now()}`, studentId, delta, delta]
    );

    const [updated]: any = await query<RowDataPacket[]>(
      'SELECT remaining_lesson_credits FROM user_entitlements WHERE user_id = ?',
      [studentId]
    );

    return NextResponse.json({
      success: true,
      credits: updated?.remaining_lesson_credits ?? 0,
    });
  } catch (error: any) {
    console.error('Admin students POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}