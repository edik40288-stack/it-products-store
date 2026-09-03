'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { ServiceItem } from '@/types';
import styles from './ServiceCard.module.css';
import { useWebGL } from '@/context/WebGLContext';

const SERVICE_ANIMS: Record<string, string> = {
  'development': '/images/anim/development.webp',
  'ai-agents': '/images/anim/ai-agents.webp',
  'crm': '/images/anim/crm.webp',
  'llm-integrations': '/images/anim/llm-api.webp',
  'automation': '/images/anim/automation.webp',
  'analytics': '/images/anim/analytics.webp',
  'redesign': '/images/anim/redesign.webp',
  'security': '/images/anim/security.webp',
};

interface ServiceCardProps {
  item: ServiceItem;
  onClick: (item: ServiceItem) => void;
}

export default function ServiceCard({ item, onClick }: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  
  const cardRef = useRef<HTMLElement>(null);
  const webGL = useWebGL();

  useEffect(() => {
    if (cardRef.current && webGL) {
      webGL.registerCard(item.id, cardRef.current, item.id);
    }
    return () => {
      if (webGL) webGL.unregisterCard(item.id);
    };
  }, [item.id, webGL]);

  useEffect(() => {
    if (webGL) webGL.setCardHover(item.id, isHovered);
  }, [isHovered, item.id, webGL]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    setMousePos({ x: relX, y: relY });
    if (webGL) {
      webGL.updateCardMouse(item.id, relX, relY, e.clientX, e.clientY);
    }
  }, [item.id, webGL]);

  const handleClick = useCallback(() => {
    onClick(item);
  }, [item, onClick]);

  return (
    <div 
      className={styles.cardWrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`View ${item.title} service details`}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <article
        ref={cardRef}
        className={`${styles.card} ${isHovered ? styles.cardHovered : ''}`}
      >
        {/* Holographic 3D Animated Visual (100% immune to iOS Low Power Mode play button) */}
        <div className={styles.visualWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SERVICE_ANIMS[item.id] || '/images/anim/development.webp'}
            alt=""
            aria-hidden="true"
            className={styles.cardVideo}
            loading="lazy"
            decoding="async"
          />
          <div className={styles.videoOverlay} />
        </div>

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
    </div>
  );
}
