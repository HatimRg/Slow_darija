import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function CheckoutCancelPage() {
  return (
    <>
      <Header />
      <main className="min-h-[80vh] flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-2">Checkout Canceled</h1>
          <p className="text-muted-foreground mb-6">
            No charges were made. You can choose a plan whenever you're ready.
          </p>

          <Link href="/pricing">
            <Button className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              Return to Pricing
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
