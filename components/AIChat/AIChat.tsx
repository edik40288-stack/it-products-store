'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './AIChat.module.css';
import { useAIChat } from '@/hooks/useAIChat';
import { useLocale, useTranslations } from 'next-intl';
import ChatFace, { EmotionType } from './ChatFace';

export default function AIChat() {
  const t = useTranslations('chat');
  const locale = useLocale();
  const isRu = locale === 'ru';

  const {
    isOpen,
    setIsOpen,
    messages,
    input,
    setInput,
    isTyping,
    leadCollected,
    messagesEndRef,
    inputRef,
    sendMessage,
    handleKeyDown,
    showLeadCard,
    setShowLeadCard,
    dynamicCardConfig,
    initialQuery,
    addMessage,
    setIsTyping
  } = useAIChat();

  // Voice Input Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = locale === 'ru' ? 'ru-RU' : locale === 'ro' ? 'ro-RO' : 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            interimTranscript += event.results[i][0].transcript;
          }
          if (interimTranscript) {
            setInput(interimTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [locale, setInput]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(locale === 'ru' ? 'Голосовой ввод не поддерживается в этом браузере. Рекомендуем Google Chrome или Safari.' : 'Voice input is not supported in this browser. Please use Chrome or Safari.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = locale === 'ru' ? 'ru-RU' : locale === 'ro' ? 'ro-RO' : 'en-US';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Recognition start failed:', err);
      }
    }
  };

  // Lead Card local state
  const [messenger, setMessenger] = useState<'tg' | 'wa' | 'viber'>('tg');
  const [cardName, setCardName] = useState('');
  const [cardCompany, setCardCompany] = useState('');
  const [cardContact, setCardContact] = useState('');
  const [isCardSubmitted, setIsCardSubmitted] = useState(false);
  const [isSubmittingCard, setIsSubmittingCard] = useState(false);

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim() || !cardContact.trim() || isSubmittingCard) return;

    setIsSubmittingCard(true);

    const cardData = {
      clientName: cardName.trim(),
      company: cardCompany.trim(),
      messenger: messenger === 'tg' ? 'Telegram' : messenger === 'wa' ? 'WhatsApp' : 'Viber',
      contactHandle: cardContact.trim(),
      clientInput: initialQuery || input,
      conversationHistory: messages.map(m => ({ role: m.role, text: m.content }))
    };

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'lead_card', cardData }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingCard(false);
      setIsCardSubmitted(true);
      addMessage('assistant', isRu 
        ? `✓ Спецификация принята! Главный архитектор изучит задачу и напишет вам в ${messenger === 'tg' ? 'Telegram' : messenger === 'wa' ? 'WhatsApp' : 'Viber'} в течение 15 минут.` 
        : `✓ Specification received! Our lead architect will review and contact you via ${messenger.toUpperCase()} within 15 minutes.`
      );
    }
  };

  // Auto-detect when user confirms in chat that they filled the form
  useEffect(() => {
    const lastUser = messages.filter(m => m.role === 'user').slice(-1)[0]?.content?.toLowerCase() || '';
    if (/(заполнил|заполнила|готово|отправил|отправила|все сделал|done|sent)/i.test(lastUser)) {
      setIsCardSubmitted(true);
    }
  }, [messages]);

  // Proactive calling message step: 0 = hidden, 1 = hello, 2 = business, 3 = pout
  const [promptStep, setPromptStep] = useState<number>(0);
  const [emotionState, setEmotionState] = useState<EmotionType>('idle');
  const [isBubbleDismissed, setIsBubbleDismissed] = useState(false);
  const lifecycleCompletedRef = useRef(false);

  // Exact step timing: runs ONCE on initial site load only
  useEffect(() => {
    if (lifecycleCompletedRef.current) return;

    if (isOpen || isBubbleDismissed) {
      lifecycleCompletedRef.current = true;
      setPromptStep(0);
      setEmotionState('finished');
      return;
    }

    // T = 3.0s: Step 1 (Greeting)
    const timer1 = setTimeout(() => {
      if (!lifecycleCompletedRef.current) {
        setPromptStep(1);
        setEmotionState('happy');
      }
    }, 3000);

    // T = 7.0s (3s + 4s): Step 2 (Diplomat / Business)
    const timer2 = setTimeout(() => {
      if (!lifecycleCompletedRef.current) {
        setPromptStep(2);
        setEmotionState('diplomat');
      }
    }, 7000);

    // T = 11.0s (7s + 4s): Step 3 (Sad / Regret 🥺)
    const timer3 = setTimeout(() => {
      if (!lifecycleCompletedRef.current) {
        setPromptStep(3);
        setEmotionState('pout');
      }
    }, 11000);

    // T = 15.0s: Permanently complete lifecycle and freeze avatar static
    const timer4 = setTimeout(() => {
      lifecycleCompletedRef.current = true;
      setPromptStep(0);
      setEmotionState('finished');
    }, 15000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isOpen, isBubbleDismissed]);

  // Listen for external trigger (e.g. Hero audit button)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.context === 'audit') {
        lifecycleCompletedRef.current = true;
        setPromptStep(0);
        setEmotionState('diplomat');
        setIsOpen(true);
      }
    };
    document.addEventListener('open-ai-chat', handler);
    return () => document.removeEventListener('open-ai-chat', handler);
  }, [setIsOpen]);

  // Lock background scroll on mobile/desktop when chat panel is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
  }, [isOpen]);

  const panelRef = useRef<HTMLDivElement>(null);

  // Sync mobile chat panel with iOS visualViewport when virtual keyboard opens/closes
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;
    const vv = window.visualViewport;
    if (!vv) return;

    const handleVisualViewportChange = () => {
      const panel = panelRef.current;
      if (!panel) return;
      if (window.innerWidth <= 768) {
        panel.style.height = `${vv.height}px`;
        panel.style.top = `${vv.offsetTop}px`;
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        panel.style.height = '';
        panel.style.top = '';
      }
    };

    vv.addEventListener('resize', handleVisualViewportChange);
    vv.addEventListener('scroll', handleVisualViewportChange);
    handleVisualViewportChange();

    return () => {
      vv.removeEventListener('resize', handleVisualViewportChange);
      vv.removeEventListener('scroll', handleVisualViewportChange);
      if (panelRef.current) {
        panelRef.current.style.height = '';
        panelRef.current.style.top = '';
      }
    };
  }, [isOpen]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleSend = () => {
    sendMessage();
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleInputFocus = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  // Prompt messages
  const getPromptText = () => {
    if (promptStep === 1) {
      return locale === 'ru' 
        ? 'Здравствуйте! Могу помочь с расчетом проекта или консультацией 💬' 
        : locale === 'ro'
        ? 'Bună ziua! Vă pot ajuta cu estimarea proiectului sau consultanță 💬'
        : 'Hello! I can assist you with project estimation or technical scoping 💬';
    }
    if (promptStep === 2) {
      return locale === 'ru' 
        ? 'Подскажу по стеку, срокам и окупаемости внедрения AI-систем 👔' 
        : locale === 'ro'
        ? 'Vă pot oferi detalii despre tehnologii, termene și integrare AI 👔'
        : 'I can advise on tech stacks, timelines, and AI implementation 👔';
    }
    if (promptStep === 3) {
      return locale === 'ru' 
        ? 'Буду рад ответить на любые технические вопросы. Обращайтесь!' 
        : locale === 'ro'
        ? 'Voi fi bucuros să răspund la orice întrebare tehnică. Vă stau la dispoziție!'
        : 'Ready to answer any technical questions whenever you need.';
    }
    return '';
  };

  const handleOpenChat = () => {
    lifecycleCompletedRef.current = true;
    setIsOpen(true);
    setPromptStep(0);
    setEmotionState('finished');
  };

  const handleDismissBubble = (e: React.MouseEvent) => {
    e.stopPropagation();
    lifecycleCompletedRef.current = true;
    setIsBubbleDismissed(true);
    setPromptStep(0);
    setEmotionState('finished');
  };

  return (
    <>
      <div className={`${styles.triggerWrap} ${isOpen ? styles.triggerWrapHidden : ''}`}>
        {/* Proactive Calling Message Cloud */}
        {promptStep > 0 && !isOpen && (
          <div 
            key={promptStep}
            className={styles.callingBubble}
            onClick={handleOpenChat}
            role="button"
            tabIndex={0}
          >
            <div className={styles.bubbleHeader}>
              <span className={styles.bubbleAuthor}>MINDCORE AI</span>
              <button 
                className={styles.bubbleClose} 
                onClick={handleDismissBubble}
                aria-label="Close message"
              >
                ✕
              </button>
            </div>
            <div className={styles.bubbleText}>
              {getPromptText()}
            </div>
            <div className={styles.bubbleCta}>
              <span>{locale === 'ru' ? 'Нажмите, чтобы открыть чат' : 'Click to start chat'}</span>
              <span>→</span>
            </div>
          </div>
        )}

        {/* Floating trigger button with 3D Video Avatar */}
        <button
          className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open AI assistant"
          aria-expanded={isOpen}
        >
          <ChatFace emotion={emotionState} isOpen={isOpen} />
        </button>
      </div>

      {/* Chat panel */}
      <div 
        ref={panelRef}
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`} 
        role="complementary" 
        aria-label="AI Chat Assistant"
        data-lenis-prevent="true"
        data-scroll-ignore="true"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/anim/bot-greeting.webp"
                alt="MINDCORE AI"
                className={styles.headerBotVideo}
                loading="eager"
              />
              <div className={styles.avatarFallback}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="12" x="3" y="6" rx="2" />
                  <path d="M12 2v4M9 12h.01M15 12h.01" />
                </svg>
              </div>
            </div>
            <div className={styles.onlineDot} />
          </div>
          <div className={styles.headerInfo}>
            <span className={styles.headerName}>MINDCORE AI</span>
            {isTyping && (
              <span className={styles.headerStatus}>{t('typing')}</span>
            )}
          </div>
          <button
            type="button"
            className={styles.headerCloseBtn}
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div 
          className={styles.messages}
          data-lenis-prevent="true"
          data-scroll-ignore="true"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {messages.map((msg, i) => (
            <div
              key={msg.id}
              className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : styles.messageBot}`}
              style={{ '--msg-delay': `${i * 0.05}s` } as React.CSSProperties}
            >
              <div className={styles.bubble}>{msg.content}</div>
            </div>
          ))}

          {/* Interactive Project & Lead Card */}
          {showLeadCard && (
            isCardSubmitted ? (
              <div className={styles.submittedPill}>
                <span className={styles.submittedCheck}>✓</span>
                <div className={styles.submittedContent}>
                  <p className={styles.submittedTitle}>
                    {isRu ? 'Спецификация принята архитектором' : 'Specification Received'}
                  </p>
                  <p className={styles.submittedSubtitle}>
                    {isRu 
                      ? `Изучаем проект. Инженер напишет вам в ${messenger.toUpperCase()} в течение 15 минут.`
                      : `Lead architect will contact you via ${messenger.toUpperCase()} within 15 minutes.`}
                  </p>
                </div>
              </div>
            ) : (
              <div className={styles.leadCard}>
                <div className={styles.leadCardHeader}>
                  <span className={styles.leadCardBadge}>{isRu ? 'Спецификация для архитектора' : 'Architecture Specification'}</span>
                  <span className={styles.leadCardDot}>● {isRu ? 'Текстовая связь' : 'Text-only'}</span>
                </div>

                <form onSubmit={handleCardSubmit} className={styles.leadCardForm}>
                  <div>
                    <label className={styles.leadCardLabel}>{isRu ? 'Куда отправить расчет архитектуры' : 'Where to send the architecture plan'}</label>
                    <div className={styles.leadCardTabs}>
                      {[
                        { id: 'tg', label: 'Telegram' },
                        { id: 'wa', label: 'WhatsApp' },
                        { id: 'viber', label: 'Viber' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setMessenger(item.id as 'tg' | 'wa' | 'viber')}
                          className={`${styles.leadCardTab} ${messenger === item.id ? styles.leadCardTabActive : ''}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className={styles.leadCardFieldsRow}>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder={isRu ? 'Имя и фамилия *' : 'Full Name *'}
                        className={styles.leadCardInput}
                      />
                      <input
                        type="text"
                        value={cardCompany}
                        onChange={(e) => setCardCompany(e.target.value)}
                        placeholder={isRu ? 'Компания / Ниша' : 'Company / Niche'}
                        className={styles.leadCardInput}
                      />
                    </div>
                    <input
                      type="text"
                      required
                      value={cardContact}
                      onChange={(e) => setCardContact(e.target.value)}
                      placeholder={
                        messenger === 'tg'
                          ? (isRu ? '@username или номер в Telegram *' : '@username or Telegram number *')
                          : messenger === 'wa'
                          ? (isRu ? 'Номер для WhatsApp *' : 'WhatsApp Number *')
                          : (isRu ? 'Номер для Viber *' : 'Viber Number *')
                      }
                      className={styles.leadCardInput}
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isSubmittingCard || !cardName.trim() || !cardContact.trim()}
                      className={styles.leadCardSubmitBtn}
                    >
                      {isSubmittingCard 
                        ? (isRu ? 'Отправка...' : 'Sending...') 
                        : (isRu ? 'Передать задачу инженеру →' : 'Send to Engineer →')}
                    </button>
                    <div className={styles.leadCardDisclaimer}>
                      {isRu ? 'Пишем только в мессенджер. Без холодных звонков.' : 'We only write in messenger. No cold calls.'}
                    </div>
                  </div>
                </form>
              </div>
            )
          )}

          {isTyping && (
            <div className={`${styles.message} ${styles.messageBot}`}>
              <div className={`${styles.bubble} ${styles.typingBubble}`}>
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input & Voice Bar */}
        <div className={styles.inputArea}>
          <button
            type="button"
            className={`${styles.micBtn} ${isListening ? styles.micBtnActive : ''}`}
            onClick={toggleListening}
            title={isListening ? (isRu ? 'Остановить запись' : 'Stop recording') : (isRu ? 'Голосовой ввод' : 'Voice input')}
            aria-label="Voice input"
          >
            {isListening ? (
              <span className={styles.listeningAnimation}>
                <span /><span /><span /><span />
              </span>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            )}
          </button>

          <textarea
            ref={inputRef}
            rows={1}
            className={`${styles.input} ${isListening ? styles.inputListening : ''}`}
            placeholder={isListening ? (isRu ? 'Слушаю... 🎙️' : 'Listening... 🎙️') : (isRu ? 'Ваша задача...' : 'Your request...')}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            disabled={isTyping}
          />
          <button
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            aria-label={t('send')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
