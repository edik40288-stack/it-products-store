import * as THREE from 'three';

export const vertexShader = `
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_hoverState;
uniform vec2 u_resolution;
uniform float u_scrollVelocity;

varying vec2 vUv;
varying float vDistortion;

void main() {
  vUv = uv;
  vec3 pos = position;

  // Convert position to NDC space relative to the center
  // PlaneGeometry is 1x1, centered at 0,0. Coordinates are -0.5 to 0.5.
  vec2 planeCenter = vec2(0.0);
  
  // Mouse is normalized 0 to 1 inside the bounding box (0 is top, 1 is bottom).
  // PlaneGeometry Y goes from 0.5 (top) to -0.5 (bottom) normally, BUT with our flipped 
  // OrthographicCamera (top=0, bottom=height), the plane Y actually goes from -0.5 (top) to 0.5 (bottom).
  vec2 localMouse = vec2(u_mouse.x - 0.5, u_mouse.y - 0.5);

  // Distance from vertex to mouse
  float dist = distance(pos.xy, localMouse);

  // Elastic/Spring physics calculation
  // We use a non-linear sinusoidal decay formula combined with smoothstep
  float radius = 0.8;
  float intensity = smoothstep(radius, 0.0, dist) * u_hoverState;
  
  // Sine wave ripple for organic glass effect
  float ripple = sin((dist - u_time * 0.5) * 10.0) * 0.05 * intensity;

  // Deformation
  // 1. Z-axis push/pull (bulge)
  pos.z += (intensity * 0.15) + ripple;
  
  // 2. X/Y-axis pull (rubber tension pulling vertices towards the mouse)
  vec2 dir = normalize(pos.xy - localMouse);
  // Prevent division by zero
  if (dist > 0.001) {
    pos.xy -= dir * (intensity * 0.15);
  }

  // Add scroll velocity skew for organic scrolling
  pos.y += pos.x * u_scrollVelocity * 0.02;

  vDistortion = intensity;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const fragmentShader = `
uniform float u_time;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform float u_hoverState;

varying vec2 vUv;
varying float vDistortion;

// Helper to calculate smooth blob
float blob(vec2 uv, vec2 center, float radius) {
  float d = distance(uv, center);
  return smoothstep(radius, 0.0, d);
}

  // Helper for rounded rectangle distance field
  float sdRoundRect(vec2 p, vec2 b, float r) {
    vec2 d = abs(p - 0.5) * 2.0 - b + vec2(r);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
  }

void main() {
  // Base glassmorphism dark color (rgba(255,255,255,0.03))
  vec4 baseColor = vec4(1.0, 1.0, 1.0, 0.03);
  
  // Animated blob 1
  vec2 b1Center = vec2(
    0.3 + sin(u_time * 0.4) * 0.2,
    0.3 + cos(u_time * 0.3) * 0.2
  );
  float b1 = blob(vUv, b1Center, 0.6);
  
  // Animated blob 2
  vec2 b2Center = vec2(
    0.7 + cos(u_time * 0.5) * 0.2,
    0.7 + sin(u_time * 0.6) * 0.2
  );
  float b2 = blob(vUv, b2Center, 0.7);

  // Blend blobs with higher intensity
  vec3 rgb = baseColor.rgb + (u_color1 * b1 * 0.8) + (u_color2 * b2 * 0.8);
  
  // Increase opacity significantly where blobs are
  float alpha = baseColor.a + (b1 * 0.6) + (b2 * 0.6);

  // Apply hover highlight and glass reflection on distortion
  float highlight = vDistortion * 0.8;
  rgb += vec3(0.6, 0.8, 1.0) * highlight;
  alpha += highlight * 0.5;

  // Ensure alpha doesn't exceed 1.0
  alpha = min(alpha, 1.0);

  // Rounded rectangle mask (dist is negative inside, positive outside)
  // b is the box size (0.98 to leave room for border)
  float distBox = sdRoundRect(vUv, vec2(0.98), 0.05);
  
  // Anti-aliased mask for the shape
  float mask = 1.0 - smoothstep(0.0, 0.01, distBox);
  
  // Border (glows on hover or distortion)
  float border = 1.0 - smoothstep(-0.01, 0.0, distBox); // Inner mask
  float borderIntensity = mask * (1.0 - smoothstep(-0.02, -0.01, distBox)); // 1-2px border width
  
  // Base border color is faint white, gets brighter on hover/distortion
  vec3 borderColor = vec3(1.0) * (0.08 + highlight * 0.5);
  rgb = mix(rgb, borderColor, borderIntensity * mask);
  alpha = max(alpha, borderIntensity * 0.5); // Ensure border is visible

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
      u_scrollVelocity: { value: 0 },
    },
    transparent: true,
    depthWrite: false, // Prevent z-fighting if multiple cards overlap slightly
    side: THREE.DoubleSide, // FIX: Orthographic camera flips Y, which flips winding order!
  });
}
