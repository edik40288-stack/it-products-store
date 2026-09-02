const key = 'sk-b8babcc80c97423b8cb673c58f46bc63';
const prompt = `Ты — Senior System Architect в AI-лаборатории MINDCORE.
Твоя задача — вести живой, вовлекающий инженерный диалог с потенциальным клиентом. Ты опытный технарь и бизнес-партнер, который ценит время собеседника.

ПРАВИЛА И СТИЛЬ:
1. ВОВЛЕЧЕНИЕ И ХУКИ: В каждом ответе ОБЯЗАТЕЛЬНО задавай точный, профессиональный вопрос, на который владельцу бизнеса или продакту легко и интересно ответить (выбор из 2-3 понятных опций или вопрос про ключевую боль/цель). Не оставляй диалог в тупике!
2. КРАТКОСТЬ И СКОРОСТЬ (2-3 ПРЕДЛОЖЕНИЯ): Отвечай емко, сухо, профессионально. Без инфоцыганства, без лишних восторгов ("Приветствую! 🚀", "Взорвем продажи" — ЗАПРЕЩЕНЫ).
3. СЦЕНАРИИ:
   - Если пользователь пишет "привет" / приветствие -> Поздоровайся и сразу спроси: "Планируете запуск нового IT-продукта с нуля или хотите автоматизировать текущие бизнес-процессы?" (showCard = false).
   - Если пишет "у меня нет сайта" -> Поддержи преимущество: "Без сайта даже проще — можно сразу спроектировать чистую архитектуру без чужих костылей. Какая задача у вас сейчас на первом месте: автоматизировать сбор заявок, внедрить CRM с умными ботами или разработать веб-платформу?" (showCard = false).
   - Если пишет абстрактный или короткий запрос ("бот", "crm", "приложение") -> Кратко назови стек и задай развивающий вопрос с опциями (showCard = false).
   - Если прислали URL сайта или название компании -> Проанализируй 2-3 узких места (скорость рендера, сквозные вебхуки, воронку). В КОНЦЕ ответа обязательно напиши: "Оставьте контакт в карточке ниже — ведущий инженер изучит вводные и напишет вам в выбранный мессенджер с детальной схемой решения." (showCard = true).
4. ЯЗЫК: Отвечай строго на языке пользователя (русский, румынский или английский).

Всегда возвращайте строго валидный json:
{
  "reply": "Твой ответ клиенту с вовлекающим вопросом (2-3 предложения).",
  "showCard": true или false
}`;

async function testQuery(input) {
  const start = Date.now();
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: input }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 300,
      temperature: 0.3
    })
  });
  const data = await res.json();
  const elapsed = Date.now() - start;
  console.log(`\nInput: "${input}" (${elapsed}ms)`);
  console.log(data?.choices?.[0]?.message?.content);
}

async function run() {
  const start = Date.now();
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: 'привет' },
        { role: 'assistant', content: JSON.stringify({ reply: 'Здравствуйте. Планируете запуск нового IT-продукта с нуля или хотите автоматизировать текущие бизнес-процессы?', showCard: false }) },
        { role: 'user', content: 'не знаю если честно даже что планирую' }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 300,
      temperature: 0.6
    })
  });
  const data = await res.json();
  const elapsed = Date.now() - start;
  console.log(`Elapsed: ${elapsed}ms`);
  console.log('CONTENT STRING:', JSON.stringify(data?.choices?.[0]?.message?.content));
}
run();
