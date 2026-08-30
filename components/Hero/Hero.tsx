'use client';

import { useTranslations } from 'next-intl';
import styles from './Hero.module.css';
import InteractiveRobot from './InteractiveRobot';

export default function Hero() {
  const t = useTranslations('hero');
  
  return (
    <section className={styles.hero} id="hero">
      {/* Interactive Robot Animation */}
      <InteractiveRobot />

      {/* Typography block */}
      <div className={styles.content}>
        <h1 className={styles.heading}>
          {t('title')}
        </h1>

        <p className={styles.subtext}>
          {t('subtitle').split('\n').map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </p>

        <div className={styles.ctas}>
          <a href="#contact" className={styles.ctaPrimary}>
            {t('cta')}
            <span className={styles.ctaArrow}>→</span>
          </a>
          <a href="#cases" className={styles.ctaSecondary}>
            {t('ctaSecondary')}
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollHint} aria-hidden="true">
        <div className={styles.scrollLine} />
        <span className={styles.scrollLabel}>scroll</span>
      </div>
    </section>
  );
}
