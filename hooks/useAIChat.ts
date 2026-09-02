import { useState, useCallback, useEffect, useRef } from 'react';
import { Message } from '@/types';
import { CHAT_GREETING_EN, CHAT_GREETING_RU } from '@/data/constants';
import { useLocale, useTranslations } from 'next-intl';

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
    
    // SMART UX TRICK: Instantly reply with a script and show the card. 
    // This buys us 5-10 seconds of user attention while they fill it out!
    setTimeout(() => {
      addMessage('assistant', 'Принято. Я начал собирать данные и анализировать вашу задачу. Пока я готовлю ответ, пожалуйста, заполните контакты для связи в форме ниже.');
      setShowLeadCard(true);
      setIsTyping(true);
    }, 400);

    setInitialQuery(text);

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 12000); // 12 seconds
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
      
      // Append the actual intelligent AI response below the card
      setTimeout(() => {
        addMessage('assistant', data.reply);
      }, 500);

    } catch {
      setIsTyping(false);
      // If it fully fails, we don't need to do anything intrusive because the card is already there!
    }
  }, [addMessage]);

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
    setIsTyping(true);

    try {
      const history = [...messages, { role: 'user' as const, content: text, id: 'tmp' }];
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 12000);
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
        setShowLeadCard(true);
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
