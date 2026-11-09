import { LessonCalendar } from '@/components/calendar/LessonCalendar';

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