'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { ServiceItem } from '@/types';
import styles from './ServiceCard.module.css';
import { useWebGL } from '@/context/WebGLContext';

interface ServiceCardProps {
  item: ServiceItem;
  onClick: (item: ServiceItem) => void;
}

export default function ServiceCard({ item, onClick }: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const { registerCard, unregisterCard, updateCardMouse, setCardHover } = useWebGL();

  useEffect(() => {
    if (cardRef.current) {
      registerCard(item.id, cardRef.current, item.id);
    }
    return () => {
      unregisterCard(item.id);
    };
  }, [item.id, registerCard, unregisterCard]);

  useEffect(() => {
    setCardHover(item.id, isHovered);
  }, [isHovered, item.id, setCardHover]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    // Normalized coordinates from 0 to 1
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    updateCardMouse(item.id, relX, relY, e.clientX, e.clientY);
  }, [item.id, updateCardMouse]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  const handleClick = useCallback(() => onClick(item), [item, onClick]);

  return (
    <article
      ref={cardRef}
      className={`${styles.card} ${isHovered ? styles.cardHovered : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`View ${item.title} service details`}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className={styles.overlay} />
      
      {/* Content */}
      <div className={styles.content}>
        <div className={styles.tags}>
          {item.tags.slice(0, 3).map((tag: string) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
        <h3 className={styles.title}>{item.title}</h3>
        <p className={styles.subtitle}>{item.subtitle}</p>
        <div className={styles.footer}>
          <span className={styles.duration}>⏱ {item.duration}</span>
          <span className={styles.cta}>Explore →</span>
        </div>
      </div>
    </article>
  );
}
