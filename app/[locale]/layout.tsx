import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { siteConfig } from '@/config/site';
import SmoothScroll from '@/components/SmoothScroll/SmoothScroll';
import { AppStateProvider } from '@/context/AppStateContext';
import { WebGLProvider } from '@/context/WebGLContext';
import WebGLDistortionCanvas from '@/components/WebGLGrid/WebGLDistortionCanvas';
import '@/app/globals.css';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: {
      default: `${siteConfig.name} — AI Development Studio`,
      template: `%s | ${siteConfig.name}`,
    },
    description: `${siteConfig.tagline}. We build AI agents, custom software, automation systems, and premium digital products. Based in ${siteConfig.offices.map(o => o.city).join(', ')}.`,
    keywords: ['AI development', 'chatbots', 'automation', 'LLM integration', 'web development', 'MINDCORE'],
    openGraph: {
      type: 'website',
      locale: locale === 'ru' ? 'ru_RU' : locale === 'ro' ? 'ro_RO' : 'en_US',
      siteName: siteConfig.name,
      title: `${siteConfig.name} — AI Development Studio`,
      description: siteConfig.tagline,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${siteConfig.name} — AI Development Studio`,
      description: siteConfig.tagline,
    },
    robots: { index: true, follow: true },
  };
}

export function generateStaticParams() {
  return siteConfig.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!siteConfig.locales.includes(locale as (typeof siteConfig.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AppStateProvider>
            <WebGLProvider>
              <WebGLDistortionCanvas />
              <SmoothScroll>
                {children}
              </SmoothScroll>
            </WebGLProvider>
          </AppStateProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
