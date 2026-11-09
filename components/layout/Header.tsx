'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useTheme } from 'next-themes';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import { localeConfig, Locale } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Menu, X, Sun, Moon, Globe, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function Header() {
  const t = useTranslations('nav');
  const { theme, setTheme } = useTheme();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isLangOpen, setIsLangOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsLangOpen(false);
  };

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-background/80 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1 font-bold text-xl tracking-tight">
          Slow Darija<span className="w-1.5 h-1.5 rounded-full bg-primary mb-1 inline-block"></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t('home')}</Link>
          <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t('about')}</Link>
          <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t('pricing')}</Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase">{locale}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {isLangOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 rounded-xl bg-background border border-border shadow-md py-1 overflow-hidden z-50">
                {localeConfig.locales.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => changeLocale(loc)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>{localeConfig.localeNames[loc]}</span>
                    <span className="text-xs text-muted-foreground">{loc.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">{t('login')}</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">{t('register')}</Button>
            </Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground cursor-pointer"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-16 inset-x-0 bg-background border-b border-border p-4 shadow-lg flex flex-col gap-4"
          >
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-foreground py-2 border-b border-border/50">{t('home')}</Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-foreground py-2 border-b border-border/50">{t('about')}</Link>
            <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-foreground py-2 border-b border-border/50">{t('pricing')}</Link>
            
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm font-medium text-muted-foreground">Theme</span>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex flex-col gap-2 py-2 border-b border-border/50">
              <span className="text-sm font-medium text-muted-foreground">Language</span>
              <div className="flex flex-wrap gap-2">
                {localeConfig.locales.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => { changeLocale(loc); setIsMobileMenuOpen(false); }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer",
                      locale === loc ? "bg-primary/10 text-primary font-medium" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {localeConfig.localeNames[loc]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center">{t('login')}</Button>
              </Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full justify-center">{t('register')}</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
