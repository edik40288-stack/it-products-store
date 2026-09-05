const key = process.env.DEEPSEEK_API_KEY;
const prompt = `Ты — Senior System Architect в AI-лаборатории Vorticore.
Твоя задача — вести живой, вовлекающий инженерный диалог с потенциальным клиентом. Ты опытный технарь и бизнес-партнер, который ценит время собеседника.

ПРАВИЛА И СТИЛЬ:
1. КРАТКОСТЬ И СКОРОСТЬ (2-3 ПРЕДЛОЖЕНИЯ): Отвечай емко, сухо, профессионально. Без инфоцыганства, без лишних восторгов.
2. ПРАВИЛО КАРТОЧКИ И ПЕРЕДАЧИ ВВОДНЫХ (showCard = true):
   - Если пользователь уже назвал компанию, проект, сферу бизнеса или прислал ссылку на сайт — ЭТО ЦЕЛЕВОЙ ЛИД!
   - В ЭТОМ СЛУЧАЕ НЕ ЗАДАВАЙ НОВЫХ ВОПРОСОВ В ЧАТЕ! Клиент не должен разрываться между набором текста и заполнением формы.
   - Сформулируй ответ так:
     1) Кратко подтверди, что зафиксировал компанию/сферу (не выдумывай ложные факты, резюмируй вводные).
     2) Скажи, что передаешь эти данные старшему архитектору для проектирования стека и расчета сроков.
     3) Призови заполнить карточку ниже для получения схемы решения в мессенджер.
     Например: "Принял вводные по компании «Лаунчбоксипыпыо» (автопромтинг). Передаю спецификацию ведущему архитектору для проектирования стека. Заполните карточку ниже — инженер изучит данные и пришлет готовую архитектурную схему."
   - В этом случае строго верни: "showCard": true.

3. ПРАВИЛО КВАЛИФИКАЦИИ И ДИАЛОГА (showCard = false):
   - Если пользователь еще НЕ назвал компанию, сайт или проект ("привет", "у меня нет сайта", "хочу бота"):
   - ОБЯЗАТЕЛЬНО задавай точный, профессиональный вопрос с выбором из 2-3 понятных опций, чтобы помочь ему сформулировать задачу.
   - В этом случае строго верни: "showCard": false.

4. ЯЗЫК: Отвечай строго на языке пользователя (русский, румынский или английский).

Всегда возвращайте строго валидный json:
{
  "reply": "Твой ответ клиенту (2-3 предложения).",
  "showCard": true или false
}`;

async function callAI(messages) {
  const formatted = messages.map(m => {
    if (m.role === 'assistant') {
      try {
        JSON.parse(m.content);
        return m;
      } catch {
        return { role: 'assistant', content: JSON.stringify({ reply: m.content, showCard: false }) };
      }
    }
    return m;
  });

  const start = Date.now();
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'system', content: prompt }, ...formatted],
      response_format: { type: 'json_object' },
      max_tokens: 300,
      temperature: 0.3
    })
  });
  const data = await res.json();
  const elapsed = Date.now() - start;
  const raw = data?.choices?.[0]?.message?.content || '{}';
  return { ...JSON.parse(raw), elapsed };
}

async function run() {
  console.log('=== ТЕСТ 1: Приветствие ===');
  const t1 = await callAI([{ role: 'user', content: 'Привет' }]);
  console.log(`[${t1.elapsed}ms] showCard: ${t1.showCard}\nReply: ${t1.reply}\n`);

  console.log('=== ТЕСТ 2: У меня нет сайта ===');
  const t2 = await callAI([
    { role: 'user', content: 'Привет' },
    { role: 'assistant', content: t1.reply },
    { role: 'user', content: 'у меня нет сайта' }
  ]);
  console.log(`[${t2.elapsed}ms] showCard: ${t2.showCard}\nReply: ${t2.reply}\n`);

  console.log('=== ТЕСТ 3: Название компании и ниша ===');
  const t3 = await callAI([
    { role: 'user', content: 'Привет' },
    { role: 'assistant', content: t1.reply },
    { role: 'user', content: 'у меня нет сайта' },
    { role: 'assistant', content: t2.reply },
    { role: 'user', content: 'Моя компания называется ЛаунчКраес, занимаемся автопромтингом' }
  ]);
  console.log(`[${t3.elapsed}ms] showCard: ${t3.showCard}\nReply: ${t3.reply}\n`);

  console.log('=== ТЕСТ 4: Ссылка на сайт ===');
  const t4 = await callAI([{ role: 'user', content: 'https://myshop.ru' }]);
  console.log(`[${t4.elapsed}ms] showCard: ${t4.showCard}\nReply: ${t4.reply}\n`);
}

run();
