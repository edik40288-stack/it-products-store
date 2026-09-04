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
    const { messenger, contact, name } = await request.json();

    if (name !== undefined) {
      const trimmedName = String(name || '').trim();
      const hasLetters = /[a-zA-Zа-яА-ЯёЁăîâșțĂÎÂȘȚ]/.test(trimmedName);
      if (trimmedName.length < 2 || !hasLetters) {
        return NextResponse.json({
          valid: false,
          error: 'Пожалуйста, укажите имя (минимум 2 буквы)'
        });
      }
    }

    const rawContact = String(contact || '').trim();
    if (!rawContact) {
      return NextResponse.json({
        valid: false,
        error: 'Пожалуйста, укажите контакт для связи'
      });
    }

    if (messenger === 'wa' || messenger === 'viber' || messenger === 'WhatsApp' || messenger === 'Viber') {
      if (/[a-zA-Zа-яА-ЯёЁ@]/.test(rawContact)) {
        return NextResponse.json({
          valid: false,
          error: `Для ${messenger === 'viber' || messenger === 'Viber' ? 'Viber' : 'WhatsApp'} укажите действующий номер телефона с кодом страны (например, +7... или +373...)`
        });
      }

      const digitsOnly = rawContact.replace(/\D/g, '');
      if (digitsOnly.length < 9 || digitsOnly.length > 15) {
        return NextResponse.json({
          valid: false,
          error: 'Номер телефона должен содержать от 9 до 15 цифр с кодом страны'
        });
      }

      if (isDummyPhone(digitsOnly)) {
        return NextResponse.json({
          valid: false,
          error: 'Похоже на тестовый или несуществующий номер. Укажите реальный номер телефона.'
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
          error: 'Укажите реальный номер телефона с кодом страны или @username в Telegram'
        });
      }
      return NextResponse.json({ valid: true });
    }

    const cleanUsername = tgInput.replace(/^@/, '').trim();

    if (!/^[a-zA-Z0-9_]{5,32}$/.test(cleanUsername)) {
      return NextResponse.json({
        valid: false,
        error: 'Юзернейм в Telegram должен содержать от 5 до 32 символов (только латиница, цифры и _)'
      });
    }

    if (isDummyUsername(cleanUsername)) {
      return NextResponse.json({
        valid: false,
        error: 'Укажите реальный аккаунт в Telegram, иначе инженер не сможет связаться с вами'
      });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN || BUILTIN_TG_TOKEN;
    if (token) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const tgRes = await fetch(`https://api.telegram.org/bot${token}/getChat?chat_id=@${cleanUsername}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const tgData = await tgRes.json();
        if (!tgData.ok) {
          if (tgData.error_code === 400 || tgData.description?.includes('chat not found')) {
            return NextResponse.json({
              valid: false,
              error: `Такого аккаунта (@${cleanUsername}) в Telegram не существует. Проверьте правильность или укажите номер телефона.`
            });
          }
        }
      } catch (err) {
        console.warn('Telegram live lookup timeout or error, bypassing live check:', err);
      }
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Contact validation error:', error);
    return NextResponse.json({ valid: true });
  }
}
