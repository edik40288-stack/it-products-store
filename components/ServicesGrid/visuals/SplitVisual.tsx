'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function SplitVisual({ hovered }: { hovered: boolean }) {
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
    camera.position.set(0, 0, 5.0);

    const group = new THREE.Group();
    scene.add(group);

    // 1. Back Wireframe Frame ("Before")
    const backGeo = new THREE.BoxGeometry(1.6, 2.0, 0.1);
    const backEdges = new THREE.EdgesGeometry(backGeo);
    const backMat = new THREE.LineBasicMaterial({
      color: 0x64748b,
      transparent: true,
      opacity: 0.4,
    });
    const backMesh = new THREE.LineSegments(backEdges, backMat);
    backMesh.position.set(-0.3, -0.2, -0.4);
    group.add(backMesh);

    // 2. Front Glowing Holographic Glass UI Frame ("After")
    const frontGeo = new THREE.BoxGeometry(1.7, 2.1, 0.1);
    const frontEdges = new THREE.EdgesGeometry(frontGeo);
    const frontMat = new THREE.LineBasicMaterial({
      color: 0xC9A84C,
      transparent: true,
      opacity: 0.8,
    });
    const frontMesh = new THREE.LineSegments(frontEdges, frontMat);
    frontMesh.position.set(0.2, 0.1, 0.3);
    group.add(frontMesh);

    // 3. UI Element Wireframe Lines inside Front Frame
    const uiLinesGroup = new THREE.Group();
    frontMesh.add(uiLinesGroup);

    const barGeo = new THREE.BoxGeometry(1.1, 0.15, 0.02);
    const barMat = new THREE.MeshBasicMaterial({ color: 0xec4899, transparent: true, opacity: 0.7 });
    const headerBar = new THREE.Mesh(barGeo, barMat);
    headerBar.position.set(0, 0.65, 0);
    uiLinesGroup.add(headerBar);

    const cardGeo = new THREE.BoxGeometry(0.5, 0.5, 0.02);
    const cardMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.6 });
    const card1 = new THREE.Mesh(cardGeo, cardMat);
    card1.position.set(-0.35, 0.1, 0);
    uiLinesGroup.add(card1);

    const card2 = new THREE.Mesh(cardGeo, cardMat);
    card2.position.set(0.35, 0.1, 0);
    uiLinesGroup.add(card2);

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

      const targetRotY = hoveredRef.current ? 0.35 : 0.15;
      const targetRotX = hoveredRef.current ? -0.2 : -0.05;
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetRotY, 0.05);
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetRotX, 0.05);

      // Parallax layer separation on hover
      const targetZOffset = hoveredRef.current ? 0.7 : 0.3;
      frontMesh.position.z = THREE.MathUtils.lerp(frontMesh.position.z, targetZOffset, 0.08);

      const targetScale = hoveredRef.current ? 1.15 : 0.95;
      group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      renderer.dispose();
      backGeo.dispose();
      backEdges.dispose();
      backMat.dispose();
      frontGeo.dispose();
      frontEdges.dispose();
      frontMat.dispose();
      barGeo.dispose();
      barMat.dispose();
      cardGeo.dispose();
      cardMat.dispose();
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width: '100%', height: '100%', display: 'block' }} 
    />
  );
}
