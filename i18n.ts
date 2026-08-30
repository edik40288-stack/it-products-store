import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['en', 'ru', 'ro'] as const;

export default getRequestConfig(async (params: any) => {
  // Support both older and newer next-intl versions
  let locale = params.locale;
  if (!locale && params.requestLocale) {
    locale = await params.requestLocale;
  }

  if (!locales.includes(locale as typeof locales[number])) {
    console.error('[i18n.ts] Invalid locale or not found:', locale, params);
    notFound();
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
