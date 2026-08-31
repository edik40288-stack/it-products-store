'use client';

import { useEffect, useRef } from 'react';

interface VisualProps {
  hovered: boolean;
  mouseX?: number;
  mouseY?: number;
}

export default function ScannerVisual({ hovered, mouseX = 0.5, mouseY = 0.5 }: VisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    hovered,
    mouseX,
    mouseY,
    scanY: 0.2,
    scanDir: 1,
  });

  useEffect(() => {
    stateRef.current.hovered = hovered;
    stateRef.current.mouseX = mouseX;
    stateRef.current.mouseY = mouseY;
  }, [hovered, mouseX, mouseY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;
    let time = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    };

    const resizeObs = new ResizeObserver(resize);
    resizeObs.observe(canvas.parentElement || canvas);
    resize();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      time += 0.03;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const s = stateRef.current;
      const scanSpeed = s.hovered ? 0.025 : 0.008;
      s.scanY += s.scanDir * scanSpeed;
      if (s.scanY > 0.85) s.scanDir = -1;
      if (s.scanY < 0.15) s.scanDir = 1;

      const cx = w * 0.58;
      const cy = h * 0.52;
      const shieldW = 90;
      const shieldH = 100;

      // ─── 1. CYBER SHIELD CREST OUTLINE ───
      ctx.save();
      ctx.strokeStyle = s.hovered ? '#10b981' : 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = s.hovered ? 14 : 4;

      ctx.beginPath();
      ctx.moveTo(cx, cy - shieldH / 2);
      ctx.lineTo(cx + shieldW / 2, cy - shieldH / 3);
      ctx.lineTo(cx + shieldW / 2, cy + shieldH / 6);
      ctx.lineTo(cx, cy + shieldH / 2);
      ctx.lineTo(cx - shieldW / 2, cy + shieldH / 6);
      ctx.lineTo(cx - shieldW / 2, cy - shieldH / 3);
      ctx.closePath();
      ctx.stroke();

      // Inner fill gradient
      const shieldGrad = ctx.createLinearGradient(0, cy - shieldH / 2, 0, cy + shieldH / 2);
      shieldGrad.addColorStop(0, 'rgba(16, 185, 129, 0.12)');
      shieldGrad.addColorStop(1, 'rgba(15, 23, 42, 0.4)');
      ctx.fillStyle = shieldGrad;
      ctx.fill();
      ctx.restore();

      // ─── 2. HEXAGONAL MATRIX GRID INSIDE SHIELD ───
      ctx.save();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.lineWidth = 1;

      for (let row = -2; row <= 2; row++) {
        for (let col = -2; col <= 2; col++) {
          const hx = cx + col * 18 + (row % 2 === 0 ? 0 : 9);
          const hy = cy + row * 15;

          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const ha = (k * Math.PI) / 3;
            const px = hx + Math.cos(ha) * 7;
            const py = hy + Math.sin(ha) * 7;
            if (k === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      ctx.restore();

      // ─── 3. LASER SCANNING BEAM (SWEEPS VERTICALLY) ───
      const scanPxY = cy - shieldH / 2 + s.scanY * shieldH;

      ctx.save();
      ctx.strokeStyle = '#4ade80';
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(cx - shieldW / 2 - 8, scanPxY);
      ctx.lineTo(cx + shieldW / 2 + 8, scanPxY);
      ctx.stroke();

      // Laser aura
      const aura = ctx.createLinearGradient(0, scanPxY - 14, 0, scanPxY + 14);
      aura.addColorStop(0, 'rgba(74, 222, 128, 0)');
      aura.addColorStop(0.5, 'rgba(74, 222, 128, 0.25)');
      aura.addColorStop(1, 'rgba(74, 222, 128, 0)');
      ctx.fillStyle = aura;
      ctx.fillRect(cx - shieldW / 2 - 8, scanPxY - 14, shieldW + 16, 28);
      ctx.restore();

      // ─── 4. SECURITY AUDIT BADGES ───
      ctx.font = '8px "JetBrains Mono", monospace';
      if (s.hovered) {
        ctx.fillStyle = '#4ade80';
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 8;
        ctx.textAlign = 'right';
        ctx.fillText('✔ OWASP TOP 10 PASS', w - 15, 18);
        ctx.fillText('✔ SSL 256-BIT OK', w - 15, 30);
        ctx.fillText('✔ 0 EXPLOITS', w - 15, 42);
      } else {
        ctx.fillStyle = 'rgba(74, 222, 128, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText('🛡️ SECURE 100%', cx, cy + 3);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width: '100%', height: '100%', display: 'block' }} 
    />
  );
}
