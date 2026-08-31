'use client';

import React, { useEffect, useRef } from 'react';
import styles from './AIChat.module.css';

export type EmotionType = 'idle' | 'happy' | 'diplomat' | 'pout' | 'finished';

interface ChatFaceProps {
  emotion: EmotionType;
  isOpen: boolean;
}

export default function ChatFace({ emotion, isOpen }: ChatFaceProps) {
  const greetingRef = useRef<HTMLVideoElement>(null);
  const businessRef = useRef<HTMLVideoElement>(null);
  const sadRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) return;

    if (emotion === 'happy') {
      if (greetingRef.current) {
        greetingRef.current.currentTime = 0;
        greetingRef.current.play().catch(() => {});
      }
    } else if (emotion === 'diplomat') {
      if (businessRef.current) {
        businessRef.current.currentTime = 0;
        businessRef.current.play().catch(() => {});
      }
    } else if (emotion === 'pout') {
      if (sadRef.current) {
        sadRef.current.currentTime = 0;
        sadRef.current.play().catch(() => {});
      }
    } else if (emotion === 'finished' || emotion === 'idle') {
      // Pause and show static smiling frame
      if (greetingRef.current) {
        greetingRef.current.pause();
        greetingRef.current.currentTime = 0;
      }
      businessRef.current?.pause();
      sadRef.current?.pause();
    }
  }, [emotion, isOpen]);

  if (isOpen) {
    return (
      <div className={styles.closeIconWrap}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </div>
    );
  }

  const isGreetingActive = emotion === 'happy' || emotion === 'idle' || emotion === 'finished';
  const isBusinessActive = emotion === 'diplomat';
  const isSadActive = emotion === 'pout';

  return (
    <div className={styles.videoFaceContainer}>
      {/* 1. Greeting / Smiling Resting 3D Character */}
      <video
        ref={greetingRef}
        src="/videos/bot-greeting.mp4"
        muted
        playsInline
        preload="metadata"
        className={`${styles.botVideo} ${isGreetingActive ? styles.botVideoActive : ''}`}
      />

      {/* 2. Business / Diplomat 3D Character */}
      <video
        ref={businessRef}
        src="/videos/bot-business.mp4"
        muted
        playsInline
        preload="metadata"
        className={`${styles.botVideo} ${isBusinessActive ? styles.botVideoActive : ''}`}
      />

      {/* 3. Pouting / Sad 3D Character */}
      <video
        ref={sadRef}
        src="/videos/bot-sad.mp4"
        muted
        playsInline
        preload="metadata"
        className={`${styles.botVideo} ${isSadActive ? styles.botVideoActive : ''}`}
      />

      {/* Subtle glossy glass ring overlay */}
      <div className={styles.glassRingOverlay} />
    </div>
  );
}
