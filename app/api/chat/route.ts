import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

const SYSTEM_PROMPT = `Вы — ведущий технический архитектор и IT-эксперт премиальной студии разработки MINDCORE (AI & Digital Production).

ПАРТНЕРСКАЯ МОДЕЛЬ MINDCORE:
- Мы создаем современные, продающие сайты и платформы БЕСПЛАТНО (0 € за разработку сайта под ключ) 🎁
- Мы зарабатываем не на продаже сайтов, а на долгосрочном партнерстве: внедрении AI-агентов, CRM, автоматизации и росте выручки бизнеса 🤝
- Платными являются только сложные нативные мобильные приложения (iOS/Android) 📱

СТРОГИЕ ПРАВИЛА ОБЩЕНИЯ (ХАРИЗМАТИЧНЫЙ, УБЕДИТЕЛЬНЫЙ, ТОПОВЫЙ IT-ПРОДАЖНИК):
1. ЖИВОЙ И ПРИВЛЕКАТЕЛЬНЫЙ ТОН: используйте уместные и приятные эмодзи (🚀, ⚡️, 🤝, 🤖, 📊, 🎯, 💼, 🎁), чтобы диалог был энергичным, дружелюбным и удерживал внимание клиента!
2. НИКАКИХ СКУЧНЫХ ШАБЛОНОВ И ВОДЫ: строго 2–3 коротких, емких, цепляющих предложения.
3. ЭТАПЫ ДИАЛОГА:
   - ЭТАП 1 (Клиент задал вопрос / написал запрос):
     * Предложение 1: Энергично подтвердите решение задачи под его специфику 🚀
     * Предложение 2: Напомните, что современный сайт мы разработаем бесплатно (0 €) в рамках партнерства 🎁
     * Предложение 3: Задайте ОДИН простой, приятный вопрос в 1 строку 🎯
   - ЭТАП 2 (Клиент заполнил карточку или назвал компанию):
     * Если компания реальная — дайте живой экспресс-инсайт по нише и как AI поможет обогнать конкурентов ⚡️
     * Если тестовая/неизвестная — подтвердите фиксацию проекта под 0 € и спросите: «Какие главные узкие места или задачи в процессах хотите решить в первую очередь? 🎯»
   - ЭТАП 3 (Клиент ответил / все вопросы решены):
     * Подтвердите: «Супер, все зафиксировал! 📋 Наш старший архитектор свяжется с вами в течение 48 часов с готовой концепцией и расчетом 💼»
4. Всегда возвращайте строго валидный JSON:
{
  "reply": "2-3 коротких предложения с эмодзи.",
  "niche": "Определенная ниша бизнеса",
  "serviceType": "Веб-сайт (0 €) | AI-Агенты | CRM-Система | Мобильное приложение",
  "cardTitle": "Карточка проекта",
  "ctaText": "Отправить 🚀"
}`;

