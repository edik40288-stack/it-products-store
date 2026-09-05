import { NextRequest } from 'next/server';

/**
 * Escapes characters that have special meaning in HTML,
 * preventing injection when sending messages to Telegram with parse_mode: 'HTML'
 */
export function escapeHtml(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Strips potentially dangerous control characters, restricts maximum length,
 * and trims whitespace.
 */
export function sanitizeString(val: unknown, maxLength = 250): string {
  if (val === null || val === undefined) return '';
  let str = String(val);
  // Remove ASCII control chars except newline and tab
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return str.trim().slice(0, maxLength);
}

/**
 * Validates request Origin and Referer against allowed domains
 * to prevent Cross-Site Request Forgery (CSRF) from external origins.
 */
export function isAllowedOrigin(request: NextRequest): boolean {
  // In development, allow localhost / 127.0.0.1
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Direct server-to-server or same-origin without Origin header
  if (!origin && !referer) {
    return true;
  }

  const checkUrl = origin || referer || '';

  const allowedPatterns = [
    /^http:\/\/localhost(:\d+)?$/,
    /^http:\/\/127\.0\.0\.1(:\d+)?$/,
    /^https:\/\/.*\.vercel\.app$/,
    /^https:\/\/(www\.)?vorticore\.studio$/,
  ];

  try {
    const parsed = new URL(checkUrl);
    const hostOrigin = `${parsed.protocol}//${parsed.host}`;
    return allowedPatterns.some((pattern) => pattern.test(hostOrigin));
  } catch {
    return false;
  }
}
