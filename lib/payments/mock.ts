import { IPaymentProvider, CheckoutSessionParams, CheckoutSessionResult, WebhookResult, PLANS } from './types';

export class MockPaymentProvider implements IPaymentProvider {
  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult> {
    const plan = PLANS[params.planId];
    if (!plan) {
      throw new Error(`Plan ${params.planId} not found`);
    }

    const sessionId = `mock_sess_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // In mock mode, the checkout URL redirects directly to the success callback with session tokens
    const checkoutUrl = `${params.successUrl}?session_id=${sessionId}&plan_id=${params.planId}&interval=${params.billingInterval}&mock_success=true`;

    return {
      sessionId,
      checkoutUrl,
      mode: 'mock',
    };
  }

  async verifyWebhook(payload: any): Promise<WebhookResult> {
    const { userId, planId, interval } = payload;
    const plan = PLANS[planId];
    if (!plan) {
      return { success: false, message: 'Invalid plan' };
    }

    const amount = interval === 'annually' ? plan.annualMonthlyPrice * 12 : plan.monthlyPrice;

    return {
      success: true,
      userId,
      planId,
      interval,
      transactionId: `mock_tx_${Date.now()}`,
      amount,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    console.log(`[MockPayment] Canceled subscription: ${subscriptionId}`);
    return true;
  }
}
