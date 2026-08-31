'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import styles from './Hero.module.css';
import CyberSphere from './CyberSphere';

const TOPIC_COLORS = ['#C9A84C', '#00F0FF', '#B534FF'];

export default function Hero() {
  const t = useTranslations('hero');
  
  const TOPICS = useMemo(() => [
    { text: t('topic0'), color: TOPIC_COLORS[0] },
    { text: t('topic1'), color: TOPIC_COLORS[1] },
    { text: t('topic2'), color: TOPIC_COLORS[2] }
  ], [t]);
  
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
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Act 2: Typewriter Effect without layout jumps
  useEffect(() => {
    if (!hasStarted || isInputFocused || isScanning) return;

    const currentTopic = TOPICS[topicIndex]?.text || '';
    let timer: NodeJS.Timeout;

    if (!isDeleting && typedText === currentTopic) {
      // Pause when full word is typed
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 2400);
    } else if (isDeleting && typedText === '') {
      // Move to next word when deleted
      timer = setTimeout(() => {
        setIsDeleting(false);
        setTopicIndex((prev) => (prev + 1) % TOPICS.length);
      }, 400);
    } else {
      // Typing or deleting characters
      const speed = isDeleting ? 35 : 85;
      timer = setTimeout(() => {
        setTypedText(
          isDeleting
            ? currentTopic.substring(0, typedText.length - 1)
            : currentTopic.substring(0, typedText.length + 1)
        );
      }, speed);
    }

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, topicIndex, hasStarted, isInputFocused, isScanning, TOPICS]);

  // Act 3: Form Submit & AIChat Trigger
  const handleAnalyzeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isScanning) return;

    setIsScanning(true);
    inputRef.current?.blur();
    
    setLogMessages([t('log1')]);
    
    const t1 = setTimeout(() => {
      setLogMessages((prev) => [...prev, t('log2')]);
    }, 800);
    
    const t2 = setTimeout(() => {
      setLogMessages((prev) => [...prev, t('log3')]);
    }, 1600);

    const t3 = setTimeout(() => {
      const event = new CustomEvent('open-ai-chat', {
        detail: { context: `Analyze link: ${inputValue}` }
      });
      document.dispatchEvent(event);
      setIsScanning(false);
      setLogMessages([]);
      setInputValue('');
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  return (
    <section className={styles.hero} id="hero">
      {/* Initial Black Overlay */}
      <div className={`${styles.overlay} ${hasStarted ? styles.overlayHidden : ''}`} />

      {/* Interactive 3D Cyber-Sphere */}
      <CyberSphere 
        topicColor={TOPICS[topicIndex]?.color || TOPIC_COLORS[0]}
        isTopicChanging={typedText === '' && !isDeleting}
        isFocused={isInputFocused}
        isScanning={isScanning}
        hasStarted={hasStarted}
      />

      {/* Typography Block */}
      <div className={`${styles.content} ${hasStarted ? styles.contentVisible : ''}`}>
        <div className={styles.eyebrow}>
          <span>MINDCORE</span>
          <span>//</span>
          <span>{t('systemOnline')}</span>
        </div>

        <h1 className={styles.heading}>
          <span className={styles.titleLine}>{t('title')}</span>
          <div className={styles.typewriterRow}>
            <span className={styles.headingStatic}>{t('forTeams')}</span>
            <span className={styles.typewriterWrap}>
              <span 
                className={styles.dynamicWord} 
                style={{ color: TOPICS[topicIndex]?.color || TOPIC_COLORS[0] }}
              >
                {typedText || '\u00A0'}
              </span>
              <span className={styles.cursor}>|</span>
            </span>
          </div>
        </h1>

        <p className={styles.subtext}>
          {t('subtitle').split('\n').map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </p>

        {/* Lead Analysis Form */}
        <div className={styles.analyzeFormWrapper}>
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
      </div>

      {/* Scroll indicator */}
      <div className={`${styles.scrollHint} ${hasStarted ? styles.contentVisible : ''}`} aria-hidden="true">
        <div className={styles.scrollLine} />
        <span className={styles.scrollLabel}>scroll</span>
      </div>
    </section>
  );
}
