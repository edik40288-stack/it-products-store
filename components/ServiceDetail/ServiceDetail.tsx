'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from 'next-intl';
import { ServiceItem } from '@/types';
import styles from './ServiceDetail.module.css';

interface ServiceDetailProps {
  item: ServiceItem;
  onClose: () => void;
}

export default function ServiceDetail({ item, onClose }: ServiceDetailProps) {
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const el = panelRef.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'scale(0.96) translateY(20px)';
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.35s cubic-bezier(0.16,1,0.3,1)';
      el.style.opacity = '1';
      el.style.transform = 'scale(1) translateY(0)';
    });
  }, [mounted, item]);

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

  if (!mounted) return null;

  return createPortal(
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
              {item.stack || `${locale === 'ru' ? 'Стек: ' : 'Stack: '}${item.tags.join(' • ')}`}
            </span>
          </div>

          <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Header */}
        <div className={styles.headerSection}>
          <h2 className={styles.title}>{item.title}</h2>
          <p className={styles.description}>{item.description}</p>
        </div>

        {/* Metrics Grid */}
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

        {/* Features */}
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

        {/* Footer */}
        <div className={styles.footerSection}>
          <span className={styles.footerNote}>
            {item.footerNote || (locale === 'ru' ? 'Анализируем текущий стек и проектируем схему интеграций' : locale === 'ro' ? 'Analizăm stack-ul actual și proiectăm schema de integrare' : 'Analyzing current stack and designing integration roadmap')}
          </span>
          <button className={styles.ctaBtn} onClick={handleDiscuss}>
            {item.ctaText || (locale === 'ru' ? 'Обсудить задачу →' : locale === 'ro' ? 'Discută sarcina →' : 'Discuss project →')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
