/* Scrolling code lines visual */
'use client';
import styles from '../CardVisual.module.css';

const CODE_LINES = [
  'const agent = new AIAgent({ model: "gpt-4o" })',
  'await agent.qualifyLead(userInput)',
  'function buildProduct(spec: ProjectSpec) {',
  '  const stack = ["Next.js", "Node", "AWS"]',
  '  return deploy(stack, spec)',
  '}',
  'const webhook = createWebhook("/api/lead")',
  'router.post("/chat", streamResponse)',
  'export default async function handler(req) {',
  '  const { messages } = await req.json()',
  '  return llm.complete(messages)',
  '}',
  'const db = new PrismaClient()',
  'await db.lead.create({ data: qualified })',
];

export default function CodeVisual({ hovered }: { hovered: boolean }) {
  return (
    <div className={`${styles.codeWrap} ${hovered ? styles.codeHovered : ''}`}>
      <div className={styles.codeScroller}>
        {[...CODE_LINES, ...CODE_LINES].map((line, i) => (
          <div key={i} className={styles.codeLine}>
            <span className={styles.lineNum}>{(i % CODE_LINES.length) + 1}</span>
            <span className={styles.lineCode}>{line}</span>
          </div>
        ))}
      </div>
      {/* Architecture lines */}
      <svg className={styles.archLines} viewBox="0 0 200 120" fill="none">
        <circle cx="100" cy="60" r="8" stroke="rgba(201,168,76,0.5)" strokeWidth="1" className={hovered ? styles.archPulse : ''} />
        <line x1="100" y1="52" x2="50" y2="20" stroke="rgba(201,168,76,0.2)" strokeWidth="1" />
        <line x1="100" y1="52" x2="150" y2="20" stroke="rgba(201,168,76,0.2)" strokeWidth="1" />
        <line x1="100" y1="68" x2="60" y2="100" stroke="rgba(201,168,76,0.2)" strokeWidth="1" />
        <line x1="100" y1="68" x2="140" y2="100" stroke="rgba(201,168,76,0.2)" strokeWidth="1" />
        <circle cx="50" cy="20" r="4" stroke="rgba(107,91,239,0.6)" strokeWidth="1" fill="rgba(107,91,239,0.1)" />
        <circle cx="150" cy="20" r="4" stroke="rgba(107,91,239,0.6)" strokeWidth="1" fill="rgba(107,91,239,0.1)" />
        <circle cx="60" cy="100" r="4" stroke="rgba(107,91,239,0.6)" strokeWidth="1" fill="rgba(107,91,239,0.1)" />
        <circle cx="140" cy="100" r="4" stroke="rgba(107,91,239,0.6)" strokeWidth="1" fill="rgba(107,91,239,0.1)" />
      </svg>
    </div>
  );
}
