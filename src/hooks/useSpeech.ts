import { useState, useCallback, useRef, useEffect } from 'react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
}

export function useSpeech() {
  const [state, setState] = useState<SpeechState>({
    isListening: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    isSupported: typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window),
  });

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!state.isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setState(prev => ({ ...prev, isListening: true, error: null }));
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setState(prev => ({
        ...prev,
        transcript: prev.transcript + final,
        interimTranscript: interim,
      }));
    };

    recognition.onerror = (event: any) => {
      setState(prev => ({ 
        ...prev, 
        error: event.error,
        isListening: false 
      }));
    };

    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false, interimTranscript: '' }));
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [state.isSupported]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      setState(prev => ({ ...prev, transcript: '', interimTranscript: '' }));
      recognitionRef.current.start();
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '', interimTranscript: '' }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
  };
}
