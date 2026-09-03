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

    // Disable WebGL mesh distortion on touch devices:
    // Touch scrolling compositor lags behind requestAnimationFrame, causing severe jitter/jumping
    const isTouch = typeof window !== 'undefined' && 
      ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024);

    if (isTouch) {
      if (canvasRef.current) {
        canvasRef.current.style.display = 'none';
      }
      return;
    }

    // 1. Setup Three.js
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    });
    
    // Clamp pixel ratio to 1.5 to prevent massive GPU bottleneck on retina displays
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const scene = new THREE.Scene();
    
    // Orthographic camera for 1:1 pixel mapping
    const camera = new THREE.OrthographicCamera(
      0, window.innerWidth, 0, window.innerHeight, 0.1, 1000
    );
    camera.position.z = 100;

    // 2. Mesh pool management
    // 48x48 segments gives ultra-smooth organic bending resolution
    const geometry = new THREE.PlaneGeometry(1, 1, 48, 48);
    const meshes = new Map<string, THREE.Mesh>();

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      
      camera.left = 0;
      camera.right = width;
      camera.top = 0;
      camera.bottom = height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const clock = new THREE.Clock();

    // 3. Render Loop with real-time DOM sync
    let rafId: number;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const cards = getCards();

      // Sync DOM elements directly to WebGL in real-time
      cards.forEach((card, id) => {
        let mesh = meshes.get(id);
        if (!mesh) {
          const material = createCardShaderMaterial();
          // Assign colors based on exact card ID
          if (card.type === 'development') {
            material.uniforms.u_color1.value.set('#6366f1');
            material.uniforms.u_color2.value.set('#8b5cf6');
          } else if (card.type === 'ai-agents') {
            material.uniforms.u_color1.value.set('#06b6d4');
            material.uniforms.u_color2.value.set('#3b82f6');
          } else if (card.type === 'crm') {
            material.uniforms.u_color1.value.set('#3b82f6');
            material.uniforms.u_color2.value.set('#8b5cf6');
          } else if (card.type === 'llm-integrations') {
            material.uniforms.u_color1.value.set('#8b5cf6');
            material.uniforms.u_color2.value.set('#d946ef');
          } else if (card.type === 'automation') {
            material.uniforms.u_color1.value.set('#10b981');
            material.uniforms.u_color2.value.set('#3b82f6');
          } else if (card.type === 'analytics') {
            material.uniforms.u_color1.value.set('#f59e0b');
            material.uniforms.u_color2.value.set('#ef4444');
          } else if (card.type === 'redesign') {
            material.uniforms.u_color1.value.set('#ec4899');
            material.uniforms.u_color2.value.set('#8b5cf6');
          } else if (card.type === 'security') {
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
        }

        const rect = card.element.getBoundingClientRect();
        const isVisible = rect.bottom > -50 && rect.top < window.innerHeight + 50 && rect.width > 0;
        mesh.visible = isVisible;

        if (isVisible) {
          mesh.scale.set(rect.width, rect.height, 1);
          mesh.position.set(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            0
          );

          // Update Uniforms
          const material = mesh.material as THREE.ShaderMaterial;
          material.uniforms.u_time.value = time;
          
          // Easing for hover state (smooth transition in and out)
          const targetHover = card.isHovered ? 1.0 : 0.0;
          material.uniforms.u_hoverState.value += (targetHover - material.uniforms.u_hoverState.value) * 0.15;

          if (material.uniforms.u_cardSize) {
            material.uniforms.u_cardSize.value.set(rect.width, rect.height);
          }
          
          // Smooth out mouse tracking
          const currentMouseX = material.uniforms.u_mouse.value.x;
          const currentMouseY = material.uniforms.u_mouse.value.y;
          
          if (card.isHovered) {
            material.uniforms.u_mouse.value.set(
              currentMouseX + (card.mouse.relX - currentMouseX) * 0.2,
              currentMouseY + (card.mouse.relY - currentMouseY) * 0.2
            );
          } else {
            // Return to center when not hovered
            material.uniforms.u_mouse.value.set(
              currentMouseX + (0.5 - currentMouseX) * 0.08,
              currentMouseY + (0.5 - currentMouseY) * 0.08
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
