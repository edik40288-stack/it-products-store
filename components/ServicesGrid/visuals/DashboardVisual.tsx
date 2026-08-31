'use client';

import { useEffect, useRef } from 'react';

interface VisualProps {
  hovered: boolean;
  mouseX?: number;
  mouseY?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  nodeIndex: number;
  progress: number;
  alpha: number;
}

export default function DashboardVisual({ hovered, mouseX = 0.5, mouseY = 0.5 }: VisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    hovered,
    mouseX,
    mouseY,
    particles: [] as Particle[],
    flashText: null as { text: string; x: number; y: number; alpha: number } | null,
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

    // 4 Pipeline Nodes
    const NODES = [
      { label: 'ЛИД', x: 0.12, y: 0.5 },
      { label: 'СКОРИНГ', x: 0.38, y: 0.4 },
      { label: 'ДЕМО', x: 0.65, y: 0.6 },
      { label: 'ОПЛАТА', x: 0.88, y: 0.45 },
    ];

    // Seed particles
    const particles: Particle[] = [];
    for (let i = 0; i < 18; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        vx: 0.004 + Math.random() * 0.005,
        vy: 0,
        size: 2 + Math.random() * 2,
        nodeIndex: 0,
        progress: Math.random(),
        alpha: 0.6 + Math.random() * 0.4,
      });
    }
    stateRef.current.particles = particles;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      time += 0.03;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const s = stateRef.current;
      const mx = s.mouseX * w;
      const my = s.mouseY * h;

      // ─── 1. CONNECTING BEZIER PIPELINE CABLES ───
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(NODES[0].x * w, NODES[0].y * h);
      for (let i = 1; i < NODES.length; i++) {
        const prev = NODES[i - 1];
        const curr = NODES[i];
        const cpx = (prev.x + curr.x) / 2 * w;
        ctx.bezierCurveTo(cpx, prev.y * h, cpx, curr.y * h, curr.x * w, curr.y * h);
      }
      ctx.stroke();

      // ─── 2. PIPELINE NODES ───
      NODES.forEach((node, i) => {
        const nx = node.x * w;
        const ny = node.y * h;

        ctx.shadowColor = i === 3 ? '#22c55e' : (i === 0 ? '#60a5fa' : '#C9A84C');
        ctx.shadowBlur = s.hovered ? 12 : 6;
        ctx.fillStyle = i === 3 ? '#22c55e' : (i === 0 ? '#60a5fa' : '#C9A84C');

        ctx.beginPath();
        ctx.arc(nx, ny, s.hovered ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.font = '7.5px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(240, 240, 240, 0.6)';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, nx, ny + 14);
      });

      // ─── 3. STREAMING DATA PARTICLES WITH MAGNETIC CURVATURE ───
      s.particles.forEach(p => {
        p.progress += p.vx * (s.hovered ? 1.8 : 1.0);
        if (p.progress > 1) p.progress = 0;

        // Interpolate along the 3 segments
        const seg = p.progress * 3;
        const segIdx = Math.min(2, Math.floor(seg));
        const segT = seg - segIdx;

        const n1 = NODES[segIdx];
        const n2 = NODES[segIdx + 1];

        let px = (n1.x + (n2.x - n1.x) * segT) * w;
        let py = (n1.y + (n2.y - n1.y) * segT) * h;

        // Magnetic attraction to cursor on hover
        if (s.hovered) {
          const dx = mx - px;
          const dy = my - py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            const pull = (1 - dist / 80) * 18;
            px += (dx / dist) * pull;
            py += (dy / dist) * pull;

            if (dist < 25 && !s.flashText) {
              s.flashText = { text: '+$12,400 ✅', x: mx, y: my - 15, alpha: 1 };
            }
          }
        }

        // Render particle comet
        ctx.fillStyle = '#C9A84C';
        ctx.shadowColor = '#C9A84C';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // ─── 4. FLOATING CONVERSION REVENUE BADGE ───
      if (s.flashText) {
        s.flashText.alpha -= 0.02;
        s.flashText.y -= 0.4;

        if (s.flashText.alpha <= 0) {
          s.flashText = null;
        } else {
          ctx.save();
          ctx.globalAlpha = s.flashText.alpha;
          ctx.font = 'bold 9.5px monospace';
          ctx.fillStyle = '#4ade80';
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 8;
          ctx.textAlign = 'center';
          ctx.fillText(s.flashText.text, s.flashText.x, s.flashText.y);
          ctx.restore();
        }
      } else if (s.hovered) {
        ctx.save();
        ctx.font = '8.5px monospace';
        ctx.fillStyle = '#C9A84C';
        ctx.textAlign = 'right';
        ctx.fillText('+142% MRR · 1.2s', w - 15, 20);
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
