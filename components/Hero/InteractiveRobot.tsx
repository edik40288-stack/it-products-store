'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import styles from './InteractiveRobot.module.css';

export default function InteractiveRobot() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // ─── RENDERER SETUP ───
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();

    // ─── CAMERA ───
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 4.5);
    camera.lookAt(0, 0, 0);

    // ─── LIGHTING ───
    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x6B5BEF, 0.6);
    rimLight.position.set(-3, 1, -2);
    scene.add(rimLight);

    const bottomFill = new THREE.DirectionalLight(0xC9A84C, 0.3);
    bottomFill.position.set(0, -3, 2);
    scene.add(bottomFill);

    // ─── CYBER HEAD GROUP ───
    const headGroup = new THREE.Group();
    scene.add(headGroup);

    // Inner group for parallax on visor
    const visorGroup = new THREE.Group();
    headGroup.add(visorGroup);

    // --- Helmet (Faceted Icosahedron) ---
    const helmetGeo = new THREE.IcosahedronGeometry(1, 2);
    // Flatten slightly to make it more mask-like
    const helmetPositions = helmetGeo.attributes.position;
    for (let i = 0; i < helmetPositions.count; i++) {
      const z = helmetPositions.getZ(i);
      // Push back vertices to flatten the back
      if (z < -0.3) {
        helmetPositions.setZ(i, z * 0.4);
      }
      // Slight vertical stretch for more "helmet" shape
      const y = helmetPositions.getY(i);
      helmetPositions.setY(i, y * 1.15);
    }
    helmetGeo.computeVertexNormals();

    const helmetMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          // Dark titanium base
          vec3 baseColor = vec3(0.078, 0.082, 0.106); // #14151B
          
          // Fresnel for metallic edge highlight
          float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);
          
          // Subtle blue-violet rim light reflection
          vec3 rimColor = vec3(0.42, 0.36, 0.93); // violet tint
          vec3 goldRim = vec3(0.79, 0.66, 0.30); // gold tint
          
          // Mix rim colors based on view angle
          vec3 rim = mix(rimColor, goldRim, fresnel * 0.5);
          
          // Metallic specular
          float specular = pow(max(dot(reflect(-vec3(0.5, 0.7, 1.0), vNormal), vViewDir), 0.0), 32.0);
          
          vec3 color = baseColor + rim * fresnel * 0.6 + vec3(1.0) * specular * 0.3;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    const helmet = new THREE.Mesh(helmetGeo, helmetMat);
    headGroup.add(helmet);

    // --- Visor (Glass Display) ---
    const visorGeo = new THREE.PlaneGeometry(1.2, 0.35, 1, 1);
    const visorMat = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_blinkPhase: { value: 1.0 }, // 1.0 = open, 0.05 = blinked
        u_color: { value: new THREE.Color('#C9A84C') },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float u_time;
        uniform float u_blinkPhase;
        uniform vec3 u_color;
        varying vec2 vUv;
        
        void main() {
          vec2 uv = vUv;
          
          // Blink: squish vertically toward center
          float distFromCenter = abs(uv.y - 0.5) * 2.0;
          float blinkMask = smoothstep(u_blinkPhase, u_blinkPhase - 0.1, distFromCenter);
          
          // Rounded rectangle mask for visor shape
          vec2 d = abs(uv - 0.5) * 2.0;
          float cornerDist = length(max(d - vec2(0.85, 0.6), 0.0));
          float mask = 1.0 - smoothstep(0.0, 0.15, cornerDist);
          
          // Glass tint base
          vec3 glassColor = vec3(0.05, 0.06, 0.1);
          float glassAlpha = 0.85;
          
          // Neon scan line (horizontal light track)
          float scanPos = fract(u_time * 0.3);
          float scanLine = smoothstep(0.02, 0.0, abs(uv.x - scanPos)) * 0.8;
          
          // Ambient glow in center
          float centerGlow = smoothstep(0.5, 0.0, length(uv - vec2(0.5, 0.5))) * 0.4;
          
          // Two "eye" dots
          float eye1 = smoothstep(0.06, 0.03, length(uv - vec2(0.35, 0.5)));
          float eye2 = smoothstep(0.06, 0.03, length(uv - vec2(0.65, 0.5)));
          float eyes = (eye1 + eye2) * 0.9;
          
          vec3 color = glassColor;
          color += u_color * (scanLine + centerGlow + eyes);
          
          // Edge glow
          float edgeGlow = smoothstep(0.0, 0.3, cornerDist) * mask * 0.3;
          color += u_color * edgeGlow;
          
          float alpha = mask * blinkMask * glassAlpha;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false,
    });

    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.05, 0.85);
    visorGroup.add(visor);

    // Visor glow light
    const visorGlow = new THREE.PointLight(0xC9A84C, 0.8, 3);
    visorGlow.position.set(0, 0.05, 1.2);
    visorGroup.add(visorGlow);

    // --- Particle Aura ---
    const particleCount = 200;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Spherical distribution around the head
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.5 + Math.random() * 1.5;

      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);

      // Random orbital speeds
      particleSpeeds[i * 3] = (Math.random() - 0.5) * 0.02;
      particleSpeeds[i * 3 + 1] = (Math.random() - 0.5) * 0.015;
      particleSpeeds[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

      particleSizes[i] = Math.random() * 3 + 1;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

    const particleMat = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_color: { value: new THREE.Color('#C9A84C') },
      },
      vertexShader: `
        attribute float size;
        uniform float u_time;
        varying float vAlpha;
        
        void main() {
          vec3 pos = position;
          
          // Orbital rotation
          float angle = u_time * 0.3;
          float s = sin(angle + pos.x * 2.0);
          float c = cos(angle + pos.y * 2.0);
          pos.x += s * 0.1;
          pos.y += c * 0.08;
          pos.z += sin(u_time * 0.5 + pos.z) * 0.05;
          
          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPos;
          
          // Size attenuation
          gl_PointSize = size * (200.0 / -mvPos.z);
          
          // Fade based on distance from center
          vAlpha = smoothstep(3.0, 1.2, length(pos)) * 0.7;
        }
      `,
      fragmentShader: `
        uniform vec3 u_color;
        varying float vAlpha;
        
        void main() {
          // Soft circle
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float alpha = smoothstep(1.0, 0.3, d) * vAlpha;
          
          gl_FragColor = vec4(u_color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    headGroup.add(particles);

    // ─── MOUSE TRACKING STATE ───
    let mouseX = 0;
    let mouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;
    let currentRotY = 0;
    let currentRotX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetRotY = mouseX * 0.45; // ±25°
      targetRotX = -mouseY * 0.25; // ±15°
    };
    window.addEventListener('mousemove', handleMouseMove);

    // ─── SCROLL FADE STATE ───
    let scrollProgress = 0;
    const handleScroll = () => {
      const heroHeight = container.parentElement?.offsetHeight || window.innerHeight;
      scrollProgress = Math.min(window.scrollY / (heroHeight * 0.5), 1);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // ─── BLINK TIMER ───
    let blinkState = 1.0; // 1 = open
    let blinkTarget = 1.0;
    let nextBlink = 4 + Math.random() * 3; // 4-7 seconds
    let blinkTimer = 0;

    // ─── RESIZE ───
    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
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
      const time = clock.getElapsedTime();
      const delta = clock.getDelta();

      // --- Layer 1: Idle Animation ---
      // Levitation (±8px mapped to 3D units)
      const levitation = Math.sin(time * 2.0) * 0.08;
      // Gentle tilt
      const idleTilt = Math.sin(time * 0.7) * 0.026; // ±1.5°

      // --- Blink ---
      blinkTimer += 1 / 60;
      if (blinkTimer >= nextBlink) {
        blinkTarget = 0.05; // close
        setTimeout(() => { blinkTarget = 1.0; }, 180); // reopen after 180ms
        blinkTimer = 0;
        nextBlink = 4 + Math.random() * 3;
      }
      blinkState += (blinkTarget - blinkState) * 0.3;
      visorMat.uniforms.u_blinkPhase.value = blinkState;

      // --- Layer 2: Mouse Tracking (Lerp) ---
      currentRotY += (targetRotY - currentRotY) * 0.08;
      currentRotX += (targetRotX - currentRotX) * 0.08;

      // Apply rotation to head group
      headGroup.rotation.y = currentRotY + idleTilt;
      headGroup.rotation.x = currentRotX;
      headGroup.position.y = levitation;

      // Parallax: visor moves more than helmet
      visorGroup.rotation.y = currentRotY * 0.4; // Extra 40% rotation
      visorGroup.rotation.x = currentRotX * 0.3;

      // --- Layer 3: Scroll Fade ---
      const fadeScale = 1 - scrollProgress * 0.2; // 1 → 0.8
      const fadeOpacity = 1 - scrollProgress;
      headGroup.scale.setScalar(fadeScale);
      // Apply opacity via renderer
      canvas.style.opacity = String(Math.max(fadeOpacity, 0));

      // --- Update shader uniforms ---
      visorMat.uniforms.u_time.value = time;
      particleMat.uniforms.u_time.value = time;

      // Visor glow intensity matches blink
      visorGlow.intensity = blinkState * 0.8;

      renderer.render(scene, camera);
    };

    animate();

    // ─── CLEANUP ───
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
      renderer.dispose();
      helmetGeo.dispose();
      helmetMat.dispose();
      visorGeo.dispose();
      visorMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
