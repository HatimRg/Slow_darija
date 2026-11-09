'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PLANS } from '@/lib/payments/types';
import { Sparkles, Check } from 'lucide-react';

export default function AdminPlansPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription Plans & Entitlements</h1>
        <p className="text-muted-foreground mt-1">
          Review pricing rules and monthly lesson credits configuration for all active tiers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.values(PLANS).map((plan) => (
          <div key={plan.id} className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold tracking-tight">{plan.name}</h3>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {plan.creditsPerMonth} Lessons/mo
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold">€{plan.monthlyPrice}</span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Annual rate: €{plan.annualMonthlyPrice.toFixed(2)}/mo (10% savings)
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/60">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Entitlements</span>
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full">
              Edit Plan Rules
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}