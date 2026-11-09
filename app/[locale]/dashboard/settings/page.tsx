'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { User, Mail, Globe, Moon, Sun, CreditCard, Sparkles, Check, AlertCircle, CheckCircle2 } from 'lucide-react';
import { localeConfig } from '@/lib/config';
import { useRouter, usePathname } from '@/i18n/navigation';
import { apiUrl } from '@/lib/api';

export default function StudentSettingsPage() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [preferredLocale, setPreferredLocale] = React.useState(locale);
  const [preferredCurrency, setPreferredCurrency] = React.useState('EUR');

  const [currentPlanId, setCurrentPlanId] = React.useState('plus');
  const [billingInterval, setBillingInterval] = React.useState('monthly');
  const [remainingCredits, setRemainingCredits] = React.useState(4);
  const [renewalDate, setRenewalDate] = React.useState('');

  const [selectedNewPlan, setSelectedNewPlan] = React.useState('plus');

  const loadUserData = async () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem('slow_darija_user');
      let uid = 'student-demo-uuid';
      if (stored) {
        try {
          const u = JSON.parse(stored);
          uid = u.id;
          setFullName(u.full_name || 'Youssef Alami');
          setEmail(u.email || 'student@slowdarija.com');
        } catch (e) {}
      }

      const res = await fetch(apiUrl(`/api/user/profile?userId=${uid}`));
      const data = await res.json();

      if (data.user) {
        setFullName(data.user.full_name);
        setEmail(data.user.email);
        setPreferredLocale(data.user.preferred_locale || locale);
      }

      if (data.subscription) {
        setCurrentPlanId(data.subscription.plan_id || 'plus');
        setSelectedNewPlan(data.subscription.plan_id || 'plus');
        setBillingInterval(data.subscription.billing_interval || 'monthly');
        setRenewalDate(new Date(data.subscription.current_period_end).toLocaleDateString());
      }

      if (typeof data.remainingCredits === 'number') {
        setRemainingCredits(data.remainingCredits);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadUserData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const stored = localStorage.getItem('slow_darija_user');
      const uid = stored ? JSON.parse(stored).id : 'student-demo-uuid';

      const res = await fetch(apiUrl('/api/user/profile'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid,
          full_name: fullName,
          email,
          preferred_locale: preferredLocale,
          preferred_currency: preferredCurrency,
          newPlanId: selectedNewPlan !== currentPlanId ? selectedNewPlan : undefined,
          billing_interval: billingInterval,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      localStorage.setItem(
        'slow_darija_user',
        JSON.stringify({ id: uid, full_name: fullName, email, preferred_locale: preferredLocale })
      );

      setCurrentPlanId(selectedNewPlan);
      setFeedback({ type: 'success', message: 'Profile & preferences updated successfully!' });

      if (preferredLocale !== locale) {
        router.replace(pathname, { locale: preferredLocale });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error updating settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account & Preferences</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal details, language & currency preferences, theme, and subscription plan.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-destructive/10 border-destructive/30 text-destructive'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-destructive" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-8">
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border/60">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border/60">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">App Preferences</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Language
              </label>
              <select
                value={preferredLocale}
                onChange={(e) => setPreferredLocale(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {localeConfig.locales.map((loc) => (
                  <option key={loc} value={loc}>
                    {localeConfig.localeNames[loc]} ({loc.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Display Currency
              </label>
              <select
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="EUR">Euro (€ EUR)</option>
                <option value="USD">US Dollar ($ USD)</option>
                <option value="MAD">Moroccan Dirham (MAD د.م.)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Color Theme
              </label>
              <div className="flex items-center gap-2 p-1 bg-muted rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    theme === 'light' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    theme === 'dark' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  Dark
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">Subscription & Lesson Credits</h2>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{remainingCredits} lessons remaining</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase">Current Active Plan</div>
              <div className="text-xl font-bold tracking-tight capitalize mt-0.5">{currentPlanId} Plan</div>
              <div className="text-xs text-muted-foreground mt-1">
                Billed {billingInterval} • Renews on {renewalDate || 'in 30 days'}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-muted-foreground uppercase">
              Change Plan (Adjusts Monthly Lesson Credits Allowance)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'starter', name: 'Starter', price: '€19/mo', credits: '2 live 1-on-1 lessons/mo' },
                { id: 'plus', name: 'Plus (Popular)', price: '€39/mo', credits: '4 live 1-on-1 lessons/mo' },
                { id: 'premium', name: 'Premium', price: '€69/mo', credits: '8 live 1-on-1 lessons/mo' },
              ].map((p) => {
                const isSelected = selectedNewPlan === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedNewPlan(p.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-primary/10 border-primary ring-2 ring-primary/20 shadow-xs'
                        : 'bg-background border-border hover:border-primary/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{p.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="text-lg font-extrabold text-foreground mt-1">{p.price}</div>
                      <div className="text-xs text-muted-foreground">{p.credits}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={saving} className="px-8 font-semibold shadow-md cursor-pointer">
            {saving ? 'Saving Changes...' : 'Save All Preferences'}
          </Button>
        </div>
      </form>
    </div>
  );
}