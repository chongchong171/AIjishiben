import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, X, Loader2, Copy, Check } from 'lucide-react';
import { useOCR } from '../hooks/useOCR';

interface ImageOCRProps {
  onTextExtracted: (text: string) => void;
  onClose: () => void;
}

export const ImageOCR: React.FC<ImageOCRProps> = ({ onTextExtracted, onClose }) => {
  const { isProcessing, text, progress, error, processImage, reset } = useOCR();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isInserted, setIsInserted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setIsInserted(false);

    try {
      await processImage(file);
    } catch {
      // Error handled in hook
    }
  }, [processImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setIsInserted(false);
      processImage(file);
    }
  }, [processImage]);

  const handleInsert = () => {
    if (text.trim()) {
      onTextExtracted(text.trim());
      setIsInserted(true);
    }
  };

  const handleReset = () => {
    reset();
    setPreviewUrl(null);
    setIsInserted(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 bg-purple-500/5 border-b border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-white/70">Screenshot to Text (OCR)</span>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white/60">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drop Zone */}
      {!previewUrl && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-white/20 hover:bg-white/5 transition-colors"
        >
          <Upload className="w-8 h-8 text-white/30 mx-auto mb-2" />
          <p className="text-sm text-white/50 mb-1">Drop an image or click to upload</p>
          <p className="text-xs text-white/30">Supports PNG, JPG, GIF</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Preview */}
      {previewUrl && (
        <div className="flex gap-4">
          <div className="w-32 h-32 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            {isProcessing && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  <span className="text-xs text-white/50">Processing... {Math.round(progress)}%</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-purple-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-400 mb-2">{error}</p>
            )}

            {text && (
              <div className="bg-white/5 rounded-lg p-3 mb-3">
                <p className="text-sm text-white/80 whitespace-pre-wrap">{text}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              {text && (
                <button
                  onClick={handleInsert}
                  disabled={isInserted}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    isInserted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {isInserted ? 'Inserted ✓' : 'Insert'}
                </button>
              )}
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/60 hover:bg-white/5"
              >
                New Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
