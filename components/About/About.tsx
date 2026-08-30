import { useTranslations } from 'next-intl';
import styles from './About.module.css';
import { locations } from '@/data/locations';

export default function About() {
  const t = useTranslations('About');

  return (
    <section className={styles.section} id="about">
      <div className={styles.header}>
        <div className={styles.sectionLabel}>{t('label') || 'Studio'}</div>
        <h2 className={styles.title}>
          We build digital products that <span className={styles.highlight}>scale</span> and <span className={styles.highlight}>sell themselves</span>.
        </h2>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.stat}>
          <div className={styles.statNumber}>10+</div>
          <div className={styles.statLabel}>Years of expertise</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statNumber}>50+</div>
          <div className={styles.statLabel}>Engineers & Designers</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statNumber}>3</div>
          <div className={styles.statLabel}>Global Locations</div>
        </div>
      </div>

      <div className={styles.locations}>
        {locations.map((loc) => (
          <div key={loc.city} className={styles.location}>
            <div className={styles.locationCity}>{loc.city}</div>
            <div className={styles.locationDesc}>{loc.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
