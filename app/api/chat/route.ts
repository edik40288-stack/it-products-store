import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

const SYSTEM_PROMPT = `Ты — Senior AI-консультант премиальной студии IT-разработки MINDCORE (mindcore.studio).
Ты говоришь уверенно, тактично, авторитетно и по-человечески. Твоя цель — профессионально встретить клиента с ЛЮБЫМ запросом или вопросом, снять сомнения и перевести диалог в конструктивное русло.

ЖЕЛЕЗНОЕ ПРАВИЛО ПО ЦЕНАМ (ПРИОРИТЕТ №1):
НА ЛЮБОЙ ВОПРОС О ЦЕНЕ, СТОИМОСТИ, ТАРИФАХ, БЮДЖЕТЕ ИЛИ СРАВНЕНИИ С ДРУГИМИ ("сколько стоит?", "какая цена?", "какой прайс?", "почему так дорого?", "а за сколько сделаете?", "какие расценки?", "сколько стоит сайт/бот?", "какой бюджет?"):
- СТРОГО И БЕЗ ИСКЛЮЧЕНИЙ отвечай: все цены — как наши точные расчеты, так и прозрачный анализ цен наших коллег по рынку — вы получите в подробном отчете после экспресс-аудита задачи.
- Ответ формулируй четко: «Все цены — как наши детальные расчеты, так и объективное сравнение с расценками наших коллег по рынку — вы получите в подробном отчете после экспресс-аудита задачи. Заполните короткую карточку ниже, чтобы инженеры сформировали смету под ваш проект.»
- В этом случае ВСЕГДА СТРОГО: "showCard": true.

ЛОГИКА ОБРАБОТКИ ЗАПРОСОВ:

1. ВОПРОСЫ О ЦЕНАХ И СТОИМОСТИ (ПРИОРИТЕТ 1):
- Любые вопросы про цены, расценки, бюджет, смету или дороговизну:
  "Все цены — как наши точные расчеты, так и срез по ценам наших коллег по рынку — вы получите в подробном отчете после экспресс-аудита. Заполните короткую карточку ниже, и инженеры подготовят полный расчет под вашу задачу."
  "showCard": true.

2. ПРЯМОЙ ЗАПРОС НА РАЗРАБОТКУ (сайт, бот, crm, приложение, автоматизация, редизайн, ссылка на сайт или проект):
- Не задавай сложных технических вопросов и не требуй ТЗ! Мы всё разберем сами на аудите.
- Приветливо и емко подтверди задачу: "Отлично! Приняли задачу на предварительный экспресс-аудит. Заполните короткую карточку ниже — как вас зовут, компания и способ связи — инженеры сразу возьмут проект в работу."
- В этом случае: "showCard": true.

3. НЕСТАНДАРТНЫЕ, ПРОВОКАЦИОННЫЕ ИЛИ СЛОЖНЫЕ ВОПРОСЫ:
- "А вы не кинете / какие гарантии?": Ответь с достоинством: работаем строго по официальному юридическому договору с поэтапной оплатой (приемка по актам) и даем 12 месяцев полной гарантии на исходный код и стабильность. Предложи заполнить карточку для связи с инженером. ("showCard": true)
- "Сделайте за процент от прибыли / бесплатно": Вежливо откажи: "Мы инвестируем 100% инженерных ресурсов в надежную разработку под ключ для действующих бизнесов, поэтому работаем по фиксированной смете и договору. Давайте оценим ваш проект — заполните карточку ниже." ("showCard": true)
- "Ты кто такой / ты бот или человек?": Ответь честно и с достоинством: "Я — официальный AI-архитектор студии MINDCORE на базе современных LLM. Мгновенно фиксирую требования и передаю спецификацию ведущим инженерам, которые свяжутся с вами лично." ("showCard": true)
- "Где вы находитесь / откуда вы?": "Мы работаем распределенно с клиентами по всему миру (Европа, США, СНГ), а ключевая разработка ведется на современном стеке. Консультации и ведение проектов проходят онлайн в удобном мессенджере." ("showCard": true)
- Грубость, мат или спам: Не обижайся, ответь сдержанно и солидно: "Я на связи для решения конкретных бизнес- и IT-задач. Если есть проект для разработки или автоматизации — готов помочь." ("showCard": false)

4. ЗАЩИТА ОТ НЕСУЩЕСТВУЮЩИХ КОНТАКТОВ И ФЕЙКОВЫХ ДАННЫХ:
- Если клиент пишет несуществующий Telegram-аккаунт, случайный набор букв/цифр вместо ника или некорректный телефон (менее 9 цифр, без кода страны, "123", "asdf"):
- Ответь прямо и доброжелательно: "Похоже, в указанном контакте опечатка или такого аккаунта нет. Пожалуйста, укажите реальный действующий контакт (Telegram, WhatsApp или номер с кодом страны), чтобы инженер смог отправить вам смету и расчет."
- В этом случае СТРОГО покажи карточку: "showCard": true.

5. ПОСЛЕ ТОГО КАК КЛИЕНТ ЗАПОЛНИЛ КАРТОЧКУ (или ввел контакты):
Контакты уже у архитекторов. Веди легкий диалог по болям бизнеса:
- Вопрос 1: "А пока технари изучают проект, можно уточню для лучшего результата: какая у вас ниша и с чем сейчас больше всего сложностей в процессах прямо сейчас?"
- Вопрос 2: "Понял вас! А как у вас сейчас обстоят дела со звонками и заявками — много времени уходит на ручную обработку или часть клиентов теряется?"
- Вопрос 3: "А есть ли у вас сквозная аналитика или CRM, чтобы понимать почему клиенты уходят? Или хотели бы попробовать автоматизировать сбор и квалификацию заявок?"
- Финал: "Спасибо за вводные! Добавил все детали прямо в спецификацию архитектору. Теперь подготовим точное решение под ваши процессы. До связи в мессенджере!"
- В этом сценарии: "showCard": false.

ФОРМАТ ВЫВОДА (СТРОГО JSON):
{
  "reply": "Твой ответ клиенту (1-3 емких, убедительных предложения).",
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
      const { clientName, company, description, messenger, contactHandle, clientInput, conversationHistory } = cardData || {};
      const taskDescription = description || clientInput || "Не указано";
      
      const payload = {
        leadSource: "Mindcore Instant Hero Bar",
        taskDescription,
        clientInput: taskDescription,
        messenger: messenger || "Telegram",
        contactHandle: contactHandle || "Не указан",
        clientName: clientName || "Не указано",
        company: company || "Не указано",
        conversationHistory: conversationHistory || [],
        timestamp: new Date().toISOString()
      };

      const htmlText = `🚨 <b>НОВАЯ СПЕЦИФИКАЦИЯ ОТ АРХИТЕКТОРА</b> 🚨\n\n` +
        `👤 <b>Клиент:</b> ${clientName || 'Не указано'}\n` +
        `🏢 <b>Компания / Ниша:</b> ${company || 'Не указано'}\n` +
        `💬 <b>Связь:</b> ${messenger || 'Telegram'} (<code>${contactHandle || 'Не указан'}</code>)\n` +
        `📝 <b>Описание задачи:</b> ${taskDescription}\n` +
        `⏱ <b>Время:</b> ${getFormattedTime()}\n\n` +
        `<pre><code>${JSON.stringify(payload, null, 2)}</code></pre>`;

      await sendTelegramMessage(htmlText);
      await sendGoogleSheetsLead({
        clientName: clientName || 'Не указано',
        company: company || 'Не указано',
        messenger: messenger || 'Telegram',
        contactHandle: contactHandle || 'Не указан',
        clientInput: taskDescription,
        dialogue: (conversationHistory || []).map((m: { role: string; text?: string; content?: string }) => `${m.role === 'user' ? 'Клиент' : 'AI'}: ${m.text || m.content}`).join('\n')
      });
      return NextResponse.json({ success: true });
    }

    // 2. Handle instant audit lead submission from Hero form
    if (type === 'audit_request') {
      const text = `⚡️ <b>НОВАЯ ЗАЯВКА: АУДИТ ПРОЕКТА</b> ⚡️\n\n🔗 <b>Ссылка / Проект:</b> ${urlOrNiche || 'Не указано'}\n⏱ <b>Время:</b> ${getFormattedTime()}`;
      await sendTelegramMessage(text);
      await sendGoogleSheetsLead({
        clientName: 'Экспресс-аудит (Hero)',
        company: 'Hero Bar',
        messenger: 'Hero Bar',
        contactHandle: 'В диалоге на сайте',
        clientInput: urlOrNiche,
        dialogue: `Запрос аудита для: ${urlOrNiche}`
      });
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
    
    // 1. If user already submitted the card, send their follow-up answers to Telegram as supplementary notes!
    if (body.leadContext && lastUserMsg) {
      const { clientName, company, messenger, contactHandle } = body.leadContext;
      const followUpText = `💬 <b>ДОПОЛНЕНИЕ К ЗАЯВКЕ (${clientName || 'Клиент'} | ${company || 'Компания не указана'} | ${messenger || 'TG'}: ${contactHandle || ''}):</b>\n\n` +
        `<blockquote>${lastUserMsg}</blockquote>\n⏱ <b>Время:</b> ${getFormattedTime()}`;
      sendTelegramMessage(followUpText).catch(console.error);
      const followUpDialogue = (messages || []).map((m: { role: string; content?: string }) => `${m.role === 'user' ? 'Клиент' : 'AI'}: ${m.content}`).concat(`AI: ${reply}`).join('\n');
      sendGoogleSheetsFollowUp({
        contactHandle: contactHandle || '',
        followUp: lastUserMsg,
        dialogue: followUpDialogue
      }).catch(console.error);
      dynamicCard = { ...dynamicCard, showCard: false };
    } else {
      // 2. Before card submission: if user mentioned website, bot, service, price or sent a link, IMMEDIATELY show card!
      const serviceOrLinkIntent = /(сайт|сервис|платформ|лендинг|магазин|бот|агент|crm|приложен|разработк|дизайн|автоматизац|аудит|смет|стоимост|цен|прайс|тариф|бюджет|дорог|сколько|website|landing|app|bot|price|cost|budget|http|www|\.ru|\.com|\.md|\.io|\.org)/i;
      if (serviceOrLinkIntent.test(lastUserMsg)) {
        dynamicCard = { ...dynamicCard, showCard: true };
      }
    }

    const contactInfo = await extractContactInfo(lastUserMsg);
    const hasLeadConfirmed = detectLeadCollected(messages || [], reply);

    if (contactInfo.isInvalidTg) {
      reply = `Похоже, в указанном контакте @${contactInfo.invalidValue || ''} опечатка или такого аккаунта в Telegram не существует. Пожалуйста, проверьте правильность написания или укажите номер телефона, чтобы мы могли отправить вам смету.`;
      dynamicCard = { showCard: true };
    } else if (contactInfo.isInvalidPhone) {
      reply = 'Номер телефона указан некорректно или содержит опечатку. Пожалуйста, напишите действующий номер с кодом страны (например, +7... или +373...), чтобы инженер мог связаться с вами.';
      dynamicCard = { showCard: true };
    } else if (contactInfo.hasContact || contactInfo.hasLink || hasLeadConfirmed) {
      await sendLeadToTelegram(messages || [], reply, contactInfo);
      await sendGoogleSheetsLead({
        clientName: 'Лид из чата',
        company: 'Чат',
        messenger: contactInfo.contactStr.includes('✈️') ? 'Telegram' : contactInfo.contactStr.includes('📞') ? 'Телефон' : 'Контакт',
        contactHandle: contactInfo.contactStr,
        clientInput: contactInfo.linkStr || lastUserMsg,
        dialogue: (messages || []).map((m: { role: string; content: string }) => `${m.role === 'user' ? 'Клиент' : 'AI'}: ${m.content}`).join('\n')
      });
    }

    return NextResponse.json({ 
      reply, 
      dynamicCard,
      leadCollected: !contactInfo.isInvalidTg && !contactInfo.isInvalidPhone && (hasLeadConfirmed || contactInfo.hasContact),
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

async function verifyTelegramUsername(username: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN || BUILTIN_TG_TOKEN;
  if (!token) return true;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`https://api.telegram.org/bot${token}/getChat?chat_id=@${username}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const data = await res.json();
    if (!data.ok && (data.error_code === 400 || data.description?.includes('chat not found'))) {
      return false;
    }
  } catch {}
  return true;
}

