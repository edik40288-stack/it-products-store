'use client';

import { useState } from 'react';
import styles from './InteractiveRobot.module.css';

export default function InteractiveRobot() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={styles.container}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-hidden="true"
    >
      {/* Robot SVG */}
      <svg
        className={`${styles.robot} ${isHovered ? styles.robotHovered : styles.robotIdle}`}
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="laptopScreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A2035" />
            <stop offset="100%" stopColor="#0B0D17" />
          </linearGradient>
        </defs>

        {/* --- IDLE STATE --- */}
        {/* Head */}
        <g className={styles.headGroup}>
          <rect x="110" y="70" width="80" height="70" rx="16" stroke="#C9A84C" strokeWidth="2" fill="#0A0A0C" />
          {/* Eyes */}
          <circle cx="130" cy="100" r="5" fill="#C9A84C" filter="url(#glow)" />
          <circle cx="170" cy="100" r="5" fill="#C9A84C" filter="url(#glow)" />
          {/* Antenna */}
          <line x1="150" y1="70" x2="150" y2="50" stroke="#C9A84C" strokeWidth="2" />
          <circle cx="150" cy="50" r="3" fill="#C9A84C" className={styles.antennaIdle} />
        </g>

        {/* Body */}
        <rect x="100" y="150" width="100" height="70" rx="12" stroke="#6B5BEF" strokeWidth="2" fill="#0A0A0C" />
        
        {/* Idle Loading Spinner on chest (only visible when not hovered) */}
        <g className={styles.loadingSpinner}>
          <circle cx="150" cy="185" r="12" stroke="#6B5BEF" strokeWidth="2" strokeDasharray="30 60" fill="none" />
          <circle cx="150" cy="185" r="4" fill="#6B5BEF" filter="url(#glow)" />
        </g>

        {/* Arms (Idle position) */}
        <g className={styles.armsIdle}>
          <path d="M 90 160 Q 60 190 90 220" stroke="#6B5BEF" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 210 160 Q 240 190 210 220" stroke="#6B5BEF" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>

        {/* --- HOVER STATE (Coding) --- */}
        {/* Laptop (only visible when hovered) */}
        <g className={styles.laptopGroup}>
          {/* Laptop Base */}
          <path d="M 80 230 L 220 230 L 240 250 L 60 250 Z" fill="#22263A" stroke="#6B5BEF" strokeWidth="1" />
          <rect x="120" y="235" width="60" height="8" rx="2" fill="#121520" />
          
          {/* Laptop Screen */}
          <rect x="95" y="170" width="110" height="60" rx="4" fill="url(#laptopScreen)" stroke="#6B5BEF" strokeWidth="1.5" />
          
          {/* Code lines on screen animating */}
          <g className={styles.codeLines}>
            <rect x="105" y="180" width="40" height="2" fill="#C9A84C" className={styles.code1} />
            <rect x="105" y="186" width="70" height="2" fill="#6B5BEF" className={styles.code2} />
            <rect x="115" y="192" width="60" height="2" fill="#6B5BEF" className={styles.code3} />
            <rect x="105" y="198" width="50" height="2" fill="#C9A84C" className={styles.code4} />
            <rect x="105" y="210" width="30" height="2" fill="#fff" className={styles.code5} />
          </g>
        </g>

        {/* Arms (Typing position - visible when hovered) */}
        <g className={styles.armsTyping}>
          <path d="M 90 160 Q 70 190 110 235" stroke="#6B5BEF" strokeWidth="3" fill="none" strokeLinecap="round" className={styles.armLeft} />
          <path d="M 210 160 Q 230 190 190 235" stroke="#6B5BEF" strokeWidth="3" fill="none" strokeLinecap="round" className={styles.armRight} />
        </g>

      </svg>
    </div>
  );
}
