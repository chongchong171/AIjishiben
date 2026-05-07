import React from 'react';
import { motion } from 'framer-motion';

interface ColorPickerProps {
  currentColor: string | null | undefined;
  onSelect: (color: string | null | undefined) => void;
}

const NOTE_COLORS = [
  null,
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#84cc16',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#d946ef',
  '#f43f5e',
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ currentColor, onSelect }) => {
  return (
    <div className="p-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => onSelect(undefined)}
          className={`w-8 h-8 rounded-full border-2 transition-all ${
            !currentColor
              ? 'border-white/60 scale-110'
              : 'border-white/20 hover:border-white/40'
          }`}
          style={{ backgroundColor: 'transparent' }}
          title="No color"
        >
          <div className="w-full h-full rounded-full border border-white/10" />
        </button>
        {NOTE_COLORS.slice(1).map((color) => (
          <button
            key={color}
            onClick={() => onSelect(color || undefined)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              currentColor === color
                ? 'border-white/60 scale-110'
                : 'border-transparent hover:scale-105'
            }`}
            style={{ backgroundColor: color || undefined }}
            title={color || undefined}
          />
        ))}
      </div>
    </div>
  );
};
