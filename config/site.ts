// MINDCORE — Site Configuration
// Edit this file to update static site content without touching components

export const siteConfig = {
  name: 'MINDCORE',
  tagline: 'A booster rocket for digital product teams',
  email: 'newbusiness@mindcore.studio',
  telegram: 'https://t.me/mindcore_studio',

  // Header status badge — update slots here
  slots: {
    available: 2,
    period: 'Q3',
  },

  // Office locations shown in footer
  offices: [
    { city: 'New York', country: 'USA', timezone: 'UTC-5' },
    { city: 'Copenhagen', country: 'Denmark', timezone: 'UTC+2' },
    { city: 'Chisinau', country: 'Moldova', timezone: 'UTC+3' },
  ],

  // Hero typewriter words
  typewriterWords: ['AI Agents', 'Custom Development', 'Automation', 'Analytics'],

  // Social links
  social: {
    telegram: 'https://t.me/mindcore_studio',
    github: 'https://github.com/mindcore-studio',
  },

  // Supported locales
  locales: ['en', 'ru', 'ro'] as const,
  defaultLocale: 'en' as const,
};

export type SiteLocale = (typeof siteConfig.locales)[number];
