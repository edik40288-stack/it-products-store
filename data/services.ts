import { ServiceItem } from '@/types';

// Omit index because it is injected by the component mapping
type ServiceData = Omit<ServiceItem, 'index'>;

export const SERVICES_EN: ServiceData[] = [
  { id: 'development', title: 'Full-cycle Development', subtitle: 'From 0 to release & support', tags: ['React', 'Next.js', 'Node.js', 'AWS'], duration: '4–16 weeks', description: 'We design, build, and ship full-stack digital products — from MVP to enterprise-scale platforms. Architecture, code, CI/CD, and ongoing support included.' },
  { id: 'ai-agents', title: 'AI Negotiators & Chatbots', subtitle: '24/7 intelligent customer engagement', tags: ['GPT-4o', 'NLP', 'Telegram', 'WhatsApp'], duration: '2–6 weeks', description: 'Custom AI agents that qualify leads, answer questions, and close deals — around the clock. Integrated with your CRM and messaging channels.' },
  { id: 'crm', title: 'Custom CRM & Business Digitization', subtitle: 'Your business logic, automated', tags: ['CRM', 'ERP', 'Automation', 'Analytics'], duration: '6–20 weeks', description: 'We build tailor-made CRM and business management systems that reflect your exact workflow — not a generic SaaS that forces you to adapt.' },
  { id: 'llm-integrations', title: 'LLM Integrations & API Connect', subtitle: 'Plug AI into your existing stack', tags: ['OpenAI', 'Claude', 'Gemini', 'APIs'], duration: '1–4 weeks', description: 'We connect the most powerful LLMs to your existing tools and workflows, unlocking AI capabilities without rebuilding your infrastructure.' },
  { id: 'automation', title: 'Process Automation', subtitle: 'Replace manual work with intelligent flows', tags: ['n8n', 'Zapier', 'Python', 'Webhooks'], duration: '1–6 weeks', description: 'From email workflows to complex multi-step pipelines — we automate repetitive processes so your team focuses on what matters.' },
  { id: 'analytics', title: 'Audit, Analytics & CPA', subtitle: 'Turn data into decisions', tags: ['GA4', 'Metrika', 'SQL', 'BI'], duration: '1–3 weeks', description: 'Deep conversion audits, funnel analysis, and performance dashboards. We find where you\'re losing money and fix it.' },
  { id: 'redesign', title: 'Redesign & UI/UX Overhaul', subtitle: 'Before → premium After', tags: ['Figma', 'Motion', 'React', 'A/B'], duration: '3–10 weeks', description: 'We transform outdated interfaces into premium digital experiences that convert better and feel extraordinary to use.' },
  { id: 'security', title: 'Security Audit', subtitle: 'Find vulnerabilities before attackers do', tags: ['OWASP', 'Pentest', 'GDPR', 'SSL'], duration: '1–2 weeks', description: 'Comprehensive security assessment of your web applications. We identify critical vulnerabilities and provide a prioritized remediation plan.' },
];

export const SERVICES_RU: ServiceData[] = [
  { id: 'development', title: 'Разработка под ключ', subtitle: 'От 0 до релиза и поддержки', tags: ['React', 'Next.js', 'Node.js', 'AWS'], duration: '4–16 недель', description: 'Проектируем, разрабатываем и запускаем full-stack продукты — от MVP до корпоративных платформ. Архитектура, код, CI/CD и поддержка включены.' },
  { id: 'ai-agents', title: 'ИИ-агенты и чат-боты', subtitle: 'Умная коммуникация 24/7', tags: ['GPT-4o', 'NLP', 'Telegram', 'WhatsApp'], duration: '2–6 недель', description: 'Кастомные ИИ-агенты, которые квалифицируют лиды, отвечают на вопросы и закрывают сделки круглосуточно. Интеграция с CRM и мессенджерами.' },
  { id: 'crm', title: 'CRM и цифровизация бизнеса', subtitle: 'Ваша бизнес-логика — автоматизирована', tags: ['CRM', 'ERP', 'Автоматизация', 'Аналитика'], duration: '6–20 недель', description: 'Строим CRM и системы управления под ваши уникальные процессы — не дженерик SaaS, а точное цифровое отражение бизнеса.' },
  { id: 'llm-integrations', title: 'LLM-интеграции и API', subtitle: 'Подключите ИИ к вашему стеку', tags: ['OpenAI', 'Claude', 'Gemini', 'API'], duration: '1–4 недели', description: 'Подключаем мощнейшие языковые модели к вашим инструментам и процессам — без перестройки инфраструктуры.' },
  { id: 'automation', title: 'Автоматизация процессов', subtitle: 'Умные потоки вместо ручного труда', tags: ['n8n', 'Zapier', 'Python', 'Webhook'], duration: '1–6 недель', description: 'От email-рассылок до сложных пайплайнов — автоматизируем рутину, чтобы команда занималась важным.' },
  { id: 'analytics', title: 'Аудит, аналитика и CPA', subtitle: 'Превращаем данные в решения', tags: ['GA4', 'Метрика', 'SQL', 'BI'], duration: '1–3 недели', description: 'Глубокий аудит конверсии, анализ воронки и дашборды эффективности. Находим где теряются деньги — и исправляем.' },
  { id: 'redesign', title: 'Редизайн и UI/UX', subtitle: 'До → премиальное После', tags: ['Figma', 'Motion', 'React', 'A/B'], duration: '3–10 недель', description: 'Превращаем устаревшие интерфейсы в премиальный цифровой опыт, который лучше конвертит и восхищает пользователей.' },
  { id: 'security', title: 'Аудит безопасности', subtitle: 'Найдите уязвимости до атакующих', tags: ['OWASP', 'Pentest', 'GDPR', 'SSL'], duration: '1–2 недели', description: 'Комплексная оценка безопасности веб-приложений. Выявляем критические уязвимости и даём приоритетный план устранения.' },
];

export const SERVICES_RO: ServiceData[] = SERVICES_EN; // fallback to EN for Romanian for now

export function getServices(locale: string): ServiceData[] {
  if (locale === 'ru') return SERVICES_RU;
  if (locale === 'ro') return SERVICES_RO;
  return SERVICES_EN;
}
