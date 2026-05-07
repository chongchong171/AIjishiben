import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  CheckSquare, Quote, Code, Minus, Type, Palette, Highlighter,
  ChevronDown, X
} from 'lucide-react';

interface ToolbarProps {
  onFormat: (command: string, value?: string) => void;
  onClearFormat: () => void;
  currentFontSize: string;
  onFontSizeChange: (size: string) => void;
  currentFontFamily: string;
  onFontFamilyChange: (family: string) => void;
}

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];

const FONT_FAMILIES = [
  { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
  { value: 'JetBrains Mono, monospace', label: 'JetBrains Mono' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Playfair Display, serif', label: 'Playfair Display' },
  { value: 'system-ui, sans-serif', label: 'System' },
];

const TEXT_COLORS = [
  '#ffffff', '#e2e8f0', '#94a3b8', '#64748b',
  '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#10b981', '#06b6d4', '#3b82f6', '#6366f1',
  '#8b5cf6', '#d946ef', '#f43f5e', '#78716c',
];

const HIGHLIGHT_COLORS = [
  '#fef3c7', '#dbeafe', '#dcfce7', '#fce7f3',
  '#ffedd5', '#e0e7ff', '#ccfbf1', '#fecaca',
  '#fef9c3', '#d1fae5', '#e0f2fe', '#f3e8ff',
];

export const Toolbar: React.FC<ToolbarProps> = ({
  onFormat,
  onClearFormat,
  currentFontSize,
  onFontSizeChange,
  currentFontFamily,
  onFontFamilyChange,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [colorType, setColorType] = useState<'text' | 'highlight'>('text');
  const [customColor, setCustomColor] = useState('#ffffff');

  const handleColorSelect = (color: string) => {
    if (colorType === 'text') {
      onFormat('foreColor', color);
    } else {
      onFormat('hiliteColor', color);
    }
    setShowColorPicker(false);
    setShowHighlightPicker(false);
  };

  const toolbarButton = (icon: React.ReactNode, command: string, value?: string, title?: string) => (
    <button
      onClick={() => onFormat(command, value)}
      title={title || command}
      className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white/90 transition-colors"
    >
      {icon}
    </button>
  );

  return (
    <div className="flex items-center gap-1 p-2 bg-white/5 border-b border-white/10 flex-wrap">
      {/* Font Family */}
      <div className="relative">
        <select
          value={currentFontFamily}
          onChange={(e) => onFontFamilyChange(e.target.value)}
          className="appearance-none bg-white/5 border border-white/10 rounded-lg px-2 py-1 pr-6 text-xs text-white/70 focus:outline-none focus:border-white/20 cursor-pointer"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40 pointer-events-none" />
      </div>

      {/* Font Size */}
      <div className="relative">
        <select
          value={currentFontSize}
          onChange={(e) => onFontSizeChange(e.target.value)}
          className="appearance-none bg-white/5 border border-white/10 rounded-lg px-2 py-1 pr-6 text-xs text-white/70 focus:outline-none focus:border-white/20 cursor-pointer"
        >
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40 pointer-events-none" />
      </div>

      <div className="w-px h-5 bg-white/10 mx-1" />

      {/* Text Style */}
      {toolbarButton(<Bold className="w-4 h-4" />, 'bold', undefined, 'Bold')}
      {toolbarButton(<Italic className="w-4 h-4" />, 'italic', undefined, 'Italic')}
      {toolbarButton(<Underline className="w-4 h-4" />, 'underline', undefined, 'Underline')}
      {toolbarButton(<Strikethrough className="w-4 h-4" />, 'strikeThrough', undefined, 'Strikethrough')}

      <div className="w-px h-5 bg-white/10 mx-1" />

      {/* Color Pickers */}
      <div className="relative">
        <button
          onClick={() => {
            setColorType('text');
            setShowColorPicker(!showColorPicker);
            setShowHighlightPicker(false);
          }}
          title="Text Color"
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white/90 transition-colors"
        >
          <Palette className="w-4 h-4" />
        </button>
      </div>

      <div className="relative">
        <button
          onClick={() => {
            setColorType('highlight');
            setShowHighlightPicker(!showHighlightPicker);
            setShowColorPicker(false);
          }}
          title="Highlight Color"
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white/90 transition-colors"
        >
          <Highlighter className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-5 bg-white/10 mx-1" />

      {/* Lists */}
      {toolbarButton(<List className="w-4 h-4" />, 'insertUnorderedList', undefined, 'Bullet List')}
      {toolbarButton(<ListOrdered className="w-4 h-4" />, 'insertOrderedList', undefined, 'Numbered List')}
      {toolbarButton(<CheckSquare className="w-4 h-4" />, 'insertHTML', '<input type="checkbox"> ', 'Checklist')}

      <div className="w-px h-5 bg-white/10 mx-1" />

      {/* Blocks */}
      {toolbarButton(<Quote className="w-4 h-4" />, 'formatBlock', 'blockquote', 'Quote')}
      {toolbarButton(<Code className="w-4 h-4" />, 'formatBlock', 'pre', 'Code Block')}
      {toolbarButton(<Minus className="w-4 h-4" />, 'insertHorizontalRule', undefined, 'Horizontal Rule')}

      <div className="w-px h-5 bg-white/10 mx-1" />

      {/* Clear Format */}
      <button
        onClick={onClearFormat}
        title="Clear Formatting"
        className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white/90 transition-colors"
      >
        <Type className="w-4 h-4" />
      </button>

      {/* Color Picker Dropdown */}
      <AnimatePresence>
        {showColorPicker && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute top-full left-0 mt-2 bg-navy-900 border border-white/10 rounded-xl shadow-2xl p-3 z-50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/60">{colorType === 'text' ? 'Text Color' : 'Highlight'}</span>
              <button onClick={() => setShowColorPicker(false)} className="text-white/40 hover:text-white/60">
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-8 gap-1 mb-2">
              {(colorType === 'text' ? TEXT_COLORS : HIGHLIGHT_COLORS).map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className="w-6 h-6 rounded-full border border-white/10 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer"
              />
              <button
                onClick={() => handleColorSelect(customColor)}
                className="text-xs text-white/60 hover:text-white/80"
              >
                Custom
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
