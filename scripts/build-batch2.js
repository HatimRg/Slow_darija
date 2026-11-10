const fs = require('fs');
const path = require('path');

function save(relPath, content) {
  const fullPath = path.join(__dirname, '..', relPath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content.trim(), 'utf8');
  console.log('Saved:', relPath);
}

// 1. components/calendar/BookingConfirmModal.tsx
save('components/calendar/BookingConfirmModal.tsx', `'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Video, Calendar, Clock, User, CheckCircle, AlertCircle, X, ExternalLink } from 'lucide-react';

export interface CalendarSlot {
  id: string;
  dateStr: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  teacherName: string;
  state: 'AVAILABLE' | 'SELECTED' | 'YOUR_BOOKING' | 'FULLY_BOOKED' | 'UNAVAILABLE' | 'PAST';
  teamsJoinUrl?: string;
}

interface BookingConfirmModalProps {
  slot: CalendarSlot | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (slotId: string) => Promise<void>;
  onCancelBooking: (slotId: string) => Promise<void>;
  remainingCredits: number;
}

export function BookingConfirmModal({
  slot,
  isOpen,
  onClose,
  onConfirmBooking,
  onCancelBooking,
  remainingCredits,
}: BookingConfirmModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen || !slot) return null;

  const isYourBooking = slot.state === 'YOUR_BOOKING';

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await onConfirmBooking(slot.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsSubmitting(true);
      await onCancelBooking(slot.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isYourBooking ? (
          <>
            {/* Confirmed Lesson Details */}
            <div className="space-y-2 text-center">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 inline-block">
                Your Confirmed Lesson
              </span>
              <h2 className="text-2xl font-bold tracking-tight">1-on-1 Darija Session</h2>
            </div>

            <div className="bg-muted/40 rounded-2xl p-4 space-y-3 text-sm">
              <div className="flex items-center gap-3 text-foreground font-medium">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <span>{slot.dateStr}</span>
              </div>
              <div className="flex items-center gap-3 text-foreground font-medium">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span>{slot.startTime} – {slot.endTime} (60 min)</span>
              </div>
              <div className="flex items-center gap-3 text-foreground font-medium">
                <User className="w-4 h-4 text-primary shrink-0" />
                <span>Teacher: {slot.teacherName}</span>
              </div>
            </div>

            {/* Microsoft Teams Join URL */}
            <div className="space-y-3">
              {slot.teamsJoinUrl ? (
                <a
                  href={slot.teamsJoinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block"
                >
                  <Button size="lg" className="w-full gap-2 text-base bg-[#464EB8] hover:bg-[#3b429f] text-white shadow-md">
                    <Video className="w-5 h-5" />
                    Join Microsoft Teams Lesson
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              ) : (
                <div className="p-3 rounded-xl bg-muted/60 text-xs text-center text-muted-foreground">
                  Teams meeting room will open 15 minutes before the lesson starts.
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="w-full text-destructive hover:bg-destructive/10 border-destructive/20 cursor-pointer"
              >
                {isSubmitting ? 'Canceling...' : 'Cancel Lesson (Refund 1 Credit)'}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* New Booking Confirmation */}
            <div className="space-y-2 text-center">
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary inline-block">
                Book Lesson
              </span>
              <h2 className="text-2xl font-bold tracking-tight">Confirm your lesson</h2>
              <p className="text-xs text-muted-foreground">
                Live 1-on-1 spoken Darija immersion with native speaker
              </p>
            </div>

            <div className="bg-muted/40 rounded-2xl p-4 space-y-3 text-sm">
              <div className="flex items-center gap-3 text-foreground font-medium">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <span>{slot.dateStr}</span>
              </div>
              <div className="flex items-center gap-3 text-foreground font-medium">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span>{slot.startTime} – {slot.endTime} (60 min)</span>
              </div>
              <div className="flex items-center gap-3 text-foreground font-medium">
                <User className="w-4 h-4 text-primary shrink-0" />
                <span>Teacher: {slot.teacherName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200/50 dark:border-orange-900/30 text-xs text-orange-800 dark:text-orange-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-orange-600" />
              <span>
                <strong>1 lesson credit</strong> will be used. You have {remainingCredits} credits remaining this month.
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                size="lg"
                onClick={handleConfirm}
                disabled={isSubmitting || remainingCredits <= 0}
                className="w-full text-base font-semibold shadow-md cursor-pointer"
              >
                {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="w-full cursor-pointer">
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
`);

