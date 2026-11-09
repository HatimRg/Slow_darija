import { NextResponse } from 'next/server';
import { query, withTransaction } from '@/lib/db/mysql';
import { RowDataPacket } from 'mysql2';
import { PLANS } from '@/lib/payments/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'student-demo-uuid';

    // 1. Get profile
    const profileRows = await query<RowDataPacket[]>(
      'SELECT id, email, full_name, preferred_locale, role, created_at FROM profiles WHERE id = ?',
      [userId]
    );

    const user = profileRows[0] || {
      id: userId,
      email: 'student@slowdarija.com',
      full_name: 'Demo Student',
      preferred_locale: 'en',
      role: 'student',
    };

    // 2. Get active subscription
    const subRows = await query<RowDataPacket[]>(
      `SELECT s.id, s.plan_id, s.status, s.billing_interval, s.started_at, s.current_period_end,
              p.name AS plan_name, p.monthly_price, p.annual_price, p.lesson_credits_per_month
       FROM subscriptions s
       LEFT JOIN plans p ON s.plan_id = p.id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC LIMIT 1`,
      [userId]
    );

    const subscription = subRows[0] || {
      plan_id: 'plus',
      plan_name: 'Plus',
      status: 'active',
      billing_interval: 'monthly',
      monthly_price: 39,
      annual_price: 35.1,
      lesson_credits_per_month: 4,
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // 3. Get entitlements
    const entRows = await query<RowDataPacket[]>(
      'SELECT remaining_lesson_credits, credits_reset_at FROM user_entitlements WHERE user_id = ?',
      [userId]
    );

    const remainingCredits = entRows[0]?.remaining_lesson_credits ?? subscription.lesson_credits_per_month;

    return NextResponse.json({
      user,
      subscription,
      remainingCredits,
      availablePlans: PLANS,
    });
  } catch (error: any) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId = 'student-demo-uuid', full_name, email, preferred_locale, newPlanId, billing_interval } = body;

    const result = await withTransaction(async (conn) => {
      // 1. Update Profile fields
      if (full_name || email || preferred_locale) {
        await conn.query(
          `UPDATE profiles 
           SET full_name = COALESCE(?, full_name),
               email = COALESCE(?, email),
               preferred_locale = COALESCE(?, preferred_locale)
           WHERE id = ?`,
          [full_name, email, preferred_locale, userId]
        );
      }

      // 2. Change Plan if requested
      if (newPlanId && PLANS[newPlanId]) {
        const plan = PLANS[newPlanId];
        const interval = billing_interval || 'monthly';

        // Update or insert subscription
        await conn.query(
          `INSERT INTO subscriptions (id, user_id, plan_id, status, billing_interval, provider, current_period_end)
           VALUES (?, ?, ?, 'active', ?, 'mock', DATE_ADD(NOW(), INTERVAL 30 DAY))
           ON DUPLICATE KEY UPDATE plan_id = VALUES(plan_id), billing_interval = VALUES(billing_interval), status = 'active'`,
          [`sub_${Date.now()}`, userId, newPlanId, interval]
        );

        // Update user entitlement credits for new plan
        await conn.query(
          `INSERT INTO user_entitlements (id, user_id, remaining_lesson_credits, credits_reset_at)
           VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))
           ON DUPLICATE KEY UPDATE remaining_lesson_credits = ?`,
          [`ent_${Date.now()}`, userId, plan.creditsPerMonth, plan.creditsPerMonth]
        );
      }

      return { success: true };
    });

    return NextResponse.json({ success: true, message: 'Settings and profile updated successfully!' });
  } catch (error: any) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}