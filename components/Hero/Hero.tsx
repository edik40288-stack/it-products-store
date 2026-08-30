'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import styles from './Hero.module.css';
import CyberSphere from './CyberSphere';

// Topics structure will be generated inside the component to use translations
const TOPIC_COLORS = ['#C9A84C', '#00F0FF', '#B534FF'];

  const t = useTranslations('hero');
  const TOPICS = [
    { text: t('topic0'), color: TOPIC_COLORS[0] },
    { text: t('topic1'), color: TOPIC_COLORS[1] },
    { text: t('topic2'), color: TOPIC_COLORS[2] }
  ];
  
  const [topicIndex, setTopicIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Act 1: Initial load timing
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasStarted(true);
    }, 1500); // 1.5s delay before text appears, while sphere forms
    return () => clearTimeout(timer);
  }, []);

  // Act 2: Typewriter Effect
  useEffect(() => {
    if (!hasStarted || isInputFocused || isScanning) return; // Pause typing if focused/scanning

    const currentTopic = TOPICS[topicIndex].text;
    const typingSpeed = isDeleting ? 40 : 100;
    const pauseTime = 2500;

    const timeout = setTimeout(() => {
      if (!isDeleting && typedText === currentTopic) {
        // Pause at full word before deleting
        setTimeout(() => setIsDeleting(true), pauseTime);
      } else if (isDeleting && typedText === '') {
        // Move to next word
        setIsDeleting(false);
        setTopicIndex((prev) => (prev + 1) % TOPICS.length);
      } else {
        // Type or delete characters
        const nextText = isDeleting
          ? currentTopic.substring(0, typedText.length - 1)
          : currentTopic.substring(0, typedText.length + 1);
        setTypedText(nextText);
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, topicIndex, hasStarted, isInputFocused, isScanning]);

  // Act 3: Form Submit & AIChat Trigger
  const handleAnalyzeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isScanning) return;

    setIsScanning(true);
    inputRef.current?.blur();
    
    // Sequence of simulated logs
    setLogMessages([t('log1')]);
    
    setTimeout(() => {
      setLogMessages(prev => [...prev, t('log2')]);
    }, 800);
    
    setTimeout(() => {
      setLogMessages(prev => [...prev, t('log3')]);
    }, 1600);

    // Finally, open chat
    setTimeout(() => {
      const event = new CustomEvent('open-ai-chat', {
        detail: { context: `Analyze link: ${inputValue}` }
      });
      document.dispatchEvent(event);
      setIsScanning(false);
      setLogMessages([]);
      setInputValue('');
    }, 2400);
  };

  return (
    <section className={styles.hero} id="hero">
      {/* Act 1: Initial Black Overlay */}
      <div className={`${styles.overlay} ${hasStarted ? styles.overlayHidden : ''}`} />

      {/* Cyber-Sphere Background Component */}
      <CyberSphere 
        topicColor={TOPICS[topicIndex].color}
        isTopicChanging={typedText === '' && !isDeleting} // Pulse trigger
        isFocused={isInputFocused}
        isScanning={isScanning}
        hasStarted={hasStarted}
      />

      {/* Typography block */}
      <div className={`${styles.content} ${hasStarted ? styles.contentVisible : ''}`}>
        <div className={styles.eyebrow}>
          <span>MINDCORE</span>
          <span>//</span>
          <span>{t('systemOnline')}</span>
        </div>

        <h1 className={styles.heading}>
          {t('title').split(' ')[0]} {/* e.g. "Ракета-носитель" / "A booster" */}
          <br />
          <span className={styles.headingStatic}>{t('forTeams')}</span>
          <br className={styles.mobileBreak} />
          <span className={styles.typewriterWrap}>
            <span 
              className={styles.dynamicWord} 
              style={{ color: TOPICS[topicIndex].color }}
            >
              {typedText}
            </span>
            <span className={styles.cursor}>|</span>
          </span>
        </h1>

        <p className={styles.subtext}>
          {t('subtitle').split('\n').map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </p>

        {/* Act 3: Analysis Input */}
        <form onSubmit={handleAnalyzeSubmit} className={styles.analyzeForm}>
          <div className={`${styles.inputWrapper} ${isInputFocused ? styles.inputWrapperFocused : ''}`}>
            {isScanning ? (
              <div className={styles.logContainer}>
                {logMessages.map((msg, idx) => (
                  <div key={idx} className={styles.logMessage}>{msg}</div>
                ))}
              </div>
            ) : (
              <input
                ref={inputRef}
                type="text"
                placeholder={t('placeholder')}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                className={styles.analyzeInput}
                disabled={isScanning}
              />
            )}
            {!isScanning && (
              <button 
                type="submit" 
                className={`${styles.analyzeBtn} ${inputValue.trim() ? styles.analyzeBtnActive : ''}`}
                disabled={!inputValue.trim()}
              >
                {t('analyzeBtn')}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Scroll indicator */}
      <div className={`${styles.scrollHint} ${hasStarted ? styles.contentVisible : ''}`} aria-hidden="true">
        <div className={styles.scrollLine} />
        <span className={styles.scrollLabel}>scroll</span>
      </div>
    </section>
  );
}
