'use client';

import styles from '../CardVisual.module.css';

export default function CodeVisual({ hovered }: { hovered: boolean }) {
  return (
    <div className={styles.visualContainer}>
      <div className={styles.ideWindow} style={{ transform: hovered ? 'scale(1.04) translateY(-2px)' : 'scale(1)' }}>
        <div className={styles.ideHeader}>
          <div className={styles.windowDots}>
            <span className={styles.dotRed} />
            <span className={styles.dotYellow} />
            <span className={styles.dotGreen} />
          </div>
          <span className={styles.ideTitle}>app/api/deploy.ts</span>
        </div>
        <div className={styles.ideBody}>
          <div>
            <span className={styles.kw}>const</span> <span className={styles.var}>stack</span> = [<span className={styles.str}>&apos;Next.js&apos;</span>, <span className={styles.str}>&apos;FastAPI&apos;</span>];
          </div>
          <div>
            <span className={styles.kw}>await</span> <span className={styles.fn}>deployCluster</span>(<span className={styles.var}>stack</span>);
          </div>
          <div className={styles.cm}>// Zero downtime · 99.99% SLA</div>
          <div className={styles.deployPill}>
            <span className={styles.pingDot} />
            <span>DEPLOYED · 18ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
