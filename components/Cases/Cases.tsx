import { useTranslations } from 'next-intl';
import styles from './Cases.module.css';
import Image from 'next/image';

import { casesData } from '@/data/cases';

export default function Cases() {
  const t = useTranslations('Cases');

  return (
    <section className={styles.section} id="cases">
      <div className={styles.header}>
        <div className={styles.sectionLabel}>{t('label') || 'Selected Works'}</div>
        <h2 className={styles.title}>{t('title') || 'Featured Cases'}</h2>
      </div>

      <div className={styles.grid}>
        {casesData.map((item) => (
          <div key={item.id} className={styles.card} style={{ background: item.color }}>
            <div className={styles.cardContent}>
              <div className={styles.tags}>
                {item.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardCategory}>{item.category}</p>
            </div>
            {/* Placeholder for image/mockup */}
            <div className={styles.mockupPlaceholder}></div>
          </div>
        ))}
      </div>
    </section>
  );
}
