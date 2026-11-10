'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export function PricingTeaser() {
  const t = useTranslations('landing.pricing_teaser');

  return (
    <section className="relative overflow-hidden bg-primary/5 py-24 sm:py-32">
      <div className="absolute inset-0 z-0 moroccan-pattern opacity-[0.03] mix-blend-multiply" />
      
      <div className="container relative z-10 px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl bg-card p-10 shadow-lg sm:p-16"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t('title')}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              {t('subtitle')}
            </p>
            <div className="mt-10">
              <Button size="lg" asChild className="rounded-full px-8 text-base">
                <Link href="/pricing">{t('cta')}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
