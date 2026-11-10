import type { Metadata } from 'next';
import { Geist, Geist_Mono, Noto_Sans_Arabic } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: '--font-noto-arabic',
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Slow Darija',
    default: 'Slow Darija — Learn Moroccan Darija',
  },
  description: 'Learn Moroccan Darija naturally, without rushing it.',
  applicationName: 'Slow Darija',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Slow Darija',
  },
  icons: {
    icon: [
      { url: '/darija_learning/favicon.ico', sizes: 'any' },
      { url: '/darija_learning/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/darija_learning/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/darija_learning/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [
      { url: '/darija_learning/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/darija_learning/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/darija_learning/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/darija_learning/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/darija_learning/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/darija_learning/apple-touch-icon.png" />
        <link rel="manifest" href="/darija_learning/site.webmanifest" />
        <meta name="apple-mobile-web-app-title" content="Slow Darija" />
        <meta name="application-name" content="Slow Darija" />
        <meta name="msapplication-TileColor" content="#0d9488" />
        <meta name="msapplication-config" content="/darija_learning/browserconfig.xml" />
        <meta name="theme-color" content="#0d9488" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansArabic.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}