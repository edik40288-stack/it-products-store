'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { ServiceItem } from '@/types';
import styles from './ServiceCard.module.css';
import { useWebGL } from '@/context/WebGLContext';

const SERVICE_VIDEOS: Record<string, string> = {
  'development': '/videos/development.mp4',
  'ai-agents': '/videos/ai-agents.mp4',
  'crm': '/videos/crm.mp4',
  'llm-integrations': '/videos/llm-api.mp4',
  'automation': '/videos/automation.mp4',
  'analytics': '/videos/analytics.mp4',
  'redesign': '/videos/redesign.mp4',
  'security': '/videos/security.mp4',
};

const SERVICE_POSTERS: Record<string, string> = {
  'development': '/images/posters/development.webp',
  'ai-agents': '/images/posters/ai-agents.webp',
  'crm': '/images/posters/crm.webp',
  'llm-integrations': '/images/posters/llm-api.webp',
  'automation': '/images/posters/automation.webp',
  'analytics': '/images/posters/analytics.webp',
  'redesign': '/images/posters/redesign.webp',
  'security': '/images/posters/security.webp',
};

interface ServiceCardProps {
  item: ServiceItem;
  onClick: (item: ServiceItem) => void;
}

export default function ServiceCard({ item, onClick }: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  
  const cardRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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

  // Lazy-load & decode video only when card approaches viewport (250px margin)
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setIsInView(entries[0].isIntersecting);
      },
      { rootMargin: '250px 0px 250px 0px', threshold: 0.02 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Control video play/pause based on in-view status
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isInView) {
      video.muted = true;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isInView]);

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
        {/* Holographic 3D Visual with native poster & autoplay */}
        <div className={styles.visualWrap}>
          <video
            ref={(el) => {
              if (el) {
                el.muted = true;
                el.defaultMuted = true;
                if (el.paused) {
                  el.play().catch(() => {});
                }
              }
            }}
            src={`${SERVICE_VIDEOS[item.id] || '/videos/development.mp4'}#t=0.001`}
            poster={SERVICE_POSTERS[item.id] || '/images/posters/development.webp'}
            className={styles.cardVideo}
            muted
            playsInline
            autoPlay
            loop
            preload="auto"
            disablePictureInPicture
            controls={false}
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
