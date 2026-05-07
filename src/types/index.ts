export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  isPinned: boolean;
  isCompleted: boolean;
  isArchived: boolean;
  color: string | null;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export type SortOption = 'created' | 'updated' | 'title';

export type ViewFilter = 'all' | 'active' | 'completed' | 'archived';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}
