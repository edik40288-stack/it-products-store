'use client';

import { useEffect, useState, useRef } from 'react';
import styles from './CodeVisual.module.css';

interface VisualProps {
  hovered: boolean;
  mouseX?: number;
  mouseY?: number;
}

export default function CodeVisual({ hovered }: VisualProps) {
  // Sequence states 0 to 12
  const [step, setStep] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    timerRef.current.forEach(t => clearTimeout(t));
    timerRef.current = [];

    if (hovered) {
      // Precise timeline for 13-step sequence
      setStep(1); // 0ms: State 1 (Idle workspace)
      timerRef.current.push(setTimeout(() => setStep(2), 200)); // State 2: Developer approaches
      timerRef.current.push(setTimeout(() => setStep(3), 450)); // State 3: Places drink/coffee
      timerRef.current.push(setTimeout(() => setStep(4), 700)); // State 4: Sits down
      timerRef.current.push(setTimeout(() => setStep(5), 950)); // State 5: Opens laptop lid
      timerRef.current.push(setTimeout(() => setStep(6), 1150)); // State 6: Screen turns on
      timerRef.current.push(setTimeout(() => setStep(7), 1400)); // State 7: Starts coding
      timerRef.current.push(setTimeout(() => setStep(8), 1700)); // State 8: Build starts
      timerRef.current.push(setTimeout(() => setStep(9), 2000)); // State 9: BUILD SUCCESS
      timerRef.current.push(setTimeout(() => setStep(10), 2250)); // State 10: Deploying
      timerRef.current.push(setTimeout(() => setStep(11), 2550)); // State 11: LIVE / DEPLOYED
      timerRef.current.push(setTimeout(() => setStep(12), 2850)); // State 12: Working persistently
    } else {
      setStep(0); // Reset smoothly on mouseleave
    }

    return () => {
      timerRef.current.forEach(t => clearTimeout(t));
    };
  }, [hovered]);

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
      {/* Top Glass Status Badge (Steps 8-12) */}
      {step >= 8 && (
        <div 
          className={styles.statusBadge}
          style={{
            borderColor: isLive 
              ? 'rgba(34, 197, 94, 0.45)' 
              : isDeploying 
              ? 'rgba(168, 85, 247, 0.45)' 
              : isBuildSuccess 
              ? 'rgba(34, 197, 94, 0.45)' 
              : 'rgba(245, 158, 11, 0.45)'
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
            {isLive && '● LIVE · 18ms'}
          </span>
        </div>
      )}

      {/* Isometric 2.5D Studio Workstation Scene */}
      <svg 
        className={styles.sceneSvg} 
        viewBox="0 0 240 180" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="podiumTop" x1="40" y1="90" x2="210" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e2230" />
            <stop offset="100%" stopColor="#11141c" />
          </linearGradient>

          <linearGradient id="podiumEdge" x1="40" y1="135" x2="210" y2="155" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#151822" />
            <stop offset="100%" stopColor="#0a0c12" />
          </linearGradient>

          <linearGradient id="laptopChassis" x1="60" y1="100" x2="130" y2="130" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2c3244" />
            <stop offset="100%" stopColor="#1a1e2b" />
          </linearGradient>

          <linearGradient id="screenBeam" x1="90" y1="70" x2="110" y2="125" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.4)" />
            <stop offset="50%" stopColor="rgba(168, 85, 247, 0.15)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </linearGradient>

          <linearGradient id="thermosGrad" x1="170" y1="96" x2="182" y2="116" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C9A84C" />
            <stop offset="60%" stopColor="#242838" />
            <stop offset="100%" stopColor="#12151e" />
          </linearGradient>

          <linearGradient id="devHoodie" x1="120" y1="65" x2="165" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#262c3e" />
            <stop offset="100%" stopColor="#131620" />
          </linearGradient>
        </defs>

        {/* ─── 1. ISOMETRIC DESK PODIUM ─── */}
        <g id="desk-platform">
          {/* Desk shadow */}
          <polygon points="50,158 135,174 215,142 130,128" fill="rgba(0,0,0,0.6)" filter="blur(4px)" />
          {/* Desk Legs / Stand */}
          <path d="M 68 140 L 68 165 M 198 126 L 198 150" stroke="#161922" strokeWidth="4" strokeLinecap="round" />
          {/* Desk Isometric Surface */}
          <polygon points="50,132 135,148 215,116 130,100" fill="url(#podiumTop)" stroke="#2b3346" strokeWidth="1" />
          {/* Desk Front Edge */}
          <polygon points="50,132 135,148 135,155 50,139" fill="url(#podiumEdge)" stroke="#1f2432" strokeWidth="0.5" />
          <polygon points="135,148 215,116 215,123 135,155" fill="#0c0e14" />
        </g>

        {/* ─── 2. ERGONOMIC CHAIR (Behind Developer) ─── */}
        <g 
          className={styles.chair}
          style={{
            transform: isSeated ? 'translate(0px, 0px)' : 'translate(10px, -6px)'
          }}
        >
          {/* Chair base */}
          <path d="M 136 158 L 152 162 M 144 148 L 144 160" stroke="#1f2535" strokeWidth="3" strokeLinecap="round" />
          {/* Seat Cushion */}
          <polygon points="125,138 152,143 162,133 135,128" fill="#181c28" stroke="#2a3246" strokeWidth="1" />
          {/* Backrest Mesh */}
          <polygon points="145,95 158,97 165,130 152,128" fill="#131620" stroke="#252b3c" strokeWidth="1" />
          {/* Headrest */}
          <rect x="148" y="80" width="10" height="12" rx="3" fill="#1c2130" stroke="#2c354a" strokeWidth="1" />
        </g>

        {/* ─── 3. DEVELOPER PRESENCE (States 2, 4, 7) ─── */}
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
          {/* Developer Torso */}
          <polygon 
            points="126,102 154,106 158,140 120,136" 
            fill="url(#devHoodie)" 
            stroke="#343d54" 
            strokeWidth="1" 
          />

          {/* Head & Hair */}
          <circle cx="140" cy="85" r="10" fill="#1a1e2b" stroke="#323a4f" strokeWidth="1" />
          <path d="M 132 82 C 132 74 148 72 150 82 C 146 78 136 78 132 82 Z" fill="#0d0f17" />

          {/* Studio Headphones with Gold Ring */}
          <path d="M 133 83 A 8 8 0 0 1 148 83" fill="none" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" />
          <rect x="131" y="81" width="3" height="6" rx="1.5" fill="#C9A84C" />
          <rect x="147" y="81" width="3" height="6" rx="1.5" fill="#C9A84C" />

          {/* Arms / Typing Hands */}
          {isCoding ? (
            <path 
              d="M 126 112 L 108 122 M 138 114 L 118 124" 
              stroke="#2e354a" 
              strokeWidth="4.5" 
              strokeLinecap="round" 
            />
          ) : (
            <path 
              d="M 128 114 L 132 132 M 145 116 L 152 132" 
              stroke="#262b3d" 
              strokeWidth="4" 
              strokeLinecap="round" 
            />
          )}
        </g>

        {/* ─── 4. THERMOS MUG / COFFEE (State 3+) ─── */}
        <g 
          className={styles.drinkCan}
          style={{
            transform: hasPlacedDrink ? 'translate(0px, 0px)' : 'translate(8px, -20px)',
            opacity: hasPlacedDrink ? 1 : 0
          }}
        >
          {/* Mug shadow */}
          <ellipse cx="174" cy="118" rx="6" ry="3" fill="rgba(0,0,0,0.5)" />
          {/* Thermos body */}
          <rect x="170" y="104" width="8" height="15" rx="2.5" fill="url(#thermosGrad)" stroke="#d4af37" strokeWidth="0.8" />
          {/* Gold lid */}
          <rect x="169" y="103" width="10" height="2" rx="1" fill="#C9A84C" />
        </g>

        {/* ─── 5. ISOMETRIC MACBOOK WORKSTATION (States 1, 5, 6, 7+) ─── */}
        <g id="macbook-workstation" transform="translate(68, 92)">
          {/* Laptop Base in Isometric Perspective */}
          <polygon points="14,24 50,30 42,37 6,31" fill="url(#laptopChassis)" stroke="#3f4760" strokeWidth="0.8" />
          {/* Keyboard & Trackpad */}
          <polygon points="18,26 44,30 38,34 12,30" fill="#0d1017" />
          <polygon points="22,32 30,33 28,35 20,34" fill="#181d28" />

          {/* Screen Light Beam onto Table (States 6+) */}
          {isScreenOn && (
            <polygon 
              points="16,8 48,13 54,34 8,30" 
              fill="url(#screenBeam)" 
              className={styles.screenGlow} 
            />
          )}

          {/* Laptop Display (Smooth 3D Lid Open) */}
          <g 
            className={styles.laptopLid}
            style={{
              transform: isLidOpen ? 'rotateX(0deg)' : 'rotateX(82deg)',
              transformOrigin: '27px 28px'
            }}
          >
            {/* Screen Bezel in Isometric Angle */}
            <polygon points="14,6 48,11 48,27 14,22" fill="#0d0f15" stroke="#3d465e" strokeWidth="1" />

            {/* Screen Glass */}
            <polygon 
              points="16,8 46,12.5 46,25.5 16,21" 
              fill={isScreenOn ? '#090d14' : '#05070a'} 
            />

            {/* Live Syntax Code Lines (State 7+) */}
            {isCoding && (
              <g className={styles.codeLine}>
                <line x1="18" y1="11" x2="26" y2="12.2" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="28" y1="12.5" x2="36" y2="13.7" stroke="#c084fc" strokeWidth="1.2" strokeLinecap="round" />

                <line x1="18" y1="14" x2="24" y2="15" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="26" y1="15.3" x2="42" y2="17.7" stroke="#C9A84C" strokeWidth="1.2" strokeLinecap="round" />

                <line x1="20" y1="17.5" x2="32" y2="19.3" stroke="#f43f5e" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="20" y1="20.5" x2="38" y2="23.2" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round" />

                {/* Blinking Cursor */}
                <line x1="40" y1="23.5" x2="41" y2="23.7" stroke="#fff" strokeWidth="1.5">
                  <animate attributeName="opacity" values="1;0;1" dur="0.8s" repeatCount="indefinite" />
                </line>
              </g>
            )}

            {/* Micro Live Beacon on Screen when Deployed (Steps 11-12) */}
            {isLive && (
              <circle cx="43" cy="14" r="1.5" fill="#22c55e">
                <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        </g>
      </svg>
    </div>
  );
}
