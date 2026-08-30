'use client';
import { useState, useEffect } from 'react';
import styles from '../CardVisual.module.css';

const MESSAGES = [
  { from: 'user', text: 'Hey, need help with my project' },
  { from: 'bot', text: 'Hi! What are you building? 🚀' },
  { from: 'user', text: 'An AI sales agent for my SaaS' },
  { from: 'bot', text: 'Great! Tell me about your budget...' },
  { from: 'user', text: 'Around $5k, need it fast' },
  { from: 'bot', text: 'We can ship in 2 weeks. Lead sent! ✅' },
];

export default function ChatVisual({ hovered }: { hovered: boolean }) {
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    if (!hovered) { setVisibleCount(3); return; }
    const interval = setInterval(() => {
      setVisibleCount(c => c < MESSAGES.length ? c + 1 : 3);
    }, 900);
    return () => clearInterval(interval);
  }, [hovered]);

  return (
    <div className={styles.chatWrap}>
      {MESSAGES.slice(0, visibleCount).map((msg, i) => (
        <div key={i} className={`${styles.bubble} ${msg.from === 'bot' ? styles.bubbleBot : styles.bubbleUser}`}
          style={{ animationDelay: `${i * 0.1}s` }}>
          {msg.text}
        </div>
      ))}
      {hovered && (
        <div className={`${styles.bubble} ${styles.bubbleBot} ${styles.typing}`}>
          <span /><span /><span />
        </div>
      )}
    </div>
  );
}
