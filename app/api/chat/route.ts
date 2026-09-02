import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

const SYSTEM_PROMPT = `Вы — официальный AI-консультант и технический архитектор премиальной студии разработки MINDCORE (AI & Digital Production).

MINDCORE проектирует и строит:
1. Веб-разработка полного цикла и сложные сервисы (Next.js, React, Node.js, Python, PostgreSQL, AWS).
2. Автономные AI-агенты, квалификаторы лидов и чат-боты (GPT-4o, Claude 3.5, NLP, CRM, Telegram/WhatsApp).
3. Персональные CRM и ERP системы под индивидуальные бизнес-процессы.
4. Интеграции LLM с базами данных, внешними API и корпоративным стеком.
5. Автоматизация бизнес-процессов (n8n, Webhooks, Python, Zapier).
6. Аудит конверсий (CPA, GA4, воронки), UX/UI редизайн и аудит безопасности.

СТАНДАРТ И СТИЛЬ ОБЩЕНИЯ:
- Обращайтесь строго на "Вы" (вежливо, тактично, сдержанно и профессионально).
- Ответы должны быть экспертными, ясными и лаконичными (2–4 предложения, без лишней воды и навязчивости).
- Отвечайте строго на том языке, на котором пишет собеседник (русский, румынский, английский).
- Ваша цель: понять задачу бизнеса, кратко сориентировать по архитектурному решению / срокам и вежливо предложить передать детали ведущему инженеру студии.
- Для фиксации обращения вежливо запросите имя и удобный контакт (Telegram, WhatsApp или Email).
- Как только контакт передан, поблагодарите и подтвердите, что старший архитектор свяжется для предметного обсуждения.
- Студия работает удаленно по всему миру (Ключевые центры: New York, Prague, Chisinau). Прямой контакт: @kraeved111, edik40288@gmail.com.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, mode, type, urlOrNiche } = body;

    // Handle instant audit lead submission from Hero form
    if (type === 'audit_request') {
      const text = `⚡️ <b>НОВАЯ ЗАЯВКА: АУДИТ ПРОЕКТА</b> ⚡️\n\n🔗 <b>Ссылка / Проект:</b> ${urlOrNiche || 'Не указано'}\n⏱ <b>Время:</b> ${getFormattedTime()}`;
      await sendTelegramMessage(text);
      return NextResponse.json({ success: true });
    }

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001';

    let reply = '';
    let isLLMSuccess = false;

    // 1. If API key exists, call LLM
    if (apiKey && mode !== 'scripted') {
      try {
        const isStandardOpenAI = !process.env.OPENROUTER_API_KEY && Boolean(process.env.OPENAI_API_KEY);
        const endpoint = isStandardOpenAI 
          ? 'https://api.openai.com/v1/chat/completions' 
          : `${OPENROUTER_BASE}/chat/completions`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://mindcore.studio',
            'X-Title': 'MINDCORE Studio',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...(messages || []),
            ],
            max_tokens: 350,
            temperature: 0.6,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          reply = data.choices?.[0]?.message?.content?.trim() || '';
          if (reply) isLLMSuccess = true;
        } else {
          console.error('LLM API error status:', response.status, await response.text());
        }
      } catch (llmErr) {
        console.error('LLM Call failed:', llmErr);
      }
    }

    // 2. Fallback to official scripted response if LLM offline or key not provided yet
    if (!isLLMSuccess || !reply) {
      const scripted = getScriptedResponse(messages || []);
      reply = scripted.reply;
    }

    // 3. Instant lead & contact detection
    const lastUserMsg = messages?.filter((m: { role: string }) => m.role === 'user').slice(-1)[0]?.content || '';
    const contactInfo = extractContactInfo(lastUserMsg);
    const hasLeadConfirmed = detectLeadCollected(messages || [], reply);

    if (contactInfo.hasContact || contactInfo.hasLink || hasLeadConfirmed) {
      await sendLeadToTelegram(messages || [], reply, contactInfo);
    }

    return NextResponse.json({ 
      reply, 
      leadCollected: hasLeadConfirmed || contactInfo.hasContact,
      mode: isLLMSuccess ? 'llm' : 'scripted' 
    });

  } catch (error) {
    console.error('Chat API error:', error);
    const fallback = getScriptedResponse([]);
    return NextResponse.json({ reply: fallback.reply, leadCollected: false, mode: 'fallback' });
  }
}

// ─── Polite Executive Scripted Fallback ──────────────────────────────────────────

const SCRIPTED_FLOWS: Record<number, string[]> = {
  0: [
    "Understood. Are you looking for full-cycle web engineering, autonomous AI agents, or business process automation?",
    "Принято. Вас интересует веб-разработка под ключ, внедрение AI-агентов или автоматизация внутренних процессов?",
    "Înțeles. Vă interesează dezvoltare web completă, integrare de agenți AI sau automatizarea proceselor?",
  ],
  1: [
    "What stage is the project at — conceptual design from scratch, existing product, or scaling an active system?",
    "На каком этапе находится проект — проектирование с нуля, готовый продукт или масштабирование действующей системы?",
    "În ce etapă se află proiectul — concept de la zero, produs existent sau scalare?",
  ],
  2: [
    "What is your target timeline and estimated budget range?",
    "Какой ориентировочный бюджет и сроки вы рассматриваете для реализации?",
    "Care este bugetul estimativ și termenul dorit de livrare?",
  ],
  3: [
    "Thank you for the information! Could you please share your name and preferred contact method (Telegram, WhatsApp, or Email) for our lead engineer?",
    "Благодарю за информацию! Подскажите, пожалуйста, ваше имя и удобный контакт (Telegram, WhatsApp или Email) для связи с ведущим инженером.",
    "Vă mulțumesc pentru detalii. Vă rog să indicați numele și un canal convenabil de contact (Telegram, WhatsApp sau Email).",
  ],
};

function getScriptedResponse(messages: Array<{ role: string; content: string }>) {
  const userMessages = messages.filter((m) => m.role === 'user');
  const step = Math.min(userMessages.length, 3);
  const lastMsg = userMessages[userMessages.length - 1]?.content ?? '';
  const lang = detectLanguage(lastMsg);
  const langIdx = lang === 'ru' ? 1 : lang === 'ro' ? 2 : 0;

  const replies = SCRIPTED_FLOWS[step];
  const reply = replies?.[langIdx] ?? replies?.[0] ?? "Здравствуйте! Опишите, пожалуйста, вашу задачу.";

  return { reply, step };
}

function detectLanguage(text: string): 'ru' | 'ro' | 'en' {
  const ruPattern = /[а-яё]/i;
  const roPattern = /[ăîâșțĂÎÂȘȚ]/;
  if (ruPattern.test(text)) return 'ru';
  if (roPattern.test(text)) return 'ro';
  return 'en';
}

function extractContactInfo(text: string) {
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const tgRegex = /(?:@|(?:https?:\/\/)?t\.me\/)([a-zA-Z0-9_]{4,})/i;
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{2,4}/;
  const linkRegex = /((?:https?:\/\/|www\.)[^\s]+|[a-zA-Z0-9-]+\.(?:com|ru|io|ai|md|dev|org|net|app|pro|co)\b[^\s]*)/i;

  const emailMatch = text.match(emailRegex);
  const tgMatch = text.match(tgRegex);
  const phoneMatch = text.match(phoneRegex);
  const linkMatch = text.match(linkRegex);

  const contactParts: string[] = [];
  if (emailMatch) contactParts.push(`📧 ${emailMatch[1]}`);
  if (tgMatch) contactParts.push(`✈️ @${tgMatch[1]}`);
  if (phoneMatch && phoneMatch[0].length >= 8) contactParts.push(`📞 ${phoneMatch[0]}`);

  return {
    hasContact: contactParts.length > 0,
    hasLink: Boolean(linkMatch),
    contactStr: contactParts.join(' | '),
    linkStr: linkMatch ? linkMatch[0] : ''
  };
}

function detectLeadCollected(
  messages: Array<{ role: string; content: string }>,
  lastReply: string
): boolean {
  const userMsgCount = messages.filter((m) => m.role === 'user').length;
  const confirmWords = ['свяж', 'инженер', 'передан', 'contact', 'forwarded', 'transmis', 'echip', 'succes'];
  const hasConfirm = confirmWords.some((w) => lastReply.toLowerCase().includes(w));
  return userMsgCount >= 3 && hasConfirm;
}

function getFormattedTime() {
  return new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Chisinau' });
}

async function sendTelegramMessage(htmlText: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('Telegram token or chat ID not set');
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: htmlText,
        parse_mode: 'HTML',
      }),
    });
  } catch (err) {
    console.error('Error sending message to Telegram:', err);
  }
}

async function sendLeadToTelegram(
  messages: Array<{ role: string; content: string }>,
  lastReply: string,
  contactInfo: { contactStr: string; linkStr: string }
) {
  const transcript = messages
    .filter(m => m.role !== 'system')
    .map(m => `${m.role === 'user' ? '👤 <b>КЛИЕНТ</b>' : '🤖 <b>AI</b>'}:\n${m.content}`)
    .join('\n\n');

  let text = `🚨 <b>НОВАЯ ЗАЯВКА / ЛИД MINDCORE</b> 🚨\n\n`;

  if (contactInfo.contactStr) {
    text += `👤 <b>Контакты:</b> ${contactInfo.contactStr}\n`;
  }
  if (contactInfo.linkStr) {
    text += `🔗 <b>Ссылка:</b> ${contactInfo.linkStr}\n`;
  }
  text += `⏱ <b>Время:</b> ${getFormattedTime()}\n\n`;
  text += `📋 <b>История диалога:</b>\n${transcript}\n\n🤖 <b>Ответ AI:</b>\n${lastReply}`;

  await sendTelegramMessage(text);
}

