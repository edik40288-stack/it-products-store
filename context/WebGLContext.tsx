'use client';
import React, { createContext, useContext, useRef, ReactNode, useCallback } from 'react';

export interface CardData {
  id: string;
  element: HTMLElement;
  mouse: { x: number; y: number; relX: number; relY: number };
  isHovered: boolean;
  type: string;
}

interface WebGLContextType {
  registerCard: (id: string, element: HTMLElement, type: string) => void;
  unregisterCard: (id: string) => void;
  updateCardMouse: (id: string, relX: number, relY: number, absX: number, absY: number) => void;
  setCardHover: (id: string, isHovered: boolean) => void;
  getCards: () => Map<string, CardData>;
}

const WebGLContext = createContext<WebGLContextType | null>(null);

export function WebGLProvider({ children }: { children: ReactNode }) {
  const cardsRef = useRef<Map<string, CardData>>(new Map());

  const registerCard = useCallback((id: string, element: HTMLElement, type: string) => {
    cardsRef.current.set(id, {
      id,
      element,
      type,
      mouse: { x: 0, y: 0, relX: 0.5, relY: 0.5 },
      isHovered: false,
    });
  }, []);

  const unregisterCard = useCallback((id: string) => {
    cardsRef.current.delete(id);
  }, []);

  const updateCardMouse = useCallback((id: string, relX: number, relY: number, absX: number, absY: number) => {
    const card = cardsRef.current.get(id);
    if (card) {
      card.mouse.relX = relX;
      card.mouse.relY = relY;
      card.mouse.x = absX;
      card.mouse.y = absY;
    }
  }, []);

  const setCardHover = useCallback((id: string, isHovered: boolean) => {
    const card = cardsRef.current.get(id);
    if (card) {
      card.isHovered = isHovered;
    }
  }, []);

  const getCards = useCallback(() => cardsRef.current, []);

  return (
    <WebGLContext.Provider value={{ registerCard, unregisterCard, updateCardMouse, setCardHover, getCards }}>
      {children}
    </WebGLContext.Provider>
  );
}

export const useWebGL = () => {
  const ctx = useContext(WebGLContext);
  if (!ctx) throw new Error('useWebGL must be used within WebGLProvider');
  return ctx;
};
