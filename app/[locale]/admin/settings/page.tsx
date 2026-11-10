'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { ShieldCheck, User, Mail, Globe, Moon, Sun, DollarSign, Database, CheckCircle2 } from 'lucide-react';
import { localeConfig, Locale } from '@/lib/config';

export default function AdminSettingsPage() {
  const locale = useLocale();
  const { theme, setTheme } = useTheme();

  const [name, setName] = React.useState('Admin Admin');
  const [email, setEmail] = React.useState('admin@slowdarija.com');
  const [preferredLocale, setPreferredLocale] = React.useState(locale);
  const [currency, setCurrency] = React.useState('EUR');
  const [saved, setSaved] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin System Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure administrative preferences, platform currency, language, and system parameters.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Admin configuration updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Admin Info */}
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border/60">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">Admin Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Admin Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Global Platform Preferences */}
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border/60">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">Platform Defaults</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="EUR">Euro (€ EUR)</option>
                <option value="USD">US Dollar ($ USD)</option>
                <option value="MAD">Moroccan Dirham (MAD د.م.)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Admin Language
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
                Admin Theme
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

        {/* Database Status Card */}
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <h3 className="font-bold">Database Engine: Self-hosted MySQL</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              Connected
            </span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Database Name: <code className="text-foreground font-mono">slow_darija</code></div>
            <div>Host: <code className="text-foreground font-mono">localhost:3306</code></div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="px-8 font-semibold shadow-md cursor-pointer">
            Save System Settings
          </Button>
        </div>
      </form>
    </div>
  );
}