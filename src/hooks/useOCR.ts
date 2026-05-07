import { useState, useCallback } from 'react';
import Tesseract from 'tesseract.js';

interface OCRState {
  isProcessing: boolean;
  text: string;
  progress: number;
  error: string | null;
}

export function useOCR() {
  const [state, setState] = useState<OCRState>({
    isProcessing: false,
    text: '',
    progress: 0,
    error: null,
  });

  const processImage = useCallback(async (imageFile: File | string) => {
    setState({ isProcessing: true, text: '', progress: 0, error: null });

    try {
      const result = await Tesseract.recognize(
        imageFile,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setState(prev => ({ ...prev, progress: m.progress * 100 }));
            }
          },
        }
      );

      setState({
        isProcessing: false,
        text: result.data.text,
        progress: 100,
        error: null,
      });

      return result.data.text;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'OCR failed';
      setState({
        isProcessing: false,
        text: '',
        progress: 0,
        error: errorMessage,
      });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isProcessing: false, text: '', progress: 0, error: null });
  }, []);

  return {
    ...state,
    processImage,
    reset,
  };
}
