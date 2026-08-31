'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ScannerVisual({ hovered }: { hovered: boolean }) {
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

    // 1. 3D Faceted Shield Geodesic Dome (Security Forcefield)
    const shieldGeo = new THREE.IcosahedronGeometry(1.4, 1);
    const shieldEdges = new THREE.EdgesGeometry(shieldGeo);
    const shieldMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.65,
    });
    const shieldWireframe = new THREE.LineSegments(shieldEdges, shieldMat);
    group.add(shieldWireframe);

    // 2. Inner Security Lock Octahedron
    const lockGeo = new THREE.OctahedronGeometry(0.65, 0);
    const lockMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const lockMesh = new THREE.Mesh(lockGeo, lockMat);
    group.add(lockMesh);

    // 3. Sweeping Laser Scan Line Ring
    const scanRingGeo = new THREE.TorusGeometry(1.42, 0.02, 16, 64);
    const scanRingMat = new THREE.MeshBasicMaterial({
      color: 0x4ade80,
      transparent: true,
      opacity: 0.8,
    });
    const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
    scanRing.rotation.x = Math.PI / 2;
    group.add(scanRing);

    let rafId: number;
    let scanY = 0;
    let scanDir = 1;

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

      const speed = hoveredRef.current ? 0.025 : 0.008;
      group.rotation.y += speed;
      group.rotation.x = Math.sin(Date.now() * 0.002) * 0.15;
      lockMesh.rotation.y -= speed * 1.5;

      // Laser scan sweep
      const scanSpeed = hoveredRef.current ? 0.05 : 0.02;
      scanY += scanDir * scanSpeed;
      if (scanY > 1.2) scanDir = -1;
      if (scanY < -1.2) scanDir = 1;
      scanRing.position.y = scanY;

      shieldMat.opacity = hoveredRef.current ? 0.95 : 0.5;
      scanRingMat.opacity = hoveredRef.current ? 0.95 : 0.4;

      const targetScale = hoveredRef.current ? 1.15 : 0.95;
      group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      renderer.dispose();
      shieldGeo.dispose();
      shieldEdges.dispose();
      shieldMat.dispose();
      lockGeo.dispose();
      lockMat.dispose();
      scanRingGeo.dispose();
      scanRingMat.dispose();
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width: '100%', height: '100%', display: 'block' }} 
    />
  );
}
