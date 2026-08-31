'use client';

import { useEffect, useRef } from 'react';

interface VisualProps {
  hovered: boolean;
  mouseX?: number;
  mouseY?: number;
}

export default function CodeVisual({ hovered, mouseX = 0.5, mouseY = 0.5 }: VisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    hovered,
    mouseX,
    mouseY,
    morphProgress: 0, // 0 = code stream, 1 = 3D cube
    rotX: 0.4,
    rotY: 0.6,
    codeOffset: 0,
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

    const LOGS = [
      { tag: '[OK]', text: 'Cluster 01: Active', ms: '12ms', color: '#22c55e' },
      { tag: '[SYS]', text: 'Next.js 16 + Turbopack', ms: '24ms', color: '#38bdf8' },
      { tag: '[DB]', text: 'Postgres Edge Pool', ms: '0.8ms', color: '#a855f7' },
      { tag: '[BUILD]', text: 'Production Artifacts', ms: '100%', color: '#C9A84C' },
      { tag: '[SSL]', text: 'TLS 1.3 Certified', ms: '0ms', color: '#22c55e' },
      { tag: '[API]', text: 'Docker Containerized', ms: '3ms', color: '#60a5fa' },
    ];

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

    // 3D Cube vertices
    const cubeVertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ];
    const cubeEdges = [
      [0,1],[1,2],[2,3],[3,0],
      [4,5],[5,6],[6,7],[7,4],
      [0,4],[1,5],[2,6],[3,7]
    ];

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      time += 0.02;

      const w = canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
      const h = canvas.height / (Math.min(window.devicePixelRatio || 1, 2));
      ctx.clearRect(0, 0, w, h);

      const s = stateRef.current;
      const targetMorph = s.hovered ? 1 : 0;
      s.morphProgress += (targetMorph - s.morphProgress) * 0.08;

      // ─── 1. CODE TERMINAL STREAM (when morph < 1) ───
      if (s.morphProgress < 0.98) {
        ctx.save();
        ctx.globalAlpha = 1 - s.morphProgress;
        s.codeOffset += 0.4;

        ctx.font = '9px "JetBrains Mono", Consolas, monospace';
        const startY = 24 - (s.codeOffset % 20);

        for (let i = 0; i < 7; i++) {
          const logIdx = (Math.floor(s.codeOffset / 20) + i) % LOGS.length;
          const log = LOGS[logIdx];
          const y = startY + i * 20;

          if (y > 10 && y < h - 10) {
            // Tag
            ctx.fillStyle = log.color;
            ctx.fillText(log.tag, 15, y);
            // Text
            ctx.fillStyle = 'rgba(240, 240, 240, 0.75)';
            ctx.fillText(log.text, 55, y);
            // Latency
            ctx.fillStyle = '#C9A84C';
            ctx.textAlign = 'right';
            ctx.fillText(log.ms, w - 20, y);
            ctx.textAlign = 'left';
          }
        }
        ctx.restore();
      }

      // ─── 2. 3D SERVER CUBE MATRIX (when morph > 0) ───
      if (s.morphProgress > 0.02) {
        ctx.save();
        ctx.globalAlpha = s.morphProgress;

        const targetRotY = (s.mouseX - 0.5) * 2.2 + time * 0.5;
        const targetRotX = (s.mouseY - 0.5) * 1.8 + 0.3;
        s.rotY += (targetRotY - s.rotY) * 0.1;
        s.rotX += (targetRotX - s.rotX) * 0.1;

        const cx = w * 0.6;
        const cy = h * 0.5;
        const size = Math.min(w, h) * 0.32;

        // Project 3D points
        const proj = cubeVertices.map(([x, y, z]) => {
          // Rotate Y
          let x1 = x * Math.cos(s.rotY) + z * Math.sin(s.rotY);
          let z1 = -x * Math.sin(s.rotY) + z * Math.cos(s.rotY);
          // Rotate X
          let y2 = y * Math.cos(s.rotX) - z1 * Math.sin(s.rotX);
          let z2 = y * Math.sin(s.rotX) + z1 * Math.cos(s.rotX);

          const distance = 3.5;
          const scale = distance / (distance + z2);
          return {
            x: cx + x1 * size * scale,
            y: cy + y2 * size * scale,
            scale,
            z: z2
          };
        });

        // Draw 3D Edges with neon glow
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 10;

        cubeEdges.forEach(([i, j]) => {
          ctx.beginPath();
          ctx.moveTo(proj[i].x, proj[i].y);
          ctx.lineTo(proj[j].x, proj[j].y);
          ctx.stroke();
        });

        // Inner glowing golden core
        ctx.shadowColor = '#C9A84C';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#C9A84C';
        proj.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5 * p.scale, 0, Math.PI * 2);
          ctx.fill();
        });

        // Floating latency badge
        ctx.shadowBlur = 0;
        ctx.font = '8.5px monospace';
        ctx.fillStyle = '#4ade80';
        ctx.fillText('● 3D CLUSTER: 12ms', cx - 45, cy + size + 20);

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
