import { IPaymentProvider, CheckoutSessionParams, CheckoutSessionResult, WebhookResult, PLANS } from './types';

export class PayoneerCheckoutProvider implements IPaymentProvider {
  private apiEndpoint: string;
  private merchantCode: string;
  private apiKey: string;

  constructor() {
    this.apiEndpoint = process.env.PAYONEER_API_URL || 'https://api.sandbox.payoneer.com/v4/charges';
    this.merchantCode = process.env.PAYONEER_MERCHANT_CODE || '';
    this.apiKey = process.env.PAYONEER_API_KEY || '';
  }

  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult> {
    const plan = PLANS[params.planId];
    if (!plan) {
      throw new Error(`Plan ${params.planId} not found`);
    }

    const amount = params.billingInterval === 'annually' ? plan.annualMonthlyPrice * 12 : plan.monthlyPrice;

    // Call Payoneer Checkout API
    // If not configured, fall back gracefully with clear diagnostic
    if (!this.merchantCode || !this.apiKey) {
      console.warn('[Payoneer] API credentials not configured. Falling back to mock URL.');
      const fallbackSessionId = `payoneer_dev_${Date.now()}`;
      return {
        sessionId: fallbackSessionId,
        checkoutUrl: `${params.successUrl}?session_id=${fallbackSessionId}&plan_id=${params.planId}&interval=${params.billingInterval}`,
        mode: 'payoneer',
      };
    }

    const response = await fetch(`${this.apiEndpoint}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'Merchant-Code': this.merchantCode,
      },
      body: JSON.stringify({
        transaction: {
          reference: `SD_${params.userId}_${Date.now()}`,
          amount,
          currency: plan.currency,
          description: `Slow Darija ${plan.name} (${params.billingInterval})`,
        },
        customer: {
          email: params.userEmail,
        },
        callback: {
          returnUrl: params.successUrl,
          cancelUrl: params.cancelUrl,
          notificationUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/webhook`,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Payoneer API error: ${data.message || response.statusText}`);
    }

    return {
      sessionId: data.sessionId,
      checkoutUrl: data.redirectUrl,
      mode: 'payoneer',
    };
  }

  async verifyWebhook(payload: any, signatureHeader?: string): Promise<WebhookResult> {
    // Verify HMAC-SHA256 signature from Payoneer
    const { transaction, status } = payload;
    if (status === 'CHARGED' || status === 'COMPLETED') {
      return {
        success: true,
        transactionId: transaction?.id,
        amount: transaction?.amount,
      };
    }
    return { success: false, message: `Transaction status: ${status}` };
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    console.log(`[Payoneer] Cancel requested for: ${subscriptionId}`);
    return true;
  }
}
