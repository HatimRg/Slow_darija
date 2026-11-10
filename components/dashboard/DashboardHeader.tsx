'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useTheme } from 'next-themes';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import { localeConfig, Locale } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Globe, Sparkles, LogOut, Calendar, BookOpen, Settings, Menu, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiUrl } from '@/lib/api';

export function DashboardHeader() {
  const t = useTranslations('dashboard');
  const tNav = useTranslations('nav');
  const { theme, setTheme } = useTheme();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isLangOpen, setIsLangOpen] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<{ id: string; full_name: string; email: string; role: string } | null>(null);

  React.useEffect(() => {
    const stored = localStorage.getItem('slow_darija_user');
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const changeLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsLangOpen(false);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(apiUrl('/api/auth/logout'), { method: 'POST' });
      if (!response.ok) console.error(`Logout failed with status ${response.status}.`);
    } catch (error) {
      console.error('Logout request failed:', error);
    }

    localStorage.removeItem('slow_darija_user');
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-xl tracking-tight group">
            <img
              src="/darija_learning/assets/Slow_Darija_Logo.png"
              alt="Slow Darija"
              className="w-8 h-8 object-contain rounded-lg shadow-xs transition-transform group-hover:scale-105"
            />
            <span className="flex items-center gap-1">
              Slow Darija<span className="w-1.5 h-1.5 rounded-full bg-primary mb-1 inline-block"></span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              href="/dashboard"
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
                pathname === '/dashboard' ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
              )}
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
              href="/dashboard/settings"
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
                pathname.includes('/settings') ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Settings className="w-4 h-4" />
              Settings & Profile
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* User Name Tag */}
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-muted/60 text-xs font-semibold">
              <User className="w-3.5 h-3.5 text-primary" />
              <span className="truncate max-w-[120px]">{currentUser.full_name || currentUser.email}</span>
            </div>
          )}

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
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors p-2 rounded-lg hover:bg-destructive/10 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tNav('logout')}</span>
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2 text-foreground cursor-pointer"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="md:hidden border-t border-border p-4 bg-background space-y-3">
          <Link href="/dashboard" onClick={() => setIsMobileOpen(false)} className="block text-sm font-medium py-1">
            {tNav('dashboard')}
          </Link>
          <Link href="/pricing" onClick={() => setIsMobileOpen(false)} className="block text-sm font-medium py-1">
            {t('credits.upgrade')}
          </Link>
          <Link href="/dashboard/settings" onClick={() => setIsMobileOpen(false)} className="block text-sm font-medium py-1">
            Settings & Profile
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm font-medium py-1 text-destructive flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}