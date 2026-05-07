import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Tag as TagIcon, HelpCircle } from 'lucide-react';
import { useNotes } from './hooks/useNotes';
import { useTags } from './hooks/useTags';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { TagManager } from './components/TagManager';
import { ShortcutHelp } from './components/ShortcutHelp';
import { Toast } from './components/Toast';
import { AmbientBackground } from './components/AmbientBackground';
import { ToastMessage } from './types';

function App() {
  const {
    notes,
    activeNote,
    activeNoteId,
    setActiveNoteId,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    viewFilter,
    setViewFilter,
    selectedTag,
    setSelectedTag,
    filteredNotes,
    noteCount,
    createNote,
    updateNote,
    deleteNote,
    duplicateNote,
    togglePin,
    toggleComplete,
    archiveNote,
    restoreNote,
    addTagToNote,
    removeTagFromNote,
  } = useNotes();

  const {
    tags,
    isManagerOpen,
    setIsManagerOpen,
    createTag,
    updateTag,
    deleteTag,
    getTagColor,
    getTagName,
    tagColors,
  } = useTags();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast_${Date.now()}`;
    const newToast: ToastMessage = { id, message, type, duration: 3000 };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N: New note
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        createNote();
        addToast('New note created', 'success');
      }
      
      // Ctrl+F: Focus search
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search notes..."]') as HTMLInputElement;
        searchInput?.focus();
      }
      
      // ?: Show shortcuts
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        const activeElement = document.activeElement;
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA' && !(activeElement as HTMLElement)?.isContentEditable) {
          setShortcutHelpOpen(true);
        }
      }
      
      // Escape: Close modals
      if (e.key === 'Escape') {
        setShortcutHelpOpen(false);
        setIsManagerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createNote, addToast, setIsManagerOpen]);

  const handleCreateNote = () => {
    createNote();
    addToast('New note created', 'success');
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    addToast('Note deleted', 'warning');
  };

  const handleArchiveNote = (id: string) => {
    archiveNote(id);
    addToast('Note archived', 'info');
  };

  const handleRestoreNote = (id: string) => {
    restoreNote(id);
    addToast('Note restored', 'success');
  };

  const handleDuplicateNote = (id: string) => {
    duplicateNote(id);
    addToast('Note duplicated', 'success');
  };

  const handleTogglePin = (id: string) => {
    togglePin(id);
    const note = notes.find(n => n.id === id);
    addToast(note?.isPinned ? 'Note unpinned' : 'Note pinned', 'info');
  };

  const handleToggleComplete = (id: string) => {
    toggleComplete(id);
    const note = notes.find(n => n.id === id);
    addToast(note?.isCompleted ? 'Marked incomplete' : 'Marked complete', 'success');
  };

  return (
    <div className="h-screen flex overflow-hidden text-white/90">
      <AmbientBackground />
      
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-navy-900/80 backdrop-blur border border-white/10 text-white/60"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <Sidebar
        notes={filteredNotes}
        activeNoteId={activeNoteId}
        tags={tags}
        searchQuery={searchQuery}
        sortBy={sortBy}
        viewFilter={viewFilter}
        selectedTag={selectedTag}
        noteCount={noteCount}
        onSelectNote={(id) => {
          setActiveNoteId(id);
          setSidebarOpen(false);
        }}
        onCreateNote={handleCreateNote}
        onSearchChange={setSearchQuery}
        onSortChange={setSortBy}
        onViewFilterChange={setViewFilter}
        onTagSelect={setSelectedTag}
        onDeleteNote={handleDeleteNote}
        onTogglePin={handleTogglePin}
        onToggleComplete={handleToggleComplete}
        onArchive={handleArchiveNote}
        onRestore={handleRestoreNote}
        onDuplicate={handleDuplicateNote}
        getTagColor={getTagColor}
        getTagName={getTagName}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Editor */}
      <Editor
        note={activeNote}
        tags={tags}
        onUpdateNote={updateNote}
        onDeleteNote={handleDeleteNote}
        onArchiveNote={handleArchiveNote}
        onRestoreNote={handleRestoreNote}
        onDuplicateNote={handleDuplicateNote}
        onTogglePin={handleTogglePin}
        onToggleComplete={handleToggleComplete}
        onAddTag={addTagToNote}
        onRemoveTag={removeTagFromNote}
        getTagColor={getTagColor}
        getTagName={getTagName}
        onCreateTag={createTag}
        allTags={tags}
        onBack={() => setSidebarOpen(true)}
      />

      {/* Tag Manager Button */}
      <button
        onClick={() => setIsManagerOpen(true)}
        className="fixed bottom-20 right-4 z-50 p-3 rounded-full bg-navy-900/80 backdrop-blur border border-white/10 text-white/60 hover:text-white/90 hover:bg-white/10 transition-colors shadow-lg"
        title="Manage Tags"
      >
        <TagIcon className="w-5 h-5" />
      </button>

      {/* Shortcut Help Button */}
      <button
        onClick={() => setShortcutHelpOpen(true)}
        className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-navy-900/80 backdrop-blur border border-white/10 text-white/60 hover:text-white/90 hover:bg-white/10 transition-colors shadow-lg"
        title="Keyboard Shortcuts"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {/* Modals */}
      <TagManager
        tags={tags}
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        onCreateTag={createTag}
        onUpdateTag={updateTag}
        onDeleteTag={deleteTag}
        tagColors={tagColors}
      />

      <ShortcutHelp
        isOpen={shortcutHelpOpen}
        onClose={() => setShortcutHelpOpen(false)}
      />

      {/* Toasts */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
