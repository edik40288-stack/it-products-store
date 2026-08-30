'use client';
import styles from '../CardVisual.module.css';

export default function GearsVisual({ hovered }: { hovered: boolean }) {
  return (
    <svg className={styles.gearsSvg} viewBox="0 0 220 160" fill="none">
      {/* Large gear */}
      <g className={hovered ? styles.gearRotateCW : ''} style={{ transformOrigin: '80px 80px' }}>
        <circle cx="80" cy="80" r="35" stroke="rgba(201,168,76,0.5)" strokeWidth="1.5" fill="rgba(201,168,76,0.04)" />
        <circle cx="80" cy="80" r="22" stroke="rgba(201,168,76,0.3)" strokeWidth="1" fill="none" />
        <circle cx="80" cy="80" r="8" fill="rgba(201,168,76,0.2)" stroke="rgba(201,168,76,0.6)" strokeWidth="1" />
        {/* Teeth */}
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          const x1 = 80 + Math.cos(a) * 35;
          const y1 = 80 + Math.sin(a) * 35;
          const x2 = 80 + Math.cos(a) * 45;
          const y2 = 80 + Math.sin(a) * 45;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(201,168,76,0.6)" strokeWidth="4" strokeLinecap="round" />;
        })}
      </g>

      {/* Small gear */}
      <g className={hovered ? styles.gearRotateCCW : ''} style={{ transformOrigin: '148px 60px' }}>
        <circle cx="148" cy="60" r="20" stroke="rgba(107,91,239,0.6)" strokeWidth="1.2" fill="rgba(107,91,239,0.05)" />
        <circle cx="148" cy="60" r="8" fill="rgba(107,91,239,0.15)" stroke="rgba(107,91,239,0.5)" strokeWidth="1" />
        <circle cx="148" cy="60" r="3" fill="rgba(107,91,239,0.5)" />
        {Array.from({ length: 7 }).map((_, i) => {
          const a = (i / 7) * Math.PI * 2;
          const x1 = 148 + Math.cos(a) * 20;
          const y1 = 60 + Math.sin(a) * 20;
          const x2 = 148 + Math.cos(a) * 28;
          const y2 = 60 + Math.sin(a) * 28;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(107,91,239,0.7)" strokeWidth="3" strokeLinecap="round" />;
        })}
      </g>

      {/* Flow arrows */}
      <path d="M 30 130 Q 80 110 130 130 Q 170 150 200 130" stroke="rgba(201,168,76,0.3)" strokeWidth="1.5" strokeDasharray="4 4" fill="none"
        className={hovered ? styles.flowAnim : ''} />
      <text x="30" y="148" fontSize="7" fill="rgba(201,168,76,0.5)" fontFamily="monospace">INPUT</text>
      <text x="172" y="122" fontSize="7" fill="rgba(201,168,76,0.5)" fontFamily="monospace">OUTPUT</text>
    </svg>
  );
}
