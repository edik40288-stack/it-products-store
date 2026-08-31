'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function DashboardVisual({ hovered }: { hovered: boolean }) {
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
    camera.position.set(3.5, 3.2, 4.5);
    camera.lookAt(0, 0, 0);

    const group = new THREE.Group();
    scene.add(group);

    // 1. Isometric Base Grid
    const gridGeo = new THREE.PlaneGeometry(2.5, 2.5, 4, 4);
    const gridEdges = new THREE.EdgesGeometry(gridGeo);
    const gridMat = new THREE.LineBasicMaterial({
      color: 0x6b5bef,
      transparent: true,
      opacity: 0.35,
    });
    const gridMesh = new THREE.LineSegments(gridEdges, gridMat);
    gridMesh.rotation.x = -Math.PI / 2;
    gridMesh.position.y = -0.6;
    group.add(gridMesh);

    // 2. 3D Bar Columns
    const barCount = 4;
    const bars: THREE.Mesh[] = [];
    const barTops: THREE.Mesh[] = [];
    const heights = [0.6, 1.1, 1.5, 2.1];
    const targetHeights = [...heights];

    const boxGeo = new THREE.BoxGeometry(0.35, 1, 0.35);
    const barMat = new THREE.MeshBasicMaterial({
      color: 0xC9A84C,
      transparent: true,
      opacity: 0.6,
      wireframe: true,
    });

    const topGeo = new THREE.BoxGeometry(0.37, 0.04, 0.37);
    const topMat = new THREE.MeshBasicMaterial({
      color: 0xffe082,
    });

    for (let i = 0; i < barCount; i++) {
      const bar = new THREE.Mesh(boxGeo, barMat);
      const x = (i - 1.5) * 0.55;
      const z = (i - 1.5) * 0.15;
      bar.position.set(x, heights[i] / 2 - 0.6, z);
      bar.scale.set(1, heights[i], 1);
      group.add(bar);
      bars.push(bar);

      const top = new THREE.Mesh(topGeo, topMat);
      top.position.set(x, heights[i] - 0.6, z);
      group.add(top);
      barTops.push(top);
    }

    // 3. Floating 3D Spline Growth Curve Line
    const curvePoints = bars.map((b, i) => new THREE.Vector3(b.position.x, heights[i] - 0.45, b.position.z));
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const curveGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(30));
    const curveMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
    const curveLine = new THREE.Line(curveGeo, curveMat);
    group.add(curveLine);

    let rafId: number;
    let time = 0;

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
      time += 0.03;

      group.rotation.y = Math.sin(time * 0.4) * 0.15;

      bars.forEach((bar, i) => {
        const bounce = hoveredRef.current ? Math.sin(time * 2 + i * 0.8) * 0.25 : 0;
        const currentH = targetHeights[i] + bounce;
        bar.scale.y = THREE.MathUtils.lerp(bar.scale.y, currentH, 0.1);
        bar.position.y = bar.scale.y / 2 - 0.6;
        barTops[i].position.y = bar.scale.y - 0.6;
      });

      barMat.opacity = hoveredRef.current ? 0.95 : 0.55;

      const targetScale = hoveredRef.current ? 1.15 : 0.95;
      group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      renderer.dispose();
      gridGeo.dispose();
      gridEdges.dispose();
      gridMat.dispose();
      boxGeo.dispose();
      barMat.dispose();
      topGeo.dispose();
      topMat.dispose();
      curveGeo.dispose();
      curveMat.dispose();
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width: '100%', height: '100%', display: 'block' }} 
    />
  );
}
