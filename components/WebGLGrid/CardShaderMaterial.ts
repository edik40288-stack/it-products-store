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

  // Smooth Gaussian bell-curve influence for natural flexible elasticity
  float influence = exp(-dist * dist * 3.0) * u_hoverState;

  // Smooth 3D depth dome toward viewer (gentle flex)
  pos.z += influence * 12.0;

  // Soft magnetic flex toward cursor without edge wobble
  vec2 toMouse = localMouse - pos.xy;
  pos.xy += toMouse * (influence * 0.04);

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

  // Fluid smooth gradient mesh
  vec2 mouseNorm = vec2(u_mouse.x, 1.0 - u_mouse.y);
  float mouseDist = distance(uv, mouseNorm);
  float spotGlow = exp(-mouseDist * mouseDist * 4.5) * u_hoverState;

  // Ambient fluid color motion
  float wave = sin(uv.x * 2.5 + u_time * 0.4) * cos(uv.y * 2.5 + u_time * 0.3) * 0.5 + 0.5;
  vec3 gradientCol = mix(u_color1, u_color2, wave * 0.7 + uv.y * 0.3);

  // Deep dark glass base
  vec3 baseGlass = vec3(0.06, 0.06, 0.09);
  vec3 rgb = mix(baseGlass, gradientCol, 0.15 + spotGlow * 0.35);

  // Specular spot under cursor
  rgb += mix(u_color1, vec3(1.0), 0.6) * spotGlow * 0.45;

  // Alpha
  float alpha = 0.55 + spotGlow * 0.3;

  // Pixel-perfect rounded rect mask
  vec2 px = vUv * u_cardSize;
  float d = sdRoundRect(px, u_cardSize, 20.0);
  float mask = 1.0 - smoothstep(-0.5, 0.5, d);

  // 1px luxury neon border with cursor spotlight
  float border = mask * (1.0 - smoothstep(-1.5, -0.5, d));
  float borderGlow = exp(-mouseDist * mouseDist * 3.0) * u_hoverState;
  vec3 borderCol = mix(vec3(0.3, 0.3, 0.4), mix(u_color1, u_color2, uv.x), 0.5 + borderGlow * 0.5);
  borderCol += vec3(1.0) * borderGlow * 0.7;

  rgb = mix(rgb, borderCol, border);
  alpha = max(alpha, border * (0.4 + borderGlow * 0.6));

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

