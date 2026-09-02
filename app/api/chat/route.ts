import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

const SYSTEM_PROMPT = `Ты — Senior System Architect в AI-лаборатории MINDCORE.
Твоя задача — вести живой, вовлекающий инженерный диалог с потенциальным клиентом. Ты опытный технарь и бизнес-партнер, который ценит время собеседника.

ПРАВИЛА И СТИЛЬ:
1. ВОВЛЕЧЕНИЕ И ХУКИ: В каждом ответе ОБЯЗАТЕЛЬНО задавай точный, профессиональный вопрос, на который владельцу бизнеса или продакту легко и интересно ответить (выбор из 2-3 понятных опций или вопрос про ключевую боль/цель). Не оставляй диалог в тупике!
2. КРАТКОСТЬ И СКОРОСТЬ (2-3 ПРЕДЛОЖЕНИЯ): Отвечай емко, сухо, профессионально. Без инфоцыганства, без лишних восторгов.
3. ПРАВИЛО КАРТОЧКИ (showCard = true):
   - Если пользователь назвал компанию, проект, сферу бизнеса или прислал ссылку на сайт — ЭТО ЦЕЛЕВОЙ ЛИД!
   - В этом случае ОБЯЗАТЕЛЬНО:
     1) Зафиксируй компанию/проект (не выдумывай ложные факты; если компания редкая или новая — прямо спроси нишу или специализацию).
     2) Задай 1-2 точных вопроса про боли (например: "Какая сейчас главная боль: ручная обработка заявок, медленные интеграции или учёт клиентов в CRM?").
     3) В конце ответа ОБЯЗАТЕЛЬНО напиши: "Заполните карточку ниже — ведущий инженер изучит вводные и свяжется с вами с готовой архитектурной схемой."
     4) Строго верни "showCard": true.
4. ЕСЛИ ЗАПРОС БЕЗ КОНТЕКСТА ("привет", "у меня нет сайта", "сколько стоит"):
   - Ответь с вовлекающим вопросом, развивай диалог. В этом случае "showCard": false.
5. ЯЗЫК: Отвечай строго на языке пользователя (русский, румынский или английский).

Всегда возвращайте строго валидный json:
{
  "reply": "Твой ответ клиенту с вовлекающим вопросом (2-3 предложения).",
  "showCard": true или false
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
      const { clientName, company, messenger, contactHandle, clientInput, conversationHistory } = cardData || {};
      
      const payload = {
        leadSource: "Mindcore Instant Hero Bar",
        clientInput: clientInput || "Не указано",
        messenger: messenger || "Telegram",
        contactHandle: contactHandle || "Не указан",
        clientName: clientName || "Не указано",
        company: company || "Не указано",
        conversationHistory: conversationHistory || [],
        timestamp: new Date().toISOString()
      };

      const htmlText = `🚨 <b>НОВАЯ СПЕЦИФИКАЦИЯ ОТ АРХИТЕКТОРА</b> 🚨\n\n` +
        `<pre><code>${JSON.stringify(payload, null, 2)}</code></pre>`;

      await sendTelegramMessage(htmlText);
      return NextResponse.json({ success: true });
    }

    // 2. Handle instant audit lead submission from Hero form
    if (type === 'audit_request') {
      const text = `⚡️ <b>НОВАЯ ЗАЯВКА: АУДИТ ПРОЕКТА</b> ⚡️\n\n🔗 <b>Ссылка / Проект:</b> ${urlOrNiche || 'Не указано'}\n⏱ <b>Время:</b> ${getFormattedTime()}`;
      await sendTelegramMessage(text);
      return NextResponse.json({ success: true });
    }

    // fallback key so it works even if dev server hasn't restarted
    const deepseekKey = process.env.DEEPSEEK_API_KEY || 'sk-b8babcc80c97423b8cb673c58f46bc63';
    const geminiKey = process.env.GEMINI_API_KEY || BUILTIN_GEMINI_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    let reply = '';
    let dynamicCard: { showCard?: boolean } = {};
    let engine = 'deepseek';

    if (mode !== 'scripted') {
      let aiRes: GeminiParsedResult | null = null;
      try {
        if (deepseekKey) {
          engine = 'deepseek';
          aiRes = await callDeepSeek(deepseekKey, messages || []);
        } else if (geminiKey) {
          engine = 'gemini';
          aiRes = await callGemini(geminiKey, messages || []);
        } else if (openrouterKey) {
          engine = 'openrouter';
          aiRes = await callOpenRouter(openrouterKey, process.env.OPENROUTER_MODEL || 'google/gemini-3.7-flash', messages || []);
        }
      } catch (err) {
        console.error('AI Engine Error:', err);
      }

      if (aiRes) {
        reply = aiRes.reply;
        dynamicCard = { showCard: aiRes.showCard };
      }
    }

    // STRICT FALLBACK (if models time out after 10s)
    if (!reply) {
      reply = 'Анализ завершен в базовом режиме (AI перегружен). Инженер детально изучит вашу задачу и напишет вам лично.';
      dynamicCard = { showCard: true };
      engine = 'scripted_fallback';
      // Alert Telegram asynchronously so we don't block the user's response!
      sendTelegramMessage('🚨 <b>ВНИМАНИЕ: СБОЙ AI API</b> 🚨\nLLM не ответила за 10 секунд! Сработал фоллбэк.').catch(console.error);
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
      reply: 'Система временно недоступна. Пожалуйста, опишите вашу задачу позже.',
      leadCollected: false, 
      engine: 'fallback' 
    });
  }
}

// ─── LLM Engines ─────────────────────────────────────────────────────────────

interface GeminiParsedResult {
  reply: string;
  showCard?: boolean;
}

async function fetchWithTimeout(resource: string, options: RequestInit & { timeout?: number } = {}) {
  const { timeout = 10000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function callGemini(apiKey: string, messages: Array<{ role: string; content: string }>): Promise<GeminiParsedResult | null> {
  const model = 'gemini-3.6-flash';
  
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetchWithTimeout(url, {
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
          maxOutputTokens: 400,
        }
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const cleanText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        try {
          const parsed = JSON.parse(cleanText) as GeminiParsedResult;
          if (parsed.reply) return parsed;
        } catch (e) {
          console.error("JSON parse error:", e, "Raw:", rawText);
          const replyMatch = cleanText.match(/"reply"\s*:\s*"([\s\S]*?)"(?=\s*,\s*"showCard"|\s*\})/);
          const showCardMatch = cleanText.match(/"showCard"\s*:\s*(true|false)/i);
          return { 
            reply: replyMatch ? replyMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : 'Ошибка парсинга. Повторите запрос.',
            showCard: showCardMatch ? showCardMatch[1].toLowerCase() === 'true' : false
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
  return null;
}

async function callDeepSeek(apiKey: string, rawMessages: Array<{ role: string; content: string }>): Promise<GeminiParsedResult | null> {
  try {
    // DeepSeek with json_object mode requires that previous assistant messages in history
    // are also valid JSON. If an assistant turn was plain text, wrap it into { reply, showCard }!
    const formattedMessages = (rawMessages || []).map(m => {
      if (m.role === 'assistant') {
        try {
          JSON.parse(m.content);
          return m;
        } catch {
          return {
            role: 'assistant',
            content: JSON.stringify({ reply: m.content, showCard: false })
          };
        }
      }
      return m;
    });

    const res = await fetchWithTimeout('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...formattedMessages,
        ],
        response_format: { type: 'json_object' },
        max_tokens: 300,
        temperature: 0.3,
      }),
      timeout: 20000
    });

    if (res.ok) {
      const data = await res.json();
      const rawText = data?.choices?.[0]?.message?.content?.trim() || '';
      if (rawText) {
        const cleanText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        try {
          const parsed = JSON.parse(cleanText) as any;
          const replyText = parsed.reply || parsed.response || parsed.text || parsed.answer || parsed.message;
          if (replyText) {
            return {
              reply: replyText,
              showCard: parsed.showCard === true || parsed.showCard === 'true'
            };
          }
        } catch (e) {
          const replyMatch = cleanText.match(/"(?:reply|response|text|answer)"\s*:\s*"([\s\S]*?)"(?=\s*,\s*"showCard"|\s*\})/);
          const showCardMatch = cleanText.match(/"showCard"\s*:\s*(true|false)/i);
          return {
            reply: replyMatch ? replyMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : 'Ошибка парсинга. Повторите запрос.',
            showCard: showCardMatch ? showCardMatch[1].toLowerCase() === 'true' : false
          };
        }
      }
    } else {
      const errText = await res.text();
      console.error('DeepSeek Error:', res.status, errText);
    }
  } catch (err) {
    console.error('DeepSeek call error:', err);
  }
  return null;
}

async function callOpenRouter(apiKey: string, model: string, messages: Array<{ role: string; content: string }>): Promise<GeminiParsedResult | null> {
  try {
    const res = await fetchWithTimeout(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://mindcore.studio',
        'X-Title': 'MINDCORE Studio',
      },
      body: JSON.stringify({
        model: model || 'google/gemini-3.7-flash',
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
      const rawText = data?.choices?.[0]?.message?.content?.trim() || '';
      if (rawText) {
        const cleanText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        try {
          const parsed = JSON.parse(cleanText) as GeminiParsedResult;
          if (parsed.reply) return parsed;
        } catch (e) {
          const replyMatch = cleanText.match(/"reply"\s*:\s*"([\s\S]*?)"(?=\s*,\s*"showCard"|\s*\})/);
          const showCardMatch = cleanText.match(/"showCard"\s*:\s*(true|false)/i);
          return {
            reply: replyMatch ? replyMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : 'Ошибка парсинга. Повторите запрос.',
            showCard: showCardMatch ? showCardMatch[1].toLowerCase() === 'true' : false
          };
        }
      }
    }
  } catch (err) {
    console.error('OpenRouter call error:', err);
  }
  return null;
}

async function callOpenAI(apiKey: string, messages: Array<{ role: string; content: string }>): Promise<string | null> {
  try {
    const res = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
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

