'use client';

import { useEffect, useRef } from 'react';

interface VisualProps {
  hovered: boolean;
  mouseX?: number;
  mouseY?: number;
}

interface Node {
  id: string;
  label: string;
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export default function GearsVisual({ hovered, mouseX = 0.5, mouseY = 0.5 }: VisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    hovered,
    mouseX,
    mouseY,
    nodes: [] as Node[],
    packets: [] as { from: number; to: number; progress: number; speed: number }[],
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

    // 5 API Nodes in Web
    const nodes: Node[] = [
      { id: '1', label: '⚡ Webhook', baseX: 0.18, baseY: 0.3, x: 0.18, y: 0.3, vx: 0, vy: 0, color: '#f59e0b' },
      { id: '2', label: '🧠 AI Engine', baseX: 0.5, baseY: 0.22, x: 0.5, y: 0.22, vx: 0, vy: 0, color: '#c084fc' },
      { id: '3', label: '💬 Telegram', baseX: 0.82, baseY: 0.35, x: 0.82, y: 0.35, vx: 0, vy: 0, color: '#38bdf8' },
      { id: '4', label: '💳 Stripe API', baseX: 0.32, baseY: 0.72, x: 0.32, y: 0.72, vx: 0, vy: 0, color: '#22c55e' },
      { id: '5', label: '📊 Database', baseX: 0.7, baseY: 0.75, x: 0.7, y: 0.75, vx: 0, vy: 0, color: '#C9A84C' },
    ];
    stateRef.current.nodes = nodes;

    const LINKS = [
      [0, 1], [1, 2], [1, 3], [1, 4], [3, 4], [0, 3]
    ];

    // Seed packets
    const packets = LINKS.map(([from, to]) => ({
      from,
      to,
      progress: Math.random(),
      speed: 0.012 + Math.random() * 0.008,
    }));
    stateRef.current.packets = packets;

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

      // ─── 1. ELASTIC SPRING PHYSICS FOR NODES ───
      s.nodes.forEach(node => {
        const targetX = node.baseX * w;
        const targetY = node.baseY * h;

        // Mouse attraction/repulsion rubber-band effect
        if (s.hovered) {
          const dx = mx - (node.x * w);
          const dy = my - (node.y * h);
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const force = (1 - dist / 100) * 16;
            node.vx += (dx / dist) * force * 0.08;
            node.vy += (dy / dist) * force * 0.08;
          }
        }

        // Spring back to base
        const springX = (targetX - (node.x * w)) * 0.08;
        const springY = (targetY - (node.y * h)) * 0.08;
        node.vx = (node.vx + springX) * 0.75;
        node.vy = (node.vy + springY) * 0.75;

        node.x = ((node.x * w) + node.vx) / w;
        node.y = ((node.y * h) + node.vy) / h;
      });

      // ─── 2. ELASTIC CONNECTING CORDS ───
      LINKS.forEach(([i, j]) => {
        const n1 = s.nodes[i];
        const n2 = s.nodes[j];

        const x1 = n1.x * w;
        const y1 = n1.y * h;
        const x2 = n2.x * w;
        const y2 = n2.y * h;

        // Draw elastic curved or straight glowing lines
        ctx.strokeStyle = s.hovered ? 'rgba(201, 168, 76, 0.45)' : 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = s.hovered ? 1.8 : 1.2;
        ctx.shadowColor = '#C9A84C';
        ctx.shadowBlur = s.hovered ? 6 : 0;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      // ─── 3. SPARKING DATA PACKETS ───
      s.packets.forEach(pkt => {
        pkt.progress += pkt.speed * (s.hovered ? 2.5 : 1.0);
        if (pkt.progress > 1) pkt.progress = 0;

        const n1 = s.nodes[pkt.from];
        const n2 = s.nodes[pkt.to];

        const px = (n1.x + (n2.x - n1.x) * pkt.progress) * w;
        const py = (n1.y + (n2.y - n1.y) * pkt.progress) * h;

        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#C9A84C';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(px, py, s.hovered ? 3.5 : 2.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // ─── 4. NODES WITH NEON ICONS ───
      s.nodes.forEach(node => {
        const nx = node.x * w;
        const ny = node.y * h;

        ctx.fillStyle = 'rgba(15, 20, 35, 0.92)';
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 1.8;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = s.hovered ? 12 : 5;

        ctx.beginPath();
        ctx.arc(nx, ny, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.font = '8px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(node.label.slice(0, 2), nx, ny + 3);

        ctx.font = '7px monospace';
        ctx.fillStyle = 'rgba(240, 240, 240, 0.65)';
        ctx.fillText(node.label.slice(3), nx, ny + 17);
      });

      if (s.hovered) {
        ctx.font = '8px monospace';
        ctx.fillStyle = '#4ade80';
        ctx.textAlign = 'right';
        ctx.fillText('AUTOMATION · 0.04s', w - 15, 18);
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
