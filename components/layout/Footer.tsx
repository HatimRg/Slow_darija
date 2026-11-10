'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function Footer() {
  const t = useTranslations('landing.footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-muted/30 pt-16 pb-8 border-t border-border overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none moroccan-pattern"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight group">
              <img
                src="/darija_learning/assets/Slow_Darija_Logo.png"
                alt="Slow Darija"
                className="w-8 h-8 object-contain rounded-lg shadow-xs transition-transform group-hover:scale-105"
              />
              <span className="flex items-center gap-1">
                Slow Darija<span className="w-1.5 h-1.5 rounded-full bg-primary mb-1 inline-block"></span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t('tagline')}
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-foreground">{t('product')}</h4>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('product')}</Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-foreground">{t('company')}</h4>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('company')}</Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-foreground">{t('legal')}</h4>
            <Link href="/legal/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('privacy')}</Link>
            <Link href="/legal/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('terms')}</Link>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Slow Darija. {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
