import * as THREE from 'three';

export const vertexShader = `
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_hoverState;
uniform vec2 u_resolution;

varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;
  // NO vertex distortion! The mesh stays a perfect rectangle matching the DOM exactly.
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const fragmentShader = `
uniform float u_time;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform float u_hoverState;
uniform vec2 u_mouse;

varying vec2 vUv;

// Helper for rounded rectangle distance field
float sdRoundRect(vec2 p, vec2 b, float r) {
  vec2 d = abs(p - 0.5) * 2.0 - b + vec2(r);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
}

// Simplex noise function for organic liquid feel
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = vUv;
  
  // u_mouse is 0 to 1 top-left to bottom-right.
  vec2 mousePos = u_mouse;
  
  // Distance from current pixel to mouse
  float dist = distance(uv, mousePos);
  
  // ─── LIQUID LENS DISTORTION ───
  // We warp the UV coordinates slightly around the mouse, scaling with hover state
  float lensRadius = 0.45;
  float lensStrength = 0.12 * u_hoverState;
  
  // Smoothly attenuate the distortion based on distance
  float distortionFactor = smoothstep(lensRadius, 0.0, dist);
  
  // Displace the UVs away from the mouse to create a magnifying liquid bubble effect
  vec2 dir = normalize(uv - mousePos);
  // Prevent zero division
  if (dist < 0.001) dir = vec2(0.0);
  
  vec2 distortedUv = uv - dir * (distortionFactor * lensStrength) * sin(dist * 15.0 - u_time * 2.0);

  // ─── PROCEDURAL LIQUID BACKGROUND ───
  // Add some slow moving noise to the background
  float noiseVal = snoise(distortedUv * 2.0 + u_time * 0.2);
  float noiseVal2 = snoise(distortedUv * 3.0 - u_time * 0.15);
  
  // Base glassmorphism dark color
  vec4 baseColor = vec4(0.05, 0.05, 0.07, 0.85); // Very dark, highly opaque base
  
  // Animated color blobs moving organically
  vec2 b1Center = vec2(0.3 + sin(u_time * 0.4)*0.2, 0.3 + cos(u_time * 0.3)*0.2);
  vec2 b2Center = vec2(0.7 + cos(u_time * 0.5)*0.2, 0.7 + sin(u_time * 0.6)*0.2);
  
  float b1 = smoothstep(0.6, 0.0, distance(distortedUv, b1Center));
  float b2 = smoothstep(0.7, 0.0, distance(distortedUv, b2Center));
  
  // Mix colors based on blobs and noise
  vec3 colorMix = mix(u_color1, u_color2, (noiseVal + 1.0) * 0.5);
  vec3 rgb = baseColor.rgb + (colorMix * (b1 * 0.5 + b2 * 0.5 + noiseVal2 * 0.1));
  
  // Mouse hover highlight (glow)
  float glow = smoothstep(0.5, 0.0, dist) * u_hoverState * 0.8;
  rgb += vec3(0.7, 0.85, 1.0) * glow;
  
  // ─── ALPHA & MASKING ───
  // Base alpha is quite high, increases with hover/glow
  float alpha = baseColor.a + (glow * 0.3);
  
  // Crisp Rounded Rectangle Mask
  // DistBox: negative inside, positive outside
  float distBox = sdRoundRect(vUv, vec2(0.98), 0.05);
  
  // Anti-aliased mask for the shape
  float mask = 1.0 - smoothstep(0.0, 0.005, distBox);
  
  // Sharp inner border
  float borderIntensity = mask * (1.0 - smoothstep(-0.015, -0.005, distBox)); 
  
  // Base border color is faint white, gets brighter on hover/glow
  vec3 borderColor = mix(vec3(1.0), u_color1, 0.5) * (0.15 + glow * 0.8);
  rgb = mix(rgb, borderColor, borderIntensity);
  alpha = max(alpha, borderIntensity); 

  gl_FragColor = vec4(rgb, alpha * mask);
}
`;

export function createCardShaderMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      u_time: { value: 0 },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_hoverState: { value: 0 },
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_color1: { value: new THREE.Color('#3b82f6') },
      u_color2: { value: new THREE.Color('#8b5cf6') },
    },
    transparent: true,
    depthWrite: false, 
    side: THREE.DoubleSide,
  });
}