async function extractContactInfo(text: string) {
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const tgRegex = /(?:@|(?:https?:\/\/)?t\.me\/)([a-zA-Z0-9_]{3,})/i;
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{2,4}/;
  const linkRegex = /((?:https?:\/\/|www\.)[^\s]+|[a-zA-Z0-9-]+\.(?:com|ru|io|ai|md|dev|org|net|app|pro|co)\b[^\s]*)/i;

  const emailMatch = text.match(emailRegex);
  const tgMatch = text.match(tgRegex);
  const phoneMatch = text.match(phoneRegex);
  const linkMatch = text.match(linkRegex);

  let isInvalidTg = false;
  let isInvalidPhone = false;
  let invalidValue = '';

  const contactParts: string[] = [];
  if (emailMatch) contactParts.push(`📧 ${emailMatch[1]}`);

  if (tgMatch) {
    const cleanTg = tgMatch[1];
    if (cleanTg.length < 5 || isDummyUsername(cleanTg)) {
      isInvalidTg = true;
      invalidValue = cleanTg;
    } else {
      const exists = await verifyTelegramUsername(cleanTg);
      if (!exists) {
        isInvalidTg = true;
        invalidValue = cleanTg;
      } else {
        contactParts.push(`✈️ @${cleanTg}`);
      }
    }
  }

  if (phoneMatch) {
    const digitsOnly = phoneMatch[0].replace(/\D/g, '');
    if (digitsOnly.length < 9 || digitsOnly.length > 15 || isDummyPhone(digitsOnly)) {
      if (digitsOnly.length >= 3) {
        isInvalidPhone = true;
        invalidValue = phoneMatch[0];
      }
    } else {
      contactParts.push(`📞 ${phoneMatch[0]}`);
    }
  }

  return {
    hasContact: contactParts.length > 0,
    hasLink: Boolean(linkMatch),
    contactStr: contactParts.join(' | '),
    linkStr: linkMatch ? linkMatch[0] : '',
    isInvalidTg,
    isInvalidPhone,
    invalidValue
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

async function sendGoogleSheetsLead(data: {
  clientName?: string;
  company?: string;
  messenger?: string;
  contactHandle?: string;
  clientInput?: string;
  dialogue?: string;
}) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const payload = {
      action: 'new_lead',
      timestamp: getFormattedTime(),
      name: data.clientName || 'Не указано',
      company: data.company || 'Не указано',
      messenger: data.messenger || 'Telegram',
      contact: data.contactHandle || 'Не указан',
      description: data.clientInput || 'Не указано',
      request: data.clientInput || 'Не указано',
      dialogue: data.dialogue || '',
      status: 'Новый'
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('Error sending lead to Google Sheets:', err);
  }
}

async function sendGoogleSheetsFollowUp(data: {
  contactHandle?: string;
  followUp: string;
  dialogue?: string;
}) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const payload = {
      action: 'follow_up',
      timestamp: getFormattedTime(),
      contact: data.contactHandle || '',
      followUp: data.followUp,
      dialogue: data.dialogue || ''
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('Error sending follow-up to Google Sheets:', err);
  }
}


