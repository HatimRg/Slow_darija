'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Trash2, Video, CheckCircle, Clock, User } from 'lucide-react';
import { apiUrl } from '@/lib/api';

interface SlotItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  teacher: string;
  capacity: number;
  teamsUrl: string;
  status: string;
}

export default function AdminCalendarPage() {
  const [slots, setSlots] = React.useState<SlotItem[]>([]);
  const [teachers, setTeachers] = React.useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [newDate, setNewDate] = React.useState('');
  const [newStart, setNewStart] = React.useState('10:00');
  const [newEnd, setNewEnd] = React.useState('11:00');
  const [selectedTeacherId, setSelectedTeacherId] = React.useState('');

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl('/api/admin/calendar'));
      const data = await res.json();
      if (Array.isArray(data.teachers) && data.teachers.length > 0) {
        setTeachers(data.teachers);
        if (!selectedTeacherId) {
          setSelectedTeacherId(data.teachers[0].id);
        }
      }

      if (Array.isArray(data.slots)) {
        const mapped: SlotItem[] = data.slots.map((s: any) => {
          const d = new Date(s.starts_at);
          const endD = new Date(s.ends_at);
          const pad = (n: number) => String(n).padStart(2, '0');
          const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
          const startTime = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
          const endTime = `${pad(endD.getHours())}:${pad(endD.getMinutes())}`;

          return {
            id: s.id,
            date,
            startTime,
            endTime,
            teacher: s.teacher_name || 'Sarah Kadiri',
            capacity: s.capacity,
            teamsUrl: s.teams_join_url,
            status: s.status,
          };
        });
        setSlots(mapped);
      }
    } catch (err) {
      console.error('Failed to load admin calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    setNewDate(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate() + 1)}`);
    fetchCalendar();
  }, []);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !selectedTeacherId) return;

    try {
      const startsAt = `${newDate} ${newStart}:00`;
      const endsAt = `${newDate} ${newEnd}:00`;

      const res = await fetch(apiUrl('/api/admin/calendar'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: selectedTeacherId,
          startsAt,
          endsAt,
          capacity: 1,
        }),
      });

      if (res.ok) {
        await fetchCalendar();
      }
    } catch (err) {
      console.error('Failed to add slot:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lesson Calendar & Availability</h1>
        <p className="text-muted-foreground mt-1">
          Open and manage live 1-on-1 Darija lesson slots in MySQL with Microsoft Teams meeting join links.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form: Add New Availability */}
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/60">
            <Plus className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight">Add Availability Slot</h2>
          </div>

          <form onSubmit={handleAddSlot} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Start Time</label>
                <input
                  type="time"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">End Time</label>
                <input
                  type="time"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Teacher</label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" className="w-full gap-2 shadow-sm cursor-pointer">
              <Plus className="w-4 h-4" />
              Publish Slot to MySQL
            </Button>
          </form>
        </div>

        {/* List of Published Slots */}
        <div className="lg:col-span-2 bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <h2 className="text-lg font-bold tracking-tight">Active Published Slots ({slots.length})</h2>
            <span className="text-xs text-muted-foreground">Synchronized with MySQL database</span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Loading lesson slots from database...
              </div>
            ) : slots.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                No active slots found. Create a slot above.
              </div>
            ) : (
              slots.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{s.date}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium">
                        {s.startTime} – {s.endTime}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          s.status === 'booked'
                            ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {s.status === 'booked' ? 'Booked' : 'Available'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3">
                      <span>Teacher: <strong>{s.teacher}</strong></span>
                      {s.teamsUrl && (
                        <a
                          href={s.teamsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 font-mono text-[11px]"
                        >
                          <Video className="w-3 h-3" />
                          Teams URL
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}