import { ServiceItem } from '@/types';

// Omit index because it is injected by the component mapping
type ServiceData = Omit<ServiceItem, 'index'>;

export const SERVICES_RU: ServiceData[] = [
  {
    id: 'development',
    title: 'Разработка веб-сервисов и цифровых продуктов',
    subtitle: 'От 0 до релиза и поддержки',
    tags: ['React', 'Next.js', 'Node.js', 'PostgreSQL'],
    duration: '4–16 недель',
    categoryBadge: 'MINDCORE // FULL-STACK PRODUCTION',
    stack: 'Стек: Next.js • TypeScript • Node.js • PostgreSQL • Docker',
    description: 'Проектируем и создаем масштабируемые веб-платформы, SaaS-сервисы и мобильные веб-приложения с нуля. Обеспечиваем чистую архитектуру, высокую скорость отклика и бесшовный деплой.',
    metrics: [
      { title: 'High Load Ready', desc: 'Архитектура выдерживает пиковые нагрузки без просадки скорости' },
      { title: '99.9% Uptime', desc: 'Отказоустойчивые кластеры и автоматический мониторинг 24/7', highlight: true },
      { title: 'Clean Code & CI/CD', desc: 'Автотесты, версионирование и легкая передача внутренней команде' }
    ],
    features: [
      {
        title: 'Фронтенд и бэкенд на современном стеке',
        desc: 'Разработка на Next.js/React с серверным рендерингом (SSR), микросервисной архитектурой и безопасными REST/GraphQL API.'
      },
      {
        title: 'Полный цикл: от прототипа до релиза и SLA',
        desc: 'Включает проектирование БД, настройку облачной инфраструктуры (AWS/Vercel/Hetzner), защиту от DDoS и техническое сопровождение.'
      }
    ],
    footerNote: 'Оцениваем требования проекта и формируем архитектурный план',
    ctaText: 'Обсудить задачу →'
  },
  {
    id: 'ai-agents',
    title: 'Автономные AI-агенты и умные консультанты 24/7',
    subtitle: 'Умная коммуникация 24/7',
    tags: ['GPT-4o', 'Claude 3.5', 'Python', 'LangChain'],
    duration: '2–6 недель',
    categoryBadge: 'MINDCORE // CONVERSATIONAL AI & AGENTS',
    stack: 'Стек: GPT-4o • Claude 3.5 • Python • LangChain • Vector DB',
    description: 'Создаем кастомных ИИ-ассистентов с обучением на базе знаний вашего бизнеса. Агенты квалифицируют входящий трафик, отвечают на сложные вопросы и закрывают заявки в мессенджерах и на сайте.',
    metrics: [
      { title: 'Instant Reply < 1s', desc: 'Мгновенные содержательные ответы в любое время дня и ночи' },
      { title: '+35% Conversion', desc: 'Удержание теплых лидов без ожидания ответа живого менеджера', highlight: true },
      { title: 'RAG Knowledge Base', desc: 'Точные ответы строго по регламентам и прайсам вашей компании' }
    ],
    features: [
      {
        title: 'Глубокая интеграция с CRM и мессенджерами',
        desc: 'Бот автоматически заполняет карточки клиентов в amoCRM/Bitrix24, передает историю диалога и зовет менеджера при необходимости.'
      },
      {
        title: 'Сложные сценарии диалога и допродажи',
        desc: 'ИИ ведет клиента по воронке, предлагает релевантные апсейлы, отправляет КП и оформляет заказы прямо в чате.'
      }
    ],
    footerNote: 'Подготавливаем демонстрационного агента на базе ваших материалов',
    ctaText: 'Обсудить задачу →'
  },
  {
    id: 'crm',
    title: 'Кастомные CRM и ERP-системы под бизнес-логику',
    subtitle: 'Ваша бизнес-логика — автоматизирована',
    tags: ['PostgreSQL', 'Node.js', 'React', 'Redis'],
    duration: '6–20 недель',
    categoryBadge: 'MINDCORE // CUSTOM ENTERPRISE SYSTEMS',
    stack: 'Стек: PostgreSQL • Node.js • React • Tailwind • Redis',
    description: 'Разрабатываем индивидуальные системы управления продажами, клиентами и проектами. Без ограничений коробочного софта и абонентской платы за каждого сотрудника.',
    metrics: [
      { title: '100% Custom Logic', desc: 'Полная адаптация под уникальные регламенты вашего бизнеса' },
      { title: 'Zero Monthly Fees', desc: 'Программный продукт полностью принадлежит вам, без арендных плат', highlight: true },
      { title: 'Role-Based Access', desc: 'Разграничение прав доступа, сквозное логирование и аудит действий' }
    ],
    features: [
      {
        title: 'Единая панель управления всеми отделами',
        desc: 'Сквозная воронка от первого клика до повторных продаж, учет сделок, задач сотрудников и автоматический расчет KPI.'
      },
      {
        title: 'Модульная архитектура с запасом масштабирования',
        desc: 'Возможность подключать новые модули (склад, бухгалтерия, телефония, логистика) по мере роста компании.'
      }
    ],
    footerNote: 'Проводим аудит бизнес-процессов и составляем детальное ТЗ',
    ctaText: 'Обсудить задачу →'
  },
  {
    id: 'llm-integrations',
    title: 'Внедрение больших языковых моделей (LLM) в сервисы',
    subtitle: 'Подключите ИИ к вашему стеку',
    tags: ['OpenAI', 'Anthropic', 'Pinecone', 'FastAPI'],
    duration: '1–4 недели',
    categoryBadge: 'MINDCORE // LLM & AI ARCHITECTURE',
    stack: 'Стек: OpenAI • Anthropic • Pinecone • FastAPI • Embeddings',
    description: 'Подключаем передовые нейросети к существующим базам данных, корпоративным приложениям и сайтам. Автоматизируем анализ документов, генерацию контента и обработку данных.',
    metrics: [
      { title: 'Enterprise Security', desc: 'Защита данных: запросы не используются для обучения публичных моделей' },
      { title: '10x Faster Workflows', desc: 'Секундная обработка договоров, отчетов и терабайтов клиентских данных', highlight: true },
      { title: 'Custom Embeddings', desc: 'Векторный поиск по закрытой корпоративной базе знаний' }
    ],
    features: [
      {
        title: 'Интеллектуальный анализ и саммаризация документов',
        desc: 'Автоматический парсинг PDF, договоров и таблиц с извлечением ключевых параметров и проверкой рисков.'
      },
      {
        title: 'Генеративные AI-интерфейсы и копайлоты для сотрудников',
        desc: 'Встраивание AI-помощников в админ-панели для ускорения рутинных операций сотрудников в 5-10 раз.'
      }
    ],
    footerNote: 'Рассчитываем экономику токенов и выбираем оптимальную модель под задачу',
    ctaText: 'Обсудить задачу →'
  },
  {
    id: 'automation',
    title: 'Интеграция систем и автоматизация процессов',
    subtitle: 'Умные потоки вместо ручного труда',
    tags: ['API', 'Webhooks', 'n8n', 'Python'],
    duration: '1–6 недель',
    categoryBadge: 'MINDCORE // WORKFLOW AUTOMATION',
    stack: 'Стек: API • Webhooks • n8n • Python',
    description: 'Проектируем отказоустойчивые сценарии передачи данных между сайтом, CRM, платежными шлюзами и складским учетом. Убираем необходимость ручного сведения таблиц и баз данных.',
    metrics: [
      { title: 'Zero Data Loss', desc: 'Очереди сообщений и валидация входящих запросов' },
      { title: 'Real-time Sync', desc: 'Мгновенное обновление остатков, статусов и оплат', highlight: true },
      { title: 'Custom API', desc: 'Связка софта даже без стандартных интеграций' }
    ],
    features: [
      {
        title: 'Синхронизация внешних и внутренних сервисов',
        desc: 'Связываем сайт с ERP/CRM, банками и службами доставки. Передача данных идет по защищенным протоколам с автоматическим повтором при тайм-аутах.'
      },
      {
        title: 'Автоматизация документооборота и оповещений',
        desc: 'Генерация счетов, накладных и договоров на лету. Маршрутизация уведомлений сотрудникам в Telegram/Slack и клиентам по SMS/Email.'
      }
    ],
    footerNote: 'Анализируем текущий стек и проектируем схему интеграций',
    ctaText: 'Обсудить задачу →'
  },
  {
    id: 'analytics',
    title: 'Глубокий аудит воронки продаж и сквозная аналитика',
    subtitle: 'Превращаем данные в решения',
    tags: ['GA4', 'BigQuery', 'SQL', 'PowerBI'],
    duration: '1–3 недели',
    categoryBadge: 'MINDCORE // DATA & CONVERSION AUDIT',
    stack: 'Стек: GA4 • BigQuery • SQL • PowerBI • Metrika',
    description: 'Находим скрытые точки потери трафика, настраиваем сквозное отслеживание каждого доллара и строим понятные дашборды для принятия управленческих решений.',
    metrics: [
      { title: 'End-to-End Tracking', desc: 'Отслеживание клиента от первого рекламного клика до LTV и повторных покупок' },
      { title: '+20-40% ROMI', desc: 'Отключение неэффективных каналов и перераспределение бюджета в прибыль', highlight: true },
      { title: 'Live Dashboards', desc: 'Автоматическое сведение метрик без ручных отчетов в Excel' }
    ],
    features: [
      {
        title: 'Аудит конверсии и поиск узких мест (Bottlenecks)',
        desc: 'Детальный разбор пользовательских сессий, тепловых карт и UX-барьеров, снижающих конверсию формы заявки.'
      },
      {
        title: 'Сквозная аналитика с атрибуцией сделок',
        desc: 'Настройка передачи оффлайн-конверсий и статусов из CRM в рекламные кабинеты для точного обучения рекламных алгоритмов.'
      }
    ],
    footerNote: 'Предоставляем подробный отчет с точками роста конверсии за 5 дней',
    ctaText: 'Обсудить задачу →'
  },
  {
    id: 'redesign',
    title: 'Премиальный редизайн и разработка дизайн-систем',
    subtitle: 'До → премиальное После',
    tags: ['Figma', 'Design Systems', 'WebGL', 'Motion'],
    duration: '3–10 недель',
    categoryBadge: 'MINDCORE // UI/UX & PRODUCT DESIGN',
    stack: 'Стек: Figma • Design Systems • WebGL • Framer Motion',
    description: 'Трансформируем устаревшие интерфейсы в высококонверсионные цифровые продукты с безупречной эстетикой, кинематографичной микроанимацией и адаптивностью.',
    metrics: [
      { title: 'Design System First', desc: 'Модульные компоненты для быстрой сборки новых страниц и фич' },
      { title: '+45% Retention', desc: 'Продуманный UX, в котором пользователи легко находят нужный функционал', highlight: true },
      { title: '60 FPS Motion', desc: 'Плавные микроанимации и шейдерные эффекты, формирующие премиум-ощущение' }
    ],
    features: [
      {
        title: 'UX-исследования и проектирование пользовательских путей',
        desc: 'Анализ конкурентов, создание кликабельных интерактивных прототипов и тестирование логики до написания кода.'
      },
      {
        title: 'Полный UI-кит и адаптивная верстка',
        desc: 'Дизайн под все разрешения экранов, поддержка темной темы, спецификации для разработчиков и дизайн-токены.'
      }
    ],
    footerNote: 'Подготавливаем концепт главной страницы и интерактивный прототип',
    ctaText: 'Обсудить задачу →'
  },
  {
    id: 'security',
    title: 'Комплексный аудит безопасности и стресс-тестирование',
    subtitle: 'Найдите уязвимости до атакующих',
    tags: ['OWASP', 'Pentesting', 'SSL/TLS', 'Cloudflare'],
    duration: '1–2 недели',
    categoryBadge: 'MINDCORE // CYBERSECURITY & COMPLIANCE',
    stack: 'Стек: OWASP • Pentesting • Burp Suite • SSL/TLS • Cloudflare',
    description: 'Выявляем критические уязвимости веб-приложений, API и серверов до того, как ими воспользуются злоумышленники. Защищаем базы данных и пользовательские данные.',
    metrics: [
      { title: 'OWASP Top 10', desc: 'Проверка на SQL-инъекции, XSS, CSRF, утечки авторизации и прав доступа' },
      { title: 'Zero Vulnerabilities', desc: 'Полная изоляция критических контуров и шифрование данных', highlight: true },
      { title: 'Compliance Ready', desc: 'Соответствие международным стандартам безопасности и регламентам GDPR' }
    ],
    features: [
      {
        title: 'Пентестинг и симуляция реальных атак (Black Box / White Box)',
        desc: 'Ручное и автоматизированное тестирование устойчивости сервиса к внешним угрозам и взломам.'
      },
      {
        title: 'Пошаговый план закрытия уязвимостей и защита инфраструктуры',
        desc: 'Детальный отчет для разработчиков с кодом исправлений, настройкой WAF и защитой от DDoS-атак.'
      }
    ],
    footerNote: 'Предоставляем официальный отчет о защищенности с подтверждением аудита',
    ctaText: 'Обсудить задачу →'
  }
];

