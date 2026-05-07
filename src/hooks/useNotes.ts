import { useState, useCallback, useMemo } from 'react';
import { Note, Tag, SortOption, ViewFilter } from '../types';
import { useLocalStorage } from './useLocalStorage';

const generateId = () => `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const createEmptyNote = (): Note => ({
  id: generateId(),
  title: '',
  content: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  tags: [],
  isPinned: false,
  isCompleted: false,
  isArchived: false,
  color: null,
});

export function useNotes() {
  const [notes, setNotes] = useLocalStorage<Note[]>('ai-notebook-notes', []);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const activeNote = useMemo(() => 
    notes.find(n => n.id === activeNoteId) || null,
    [notes, activeNoteId]
  );

  const createNote = useCallback(() => {
    const newNote = createEmptyNote();
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    return newNote.id;
  }, [setNotes]);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: Date.now() }
        : note
    ));
  }, [setNotes]);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  }, [setNotes, activeNoteId]);

  const duplicateNote = useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    
    const newNote: Note = {
      ...note,
      id: generateId(),
      title: `${note.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPinned: false,
      isCompleted: false,
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  }, [notes, setNotes]);

  const togglePin = useCallback((id: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, isPinned: !note.isPinned, updatedAt: Date.now() } : note
    ));
  }, [setNotes]);

  const toggleComplete = useCallback((id: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, isCompleted: !note.isCompleted, updatedAt: Date.now() } : note
    ));
  }, [setNotes]);

  const archiveNote = useCallback((id: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, isArchived: true, updatedAt: Date.now() } : note
    ));
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  }, [setNotes, activeNoteId]);

  const restoreNote = useCallback((id: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, isArchived: false, updatedAt: Date.now() } : note
    ));
  }, [setNotes]);

  const addTagToNote = useCallback((noteId: string, tagId: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId && !note.tags.includes(tagId)
        ? { ...note, tags: [...note.tags, tagId], updatedAt: Date.now() }
        : note
    ));
  }, [setNotes]);

  const removeTagFromNote = useCallback((noteId: string, tagId: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId
        ? { ...note, tags: note.tags.filter(t => t !== tagId), updatedAt: Date.now() }
        : note
    ));
  }, [setNotes]);

  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Apply view filter
    switch (viewFilter) {
      case 'active':
        filtered = filtered.filter(n => !n.isArchived && !n.isCompleted);
        break;
      case 'completed':
        filtered = filtered.filter(n => n.isCompleted && !n.isArchived);
        break;
      case 'archived':
        filtered = filtered.filter(n => n.isArchived);
        break;
      default:
        filtered = filtered.filter(n => !n.isArchived);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) || 
        n.content.toLowerCase().includes(query)
      );
    }

    // Apply tag filter
    if (selectedTag) {
      filtered = filtered.filter(n => n.tags.includes(selectedTag));
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      switch (sortBy) {
        case 'created':
          return b.createdAt - a.createdAt;
        case 'updated':
          return b.updatedAt - a.updatedAt;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return sorted;
  }, [notes, searchQuery, sortBy, viewFilter, selectedTag]);

  const noteCount = useMemo(() => ({
    all: notes.filter(n => !n.isArchived).length,
    active: notes.filter(n => !n.isArchived && !n.isCompleted).length,
    completed: notes.filter(n => n.isCompleted && !n.isArchived).length,
    archived: notes.filter(n => n.isArchived).length,
  }), [notes]);

  return {
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
  };
}
