'use client';

import { useState } from 'react';
import styles from './PriceCalculator.module.css';

const PRICE_CONFIGS: Record<string, {
  base: number;
  options: { label: string; value: number }[];
}> = {
  development: {
    base: 5000,
    options: [
      { label: 'Landing page', value: 0 },
      { label: 'Web application', value: 8000 },
      { label: 'Mobile app', value: 12000 },
      { label: 'Enterprise platform', value: 30000 },
    ],
  },
  'ai-agents': {
    base: 2000,
    options: [
      { label: 'Simple FAQ bot', value: 0 },
      { label: 'Lead qualifier', value: 1500 },
      { label: 'Full AI negotiator', value: 4000 },
      { label: 'Custom LLM pipeline', value: 8000 },
    ],
  },
  crm: {
    base: 8000,
    options: [
      { label: 'Basic CRM', value: 0 },
      { label: 'CRM + automation', value: 5000 },
      { label: 'Full ERP', value: 20000 },
    ],
  },
  default: {
    base: 1500,
    options: [
      { label: 'Basic', value: 0 },
      { label: 'Standard', value: 2000 },
      { label: 'Premium', value: 5000 },
    ],
  },
};

interface PriceCalculatorProps {
  serviceId: string;
}

export default function PriceCalculator({ serviceId }: PriceCalculatorProps) {
  const config = PRICE_CONFIGS[serviceId] ?? PRICE_CONFIGS.default;
  const [selectedOption, setSelectedOption] = useState(0);
  const [withSupport, setWithSupport] = useState(false);

  const base = config.base + config.options[selectedOption].value;
  const total = withSupport ? base + Math.round(base * 0.15) : base;
  const rangeMin = Math.round(total * 0.9);
  const rangeMax = Math.round(total * 1.35);

  return (
    <div className={styles.calculator}>
      <h3 className={styles.calcTitle}>💰 Estimate your budget</h3>

      <div className={styles.optionGroup}>
        <label className={styles.optionLabel}>Project scope</label>
        <div className={styles.options}>
          {config.options.map((opt, i) => (
            <button
              key={opt.label}
              className={`${styles.option} ${selectedOption === i ? styles.optionActive : ''}`}
              onClick={() => setSelectedOption(i)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.checkWrap}>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={withSupport}
            onChange={(e) => setWithSupport(e.target.checked)}
          />
          <span>Include ongoing support (+15%)</span>
        </label>
      </div>

      <div className={styles.result}>
        <div className={styles.resultLabel}>Estimated range</div>
        <div className={styles.resultPrice}>
          ${rangeMin.toLocaleString()} — ${rangeMax.toLocaleString()}
        </div>
        <p className={styles.resultNote}>
          Final pricing depends on exact scope. Get a free detailed estimate via our AI consultant.
        </p>
      </div>
    </div>
  );
}
