'use client';
import { useEffect, useRef, useState } from 'react';
import styles from '../CardVisual.module.css';

export default function SplitVisual({ hovered }: { hovered: boolean }) {
  const [sliderPos, setSliderPos] = useState(50);
  const dirRef = useRef(1);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!hovered) { setSliderPos(50); return; }
    const animate = () => {
      setSliderPos(prev => {
        const next = prev + dirRef.current * 0.5;
        if (next >= 80) dirRef.current = -1;
        if (next <= 20) dirRef.current = 1;
        return next;
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [hovered]);

  return (
    <div className={styles.splitWrap}>
      {/* Before side */}
      <div className={styles.splitSide} style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
        <div className={styles.splitBefore}>
          {/* Old ugly UI */}
          <div className={styles.oldNav} />
          <div className={styles.oldContent}>
            <div className={styles.oldBlock} style={{ width: '80%', height: '12px' }} />
            <div className={styles.oldBlock} style={{ width: '60%', height: '8px' }} />
            <div className={styles.oldButton} />
          </div>
          <span className={styles.splitLabel}>BEFORE</span>
        </div>
      </div>

      {/* After side */}
      <div className={styles.splitSide} style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}>
        <div className={styles.splitAfter}>
          <div className={styles.newNav}>
            <span className={styles.newLogo} />
            <div className={styles.newNavLinks}>
              {[1,2,3].map(i => <span key={i} className={styles.newNavLink} />)}
            </div>
          </div>
          <div className={styles.newContent}>
            <div className={styles.newHeading} />
            <div className={styles.newSubheading} />
            <div className={styles.newCta} />
          </div>
          <span className={styles.splitLabel} style={{ color: '#C9A84C' }}>AFTER</span>
        </div>
      </div>

      {/* Slider handle */}
      <div className={styles.sliderHandle} style={{ left: `${sliderPos}%` }}>
        <div className={styles.sliderLine} />
        <div className={styles.sliderKnob}>⟺</div>
      </div>
    </div>
  );
}
