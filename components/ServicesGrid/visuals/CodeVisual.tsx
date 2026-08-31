'use client';

import { useEffect, useState, useRef } from 'react';
import styles from './CodeVisual.module.css';

interface VisualProps {
  hovered: boolean;
  mouseX?: number;
  mouseY?: number;
}

export default function CodeVisual({ hovered }: VisualProps) {
  // Sequence state: 0 (idle) to 12 (final deployed loop)
  const [step, setStep] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // Clear any previous running sequence
    timerRef.current.forEach(t => clearTimeout(t));
    timerRef.current = [];

    if (hovered) {
      // Precise timeline according to TZ:
      // State 1: 0ms (Empty desk, laptop closed)
      setStep(1);

      // State 2: 180ms (Developer approaches desk)
      timerRef.current.push(setTimeout(() => setStep(2), 180));

      // State 3: 400ms (Places energy drink / coffee on desk)
      timerRef.current.push(setTimeout(() => setStep(3), 400));

      // State 4: 650ms (Sits down in chair)
      timerRef.current.push(setTimeout(() => setStep(4), 650));

      // State 5: 900ms (Opens laptop lid)
      timerRef.current.push(setTimeout(() => setStep(5), 900));

      // State 6: 1100ms (Screen turns on, soft glow shines)
      timerRef.current.push(setTimeout(() => setStep(6), 1100));

      // State 7: 1350ms (Starts coding, lines of code appear on screen)
      timerRef.current.push(setTimeout(() => setStep(7), 1350));

      // State 8: 1650ms (Build process starts: BUILDING...)
      timerRef.current.push(setTimeout(() => setStep(8), 1650));

      // State 9: 1950ms (BUILD SUCCESS appears)
      timerRef.current.push(setTimeout(() => setStep(9), 1950));

      // State 10: 2200ms (Deployment starts: DEPLOYING...)
      timerRef.current.push(setTimeout(() => setStep(10), 2200));

      // State 11: 2500ms (DEPLOYED / LIVE status badge)
      timerRef.current.push(setTimeout(() => setStep(11), 2500));

      // State 12: 2800ms+ (Final state: continues working, live beacon)
      timerRef.current.push(setTimeout(() => setStep(12), 2800));
    } else {
      // Smooth reset back to idle (State 0) on pointerleave
      setStep(0);
    }

    return () => {
      timerRef.current.forEach(t => clearTimeout(t));
    };
  }, [hovered]);

  // Derived visibility & animation flags
  const isApproaching = step >= 2;
  const hasPlacedDrink = step >= 3;
  const isSeated = step >= 4;
  const isLidOpen = step >= 5;
  const isScreenOn = step >= 6;
  const isCoding = step >= 7;
  const isBuilding = step === 8;
  const isBuildSuccess = step === 9;
  const isDeploying = step === 10;
  const isLive = step >= 11;

  return (
    <div className={styles.workspaceContainer}>
      {/* Dynamic Status Badge (Steps 8-12) */}
      {step >= 8 && (
        <div 
          className={styles.statusBadge}
          style={{
            borderColor: isLive 
              ? 'rgba(34, 197, 94, 0.4)' 
              : isDeploying 
              ? 'rgba(168, 85, 247, 0.4)' 
              : isBuildSuccess 
              ? 'rgba(34, 197, 94, 0.4)' 
              : 'rgba(245, 158, 11, 0.4)'
          }}
        >
          <span 
            className={`
              ${styles.statusDot} 
              ${isBuilding ? styles.statusDotBuilding : ''}
              ${isBuildSuccess ? styles.statusDotSuccess : ''}
              ${isDeploying ? styles.statusDotDeploying : ''}
              ${isLive ? styles.statusDotLive : ''}
            `} 
          />
          <span>
            {isBuilding && 'BUILDING...'}
            {isBuildSuccess && 'BUILD SUCCESS'}
            {isDeploying && 'DEPLOYING...'}
            {isLive && '● LIVE · DEPLOYED'}
          </span>
        </div>
      )}

      {/* 2.5D Vector Workspace Scene */}
      <svg 
        className={styles.sceneSvg} 
        viewBox="0 0 240 180" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="deskTopGrad" x1="20" y1="95" x2="220" y2="125" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e2230" />
            <stop offset="100%" stopColor="#131722" />
          </linearGradient>

          <linearGradient id="deskEdgeGrad" x1="20" y1="125" x2="220" y2="132" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f121a" />
            <stop offset="100%" stopColor="#080a0f" />
          </linearGradient>

          <linearGradient id="screenBeamGrad" x1="120" y1="75" x2="120" y2="115" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(96, 165, 250, 0.35)" />
            <stop offset="100%" stopColor="rgba(96, 165, 250, 0)" />
          </linearGradient>

          <linearGradient id="hoodieGrad" x1="120" y1="60" x2="150" y2="130" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2d3348" />
            <stop offset="100%" stopColor="#1a1e2b" />
          </linearGradient>

          <linearGradient id="canGrad" x1="180" y1="96" x2="188" y2="112" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C9A84C" />
            <stop offset="100%" stopColor="#856920" />
          </linearGradient>

          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ─── 1. BACKGROUND CHAIR ─── */}
        <g 
          className={styles.chair}
          style={{
            transform: isSeated ? 'translate(0px, 0px)' : 'translate(8px, -4px)'
          }}
        >
          {/* Chair base & wheels */}
          <path d="M 120 152 L 140 152 M 130 142 L 130 152" stroke="#2a3042" strokeWidth="3" strokeLinecap="round" />
          <circle cx="118" cy="154" r="2.5" fill="#1e2330" />
          <circle cx="142" cy="154" r="2.5" fill="#1e2330" />
          {/* Chair seat */}
          <rect x="110" y="132" width="40" height="8" rx="3" fill="#1b202e" stroke="#2d344b" strokeWidth="1" />
          {/* Chair backrest */}
          <rect x="134" y="80" width="12" height="52" rx="4" fill="#181c28" stroke="#282f42" strokeWidth="1" />
          {/* Headrest */}
          <rect x="135" y="66" width="10" height="12" rx="3" fill="#202535" stroke="#313a52" strokeWidth="1" />
        </g>

        {/* ─── 2. DEVELOPER CHARACTER (States 2, 4, 7) ─── */}
        <g 
          className={styles.developer}
          style={{
            transform: !isApproaching 
              ? 'translate(60px, 0px)' 
              : isSeated 
              ? 'translate(0px, 0px)' 
              : 'translate(18px, -12px)',
            opacity: !isApproaching ? 0 : 1
          }}
        >
          {/* Character Body / Hoodie */}
          <path 
            d="M 126 84 C 120 86 112 100 110 134 L 146 134 C 146 102 140 86 134 84 Z" 
            fill="url(#hoodieGrad)" 
            stroke="#3a425c" 
            strokeWidth="1" 
          />

          {/* Head & Hair */}
          <circle cx="130" cy="70" r="11" fill="#202433" stroke="#384058" strokeWidth="1" />
          {/* Hair silhouette */}
          <path d="M 120 68 C 120 58 138 56 141 68 C 137 63 125 63 120 68 Z" fill="#12151e" />

          {/* Headphones */}
          <path d="M 121 68 A 9 9 0 0 1 139 68" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="119" y="66" width="3" height="7" rx="1.5" fill="#C9A84C" />
          <rect x="138" y="66" width="3" height="7" rx="1.5" fill="#C9A84C" />

          {/* Arms / Hands */}
          {isCoding ? (
            /* Hands on keyboard typing */
            <path 
              d="M 112 104 Q 102 114 98 116 M 126 104 Q 112 115 106 117" 
              stroke="#2d3348" 
              strokeWidth="5" 
              strokeLinecap="round" 
            />
          ) : (
            /* Hands resting / approaching */
            <path 
              d="M 116 104 Q 120 120 125 128 M 134 104 Q 142 118 146 128" 
              stroke="#2d3348" 
              strokeWidth="5" 
              strokeLinecap="round" 
            />
          )}
        </g>

        {/* ─── 3. WORKSPACE TABLE (Isometric Desk Surface) ─── */}
        <g className={styles.desk}>
          {/* Desk Legs */}
          <path d="M 36 120 L 36 168 M 204 120 L 204 168" stroke="#161922" strokeWidth="4" strokeLinecap="round" />
          {/* Desk Top Bevel */}
          <polygon points="20,118 60,94 220,94 180,118" fill="url(#deskTopGrad)" stroke="#2b3245" strokeWidth="1" />
          {/* Desk Front Edge */}
          <polygon points="20,118 180,118 180,125 20,125" fill="url(#deskEdgeGrad)" />
        </g>

        {/* ─── 4. ENERGY DRINK CAN / COFFEE (State 3+) ─── */}
        <g 
          className={styles.drinkCan}
          style={{
            transform: hasPlacedDrink ? 'translate(0px, 0px)' : 'translate(10px, -24px)',
            opacity: hasPlacedDrink ? 1 : 0
          }}
        >
          {/* Can shadow */}
          <ellipse cx="172" cy="107" rx="5" ry="2" fill="rgba(0, 0, 0, 0.5)" />
          {/* Can Cylinder */}
          <rect x="168" y="94" width="8" height="13" rx="2" fill="url(#canGrad)" stroke="#d4af37" strokeWidth="0.8" />
          {/* Logo on Can */}
          <path d="M 172 97 L 170 102 L 174 102 L 172 106" stroke="#fff" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        </g>

        {/* ─── 5. LAPTOP & CODE SCREEN (States 1, 5, 6, 7+) ─── */}
        <g transform="translate(68, 86)">
          {/* Laptop Base on Desk */}
          <polygon points="12,28 48,28 42,34 6,34" fill="#222634" stroke="#373e54" strokeWidth="0.8" />
          {/* Trackpad */}
          <rect x="20" y="30" width="12" height="3" rx="0.5" fill="#171922" />

          {/* Screen Light Beam onto Desk (States 6+) */}
          {isScreenOn && (
            <polygon 
              points="14,10 46,10 56,38 4,38" 
              fill="url(#screenBeamGrad)" 
              className={styles.screenGlow} 
            />
          )}

          {/* Laptop Lid & Display */}
          <g 
            className={styles.laptopLid}
            style={{
              transform: isLidOpen ? 'rotateX(0deg)' : 'rotateX(82deg)',
              transformOrigin: '27px 28px'
            }}
          >
            {/* Screen Bezel */}
            <rect x="12" y="8" width="34" height="21" rx="1.5" fill="#11131a" stroke="#373e54" strokeWidth="1" />

            {/* Screen Glass Display */}
            <rect 
              x="14" 
              y="10" 
              width="30" 
              height="17" 
              rx="1" 
              fill={isScreenOn ? '#0d1117' : '#080a0f'} 
            />

            {/* Live Code Lines (State 7+) */}
            {isCoding && (
              <g className={styles.codeLine}>
                {/* Code syntax lines */}
                <line x1="16" y1="13" x2="25" y2="13" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" />
                <line x1="27" y1="13" x2="33" y2="13" stroke="#a855f7" strokeWidth="1" strokeLinecap="round" />
                
                <line x1="16" y1="16" x2="22" y2="16" stroke="#22c55e" strokeWidth="1" strokeLinecap="round" />
                <line x1="24" y1="16" x2="38" y2="16" stroke="#C9A84C" strokeWidth="1" strokeLinecap="round" />

                <line x1="18" y1="19" x2="30" y2="19" stroke="#f43f5e" strokeWidth="1" strokeLinecap="round" />
                <line x1="18" y1="22" x2="36" y2="22" stroke="#60a5fa" strokeWidth="1" strokeLinecap="round" />

                {/* Blinking Cursor */}
                <line x1="38" y1="22" x2="39" y2="22" stroke="#fff" strokeWidth="1.2">
                  <animate attributeName="opacity" values="1;0;1" dur="0.8s" repeatCount="indefinite" />
                </line>
              </g>
            )}

            {/* Mini Screen Status Pill at Bottom of Screen (Step 11-12) */}
            {isLive && (
              <g>
                <rect x="22" y="24.5" width="14" height="2" rx="1" fill="#22c55e" opacity="0.9" />
              </g>
            )}
          </g>
        </g>
      </svg>
    </div>
  );
}
