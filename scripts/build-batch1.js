const fs = require('fs');
const path = require('path');

function save(relPath, content) {
  const fullPath = path.join(__dirname, '..', relPath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content.trim(), 'utf8');
  console.log('Saved:', relPath);
}

// 1. DashboardHeader.tsx
save('components/dashboard/DashboardHeader.tsx', `'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useTheme } from 'next-themes';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import { localeConfig, Locale } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Globe, Sparkles, LogOut, Calendar, BookOpen, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DashboardHeader() {
  const t = useTranslations('dashboard');
  const tNav = useTranslations('nav');
  const { theme, setTheme } = useTheme();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isLangOpen, setIsLangOpen] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const changeLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsLangOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-1 font-bold text-xl tracking-tight">
            Slow Darija<span className="w-1.5 h-1.5 rounded-full bg-primary mb-1 inline-block"></span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/10 text-primary flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              {tNav('dashboard')}
            </Link>
            <Link
              href="/pricing"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              {t('credits.upgrade')}
            </Link>
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin Portal
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Credit balance badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>4 lessons remaining</span>
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase">{locale}</span>
            </button>
            {isLangOpen && (
              <div className="absolute right-0 top-full mt-2 w-36 rounded-xl bg-background border border-border shadow-lg py-1 z-50">
                {localeConfig.locales.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => changeLocale(loc)}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted flex items-center justify-between cursor-pointer"
                  >
                    <span>{localeConfig.localeNames[loc]}</span>
                    <span className="text-muted-foreground">{loc.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Sign Out */}
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-destructive">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tNav('logout')}</span>
            </Button>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2 text-foreground cursor-pointer"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
`);
