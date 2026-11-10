'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Plus, Minus, Search, Sparkles } from 'lucide-react';
import { apiUrl } from '@/lib/api';

interface Student {
  id: string;
  name: string;
  email: string;
  plan: string;
  credits: number;
  joinedDate: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl('/api/admin/students'));
      const data = await res.json();
      if (Array.isArray(data.students)) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStudents();
  }, []);

  const adjustCredits = async (studentId: string, delta: number) => {
    try {
      const res = await fetch(apiUrl('/api/admin/students'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, delta }),
      });
      const data = await res.json();
      if (data.success) {
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? { ...s, credits: data.credits } : s))
        );
      }
    } catch (err) {
      console.error('Failed to adjust credits:', err);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students & Entitlements</h1>
          <p className="text-muted-foreground mt-1">
            Manage live student subscriptions and adjust lesson credit balances in MySQL.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase">
                <th className="pb-3">Student Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Subscription</th>
                <th className="pb-3">Lesson Credits</th>
                <th className="pb-3">Joined</th>
                <th className="pb-3 text-right">Credit Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground">Loading students from MySQL database...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground">No student records found.</td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 font-semibold">{s.name}</td>
                    <td className="py-4 text-muted-foreground text-xs">{s.email}</td>
                    <td className="py-4">
                      <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                        {s.plan}
                      </span>
                    </td>
                    <td className="py-4 font-bold">
                      <span className="flex items-center gap-1.5 text-foreground">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        {s.credits} remaining
                      </span>
                    </td>
                    <td className="py-4 text-xs text-muted-foreground">{s.joinedDate}</td>
                    <td className="py-4 text-right space-x-1">
                      <button
                        onClick={() => adjustCredits(s.id, -1)}
                        className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                        title="Deduct 1 credit"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => adjustCredits(s.id, 1)}
                        className="p-1.5 rounded-lg border border-border hover:bg-muted text-primary transition-colors cursor-pointer"
                        title="Grant 1 credit"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
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