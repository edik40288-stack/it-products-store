const key = 'sk-b8babcc80c97423b8cb673c58f46bc63';
const prompt = "Ты — Senior System Architect. Всегда возвращайте строго валидный JSON: { \"reply\": \"test\", \"showCard\": true }";
fetch('https://api.deepseek.com/chat/completions', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [{role: 'system', content: prompt}, {role: 'user', content: 'test'}],
    response_format: { type: 'json_object' }
  })
}).then(r => r.json()).then(console.log).catch(console.error);
