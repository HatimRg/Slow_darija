'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/i18n/navigation';
import { Lock, Mail, ArrowRight, AlertCircle, Info, ShieldCheck, GraduationCap, UserCheck } from 'lucide-react';
import { apiUrl } from '@/lib/api';

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const tErrors = useTranslations('auth.errors');
  const router = useRouter();
  const searchParams = useSearchParams();

  const planId = searchParams.get('plan_id');
  const interval = searchParams.get('interval') || 'monthly';

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const fillAccount = (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || tErrors('invalid_credentials'));
      }

      // Save user session in localStorage
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

      if (data.user?.role === 'admin') {
        router.push('/admin');
      } else if (data.user?.role === 'teacher') {
        router.push('/admin/calendar');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || tErrors('generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-[85vh] flex items-center justify-center py-20 px-4 bg-background">
        <div className="w-full max-w-md bg-card border border-border/80 rounded-3xl p-8 sm:p-10 shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>

          {/* Quick Select Test Accounts */}
          <div className="space-y-2 pt-1 pb-2">
            <span className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">
              Quick Sign In as Test Account
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillAccount('student@slowdarija.com', 'student123')}
                className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold flex flex-col items-center gap-1 transition-colors cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-primary" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => fillAccount('teacher@slowdarija.com', 'teacher123')}
                className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold flex flex-col items-center gap-1 transition-colors cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Teacher</span>
              </button>

              <button
                type="button"
                onClick={() => fillAccount('admin@slowdarija.com', 'admin123')}
                className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold flex flex-col items-center gap-1 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {planId && (
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>Please sign in to confirm your <strong className="capitalize">{planId}</strong> plan selection.</span>
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-muted-foreground uppercase">
                  {t('password')}
                </label>
                <span className="text-xs text-primary hover:underline cursor-pointer">
                  {t('forgot_password')}
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full gap-2 text-base font-semibold shadow-md cursor-pointer mt-2"
            >
              <span>{isLoading ? 'Signing in...' : t('submit')}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border/60">
            <span>{t('no_account')} </span>
            <Link
              href={planId ? `/register?plan_id=${planId}&interval=${interval}` : '/register'}
              className="font-semibold text-primary hover:underline"
            >
              {t('sign_up_link')}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}