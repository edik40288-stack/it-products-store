'use client';

import styles from '../CardVisual.module.css';

export default function LLMVisual({ hovered }: { hovered: boolean }) {
  return (
    <div className={styles.visualContainer}>
      <div className={styles.llmGrid} style={{ transform: hovered ? 'scale(1.03) translateY(-2px)' : 'scale(1)', transition: 'all 0.3s ease' }}>
        <div className={styles.modelBadge}>
          <span className={`${styles.modelIcon} ${styles.iconOpenAI}`}>O</span>
          <div className={styles.modelInfo}>
            <span className={styles.modelName}>GPT-4o</span>
            <span className={styles.modelStatus}>128k ctx</span>
          </div>
        </div>
        <div className={styles.modelBadge}>
          <span className={`${styles.modelIcon} ${styles.iconClaude}`}>C</span>
          <div className={styles.modelInfo}>
            <span className={styles.modelName}>Claude 3.5</span>
            <span className={styles.modelStatus}>200k ctx</span>
          </div>
        </div>
        <div className={styles.modelBadge}>
          <span className={`${styles.modelIcon} ${styles.iconGemini}`}>G</span>
          <div className={styles.modelInfo}>
            <span className={styles.modelName}>Gemini 1.5</span>
            <span className={styles.modelStatus}>1M+ ctx</span>
          </div>
        </div>
        <div className={styles.modelBadge}>
          <span className={`${styles.modelIcon} ${styles.iconDeepSeek}`}>D</span>
          <div className={styles.modelInfo}>
            <span className={styles.modelName}>DeepSeek</span>
            <span className={styles.modelStatus}>V3 Core</span>
          </div>
        </div>
        <div className={styles.routerRow}>
          <span>⚡ API GATEWAY</span>
          <span>1,280 tps · 0.02s</span>
        </div>
      </div>
    </div>
  );
}
