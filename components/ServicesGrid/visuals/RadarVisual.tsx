'use client';

import styles from '../CardVisual.module.css';

export default function RadarVisual({ hovered }: { hovered: boolean }) {
  return (
    <div className={styles.visualContainer}>
      <div className={styles.analyticsCard} style={{ transform: hovered ? 'scale(1.03) translateY(-2px)' : 'scale(1)', transition: 'all 0.3s ease' }}>
        <div className={styles.funnelRow}>
          <div className={styles.funnelHeader}>
            <span>ВОРОНКА ПРОДАЖ</span>
            <span>+38.4% CVR</span>
          </div>
          <div className={styles.funnelProgress}>
            <div className={styles.funnelFill} style={{ width: hovered ? '85%' : '65%' }} />
          </div>
        </div>
        <div className={styles.analyticsStats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>3.8x</span>
            <span className={styles.statLabel}>ROAS</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>-42%</span>
            <span className={styles.statLabel}>CPA Срез</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>100%</span>
            <span className={styles.statLabel}>GA4 Сквозная</span>
          </div>
        </div>
      </div>
    </div>
  );
}
