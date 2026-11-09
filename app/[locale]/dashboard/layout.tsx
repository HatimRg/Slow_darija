import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}