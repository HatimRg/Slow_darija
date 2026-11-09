'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { LayoutDashboard, Calendar, Users, BookmarkCheck, CreditCard, ShieldCheck, Settings, LogOut, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();

  const [currentUser, setCurrentUser] = React.useState<{ id: string; email: string; role: string; full_name: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = React.useState(true);

  React.useEffect(() => {
    const stored = localStorage.getItem('slow_darija_user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setCurrentUser(u);
      } catch (e) {}
    }
    setCheckingAuth(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('slow_darija_user');
    router.push('/login');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Enforce Admin Role: If not logged in as admin, require login
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Admin Access Required</h1>
            <p className="text-sm text-muted-foreground">
              You must be signed in with an authorized Administrator account to access this portal.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/60 text-xs text-left space-y-1">
            <div className="font-semibold text-foreground">Admin Credentials:</div>
            <div>Email: <code className="font-mono text-primary">admin@slowdarija.com</code></div>
            <div>Password: <code className="font-mono text-primary">admin123</code></div>
          </div>

          <Link href="/login" className="w-full block">
            <Button size="lg" className="w-full gap-2 font-semibold shadow-md">
              <span>Sign in as Admin</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Lesson Calendar', href: '/admin/calendar', icon: Calendar },
    { label: 'Students', href: '/admin/students', icon: Users },
    { label: 'Bookings', href: '/admin/bookings', icon: BookmarkCheck },
    { label: 'Plans & Pricing', href: '/admin/plans', icon: CreditCard },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-border/80 bg-card p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <Link href="/" className="flex items-center gap-1.5 font-bold text-lg tracking-tight">
              Slow Darija<span className="w-1.5 h-1.5 rounded-full bg-primary mb-1 inline-block"></span>
            </Link>
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Admin
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === `/${locale}${item.href}` || pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-border/60 mt-6 space-y-3">
          <div className="px-2 text-xs">
            <div className="font-bold text-foreground truncate">{currentUser.full_name}</div>
            <div className="text-muted-foreground truncate">{currentUser.email}</div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive transition-colors p-2 rounded-xl hover:bg-destructive/10 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}