export const SERVICES_EN: ServiceData[] = [
  {
    id: 'development',
    title: 'Full-Cycle Web Services & Digital Products',
    subtitle: 'From 0 to release & support',
    tags: ['React', 'Next.js', 'Node.js', 'PostgreSQL'],
    duration: '4–16 weeks',
    categoryBadge: 'MINDCORE // FULL-STACK PRODUCTION',
    stack: 'Stack: Next.js • TypeScript • Node.js • PostgreSQL • Docker',
    description: 'We engineer and build scalable web platforms, SaaS apps, and mobile web systems from scratch with clean architecture, sub-second latency, and automated deployment.',
    metrics: [
      { title: 'High Load Ready', desc: 'Architecture engineered to withstand massive traffic spikes with zero latency drop' },
      { title: '99.9% Uptime', desc: 'Fault-tolerant multi-zone clusters and 24/7 automated monitoring', highlight: true },
      { title: 'Clean Code & CI/CD', desc: 'Automated test coverage, strict versioning, and seamless developer handoff' }
    ],
    features: [
      {
        title: 'Modern Front-end & Back-end Architecture',
        desc: 'Built on Next.js/React with Server-Side Rendering (SSR), microservices, and secure REST/GraphQL APIs.'
      },
      {
        title: 'Full Lifecycle: From Blueprint to SLA Maintenance',
        desc: 'Includes relational DB modeling, cloud infrastructure (AWS/Vercel/Hetzner), DDoS mitigation, and continuous monitoring.'
      }
    ],
    footerNote: 'We review requirements and deliver an architectural roadmap within 24h',
    ctaText: 'Discuss task →'
  },
  {
    id: 'ai-agents',
    title: 'Autonomous AI Agents & 24/7 Smart Negotiators',
    subtitle: '24/7 intelligent customer engagement',
    tags: ['GPT-4o', 'Claude 3.5', 'Python', 'LangChain'],
    duration: '2–6 weeks',
    categoryBadge: 'MINDCORE // CONVERSATIONAL AI & AGENTS',
    stack: 'Stack: GPT-4o • Claude 3.5 • Python • LangChain • Vector DB',
    description: 'Custom AI assistants fine-tuned on your business knowledge base. They qualify leads, solve complex client queries, and close deals in messaging apps and web chat 24/7.',
    metrics: [
      { title: 'Instant Reply < 1s', desc: 'Immediate, accurate responses around the clock in any language' },
      { title: '+35% Conversion', desc: 'Captures and retains warm leads with zero live agent wait times', highlight: true },
      { title: 'RAG Knowledge Base', desc: 'Responses strictly grounded in your company regulations, catalogs, and pricing' }
    ],
    features: [
      {
        title: 'Deep CRM & Omni-channel Messaging Integration',
        desc: 'AI automatically populates client CRM deals, logs full chat transcripts, and seamlessly escalates to humans when needed.'
      },
      {
        title: 'Multi-step Sales Scenarios & Upsells',
        desc: 'Guides customers through sales funnels, recommends contextual add-ons, issues invoices, and schedules consultations.'
      }
    ],
    footerNote: 'We prepare an interactive proof-of-concept agent based on your data in 3 days',
    ctaText: 'Discuss task →'
  },
  {
    id: 'crm',
    title: 'Custom CRM & Business Management Systems',
    subtitle: 'Your business logic, automated',
    tags: ['PostgreSQL', 'Node.js', 'React', 'Redis'],
    duration: '6–20 weeks',
    categoryBadge: 'MINDCORE // CUSTOM ENTERPRISE SYSTEMS',
    stack: 'Stack: PostgreSQL • Node.js • React • Tailwind • Redis',
    description: 'Tailor-made software that models your exact business logic — eliminating generic SaaS constraints and per-seat monthly license fees forever.',
    metrics: [
      { title: '100% Custom Logic', desc: 'Tailored specifically to your company operational workflows and business model' },
      { title: 'Zero Monthly Fees', desc: 'You own 100% of the intellectual property and code with zero recurring licenses', highlight: true },
      { title: 'Role-Based Access', desc: 'Granular permissions, encrypted audit trails, and strict data governance' }
    ],
    features: [
      {
        title: 'Unified Operational Command Dashboard',
        desc: 'End-to-end sales pipelines from first touch to repeat orders, employee task management, and automatic KPI tracking.'
      },
      {
        title: 'Modular High-Scale Architecture',
        desc: 'Seamlessly add new functional modules (inventory, accounting, telephony, fulfillment) as your company expands.'
      }
    ],
    footerNote: 'We audit business processes and prepare a comprehensive technical specification',
    ctaText: 'Discuss task →'
  },
  {
    id: 'llm-integrations',
    title: 'Large Language Model (LLM) Integration & APIs',
    subtitle: 'Plug AI into your existing stack',
    tags: ['OpenAI', 'Anthropic', 'Pinecone', 'FastAPI'],
    duration: '1–4 weeks',
    categoryBadge: 'MINDCORE // LLM & AI ARCHITECTURE',
    stack: 'Stack: OpenAI • Anthropic • Pinecone • FastAPI • Embeddings',
    description: 'Connect state-of-the-art LLMs into your databases, internal apps, and consumer portals. Automate document ingestion, intelligent search, and data processing.',
    metrics: [
      { title: 'Enterprise Security', desc: 'Data privacy: queries are strictly isolated and never used for public model training' },
      { title: '10x Faster Workflows', desc: 'Near-instant processing of legal contracts, invoices, and massive customer datasets', highlight: true },
      { title: 'Custom Embeddings', desc: 'Semantic search over proprietary private company documents and repositories' }
    ],
    features: [
      {
        title: 'Intelligent Document Parsing & Risk Extraction',
        desc: 'Automates extraction of key terms, obligations, and anomalies from PDFs, spreadsheets, and scanned contracts.'
      },
      {
        title: 'Internal AI Copilots & Admin Enhancements',
        desc: 'Embeds AI productivity copilot widgets into employee admin interfaces to accelerate repetitive tasks 5–10x.'
      }
    ],
    footerNote: 'We analyze token economics and select the optimal model architecture for your use case',
    ctaText: 'Discuss task →'
  },
  {
    id: 'automation',
    title: 'System Integration & Workflow Automation',
    subtitle: 'Replace manual work with intelligent flows',
    tags: ['API', 'Webhooks', 'n8n', 'Python'],
    duration: '1–6 weeks',
    categoryBadge: 'MINDCORE // WORKFLOW AUTOMATION',
    stack: 'Stack: API • Webhooks • n8n • Python',
    description: 'We architect resilient data pipelines between your website, CRM, payment gateways, and warehouse inventory. Eliminate manual spreadsheets and human data entry.',
    metrics: [
      { title: 'Zero Data Loss', desc: 'Message queuing, retry logic, and strict payload validation' },
      { title: 'Real-time Sync', desc: 'Instant synchronization of inventory, payment statuses, and orders', highlight: true },
      { title: 'Custom API', desc: 'Connects proprietary legacy software even without native web integrations' }
    ],
    features: [
      {
        title: 'External & Internal Service Synchronization',
        desc: 'Bridges website transactions with ERP/CRM, banking gateways, and delivery couriers via secured protocols with retry mechanisms.'
      },
      {
        title: 'Automated Document Generation & Instant Alerts',
        desc: 'Generates PDF invoices, contracts, and shipping labels dynamically while routing notifications to Telegram, Slack, and SMS.'
      }
    ],
    footerNote: 'We analyze your current stack and design a complete integration blueprint',
    ctaText: 'Discuss task →'
  },
  {
    id: 'analytics',
    title: 'Funnel Optimization, Deep Analytics & CPA Audit',
    subtitle: 'Turn data into decisions',
    tags: ['GA4', 'BigQuery', 'SQL', 'PowerBI'],
    duration: '1–3 weeks',
    categoryBadge: 'MINDCORE // DATA & CONVERSION AUDIT',
    stack: 'Stack: GA4 • BigQuery • SQL • PowerBI • Metrika',
    description: 'Identify hidden traffic leaks, configure end-to-end attribution for every dollar spent, and construct intuitive executive dashboards for data-driven decisions.',
    metrics: [
      { title: 'End-to-End Tracking', desc: 'Tracks customer journeys from first ad impression to lifetime value and repeat purchase' },
      { title: '+20-40% ROMI', desc: 'Eliminates wasted ad spend and reallocates budget into top-converting channels', highlight: true },
      { title: 'Live Dashboards', desc: 'Automated real-time KPI dashboards without manual spreadsheet compilation' }
    ],
    features: [
      {
        title: 'Conversion Bottleneck Analysis & UX Diagnostics',
        desc: 'Comprehensive evaluation of user recordings, heatmaps, and checkout friction points that depress conversion rates.'
      },
      {
        title: 'Multi-touch Attribution & Offline Conversion Feeds',
        desc: 'Automates CRM status feedback into ad networks (Google/Meta) to train machine-learning bidding algorithms.'
      }
    ],
    footerNote: 'We deliver an actionable growth audit with prioritized conversion wins within 5 days',
    ctaText: 'Discuss task →'
  },
  {
    id: 'redesign',
    title: 'Premium UI/UX Redesign & Design Systems',
    subtitle: 'Before → premium After',
    tags: ['Figma', 'Design Systems', 'WebGL', 'Motion'],
    duration: '3–10 weeks',
    categoryBadge: 'MINDCORE // UI/UX & PRODUCT DESIGN',
    stack: 'Stack: Figma • Design Systems • WebGL • Framer Motion',
    description: 'We transform outdated interfaces into high-converting digital flagships with cinematic micro-interactions, dark luxury aesthetics, and perfect responsiveness.',
    metrics: [
      { title: 'Design System First', desc: 'Scalable UI component library for rapid feature development and brand consistency' },
      { title: '+45% Retention', desc: 'Intuitive user experiences that reduce friction and maximize daily user engagement', highlight: true },
      { title: '60 FPS Motion', desc: 'Silky smooth physics-based animations and custom WebGL shaders for a tier-1 feel' }
    ],
    features: [
      {
        title: 'UX Research & Interactive Prototyping',
        desc: 'In-depth competitor analysis, user journey mapping, and interactive prototypes tested before engineering begins.'
      },
      {
        title: 'Complete UI Kit & Developer-Ready Tokens',
        desc: 'Pixel-perfect responsiveness across all screen sizes, dark mode palettes, and design token exports for engineering teams.'
      }
    ],
    footerNote: 'We craft a bespoke homepage concept and interactive clickable prototype',
    ctaText: 'Discuss task →'
  },
  {
    id: 'security',
    title: 'Comprehensive Security Audit & Pentesting',
    subtitle: 'Find vulnerabilities before attackers do',
    tags: ['OWASP', 'Pentesting', 'SSL/TLS', 'Cloudflare'],
    duration: '1–2 weeks',
    categoryBadge: 'MINDCORE // CYBERSECURITY & COMPLIANCE',
    stack: 'Stack: OWASP • Pentesting • Burp Suite • SSL/TLS • Cloudflare',
    description: 'We uncover critical vulnerabilities in web applications, APIs, and cloud infrastructure before bad actors exploit them. Safeguard user data and maintain compliance.',
    metrics: [
      { title: 'OWASP Top 10', desc: 'Exhaustive audit for SQLi, XSS, CSRF, broken access control, and auth bypasses' },
      { title: 'Zero Vulnerabilities', desc: 'Complete hardening of critical network perimeters and database encryption' },
      { title: 'Compliance Ready', desc: 'Prepares systems for international security standards and strict GDPR compliance', highlight: true }
    ],
    features: [
      {
        title: 'Penetration Testing & Attack Simulation (Black/White Box)',
        desc: 'Rigorous manual and automated simulated cyber-attacks to evaluate real-world resilience against intrusion.'
      },
      {
        title: 'Actionable Remediation Blueprint & Perimeter Hardening',
        desc: 'Step-by-step developer remediation code, Web Application Firewall (WAF) tuning, and anti-DDoS configuration.'
      }
    ],
    footerNote: 'We provide an official vulnerability assessment certificate and prioritized fix list',
    ctaText: 'Discuss task →'
  }
];

