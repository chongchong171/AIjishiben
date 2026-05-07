import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, X, Keyboard, Command, Plus, Search, Pin, Archive,
  Trash2, Copy, Check, Bold, Italic, Underline, List, Type
} from 'lucide-react';

interface ShortcutHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: ['Ctrl', 'N'], description: 'Create new note' },
  { keys: ['Ctrl', 'F'], description: 'Focus search' },
  { keys: ['Ctrl', '?'], description: 'Show shortcuts' },
  { keys: ['Esc'], description: 'Close modal / Exit focus' },
  { keys: ['Ctrl', 'B'], description: 'Bold' },
  { keys: ['Ctrl', 'I'], description: 'Italic' },
  { keys: ['Ctrl', 'U'], description: 'Underline' },
  { keys: ['Ctrl', 'Shift', '7'], description: 'Numbered list' },
  { keys: ['Ctrl', 'Shift', '8'], description: 'Bullet list' },
  { keys: ['Ctrl', 'Shift', 'L'], description: 'Clear formatting' },
];

export const ShortcutHelp: React.FC<ShortcutHelpProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-navy-900 border border-white/10 rounded-xl w-full max-w-lg"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white/90">Keyboard Shortcuts</h2>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white/60">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="grid gap-2">
                {SHORTCUTS.map((shortcut, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white/5"
                  >
                    <span className="text-sm text-white/70">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, j) => (
                        <React.Fragment key={j}>
                          <kbd className="px-2 py-1 rounded bg-white/10 text-xs text-white/80 font-mono border border-white/10">
                            {key}
                          </kbd>
                          {j < shortcut.keys.length - 1 && (
                            <span className="text-white/30 text-xs">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-white/10 text-center">
              <p className="text-xs text-white/40">
                Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-mono border border-white/10">?</kbd> anytime to show this help
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
