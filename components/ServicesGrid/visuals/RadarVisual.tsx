'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function RadarVisual({ hovered }: { hovered: boolean }) {
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
    camera.position.set(0, 3.2, 4.8);
    camera.lookAt(0, 0, 0);

    const group = new THREE.Group();
    scene.add(group);

    // 1. Concentric Radar Target Circles
    for (let r = 0.5; r <= 1.8; r += 0.45) {
      const ringGeo = new THREE.RingGeometry(r, r + 0.015, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      group.add(ring);
    }

    // 2. Crosshair Grid Lines
    const lineMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.3 });
    const crossGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.8, 0, 0), new THREE.Vector3(1.8, 0, 0),
      new THREE.Vector3(0, 0, -1.8), new THREE.Vector3(0, 0, 1.8),
    ]);
    const crossLines = new THREE.LineSegments(crossGeo, lineMat);
    group.add(crossLines);

    // 3. Rotating 3D Holographic Radar Sweep Beam
    const sweepGeo = new THREE.ConeGeometry(1.8, 0.01, 32, 1, false, 0, Math.PI / 3);
    const sweepMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const sweep = new THREE.Mesh(sweepGeo, sweepMat);
    sweep.rotation.x = -Math.PI / 2;
    group.add(sweep);

    // 4. Detected Conversion Target Blips (Spheres)
    const blipCount = 6;
    const blips: THREE.Mesh[] = [];
    const blipGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const blipMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });

    for (let i = 0; i < blipCount; i++) {
      const blip = new THREE.Mesh(blipGeo, blipMat);
      const angle = (i / blipCount) * Math.PI * 2 + 0.3;
      const dist = 0.6 + (i % 3) * 0.45;
      blip.position.set(Math.cos(angle) * dist, 0.05, Math.sin(angle) * dist);
      group.add(blip);
      blips.push(blip);
    }

    let rafId: number;
    let sweepAngle = 0;

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

      const speed = hoveredRef.current ? 0.05 : 0.015;
      sweepAngle += speed;
      sweep.rotation.z = sweepAngle;

      blips.forEach((blip, i) => {
        const pulse = Math.sin(Date.now() * 0.005 + i) * 0.5 + 0.5;
        blip.scale.setScalar(1 + pulse * (hoveredRef.current ? 0.6 : 0.2));
      });

      sweepMat.opacity = hoveredRef.current ? 0.45 : 0.2;

      const targetScale = hoveredRef.current ? 1.15 : 0.95;
      group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      renderer.dispose();
      sweepGeo.dispose();
      sweepMat.dispose();
      crossGeo.dispose();
      lineMat.dispose();
      blipGeo.dispose();
      blipMat.dispose();
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width: '100%', height: '100%', display: 'block' }} 
    />
  );
}
