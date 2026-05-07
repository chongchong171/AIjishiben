export function autoFormatText(text: string): string {
  let formatted = text;

  // Remove extra whitespace
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  formatted = formatted.replace(/[ \t]+/g, ' ');

  // Fix sentence spacing
  formatted = formatted.replace(/([.!?])\s*([A-Z])/g, '$1 $2');

  // Trim lines
  formatted = formatted.split('\n').map(line => line.trim()).join('\n');

  // Capitalize first letter of sentences
  formatted = formatted.replace(/(^|[.!?]\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase());

  // Wrap in paragraphs if not already HTML
  if (!formatted.includes('<')) {
    const paragraphs = formatted.split('\n\n').filter(p => p.trim());
    formatted = paragraphs.map(p => `<p>${p}</p>`).join('\n');
  }

  return formatted;
}

export function summarizeText(text: string): string[] {
  const plainText = text.replace(/<[^>]*>/g, ' ').trim();
  if (!plainText) return [];

  // Split into sentences
  const sentences = plainText.match(/[^.!?]+[.!?]+/g) || [plainText];
  
  if (sentences.length <= 3) {
    return sentences.map(s => s.trim()).filter(s => s.length > 10);
  }

  // Simple extractive summarization: score sentences by word frequency
  const words = plainText.toLowerCase().match(/\b\w+\b/g) || [];
  const wordFreq: Record<string, number> = {};
  
  words.forEach(word => {
    if (word.length > 3) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  // Score each sentence
  const scored = sentences.map((sentence, index) => {
    const sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || [];
    const score = sentenceWords.reduce((sum, word) => sum + (wordFreq[word] || 0), 0);
    // Boost first and last sentences
    const positionBoost = index === 0 || index === sentences.length - 1 ? 2 : 1;
    return { sentence: sentence.trim(), score: score * positionBoost, index };
  });

  // Sort by score and pick top sentences, maintaining original order
  const topCount = Math.max(2, Math.min(5, Math.ceil(sentences.length * 0.3)));
  const topSentences = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topCount)
    .sort((a, b) => a.index - b.index);

  return topSentences.map(s => s.sentence).filter(s => s.length > 10);
}

export function extractKeywords(text: string, maxKeywords: number = 10): string[] {
  const plainText = text.replace(/<[^>]*>/g, ' ').toLowerCase();
  
  // Common stop words
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
    'from', 'as', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'between', 'under', 'and', 'but', 'or', 'yet',
    'so', 'if', 'because', 'although', 'though', 'while', 'where',
    'when', 'that', 'which', 'who', 'whom', 'whose', 'what', 'this',
    'these', 'those', 'i', 'me', 'my', 'mine', 'myself', 'you', 'your',
    'yours', 'yourself', 'he', 'him', 'his', 'himself', 'she', 'her',
    'hers', 'herself', 'it', 'its', 'itself', 'we', 'us', 'our', 'ours',
    'ourselves', 'they', 'them', 'their', 'theirs', 'themselves',
    'one', 'ones', 'all', 'any', 'both', 'each', 'few', 'more', 'most',
    'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
    'than', 'too', 'very', 'just', 'now', 'then', 'here', 'there',
    'once', 'again', 'further', 'also', 'get', 'like', 'make', 'way',
    'time', 'know', 'take', 'see', 'come', 'think', 'say', 'look',
    'want', 'give', 'use', 'find', 'tell', 'ask', 'work', 'seem',
    'feel', 'try', 'leave', 'call', 'good', 'new', 'first', 'last',
    'long', 'great', 'little', 'own', 'other', 'old', 'right', 'big',
    'high', 'different', 'small', 'large', 'next', 'early', 'young',
    'important', 'few', 'public', 'bad', 'same', 'able',
  ]);

  const words = plainText.match(/\b\w+\b/g) || [];
  const freq: Record<string, number> = {};

  words.forEach(word => {
    if (word.length > 3 && !stopWords.has(word) && !/^\d+$/.test(word)) {
      freq[word] = (freq[word] || 0) + 1;
    }
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

export function suggestTagsFromContent(content: string, existingTags: string[]): string[] {
  const keywords = extractKeywords(content, 15);
  const lowerExisting = existingTags.map(t => t.toLowerCase());
  
  return keywords.filter(kw => 
    !lowerExisting.includes(kw.toLowerCase()) &&
    kw.length > 3
  ).slice(0, 5);
}
