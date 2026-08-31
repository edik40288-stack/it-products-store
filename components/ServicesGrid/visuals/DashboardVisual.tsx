'use client';

import styles from '../CardVisual.module.css';

export default function DashboardVisual({ hovered }: { hovered: boolean }) {
  return (
    <div className={styles.visualContainer}>
      <div className={styles.crmCard} style={{ transform: hovered ? 'scale(1.03) translateY(-2px)' : 'scale(1)', transition: 'all 0.3s ease' }}>
        <div className={styles.crmTopRow}>
          <span className={styles.crmMetric}>+$48,250</span>
          <span className={styles.crmBadge}>+142% MRR</span>
        </div>
        <div className={styles.chartBars}>
          <div className={styles.barCol} style={{ height: hovered ? '55%' : '40%' }} />
          <div className={styles.barCol} style={{ height: hovered ? '75%' : '60%' }} />
          <div className={styles.barCol} style={{ height: hovered ? '60%' : '50%' }} />
          <div className={styles.barCol} style={{ height: hovered ? '95%' : '80%' }} />
          <div className={styles.barCol} style={{ height: hovered ? '100%' : '90%' }} />
        </div>
        <div className={styles.crmStages}>
          <span>ЛИДЫ</span>
          <span>ОПЛАТА</span>
          <span>ROI 3.4x</span>
        </div>
      </div>
    </div>
  );
}
