'use client';
import { useEffect, useRef } from 'react';
import styles from '../CardVisual.module.css';

const METRICS = ['CVR', 'CPA', 'ROAS', 'LTV', 'CTR', 'NPS'];

export default function RadarVisual({ hovered }: { hovered: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const valuesRef = useRef([0.7, 0.5, 0.8, 0.6, 0.9, 0.65]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const r = Math.min(cx, cy) - 20;
    const n = METRICS.length;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (hovered) {
        valuesRef.current = valuesRef.current.map(v =>
          Math.max(0.3, Math.min(0.98, v + (Math.random() - 0.45) * 0.06))
        );
      }

      // Spider web rings
      for (let ring = 1; ring <= 4; ring++) {
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          const rr = (ring / 4) * r;
          i === 0 ? ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr)
                   : ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Axes + labels
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.stroke();
        const lx = cx + Math.cos(a) * (r + 14);
        const ly = cy + Math.sin(a) * (r + 14);
        ctx.fillStyle = 'rgba(240,240,240,0.5)';
        ctx.font = '7px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(METRICS[i], lx, ly + 3);
      }

      // Data polygon
      ctx.beginPath();
      valuesRef.current.forEach((v, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        i === 0 ? ctx.moveTo(cx + Math.cos(a) * r * v, cy + Math.sin(a) * r * v)
                 : ctx.lineTo(cx + Math.cos(a) * r * v, cy + Math.sin(a) * r * v);
      });
      ctx.closePath();
      ctx.fillStyle = 'rgba(201,168,76,0.12)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(201,168,76,0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Data points
      valuesRef.current.forEach((v, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * r * v, cy + Math.sin(a) * r * v, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#C9A84C';
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [hovered]);

  return <canvas ref={canvasRef} width={220} height={160} className={styles.radarCanvas} />;
}
