'use client';

import { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import styles from '../AIChat.module.css';

interface ChatInputProps {
  input: string;
  isTyping: boolean;
  isListening: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onToggleListening: () => void;
  onFocus?: () => void;
}

export function ChatInput({
  input,
  isTyping,
  isListening,
  onInputChange,
  onKeyDown,
  onSend,
  onToggleListening,
  onFocus
}: ChatInputProps) {
  const t = useTranslations('chat');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus input on mount if not typing
  useEffect(() => {
    if (!isTyping) {
      inputRef.current?.focus();
    }
  }, [isTyping]);

  return (
    <div className={styles.inputArea}>
      <button
        type="button"
        className={`${styles.micBtn} ${isListening ? styles.micBtnActive : ''}`}
        onClick={onToggleListening}
        title={isListening ? t('voiceRecordingStop') : t('voiceRecordingStart')}
        aria-label={t('voiceRecordingStart')}
      >
        {isListening ? (
          <span className={styles.listeningAnimation}>
            <span /><span /><span /><span />
          </span>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
        placeholder={isListening ? t('inputListening') : t('inputPlaceholder')}
        value={input}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        disabled={isTyping}
      />

      <button
        className={styles.sendBtn}
        onClick={onSend}
        disabled={isTyping || !input.trim()}
        aria-label={t('send')}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 2L11 13" />
          <path d="M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      </button>
    </div>
  );
}
