'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { ServiceItem } from '@/types';
import styles from './ServiceCard.module.css';
import { useWebGL } from '@/context/WebGLContext';

import CodeVisual from './visuals/CodeVisual';
import ChatVisual from './visuals/ChatVisual';
import DashboardVisual from './visuals/DashboardVisual';
import LLMVisual from './visuals/LLMVisual';
import GearsVisual from './visuals/GearsVisual';
import RadarVisual from './visuals/RadarVisual';
import SplitVisual from './visuals/SplitVisual';
import ScannerVisual from './visuals/ScannerVisual';

function renderServiceVisual(id: string, isHovered: boolean, mouseX: number, mouseY: number) {
  switch (id) {
    case 'development':
      return <CodeVisual hovered={isHovered} mouseX={mouseX} mouseY={mouseY} />;
    case 'ai-agents':
      return <ChatVisual hovered={isHovered} mouseX={mouseX} mouseY={mouseY} />;
    case 'crm':
      return <DashboardVisual hovered={isHovered} mouseX={mouseX} mouseY={mouseY} />;
    case 'llm-integrations':
      return <LLMVisual hovered={isHovered} mouseX={mouseX} mouseY={mouseY} />;
    case 'automation':
      return <GearsVisual hovered={isHovered} mouseX={mouseX} mouseY={mouseY} />;
    case 'analytics':
      return <RadarVisual hovered={isHovered} mouseX={mouseX} mouseY={mouseY} />;
    case 'redesign':
      return <SplitVisual hovered={isHovered} mouseX={mouseX} mouseY={mouseY} />;
    case 'security':
      return <ScannerVisual hovered={isHovered} mouseX={mouseX} mouseY={mouseY} />;
    default:
      return <CodeVisual hovered={isHovered} mouseX={mouseX} mouseY={mouseY} />;
  }
}

interface ServiceCardProps {
  item: ServiceItem;
  onClick: (item: ServiceItem) => void;
}

export default function ServiceCard({ item, onClick }: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
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
    setMousePos({ x: relX, y: relY });
    updateCardMouse(item.id, relX, relY, e.clientX, e.clientY);
  }, [item.id, updateCardMouse]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setMousePos({ x: 0.5, y: 0.5 });
  }, []);
  const handleClick = useCallback(() => onClick(item), [item, onClick]);

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
        {/* Holographic 3D Visual */}
        <div className={styles.visualWrap}>
          {renderServiceVisual(item.id, isHovered, mousePos.x, mousePos.y)}
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
