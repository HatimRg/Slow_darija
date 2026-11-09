export type BillingInterval = 'monthly' | 'annually';

export interface PlanConfig {
  id: string;
  name: string;
  monthlyPrice: number;
  annualMonthlyPrice: number; // monthlyPrice * 0.9
  currency: string;
  creditsPerMonth: number;
  features: string[];
}

export interface CheckoutSessionParams {
  userId: string;
  userEmail: string;
  planId: string;
  billingInterval: BillingInterval;
  locale: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  checkoutUrl: string;
  mode: 'mock' | 'payoneer';
}

export interface WebhookResult {
  success: boolean;
  userId?: string;
  planId?: string;
  interval?: BillingInterval;
  transactionId?: string;
  amount?: number;
  message?: string;
}

export interface IPaymentProvider {
  createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult>;
  verifyWebhook(payload: any, signatureHeader?: string): Promise<WebhookResult>;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
}

export const PLANS: Record<string, PlanConfig> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 19,
    annualMonthlyPrice: 17.1,
    currency: 'EUR',
    creditsPerMonth: 2,
    features: ['2 lessons/month', '60-minute lessons', 'Flexible scheduling'],
  },
  plus: {
    id: 'plus',
    name: 'Plus',
    monthlyPrice: 39,
    annualMonthlyPrice: 35.1,
    currency: 'EUR',
    creditsPerMonth: 4,
    features: ['4 lessons/month', '60-minute lessons', 'Flexible scheduling', 'Priority booking', 'Progress tracking'],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: 69,
    annualMonthlyPrice: 62.1,
    currency: 'EUR',
    creditsPerMonth: 8,
    features: ['8 lessons/month', '60-minute lessons', 'Flexible scheduling', 'Priority booking', 'Progress tracking', 'Dedicated teacher', 'Cultural workshops'],
  },
};
