'use client';

import { useEffect, useRef } from 'react';
import { ServiceItem } from '@/types';
import styles from './ServiceDetail.module.css';
import PriceCalculator from './PriceCalculator';

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
      el.style.transition = 'opacity 0.5s cubic-bezier(0.4,0,0.2,1), transform 0.5s cubic-bezier(0.4,0,0.2,1)';
      el.style.opacity = '1';
      el.style.transform = 'scale(1) translateY(0)';
    });
  }, [item]);

  const handleClose = () => {
    const el = panelRef.current;
    if (!el) { onClose(); return; }
    el.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    el.style.opacity = '0';
    el.style.transform = 'scale(0.97) translateY(16px)';
    setTimeout(onClose, 350);
  };

  return (
    <div className={styles.backdrop} onClick={handleClose} role="dialog" aria-modal="true" aria-label={item.title}>
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
                  <strong>Fast delivery</strong>
                  <p>We ship MVPs in weeks, not months. Agile sprints with daily updates.</p>
                </div>
              </div>
              <div className={styles.prop}>
                <span className={styles.propIcon}>🎯</span>
                <div>
                  <strong>Business-first approach</strong>
                  <p>Every feature tied to a conversion or efficiency metric.</p>
                </div>
              </div>
              <div className={styles.prop}>
                <span className={styles.propIcon}>🔧</span>
                <div>
                  <strong>Full ownership transfer</strong>
                  <p>Clean code, documentation, and zero vendor lock-in.</p>
                </div>
              </div>
            </div>

            {/* Price calculator */}
            <PriceCalculator serviceId={item.id} />

            {/* CTA */}
            <div className={styles.ctas}>
              <button
                className={styles.ctaPrimary}
                onClick={() => {
                  handleClose();
                  // Open AI chat after modal closes
                  setTimeout(() => {
                    document.dispatchEvent(new CustomEvent('open-ai-chat', {
                      detail: { context: item.title }
                    }));
                  }, 400);
                }}
              >
                Discuss this project →
              </button>
              <a href={`mailto:newbusiness@mindcore.studio?subject=${encodeURIComponent(item.title)}`}
                className={styles.ctaSecondary}>
                Send email directly
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
