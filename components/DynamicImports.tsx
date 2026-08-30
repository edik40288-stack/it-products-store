'use client';

import dynamic from 'next/dynamic';

export const WebGLBackground = dynamic(() => import('@/components/Background/WebGLBackground'), { ssr: false });
export const AIChat = dynamic(() => import('@/components/AIChat/AIChat'), { ssr: false });
