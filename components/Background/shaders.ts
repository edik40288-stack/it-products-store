export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // Simplex 2D noise
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
    
    // Normalize coordinates based on aspect ratio
    vec2 st = uv;
    st.x *= uResolution.x / uResolution.y;

    // Mouse influence
    // uMouse is -1 to 1. Map to 0 to 1
    vec2 mouse = (uMouse * 0.5) + 0.5;
    mouse.x *= uResolution.x / uResolution.y;

    // Base color: #090A0F -> rgb(9, 10, 15) -> vec3(0.035, 0.039, 0.059)
    vec3 baseColor = vec3(0.035, 0.039, 0.059);
    
    // Accent color: Deep indigo #121B2A -> rgb(18, 27, 42) -> vec3(0.070, 0.105, 0.164)
    vec3 accentColor = vec3(0.070, 0.105, 0.164);
    
    // Transition to graphite for the noise edge
    vec3 graphiteColor = vec3(0.1, 0.1, 0.12);

    // Dynamic animated noise
    float t = uTime * 0.1;
    float noiseValue = snoise(st * 2.0 + vec2(t, t*0.5)) * 0.5 + 0.5;
    noiseValue += snoise(st * 4.0 - vec2(t*1.2, t*0.8)) * 0.25;

    // Spot light from mouse
    float distToMouse = length(st - mouse);
    // Smooth falloff
    float spotLight = smoothstep(1.2, 0.0, distToMouse);

    // Combine noise and spot light
    float intensity = spotLight * (0.4 + 0.6 * noiseValue);

    // Color mixing
    vec3 finalColor = mix(baseColor, accentColor, intensity);
    // Add graphite transition on high noise values
    finalColor = mix(finalColor, graphiteColor, smoothstep(0.7, 1.0, intensity) * 0.5);

    // Subtle grain
    float grain = fract(sin(dot(uv, vec2(12.9898, 78.233) + uTime)) * 43758.5453) * 0.02 - 0.01;

    gl_FragColor = vec4(finalColor + grain, 1.0);
  }
`;
