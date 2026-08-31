'use client';

import styles from '../CardVisual.module.css';

export default function ScannerVisual({ hovered }: { hovered: boolean }) {
  return (
    <div className={styles.visualContainer}>
      <div className={styles.securityCard} style={{ transform: hovered ? 'scale(1.03) translateY(-2px)' : 'scale(1)', transition: 'all 0.3s ease' }}>
        <div className={styles.secHeader}>
          <div className={styles.secShield}>
            <span>🛡️</span>
            <span>SECURE SHIELD</span>
          </div>
          <span style={{ fontSize: '7.5px', color: '#4ade80', fontFamily: 'monospace' }}>100% PASS</span>
        </div>
        <div className={styles.secChecklist}>
          <div className={styles.secCheckItem}>
            <span className={styles.checkIcon}>✔</span>
            <span>OWASP Top 10 Защита</span>
          </div>
          <div className={styles.secCheckItem}>
            <span className={styles.checkIcon}>✔</span>
            <span>SSL 256-bit Шифрование</span>
          </div>
          <div className={styles.secCheckItem}>
            <span className={styles.checkIcon}>✔</span>
            <span>0 Критических уязвимостей</span>
          </div>
        </div>
      </div>
    </div>
  );
}
