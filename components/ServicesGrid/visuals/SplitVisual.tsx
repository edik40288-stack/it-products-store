'use client';

import { useEffect, useRef } from 'react';

interface VisualProps {
  hovered: boolean;
  mouseX?: number;
  mouseY?: number;
}

export default function SplitVisual({ hovered, mouseX = 0.5 }: VisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    hovered,
    mouseX,
    curSplitX: 0.5,
  });

  useEffect(() => {
    stateRef.current.hovered = hovered;
    stateRef.current.mouseX = mouseX;
  }, [hovered, mouseX]);

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
      time += 0.02;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const s = stateRef.current;
      const targetSplit = s.hovered ? s.mouseX : 0.5;
      s.curSplitX += (targetSplit - s.curSplitX) * 0.1;

      const splitPx = w * s.curSplitX;

      const cx = w * 0.55;
      const cy = h * 0.52;
      const cardW = Math.min(w * 0.75, 180);
      const cardH = 90;
      const cardX = cx - cardW / 2;
      const cardY = cy - cardH / 2;

      // ─── 1. LEFT SIDE: OLD WIREFRAME BLUEPRINT (Clipped to left of splitPx) ───
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitPx, h);
      ctx.clip();

      ctx.fillStyle = '#181920';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 6);
      ctx.fill();
      ctx.stroke();

      // Old wireframe blocks
      ctx.fillStyle = '#2e303d';
      ctx.fillRect(cardX + 12, cardY + 12, cardW * 0.5, 10);
      ctx.fillRect(cardX + 12, cardY + 28, cardW * 0.7, 6);
      ctx.fillRect(cardX + 12, cardY + 38, cardW * 0.6, 6);

      ctx.fillStyle = '#4b4d63';
      ctx.fillRect(cardX + 12, cardY + 56, 60, 18);

      ctx.font = '7.5px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillText('OLD BLUEPRINT', cardX + 12, cardY + 82);

      ctx.restore();

      // ─── 2. RIGHT SIDE: MODERN LUXURY GLASS UI (Clipped to right of splitPx) ───
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitPx, 0, w - splitPx, h);
      ctx.clip();

      // Modern glowing dark glass card
      ctx.fillStyle = 'rgba(15, 20, 35, 0.94)';
      ctx.strokeStyle = 'rgba(201, 168, 76, 0.4)';
      ctx.lineWidth = 1.4;
      ctx.shadowColor = '#C9A84C';
      ctx.shadowBlur = s.hovered ? 14 : 6;

      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 10);
      ctx.fill();
      ctx.stroke();

      // Vibrant Gradient header bar
      const barGrad = ctx.createLinearGradient(cardX + 12, 0, cardX + cardW - 12, 0);
      barGrad.addColorStop(0, '#C9A84C');
      barGrad.addColorStop(1, '#a855f7');
      ctx.fillStyle = barGrad;
      ctx.beginPath();
      ctx.roundRect(cardX + 12, cardY + 12, cardW * 0.6, 12, 4);
      ctx.fill();

      // Modern micro-component card
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.roundRect(cardX + 12, cardY + 32, cardW - 24, 24, 6);
      ctx.fill();
      ctx.stroke();

      // Dot & text
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(cardX + 22, cardY + 44, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 7.5px "JetBrains Mono", monospace';
      ctx.fillStyle = '#fff';
      ctx.fillText('PREMIUM UI/UX', cardX + 30, cardY + 46.5);

      // Gradient CTA
      ctx.fillStyle = '#C9A84C';
      ctx.beginPath();
      ctx.roundRect(cardX + 12, cardY + 62, 70, 16, 4);
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.font = 'bold 7px monospace';
      ctx.fillText('CONVERT ➔', cardX + 18, cardY + 73);

      ctx.restore();

      // ─── 3. LASER SPLIT DIVIDER LINE ───
      ctx.save();
      ctx.strokeStyle = '#C9A84C';
      ctx.shadowColor = '#C9A84C';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(splitPx, cardY - 4);
      ctx.lineTo(splitPx, cardY + cardH + 4);
      ctx.stroke();

      // Handle circle
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(splitPx, cy, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.font = '7px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('⟺', splitPx, cy + 2.5);

      ctx.restore();
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
