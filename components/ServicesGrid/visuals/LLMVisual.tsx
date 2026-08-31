'use client';

import { useEffect, useRef } from 'react';

interface VisualProps {
  hovered: boolean;
  mouseX?: number;
  mouseY?: number;
}

export default function LLMVisual({ hovered, mouseX = 0.5, mouseY = 0.5 }: VisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    hovered,
    mouseX,
    mouseY,
    angle: 0,
    models: [
      { name: 'GPT-4o', angle: 0, color: '#34d399' },
      { name: 'Claude 3.5', angle: Math.PI * 0.5, color: '#fbbf24' },
      { name: 'Gemini 1.5', angle: Math.PI, color: '#60a5fa' },
      { name: 'DeepSeek', angle: Math.PI * 1.5, color: '#c084fc' },
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

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      time += 0.03;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const s = stateRef.current;
      const speed = s.hovered ? 0.025 : 0.008;
      s.angle += speed;

      const cx = w * 0.58;
      const cy = h * 0.52;
      const orbitR = Math.min(w, h) * 0.38;

      const mx = s.mouseX * w;
      const my = s.mouseY * h;

      // ─── 1. ORBITING RINGS ───
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
      ctx.stroke();

      // ─── 2. LASER BEAMS TO MODELS & CURSOR ───
      s.models.forEach((m) => {
        const curAngle = m.angle + s.angle;
        const sx = cx + Math.cos(curAngle) * orbitR;
        const sy = cy + Math.sin(curAngle) * orbitR;

        // Laser beam from center to model
        ctx.strokeStyle = s.hovered ? 'rgba(201, 168, 76, 0.5)' : 'rgba(201, 168, 76, 0.15)';
        ctx.lineWidth = s.hovered ? 1.5 : 1;
        ctx.shadowColor = '#C9A84C';
        ctx.shadowBlur = s.hovered ? 6 : 0;

        ctx.beginPath();
        ctx.moveTo(cx, cy);

        // If hovered, bend line towards mouse
        if (s.hovered) {
          const cpx = (cx + sx) / 2 + (mx - cx) * 0.35;
          const cpy = (cy + sy) / 2 + (my - cy) * 0.35;
          ctx.quadraticCurveTo(cpx, cpy, sx, sy);
        } else {
          ctx.lineTo(sx, sy);
        }
        ctx.stroke();

        // Model satellite node
        ctx.fillStyle = 'rgba(17, 24, 39, 0.9)';
        ctx.strokeStyle = m.color;
        ctx.lineWidth = 1.6;
        ctx.shadowColor = m.color;
        ctx.shadowBlur = s.hovered ? 10 : 4;

        ctx.beginPath();
        ctx.arc(sx, sy, 8.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.font = '7.5px "JetBrains Mono", monospace';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(m.name, sx, sy + 14);
      });

      // ─── 3. CENTRAL QUANTUM LLM CORE ───
      ctx.shadowColor = '#C9A84C';
      ctx.shadowBlur = s.hovered ? 18 : 8;
      ctx.fillStyle = '#C9A84C';

      const corePulse = 9 + Math.sin(time * 3) * (s.hovered ? 2.5 : 1);
      ctx.beginPath();
      ctx.arc(cx, cy, corePulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.font = 'bold 7.5px monospace';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.fillText('LLM', cx, cy + 2.5);

      if (s.hovered) {
        ctx.font = '8px monospace';
        ctx.fillStyle = '#34d399';
        ctx.textAlign = 'right';
        ctx.fillText('1,420 tps · ROUTING ACTIVE', w - 15, 18);
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
