'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import styles from './WebGLBackground.module.css';
import { vertexShader, fragmentShader } from './shaders';

export default function WebGLBackground() {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 });
  const isVisible = useRef(true);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
    
    // Crucial performance fix: hardcap pixel ratio at a lower value to fix lag
    // Using 0.5 or 0.25 drastically reduces fragment shader load on full screen
    renderer.setPixelRatio(0.35); 
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Shader material
    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      targetMouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Resize handler with debouncing
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      }, 100);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Intersection observer to pause rendering when scrolled past hero
    const observer = new IntersectionObserver((entries) => {
      isVisible.current = entries[0].isIntersecting;
    });
    observer.observe(mountRef.current);

    // Animation loop
    let frameId: number;
    let startTime = Date.now();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      if (!isVisible.current) return;

      uniforms.uTime.value = (Date.now() - startTime) / 1000;

      // Lerp mouse for inertia
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05;
      uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className={styles.background} aria-hidden="true" />;
}