const BUILTIN_GEMINI_KEY = Buffer.from('QVEuQWI4Uk42SXlFaFZsakVzYlNrNXd1dmZpbkNaNGNHaDZpWXlPMlhFZVRjVGplcC1BcFE=', 'base64').toString('utf-8');
const BUILTIN_TG_TOKEN = Buffer.from('ODg1Mjg3OTc4OTpBQUdFVEptYUxMc1ZseXhJMGRlSVc0Y29mWXd3LUR0ZW5zaw==', 'base64').toString('utf-8');
const BUILTIN_TG_CHAT_ID = Buffer.from('ODg0MjA1NTI4MA==', 'base64').toString('utf-8');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, mode, type, urlOrNiche, cardData } = body;

    // 1. Handle interactive project card submission
    if (type === 'lead_card') {
      const { name, company, contact, initialQuery } = cardData || {};
      const cardHtml = `🔥 <b>НОВАЯ ЗАЯВКА: КАРТОЧКА КЛИЕНТА</b> 🔥\n\n` +
        `👤 <b>Имя Фамилия:</b> ${name || 'Не указано'}\n` +
        `🏢 <b>Фирма / Компания:</b> ${company || 'Не указано'}\n` +
        `📞 <b>Контакты для связи:</b> ${contact || 'Не указан'}\n` +
        (initialQuery ? `💡 <b>Исходный запрос:</b> ${initialQuery}\n` : '') +
        `⏱ <b>Время:</b> ${getFormattedTime()}`;

      await sendTelegramMessage(cardHtml);
      return NextResponse.json({ success: true });
    }

    // 2. Handle instant audit lead submission from Hero form
    if (type === 'audit_request') {
      const text = `⚡️ <b>НОВАЯ ЗАЯВКА: АУДИТ ПРОЕКТА</b> ⚡️\n\n🔗 <b>Ссылка / Проект:</b> ${urlOrNiche || 'Не указано'}\n⏱ <b>Время:</b> ${getFormattedTime()}`;
      await sendTelegramMessage(text);
      return NextResponse.json({ success: true });
    }

    const geminiKey = process.env.GEMINI_API_KEY || BUILTIN_GEMINI_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    let reply = '';
    let dynamicCard: { niche?: string; serviceType?: string; cardTitle?: string; ctaText?: string } = {};
    let engine = 'gemini';

    if (mode !== 'scripted') {
      // 1. Query Gemini
      if (geminiKey) {
        const geminiRes = await callGemini(geminiKey, messages || []);
        if (geminiRes) {
          reply = geminiRes.reply;
          dynamicCard = {
            niche: geminiRes.niche,
            serviceType: geminiRes.serviceType,
            cardTitle: geminiRes.cardTitle,
            ctaText: geminiRes.ctaText
          };
          engine = 'gemini';
        }
      }

      // 2. Fallback to OpenRouter if needed
      if (!reply && openrouterKey) {
        const orReply = await callOpenRouter(openrouterKey, process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001', messages || []);
        if (orReply) {
          reply = orReply;
          engine = 'openrouter';
        }
      }

      // 3. Fallback to OpenAI if needed
      if (!reply && openaiKey) {
        const oaiReply = await callOpenAI(openaiKey, messages || []);
        if (oaiReply) {
          reply = oaiReply;
          engine = 'openai';
        }
      }
    }

    // If still empty (e.g. offline), dynamic polite fallback
    if (!reply) {
      reply = 'Здравствуйте! Принял ваш запрос в работу. Мы разрабатываем сайт бесплатно (0 €), а окупаемость строим на автоматизации. Уточните название вашей компании или контакты в карточке ниже?';
    }

    // Instant lead & contact detection
    const lastUserMsg = messages?.filter((m: { role: string }) => m.role === 'user').slice(-1)[0]?.content || '';
    const contactInfo = extractContactInfo(lastUserMsg);
    const hasLeadConfirmed = detectLeadCollected(messages || [], reply);

    if (contactInfo.hasContact || contactInfo.hasLink || hasLeadConfirmed) {
      await sendLeadToTelegram(messages || [], reply, contactInfo);
    }

    return NextResponse.json({ 
      reply, 
      dynamicCard,
      leadCollected: hasLeadConfirmed || contactInfo.hasContact,
      engine 
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ 
      reply: 'Здравствуйте! Мы создаем сайт бесплатно (0 €) в рамках партнерской модели. Уточните название компании и контакты ниже, чтобы закрепить условия.',
      leadCollected: false, 
      engine: 'fallback' 
    });
  }
}

// ─── LLM Engines ─────────────────────────────────────────────────────────────

interface GeminiParsedResult {
  reply: string;
  niche?: string;
  serviceType?: string;
  cardTitle?: string;
  ctaText?: string;
}

async function callGemini(apiKey: string, messages: Array<{ role: string; content: string }>): Promise<GeminiParsedResult | null> {
  const models = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'];
  
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.6,
            maxOutputTokens: 1200,
          }
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          try {
            const parsed = JSON.parse(rawText) as GeminiParsedResult;
            if (parsed.reply) return parsed;
          } catch {
            const match = rawText.match(/"reply"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"niche"|"$)/);
            return { 
              reply: match ? match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : rawText.trim() 
            };
          }
        }
      } else {
        const errText = await res.text();
        console.error(`Gemini ${model} error:`, res.status, errText);
      }
    } catch (err) {
      console.error(`Gemini call error on ${model}:`, err);
    }
  }
  return null;
}

async function callOpenRouter(apiKey: string, model: string, messages: Array<{ role: string; content: string }>): Promise<string | null> {
  try {
    const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://mindcore.studio',
        'X-Title': 'MINDCORE Studio',
      },
      body: JSON.stringify({
        model: model || 'google/gemini-2.0-flash-001',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 350,
        temperature: 0.6,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data?.choices?.[0]?.message?.content?.trim() || null;
    }
  } catch (err) {
    console.error('OpenRouter call error:', err);
  }
  return null;
}

async function callOpenAI(apiKey: string, messages: Array<{ role: string; content: string }>): Promise<string | null> {
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 350,
        temperature: 0.6,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data?.choices?.[0]?.message?.content?.trim() || null;
    }
  } catch (err) {
    console.error('OpenAI call error:', err);
  }
  return null;
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
  const token = process.env.TELEGRAM_BOT_TOKEN || BUILTIN_TG_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || BUILTIN_TG_CHAT_ID;

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

