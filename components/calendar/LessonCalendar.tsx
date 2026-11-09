'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { BookingConfirmModal, CalendarSlot } from './BookingConfirmModal';
import { ChevronLeft, ChevronRight, Video, Sparkles, Clock, User, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiUrl } from '@/lib/api';

export function LessonCalendar() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = React.useState<string>('');
  const [activeModalSlot, setActiveModalSlot] = React.useState<CalendarSlot | null>(null);
  const [remainingCredits, setRemainingCredits] = React.useState<number>(4);
  const [currentUser, setCurrentUser] = React.useState<{ id: string } | null>(null);

  const [slots, setSlots] = React.useState<CalendarSlot[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchBookingsData = async (userId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(apiUrl(`/api/bookings?userId=${userId}`));
      const data = await res.json();
      if (typeof data.remainingCredits === 'number') {
        setRemainingCredits(data.remainingCredits);
      }

      if (Array.isArray(data.slots) && data.slots.length > 0) {
        const mapped = data.slots.map((s: any) => {
          const d = new Date(s.startsAt);
          const endD = new Date(s.endsAt);
          const pad = (n: number) => String(n).padStart(2, '0');
          const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
          const startTime = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
          const endTime = `${pad(endD.getHours())}:${pad(endD.getMinutes())}`;

          return {
            id: s.id,
            dateStr,
            startTime,
            endTime,
            teacherName: s.teacherName,
            state: s.state as any,
            teamsJoinUrl: s.teamsJoinUrl,
            startsAt: s.startsAt,
          };
        });
        setSlots(mapped);
      }
    } catch (err) {
      console.error('Error fetching calendar slots:', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const stored = localStorage.getItem('slow_darija_user');
    let uid = 'student-demo-uuid';
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setCurrentUser(u);
        uid = u.id;
      } catch (e) {}
    }
    fetchBookingsData(uid);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDayIndex = new Date(year, month, 1).getDay();
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
    const userId = currentUser?.id || 'student-demo-uuid';
    const res = await fetch(apiUrl('/api/bookings'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId, userId }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Failed to book slot');
      return;
    }

    setSlots((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? {
              ...s,
              state: 'YOUR_BOOKING',
              teamsJoinUrl: data.teamsJoinUrl || 'https://teams.microsoft.com/l/meetup-join/slow-darija-demo-session',
            }
          : s
      )
    );

    if (typeof data.remainingCredits === 'number') {
      setRemainingCredits(data.remainingCredits);
    } else {
      setRemainingCredits((c) => Math.max(0, c - 1));
    }
  };

  const handleCancelBooking = async (slotId: string): Promise<{ refunded: boolean; message: string }> => {
    const userId = currentUser?.id || 'student-demo-uuid';
    const res = await fetch(apiUrl(`/api/bookings/${slotId}/cancel`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: 'student' }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to cancel');
    }

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

    if (typeof data.remainingCredits === 'number') {
      setRemainingCredits(data.remainingCredits);
    } else if (data.refunded) {
      setRemainingCredits((c) => c + 1);
    }

    return {
      refunded: Boolean(data.refunded),
      message: data.message,
    };
  };

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

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{remainingCredits} credits remaining</span>
            </div>

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

        {/* Legend */}
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

        {/* 7-Column Grid */}
        <div className="mt-4">
          <div className="grid grid-cols-7 text-center pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {Array.from({ length: startingCol }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[70px] sm:min-h-[90px] rounded-2xl bg-muted/10 opacity-30" />
            ))}

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

      {/* Selected Day Slots */}
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
                      <Button size="sm" className="w-full gap-2 bg-[#464EB8] hover:bg-[#3b429f] text-white cursor-pointer">
                        <Video className="w-4 h-4" />
                        Join Teams Call
                      </Button>
                    )}
                    {isAvail && (
                      <Button size="sm" variant="outline" className="w-full cursor-pointer">
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