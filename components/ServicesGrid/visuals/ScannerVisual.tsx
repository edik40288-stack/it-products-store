'use client';
import { useEffect, useRef, useState } from 'react';
import styles from '../CardVisual.module.css';

export default function ScannerVisual({ hovered }: { hovered: boolean }) {
  const [scanY, setScanY] = useState(0);
  const [findings, setFindings] = useState<number[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!hovered) { setScanY(0); setFindings([]); return; }
    let y = 0;
    const animate = () => {
      y = (y + (hovered ? 1.5 : 0.5)) % 140;
      setScanY(y);
      // Random "findings" appear as scan passes
      if (Math.random() < 0.03) {
        setFindings(prev => [...prev.slice(-6), Math.floor(Math.random() * 130)]);
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [hovered]);

  return (
    <div className={styles.scannerWrap}>
      <svg viewBox="0 0 200 140" fill="none" className={styles.scannerSvg}>
        {/* Background grid */}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 20} x2="200" y2={i * 20} stroke="rgba(0,255,100,0.06)" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 22} y1="0" x2={i * 22} y2="140" stroke="rgba(0,255,100,0.06)" strokeWidth="0.5" />
        ))}

        {/* Corner brackets */}
        {[[10,10],[190,10],[10,130],[190,130]].map(([bx, by], i) => (
          <g key={i}>
            <path d={`M ${bx} ${by + (by < 70 ? 15 : -15)} L ${bx} ${by} L ${bx + (bx < 100 ? 15 : -15)} ${by}`}
              stroke="rgba(0,255,100,0.5)" strokeWidth="1.5" fill="none" />
          </g>
        ))}

        {/* Check marks for found items */}
        {findings.map((fy, i) => (
          <g key={i} opacity={hovered ? 0.9 : 0.5}>
            <circle cx={20 + (i * 25) % 160} cy={fy} r="6" fill="none" stroke="rgba(0,255,100,0.4)" strokeWidth="1" />
            <path d={`M ${14 + (i * 25) % 160} ${fy} l 4 4 l 7 -7`}
              stroke="rgba(0,255,100,0.9)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </g>
        ))}

        {/* Laser scan line */}
        <line x1="0" y1={scanY} x2="200" y2={scanY} stroke="rgba(0,255,100,0.7)" strokeWidth="1.5" />
        <rect x="0" y={scanY - 15} width="200" height="15" fill="url(#scanGrad)" />
        <defs>
          <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,255,100,0)" />
            <stop offset="100%" stopColor="rgba(0,255,100,0.08)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Status */}
      <div className={styles.scanStatus}>
        <span className={styles.scanDot} />
        <span>{hovered ? `Scanning... ${findings.length} items found` : 'System ready'}</span>
      </div>
    </div>
  );
}
