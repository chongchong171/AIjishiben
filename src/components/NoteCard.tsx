import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Trash2, Palette, Pin, Copy, Archive, RotateCcw, Type, Hash, Clock, FileText } from 'lucide-react';
import { Note, Tag } from '../types';
import { formatDate, formatFullDate, getWordCount, getCharCount, getReadingTime } from '../utils/formatters';

interface NoteCardProps {
  note: Note;
  isActive: boolean;
  tags: Tag[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDuplicate: (id: string) => void;
  getTagColor: (id: string) => string;
  getTagName: (id: string) => string;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isActive,
  tags,
  onSelect,
  onDelete,
  onTogglePin,
  onToggleComplete,
  onArchive,
  onRestore,
  onDuplicate,
  getTagColor,
  getTagName,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setShowActions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const wordCount = getWordCount(note.content);
  const charCount = getCharCount(note.content);
  const readingTime = getReadingTime(wordCount);

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const preview = stripHtml(note.content).slice(0, 120);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group relative rounded-xl border transition-all cursor-pointer ${
        isActive
          ? 'bg-white/10 border-white/20'
          : 'bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/10'
      }`}
      onClick={() => onSelect(note.id)}
    >
      {note.color && (
        <div
          className="absolute left-0 top-3 bottom-3 w-1 rounded-full"
          style={{ backgroundColor: note.color }}
        />
      )}

      <div className={`p-4 ${note.color ? 'pl-5' : ''}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {note.isPinned && (
                <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
              )}
              {note.isCompleted && (
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              )}
              <h3 className={`font-medium text-sm truncate ${
                note.isCompleted ? 'text-white/50 line-through' : 'text-white/90'
              }`}>
                {note.title || 'Untitled Note'}
              </h3>
            </div>

            {preview && (
              <p className="text-xs text-white/40 line-clamp-2 mb-2">
                {preview}
              </p>
            )}

            <div className="flex items-center gap-1.5 flex-wrap">
              {note.tags.slice(0, 3).map(tagId => (
                <span
                  key={tagId}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
                  style={{
                    backgroundColor: `${getTagColor(tagId)}20`,
                    color: getTagColor(tagId),
                  }}
                >
                  {getTagName(tagId)}
                </span>
              ))}
              {note.tags.length > 3 && (
                <span className="text-[10px] text-white/30">+{note.tags.length - 3}</span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-2 text-[10px] text-white/30">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(note.updatedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Type className="w-3 h-3" />
                {wordCount} words
              </span>
            </div>
          </div>

          <div className="relative" ref={actionsRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  className="absolute right-0 top-full mt-1 z-50 bg-navy-900 border border-white/10 rounded-lg shadow-xl py-1 min-w-[160px]"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); onTogglePin(note.id); setShowActions(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-white/70 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Pin className="w-3.5 h-3.5" />
                    {note.isPinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleComplete(note.id); setShowActions(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-white/70 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {note.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDuplicate(note.id); setShowActions(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-white/70 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Duplicate
                  </button>
                  {!note.isArchived ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); onArchive(note.id); setShowActions(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-white/70 hover:bg-white/5 flex items-center gap-2"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      Archive
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); onRestore(note.id); setShowActions(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-white/70 hover:bg-white/5 flex items-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restore
                    </button>
                  )}
                  <div className="border-t border-white/10 my-1" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActions(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-navy-950/95 rounded-xl flex flex-col items-center justify-center p-4"
          >
            <Trash2 className="w-8 h-8 text-red-400 mb-3" />
            <p className="text-sm text-white/70 mb-4 text-center">
              Delete "{note.title || 'Untitled Note'}"?
            </p>
            <div className="flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-sm text-white/60 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(note.id); setShowDeleteConfirm(false); }}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 text-sm text-red-400 hover:bg-red-500/30"
              >
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
