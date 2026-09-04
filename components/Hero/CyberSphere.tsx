'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import styles from './CyberSphere.module.css';

interface CyberSphereProps {
  topicColor: string;
  isTopicChanging: boolean;
  isFocused: boolean;
  isScanning: boolean;
  hasStarted: boolean;
}

export default function CyberSphere({ 
  topicColor, 
  isTopicChanging, 
  isFocused, 
  isScanning,
  hasStarted 
}: CyberSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ topicColor, isTopicChanging, isFocused, isScanning, hasStarted });

  useEffect(() => {
    propsRef.current = { topicColor, isTopicChanging, isFocused, isScanning, hasStarted };
  }, [topicColor, isTopicChanging, isFocused, isScanning, hasStarted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // ─── RENDERER ───
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(container);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    // ─── MASTER SPHERE GROUP ───
    const masterSphere = new THREE.Group();
    masterSphere.scale.setScalar(0.001); // starts small for smooth appearance
    scene.add(masterSphere);

    // ─── 1. CORE ICOSAHEDRON WIREFRAME ───
    const coreGroup = new THREE.Group();
    masterSphere.add(coreGroup);

    const geo = new THREE.IcosahedronGeometry(1.25, 2);
    const edges = new THREE.EdgesGeometry(geo);
    
    const wireframeMat = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_color: { value: new THREE.Color(propsRef.current.topicColor) },
        u_pulse: { value: 0.0 }
      },
      vertexShader: `
        uniform float u_time;
        uniform float u_pulse;
        varying vec3 vNormal;
        varying vec3 vPos;
        void main() {
          vPos = position;
          vec3 pos = position * (1.0 + u_pulse * 0.08 + sin(position.y * 4.0 + u_time * 2.0) * 0.02);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 u_color;
        uniform float u_pulse;
        uniform float u_time;
        varying vec3 vPos;
        void main() {
          float wave = sin(vPos.y * 3.0 + u_time * 3.0) * 0.5 + 0.5;
          vec3 finalColor = mix(u_color, vec3(1.0), u_pulse * 0.25 + wave * 0.15); 
          gl_FragColor = vec4(finalColor, 0.65 + u_pulse * 0.3);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const wireframe = new THREE.LineSegments(edges, wireframeMat);
    coreGroup.add(wireframe);

    // Inner glowing crystal core
    const innerGeo = new THREE.IcosahedronGeometry(0.85, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(propsRef.current.topicColor),
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      wireframe: true
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerCore);

    // ─── 2. GYROSCOPIC ORBITAL RINGS ───
    const ringsGroup = new THREE.Group();
    masterSphere.add(ringsGroup);

    const ringMat = new THREE.ShaderMaterial({
      uniforms: {
        u_color: { value: new THREE.Color(propsRef.current.topicColor) },
        u_time: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 u_color;
        uniform float u_time;
        varying vec2 vUv;
        void main() {
          float pulse = sin(vUv.x * 12.0 - u_time * 4.0) * 0.5 + 0.5;
          gl_FragColor = vec4(mix(u_color, vec3(1.0), pulse * 0.4), 0.35 + pulse * 0.4);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const ringGeo1 = new THREE.TorusGeometry(1.65, 0.008, 16, 64);
    const ring1 = new THREE.Mesh(ringGeo1, ringMat);
    ringsGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(1.9, 0.006, 16, 64);
    const ring2 = new THREE.Mesh(ringGeo2, ringMat);
    ring2.rotation.x = Math.PI * 0.35;
    ring2.rotation.y = Math.PI * 0.2;
    ringsGroup.add(ring2);

    // ─── 3. PARTICLE CLOUD (Inside Master Group so it rotates with sphere) ───
    const particleCount = isMobile ? 100 : 380;
    const pPositions = new Float32Array(particleCount * 3);
    const pBaseRadii = new Float32Array(particleCount);
    const pSpeeds = new Float32Array(particleCount);
    const pPhases = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.45 + Math.random() * 1.5;

      pPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPositions[i * 3 + 2] = r * Math.cos(phi);

      pBaseRadii[i] = r;
      pSpeeds[i] = 0.4 + Math.random() * 0.8;
      pPhases[i] = Math.random() * Math.PI * 2;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute('a_speed', new THREE.BufferAttribute(pSpeeds, 1));
    pGeo.setAttribute('a_phase', new THREE.BufferAttribute(pPhases, 1));

    const pMat = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_color: { value: new THREE.Color(propsRef.current.topicColor) },
        u_speedMulti: { value: 1.0 },
        u_formationPhase: { value: 0.0 }
      },
      vertexShader: `
        attribute float a_speed;
        attribute float a_phase;
        uniform float u_time;
        uniform float u_speedMulti;
        uniform float u_formationPhase;
        varying float vAlpha;
        
        void main() {
          vec3 pos = position;
          
          // Subtle orbital wobble
          float angle = u_time * a_speed * 0.3 * u_speedMulti + a_phase;
          float s = sin(angle);
          float c = cos(angle);
          pos.x += s * 0.08;
          pos.y += c * 0.08;
          
          pos *= u_formationPhase;

          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPos;
          gl_PointSize = (38.0 / -mvPos.z) * u_formationPhase;
          
          vAlpha = smoothstep(3.2, 1.2, length(pos)) * 0.8;
        }
      `,
      fragmentShader: `
        uniform vec3 u_color;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float alpha = smoothstep(1.0, 0.15, d) * vAlpha;
          gl_FragColor = vec4(mix(u_color, vec3(1.0), 0.3), alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(pGeo, pMat);
    masterSphere.add(particles);

    // ─── 4. INTERACTION STATE & PHYSICS ───
    let mouseX = 0;
    let mouseY = 0;
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    let sphereRotX = 0;
    let sphereRotY = 0;
    let sphereRotZ = 0;

    let velocityX = 0;
    let velocityY = 0;

    let isDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let formationPhase = 0;
    let currentPulse = 0;
    let currentColor = new THREE.Color(propsRef.current.topicColor);

    // ─── POINTER / DRAG LISTENERS ───
    const onPointerDown = (e: PointerEvent) => {
      // NEVER hijack pointer or scroll on mobile/touch screens
      if (isMobile || e.pointerType === 'touch') return;
      isDragging = true;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      velocityX = 0;
      velocityY = 0;
      if (container.setPointerCapture) {
        container.setPointerCapture(e.pointerId);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      // Global mouse coordinate for parallax
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - lastPointerX;
        const deltaY = e.clientY - lastPointerY;

        // Directly rotate sphere
        sphereRotY += deltaX * 0.008;
        sphereRotX += deltaY * 0.008;

        // Track velocity with smoothing
        velocityX = deltaX * 0.006;
        velocityY = deltaY * 0.006;

        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      if (container.releasePointerCapture) {
        try {
          container.releasePointerCapture(e.pointerId);
        } catch {
          // pointer might have released already
        }
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // ─── RESIZE ───
    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const size = Math.max(Math.min(rect.width, rect.height), 200);
      renderer.setSize(size, size);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // ─── ANIMATION LOOP ───
    const clock = new THREE.Clock();
    let rafId: number;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (!isVisible) return;
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();
      const props = propsRef.current;

      // 1. Formation explosion on startup
      if (props.hasStarted && formationPhase < 1) {
        formationPhase += delta * 1.5;
        if (formationPhase > 1) formationPhase = 1;
      }
      masterSphere.scale.setScalar(THREE.MathUtils.lerp(0.001, 1.0, formationPhase));
      pMat.uniforms.u_formationPhase.value = formationPhase;

      // 2. Physics & Drag Momentum
      if (!isDragging) {
        // Apply friction to user momentum
        sphereRotY += velocityX;
        sphereRotX += velocityY;
        velocityX *= 0.93;
        velocityY *= 0.93;
      }

      // Parallax mouse tilt
      if (props.isFocused) {
        targetParallaxX = 0.35;
        targetParallaxY = -0.2;
      } else {
        targetParallaxX = -mouseY * 0.35;
        targetParallaxY = mouseX * 0.45;
      }

      currentParallaxX += (targetParallaxX - currentParallaxX) * 0.08;
      currentParallaxY += (targetParallaxY - currentParallaxY) * 0.08;

      // Apply master orientation - continuous time-based rotation eliminates stuttering/jitter
      masterSphere.rotation.x = time * 0.1 + sphereRotX + currentParallaxX;
      masterSphere.rotation.y = time * 0.25 + sphereRotY + currentParallaxY;
      masterSphere.rotation.z = time * 0.04 + sphereRotZ;

      // Idle levitation
      masterSphere.position.y = Math.sin(time * 1.5) * 0.08;

      // Rotate orbital rings individually
      ring1.rotation.z = time * 0.3;
      ring2.rotation.x = Math.PI * 0.35 + Math.sin(time * 0.4) * 0.15;
      ring2.rotation.y = time * 0.2;

      // 3. Color & Pulse Animation
      const targetColor = new THREE.Color(props.topicColor);
      currentColor.lerp(targetColor, 0.08);

      wireframeMat.uniforms.u_color.value = currentColor;
      ringMat.uniforms.u_color.value = currentColor;
      pMat.uniforms.u_color.value = currentColor;
      innerMat.color = currentColor;

      if (props.isTopicChanging) {
        currentPulse = THREE.MathUtils.lerp(currentPulse, 1.2, 0.15);
      } else {
        currentPulse = THREE.MathUtils.lerp(currentPulse, 0.0, 0.05);
      }

      // Boost energy when dragging fast
      const dragSpeed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      if (dragSpeed > 0.002) {
        currentPulse = Math.min(currentPulse + dragSpeed * 8.0, 1.5);
      }

      wireframeMat.uniforms.u_pulse.value = currentPulse;
      wireframeMat.uniforms.u_time.value = time;
      ringMat.uniforms.u_time.value = time;
      pMat.uniforms.u_time.value = time;

      // Particle speed multiplier
      let speedMulti = 1.0;
      if (props.isFocused || props.isScanning) speedMulti = 2.5;
      if (dragSpeed > 0.002) speedMulti = Math.max(speedMulti, 1.5 + dragSpeed * 80.0);
      pMat.uniforms.u_speedMulti.value = THREE.MathUtils.lerp(pMat.uniforms.u_speedMulti.value, speedMulti, 0.08);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
      observer.disconnect();

      renderer.dispose();
      geo.dispose();
      edges.dispose();
      wireframeMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo1.dispose();
      ringGeo2.dispose();
      ringMat.dispose();
      pGeo.dispose();
      pMat.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
