import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Pin, Clock, ArrowUpDown, Archive, CheckCircle, FileText,
  Tag as TagIcon, ChevronLeft, X, FolderOpen
} from 'lucide-react';
import { Note, Tag, SortOption, ViewFilter } from '../types';
import { NoteCard } from './NoteCard';

interface SidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  tags: Tag[];
  searchQuery: string;
  sortBy: SortOption;
  viewFilter: ViewFilter;
  selectedTag: string | null;
  noteCount: { all: number; active: number; completed: number; archived: number };
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: SortOption) => void;
  onViewFilterChange: (filter: ViewFilter) => void;
  onTagSelect: (tagId: string | null) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDuplicate: (id: string) => void;
  getTagColor: (id: string) => string;
  getTagName: (id: string) => string;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  activeNoteId,
  tags,
  searchQuery,
  sortBy,
  viewFilter,
  selectedTag,
  noteCount,
  onSelectNote,
  onCreateNote,
  onSearchChange,
  onSortChange,
  onViewFilterChange,
  onTagSelect,
  onDeleteNote,
  onTogglePin,
  onToggleComplete,
  onArchive,
  onRestore,
  onDuplicate,
  getTagColor,
  getTagName,
  isOpen,
  onToggle,
}) => {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showTagFilter, setShowTagFilter] = useState(false);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'updated', label: 'Last Modified' },
    { value: 'created', label: 'Created Date' },
    { value: 'title', label: 'Title' },
  ];

  const filterOptions: { value: ViewFilter; label: string; icon: React.ReactNode; count: number }[] = [
    { value: 'all', label: 'All Notes', icon: <FileText className="w-4 h-4" />, count: noteCount.all },
    { value: 'active', label: 'Active', icon: <CheckCircle className="w-4 h-4" />, count: noteCount.active },
    { value: 'completed', label: 'Completed', icon: <CheckCircle className="w-4 h-4" />, count: noteCount.completed },
    { value: 'archived', label: 'Archived', icon: <Archive className="w-4 h-4" />, count: noteCount.archived },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-navy-900/80 backdrop-blur-xl border-r border-white/10 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } transition-transform duration-300`}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-semibold text-lg text-white/90">AI Notebook</h1>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-white/50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:border-white/20"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* New Note Button */}
          <button
            onClick={onCreateNote}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>

        {/* Filters */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-1 mb-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onViewFilterChange(option.value)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg text-xs transition-colors ${
                  viewFilter === option.value
                    ? 'bg-white/10 text-white/80'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                }`}
              >
                {option.icon}
                <span>{option.count}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="relative flex-1">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/5 text-xs text-white/50 hover:bg-white/10"
              >
                <span className="flex items-center gap-1.5">
                  <ArrowUpDown className="w-3 h-3" />
                  {sortOptions.find(s => s.value === sortBy)?.label}
                </span>
              </button>
              <AnimatePresence>
                {showSortMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-navy-900 border border-white/10 rounded-lg shadow-xl py-1 z-50"
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => { onSortChange(option.value); setShowSortMenu(false); }}
                        className={`w-full px-3 py-2 text-left text-xs ${
                          sortBy === option.value ? 'text-blue-400 bg-blue-500/10' : 'text-white/60 hover:bg-white/5'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tag Filter */}
            <div className="relative">
              <button
                onClick={() => setShowTagFilter(!showTagFilter)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  selectedTag ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                <TagIcon className="w-3 h-3" />
                {selectedTag ? getTagName(selectedTag) : 'Tags'}
              </button>
              <AnimatePresence>
                {showTagFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full right-0 mt-1 bg-navy-900 border border-white/10 rounded-lg shadow-xl py-1 z-50 min-w-[140px] max-h-48 overflow-y-auto"
                  >
                    <button
                      onClick={() => { onTagSelect(null); setShowTagFilter(false); }}
                      className={`w-full px-3 py-2 text-left text-xs ${
                        !selectedTag ? 'text-blue-400 bg-blue-500/10' : 'text-white/60 hover:bg-white/5'
                      }`}
                    >
                      All Tags
                    </button>
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => { onTagSelect(tag.id); setShowTagFilter(false); }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 ${
                          selectedTag === tag.id ? 'text-blue-400 bg-blue-500/10' : 'text-white/60 hover:bg-white/5'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Note List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <AnimatePresence mode="popLayout">
            {notes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-white/30"
              >
                <FolderOpen className="w-12 h-12 mb-3" />
                <p className="text-sm">
                  {searchQuery ? 'No notes match your search' : viewFilter === 'archived' ? 'No archived notes' : 'No notes yet'}
                </p>
                {!searchQuery && viewFilter !== 'archived' && (
                  <button
                    onClick={onCreateNote}
                    className="mt-3 text-sm text-blue-400 hover:text-blue-300"
                  >
                    Create your first note
                  </button>
                )}
              </motion.div>
            ) : (
              notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isActive={note.id === activeNoteId}
                  tags={tags}
                  onSelect={onSelectNote}
                  onDelete={onDeleteNote}
                  onTogglePin={onTogglePin}
                  onToggleComplete={onToggleComplete}
                  onArchive={onArchive}
                  onRestore={onRestore}
                  onDuplicate={onDuplicate}
                  getTagColor={getTagColor}
                  getTagName={getTagName}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer Stats */}
        <div className="p-3 border-t border-white/10 text-[10px] text-white/30 flex items-center justify-between">
          <span>{notes.length} notes</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Auto-saved
          </span>
        </div>
      </motion.aside>
    </>
  );
};
