export const siteConfig = {
  name: 'Slow Darija',
  description: 'Learn Moroccan Darija naturally, without rushing it.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ogImage: '/og.png',
  links: {
    twitter: '',
    github: '',
  },
} as const;

export const localeConfig = {
  locales: ['en', 'fr', 'ar', 'de', 'tr'] as const,
  defaultLocale: 'en' as const,
  rtlLocales: ['ar'] as const,
  localeNames: {
    en: 'English',
    fr: 'Français',
    ar: 'العربية',
    de: 'Deutsch',
    tr: 'Türkçe',
  } as const,
} as const;

export type Locale = (typeof localeConfig.locales)[number];

export function isRtl(locale: string): boolean {
  return (localeConfig.rtlLocales as readonly string[]).includes(locale);
}