export const SERVICES_RO: ServiceData[] = [
  {
    id: 'development',
    title: 'Dezvoltare Servicii Web & Produse Digitale',
    subtitle: 'De la 0 la lansare și suport',
    tags: ['React', 'Next.js', 'Node.js', 'PostgreSQL'],
    duration: '4–16 săptămâni',
    categoryBadge: 'MINDCORE // FULL-STACK PRODUCTION',
    stack: 'Stack: Next.js • TypeScript • Node.js • PostgreSQL • Docker',
    description: 'Proiectăm și construim platforme web scalabile, servicii SaaS și aplicații web de la zero, asigurând arhitectură curată, viteză maximă și deploy automatizat.',
    metrics: [
      { title: 'High Load Ready', desc: 'Arhitectură proiectată pentru trafic masiv fără încetiniri de performanță' },
      { title: '99.9% Uptime', desc: 'Cluster de servere cu toleranță la erori și monitorizare automată 24/7', highlight: true },
      { title: 'Clean Code & CI/CD', desc: 'Teste automate, versionare strictă și transfer facil către echipa internă' }
    ],
    features: [
      {
        title: 'Front-end & Back-end pe tehnologii moderne',
        desc: 'Dezvoltare în Next.js/React cu Server-Side Rendering (SSR), microservicii și API-uri sigure REST/GraphQL.'
      },
      {
        title: 'Ciclu complet: de la prototip la lansare și SLA',
        desc: 'Include modelarea bazelor de date, infrastructură cloud (AWS/Vercel/Hetzner), protecție DDoS și mentenanță continuă.'
      }
    ],
    footerNote: 'Evaluăm cerințele proiectului și livrăm planul arhitectural în 24 de ore',
    ctaText: 'Discută sarcina →'
  },
  {
    id: 'ai-agents',
    title: 'Agenți AI Autonomi și Consultanți Smart 24/7',
    subtitle: 'Implicare inteligentă 24/7',
    tags: ['GPT-4o', 'Claude 3.5', 'Python', 'LangChain'],
    duration: '2–6 săptămâni',
    categoryBadge: 'MINDCORE // CONVERSATIONAL AI & AGENTS',
    stack: 'Stack: GPT-4o • Claude 3.5 • Python • LangChain • Vector DB',
    description: 'Dezvoltăm asistenți AI personalizați, antrenați pe baza de cunoștințe a afacerii tale. Ei califică lead-urile, răspund la întrebări complexe și închid vânzări 24/7.',
    metrics: [
      { title: 'Instant Reply < 1s', desc: 'Răspunsuri instantanee și precise la orice oră din zi și din noapte' },
      { title: '+35% Conversie', desc: 'Reținerea lead-urilor calde fără timp de așteptare pentru un operator', highlight: true },
      { title: 'RAG Knowledge Base', desc: 'Răspunsuri strict bazate pe regulamentele și prețurile companiei tale' }
    ],
    features: [
      {
        title: 'Integrare profundă cu CRM și aplicații de mesagerie',
        desc: 'Robotul completează automat datele în CRM, salvează istoricul conversației și redirecționează către om la nevoie.'
      },
      {
        title: 'Scenarii avansate de vânzare și propuneri de upsell',
        desc: 'Ghidează utilizatorul prin pâlnie, recomandă servicii complementare, trimite oferte și preia comenzi direct în chat.'
      }
    ],
    footerNote: 'Pregătim un agent demonstrativ bazat pe datele tale în 3 zile',
    ctaText: 'Discută sarcina →'
  },
  {
    id: 'crm',
    title: 'Sisteme CRM & ERP Personalizate pentru Business',
    subtitle: 'Logica afacerii tale, automatizată',
    tags: ['PostgreSQL', 'Node.js', 'React', 'Redis'],
    duration: '6–20 săptămâni',
    categoryBadge: 'MINDCORE // CUSTOM ENTERPRISE SYSTEMS',
    stack: 'Stack: PostgreSQL • Node.js • React • Tailwind • Redis',
    description: 'Dezvoltăm soluții software personalizate pentru gestiunea vânzărilor, clienților și comenzilor — fără limitările soluțiilor prefabricate și fără taxe lunare per utilizator.',
    metrics: [
      { title: '100% Custom Logic', desc: 'Adaptare completă la fluxurile operaționale unice ale companiei tale' },
      { title: 'Zero Taxe Lunare', desc: 'Ești proprietarul unic al codului sursă, fără abonamente recurente', highlight: true },
      { title: 'Role-Based Access', desc: 'Niveluri granulare de acces, logare criptată și audit al activităților' }
    ],
    features: [
      {
        title: 'Panou centralizat de control operațional',
        desc: 'Pâlnie completă de la primul contact la achiziții repetate, evidența sarcinilor și calculul automat al indicatorilor KPI.'
      },
      {
        title: 'Arhitectură modulară pregătită pentru scalare',
        desc: 'Posibilitatea de a conecta oricând module noi (depozit, contabilitate, telefonie, curierat) pe măsură ce afacerea crește.'
      }
    ],
    footerNote: 'Audităm procesele companiei și elaborăm caietul de sarcini detaliat',
    ctaText: 'Discută sarcina →'
  },
  {
    id: 'llm-integrations',
    title: 'Integrare Modele Lingvistice Mari (LLM) & API',
    subtitle: 'Conectează AI la stack-ul tău',
    tags: ['OpenAI', 'Anthropic', 'Pinecone', 'FastAPI'],
    duration: '1–4 săptămâni',
    categoryBadge: 'MINDCORE // LLM & AI ARCHITECTURE',
    stack: 'Stack: OpenAI • Anthropic • Pinecone • FastAPI • Embeddings',
    description: 'Conectăm rețele neuronale avansate la bazele de date și aplicațiile interne existente. Automatizăm analiza documentelor, sinteza informației și procesarea datelor.',
    metrics: [
      { title: 'Enterprise Security', desc: 'Datele tale sunt izolate și nu sunt folosite pentru antrenarea modelelor publice' },
      { title: 'Eficiență x10', desc: 'Procesare în câteva secunde a contractelor, rapoartelor și bazelor de date', highlight: true },
      { title: 'Custom Embeddings', desc: 'Căutare semantică în documentele private ale companiei' }
    ],
    features: [
      {
        title: 'Analiză inteligentă și sintetizare documente',
        desc: 'Extragerea automată a termenilor-cheie, clauzelor și anomaliilor din fișiere PDF, contracte și tabele.'
      },
      {
        title: 'Copiloți AI integrați în panoul administrativ',
        desc: 'Asistenți AI integrați în panourile interne pentru a accelera operațiunile zilnice ale angajaților de 5-10 ori.'
      }
    ],
    footerNote: 'Calculăm economia de costuri per token și alegem arhitectura optimă',
    ctaText: 'Discută sarcina →'
  },
  {
    id: 'automation',
    title: 'Integrarea Sistemelor și Automatizarea Fluxurilor',
    subtitle: 'Înlocuiește munca manuală cu fluxuri inteligente',
    tags: ['API', 'Webhooks', 'n8n', 'Python'],
    duration: '1–6 săptămâni',
    categoryBadge: 'MINDCORE // WORKFLOW AUTOMATION',
    stack: 'Stack: API • Webhooks • n8n • Python',
    description: 'Proiectăm scenarii sigure de transfer al datelor între site, CRM, procesatori de plăți și gestiunea stocurilor. Eliminăm complet introducerea manuală a datelor.',
    metrics: [
      { title: 'Zero Data Loss', desc: 'Cozi de mesaje, validare automată și reîncercare la timeout' },
      { title: 'Real-time Sync', desc: 'Actualizare instantanee a stocurilor, plăților și comenzilor', highlight: true },
      { title: 'Custom API', desc: 'Conectăm sisteme software chiar și fără integrări native preexistente' }
    ],
    features: [
      {
        title: 'Sincronizarea serviciilor externe și interne',
        desc: 'Conectăm site-ul cu ERP/CRM, bănci și servicii de curierat prin protocoale sigure cu mecanisme de auto-recovery.'
      },
      {
        title: 'Automatizarea documentelor și a notificărilor',
        desc: 'Generare dinamică de facturi, contracte și AWB-uri, cu trimiterea notificărilor către angajați (Slack/Telegram) și clienți (SMS/Email).'
      }
    ],
    footerNote: 'Analizăm infrastructura actuală și proiectăm schema completă de integrare',
    ctaText: 'Discută sarcina →'
  },
  {
    id: 'analytics',
    title: 'Audit Pâlnie de Vânzări, Analytics & Optimizare CPA',
    subtitle: 'Transformă datele în decizii',
    tags: ['GA4', 'BigQuery', 'SQL', 'PowerBI'],
    duration: '1–3 săptămâni',
    categoryBadge: 'MINDCORE // DATA & CONVERSION AUDIT',
    stack: 'Stack: GA4 • BigQuery • SQL • PowerBI • Metrika',
    description: 'Identificăm punctele invizibile de pierdere a clienților, setăm urmărirea exactă a fiecărui leu investit și construim panouri clare de monitorizare în timp real.',
    metrics: [
      { title: 'End-to-End Tracking', desc: 'Monitorizarea parcursului complet de la primul click până la valoarea pe viață (LTV)' },
      { title: '+20-40% ROMI', desc: 'Eliminarea canalelor ineficiente și realocarea bugetului către surse profitabile', highlight: true },
      { title: 'Live Dashboards', desc: 'Rapoarte executive în timp real fără tabele Excel complicate manual' }
    ],
    features: [
      {
        title: 'Audit de conversie și identificarea blocajelor UX',
        desc: 'Analiza detaliată a sesiunilor de navigare, hărți de căldură și eliminarea barierelor din formularele de comandă.'
      },
      {
        title: 'Analitică avansată cu atribuirea tranzacțiilor',
        desc: 'Transmiterea conversiilor offline din CRM direct în platformele de reclame pentru antrenarea precisă a algoritmilor de licitare.'
      }
    ],
    footerNote: 'Livrăm un raport complet cu oportunități rapide de creștere în 5 zile',
    ctaText: 'Discută sarcina →'
  },
  {
    id: 'redesign',
    title: 'Redesign UI/UX Premium & Sisteme de Design',
    subtitle: 'Înainte → După premium',
    tags: ['Figma', 'Design Systems', 'WebGL', 'Motion'],
    duration: '3–10 săptămâni',
    categoryBadge: 'MINDCORE // UI/UX & PRODUCT DESIGN',
    stack: 'Stack: Figma • Design Systems • WebGL • Framer Motion',
    description: 'Transformăm interfețele învechite în experiențe digitale de top, cu o estetică impecabilă, micro-animații fluide și conversie maximă pe toate dispozitivele.',
    metrics: [
      { title: 'Design System First', desc: 'Librărie modulară de componente pentru dezvoltarea rapidă de pagini noi' },
      { title: '+45% Retenție', desc: 'Experiență intuitivă prin care vizitatorii găsesc imediat informația utilă', highlight: true },
      { title: '60 FPS Motion', desc: 'Animații rafinate și efecte vizuale WebGL ce creează un sentiment de lux digital' }
    ],
    features: [
      {
        title: 'Cercetare UX și prototipare interactivă',
        desc: 'Analiza competitorilor, maparea călătoriei utilizatorului și testarea prototipurilor interactive înainte de scrierea codului.'
      },
      {
        title: 'Kit UI complet și ghid de dezvoltare',
        desc: 'Adaptabilitate la orice ecran, suport pentru modul întunecat și fișiere pregătite direct pentru programatori.'
      }
    ],
    footerNote: 'Construim conceptul paginii principale și prototipul interactiv',
    ctaText: 'Discută sarcina →'
  },
  {
    id: 'security',
    title: 'Audit Complet de Securitate & Testare la Penetrare',
    subtitle: 'Găsește vulnerabilitățile înaintea atacatorilor',
    tags: ['OWASP', 'Pentesting', 'SSL/TLS', 'Cloudflare'],
    duration: '1–2 săptămâni',
    categoryBadge: 'MINDCORE // CYBERSECURITY & COMPLIANCE',
    stack: 'Stack: OWASP • Pentesting • Burp Suite • SSL/TLS • Cloudflare',
    description: 'Descoperim vulnerabilitățile critice din aplicațiile web, API-uri și servere înainte ca acestea să fie exploatate. Protejăm bazele de date și datele confidențiale.',
    metrics: [
      { title: 'OWASP Top 10', desc: 'Scanare amănunțită împotriva atacurilor de tip SQLi, XSS, CSRF și breșe de acces' },
      { title: 'Zero Vulnerabilități', desc: 'Izolarea zonelor sensibile și criptarea datelor stocate și transmise' },
      { title: 'Compliance Ready', desc: 'Pregătire pentru conformitatea cu standardele internaționale și GDPR', highlight: true }
    ],
    features: [
      {
        title: 'Penetration Testing & Simulare Atacuri Reale',
        desc: 'Testare manuală și automată pentru a evalua rezistența reală a sistemului la tentative de intruziune.'
      },
      {
        title: 'Plan de remediere pas cu pas și protecție perimetru',
        desc: 'Raport tehnic detaliat cu instrucțiuni clare de cod, configurare WAF și protecție împotriva atacurilor DDoS.'
      }
    ],
    footerNote: 'Oferim raport oficial de securitate cu pașii prioritari de remediere',
    ctaText: 'Discută sarcina →'
  }
];

export function getServices(locale: string): ServiceData[] {
  if (locale === 'ru') return SERVICES_RU;
  if (locale === 'ro') return SERVICES_RO;
  return SERVICES_EN;
}
