import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Palette, Trash2, Edit2, Check } from 'lucide-react';
import { Tag } from '../types';

interface TagManagerProps {
  tags: Tag[];
  isOpen: boolean;
  onClose: () => void;
  onCreateTag: (name: string, color?: string) => string;
  onUpdateTag: (id: string, updates: Partial<Tag>) => void;
  onDeleteTag: (id: string) => void;
  tagColors: string[];
}

export const TagManager: React.FC<TagManagerProps> = ({
  tags,
  isOpen,
  onClose,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  tagColors,
}) => {
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(tagColors[0]);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleCreate = () => {
    if (newTagName.trim()) {
      onCreateTag(newTagName.trim(), selectedColor);
      setNewTagName('');
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag.id);
    setEditName(tag.name);
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      onUpdateTag(id, { name: editName.trim() });
    }
    setEditingTag(null);
  };

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
            className="bg-navy-900 border border-white/10 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white/90">Manage Tags</h2>
              <button onClick={onClose} className="text-white/40 hover:text-white/60">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Create New Tag */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="New tag name..."
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:border-white/20"
                />
                <button
                  onClick={handleCreate}
                  disabled={!newTagName.trim()}
                  className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {tagColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      selectedColor === color ? 'border-white/60 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Tag List */}
            <div className="flex-1 overflow-y-auto p-4">
              {tags.length === 0 ? (
                <div className="text-center py-8 text-white/30">
                  <Palette className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No tags yet. Create one above.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      {editingTag === tag.id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(tag.id)}
                            className="flex-1 px-2 py-1 rounded bg-white/10 text-sm text-white/80 outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(tag.id)}
                            className="text-emerald-400 hover:text-emerald-300"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="flex-1 text-sm text-white/80">{tag.name}</span>
                          <button
                            onClick={() => handleEdit(tag)}
                            className="text-white/30 hover:text-white/60 p-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(tag.id)}
                            className="text-white/30 hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Delete Confirmation */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-navy-950/95 rounded-xl flex items-center justify-center p-4"
                >
                  <div className="text-center">
                    <Trash2 className="w-8 h-8 text-red-400 mx-auto mb-3" />
                    <p className="text-sm text-white/70 mb-4">
                      Delete "{tags.find(t => t.id === showDeleteConfirm)?.name}"?
                    </p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-4 py-2 rounded-lg bg-white/5 text-sm text-white/60 hover:bg-white/10"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          onDeleteTag(showDeleteConfirm);
                          setShowDeleteConfirm(null);
                        }}
                        className="px-4 py-2 rounded-lg bg-red-500/20 text-sm text-red-400 hover:bg-red-500/30"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
