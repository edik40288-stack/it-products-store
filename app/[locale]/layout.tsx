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

  const metaByLocale: Record<string, { title: string; description: string; keywords: string[] }> = {
    ro: {
      title: 'VORTICORE — Dezvoltare Web, Agenți AI & Automatizări | România & Moldova',
      description: 'Studio digital de elită în România (București, Cluj) și Moldova (Chișinău). Creăm site-uri web de înaltă conversie, agenți AI 24/7, sisteme CRM și automatizări n8n.',
      keywords: [
        'creare site bucuresti',
        'creare site chisinau',
        'dezvoltare web romania',
        'agenti ai moldova',
        'agenti ai romania',
        'automatizare procese n8n',
        'integrare crm',
        'chatboti inteligenti',
        'software personalizat',
        'vorticore studio',
        'agentie web bucuresti',
        'agentie web chisinau',
      ],
    },
    ru: {
      title: 'VORTICORE — Веб-разработка, AI-агенты и автоматизация | Молдова и Румыния',
      description: 'Студия цифровой разработки для бизнеса в Кишиневе, Молдове и Румынии. Создание сайтов под ключ, умные AI-ассистенты 24/7, внедрение CRM и сквозная автоматизация процессов.',
      keywords: [
        'создание сайтов кишинев',
        'разработка сайтов молдова',
        'веб студия румыния',
        'ии агенты для бизнеса',
        'автоматизация процессов n8n',
        'внедрение crm',
        'разработка чат ботов',
        'vorticore studio',
        'веб разработка бухарест',
      ],
    },
    en: {
      title: 'VORTICORE — AI Agents, Custom Web Development & Business Automation',
      description: 'High-velocity digital engineering studio. We build production-ready AI agents, custom web platforms, n8n automations, and CRM integrations for businesses in Europe and worldwide.',
      keywords: [
        'ai agents development',
        'custom web development',
        'business process automation',
        'n8n integration',
        'enterprise crm',
        'ai studio europe',
        'web development romania',
        'web development moldova',
        'vorticore',
      ],
    },
  };

  const current = metaByLocale[locale] || metaByLocale.ro;

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: current.title,
      template: `%s | ${siteConfig.name}`,
    },
    description: current.description,
    keywords: current.keywords,
    alternates: {
      canonical: `${siteConfig.url}/${locale}`,
      languages: {
        ro: `${siteConfig.url}/ro`,
        ru: `${siteConfig.url}/ru`,
        en: `${siteConfig.url}/en`,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'ru' ? 'ru_RU' : locale === 'ro' ? 'ro_RO' : 'en_US',
      siteName: siteConfig.name,
      title: current.title,
      description: current.description,
      url: `${siteConfig.url}/${locale}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: current.title,
      description: current.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteConfig.url}/#organization`,
        name: 'Vorticore Studio',
        alternateName: ['Vorticore', 'Vorticore AI Studio', 'Vorticore Digital Production'],
        url: siteConfig.url,
        logo: `${siteConfig.url}/favicon.ico`,
        sameAs: [
          'https://instagram.com/vorticore_studio',
          'https://t.me/kraeved111',
          'https://github.com/vorticore-studio',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          email: siteConfig.email,
          contactType: 'customer support & sales',
          availableLanguage: ['Romanian', 'Russian', 'English'],
        },
      },
      {
        '@type': 'ProfessionalService',
        '@id': `${siteConfig.url}/#service`,
        name: 'Vorticore AI & Web Development Studio',
        url: siteConfig.url,
        parentOrganization: {
          '@id': `${siteConfig.url}/#organization`,
        },
        image: `${siteConfig.url}/favicon.ico`,
        description:
          locale === 'ro'
            ? 'Studio de producție digitală și inteligență artificială: dezvoltare site-uri și aplicații web, agenți AI 24/7, sisteme CRM și automatizări de business în România și Republica Moldova.'
            : locale === 'ru'
            ? 'Студия цифровой разработки и ИИ: создание сайтов, веб-приложений, умных AI-агентов 24/7, CRM-систем и автоматизации бизнес-процессов в Молдове и Румынии.'
            : 'High-velocity digital engineering studio: custom web platforms, autonomous AI sales agents, CRM systems, and business process automation.',
        priceRange: '€€',
        address: [
          {
            '@type': 'PostalAddress',
            addressLocality: 'București',
            addressCountry: 'RO',
          },
          {
            '@type': 'PostalAddress',
            addressLocality: 'Chișinău',
            addressCountry: 'MD',
          },
        ],
        areaServed: [
          { '@type': 'Country', name: 'Romania' },
          { '@type': 'Country', name: 'Moldova' },
          { '@type': 'City', name: 'București' },
          { '@type': 'City', name: 'Cluj-Napoca' },
          { '@type': 'City', name: 'Timișoara' },
          { '@type': 'City', name: 'Iași' },
          { '@type': 'City', name: 'Chișinău' },
          { '@type': 'AdministrativeArea', name: 'European Union' },
        ],
        knowsAbout: [
          'Creare site web',
          'Dezvoltare aplicatii web',
          'Agenti AI pentru vanzari',
          'Chatboti inteligenti LLM',
          'Automatizare procese n8n si Make',
          'Implementare CRM si ERP',
          'Redesign si optimizare conversii',
          'Audit securitate web',
        ],
      },
    ],
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
