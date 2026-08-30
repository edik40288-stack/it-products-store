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

  // Keep ref updated for the animation loop without re-running useEffect
  useEffect(() => {
    propsRef.current = { topicColor, isTopicChanging, isFocused, isScanning, hasStarted };
  }, [topicColor, isTopicChanging, isFocused, isScanning, hasStarted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // ─── RENDERER ───
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 5);

    // ─── GEOMETRY: WIREFRAME CORE ───
    const coreGroup = new THREE.Group();
    // Start at scale 0 for Act 1 explosion
    coreGroup.scale.setScalar(0.001); 
    scene.add(coreGroup);

    // Icosahedron for the wireframe core
    const geo = new THREE.IcosahedronGeometry(1.2, 2);
    const edges = new THREE.EdgesGeometry(geo);
    
    // Custom shader for the wireframe lines to make them glow and pulse
    const wireframeMat = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_color: { value: new THREE.Color(propsRef.current.topicColor) },
        u_pulse: { value: 0.0 }
      },
      vertexShader: `
        uniform float u_pulse;
        void main() {
          vec3 pos = position * (1.0 + u_pulse * 0.1);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 u_color;
        uniform float u_pulse;
        void main() {
          // Очень мягкое осветление при пульсации (чтобы не выглядело как глитч/обновление)
          vec3 finalColor = mix(u_color, vec3(1.0), u_pulse * 0.15); 
          gl_FragColor = vec4(finalColor, 0.5 + u_pulse * 0.2);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const wireframe = new THREE.LineSegments(edges, wireframeMat);
    coreGroup.add(wireframe);

    // Inner glowing core
    const innerGeo = new THREE.IcosahedronGeometry(0.8, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: propsRef.current.topicColor,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
      wireframe: true
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerCore);

    // ─── PARTICLES ───
    const particleCount = 300;
    const pPositions = new Float32Array(particleCount * 3);
    const pSpeeds = new Float32Array(particleCount);
    const pOffsets = new Float32Array(particleCount); // random phase

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.6 + Math.random() * 2.0;

      pPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPositions[i * 3 + 2] = r * Math.cos(phi);

      pSpeeds[i] = 0.2 + Math.random() * 0.5;
      pOffsets[i] = Math.random() * Math.PI * 2;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute('a_speed', new THREE.BufferAttribute(pSpeeds, 1));
    pGeo.setAttribute('a_offset', new THREE.BufferAttribute(pOffsets, 1));

    const pMat = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_color: { value: new THREE.Color(propsRef.current.topicColor) },
        u_speedMulti: { value: 1.0 },
        u_formationPhase: { value: 0.0 } // 0 = point, 1 = sphere
      },
      vertexShader: `
        attribute float a_speed;
        attribute float a_offset;
        uniform float u_time;
        uniform float u_speedMulti;
        uniform float u_formationPhase;
        varying float vAlpha;
        
        void main() {
          vec3 pos = position;
          
          // Orbital rotation
          float angle = u_time * a_speed * u_speedMulti + a_offset;
          
          // Rotate around Y axis
          float s = sin(angle);
          float c = cos(angle);
          float nx = pos.x * c - pos.z * s;
          float nz = pos.x * s + pos.z * c;
          pos.x = nx;
          pos.z = nz;
          
          // Act 1: Formation explosion (particles start at center and explode out)
          pos *= u_formationPhase;

          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPos;
          gl_PointSize = (40.0 / -mvPos.z) * u_formationPhase;
          
          vAlpha = smoothstep(3.5, 1.5, length(pos)) * 0.6;
        }
      `,
      fragmentShader: `
        uniform vec3 u_color;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float alpha = smoothstep(1.0, 0.2, d) * vAlpha;
          gl_FragColor = vec4(u_color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ─── STATE VARIABLES ───
    let mouseX = 0;
    let mouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;
    let currentRotY = 0;
    let currentRotX = 0;
    let scrollProgress = 0;
    let currentColor = new THREE.Color(propsRef.current.topicColor);
    let currentPulse = 0;
    let scanPhase = 0;
    let formationPhase = 0;
    let formationSpeed = 0;

    // ─── EVENT LISTENERS ───
    let heroHeight = window.innerHeight;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleScroll = () => {
      scrollProgress = Math.min(window.scrollY / (heroHeight * 0.6), 1);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
      renderer.setSize(size, size);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
      heroHeight = container.parentElement?.offsetHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // ─── ANIMATION LOOP ───
    const clock = new THREE.Clock();
    let rafId: number;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const props = propsRef.current;

      // 1. Act 1: Formation Explosion
      if (props.hasStarted && formationPhase < 1) {
        formationSpeed += 0.005; // Accelerate outwards
        formationPhase += formationSpeed;
        if (formationPhase > 1) {
          formationPhase = 1; // Snap to full size
          // Overshoot bounce
          coreGroup.scale.setScalar(1.1);
        }
        // Expand core
        if (coreGroup.scale.x < 1 && formationPhase === 1) {
          // handled by lerp below
        } else if (formationPhase < 1) {
          coreGroup.scale.setScalar(formationPhase * 0.8); 
        }
      }
      pMat.uniforms.u_formationPhase.value = formationPhase;

      // Core scale bounce return
      if (formationPhase === 1 && !props.isFocused) {
        coreGroup.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }

      // 2. Mouse Tracking & Act 3 Focus
      if (props.isFocused) {
        // Look down at input
        targetRotX = 0.6;
        targetRotY = 0;
      } else {
        // Инвертированное слежение: сфера "смотрит" за курсором
        targetRotY = -mouseX * 0.5; 
        targetRotX = mouseY * 0.4;
      }

      // Отзывчивость мыши (было 0.04, стало 0.08 для большей живости)
      currentRotY += (targetRotY - currentRotY) * 0.08;
      currentRotX += (targetRotX - currentRotX) * 0.08;

      // Idle float (only if not focused)
      const levitation = props.isFocused ? 0 : Math.sin(time * 1.5) * 0.1;

      coreGroup.rotation.y = currentRotY;
      coreGroup.rotation.x = currentRotX + time * 0.1; // slow constant spin
      coreGroup.rotation.z = time * 0.05;
      coreGroup.position.y = levitation;

      // 3. Act 2: Topic Color & Pulse
      const targetColor = new THREE.Color(props.topicColor);
      currentColor.lerp(targetColor, 0.05);
      wireframeMat.uniforms.u_color.value = currentColor;
      pMat.uniforms.u_color.value = currentColor;
      innerMat.color = currentColor;

      // Pulse on topic change (сделаем его более плавным и долгим)
      if (props.isTopicChanging) {
        currentPulse = THREE.MathUtils.lerp(currentPulse, 1.0, 0.1);
      } else {
        currentPulse = THREE.MathUtils.lerp(currentPulse, 0.0, 0.05);
      }

      // 4. Act 3: Scanning Pulsations
      if (props.isScanning) {
        scanPhase += 0.2; // Fast pulse
        currentPulse = Math.abs(Math.sin(scanPhase)) * 1.5;
        // Lean closer
        coreGroup.position.z = THREE.MathUtils.lerp(coreGroup.position.z, 1.0, 0.1);
      } else {
        scanPhase = 0;
        coreGroup.position.z = THREE.MathUtils.lerp(coreGroup.position.z, 0, 0.1);
      }

      wireframeMat.uniforms.u_pulse.value = currentPulse;

      // Particle speed (x3 when focused/scanning)
      const targetSpeedMulti = (props.isFocused || props.isScanning) ? 3.0 : 1.0;
      pMat.uniforms.u_speedMulti.value = THREE.MathUtils.lerp(pMat.uniforms.u_speedMulti.value, targetSpeedMulti, 0.05);
      pMat.uniforms.u_time.value = time;

      // 5. Act 4: Scroll Z-Depth
      // Move deep into screen (Z gets negative)
      const scrollZ = -scrollProgress * 5.0;
      const scrollOpacity = 1.0 - scrollProgress * 1.5;
      
      scene.position.z = scrollZ;
      canvas.style.opacity = String(Math.max(scrollOpacity, 0));

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
      renderer.dispose();
      geo.dispose();
      edges.dispose();
      wireframeMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
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
