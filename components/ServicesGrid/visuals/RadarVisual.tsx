'use client';

import { useEffect, useRef } from 'react';

interface VisualProps {
  hovered: boolean;
  mouseX?: number;
  mouseY?: number;
}

export default function RadarVisual({ hovered, mouseX = 0.5, mouseY = 0.5 }: VisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    hovered,
    mouseX,
    mouseY,
    sweepAngle: 0,
    blips: [
      { angle: 0.8, r: 0.65, label: '+38% CVR', color: '#22c55e', alpha: 0 },
      { angle: 2.2, r: 0.45, label: 'CPA -45%', color: '#C9A84C', alpha: 0 },
      { angle: 4.1, r: 0.75, label: 'LCP: 0.6s', color: '#38bdf8', alpha: 0 },
      { angle: 5.4, r: 0.55, label: 'ROAS 3.8x', color: '#a855f7', alpha: 0 },
    ]
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

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const s = stateRef.current;
      const speed = s.hovered ? 0.06 : 0.025;
      s.sweepAngle = (s.sweepAngle + speed) % (Math.PI * 2);

      const cx = w * 0.58;
      const cy = h * 0.52;
      const maxR = Math.min(w, h) * 0.42;

      // ─── 1. RADAR CONCENTRIC RINGS ───
      ctx.strokeStyle = 'rgba(201, 168, 76, 0.18)';
      ctx.lineWidth = 1;

      for (let r = 0.33; r <= 1.0; r += 0.33) {
        ctx.beginPath();
        ctx.arc(cx, cy, maxR * r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Crosshair lines
      ctx.beginPath();
      ctx.moveTo(cx - maxR, cy);
      ctx.lineTo(cx + maxR, cy);
      ctx.moveTo(cx, cy - maxR);
      ctx.lineTo(cx, cy + maxR);
      ctx.stroke();

      // ─── 2. ROTATING LASER SWEEP BEAM CONE (360°) ───
      const sweepAngle = s.sweepAngle;
      const tailAngle = 0.7; // Width of sweep trail

      ctx.save();
      const sweepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
      sweepGrad.addColorStop(0, 'rgba(201, 168, 76, 0.35)');
      sweepGrad.addColorStop(1, 'rgba(34, 197, 94, 0.05)');

      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, sweepAngle - tailAngle, sweepAngle, false);
      ctx.closePath();
      ctx.fill();

      // Laser Leading Edge Line
      ctx.strokeStyle = '#C9A84C';
      ctx.shadowColor = '#C9A84C';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * maxR, cy + Math.sin(sweepAngle) * maxR);
      ctx.stroke();
      ctx.restore();

      // ─── 3. DETECTED HEATMAP BLIPS & CONVERSION SPIKES ───
      s.blips.forEach(blip => {
        // Check if sweep passed over blip
        const angleDiff = (sweepAngle - blip.angle + Math.PI * 2) % (Math.PI * 2);
        if (angleDiff < 0.2) {
          blip.alpha = 1.0;
        } else {
          blip.alpha = Math.max(0.15, blip.alpha - 0.015);
        }

        const bx = cx + Math.cos(blip.angle) * (maxR * blip.r);
        const by = cy + Math.sin(blip.angle) * (maxR * blip.r);

        ctx.save();
        ctx.globalAlpha = s.hovered ? Math.max(0.4, blip.alpha) : blip.alpha;
        ctx.fillStyle = blip.color;
        ctx.shadowColor = blip.color;
        ctx.shadowBlur = 10;

        // Glowing blip dot
        ctx.beginPath();
        ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Target ring
        ctx.strokeStyle = blip.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bx, by, 7, 0, Math.PI * 2);
        ctx.stroke();

        // Metric label
        if (blip.alpha > 0.4 || s.hovered) {
          ctx.shadowBlur = 0;
          ctx.font = '8px "JetBrains Mono", monospace';
          ctx.fillStyle = '#fff';
          ctx.fillText(blip.label, bx + 10, by + 3);
        }
        ctx.restore();
      });

      // ─── 4. INTERACTIVE RETICLE UNDER CURSOR ON HOVER ───
      if (s.hovered) {
        const mx = s.mouseX * w;
        const my = s.mouseY * h;

        ctx.save();
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1.2;
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 6;

        ctx.beginPath();
        ctx.arc(mx, my, 12, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = '7.5px monospace';
        ctx.fillStyle = '#4ade80';
        ctx.fillText('TARGET LOCK', mx + 16, my + 3);
        ctx.restore();
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
