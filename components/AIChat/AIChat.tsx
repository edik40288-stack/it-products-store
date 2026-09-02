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
    dynamicCardConfig,
    initialQuery,
    addMessage
  } = useAIChat();

  // Lead Card local state
  const [cardName, setCardName] = useState('');
  const [cardCompany, setCardCompany] = useState('');
  const [cardContact, setCardContact] = useState('');
  const [isCardSubmitted, setIsCardSubmitted] = useState(false);
  const [isSubmittingCard, setIsSubmittingCard] = useState(false);

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim() || !cardCompany.trim() || !cardContact.trim() || isSubmittingCard) return;

    setIsSubmittingCard(true);
    const name = cardName.trim();
    const company = cardCompany.trim();
    const contact = cardContact.trim();

    const cardData = {
      name,
      company,
      contact,
      initialQuery: initialQuery || input
    };

    // 1. Send instant lead notification to Telegram in background (non-blocking)
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'lead_card',
        cardData
      }),
    }).catch(console.error);

    setIsCardSubmitted(true);
    setIsSubmittingCard(false);

    // 2. Add lead submission message to chat
    addMessage('user', `Заявка: ${name}, фирма «${company}» (${contact})`);

    // 3. Trigger live Gemini response
    try {
      const promptText = `Клиент заполнил карточку: имя ${name}, компания «${company}», контакты ${contact}. Если компания реальная — дай краткий анализ рынка и как ее усилить через AI. Если вымышленная, тестовая или неизвестная — зафиксируй данные, напомни про бесплатный сайт (0 €) и спроси, какие главные задачи в процессах хотят решить.`;
      const history = [
        ...messages,
        { role: 'user' as const, content: promptText, id: Date.now().toString() }
      ];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json();
      if (data?.reply) {
        addMessage('assistant', data.reply);
      }
    } catch {
      addMessage('assistant', 'Заявка зафиксирована. Старший архитектор свяжется с вами в течение 48 часов.');
    }
  };

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
      <div className={styles.triggerWrap}>
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
              <video
                src="/videos/bot-greeting.mp4"
                muted
                playsInline
                autoPlay
                loop
                className={styles.headerBotVideo}
              />
            </div>
            <div className={styles.onlineDot} />
          </div>
          <div className={styles.headerInfo}>
            <span className={styles.headerName}>MINDCORE AI</span>
            {isTyping && (
              <span className={styles.headerStatus}>{t('typing')}</span>
            )}
          </div>
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
            <div className={styles.leadCard}>
              <div className={styles.leadCardHeader}>
                <div className={styles.leadCardBadge}>
                  <span className={styles.leadCardDot} />
                  <span>{locale === 'ru' ? 'КАРТОЧКА ПРОЕКТА // ЭКСПРЕСС-АНАЛИЗ' : 'PROJECT SCOPE CARD'}</span>
                </div>
                <span className={styles.leadCardFree}>{locale === 'ru' ? 'Сайт: 0 €' : 'Web: 0 €'}</span>
              </div>

              {!isCardSubmitted ? (
                <form onSubmit={handleCardSubmit} className={styles.leadCardForm}>
                  <div className={styles.leadCardFields}>
                    <input
                      type="text"
                      placeholder={locale === 'ru' ? 'Имя Фамилия *' : 'Full Name *'}
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                      className={styles.leadCardInput}
                    />
                    <input
                      type="text"
                      placeholder={locale === 'ru' ? 'Название фирмы или компании *' : 'Company Name *'}
                      value={cardCompany}
                      onChange={(e) => setCardCompany(e.target.value)}
                      required
                      className={styles.leadCardInput}
                    />
                    <input
                      type="text"
                      placeholder={locale === 'ru' ? 'Контакты для связи (Telegram, телефон) *' : 'Telegram / WhatsApp / Phone *'}
                      value={cardContact}
                      onChange={(e) => setCardContact(e.target.value)}
                      required
                      className={`${styles.leadCardInput} ${styles.leadCardInputFull}`}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmittingCard || !cardName.trim() || !cardCompany.trim() || !cardContact.trim()}
                    className={styles.leadCardSubmitBtn}
                  >
                    {isSubmittingCard 
                      ? (locale === 'ru' ? 'Анализирую компанию...' : 'Analyzing company...') 
                      : (locale === 'ru' ? 'Отправить на экспресс-анализ 🚀' : 'Run Express Analysis 🚀')}
                  </button>
                </form>
              ) : (
                <div className={styles.cardSuccessBox}>
                  <div className={styles.cardSuccessIcon}>✓</div>
                  <div className={styles.cardSuccessText}>
                    <strong>{locale === 'ru' ? 'Заявка зафиксирована!' : 'Project Secured!'}</strong>
                    <span>{locale === 'ru' ? 'Старший архитектор свяжется с вами в ближайшее время.' : 'Our lead engineer will connect with you shortly.'}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {isTyping && (
            <div className={`${styles.message} ${styles.messageBot}`}>
              <div className={`${styles.bubble} ${styles.typingBubble}`}>
                <span /><span /><span />
              </div>
            </div>
          )}

          {leadCollected && !showLeadCard && (
            <div className={styles.successBanner}>
              {t('success')}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={styles.inputArea}>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder={t('placeholder')}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
          />
          <button
            className={styles.sendBtn}
            onClick={sendMessage}
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
