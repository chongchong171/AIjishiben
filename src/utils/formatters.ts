export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes === 0 ? 'Just now' : `${minutes}m ago`;
    }
    return `${hours}h ago`;
  }
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function formatFullDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getWordCount(text: string): number {
  const plainText = text.replace(/<[^>]*>/g, ' ').trim();
  return plainText.split(/\s+/).filter(w => w.length > 0).length;
}

export function getCharCount(text: string): number {
  return text.replace(/<[^>]*>/g, '').length;
}

export function getReadingTime(wordCount: number): string {
  const minutes = Math.ceil(wordCount / 200);
  return minutes <= 1 ? '< 1 min read' : `${minutes} min read`;
}