// 2. components/calendar/LessonCalendar.tsx
save('components/calendar/LessonCalendar.tsx', `'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { BookingConfirmModal, CalendarSlot } from './BookingConfirmModal';
import { ChevronLeft, ChevronRight, Video, Sparkles, Clock, User, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LessonCalendar() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = React.useState<string>('');
  const [activeModalSlot, setActiveModalSlot] = React.useState<CalendarSlot | null>(null);
  const [remainingCredits, setRemainingCredits] = React.useState<number>(4);

  // Dynamic sample slots for the current month
  const [slots, setSlots] = React.useState<CalendarSlot[]>(() => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const pad = (n: number) => String(n).padStart(2, '0');

    const result: CalendarSlot[] = [];
    // Generate dates with diverse states
    for (let day = 1; day <= 28; day += 2) {
      const dStr = `${year}-${pad(month + 1)}-${pad(day)}`;
      
      if (day === 5) {
        result.push({
          id: \`slot_\${day}_1\`,
          dateStr: dStr,
          startTime: '10:00',
          endTime: '11:00',
          teacherName: 'Sarah K.',
          state: 'YOUR_BOOKING',
          teamsJoinUrl: 'https://teams.microsoft.com/l/meetup-join/slow-darija-demo-room-1',
        });
      } else if (day % 4 === 0) {
        result.push({
          id: \`slot_\${day}_1\`,
          dateStr: dStr,
          startTime: '14:00',
          endTime: '15:00',
          teacherName: 'Karim B.',
          state: 'FULLY_BOOKED',
        });
      } else {
        result.push(
          {
            id: \`slot_\${day}_1\`,
            dateStr: dStr,
            startTime: '10:00',
            endTime: '11:00',
            teacherName: 'Sarah K.',
            state: 'AVAILABLE',
          },
          {
            id: \`slot_\${day}_2\`,
            dateStr: dStr,
            startTime: '16:30',
            endTime: '17:30',
            teacherName: 'Amina M.',
            state: 'AVAILABLE',
          }
        );
      }
    }
    return result;
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Get calendar matrix
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  // Convert to Mon=0 ... Sun=6
  const startingCol = (firstDayIndex + 6) % 7;
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDateStr('');
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDateStr('');
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    const pad = (n: number) => String(n).padStart(2, '0');
    setSelectedDateStr(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`);
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDateStr(dateStr);
  };

  const handleConfirmBooking = async (slotId: string) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? {
              ...s,
              state: 'YOUR_BOOKING',
              teamsJoinUrl: 'https://teams.microsoft.com/l/meetup-join/slow-darija-demo-session',
            }
          : s
      )
    );
    setRemainingCredits((c) => Math.max(0, c - 1));
  };

  const handleCancelBooking = async (slotId: string) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? {
              ...s,
              state: 'AVAILABLE',
              teamsJoinUrl: undefined,
            }
          : s
      )
    );
    setRemainingCredits((c) => c + 1);
  };

  // Filter slots for selected date
  const selectedSlots = selectedDateStr ? slots.filter((s) => s.dateStr === selectedDateStr) : [];

  return (
    <div className="space-y-8">
      {/* Calendar Card Header & Navigation */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
          <div>
            <span className="text-xs font-semibold tracking-wider text-primary uppercase">
              Live Lesson Scheduling
            </span>
            <h2 className="text-2xl font-bold tracking-tight mt-0.5">{monthName}</h2>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday} className="text-xs font-medium cursor-pointer">
              Today
            </Button>
            <div className="flex items-center border border-border rounded-xl bg-background overflow-hidden">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="h-4 w-[1px] bg-border" />
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Unmistakable Legend */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500"></span>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 border border-blue-500"></span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">Your booking</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-500"></span>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-muted border border-border"></span>
            <span>Fully booked / Past</span>
          </div>
        </div>

        {/* 7-Column Grid Desktop / Responsive Deck */}
        <div className="mt-4">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 text-center pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Empty padding days */}
            {Array.from({ length: startingCol }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[70px] sm:min-h-[90px] rounded-2xl bg-muted/10 opacity-30" />
            ))}

            {/* Month Days */}
            {Array.from({ length: totalDaysInMonth }).map((_, i) => {
              const day = i + 1;
              const pad = (n: number) => String(n).padStart(2, '0');
              const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
              const daySlots = slots.filter((s) => s.dateStr === dateStr);
              const hasYourBooking = daySlots.some((s) => s.state === 'YOUR_BOOKING');
              const hasAvailable = daySlots.some((s) => s.state === 'AVAILABLE');
              const hasFull = daySlots.some((s) => s.state === 'FULLY_BOOKED');
              const isSelected = selectedDateStr === dateStr;

              return (
                <div
                  key={dateStr}
                  onClick={() => handleDayClick(dateStr)}
                  className={cn(
                    'min-h-[70px] sm:min-h-[95px] p-2 rounded-2xl border transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden',
                    hasYourBooking
                      ? 'bg-blue-500/10 border-blue-500/80 shadow-xs'
                      : isSelected
                      ? 'bg-primary/10 border-primary ring-2 ring-primary/20 shadow-sm'
                      : hasAvailable
                      ? 'bg-card border-emerald-500/40 hover:border-emerald-500 hover:shadow-sm'
                      : 'bg-muted/30 border-transparent text-muted-foreground opacity-60 hover:opacity-90'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'text-xs sm:text-sm font-semibold rounded-full w-6 h-6 flex items-center justify-center',
                        isSelected ? 'bg-primary text-primary-foreground' : hasYourBooking ? 'bg-blue-600 text-white' : ''
                      )}
                    >
                      {day}
                    </span>
                    {hasYourBooking && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    )}
                  </div>

                  {/* Slot state badge inside cell */}
                  <div className="space-y-1 mt-1">
                    {hasYourBooking ? (
                      <div className="px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold truncate flex items-center gap-1">
                        <Video className="w-2.5 h-2.5" />
                        <span>Booked</span>
                      </div>
                    ) : hasAvailable ? (
                      <div className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold truncate">
                        {daySlots.filter((s) => s.state === 'AVAILABLE').length} open
                      </div>
                    ) : hasFull ? (
                      <div className="px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] truncate">
                        Full
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Slots View */}
      {selectedDateStr && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/60">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Available Times
              </span>
              <h3 className="text-xl font-bold tracking-tight">{selectedDateStr}</h3>
            </div>
            <span className="text-xs text-muted-foreground">
              Select an available time slot to confirm your booking.
            </span>
          </div>

          {selectedSlots.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
              <Info className="w-6 h-6 text-muted-foreground/60" />
              <span>No lessons scheduled on this date. Please choose another highlighted day.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {selectedSlots.map((slot) => {
                const isBooked = slot.state === 'YOUR_BOOKING';
                const isAvail = slot.state === 'AVAILABLE';

                return (
                  <div
                    key={slot.id}
                    onClick={() => (isAvail || isBooked) && setActiveModalSlot(slot)}
                    className={cn(
                      'p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-4',
                      isBooked
                        ? 'bg-blue-500/10 border-blue-500 shadow-xs cursor-pointer hover:bg-blue-500/15'
                        : isAvail
                        ? 'bg-card border-border hover:border-primary hover:shadow-md cursor-pointer hover:-translate-y-0.5'
                        : 'bg-muted/40 border-transparent opacity-60 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-base font-bold tracking-tight">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>{slot.startTime} – {slot.endTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <User className="w-3.5 h-3.5" />
                          <span>Teacher: {slot.teacherName}</span>
                        </div>
                      </div>

                      {isBooked ? (
                        <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Booked
                        </span>
                      ) : isAvail ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                          Available
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                          Full
                        </span>
                      )}
                    </div>

                    {isBooked && slot.teamsJoinUrl && (
                      <Button size="sm" className="w-full gap-2 bg-[#464EB8] hover:bg-[#3b429f] text-white">
                        <Video className="w-4 h-4" />
                        Join Teams Call
                      </Button>
                    )}
                    {isAvail && (
                      <Button size="sm" variant="outline" className="w-full">
                        Select & Confirm
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Confirmation & Details Modal */}
      <BookingConfirmModal
        slot={activeModalSlot}
        isOpen={Boolean(activeModalSlot)}
        onClose={() => setActiveModalSlot(null)}
        onConfirmBooking={handleConfirmBooking}
        onCancelBooking={handleCancelBooking}
        remainingCredits={remainingCredits}
      />
    </div>
  );
}
`);

// 3. app/[locale]/dashboard/layout.tsx
save('app/[locale]/dashboard/layout.tsx', `import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
`);

// 4. app/[locale]/dashboard/page.tsx
save('app/[locale]/dashboard/page.tsx', `import { LessonCalendar } from '@/components/calendar/LessonCalendar';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Book Your Lesson</h1>
          <p className="text-muted-foreground mt-1">
            Choose a date and time that fits your schedule for your 1-on-1 Darija session.
          </p>
        </div>
      </div>
      <LessonCalendar />
    </div>
  );
}
`);

// 5. app/api/bookings/route.ts
save('app/api/bookings/route.ts', `import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    remainingCredits: 4,
    bookings: [],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slotId } = body;

    if (!slotId) {
      return NextResponse.json({ error: 'Slot ID is required' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      bookingId: \`book_\${Date.now()}\`,
      slotId,
      teamsJoinUrl: 'https://teams.microsoft.com/l/meetup-join/slow-darija-demo-session',
      status: 'confirmed',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`);
