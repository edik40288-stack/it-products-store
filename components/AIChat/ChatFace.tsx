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
    }
  }, [emotion, isOpen]);

  if (isOpen) {
    return (
      <div className={styles.closeIconWrap}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </div>
    );
  }

  const isGreetingActive = emotion === 'happy' || emotion === 'idle' || emotion === 'finished';
  const activeVideoSrc = 
    emotion === 'diplomat' 
      ? '/videos/bot-business.mp4' 
      : emotion === 'pout' 
        ? '/videos/bot-sad.mp4' 
        : '/videos/bot-greeting.mp4';

  return (
    <div className={styles.videoFaceContainer}>
      {/* Instant 8KB 3D WebP Poster: Zero delay, offline-proof */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/images/posters/${emotion === 'diplomat' ? 'bot-business' : emotion === 'pout' ? 'bot-sad' : 'bot-greeting'}.webp`}
        alt="MINDCORE AI"
        className={styles.botPoster}
        loading="eager"
      />

      {/* Fallback golden icon if video & image blocked */}
      <div className={styles.avatarFallback}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="12" x="3" y="6" rx="2" />
          <path d="M12 2v4M9 12h.01M15 12h.01" />
        </svg>
      </div>

      {/* Animated 3D Character (Immune to iOS Low Power Mode play button) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={emotion}
        src={`/images/anim/${emotion === 'diplomat' ? 'bot-business' : emotion === 'pout' ? 'bot-sad' : 'bot-greeting'}.webp`}
        alt="MINDCORE AI"
        className={`${styles.botVideo} ${styles.botVideoActive}`}
      />

      {/* Subtle glossy glass ring overlay */}
      <div className={styles.glassRingOverlay} />
    </div>
  );
}
