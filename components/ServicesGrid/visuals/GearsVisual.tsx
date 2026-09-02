'use client';

import { useEffect, useRef } from 'react';
import styles from './CodeVisual.module.css';

interface VisualProps {
  hovered: boolean;
  mouseX?: number;
  mouseY?: number;
}

export default function GearsVisual({ hovered }: VisualProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const isTouch = typeof window !== 'undefined' && 
      ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024);

    if (isTouch) {
      video.muted = true;
      video.play().catch(() => {});
      return;
    }

    if (hovered) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [hovered]);

  return (
    <div className={styles.workspaceContainer}>
      <div className={styles.videoWrapper}>
        <video
          ref={(el) => {
            (videoRef as any).current = el;
            if (el) {
              el.muted = true;
              el.defaultMuted = true;
              const isTouch = typeof window !== 'undefined' && 
                ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024);
              if (isTouch && el.paused) {
                el.play().catch(() => {});
              }
            }
          }}
          src="/videos/automation.mp4#t=0.001"
          className={`${styles.videoElement} ${hovered ? styles.videoHovered : ''}`}
          muted
          playsInline
          autoPlay
          preload="auto"
          loop
        />
        <div className={styles.videoOverlay} />
      </div>
    </div>
  );
}
