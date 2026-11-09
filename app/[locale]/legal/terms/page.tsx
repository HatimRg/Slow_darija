import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getTranslations } from 'next-intl/server';

export default async function TermsPage() {
  const t = await getTranslations('legal.terms');

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 py-16 px-6 sm:px-12 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl font-bold mb-8">{t('title')}</h1>
        
        <div className="prose prose-slate max-w-none text-muted-foreground">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service.
          </p>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">2. Subscriptions</h2>
          <p className="mb-4">
            Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle").
          </p>
          
          <p className="mb-4 mt-8 italic text-sm">
            This is a placeholder for the full terms of service content.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
