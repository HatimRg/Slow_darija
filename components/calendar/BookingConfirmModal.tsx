'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Video, Calendar, Clock, User, CheckCircle, AlertCircle, X, ExternalLink, ShieldAlert } from 'lucide-react';

export interface CalendarSlot {
  id: string;
  dateStr: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  teacherName: string;
  state: 'AVAILABLE' | 'SELECTED' | 'YOUR_BOOKING' | 'FULLY_BOOKED' | 'UNAVAILABLE' | 'PAST';
  teamsJoinUrl?: string;
  startsAt?: string;
}

interface BookingConfirmModalProps {
  slot: CalendarSlot | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (slotId: string) => Promise<void>;
  onCancelBooking: (slotId: string) => Promise<{ refunded: boolean; message: string }>;
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
  const [cancelFeedback, setCancelFeedback] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setCancelFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen || !slot) return null;

  const isYourBooking = slot.state === 'YOUR_BOOKING';

  // Check 72h rule for display
  const hoursUntilLesson = slot.startsAt
    ? (new Date(slot.startsAt).getTime() - Date.now()) / (1000 * 60 * 60)
    : 999;
  const isEligibleForRefund = hoursUntilLesson >= 72;

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
      const res = await onCancelBooking(slot.id);
      setCancelFeedback(res.message);
      setTimeout(() => {
        onClose();
      }, 2200);
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

        {cancelFeedback && (
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 shrink-0 text-blue-600" />
            <span>{cancelFeedback}</span>
          </div>
        )}

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
                  <Button size="lg" className="w-full gap-2 text-base bg-[#464EB8] hover:bg-[#3b429f] text-white shadow-md cursor-pointer">
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

              {/* 72h cancellation notice */}
              <div className="p-3 rounded-xl bg-muted/50 border border-border/60 text-[11px] text-muted-foreground flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>72h Cancellation Policy:</strong> Full 1-credit refund applies if canceled at least 72 hours before start. (Admins/teachers can refund 100% anytime).
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="w-full text-destructive hover:bg-destructive/10 border-destructive/20 cursor-pointer"
              >
                {isSubmitting
                  ? 'Processing...'
                  : isEligibleForRefund
                  ? 'Cancel Lesson (Full 1-Credit Refund)'
                  : 'Cancel Lesson (Late Notice - No Refund)'}
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
                {isSubmitting ? 'Confirming...' : remainingCredits <= 0 ? 'No Credits Remaining' : 'Confirm Booking'}
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