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
    handleKeyDown
  } = useAIChat();

  // Proactive calling message step: 0 = hidden, 1 = hello, 2 = business, 3 = pout
  const [promptStep, setPromptStep] = useState<number>(0);
  const [emotionState, setEmotionState] = useState<EmotionType>('idle');
  const [isBubbleDismissed, setIsBubbleDismissed] = useState(false);

  // Exact step timing:
  // 1. Starts 3 seconds after site load
  // 2. Second message after 4 seconds (7s total)
  // 3. Third message after 4 seconds (11s total)
  // 4. Closes after 4 seconds (15s total) and stays permanently closed & static
  useEffect(() => {
    if (isOpen || isBubbleDismissed) {
      setPromptStep(0);
      setEmotionState('finished');
      return;
    }

    // T = 3.0s: Step 1 (Greeting)
    const timer1 = setTimeout(() => {
      setPromptStep(1);
      setEmotionState('happy');
    }, 3000);

    // T = 7.0s (3s + 4s): Step 2 (Diplomat / Business)
    const timer2 = setTimeout(() => {
      setPromptStep(2);
      setEmotionState('diplomat');
    }, 7000);

    // T = 11.0s (7s + 4s): Step 3 (Sad / Regret 🥺)
    const timer3 = setTimeout(() => {
      setPromptStep(3);
      setEmotionState('pout');
    }, 11000);

    // T = 15.0s (11s + 4s): Close bubble & freeze avatar static on smiling robot
    const timer4 = setTimeout(() => {
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

  // Prompt messages
  const getPromptText = () => {
    if (promptStep === 1) {
      return isRu ? 'Приветики! Можем поговорить? 😊' : 'Hey there! Can we chat? 😊';
    }
    if (promptStep === 2) {
      return isRu 
        ? 'Я помогу тебе с твоим бизнесом, пообщайся со мной! 👔' 
        : 'I can supercharge your business, let’s talk! 👔';
    }
    if (promptStep === 3) {
      return isRu 
        ? 'Ну ладно, я думал ты поговоришь со мной... 🥺 Но я всегда здесь!' 
        : 'Aww, maybe next time... 🥺 I’m always here for you!';
    }
    return '';
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    setPromptStep(0);
    setEmotionState('finished');
  };

  const handleDismissBubble = (e: React.MouseEvent) => {
    e.stopPropagation();
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
              <span>{isRu ? 'Нажмите, чтобы открыть чат' : 'Click to start chat'}</span>
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
      <div className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`} role="complementary" aria-label="AI Chat Assistant">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>M</div>
            <div className={styles.onlineDot} />
          </div>
          <div className={styles.headerInfo}>
            <span className={styles.headerName}>MINDCORE AI</span>
            <span className={styles.headerStatus}>
              {isTyping ? t('typing') : 'Online · AI Assistant'}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div
              key={msg.id}
              className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : styles.messageBot}`}
              style={{ '--msg-delay': `${i * 0.05}s` } as React.CSSProperties}
            >
              <div className={styles.bubble}>{msg.content}</div>
            </div>
          ))}

          {isTyping && (
            <div className={`${styles.message} ${styles.messageBot}`}>
              <div className={`${styles.bubble} ${styles.typingBubble}`}>
                <span /><span /><span />
              </div>
            </div>
          )}

          {leadCollected && (
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
