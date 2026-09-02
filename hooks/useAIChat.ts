import { useState, useCallback, useEffect, useRef } from 'react';
import { Message } from '@/types';
import { CHAT_GREETING_EN, CHAT_GREETING_RU } from '@/data/constants';
import { useLocale, useTranslations } from 'next-intl';

function isAuditUrlOrCompany(str: string): boolean {
  const urlRegex = /(https?:\/\/|www\.)[^\s]+|[a-zA-Z0-9][-a-zA-Z0-9]*\.(com|ru|io|md|net|org|dev|ai|app|co|biz|info|tech|online|store|shop|me|pro|eu|by|ua|kz)(\/[^\s]*)?/i;
  const companyRegex = /(^|\s)(ооо|зао|ип|компания|фирма|агентство|студия|бренд)\s+[а-яА-Яa-zA-Z0-9]+/i;
  return urlRegex.test(str) || companyRegex.test(str);
}

function getAuditParallelHook(locale: string): string {
  if (locale === 'ro') {
    return 'Am preluat linkul. Am pornit auditul rapid de arhitectură și viteză (~8–10 sec)... În timp ce analizez: care este principala provocare acum — volumul redus de lead-uri sau pierderea clienților din cauza timpului mare de procesare?';
  }
  if (locale === 'en') {
    return 'URL received. Running background architectural & speed audit (~8–10s)... While scanning: what is your primary bottleneck right now — low inbound lead volume, or losing prospects due to slow response times?';
  }
  return 'Принял ссылку. Запустил фоновый экспресс-аудит архитектуры и скорости (~8–10 сек)... Пока идет сканирование: какая сейчас основная боль — не хватает целевых заявок или система теряет клиентов из-за долгой обработки?';
}

export function useAIChat() {
  const locale = useLocale();
  const t = useTranslations('chat');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [leadCollected, setLeadCollected] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    setMessages(prev => [...prev, { role, content, id: Date.now().toString() }]);
  }, []);

  const greeting = locale === 'ru' ? CHAT_GREETING_RU : CHAT_GREETING_EN;
  const hasEventOpenedRef = useRef(false);
  const [showLeadCard, setShowLeadCard] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');
  const [dynamicCardConfig, setDynamicCardConfig] = useState<{
    cardTitle?: string;
    ctaText?: string;
    niche?: string;
    serviceType?: string;
  }>({});

  const sendQueryDirectly = useCallback(async (text: string) => {
    addMessage('user', text);
    setInitialQuery(text);

    const isAudit = isAuditUrlOrCompany(text);

    // Immediate conversational hook within 500ms so user has something engaging to read right away!
    if (isAudit) {
      setTimeout(() => {
        addMessage('assistant', getAuditParallelHook(locale));
        setIsTyping(true);
      }, 500);
    } else {
      setTimeout(() => {
        setIsTyping(true);
      }, 200);
    }

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 25000); // 25 seconds max
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: text }],
        }),
        signal: controller.signal
      });
      clearTimeout(id);
      
      const data = await res.json();
      setIsTyping(false);
      
      addMessage('assistant', data.reply);
      if (data.dynamicCard?.showCard) {
        setDynamicCardConfig(data.dynamicCard);
        setTimeout(() => {
          setShowLeadCard(true);
        }, 500);
      }

    } catch {
      setIsTyping(false);
      addMessage('assistant', 'Сбой связи с сервером. Пожалуйста, попробуйте еще раз.');
    }
  }, [addMessage, locale]);

  // Open chat via event
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      hasEventOpenedRef.current = true;
      setIsOpen(true);
      
      if (detail?.context === 'audit' && detail?.value) {
        sendQueryDirectly(detail.value);
      } else if (detail?.context) {
        setTimeout(() => {
          addMessage('assistant', t('contextGreeting', { context: detail.context }));
          setShowLeadCard(true);
        }, 100);
      }
    };
    document.addEventListener('open-ai-chat', handler);
    return () => document.removeEventListener('open-ai-chat', handler);
  }, [addMessage, t, sendQueryDirectly]);

  // Initial greeting (only when opened manually by clicking the floating avatar, not by event)
  useEffect(() => {
    if (isOpen && messages.length === 0 && !hasEventOpenedRef.current) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage('assistant', greeting);
      }, 500);
    }
  }, [isOpen, messages.length, addMessage, greeting]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  // Stop pulsing after first interaction
  useEffect(() => {
    if (isOpen) setIsPulsing(false);
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    setInput('');
    addMessage('user', text);

    const isAudit = isAuditUrlOrCompany(text);
    if (isAudit) {
      setTimeout(() => {
        addMessage('assistant', getAuditParallelHook(locale));
        setIsTyping(true);
      }, 500);
    } else {
      setIsTyping(true);
    }

    try {
      const history = [...messages, { role: 'user' as const, content: text, id: 'tmp' }];
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 25000);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
        signal: controller.signal
      });
      clearTimeout(id);
      const data = await res.json();
      setIsTyping(false);
      addMessage('assistant', data.reply);
      if (data.dynamicCard?.showCard) {
        setDynamicCardConfig(data.dynamicCard);
        setTimeout(() => {
          setShowLeadCard(true);
        }, 500);
      }
      if (data.leadCollected) setLeadCollected(true);
    } catch {
      setIsTyping(false);
      addMessage('assistant', t('error'));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return {
    isOpen,
    setIsOpen,
    messages,
    input,
    setInput,
    isTyping,
    setIsTyping,
    leadCollected,
    isPulsing,
    messagesEndRef,
    inputRef,
    sendMessage,
    handleKeyDown,
    showLeadCard,
    setShowLeadCard,
    dynamicCardConfig,
    initialQuery,
    addMessage,
    sendQueryDirectly
  };
}
