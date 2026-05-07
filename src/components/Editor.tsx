import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, Square, Sparkles, Wand2, Tag as TagIcon, Image as ImageIcon,
  Type, Hash, Clock, FileText, Palette, Pin, Archive, Trash2, Copy,
  Check, X, ChevronLeft, Maximize2, Minimize2, Loader2
} from 'lucide-react';
import { Note, Tag } from '../types';
import { Toolbar } from './Toolbar';
import { VoiceRecorder } from './VoiceRecorder';
import { ImageOCR } from './ImageOCR';
import { ColorPicker } from './ColorPicker';
import { autoFormatText, summarizeText, suggestTagsFromContent } from '../utils/aiHelpers';
import { formatFullDate, getWordCount, getCharCount, getReadingTime } from '../utils/formatters';

interface EditorProps {
  note: Note | null;
  tags: Tag[];
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
  onArchiveNote: (id: string) => void;
  onRestoreNote: (id: string) => void;
  onDuplicateNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onAddTag: (noteId: string, tagId: string) => void;
  onRemoveTag: (noteId: string, tagId: string) => void;
  getTagColor: (id: string) => string;
  getTagName: (id: string) => string;
  onCreateTag: (name: string) => string;
  allTags: Tag[];
  onBack: () => void;
}

export const Editor: React.FC<EditorProps> = ({
  note,
  tags,
  onUpdateNote,
  onDeleteNote,
  onArchiveNote,
  onRestoreNote,
  onDuplicateNote,
  onTogglePin,
  onToggleComplete,
  onAddTag,
  onRemoveTag,
  getTagColor,
  getTagName,
  onCreateTag,
  allTags,
  onBack,
}) => {
  const [title, setTitle] = useState('');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showImageOCR, setShowImageOCR] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<string[]>([]);
  const [isFormatting, setIsFormatting] = useState(false);
  const [fontSize, setFontSize] = useState('16px');
  const [fontFamily, setFontFamily] = useState('Inter, system-ui, sans-serif');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      if (contentRef.current) {
        contentRef.current.innerHTML = note.content || '<p><br></p>';
      }
      setShowSummary(false);
      setSummary([]);
    } else {
      setTitle('');
      if (contentRef.current) {
        contentRef.current.innerHTML = '<p><br></p>';
      }
    }
  }, [note?.id]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (note) {
      onUpdateNote(note.id, { title: newTitle });
    }
  };

  const handleContentChange = () => {
    if (note && contentRef.current) {
      onUpdateNote(note.id, { content: contentRef.current.innerHTML });
    }
  };

  const handleFormat = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (contentRef.current) {
      contentRef.current.focus();
    }
    handleContentChange();
  }, [note]);

  const handleClearFormat = useCallback(() => {
    document.execCommand('removeFormat', false);
    if (contentRef.current) {
      contentRef.current.focus();
    }
    handleContentChange();
  }, [note]);

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    handleFormat('fontSize', '7');
    // Wrap selection in span with actual pixel size
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = size;
      try {
        range.surroundContents(span);
      } catch {
        // Fallback for complex selections
      }
    }
  };

  const handleFontFamilyChange = (family: string) => {
    setFontFamily(family);
    handleFormat('fontName', family.split(',')[0]);
  };

  const handleAutoFormat = () => {
    if (!note || !contentRef.current) return;
    setIsFormatting(true);
    
    setTimeout(() => {
      const html = contentRef.current?.innerHTML || '';
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const text = tempDiv.textContent || '';
      
      const formatted = autoFormatText(text);
      if (contentRef.current) {
        contentRef.current.innerHTML = formatted;
      }
      onUpdateNote(note.id, { content: formatted });
      setIsFormatting(false);
    }, 300);
  };

  const handleSummarize = () => {
    if (!note || !contentRef.current) return;
    const text = contentRef.current.textContent || '';
    const summaryPoints = summarizeText(text);
    setSummary(summaryPoints);
    setShowSummary(true);
  };

  const handleAutoTag = () => {
    if (!note || !contentRef.current) return;
    const text = contentRef.current.textContent || '';
    const existingTagNames = allTags.map(t => t.name);
    const suggestions = suggestTagsFromContent(text, existingTagNames);
    setSuggestedTags(suggestions);
  };

  const insertVoiceText = (text: string) => {
    if (!contentRef.current) return;
    const p = document.createElement('p');
    p.textContent = text;
    contentRef.current.appendChild(p);
    handleContentChange();
  };

  const insertOCRText = (text: string) => {
    if (!contentRef.current) return;
    const p = document.createElement('p');
    p.textContent = text;
    contentRef.current.appendChild(p);
    handleContentChange();
  };

  const handleAddTag = (tagId: string) => {
    if (note) {
      onAddTag(note.id, tagId);
    }
    setShowTagDropdown(false);
  };

  const handleCreateAndAddTag = (name: string) => {
    const tagId = onCreateTag(name);
    if (note) {
      onAddTag(note.id, tagId);
    }
    setShowTagDropdown(false);
  };

  const wordCount = note ? getWordCount(note.content) : 0;
  const charCount = note ? getCharCount(note.content) : 0;
  const readingTime = getReadingTime(wordCount);

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/30">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">Select a note or create a new one</p>
          <p className="text-sm">Press Ctrl+N to create a new note</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col bg-navy-950/50 ${isFocusMode ? 'fixed inset-0 z-50 bg-navy-950' : ''}`}>
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-white/50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onTogglePin(note.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                note.isPinned ? 'text-amber-400 bg-amber-400/10' : 'text-white/40 hover:bg-white/10'
              }`}
              title={note.isPinned ? 'Unpin' : 'Pin'}
            >
              <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={() => onToggleComplete(note.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                note.isCompleted ? 'text-emerald-400 bg-emerald-400/10' : 'text-white/40 hover:bg-white/10'
              }`}
              title={note.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* AI Actions */}
          <button
            onClick={handleAutoFormat}
            disabled={isFormatting}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
            title="Auto Format"
          >
            {isFormatting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleSummarize}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
            title="Summarize"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={handleAutoTag}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
            title="Auto Tag"
          >
            <TagIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
            className={`p-1.5 rounded-lg transition-colors ${
              showVoiceRecorder ? 'text-blue-400 bg-blue-400/10' : 'text-white/40 hover:bg-white/10'
            }`}
            title="Voice to Text"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowImageOCR(!showImageOCR)}
            className={`p-1.5 rounded-lg transition-colors ${
              showImageOCR ? 'text-blue-400 bg-blue-400/10' : 'text-white/40 hover:bg-white/10'
            }`}
            title="Image OCR"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-white/10 mx-1" />

          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={`p-1.5 rounded-lg transition-colors ${
              note.color ? 'text-white/70' : 'text-white/40 hover:bg-white/10'
            }`}
            title="Note Color"
          >
            <Palette className="w-4 h-4" style={{ color: note.color || undefined }} />
          </button>
          <button
            onClick={() => onDuplicateNote(note.id)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          {!note.isArchived ? (
            <button
              onClick={() => onArchiveNote(note.id)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
              title="Archive"
            >
              <Archive className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onRestoreNote(note.id)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
              title="Restore"
            >
              <Archive className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-white/10 mx-1" />

          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
            title={isFocusMode ? 'Exit Focus' : 'Focus Mode'}
          >
            {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Color Picker */}
      <AnimatePresence>
        {showColorPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-white/10"
          >
            <ColorPicker
              currentColor={note.color}
              onSelect={(color) => {
                onUpdateNote(note.id, { color });
                setShowColorPicker(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Recorder */}
      <AnimatePresence>
        {showVoiceRecorder && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-white/10"
          >
            <VoiceRecorder
              onTranscript={insertVoiceText}
              onClose={() => setShowVoiceRecorder(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image OCR */}
      <AnimatePresence>
        {showImageOCR && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-white/10"
          >
            <ImageOCR
              onTextExtracted={insertOCRText}
              onClose={() => setShowImageOCR(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Panel */}
      <AnimatePresence>
        {showSummary && summary.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-white/10 bg-amber-500/5"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Summary
                </h3>
                <button
                  onClick={() => setShowSummary(false)}
                  className="text-white/40 hover:text-white/60"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ul className="space-y-1">
                {summary.map((point, i) => (
                  <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggested Tags */}
      <AnimatePresence>
        {suggestedTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-white/10 bg-blue-500/5"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-400 flex items-center gap-2">
                  <TagIcon className="w-4 h-4" />
                  Suggested Tags
                </h3>
                <button
                  onClick={() => setSuggestedTags([])}
                  className="text-white/40 hover:text-white/60"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tagName) => (
                  <button
                    key={tagName}
                    onClick={() => handleCreateAndAddTag(tagName)}
                    className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/70 hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
                  >
                    + {tagName}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <Toolbar
        onFormat={handleFormat}
        onClearFormat={handleClearFormat}
        currentFontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
        currentFontFamily={fontFamily}
        onFontFamilyChange={handleFontFamilyChange}
      />

      {/* Title Input */}
      <div className="px-6 pt-6">
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title..."
          className="w-full bg-transparent text-2xl font-semibold text-white/90 placeholder:text-white/20 outline-none"
        />
      </div>

      {/* Tags */}
      <div className="px-6 py-2 flex items-center gap-2 flex-wrap">
        {note.tags.map((tagId) => (
          <span
            key={tagId}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
            style={{
              backgroundColor: `${getTagColor(tagId)}20`,
              color: getTagColor(tagId),
            }}
          >
            {getTagName(tagId)}
            <button
              onClick={() => onRemoveTag(note.id, tagId)}
              className="hover:opacity-70"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        
        <div className="relative">
          <button
            onClick={() => setShowTagDropdown(!showTagDropdown)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60 transition-colors"
          >
            <TagIcon className="w-3 h-3" />
            Add tag
          </button>
          
          <AnimatePresence>
            {showTagDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-full left-0 mt-1 bg-navy-900 border border-white/10 rounded-lg shadow-xl py-1 z-50 min-w-[160px] max-h-48 overflow-y-auto"
              >
                {allTags.filter(t => !note.tags.includes(t.id)).map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleAddTag(tag.id)}
                    className="w-full px-3 py-2 text-left text-xs text-white/60 hover:bg-white/5 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                    {tag.name}
                  </button>
                ))}
                {allTags.filter(t => !note.tags.includes(t.id)).length === 0 && (
                  <div className="px-3 py-2 text-xs text-white/30">No more tags</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content Editor */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div
          ref={contentRef}
          contentEditable
          onInput={handleContentChange}
          className="editor-content min-h-[300px] text-white/80 outline-none"
          style={{ fontFamily, fontSize }}
          suppressContentEditableWarning
        />
      </div>

      {/* Footer Stats */}
      <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between text-xs text-white/30">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Type className="w-3 h-3" />
            {wordCount} words
          </span>
          <span className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            {charCount} chars
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {readingTime}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>Created {formatFullDate(note.createdAt)}</span>
          <span>Modified {formatFullDate(note.updatedAt)}</span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-navy-900 border border-white/10 rounded-xl p-6 max-w-sm w-full"
            >
              <h3 className="text-lg font-semibold text-white/90 mb-2">Delete Note?</h3>
              <p className="text-sm text-white/50 mb-4">
                "{note.title || 'Untitled Note'}" will be permanently deleted. This cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 text-sm text-white/60 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeleteNote(note.id);
                    setShowDeleteConfirm(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-sm text-red-400 hover:bg-red-500/30"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
