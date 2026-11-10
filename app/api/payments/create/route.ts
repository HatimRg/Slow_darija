import { NextResponse } from 'next/server';
import { getPaymentProvider } from '@/lib/payments/factory';
import { PLANS, BillingInterval } from '@/lib/payments/types';
import { query, withTransaction } from '@/lib/db/mysql';
import { RowDataPacket } from 'mysql2';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planId, interval = 'monthly', locale = 'en', userId, userEmail } = body;

    // Must not bypass login when selecting a plan
    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: 'Please log in or register before selecting a subscription plan.' },
        { status: 401 }
      );
    }

    const plan = PLANS[planId];
    if (!planId || !plan) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const targetUserId = userId || 'student-demo-uuid';
    const targetEmail = userEmail || 'student@slowdarija.com';

    // In mock mode: directly activate the subscription in MySQL and assign plan credits!
    await withTransaction(async (conn) => {
      // 1. Create or update subscription
      const subId = `sub_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await conn.query(
        `INSERT INTO subscriptions (id, user_id, plan_id, status, billing_interval, provider, current_period_end)
         VALUES (?, ?, ?, 'active', ?, 'mock', DATE_ADD(NOW(), INTERVAL 30 DAY))
         ON DUPLICATE KEY UPDATE plan_id = VALUES(plan_id), status = 'active', current_period_end = DATE_ADD(NOW(), INTERVAL 30 DAY)`,
        [subId, targetUserId, planId, interval]
      );

      // 2. Set user entitlement credits based on chosen plan (Starter=2, Plus=4, Premium=8)
      const creditsForPlan = plan.creditsPerMonth;
      await conn.query(
        `INSERT INTO user_entitlements (id, user_id, remaining_lesson_credits, credits_reset_at)
         VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))
         ON DUPLICATE KEY UPDATE remaining_lesson_credits = ?`,
        [`ent_${Date.now()}`, targetUserId, creditsForPlan, creditsForPlan]
      );

      // 3. Record transaction
      const txId = `tx_${Date.now()}`;
      const amount = interval === 'annually' ? plan.annualMonthlyPrice * 12 : plan.monthlyPrice;
      await conn.query(
        `INSERT INTO payment_transactions (id, user_id, plan_id, provider, provider_transaction_id, amount, currency, billing_interval, status)
         VALUES (?, ?, ?, 'mock', ?, ?, ?, ?, 'completed')`,
        [txId, targetUserId, planId, txId, amount, plan.currency, interval]
      );
    });

    const provider = getPaymentProvider();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const result = await provider.createCheckoutSession({
      userId: targetUserId,
      userEmail: targetEmail,
      planId,
      billingInterval: interval as BillingInterval,
      locale,
      successUrl: `${baseUrl}/${locale}/checkout/success`,
      cancelUrl: `${baseUrl}/${locale}/checkout/cancel`,
    });

    return NextResponse.json({
      ...result,
      assignedCredits: plan.creditsPerMonth,
    });
  } catch (error: any) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: error.message || 'Payment initiation failed' }, { status: 500 });
  }
}