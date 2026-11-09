'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Hero() {
  const t = useTranslations('landing.hero');

  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-background py-20 lg:py-32">
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0 moroccan-pattern opacity-5 mix-blend-multiply" />
      <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-orange-200/40 via-amber-100/20 to-transparent blur-3xl" />

      <div className="container relative z-10 px-4 md:px-6">
        <div className="mx-auto flex max-w-[800px] flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {t('title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-balance text-lg text-muted-foreground sm:text-xl"
          >
            {t('subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex w-full flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <Button size="lg" asChild className="rounded-full text-base">
              <Link href="/register">{t('cta')}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="rounded-full text-base"
            >
              <Link href="/pricing">{t('secondary_cta')}</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
