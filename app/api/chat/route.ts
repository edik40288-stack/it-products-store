import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const SYSTEM_PROMPT = `You are the MINDCORE Studio AI assistant — a smart, friendly, and professional sales representative for a premium AI development studio.

MINDCORE builds:
- Full-cycle web/app development (React, Next.js, Node.js, AWS)
- AI agents & chatbots (GPT-4o, Claude, custom LLMs)
- Custom CRM systems & business digitization
- LLM integrations & API connections
- Process automation (n8n, Zapier, custom pipelines)
- Conversion audits & analytics (CPA, GA4, funnels)
- UI/UX redesign & premium interfaces
- Security audits

YOUR GOAL: Qualify the lead through a natural conversation. Follow these steps:
1. Understand the business challenge (what do they need — development, AI, automation?)
2. Ask about project stage (idea/existing product/needs scaling)
3. Ask about timeline and rough budget (be casual about it)
4. Collect contact info (name + Telegram or email)
5. Confirm you'll send the info to the team

RULES:
- Be warm, smart, and concise. Maximum 2-3 sentences per message.
- Don't overwhelm with questions — ask ONE thing at a time.
- Match the language the user writes in (Russian, English, Romanian).
- When you have name + contact, end with a confirmation message.
- Never be pushy or salesy. Be a trusted advisor.
- Use light emoji occasionally (🚀 ✅ 💡) but don't overdo it.

The studio is based in New York, Copenhagen, and Chisinau. Email: newbusiness@mindcore.studio`;

export async function POST(request: NextRequest) {
  try {
    const { messages, mode } = await request.json();

    // Scripted fallback mode (no API key needed for MVP demo)
    if (mode === 'scripted' || !process.env.OPENROUTER_API_KEY) {
      return scriptedResponse(messages);
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || 'ox-alpha';

    const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
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
          ...messages,
        ],
        max_tokens: 300,
        temperature: 0.75,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter error:', errorData);
      // Fallback to scripted on API error
      return scriptedResponse(messages);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "I'm here to help! Tell me about your project.";

    // Check if lead is collected
    const leadCollected = detectLeadCollected(messages, reply);

    if (leadCollected) {
      await sendToTelegram(messages, reply);
    }

    return NextResponse.json({ reply, leadCollected });

  } catch (error) {
    console.error('Chat API error:', error);
    return scriptedResponse([]);
  }
}

// ─── Scripted fallback ───────────────────────────────────────────────────────

const SCRIPTED_FLOWS: Record<number, string[]> = {
  0: [
    "Got it! 💡 Is this about building something from scratch, adding AI agents to what you have, or automating existing processes?",
    "Отлично! 💡 Это про разработку с нуля, добавление ИИ-агентов или автоматизацию текущих процессов?",
    "Super! 💡 Este vorba despre construire de la zero, agenți AI sau automatizarea proceselor?",
  ],
  1: [
    "Great direction. What stage is your project at — early concept, existing product, or ready to scale?",
    "Хорошо. На каком этапе проект — ранняя идея, уже есть продукт, или готов к масштабированию?",
    "Bine. În ce etapă se află proiectul — idee, produs existent sau pregătit pentru scalare?",
  ],
  2: [
    "Perfect. Any rough sense of timeline and budget? (Even a range helps us prepare the right proposal 🚀)",
    "Понятно. Есть примерное представление о сроках и бюджете? (Даже диапазон поможет 🚀)",
    "Perfect. Aveți o idee aproximativă despre termene și buget? (Chiar și o gamă ne ajută 🚀)",
  ],
  3: [
    "Excellent! Last step — what's your name and best way to reach you? (Telegram or email) ✅",
    "Отлично! Последний шаг — как вас зовут и как лучше связаться? (Telegram или email) ✅",
    "Excelent! Ultimul pas — cum vă numiți și cum vă putem contacta? (Telegram sau email) ✅",
  ],
};

function scriptedResponse(messages: Array<{ role: string; content: string }>) {
  const userMessages = messages.filter((m) => m.role === 'user');
  const step = Math.min(userMessages.length, 3);

  // Detect language from last user message
  const lastMsg = userMessages[userMessages.length - 1]?.content ?? '';
  const lang = detectLanguage(lastMsg);
  const langIdx = lang === 'ru' ? 1 : lang === 'ro' ? 2 : 0;

  const replies = SCRIPTED_FLOWS[step];
  const reply = replies?.[langIdx] ?? replies?.[0] ?? "Tell me more about your project!";

  const leadCollected = step >= 3;

  if (leadCollected) {
    // We don't await this because we want to respond quickly
    sendToTelegram(messages, reply);
  }

  return NextResponse.json({ reply, leadCollected, mode: 'scripted' });
}

function detectLanguage(text: string): 'ru' | 'ro' | 'en' {
  const ruPattern = /[а-яё]/i;
  const roPattern = /[ăîâșțĂÎÂȘȚ]/;
  if (ruPattern.test(text)) return 'ru';
  if (roPattern.test(text)) return 'ro';
  return 'en';
}

function detectLeadCollected(
  messages: Array<{ role: string; content: string }>,
  lastReply: string
): boolean {
  const userMsgCount = messages.filter((m) => m.role === 'user').length;
  // Simple heuristic: if we've had 4+ exchanges and reply confirms contact
  const confirmWords = ['send', 'отправлен', 'trimis', 'team', 'команд', 'echipă', '🚀', '✅'];
  const hasConfirm = confirmWords.some((w) => lastReply.toLowerCase().includes(w));
  return userMsgCount >= 3 && hasConfirm;
}

async function sendToTelegram(messages: Array<{ role: string; content: string }>, lastReply: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!token || !chatId) {
    console.warn('Telegram integration is not configured. Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID.');
    return;
  }

  const transcript = messages
    .filter(m => m.role !== 'system')
    .map(m => `${m.role === 'user' ? '👤 CLIENT' : '🤖 AI'}:\n${m.content}`)
    .join('\n\n');

  const text = `🚨 <b>NEW LEAD FROM MINDCORE</b> 🚨\n\n${transcript}\n\n🤖 AI:\n${lastReply}`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: chatId, 
        text: text,
        parse_mode: 'HTML'
      }),
    });
  } catch (err) {
    console.error('Error sending lead to Telegram:', err);
  }
}
