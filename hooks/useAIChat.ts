import { useState, useCallback, useEffect, useRef } from 'react';
import { Message } from '@/types';
import { CHAT_GREETING_EN, CHAT_GREETING_RU } from '@/data/constants';
import { useLocale } from 'next-intl';

export function useAIChat() {
  const locale = useLocale();
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

  // Open chat via event
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setIsOpen(true);
      if (detail?.context) {
        setTimeout(() => {
          addMessage('assistant', `Great choice! Let me help you explore the **${detail.context}** service. What's your current situation?`);
        }, 500);
      }
    };
    document.addEventListener('open-ai-chat', handler);
    return () => document.removeEventListener('open-ai-chat', handler);
  }, [addMessage]);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage('assistant', greeting);
      }, 800);
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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json();
      setIsTyping(false);
      addMessage('assistant', data.reply);
      if (data.leadCollected) setLeadCollected(true);
    } catch {
      setIsTyping(false);
      addMessage('assistant', "I'm having a connectivity issue. Please email us directly at newbusiness@mindcore.studio 🙏");
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
    leadCollected,
    isPulsing,
    messagesEndRef,
    inputRef,
    sendMessage,
    handleKeyDown
  };
}
