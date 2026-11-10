import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { CheckCircle2, Calendar, ArrowRight } from 'lucide-react';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ plan_id?: string; interval?: string }>;
}) {
  const { plan_id = 'plus', interval = 'monthly' } = await searchParams;

  return (
    <>
      <Header />
      <main className="min-h-[80vh] flex items-center justify-center py-20 px-4">
        <div className="max-w-lg w-full bg-card border border-border/80 rounded-3xl p-8 sm:p-10 text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary mb-3 inline-block">
            Subscription Activated
          </span>

          <h1 className="text-3xl font-bold tracking-tight mb-3">Welcome to Slow Darija!</h1>
          <p className="text-muted-foreground mb-8">
            Your <span className="font-semibold text-foreground capitalize">{plan_id}</span> ({interval}) plan is now active. Your monthly lesson credits have been added to your account.
          </p>

          <div className="space-y-3">
            <Link href="/dashboard" className="w-full inline-block">
              <Button size="lg" className="w-full gap-2 text-base">
                <Calendar className="w-5 h-5" />
                Go to Lesson Calendar
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/" className="w-full inline-block">
              <Button variant="ghost" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
