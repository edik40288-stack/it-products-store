'use client';

import styles from '../CardVisual.module.css';

export default function SplitVisual({ hovered }: { hovered: boolean }) {
  return (
    <div className={styles.visualContainer}>
      <div className={styles.splitContainer} style={{ transform: hovered ? 'scale(1.03) translateY(-2px)' : 'scale(1)', transition: 'all 0.3s ease' }}>
        <div className={styles.splitOld}>
          <div className={styles.splitOldHeader} />
          <div className={styles.splitOldButton} />
        </div>
        <div className={styles.splitNew} style={{ clipPath: hovered ? 'inset(0 0 0 25%)' : 'inset(0 0 0 50%)' }}>
          <div className={styles.splitNewHeader} />
          <div className={styles.splitNewCard}>
            <span className={styles.splitNewDot} />
            <span style={{ fontSize: '8px', color: '#fff', fontWeight: 600 }}>PRO DESIGN</span>
          </div>
        </div>
        <div className={styles.splitSliderLine} style={{ left: hovered ? '25%' : '50%' }} />
      </div>
    </div>
  );
}
