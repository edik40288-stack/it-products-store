'use client';

import styles from '../CardVisual.module.css';

export default function ChatVisual({ hovered }: { hovered: boolean }) {
  return (
    <div className={styles.visualContainer}>
      <div className={styles.chatContainer} style={{ transform: hovered ? 'scale(1.03) translateY(-2px)' : 'scale(1)', transition: 'all 0.3s ease' }}>
        <div className={styles.chatBubbleUser}>
          Интегрируй автопродажи в CRM
        </div>
        <div className={styles.chatBubbleAi}>
          <div className={styles.aiHeader}>
            <span className={styles.aiBadge}>MINDCORE AI</span>
            <div className={styles.equalizer}>
              <span className={styles.eqBar} />
              <span className={styles.eqBar} />
              <span className={styles.eqBar} />
            </div>
          </div>
          <span>Сделка #4892 закрыта, счет выставлен в Telegram ✅</span>
        </div>
      </div>
    </div>
  );
}
