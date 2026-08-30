'use client';
import { useEffect, useRef } from 'react';
import styles from '../CardVisual.module.css';

export default function DashboardVisual({ hovered }: { hovered: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const pointsRef = useRef<number[]>([40, 55, 45, 70, 60, 80, 72, 65, 85, 90]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pts = pointsRef.current;

      if (hovered) {
        pts.forEach((_, i) => {
          pts[i] = Math.max(20, Math.min(95, pts[i] + (Math.random() - 0.45) * 5));
        });
      }

      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (canvas.height / 4) * i);
        ctx.lineTo(canvas.width, (canvas.height / 4) * i);
        ctx.stroke();
      }

      // Main line chart
      const stepX = canvas.width / (pts.length - 1);
      ctx.beginPath();
      pts.forEach((p, i) => {
        const x = i * stepX;
        const y = canvas.height - (p / 100) * canvas.height;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.strokeStyle = 'rgba(201,168,76,0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Fill
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, 'rgba(201,168,76,0.25)');
      grad.addColorStop(1, 'rgba(201,168,76,0)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Violet secondary line
      ctx.beginPath();
      pts.forEach((p, i) => {
        const x = i * stepX;
        const y = canvas.height - ((p * 0.6 + 10) / 100) * canvas.height;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.strokeStyle = 'rgba(107,91,239,0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [hovered]);

  return (
    <div className={styles.dashWrap}>
      <canvas ref={canvasRef} width={280} height={130} className={styles.dashCanvas} />
      <div className={styles.dashStats}>
        <span className={styles.stat}><b>+34%</b> CVR</span>
        <span className={styles.stat}><b>2.4x</b> ROI</span>
        <span className={styles.stat}><b>-41%</b> CPA</span>
      </div>
    </div>
  );
}
