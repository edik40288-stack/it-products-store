'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function GearsVisual({ hovered }: { hovered: boolean }) {
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

    // 1. Large Outer Golden Gyroscope Ring
    const ringGeo1 = new THREE.TorusGeometry(1.6, 0.05, 16, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xC9A84C,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    group.add(ring1);

    // 2. Middle Violet Gyroscope Ring
    const ringGeo2 = new THREE.TorusGeometry(1.2, 0.04, 16, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    group.add(ring2);

    // 3. Inner Cyan Gyroscope Ring
    const ringGeo3 = new THREE.TorusGeometry(0.8, 0.035, 16, 64);
    const ringMat3 = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const ring3 = new THREE.Mesh(ringGeo3, ringMat3);
    group.add(ring3);

    // 4. Central Kinetic Energy Octahedron
    const coreGeo = new THREE.OctahedronGeometry(0.35, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    let rafId: number;

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

      const multiplier = hoveredRef.current ? 3.5 : 1.0;
      const base = 0.01 * multiplier;

      ring1.rotation.x += base * 1.2;
      ring1.rotation.y += base * 0.8;

      ring2.rotation.y -= base * 1.5;
      ring2.rotation.z += base * 1.1;

      ring3.rotation.z += base * 2.0;
      ring3.rotation.x -= base * 1.4;

      core.rotation.x += base * 2.5;
      core.rotation.y += base * 2.5;

      ringMat1.opacity = hoveredRef.current ? 0.95 : 0.55;
      ringMat2.opacity = hoveredRef.current ? 0.95 : 0.65;
      ringMat3.opacity = hoveredRef.current ? 1.0 : 0.75;

      const targetScale = hoveredRef.current ? 1.15 : 0.95;
      group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      renderer.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      ringGeo3.dispose();
      ringMat3.dispose();
      coreGeo.dispose();
      coreMat.dispose();
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width: '100%', height: '100%', display: 'block' }} 
    />
  );
}
