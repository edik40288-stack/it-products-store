// MINDCORE — Site Configuration
// Edit this file to update static site content without touching components

export const siteConfig = {
  name: 'MINDCORE',
  tagline: 'A booster rocket for digital product teams',
  email: 'edik40288@gmail.com',
  telegram: 'https://t.me/kraeved111',

  // Header status badge — update slots here
  slots: {
    available: 2,
    period: 'Q3',
  },

  // Office locations shown in footer
  offices: [
    { city: 'Worldwide', country: 'Remote', timezone: 'Global' },
  ],

  // Hero typewriter words
  typewriterWords: ['AI Agents', 'Custom Development', 'Automation', 'Analytics'],

  // Social links
  social: {
    telegram: 'https://t.me/kraeved111',
    github: 'https://github.com/mindcore-studio',
  },

  // Supported locales
  locales: ['en', 'ru', 'ro'] as const,
  defaultLocale: 'en' as const,
};

export type SiteLocale = (typeof siteConfig.locales)[number];
