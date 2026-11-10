'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/navigation';
import { apiUrl } from '@/lib/api';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    desc: 'Perfect for trying Darija at your own pace.',
    monthlyPrice: 19,
    credits: 2,
    features: ['2 live 1-on-1 lessons/month', '60-minute duration per lesson', 'Flexible scheduling', 'Moroccan cultural phrasebook'],
    popular: false,
  },
  {
    id: 'plus',
    name: 'Plus',
    desc: 'For committed learners who want steady progress.',
    monthlyPrice: 39,
    credits: 4,
    features: ['4 live 1-on-1 lessons/month', '60-minute duration per lesson', 'Flexible 24/7 scheduling', 'Priority lesson booking', 'Darija grammar & idiom notes', 'Personal speaking progress report'],
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    desc: 'Intensive learning with maximum flexibility.',
    monthlyPrice: 69,
    credits: 8,
    features: ['8 live 1-on-1 lessons/month', '60-minute duration per lesson', 'Flexible 24/7 scheduling', 'Highest priority booking', 'Dedicated native teacher', 'Monthly cultural immersion workshop', 'Direct teacher messaging between sessions'],
    popular: false,
  },
];

export function PricingCalculator() {
  const t = useTranslations('pricing');
  const common = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('slow_darija_user');
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const handleCheckout = async (planId: string) => {
    if (!currentUser) {
      router.push(`/login?plan_id=${planId}&interval=${isAnnual ? 'annually' : 'monthly'}`);
      return;
    }

    try {
      setLoadingPlan(planId);
      const res = await fetch(apiUrl('/api/payments/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          interval: isAnnual ? 'annually' : 'monthly',
          locale,
          userId: currentUser.id,
          userEmail: currentUser.email,
        }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-6">
      {/* Monthly / Annual Toggle Switch */}
      <div className="flex flex-col items-center justify-center mb-16">
        <div className="flex items-center p-1.5 bg-muted/80 border border-border/80 rounded-full relative shadow-xs">
          <button
            onClick={() => setIsAnnual(false)}
            className={cn(
              'relative px-6 py-2 text-sm font-semibold rounded-full transition-colors z-10 cursor-pointer',
              !isAnnual ? 'text-primary-foreground bg-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t('monthly')}
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={cn(
              'relative px-6 py-2 text-sm font-semibold rounded-full transition-colors z-10 cursor-pointer flex items-center gap-1.5',
              isAnnual ? 'text-primary-foreground bg-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>{t('annually')}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
              {t('save')}
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid gap-8 md:grid-cols-3 items-stretch">
        {plans.map((plan) => {
          const price = isAnnual ? plan.monthlyPrice * 0.9 : plan.monthlyPrice;
          const isLoading = loadingPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col bg-card border rounded-3xl p-8 sm:p-9 shadow-sm transition-all duration-300 justify-between',
                plan.popular
                  ? 'border-primary md:scale-105 md:-translate-y-2 z-10 shadow-xl ring-2 ring-primary/20'
                  : 'border-border/80 hover:border-primary/50 hover:shadow-md'
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                    {t('most_popular')}
                  </span>
                </div>
              )}

              <div>
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold tracking-tight">{plan.name}</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                      {plan.credits} Credits/mo
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{plan.desc}</p>
                </div>

                <div className="mb-8 flex items-baseline text-foreground">
                  <span className="text-3xl font-bold">{common('currency')}</span>
                  <div className="mx-1">
                    <span className="text-5xl font-extrabold tracking-tight">
                      {price.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-muted-foreground text-sm font-medium">
                    {t('per_month')}
                  </span>
                </div>

                <div className="space-y-3.5 pt-6 border-t border-border/60">
                  <div className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Plan Entitlements
                  </div>
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm text-foreground/90 font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 mt-6">
                <Button
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                  disabled={Boolean(loadingPlan)}
                  onClick={() => handleCheckout(plan.id)}
                  className="w-full font-bold text-base shadow-sm gap-2 cursor-pointer"
                >
                  <span>{isLoading ? 'Preparing...' : currentUser ? t('get_started') : 'Sign in to Choose Plan'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                {isAnnual && (
                  <p className="text-[11px] text-center text-muted-foreground mt-2">
                    {t('billed_annually')} (€{(price * 12).toFixed(2)} / year)
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}