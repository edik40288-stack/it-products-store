'use client';

import { useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAIChat } from '@/hooks/useAIChat';
import styles from './AIChat.module.css';
import ChatFace from './ChatFace';

// Modular Hooks & Subcomponents
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useProactiveBubble } from './hooks/useProactiveBubble';
import { LeadCard } from './components/LeadCard';
import { ChatMessages } from './components/ChatMessages';
import { ChatInput } from './components/ChatInput';

export default function AIChat() {
  const t = useTranslations('chat');
  const locale = useLocale();

  const {
    isOpen,
    setIsOpen,
    messages,
    input,
    setInput,
    isTyping,
    sendMessage,
    handleKeyDown,
    showLeadCard,
    setShowLeadCard,
    initialQuery,
    addMessage,
    setLeadContext
  } = useAIChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Proactive smart teaser bubble & emotion state
  const {
    promptStep,
    emotionState,
    setEmotionState,
    isScrolling,
    handleDismissBubble,
    handleOpenFromBubble,
    lifecycleCompletedRef
  } = useProactiveBubble({
    isOpen,
    onOpenChat: () => setIsOpen(true)
  });

  // Speech Recognition hook
  const { isListening, toggleListening } = useSpeechRecognition({
    locale,
    onTranscript: (transcript) => setInput(transcript),
    unsupportedMessage: t('voiceNotSupported')
  });

  // Scroll to bottom when new messages arrive or typing status changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, showLeadCard]);

  // Listen for external open triggers (e.g. Hero audit button)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.context === 'audit') {
        lifecycleCompletedRef.current = true;
        setEmotionState('diplomat');
        setIsOpen(true);
      }
    };
    document.addEventListener('open-ai-chat', handler);
    return () => document.removeEventListener('open-ai-chat', handler);
  }, [setIsOpen, setEmotionState, lifecycleCompletedRef]);

  // Lock background scroll when chat is open on mobile
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
  };

  const handleLeadCardSuccess = (messengerName: string) => {
    setShowLeadCard(false);

    const isRu = locale === 'ru';
    const isRo = locale === 'ro';

    addMessage(
      'assistant',
      isRu
        ? `✓ Данные переданы ведущему архитектору! Инженер уже изучает проект и свяжется с вами в ${messengerName} в течение 24 часов.`
        : isRo
        ? `✓ Detaliile au fost transmise arhitectului șef! Inginerul analizează proiectul și vă va contacta pe ${messengerName} în decurs de 24 de ore.`
        : `✓ Project details sent to lead architect! Our engineer is reviewing and will contact you via ${messengerName} within 24 hours.`
    );

    setTimeout(() => {
      addMessage(
        'assistant',
        isRu
          ? `А пока технари изучают проект, можно уточню пару моментов для лучшего результата: какая у вас ниша и что сейчас больше всего напрягает в процессах прямо сейчас?`
          : isRo
          ? `În timp ce echipa tehnică analizează proiectul, aș putea preciza câteva detalii: care este domeniul afacerii și ce procese operaționale vă creează cele mai mari bătăi de cap în prezent?`
          : `While our engineers review your project, may I ask: what is your industry/niche, and what is currently the biggest operational bottleneck in your business?`
      );
    }, 1200);
  };

  const getTeaserText = () => {
    if (promptStep === 1) return t('teaser1');
    if (promptStep === 2) return t('teaser2');
    if (promptStep === 3) return t('teaser3');
    return '';
  };

  return (
    <>
      <div className={`${styles.triggerWrap} ${isOpen ? styles.triggerWrapHidden : ''}`}>
        {/* Proactive Calling Capsule */}
        {promptStep > 0 && !isOpen && (
          <div
            key={promptStep}
            className={`${styles.callingBubble} ${isScrolling ? styles.callingBubbleScrolled : ''}`}
            onClick={handleOpenFromBubble}
            role="button"
            tabIndex={0}
            title={t('openChatTitle')}
          >
            <span className={styles.bubbleDot} />
            <span className={styles.bubbleText}>{getTeaserText()}</span>
            <button
              type="button"
              className={styles.bubbleClose}
              onClick={handleDismissBubble}
              aria-label="Close message"
            >
              ✕
            </button>
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
            {isTyping && <span className={styles.headerStatus}>{t('typing')}</span>}
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

        {/* Message feed & LeadCard */}
        <ChatMessages messages={messages} isTyping={isTyping} messagesEndRef={messagesEndRef}>
          {showLeadCard && (
            <LeadCard
              initialQuery={initialQuery}
              currentInput={input}
              messages={messages}
              locale={locale}
              onSuccess={handleLeadCardSuccess}
              setLeadContext={setLeadContext}
            />
          )}
        </ChatMessages>

        {/* Modular Input Bar */}
        <ChatInput
          input={input}
          isTyping={isTyping}
          isListening={isListening}
          onInputChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          onSend={handleSend}
          onToggleListening={toggleListening}
          onFocus={() => {
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 150);
          }}
        />
      </div>
    </>
  );
}
