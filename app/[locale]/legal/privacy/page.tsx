import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getTranslations } from 'next-intl/server';

export default async function PrivacyPage() {
  const t = await getTranslations('legal.privacy');

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 py-16 px-6 sm:px-12 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl font-bold mb-8">{t('title')}</h1>
        
        <div className="prose prose-slate max-w-none text-muted-foreground">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">
            We collect information you provide directly to us when you create an account, update your profile, use the interactive features of our services, participate in contests, promotions or surveys, request customer support, or otherwise communicate with us.
          </p>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">
            We may use information about you for various purposes, including to provide, maintain, and improve our services, develop new products and services, personalize your experience, and send you technical notices, updates, security alerts, and support and administrative messages.
          </p>
          
          <p className="mb-4 mt-8 italic text-sm">
            This is a placeholder for the full privacy policy content.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
