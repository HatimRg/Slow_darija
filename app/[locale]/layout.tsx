import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { isRtl } from '@/lib/config';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const direction = isRtl(locale as any) ? 'rtl' : 'ltr';

  return (
    <NextIntlClientProvider messages={messages}>
      <div dir={direction} className="min-h-screen w-full flex flex-col">
        {children}
      </div>
    </NextIntlClientProvider>
  );
}