import * as THREE from 'three';

export const vertexShader = `
uniform float u_time;
uniform vec2 u_mouse;       // 0..1 normalized mouse position within card
uniform float u_hoverState;  // 0..1 eased hover
uniform vec2 u_cardSize;     // card dimensions in pixels

varying vec2 vUv;
varying float vDistortion;
varying vec2 vLocalMouse;

void main() {
  vUv = uv;
  vec3 pos = position;

  // Local mouse in coordinates (-0.5 to 0.5)
  vec2 localMouse = vec2(u_mouse.x - 0.5, (1.0 - u_mouse.y) - 0.5);
  vLocalMouse = localMouse;

  // Distance from vertex to mouse
  float dist = distance(pos.xy, localMouse);

  // Smooth bell-curve influence across vertices for visible elastic flex
  float influence = smoothstep(0.85, 0.0, dist) * u_hoverState;

  // Noticeable 3D depth dome toward viewer
  pos.z += influence * 25.0;

  // Elastic magnetic pull toward cursor - card smoothly flexes towards mouse
  vec2 toMouse = localMouse - pos.xy;
  pos.xy += toMouse * (influence * 0.18);

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
varying vec2 vLocalMouse;

// Pixel-space rounded rectangle SDF
float sdRoundRect(vec2 p, vec2 b, float r) {
  vec2 d = abs(p - b * 0.5) - b * 0.5 + vec2(r);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
}

void main() {
  vec2 uv = vUv;

  // Localized smooth hover aura
  vec2 mouseNorm = vec2(u_mouse.x, 1.0 - u_mouse.y);
  float mouseDist = distance(uv, mouseNorm);
  float spotGlow = exp(-mouseDist * mouseDist * 5.0) * u_hoverState;

  // Base glass color with ambient fluid motion
  float wave = sin(uv.x * 3.0 + u_time * 0.5) * cos(uv.y * 3.0 + u_time * 0.4) * 0.5 + 0.5;
  vec3 gradientCol = mix(u_color1, u_color2, wave * 0.7 + uv.y * 0.3);

  // Dark obsidian base with preserved contrast
  vec3 baseGlass = vec3(0.045, 0.05, 0.08);
  vec3 rgb = mix(baseGlass, gradientCol, 0.1 + spotGlow * 0.25);

  // Smooth specular highlight under cursor (electric, non-blinding)
  rgb += mix(u_color1, vec3(0.7, 0.85, 1.0), 0.3) * (spotGlow * 0.28);

  // Alpha
  float alpha = 0.7 + spotGlow * 0.2;

  // Pixel-perfect rounded rect mask
  vec2 px = vUv * u_cardSize;
  float d = sdRoundRect(px, u_cardSize, 20.0);
  float mask = 1.0 - smoothstep(-0.5, 0.5, d);

  // 1px luxury neon border with glowing highlight near cursor
  float border = mask * (1.0 - smoothstep(-1.5, -0.5, d));
  float borderGlow = exp(-mouseDist * mouseDist * 3.0) * u_hoverState;
  vec3 borderCol = mix(vec3(0.25, 0.3, 0.45), mix(u_color1, u_color2, uv.x), 0.5 + borderGlow * 0.5);
  borderCol += vec3(0.9) * (borderGlow * 0.6);

  rgb = mix(rgb, borderCol, border);
  alpha = max(alpha, border * (0.5 + borderGlow * 0.5));

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

