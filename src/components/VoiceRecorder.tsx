import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Loader2, X } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  onClose: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscript, onClose }) => {
  const { isListening, transcript, interimTranscript, error, isSupported, startListening, stopListening, resetTranscript } = useSpeech();
  const [isInserted, setIsInserted] = useState(false);

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
      setIsInserted(false);
    }
  };

  const handleInsert = () => {
    if (transcript.trim()) {
      onTranscript(transcript.trim());
      setIsInserted(true);
      resetTranscript();
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-red-500/5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <p className="text-sm text-red-400">Speech recognition is not supported in this browser.</p>
          <button onClick={onClose} className="text-white/40 hover:text-white/60">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-500/5 border-b border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-400 animate-pulse' : 'bg-white/20'}`} />
          <span className="text-sm font-medium text-white/70">
            {isListening ? 'Recording...' : 'Voice to Text'}
          </span>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white/60">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Waveform Visualization */}
      {isListening && (
        <div className="flex items-center justify-center gap-0.5 h-12 mb-3">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-blue-400/60 rounded-full"
              animate={{
                height: [8, Math.random() * 32 + 8, 8],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.03,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Transcript Display */}
      <div className="bg-white/5 rounded-lg p-3 mb-3 min-h-[60px]">
        <p className="text-sm text-white/80">
          {transcript}
          {interimTranscript && (
            <span className="text-white/40">{interimTranscript}</span>
          )}
          {!transcript && !interimTranscript && (
            <span className="text-white/20 italic">Start speaking...</span>
          )}
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-400 mb-2">{error}</p>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={handleToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isListening
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
          }`}
        >
          {isListening ? (
            <>
              <Square className="w-4 h-4" />
              Stop
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              Record
            </>
          )}
        </button>

        {transcript.trim() && (
          <button
            onClick={handleInsert}
            disabled={isInserted}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              isInserted
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {isInserted ? 'Inserted ✓' : 'Insert'}
          </button>
        )}

        {transcript && (
          <button
            onClick={resetTranscript}
            className="px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/60 hover:bg-white/5"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
