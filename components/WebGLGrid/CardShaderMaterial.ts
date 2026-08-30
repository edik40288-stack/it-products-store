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
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const fragmentShader = `
uniform float u_time;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform float u_hoverState;
uniform vec2 u_mouse;
uniform vec2 u_cardSize; // Dimensions of the card in pixels

varying vec2 vUv;

// Distance field for rounded rectangle in pixels
float sdRoundRect(vec2 p, vec2 b, float r) {
  vec2 d = abs(p - b * 0.5) - b * 0.5 + vec2(r);
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
  vec2 mousePos = u_mouse;
  
  // ─── LIQUID LENS DISTORTION ───
  // Distance from current pixel to mouse, scaled by aspect ratio for circular lens
  vec2 aspect = vec2(u_cardSize.x / u_cardSize.y, 1.0);
  float dist = distance(uv * aspect, mousePos * aspect);
  
  float lensRadius = 0.5;
  float lensStrength = 0.15 * u_hoverState;
  
  float distortionFactor = smoothstep(lensRadius, 0.0, dist);
  vec2 dir = normalize((uv * aspect) - (mousePos * aspect));
  if (dist < 0.001) dir = vec2(0.0);
  
  vec2 distortedUv = uv - dir * (distortionFactor * lensStrength) * sin(dist * 12.0 - u_time * 3.0);

  // ─── PROCEDURAL LIQUID BACKGROUND ───
  float noiseVal = snoise(distortedUv * 2.0 + u_time * 0.2);
  float noiseVal2 = snoise(distortedUv * 3.0 - u_time * 0.15);
  
  // Bright, visible glassmorphism base
  vec4 baseColor = vec4(1.0, 1.0, 1.0, 0.03); 
  
  vec2 b1Center = vec2(0.3 + sin(u_time * 0.4)*0.2, 0.3 + cos(u_time * 0.3)*0.2);
  vec2 b2Center = vec2(0.7 + cos(u_time * 0.5)*0.2, 0.7 + sin(u_time * 0.6)*0.2);
  
  float b1 = smoothstep(0.6, 0.0, distance(distortedUv, b1Center));
  float b2 = smoothstep(0.7, 0.0, distance(distortedUv, b2Center));
  
  vec3 colorMix = mix(u_color1, u_color2, (noiseVal + 1.0) * 0.5);
  vec3 rgb = baseColor.rgb + (colorMix * (b1 * 0.8 + b2 * 0.8 + noiseVal2 * 0.1));
  
  // Base alpha is distinctly visible
  float alpha = 0.06 + (b1 * 0.15) + (b2 * 0.15);
  
  // Mouse hover glow
  float glow = smoothstep(0.6, 0.0, dist) * u_hoverState;
  rgb += vec3(0.7, 0.85, 1.0) * glow * 0.8;
  alpha += glow * 0.3;
  
  // ─── CRISP PIXEL-PERFECT BORDERS ───
  // Calculate distance in pixels
  vec2 pixelPos = vUv * u_cardSize;
  float cornerRadius = 20.0; // matches CSS border-radius
  
  // distBox is negative inside the card, 0 at the edge, positive outside
  float distBox = sdRoundRect(pixelPos, u_cardSize, cornerRadius);
  
  // Crisp anti-aliased mask (1px fade)
  float mask = 1.0 - smoothstep(-0.5, 0.5, distBox);
  
  // Sharp inner border (1px wide)
  float borderIntensity = mask * (1.0 - smoothstep(-1.5, -0.5, distBox));
  
  // Distinct border color
  vec3 borderColor = mix(vec3(1.0), u_color1, 0.3) * (0.15 + glow * 0.6);
  rgb = mix(rgb, borderColor, borderIntensity);
  alpha = max(alpha, borderIntensity * 0.5); 

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
      u_cardSize: { value: new THREE.Vector2(400, 300) },
      u_color1: { value: new THREE.Color('#3b82f6') },
      u_color2: { value: new THREE.Color('#8b5cf6') },
    },
    transparent: true,
    depthWrite: false, 
    side: THREE.DoubleSide,
  });
}

