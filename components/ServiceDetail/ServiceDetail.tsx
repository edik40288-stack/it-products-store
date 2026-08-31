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
  const t = useTranslations('serviceDetail');

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
        {/* Header bar */}
        <div className={styles.panelHeader}>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
            <span>✕</span>
          </button>
          <div className={styles.meta}>
            <span className={styles.metaDuration}>⏱ {item.duration}</span>
            <div className={styles.metaTags}>
              {item.tags.map((tag: string) => (
                <span key={tag} className={styles.metaTag}>{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className={styles.panelBody}>
          <div className={styles.contentArea}>
            {/* Title block */}
            <div className={styles.titleBlock}>
              <h2 className={styles.title}>{item.title}</h2>
              <p className={styles.subtitle}>{item.subtitle}</p>
            </div>

            {/* Description */}
            <p className={styles.description}>{item.description}</p>

            {/* Value props */}
            <div className={styles.props}>
              <div className={styles.prop}>
                <span className={styles.propIcon}>⚡</span>
                <div>
                  <strong>{t('fastDelivery')}</strong>
                  <p>{t('fastDeliveryDesc')}</p>
                </div>
              </div>
              <div className={styles.prop}>
                <span className={styles.propIcon}>🎯</span>
                <div>
                  <strong>{t('businessFirst')}</strong>
                  <p>{t('businessFirstDesc')}</p>
                </div>
              </div>
              <div className={styles.prop}>
                <span className={styles.propIcon}>🔧</span>
                <div>
                  <strong>{t('fullOwnership')}</strong>
                  <p>{t('fullOwnershipDesc')}</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className={styles.ctas}>
              <button
                className={styles.ctaPrimary}
                onClick={() => {
                  handleClose();
                  setTimeout(() => {
                    document.dispatchEvent(new CustomEvent('open-ai-chat', {
                      detail: { context: item.title }
                    }));
                  }, 300);
                }}
              >
                {t('discussProject')} 💬
              </button>

              <div className={styles.directLinks}>
                <a href="https://t.me/kraeved111" target="_blank" rel="noopener noreferrer" className={styles.directBtn}>
                  Telegram
                </a>
                <a href="https://wa.me/4207278671129" target="_blank" rel="noopener noreferrer" className={styles.directBtn}>
                  WhatsApp
                </a>
                <a href="mailto:edik40288@gmail.com" className={styles.directBtn}>
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
