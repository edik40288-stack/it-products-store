'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import styles from './WebGLBackground.module.css';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // Smooth noise function
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    vec2 mouseInfluence = uMouse * 0.3;

    // Deep charcoal base
    vec3 baseColor = vec3(0.039, 0.039, 0.047); // #0A0A0C

    // Gold accent blob — follows mouse
    float goldDist = length(uv - vec2(0.5 + mouseInfluence.x * 0.4, 0.3 + mouseInfluence.y * 0.3));
    float goldBlob = smoothstep(0.6, 0.0, goldDist) * 0.18;
    vec3 goldColor = vec3(0.788, 0.659, 0.298); // #C9A84C

    // Blue-violet blob — opposite side
    float violetDist = length(uv - vec2(0.7 - mouseInfluence.x * 0.3, 0.7 - mouseInfluence.y * 0.2));
    float violetBlob = smoothstep(0.55, 0.0, violetDist) * 0.14;
    vec3 violetColor = vec3(0.42, 0.36, 0.94); // #6B5BEF

    // Deep blue distant blob
    float blueDist = length(uv - vec2(0.15 + mouseInfluence.x * 0.15, 0.6));
    float blueBlob = smoothstep(0.5, 0.0, blueDist) * 0.1;
    vec3 blueColor = vec3(0.06, 0.22, 0.58);

    // Animated FBM noise for organic movement
    float t = uTime * 0.08;
    float noiseVal = fbm(uv * 2.5 + vec2(t, t * 0.7));
    goldBlob *= (0.7 + 0.3 * noiseVal);
    violetBlob *= (0.6 + 0.4 * fbm(uv * 2.0 - vec2(t * 0.5, t)));

    // Compose
    vec3 color = baseColor;
    color = mix(color, color + goldColor, goldBlob);
    color = mix(color, color + violetColor, violetBlob);
    color = mix(color, color + blueColor, blueBlob);

    // Film grain
    float grain = hash(uv * uResolution * 0.5 + uTime * 100.0) * 0.04 - 0.02;
    color += grain;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function WebGLBackground() {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
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
    window.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    let frameId: number;
    let startTime = Date.now();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      uniforms.uTime.value = (Date.now() - startTime) / 1000;

      // Lerp mouse for inertia
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.04;
      uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
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
