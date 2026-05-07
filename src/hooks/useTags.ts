import { useState, useCallback } from 'react';
import { Tag } from '../types';
import { useLocalStorage } from './useLocalStorage';

const TAG_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef',
  '#f43f5e', '#78716c',
];

const generateId = () => `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export function useTags() {
  const [tags, setTags] = useLocalStorage<Tag[]>('ai-notebook-tags', []);
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  const createTag = useCallback((name: string, color?: string) => {
    const newTag: Tag = {
      id: generateId(),
      name: name.trim(),
      color: color || TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)],
    };
    setTags(prev => [...prev, newTag]);
    return newTag.id;
  }, [setTags]);

  const updateTag = useCallback((id: string, updates: Partial<Tag>) => {
    setTags(prev => prev.map(tag => 
      tag.id === id ? { ...tag, ...updates } : tag
    ));
  }, [setTags]);

  const deleteTag = useCallback((id: string) => {
    setTags(prev => prev.filter(tag => tag.id !== id));
  }, [setTags]);

  const getTagById = useCallback((id: string) => {
    return tags.find(tag => tag.id === id);
  }, [tags]);

  const getTagColor = useCallback((id: string) => {
    return tags.find(tag => tag.id === id)?.color || '#6b7280';
  }, [tags]);

  const getTagName = useCallback((id: string) => {
    return tags.find(tag => tag.id === id)?.name || 'Unknown';
  }, [tags]);

  const suggestTags = useCallback((content: string): string[] => {
    const lowerContent = content.toLowerCase();
    return tags
      .filter(tag => lowerContent.includes(tag.name.toLowerCase()))
      .map(tag => tag.id);
  }, [tags]);

  return {
    tags,
    isManagerOpen,
    setIsManagerOpen,
    createTag,
    updateTag,
    deleteTag,
    getTagById,
    getTagColor,
    getTagName,
    suggestTags,
    tagColors: TAG_COLORS,
  };
}
