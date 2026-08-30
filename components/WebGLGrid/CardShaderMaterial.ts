import * as THREE from 'three';

export const vertexShader = `
uniform float u_time;
uniform vec2 u_mouse;      // 0..1 normalized mouse position within card
uniform float u_hoverState; // 0..1 eased hover
uniform vec2 u_cardSize;    // card dimensions in pixels

varying vec2 vUv;
varying float vDistortion;

void main() {
  vUv = uv;
  vec3 pos = position;

  // Mouse in local geometry space (-0.5 to 0.5)
  vec2 localMouse = vec2(u_mouse.x - 0.5, u_mouse.y - 0.5);

  // Distance from this vertex to the mouse
  float dist = distance(pos.xy, localMouse);

  // Smooth falloff — affects vertices within radius 0.6
  float influence = smoothstep(0.6, 0.0, dist) * u_hoverState;

  // --- SUBTLE organic ripple along edges ---
  // Gentle sine wave that propagates outward from cursor
  float ripple = sin(dist * 18.0 - u_time * 3.0) * 0.008 * influence;

  // --- Pull vertices gently toward cursor ---
  // Very subtle: max ~3% displacement so shape stays recognizable
  vec2 toMouse = localMouse - pos.xy;
  float pullStrength = 0.03 * influence;

  pos.xy += toMouse * pullStrength;

  // Add the ripple as Z-depth (subtle 3D bulge)
  pos.z += influence * 0.02 + ripple;

  // Also add tiny ripple to X/Y for organic border wobble
  vec2 perpendicular = vec2(-toMouse.y, toMouse.x);
  if (length(perpendicular) > 0.001) {
    perpendicular = normalize(perpendicular);
  }
  pos.xy += perpendicular * ripple * 2.0;

  vDistortion = influence;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const fragmentShader = `
uniform float u_time;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform float u_hoverState;
uniform vec2 u_mouse;
uniform vec2 u_cardSize;

varying vec2 vUv;
varying float vDistortion;

// Simplex noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Pixel-space rounded rectangle SDF
float sdRoundRect(vec2 p, vec2 b, float r) {
  vec2 d = abs(p - b * 0.5) - b * 0.5 + vec2(r);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
}

void main() {
  vec2 uv = vUv;

  // Noise for organic color movement
  float n1 = snoise(uv * 2.5 + u_time * 0.15);
  float n2 = snoise(uv * 3.5 - u_time * 0.12);

  // Animated color blobs
  vec2 b1 = vec2(0.3 + sin(u_time * 0.4)*0.2, 0.3 + cos(u_time * 0.3)*0.2);
  vec2 b2 = vec2(0.7 + cos(u_time * 0.5)*0.2, 0.7 + sin(u_time * 0.6)*0.2);
  float blob1 = smoothstep(0.55, 0.0, distance(uv, b1));
  float blob2 = smoothstep(0.65, 0.0, distance(uv, b2));

  // Base glass color — subtle tint, not opaque
  vec3 baseRgb = vec3(0.08, 0.08, 0.12);
  vec3 colorMix = mix(u_color1, u_color2, (n1 + 1.0) * 0.5);
  vec3 rgb = baseRgb + colorMix * (blob1 * 0.35 + blob2 * 0.35 + n2 * 0.05);

  // Hover glow from distortion
  float glow = vDistortion * 0.9;
  rgb += vec3(0.5, 0.7, 1.0) * glow;

  // Alpha
  float alpha = 0.65 + blob1 * 0.1 + blob2 * 0.1 + glow * 0.25;

  // Pixel-perfect rounded rect mask
  vec2 px = vUv * u_cardSize;
  float d = sdRoundRect(px, u_cardSize, 20.0);
  float mask = 1.0 - smoothstep(-0.5, 0.5, d);

  // 1px inner border
  float border = mask * (1.0 - smoothstep(-1.5, -0.5, d));
  vec3 borderCol = mix(vec3(1.0), u_color1, 0.3) * (0.2 + glow * 0.8);
  rgb = mix(rgb, borderCol, border);
  alpha = max(alpha, border * 0.6);

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
      u_cardSize: { value: new THREE.Vector2(400, 300) },
      u_color1: { value: new THREE.Color('#3b82f6') },
      u_color2: { value: new THREE.Color('#8b5cf6') },
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}
