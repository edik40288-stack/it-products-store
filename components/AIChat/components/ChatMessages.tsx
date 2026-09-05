'use client';

import React from 'react';
import styles from '../AIChat.module.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  children?: React.ReactNode;
}

export function ChatMessages({
  messages,
  isTyping,
  messagesEndRef,
  children
}: ChatMessagesProps) {
  return (
    <div
      className={styles.messagesArea}
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

      {children}

      {isTyping && (
        <div className={`${styles.message} ${styles.messageBot}`}>
          <div className={`${styles.bubble} ${styles.typingBubble}`}>
            <span /><span /><span />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
