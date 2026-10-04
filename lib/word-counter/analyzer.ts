import { TextAnalysisStats, WordFrequencyItem } from '@/types';

// Standard English stop words for optional frequency filtering
export const COMMON_STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing',
  'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t',
  'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers',
  'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if',
  'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most',
  'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d',
  'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s',
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they',
  'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under',
  'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were',
  'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who',
  'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d',
  'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

export function formatDuration(minutes: number): string {
  if (minutes < 0.1) return '< 1 min';
  if (minutes < 1) {
    const seconds = Math.round(minutes * 60);
    return `${seconds} sec`;
  }
  const fullMin = Math.floor(minutes);
  const remainingSec = Math.round((minutes - fullMin) * 60);
  if (remainingSec === 0) {
    return `${fullMin} min`;
  }
  return `${fullMin} min ${remainingSec}s`;
}

export function analyzeText(rawText: string): TextAnalysisStats {
  if (!rawText || rawText.trim().length === 0) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      letters: 0,
      numbers: 0,
      spaces: 0,
      punctuation: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
      avgWordLength: 0,
      avgSentenceLength: 0,
      longestWord: '',
      shortestWord: '',
      uniqueWords: 0,
      repeatedWords: 0,
      readingTimeMinutes: 0,
      readingTimeDisplay: '0 min',
      speakingTimeMinutes: 0,
      speakingTimeDisplay: '0 min',
      frequency: []
    };
  }

  const text = rawText;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const spaces = (text.match(/\s/g) || []).length;
  const letters = (text.match(/[a-zA-Z\p{L}]/gu) || []).length;
  const numbers = (text.match(/[0-9]/g) || []).length;
  const punctuation = (text.match(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g) || []).length;

  // Lines
  const lines = text.split(/\r\n|\r|\n/).length;

  // Paragraphs: non-empty chunks separated by empty lines or returns
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0).length || 1;

  // Sentences: separated by ., !, ? followed by space or end of string
  const sentenceMatches = text
    .trim()
    .split(/[.!?]+(?:\s+|$)/)
    .filter(s => s.trim().length > 0);
  const sentences = Math.max(sentenceMatches.length, 1);

  // Words extraction
  // Matches unicode letters, apostrophes inside words (e.g. don't), hyphens inside words
  const rawWordMatches = text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) || [];
  const words = rawWordMatches.length;

  // Word frequency map and length metrics
  const frequencyMap = new Map<string, number>();
  let totalWordLetters = 0;
  let longest = '';
  let shortest = rawWordMatches[0] || '';

  rawWordMatches.forEach(w => {
    const cleanWord = w.toLowerCase();
    totalWordLetters += cleanWord.length;

    if (cleanWord.length > longest.length) {
      longest = cleanWord;
    }
    if (shortest.length === 0 || cleanWord.length < shortest.length) {
      shortest = cleanWord;
    }

    const current = frequencyMap.get(cleanWord) || 0;
    frequencyMap.set(cleanWord, current + 1);
  });

  const uniqueWords = frequencyMap.size;
  let repeatedWords = 0;
  frequencyMap.forEach(count => {
    if (count > 1) repeatedWords++;
  });

  const avgWordLength = words > 0 ? Number((totalWordLetters / words).toFixed(1)) : 0;
  const avgSentenceLength = sentences > 0 ? Number((words / sentences).toFixed(1)) : 0;

  // Sort frequency descending
  const sortedFrequency: WordFrequencyItem[] = Array.from(frequencyMap.entries())
    .map(([word, count]) => ({
      word,
      count,
      percentage: words > 0 ? Number(((count / words) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.count - a.count);

  // Reading time based on average adult reading speed of 225 wpm
  const readingTimeMinutes = words > 0 ? words / 225 : 0;
  // Speaking time based on average speaking pace of 130 wpm
  const speakingTimeMinutes = words > 0 ? words / 130 : 0;

  return {
    words,
    characters,
    charactersNoSpaces,
    letters,
    numbers,
    spaces,
    punctuation,
    sentences,
    paragraphs,
    lines,
    avgWordLength,
    avgSentenceLength,
    longestWord: longest,
    shortestWord: shortest,
    uniqueWords,
    repeatedWords,
    readingTimeMinutes,
    readingTimeDisplay: formatDuration(readingTimeMinutes),
    speakingTimeMinutes,
    speakingTimeDisplay: formatDuration(speakingTimeMinutes),
    frequency: sortedFrequency
  };
}
