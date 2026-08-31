'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function CodeVisual({ hovered }: { hovered: boolean }) {
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
    camera.position.set(0, 0, 5.5);

    const group = new THREE.Group();
    scene.add(group);

    // 1. Outer Wireframe 3D Matrix Box
    const boxGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    const boxEdges = new THREE.EdgesGeometry(boxGeo);
    const boxMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#3b82f6'),
      transparent: true,
      opacity: 0.6,
    });
    const boxWireframe = new THREE.LineSegments(boxEdges, boxMat);
    group.add(boxWireframe);

    // 2. Inner Glowing Core Box
    const innerBoxGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const innerBoxEdges = new THREE.EdgesGeometry(innerBoxGeo);
    const innerBoxMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#C9A84C'),
      transparent: true,
      opacity: 0.85,
    });
    const innerWireframe = new THREE.LineSegments(innerBoxEdges, innerBoxMat);
    group.add(innerWireframe);

    // 3. Central glowing crystal
    const crystalGeo = new THREE.OctahedronGeometry(0.4, 0);
    const crystalMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#60a5fa'),
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    group.add(crystal);

    // 4. Floating Floating Code Data Nodes (Small cubes on corners)
    const nodeGroup = new THREE.Group();
    group.add(nodeGroup);
    const nodeGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xC9A84C });
    
    const nodePositions = [
      [0.8, 0.8, 0.8], [-0.8, 0.8, 0.8], [0.8, -0.8, 0.8], [-0.8, -0.8, 0.8],
      [0.8, 0.8, -0.8], [-0.8, 0.8, -0.8], [0.8, -0.8, -0.8], [-0.8, -0.8, -0.8]
    ];
    nodePositions.forEach(([x, y, z]) => {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(x, y, z);
      nodeGroup.add(node);
    });

    // 5. Orbiting Data Particle Cloud
    const particleCount = 45;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1.3 + (i % 3) * 0.2;
      pPos[i * 3] = Math.cos(angle) * radius;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      pPos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.06,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeo, pMat);
    group.add(particles);

    // Isometric presentation tilt
    group.rotation.x = Math.PI * 0.15;
    group.rotation.y = Math.PI * 0.25;

    let rafId: number;
    let targetSpeed = 0.4;
    let currentSpeed = 0.4;

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

      targetSpeed = hoveredRef.current ? 1.8 : 0.4;
      currentSpeed += (targetSpeed - currentSpeed) * 0.08;

      group.rotation.y += currentSpeed * 0.015;
      group.rotation.x = Math.PI * 0.15 + Math.sin(Date.now() * 0.002) * 0.1;
      innerWireframe.rotation.y -= currentSpeed * 0.025;
      crystal.rotation.x += currentSpeed * 0.03;
      particles.rotation.y += currentSpeed * 0.02;

      // Scale bounce on hover
      const targetScale = hoveredRef.current ? 1.12 : 0.95;
      group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

      boxMat.opacity = hoveredRef.current ? 0.9 : 0.45;
      innerBoxMat.opacity = hoveredRef.current ? 1.0 : 0.65;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      renderer.dispose();
      boxGeo.dispose();
      boxEdges.dispose();
      boxMat.dispose();
      innerBoxGeo.dispose();
      innerBoxEdges.dispose();
      innerBoxMat.dispose();
      crystalGeo.dispose();
      crystalMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      pGeo.dispose();
      pMat.dispose();
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width: '100%', height: '100%', display: 'block' }} 
    />
  );
}
