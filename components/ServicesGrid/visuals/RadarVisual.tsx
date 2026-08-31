'use client';

import { useEffect, useRef } from 'react';
import styles from './CodeVisual.module.css';

interface VisualProps {
  hovered: boolean;
  mouseX?: number;
  mouseY?: number;
}

export default function RadarVisual({ hovered }: VisualProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (hovered) {
      video.play().catch(() => {
        // Autoplay fallback
      });
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [hovered]);

  return (
    <div className={styles.workspaceContainer}>
      <div className={styles.videoWrapper}>
        <video
          ref={videoRef}
          src="/videos/analytics.mp4"
          className={`${styles.videoElement} ${hovered ? styles.videoHovered : ''}`}
          muted
          playsInline
          preload="auto"
          loop
        />
        <div className={styles.videoOverlay} />
      </div>
    </div>
  );
}
