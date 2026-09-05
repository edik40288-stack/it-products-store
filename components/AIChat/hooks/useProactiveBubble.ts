'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { EmotionType } from '../ChatFace';

interface UseProactiveBubbleProps {
  isOpen: boolean;
  onOpenChat: () => void;
}

export function useProactiveBubble({ isOpen, onOpenChat }: UseProactiveBubbleProps) {
  const [promptStep, setPromptStep] = useState(0);
  const [emotionState, setEmotionState] = useState<EmotionType>('idle');
  const [isBubbleDismissed, setIsBubbleDismissed] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const lifecycleCompletedRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Read session storage dismissal on mount + track scrolling
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (sessionStorage.getItem('ai_bubble_dismissed') === '1') {
          setIsBubbleDismissed(true);
          return;
        }
      } catch {}
    }

    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Step timing: runs once on initial site load
  useEffect(() => {
    if (lifecycleCompletedRef.current) return;

    if (isOpen || isBubbleDismissed) {
      lifecycleCompletedRef.current = true;
      setPromptStep(0);
      setEmotionState('finished');
      return;
    }

    // T = 3.0s: Step 1 (Greeting)
    const timer1 = setTimeout(() => {
      if (!lifecycleCompletedRef.current) {
        setPromptStep(1);
        setEmotionState('happy');
      }
    }, 3000);

    // T = 7.0s: Step 2 (Diplomat / Tech scope)
    const timer2 = setTimeout(() => {
      if (!lifecycleCompletedRef.current) {
        setPromptStep(2);
        setEmotionState('diplomat');
      }
    }, 7000);

    // T = 11.0s: Step 3 (Call to Action / Question)
    const timer3 = setTimeout(() => {
      if (!lifecycleCompletedRef.current) {
        setPromptStep(3);
        setEmotionState('pout');
      }
    }, 11000);

    // T = 15.0s: Permanently complete lifecycle
    const timer4 = setTimeout(() => {
      lifecycleCompletedRef.current = true;
      setPromptStep(0);
      setEmotionState('finished');
    }, 15000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isOpen, isBubbleDismissed]);

  const handleDismissBubble = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    lifecycleCompletedRef.current = true;
    setIsBubbleDismissed(true);
    setPromptStep(0);
    setEmotionState('finished');
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('ai_bubble_dismissed', '1');
      } catch {}
    }
  }, []);

  const handleOpenFromBubble = useCallback(() => {
    lifecycleCompletedRef.current = true;
    setPromptStep(0);
    setEmotionState('finished');
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('ai_bubble_dismissed', '1');
      } catch {}
    }
    onOpenChat();
  }, [onOpenChat]);

  return {
    promptStep,
    emotionState,
    setEmotionState,
    isBubbleDismissed,
    isScrolling,
    handleDismissBubble,
    handleOpenFromBubble,
    lifecycleCompletedRef
  };
}
