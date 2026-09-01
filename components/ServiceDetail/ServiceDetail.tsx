'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ServiceItem } from '@/types';
import styles from './ServiceDetail.module.css';

interface ServiceDetailProps {
  item: ServiceItem;
  onClose: () => void;
}

export default function ServiceDetail({ item, onClose }: ServiceDetailProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Entrance animation
    const el = panelRef.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'scale(0.96) translateY(20px)';
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.35s cubic-bezier(0.16,1,0.3,1)';
      el.style.opacity = '1';
      el.style.transform = 'scale(1) translateY(0)';
    });
  }, [item]);

  const handleClose = () => {
    const el = panelRef.current;
    if (!el) { onClose(); return; }
    el.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    el.style.opacity = '0';
    el.style.transform = 'scale(0.97) translateY(16px)';
    setTimeout(onClose, 250);
  };

  const handleDiscuss = () => {
    handleClose();
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('open-ai-chat', {
        detail: { context: item.title }
      }));
    }, 300);
  };

  return (
    <div 
      className={styles.backdrop} 
      onClick={handleClose} 
      onWheel={(e) => e.stopPropagation()}
      role="dialog" 
      aria-modal="true" 
      aria-label={item.title}
    >
      <div ref={panelRef} className={styles.panel} onClick={(e) => e.stopPropagation()}>
        {/* Верхний бар */}
        <div className={styles.topBar}>
          <div className={styles.metaLeft}>
            <span className={styles.categoryBadge}>
              {item.categoryBadge || 'MINDCORE // WORKFLOW AUTOMATION'}
            </span>
            <span className={styles.divider}>/</span>
            <span className={styles.stackText}>
              {item.stack || `Стек: ${item.tags.join(' • ')}`}
            </span>
          </div>

          <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Заголовок и суть услуги */}
        <div className={styles.headerSection}>
          <h2 className={styles.title}>{item.title}</h2>
          <p className={styles.description}>{item.description}</p>
        </div>

        {/* Технические параметры надежности (3 колонки) */}
        {item.metrics && item.metrics.length >= 3 && (
          <div className={styles.metricsGrid}>
            <div className={styles.metricCol}>
              <div className={styles.metricTitle}>{item.metrics[0].title}</div>
              <div className={styles.metricDesc}>{item.metrics[0].desc}</div>
            </div>
            <div className={`${styles.metricCol} ${styles.metricBordered}`}>
              <div className={`${styles.metricTitle} ${item.metrics[1].highlight ? styles.metricHighlight : ''}`}>
                {item.metrics[1].title}
              </div>
              <div className={styles.metricDesc}>{item.metrics[1].desc}</div>
            </div>
            <div className={`${styles.metricCol} ${styles.metricBordered}`}>
              <div className={styles.metricTitle}>{item.metrics[2].title}</div>
              <div className={styles.metricDesc}>{item.metrics[2].desc}</div>
            </div>
          </div>
        )}

        {/* Что конкретно настраивается (2 карточки) */}
        {item.features && item.features.length > 0 && (
          <div className={styles.featuresList}>
            {item.features.map((feat, idx) => (
              <div key={idx} className={styles.featureCard}>
                <h4 className={styles.featureTitle}>{feat.title}</h4>
                <p className={styles.featureDesc}>{feat.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Футер */}
        <div className={styles.footerSection}>
          <span className={styles.footerNote}>
            {item.footerNote || 'Анализируем текущий стек и проектируем схему интеграций'}
          </span>
          <button className={styles.ctaBtn} onClick={handleDiscuss}>
            {item.ctaText || 'Обсудить задачу →'}
          </button>
        </div>
      </div>
    </div>
  );
}
