'use client';

import styles from '../CardVisual.module.css';

export default function GearsVisual({ hovered }: { hovered: boolean }) {
  return (
    <div className={styles.visualContainer}>
      <div className={styles.flowGraph} style={{ transform: hovered ? 'scale(1.03) translateY(-2px)' : 'scale(1)', transition: 'all 0.3s ease' }}>
        <div className={styles.flowNode}>
          <span className={styles.nodeIcon}>⚡</span>
          <span className={styles.nodeLabel}>Webhook</span>
          <span className={styles.nodeStatus}>Trigger</span>
        </div>
        <span className={styles.flowWire}>➔</span>
        <div className={styles.flowNode}>
          <span className={styles.nodeIcon}>🧠</span>
          <span className={styles.nodeLabel}>AI Logic</span>
          <span className={styles.nodeStatus}>n8n Flow</span>
        </div>
        <span className={styles.flowWire}>➔</span>
        <div className={styles.flowNode}>
          <span className={styles.nodeIcon}>💳</span>
          <span className={styles.nodeLabel}>Stripe</span>
          <span className={styles.nodeStatus}>Payout</span>
        </div>
      </div>
    </div>
  );
}
