'use client';

import * as React from 'react';
import { Video, ExternalLink } from 'lucide-react';
import { apiUrl } from '@/lib/api';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl('/api/admin/bookings'));
      const data = await res.json();
      if (Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lesson Bookings</h1>
        <p className="text-muted-foreground mt-1">
          Real-time and upcoming 1-on-1 Darija lesson appointments stored in MySQL.
        </p>
      </div>

      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase">
                <th className="pb-3">Student</th>
                <th className="pb-3">Teacher</th>
                <th className="pb-3">Lesson Schedule</th>
                <th className="pb-3">Teams Meeting Room</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">Loading bookings from MySQL...</td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">No bookings found in database.</td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 font-semibold">{b.student}</td>
                    <td className="py-4 text-muted-foreground">{b.teacher}</td>
                    <td className="py-4 font-medium">{b.time}</td>
                    <td className="py-4">
                      <a
                        href={b.teamsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#464EB8]/10 text-[#464EB8] dark:text-blue-400 text-xs font-semibold hover:bg-[#464EB8]/20 transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join Teams Call
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          b.status === 'Confirmed'
                            ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
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