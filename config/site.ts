// VORTICORE — Site Configuration
// Edit this file to update static site content without touching components

export const siteConfig = {
  name: 'VORTICORE',
  tagline: 'A booster rocket for digital product teams',
  url: 'https://www.vorticore.site',
  email: 'edik40288@gmail.com',
  telegram: 'https://t.me/kraeved111',

  // Header status badge — update slots here
  slots: {
    available: 2,
    period: 'Q3',
  },

  // Office locations shown in footer & metadata
  offices: [
    { city: 'București', country: 'România', timezone: 'EET (UTC+2)' },
    { city: 'Chișinău', country: 'Moldova', timezone: 'EET (UTC+2)' },
    { city: 'Worldwide', country: 'Remote', timezone: 'Global' },
  ],

  // Hero typewriter words
  typewriterWords: ['AI Agents', 'Custom Development', 'Automation', 'Analytics'],

  // Social links
  social: {
    telegram: 'https://t.me/kraeved111',
    instagram: 'https://instagram.com/vorticore_studio',
    github: 'https://github.com/vorticore-studio',
  },

  // Supported locales
  locales: ['ro', 'ru', 'en'] as const,
  defaultLocale: 'ro' as const,
};

export type SiteLocale = (typeof siteConfig.locales)[number];
