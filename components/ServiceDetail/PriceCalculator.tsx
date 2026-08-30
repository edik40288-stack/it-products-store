'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './PriceCalculator.module.css';

const PRICE_CONFIGS: Record<string, {
  base: number;
  options: { key: string; value: number }[];
}> = {
  development: {
    base: 5000,
    options: [
      { key: 'landingPage', value: 0 },
      { key: 'webApp', value: 8000 },
      { key: 'mobileApp', value: 12000 },
      { key: 'enterprise', value: 30000 },
    ],
  },
  'ai-agents': {
    base: 2000,
    options: [
      { key: 'simpleFaq', value: 0 },
      { key: 'leadQualifier', value: 1500 },
      { key: 'fullNegotiator', value: 4000 },
      { key: 'llmPipeline', value: 8000 },
    ],
  },
  crm: {
    base: 8000,
    options: [
      { key: 'basicCrm', value: 0 },
      { key: 'crmAuto', value: 5000 },
      { key: 'fullErp', value: 20000 },
    ],
  },
  default: {
    base: 1500,
    options: [
      { key: 'basic', value: 0 },
      { key: 'standard', value: 2000 },
      { key: 'premium', value: 5000 },
    ],
  },
};

interface PriceCalculatorProps {
  serviceId: string;
}

export default function PriceCalculator({ serviceId }: PriceCalculatorProps) {
  const t = useTranslations('priceCalculator');
  const config = PRICE_CONFIGS[serviceId] ?? PRICE_CONFIGS.default;
  const [selectedOption, setSelectedOption] = useState(0);
  const [withSupport, setWithSupport] = useState(false);

  const base = config.base + config.options[selectedOption].value;
  const total = withSupport ? base + Math.round(base * 0.15) : base;
  const rangeMin = Math.round(total * 0.9);
  const rangeMax = Math.round(total * 1.35);

  return (
    <div className={styles.calculator}>
      <h3 className={styles.calcTitle}>{t('title')}</h3>

      <div className={styles.optionGroup}>
        <label className={styles.optionLabel}>{t('projectScope')}</label>
        <div className={styles.options}>
          {config.options.map((opt, i) => (
            <button
              key={opt.key}
              className={`${styles.option} ${selectedOption === i ? styles.optionActive : ''}`}
              onClick={() => setSelectedOption(i)}
            >
              {t(`options.${opt.key}`)}
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
          <span>{t('includeSupport')}</span>
        </label>
      </div>

      <div className={styles.result}>
        <div className={styles.resultLabel}>{t('estimatedRange')}</div>
        <div className={styles.resultPrice}>
          ${rangeMin.toLocaleString()} — ${rangeMax.toLocaleString()}
        </div>
        <p className={styles.resultNote}>
          {t('note')}
        </p>
      </div>
    </div>
  );
}
