import { NextRequest, NextResponse } from 'next/server';

const BUILTIN_TG_TOKEN = Buffer.from('ODg1Mjg3OTc4OTpBQUdFVEptYUxMc1ZseXhJMGRlSVc0Y29mWXd3LUR0ZW5zaw==', 'base64').toString('utf-8');

function isDummyPhone(digitsOnly: string): boolean {
  if (digitsOnly.length < 9 || digitsOnly.length > 15) return true;
  if (/^(\d)\1+$/.test(digitsOnly)) return true;
  if (digitsOnly.includes('12345678') || digitsOnly.includes('98765432') || digitsOnly.includes('01234567')) return true;
  return false;
}

function isDummyUsername(username: string): boolean {
  const clean = username.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean.length < 5) return true;
  if (/^([a-z0-9])\1+$/.test(clean)) return true;
  const commonDummies = ['asdfg', 'asdfgh', 'qwerty', 'qwertyuiop', '12345', '123456', 'telegram', 'username'];
  if (commonDummies.includes(clean)) return true;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const { messenger, contact, name, locale } = await request.json();
    const isRo = locale === 'ro';
    const isRu = locale === 'ru';

    if (name !== undefined) {
      const trimmedName = String(name || '').trim();
      const hasLetters = /[a-zA-Zа-яА-ЯёЁăîâșțĂÎÂȘȚ]/.test(trimmedName);
      if (trimmedName.length < 2 || !hasLetters) {
        return NextResponse.json({
          valid: false,
          error: isRu 
            ? 'Пожалуйста, укажите имя (минимум 2 буквы)'
            : isRo
            ? 'Vă rugăm să indicați numele (minim 2 litere)'
            : 'Please enter your name (at least 2 letters)'
        });
      }
    }

    const rawContact = String(contact || '').trim();
    if (!rawContact) {
      return NextResponse.json({
        valid: false,
        error: isRu 
          ? 'Пожалуйста, укажите контакт для связи'
          : isRo
          ? 'Vă rugăm să indicați un contact pentru legătură'
          : 'Please provide a valid contact handle or phone number'
      });
    }

    if (messenger === 'wa' || messenger === 'viber' || messenger === 'WhatsApp' || messenger === 'Viber') {
      const mName = messenger === 'viber' || messenger === 'Viber' ? 'Viber' : 'WhatsApp';
      if (/[a-zA-Zа-яА-ЯёЁ@]/.test(rawContact)) {
        return NextResponse.json({
          valid: false,
          error: isRu
            ? `Для ${mName} укажите действующий номер телефона с кодом страны (например, +7... или +373...)`
            : isRo
            ? `Pentru ${mName} introduceți un număr valid cu prefix internațional (ex: +40... sau +373...)`
            : `For ${mName}, please provide a valid phone number with country code (e.g. +1... or +44...)`
        });
      }

      const digitsOnly = rawContact.replace(/\D/g, '');
      if (digitsOnly.length < 9 || digitsOnly.length > 15) {
        return NextResponse.json({
          valid: false,
          error: isRu
            ? 'Номер телефона должен содержать от 9 до 15 цифр с кодом страны'
            : isRo
            ? 'Numărul de telefon trebuie să conțină între 9 și 15 cifre cu prefix'
            : 'Phone number must be 9 to 15 digits with country code'
        });
      }

      if (isDummyPhone(digitsOnly)) {
        return NextResponse.json({
          valid: false,
          error: isRu
            ? 'Похоже на тестовый или несуществующий номер. Укажите реальный номер телефона.'
            : isRo
            ? 'Numărul pare a fi de test sau inexistent. Indicați un număr real.'
            : 'This appears to be a test or invalid phone number. Please provide a real number.'
        });
      }

      return NextResponse.json({ valid: true });
    }

    let tgInput = rawContact.replace(/^https?:\/\/t\.me\//i, '').replace(/^t\.me\//i, '').trim();
    const digitsOnly = tgInput.replace(/\D/g, '');
    const isPhone = (tgInput.startsWith('+') || /^\d+$/.test(tgInput.replace(/[\s\-\(\)]/g, ''))) && digitsOnly.length >= 9;

    if (isPhone) {
      if (digitsOnly.length < 9 || digitsOnly.length > 15 || isDummyPhone(digitsOnly)) {
        return NextResponse.json({
          valid: false,
          error: isRu
            ? 'Укажите реальный номер телефона с кодом страны или @username в Telegram'
            : isRo
            ? 'Introduceți un număr real de telefon cu prefix sau un @username în Telegram'
            : 'Please enter a real phone number with country code or a Telegram @username'
        });
      }
      return NextResponse.json({ valid: true });
    }

    const cleanUsername = tgInput.replace(/^@/, '').trim();

    if (!/^[a-zA-Z0-9_]{5,32}$/.test(cleanUsername)) {
      return NextResponse.json({
        valid: false,
        error: isRu
          ? 'Юзернейм в Telegram должен содержать от 5 до 32 символов (только латиница, цифры и _)'
          : isRo
          ? 'Numele de utilizator Telegram trebuie să conțină între 5 și 32 de caractere (doar litere latine, cifre și _)'
          : 'Telegram username must be between 5 and 32 characters (letters, numbers and _ only)'
      });
    }

    if (isDummyUsername(cleanUsername)) {
      return NextResponse.json({
        valid: false,
        error: isRu
          ? 'Укажите реальный аккаунт в Telegram, иначе инженер не сможет связаться с вами'
          : isRo
          ? 'Indicați un cont real de Telegram, altfel inginerul nu vă va putea contacta'
          : 'Please enter a real Telegram username so our engineer can contact you'
      });
    }

    // Real Telegram Existence Verification via t.me public resolver
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`https://t.me/${cleanUsername}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const html = await res.text();
        const hasPageTitle = html.includes('tgme_page_title');
        const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)">/);
        const ogTitle = ogTitleMatch ? ogTitleMatch[1] : '';
        const isNotFound = ogTitle.startsWith(`Telegram: Contact @${cleanUsername}`) || !hasPageTitle;

        if (isNotFound) {
          return NextResponse.json({
            valid: false,
            error: isRu
              ? `Такого аккаунта (@${cleanUsername}) в Telegram не существует. Проверьте правильность или укажите номер телефона.`
              : isRo
              ? `Contul (@${cleanUsername}) nu există în Telegram. Verificați corectitudinea sau introduceți un număr de telefon.`
              : `Telegram username (@${cleanUsername}) was not found. Please check spelling or provide your phone number.`
          });
        }
      }
    } catch (err) {
      console.warn('Telegram live lookup timeout or error, bypassing live check:', err);
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Contact validation error:', error);
    return NextResponse.json({ valid: true });
  }
}
