'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ChatVisual({ hovered }: { hovered: boolean }) {
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

    // 1. Neural Wireframe Icosahedron Core
    const sphereGeo = new THREE.IcosahedronGeometry(1.2, 2);
    const sphereEdges = new THREE.EdgesGeometry(sphereGeo);
    const sphereMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#a855f7'),
      transparent: true,
      opacity: 0.6,
    });
    const sphereLines = new THREE.LineSegments(sphereEdges, sphereMat);
    group.add(sphereLines);

    // 2. Synaptic Node Points
    const nodeCount = 42;
    const nodeGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const nodeGroup = new THREE.Group();
    group.add(nodeGroup);

    for (let i = 0; i < nodeCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.2;
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      nodeGroup.add(node);
    }

    // 3. Audio / Waveform Rings
    const ringGeo1 = new THREE.RingGeometry(1.45, 1.48, 48);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xC9A84C,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    group.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(1.7, 1.73, 48);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI * 0.4;
    group.add(ring2);

    // 4. Central Glowing AI Intelligence Point
    const centerGeo = new THREE.IcosahedronGeometry(0.5, 1);
    const centerMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const centerMesh = new THREE.Mesh(centerGeo, centerMat);
    group.add(centerMesh);

    let rafId: number;
    let wavePhase = 0;

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

      const speed = hoveredRef.current ? 0.03 : 0.008;
      group.rotation.y += speed;
      group.rotation.x += speed * 0.5;

      ring1.rotation.z += speed * 1.5;
      ring2.rotation.y -= speed * 1.2;

      // Pulse audio waveform effect on hover
      wavePhase += hoveredRef.current ? 0.1 : 0.03;
      const scaleWave = 1.0 + Math.sin(wavePhase) * (hoveredRef.current ? 0.08 : 0.02);
      sphereLines.scale.set(scaleWave, scaleWave, scaleWave);
      centerMesh.scale.set(1 / scaleWave, 1 / scaleWave, 1 / scaleWave);

      sphereMat.opacity = hoveredRef.current ? 0.95 : 0.5;
      ringMat1.opacity = hoveredRef.current ? 0.8 : 0.3;

      const targetScale = hoveredRef.current ? 1.15 : 0.95;
      group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      renderer.dispose();
      sphereGeo.dispose();
      sphereEdges.dispose();
      sphereMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      centerGeo.dispose();
      centerMat.dispose();
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width: '100%', height: '100%', display: 'block' }} 
    />
  );
}
