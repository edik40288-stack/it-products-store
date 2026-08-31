'use client';

import { useEffect, useRef } from 'react';

interface VisualProps {
  hovered: boolean;
  mouseX?: number;
  mouseY?: number;
}

export default function ChatVisual({ hovered, mouseX = 0.5, mouseY = 0.5 }: VisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    hovered,
    mouseX,
    mouseY,
    activeAmplitude: 0,
    tags: [
      { text: '✨ Квалификация: 98%', x: 0.3, y: 0.3, alpha: 0, scale: 0.8 },
      { text: 'Сделка закрыта ✅', x: 0.55, y: 0.7, alpha: 0, scale: 0.8 },
      { text: '⚡ Ответ: 0.2s', x: 0.2, y: 0.8, alpha: 0, scale: 0.8 },
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

    const BAR_COUNT = 32;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      time += 0.04;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const s = stateRef.current;
      const targetAmp = s.hovered ? 1.0 : 0.25;
      s.activeAmplitude += (targetAmp - s.activeAmplitude) * 0.1;

      const cy = h * 0.52;
      const barWidth = 3;
      const gap = (w * 0.85) / BAR_COUNT;
      const startX = w * 0.08;

      // ─── 1. PROCEDURAL NEURAL VOICE WAVE ───
      for (let i = 0; i < BAR_COUNT; i++) {
        const x = startX + i * gap;
        const normX = i / BAR_COUNT;

        // Proximity to mouse
        const distToMouse = Math.abs(normX - s.mouseX);
        const mouseBoost = s.hovered ? Math.max(0, 1 - distToMouse * 3.5) * 35 : 0;

        // Dynamic sine wave
        const wave1 = Math.sin(time * 3 + i * 0.35) * 12 * s.activeAmplitude;
        const wave2 = Math.cos(time * 2 - i * 0.2) * 8 * s.activeAmplitude;
        const baseHeight = 6 + (Math.sin(i * 0.5) * 4 + 4) * s.activeAmplitude;

        const totalHeight = Math.min(h * 0.75, baseHeight + Math.abs(wave1 + wave2) + mouseBoost);

        // Gradient from violet to gold
        const grad = ctx.createLinearGradient(0, cy - totalHeight / 2, 0, cy + totalHeight / 2);
        if (s.hovered && distToMouse < 0.2) {
          grad.addColorStop(0, '#fff');
          grad.addColorStop(0.5, '#C9A84C');
          grad.addColorStop(1, '#a855f7');
        } else {
          grad.addColorStop(0, 'rgba(201, 168, 76, 0.9)');
          grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.8)');
          grad.addColorStop(1, 'rgba(59, 130, 246, 0.4)');
        }

        ctx.fillStyle = grad;
        ctx.shadowColor = s.hovered ? '#C9A84C' : '#a855f7';
        ctx.shadowBlur = s.hovered ? 8 : 4;

        ctx.beginPath();
        ctx.roundRect(x, cy - totalHeight / 2, barWidth, totalHeight, 2);
        ctx.fill();
      }

      // ─── 2. FLOATING NEURAL PILLS & BADGES ───
      s.tags.forEach((tag, idx) => {
        const targetAlpha = s.hovered ? 1 : 0;
        tag.alpha += (targetAlpha - tag.alpha) * 0.08;

        if (tag.alpha > 0.02) {
          ctx.save();
          ctx.globalAlpha = tag.alpha;

          const px = w * tag.x + Math.sin(time + idx) * 4;
          const py = h * tag.y + Math.cos(time * 0.8 + idx) * 3;

          ctx.font = '8.5px "JetBrains Mono", system-ui, sans-serif';
          const textWidth = ctx.measureText(tag.text).width;

          // Glass pill backdrop
          ctx.fillStyle = 'rgba(15, 20, 32, 0.88)';
          ctx.strokeStyle = idx === 0 ? 'rgba(201, 168, 76, 0.5)' : 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 1;
          ctx.shadowColor = idx === 0 ? '#C9A84C' : '#38bdf8';
          ctx.shadowBlur = 6;

          ctx.beginPath();
          ctx.roundRect(px - 6, py - 9, textWidth + 12, 16, 8);
          ctx.fill();
          ctx.stroke();

          ctx.shadowBlur = 0;
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(tag.text, px, py + 2.5);

          ctx.restore();
        }
      });
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
