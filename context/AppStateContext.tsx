'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AppState {
  activeCardId: string | null;
  setActiveCardId: (id: string | null) => void;
  closeDetailView: () => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  // Handle SPA routing and body overflow
  useEffect(() => {
    if (activeCardId) {
      // Save scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      // Update history API
      window.history.pushState({ cardId: activeCardId }, '', `?service=${activeCardId}`);
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
      
      // Clean history
      window.history.pushState({}, '', window.location.pathname);
    }
  }, [activeCardId]);

  // Handle back button (popstate)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.cardId) {
        setActiveCardId(e.state.cardId);
      } else {
        setActiveCardId(null);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeCardId) {
        setActiveCardId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCardId]);

  const closeDetailView = useCallback(() => {
    setActiveCardId(null);
  }, []);

  return (
    <AppStateContext.Provider value={{ activeCardId, setActiveCardId, closeDetailView }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
