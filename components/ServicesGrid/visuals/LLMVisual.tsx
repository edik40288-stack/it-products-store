'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function LLMVisual({ hovered }: { hovered: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoveredRef = useRef(hovered);

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    const group = new THREE.Group();
    scene.add(group);

    // 1. Central 3D Torus Knot Core
    const knotGeo = new THREE.TorusKnotGeometry(0.85, 0.22, 64, 16);
    const knotMat = new THREE.MeshBasicMaterial({
      color: 0xC9A84C,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const knot = new THREE.Mesh(knotGeo, knotMat);
    group.add(knot);

    // 2. Orbiting Model Nodes (Satellites)
    const satCount = 5;
    const satGroup = new THREE.Group();
    group.add(satGroup);
    const satGeo = new THREE.SphereGeometry(0.09, 12, 12);
    const satMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 });
    const satellites: THREE.Mesh[] = [];

    for (let i = 0; i < satCount; i++) {
      const sat = new THREE.Mesh(satGeo, satMat);
      satGroup.add(sat);
      satellites.push(sat);
    }

    // 3. Orbital Track Ring
    const trackGeo = new THREE.TorusGeometry(1.6, 0.008, 16, 64);
    const trackMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.3,
    });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.rotation.x = Math.PI * 0.35;
    group.add(track);

    let rafId: number;
    let angle = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const resizeObs = new ResizeObserver(resize);
    resizeObs.observe(canvas.parentElement || canvas);
    resize();

    const animate = () => {
      rafId = requestAnimationFrame(animate);

      const speed = hoveredRef.current ? 0.035 : 0.01;
      angle += speed;

      knot.rotation.x += speed * 0.8;
      knot.rotation.y += speed * 1.2;
      track.rotation.z += speed * 0.5;

      satellites.forEach((sat, i) => {
        const satAngle = angle * (1 + i * 0.2) + (i / satCount) * Math.PI * 2;
        const r = 1.6;
        sat.position.set(
          Math.cos(satAngle) * r,
          Math.sin(satAngle) * Math.cos(Math.PI * 0.35) * r,
          Math.sin(satAngle) * Math.sin(Math.PI * 0.35) * r
        );
      });

      knotMat.opacity = hoveredRef.current ? 0.95 : 0.55;
      trackMat.opacity = hoveredRef.current ? 0.6 : 0.25;

      const targetScale = hoveredRef.current ? 1.15 : 0.95;
      group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      renderer.dispose();
      knotGeo.dispose();
      knotMat.dispose();
      satGeo.dispose();
      satMat.dispose();
      trackGeo.dispose();
      trackMat.dispose();
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width: '100%', height: '100%', display: 'block' }} 
    />
  );
}
