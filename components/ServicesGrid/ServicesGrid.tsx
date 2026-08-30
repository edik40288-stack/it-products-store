'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import ServiceCard from './ServiceCard';
import ServiceDetail from '../ServiceDetail/ServiceDetail';
import { useAppState } from '@/context/AppStateContext';
import gsap from 'gsap';
import styles from './ServicesGrid.module.css';

import { ServiceItem } from '@/types';
import { getServices } from '@/data/services';

export default function ServicesGrid() {
  const locale = useLocale();
  const items = getServices(locale);
  const { activeCardId, setActiveCardId } = useAppState();
  
  const gridRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Basic cleanup or nothing since we are removing complex GSAP mouse physics
  }, []);

  const handleCardClick = useCallback((item: ServiceItem) => {
    setActiveCardId(item.id);
  }, [setActiveCardId]);

  const servicesWithIndex = items.map((item, index) => ({ ...item, index }));

  const t = useTranslations('services');

  return (
    <section className={styles.section} id="services">
      <div className={styles.header}>
        <p className={styles.sectionLabel}>{t('title')}</p>
        <h2 className={styles.title}>
          {t('title')}
        </h2>
        <p className={styles.subtitle}>
          {t('subtitle')}
        </p>
      </div>

      <div className={styles.grid} ref={gridRef}>
        {servicesWithIndex.map((item, i) => (
          <div key={item.id} ref={(el) => { cardsRef.current[i] = el; }}>
            <ServiceCard
              item={item}
              onClick={handleCardClick}
            />
          </div>
        ))}
      </div>

      {activeCardId && (
        <ServiceDetail
          item={items.find(i => i.id === activeCardId)!}
          onClose={() => setActiveCardId(null)}
        />
      )}
    </section>
  );
}
