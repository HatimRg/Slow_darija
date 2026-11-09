import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getTranslations } from 'next-intl/server';
import { PricingCalculator } from '@/components/pricing/PricingCalculator';

export default async function PricingPage() {
  const t = await getTranslations('pricing');

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 py-16">
        <div className="text-center mb-12 px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
        <PricingCalculator />
      </main>
      <Footer />
    </div>
  );
}
