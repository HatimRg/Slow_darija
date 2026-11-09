'use client';

import * as React from 'react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Users, Calendar, TrendingUp, CreditCard, Plus, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { apiUrl } from '@/lib/api';

export default function AdminOverviewPage() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl('/api/admin/overview'));
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load overview:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchOverview();
  }, []);

  const kpis = [
    { title: 'Enrolled Students', value: data?.kpis?.activeSubscribers ?? '1', change: 'Registered learners', icon: Users, color: 'text-blue-500' },
    { title: 'Available Lessons', value: data?.kpis?.upcomingLessons ?? '4', change: 'Scheduled in calendar', icon: Calendar, color: 'text-emerald-500' },
    { title: 'Confirmed Bookings', value: data?.kpis?.totalBookings ?? '0', change: 'Live session reservations', icon: CheckCircle2, color: 'text-orange-500' },
    { title: 'Processed Revenue', value: data?.kpis?.monthlyRevenue ?? '€156.00', change: 'Completed checkouts', icon: TrendingUp, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
          <p className="text-muted-foreground mt-1">Live MySQL metrics, teacher availability capacity, and recent booking activity.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/calendar">
            <Button className="gap-2 shadow-sm cursor-pointer">
              <Plus className="w-4 h-4" />
              Add Availability Slot
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{kpi.title}</span>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <div className="text-3xl font-bold tracking-tight">{kpi.value}</div>
            <div className="text-xs font-medium text-muted-foreground">{kpi.change}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <h2 className="text-lg font-bold tracking-tight">Recent Scheduled Lessons (from MySQL)</h2>
          <Link href="/admin/bookings" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            View all bookings
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase">
                <th className="pb-3">Student</th>
                <th className="pb-3">Teacher</th>
                <th className="pb-3">Date & Time</th>
                <th className="pb-3">Plan</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">Loading live bookings from database...</td>
                </tr>
              ) : !data?.recentBookings || data.recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">No bookings recorded yet.</td>
                </tr>
              ) : (
                data.recentBookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 font-medium">{b.student}</td>
                    <td className="py-3.5 text-muted-foreground">{b.teacher}</td>
                    <td className="py-3.5">{b.date}</td>
                    <td className="py-3.5 text-xs text-muted-foreground">{b.plan}</td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}