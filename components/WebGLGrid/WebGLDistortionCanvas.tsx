'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useWebGL } from '@/context/WebGLContext';
import { createCardShaderMaterial } from './CardShaderMaterial';

export default function WebGLDistortionCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { getCards } = useWebGL();

  useEffect(() => {
    if (!canvasRef.current) return;

    // 1. Setup Three.js
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    });
    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    
    // Orthographic camera for 1:1 pixel mapping
    const camera = new THREE.OrthographicCamera(
      0, window.innerWidth, 0, window.innerHeight, 0.1, 1000
    );
    camera.position.z = 100;

    // 2. Mesh pool management
    // 64x64 segments to give high resolution for vertex distortion
    const geometry = new THREE.PlaneGeometry(1, 1, 64, 64);
    const meshes = new Map<string, THREE.Mesh>();
    let lastScrollY = window.scrollY;

    // --- LAYOUT THRASHING FIX ---
    // Cache absolute positions of cards so we don't call getBoundingClientRect() every frame
    interface CachedRect {
      width: number;
      height: number;
      left: number;
      absoluteTop: number;
    }
    const rectCache = new Map<string, CachedRect>();
    
    const updateCache = () => {
      const currentScrollY = window.scrollY;
      const cards = getCards();
      cards.forEach((card, id) => {
        const rect = card.element.getBoundingClientRect();
        rectCache.set(id, {
          width: rect.width,
          height: rect.height,
          left: rect.left,
          absoluteTop: rect.top + currentScrollY
        });
      });
    };

    const resizeObserver = new ResizeObserver(updateCache);
    resizeObserver.observe(document.body);
    // Initial cache
    setTimeout(updateCache, 100);

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      
      camera.left = 0;
      camera.right = width;
      camera.top = 0;
      camera.bottom = height;
      camera.updateProjectionMatrix();
      
      updateCache();
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const clock = new THREE.Clock();

    // 3. Render Loop
    let rafId: number;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const currentScrollY = window.scrollY;

      const cards = getCards();

      // Sync DOM to WebGL
      cards.forEach((card, id) => {
        let mesh = meshes.get(id);
        if (!mesh) {
          const material = createCardShaderMaterial();
          // Assign colors based on card type
          if (card.type === 'ai-integrations') {
            material.uniforms.u_color1.value.set('#3b82f6');
            material.uniforms.u_color2.value.set('#8b5cf6');
          } else if (card.type === 'process-automation') {
            material.uniforms.u_color1.value.set('#10b981');
            material.uniforms.u_color2.value.set('#3b82f6');
          } else if (card.type === 'audit-analytics') {
            material.uniforms.u_color1.value.set('#f59e0b');
            material.uniforms.u_color2.value.set('#ef4444');
          } else if (card.type === 'redesign-uiux') {
            material.uniforms.u_color1.value.set('#ec4899');
            material.uniforms.u_color2.value.set('#8b5cf6');
          } else if (card.type === 'security-audit') {
            material.uniforms.u_color1.value.set('#ef4444');
            material.uniforms.u_color2.value.set('#f97316');
          } else {
             material.uniforms.u_color1.value.set('#6366f1');
             material.uniforms.u_color2.value.set('#a855f7');
          }

          mesh = new THREE.Mesh(geometry, material);
          mesh.frustumCulled = false;
          scene.add(mesh);
          meshes.set(id, mesh);
          
          // Force cache update for new mesh
          const rect = card.element.getBoundingClientRect();
          rectCache.set(id, {
            width: rect.width,
            height: rect.height,
            left: rect.left,
            absoluteTop: rect.top + currentScrollY
          });
        }

        // DOM Sync (Cached!)
        let cached = rectCache.get(id);
        if (!cached) return; // Should not happen

        const top = cached.absoluteTop - currentScrollY;
        const bottom = top + cached.height;
        
        // Frustum Culling manually (extreme optimization)
        const isVisible = (bottom > 0 && top < window.innerHeight);
        mesh.visible = isVisible;

        if (isVisible) {
          mesh.scale.set(cached.width, cached.height, 1);
          mesh.position.set(
            cached.left + cached.width / 2,
            top + cached.height / 2,
            0
          );

          // Update Uniforms
          const material = mesh.material as THREE.ShaderMaterial;
          material.uniforms.u_time.value = time;
          
          // Easing for hover state (smooth transition in and out)
          const targetHover = card.isHovered ? 1.0 : 0.0;
          material.uniforms.u_hoverState.value += (targetHover - material.uniforms.u_hoverState.value) * 0.1;

          if (material.uniforms.u_cardSize) {
             material.uniforms.u_cardSize.value.set(cached.width, cached.height);
          }
          
          // Smooth out mouse tracking so it doesn't instantly snap
          const currentMouseX = material.uniforms.u_mouse.value.x;
          const currentMouseY = material.uniforms.u_mouse.value.y;
          
          if (card.isHovered) {
             material.uniforms.u_mouse.value.set(
               currentMouseX + (card.mouse.relX - currentMouseX) * 0.15,
               currentMouseY + (card.mouse.relY - currentMouseY) * 0.15
             );
          } else {
             // Return to center slowly when not hovered
             material.uniforms.u_mouse.value.set(
               currentMouseX + (0.5 - currentMouseX) * 0.05,
               currentMouseY + (0.5 - currentMouseY) * 0.05
             );
          }
        }
      });

      // Cleanup removed cards
      meshes.forEach((mesh, id) => {
        if (!cards.has(id)) {
          scene.remove(mesh);
          mesh.geometry.dispose();
          (mesh.material as THREE.Material).dispose();
          meshes.delete(id);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
      renderer.dispose();
      meshes.forEach(mesh => {
        scene.remove(mesh);
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      meshes.clear();
    };
  }, [getCards]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0, 
      }}
    />
  );
}
