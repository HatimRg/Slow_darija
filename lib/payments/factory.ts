import { IPaymentProvider } from './types';
import { MockPaymentProvider } from './mock';
import { PayoneerCheckoutProvider } from './payoneer';

let cachedProvider: IPaymentProvider | null = null;

export function getPaymentProvider(): IPaymentProvider {
  if (cachedProvider) return cachedProvider;

  const mode = process.env.PAYMENT_MODE || 'mock';

  if (mode === 'payoneer') {
    cachedProvider = new PayoneerCheckoutProvider();
  } else {
    cachedProvider = new MockPaymentProvider();
  }

  return cachedProvider;
}
