'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/i18n/navigation';
import { User, Mail, Lock, Globe, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { localeConfig, Locale } from '@/lib/config';
import { apiUrl } from '@/lib/api';

export default function RegisterPage() {
  const t = useTranslations('auth.register');
  const tErrors = useTranslations('auth.errors');
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const searchParams = useSearchParams();

  const planId = searchParams.get('plan_id');
  const interval = searchParams.get('interval') || 'monthly';

  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [preferredLocale, setPreferredLocale] = React.useState<Locale>(currentLocale);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(tErrors('passwords_mismatch'));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          confirm_password: confirmPassword,
          preferred_locale: preferredLocale,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || tErrors('generic'));
      }

      // Save user session
      localStorage.setItem('slow_darija_user', JSON.stringify(data.user));

      if (planId) {
        const payRes = await fetch(apiUrl('/api/payments/create'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId,
            interval,
            userId: data.user.id,
            userEmail: data.user.email,
          }),
        });
        const payData = await payRes.json();
        if (payData.checkoutUrl) {
          window.location.href = payData.checkoutUrl;
          return;
        }
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || tErrors('generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-[90vh] flex items-center justify-center py-20 px-4 bg-background">
        <div className="w-full max-w-md bg-card border border-border/80 rounded-3xl p-8 sm:p-10 shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center justify-center mb-1 group">
              <img
                src="/darija_learning/assets/Slow_Darija_Logo.png"
                alt="Slow Darija"
                className="w-16 h-16 object-contain rounded-2xl shadow-sm transition-transform group-hover:scale-105"
              />
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>

          {planId && (
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>Create your account to activate your <strong className="capitalize">{planId}</strong> subscription.</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                {t('full_name')}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Youssef Alami"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@slowdarija.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                {t('confirm_password')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                {t('preferred_language')}
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={preferredLocale}
                  onChange={(e) => setPreferredLocale(e.target.value as Locale)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {localeConfig.locales.map((loc) => (
                    <option key={loc} value={loc}>
                      {localeConfig.localeNames[loc]} ({loc.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full gap-2 text-base font-semibold shadow-md cursor-pointer mt-2"
            >
              <span>{isLoading ? 'Creating account...' : t('submit')}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border/60">
            <span>{t('has_account')} </span>
            <Link
              href={planId ? `/login?plan_id=${planId}&interval=${interval}` : '/login'}
              className="font-semibold text-primary hover:underline"
            >
              {t('login_link')}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}