import createMiddleware from 'next-intl/middleware';
import { siteConfig } from './config/site';

export default createMiddleware({
  locales: siteConfig.locales,
  defaultLocale: siteConfig.defaultLocale,
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
