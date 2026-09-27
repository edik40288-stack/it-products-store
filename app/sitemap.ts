import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;
  const currentDate = new Date();

  return [
    {
      url: `${baseUrl}/ro`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: {
          ro: `${baseUrl}/ro`,
          ru: `${baseUrl}/ru`,
          en: `${baseUrl}/en`,
        },
      },
    },
    {
      url: `${baseUrl}/ru`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: {
        languages: {
          ro: `${baseUrl}/ro`,
          ru: `${baseUrl}/ru`,
          en: `${baseUrl}/en`,
        },
      },
    },
    {
      url: `${baseUrl}/en`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
      alternates: {
        languages: {
          ro: `${baseUrl}/ro`,
          ru: `${baseUrl}/ru`,
          en: `${baseUrl}/en`,
        },
      },
    },
  ];
}
