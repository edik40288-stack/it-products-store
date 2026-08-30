'use client';
import styles from '../CardVisual.module.css';

const APIS = [
  { label: 'OpenAI', angle: 0 },
  { label: 'Claude', angle: 60 },
  { label: 'Gemini', angle: 120 },
  { label: 'Llama', angle: 180 },
  { label: 'Mistral', angle: 240 },
  { label: 'Cohere', angle: 300 },
];

export default function LLMVisual({ hovered }: { hovered: boolean }) {
  const radius = 75;
  const cx = 110, cy = 90;

  return (
    <svg className={styles.llmSvg} viewBox="0 0 220 180" fill="none">
      {/* Orbiting particles */}
      {hovered && APIS.map((_, i) => (
        <circle key={`p${i}`} cx={cx} cy={cy} r={3}
          fill="rgba(201,168,76,0.9)"
          className={styles.orbitParticle}
          style={{ '--orbit-angle': `${i * 60}deg`, '--orbit-delay': `${i * 0.2}s`, '--orbit-r': `${radius}px` } as React.CSSProperties}
        />
      ))}

      {/* Connection rays */}
      {APIS.map((api, i) => {
        const rad = (api.angle * Math.PI) / 180;
        const x2 = cx + Math.cos(rad) * radius;
        const y2 = cy + Math.sin(rad) * radius;
        return (
          <line key={`l${i}`} x1={cx} y1={cy} x2={x2} y2={y2}
            stroke={hovered ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.15)'}
            strokeWidth="1"
            strokeDasharray="3 4"
            className={hovered ? styles.rayAnimated : ''}
            style={{ '--ray-delay': `${i * 0.08}s` } as React.CSSProperties}
          />
        );
      })}

      {/* API nodes */}
      {APIS.map((api, i) => {
        const rad = (api.angle * Math.PI) / 180;
        const x = cx + Math.cos(rad) * radius;
        const y = cy + Math.sin(rad) * radius;
        return (
          <g key={api.label}>
            <circle cx={x} cy={y} r={14} stroke="rgba(107,91,239,0.6)" strokeWidth="1"
              fill="rgba(107,91,239,0.08)" />
            <text x={x} y={y + 4} textAnchor="middle" fontSize="6" fill="rgba(240,240,240,0.7)"
              fontFamily="monospace">{api.label}</text>
          </g>
        );
      })}

      {/* Core */}
      <circle cx={cx} cy={cy} r={22} stroke="rgba(201,168,76,0.7)" strokeWidth="1.5"
        fill="rgba(201,168,76,0.08)" className={hovered ? styles.corePulseAnim : ''} />
      <circle cx={cx} cy={cy} r={12} fill="rgba(201,168,76,0.15)" stroke="rgba(201,168,76,0.5)" strokeWidth="1" />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="8" fill="#C9A84C" fontWeight="bold">LLM</text>
    </svg>
  );
}
