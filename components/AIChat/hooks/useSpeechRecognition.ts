'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface UseSpeechRecognitionOptions {
  locale: string;
  onTranscript: (text: string) => void;
  unsupportedMessage?: string;
}

export function useSpeechRecognition({
  locale,
  onTranscript,
  unsupportedMessage
}: UseSpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang =
      locale === 'ru' ? 'ru-RU' : locale === 'ro' ? 'ro-RO' : 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        interimTranscript += event.results[i][0].transcript;
      }
      if (interimTranscript) {
        onTranscript(interimTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch {}
    };
  }, [locale, onTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      if (unsupportedMessage) {
        alert(unsupportedMessage);
      }
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang =
          locale === 'ru' ? 'ru-RU' : locale === 'ro' ? 'ro-RO' : 'en-US';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('SpeechRecognition start failed:', err);
      }
    }
  }, [isListening, locale, unsupportedMessage]);

  return {
    isListening,
    isSupported,
    toggleListening,
    stopListening
  };
}
