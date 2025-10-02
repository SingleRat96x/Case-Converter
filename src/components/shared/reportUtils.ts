import { calculateExtendedTextStats } from './TextCounterAnalytics';
import { calculateWordFrequencyStats } from './WordFrequencyAnalytics';

export interface ReportI18n {
  reportTitle: string;
  generatedAt: string;
  summary: string;
  originalText: string;
  analytics: {
    characters: string;
    charactersNoSpaces: string;
    words: string;
    sentences: string;
    lines: string;
    paragraphs: string;
    readingTime: string;
    speakingTime: string;
    readingTimeUnit: string;
    speakingTimeUnit: string;
  };
}

export interface WordFrequencyReportI18n {
  reportTitle: string;
  generatedAt: string;
  summary: string;
  originalText: string;
  topWordsTitle: string;
  analytics: {
    totalWords: string;
    uniqueWords: string;
    mostCommonWord: string;
    averageWordLength: string;
    rank: string;
    word: string;
    count: string;
    percentage: string;
  };
}

export function buildTextAnalysisReport(text: string, i18n: ReportI18n, baseUrl?: string): string {
  const stats = calculateExtendedTextStats(text);
  const timestamp = new Date().toISOString();

  const lines: string[] = [];
  lines.push(i18n.reportTitle);
  lines.push('='.repeat(i18n.reportTitle.length));
  lines.push(`${i18n.generatedAt}: ${timestamp}`);
  if (baseUrl) {
    lines.push(`URL: ${baseUrl}`);
  }
  lines.push('');

  lines.push(i18n.summary);
  lines.push('-'.repeat(i18n.summary.length));
  lines.push(`${i18n.analytics.characters}: ${stats.characters}`);
  lines.push(`${i18n.analytics.charactersNoSpaces}: ${stats.charactersNoSpaces}`);
  lines.push(`${i18n.analytics.words}: ${stats.words}`);
  lines.push(`${i18n.analytics.sentences}: ${stats.sentences}`);
  lines.push(`${i18n.analytics.lines}: ${stats.lines}`);
  lines.push(`${i18n.analytics.paragraphs}: ${stats.paragraphs}`);
  lines.push(`${i18n.analytics.readingTime}: ${stats.readingTime} ${i18n.analytics.readingTimeUnit}`);
  lines.push(`${i18n.analytics.speakingTime}: ${stats.speakingTime} ${i18n.analytics.speakingTimeUnit}`);
  lines.push('');

  lines.push(i18n.originalText);
  lines.push('-'.repeat(i18n.originalText.length));
  lines.push(text && text.length > 0 ? text : '(empty)');
  lines.push('');

  return lines.join('\n');
}

export function buildWordFrequencyReport(text: string, i18n: WordFrequencyReportI18n, baseUrl?: string): string {
  const stats = calculateWordFrequencyStats(text, { minWordLength: 1, caseSensitive: false });
  const timestamp = new Date().toISOString();

  const lines: string[] = [];
  lines.push(i18n.reportTitle);
  lines.push('='.repeat(i18n.reportTitle.length));
  lines.push(`${i18n.generatedAt}: ${timestamp}`);
  if (baseUrl) {
    lines.push(`URL: ${baseUrl}`);
  }
  lines.push('');

  lines.push(i18n.summary);
  lines.push('-'.repeat(i18n.summary.length));
  lines.push(`${i18n.analytics.totalWords}: ${stats.totalWords}`);
  lines.push(`${i18n.analytics.uniqueWords}: ${stats.uniqueWords}`);
  lines.push(`${i18n.analytics.mostCommonWord}: "${stats.mostCommonWord}" (${stats.mostCommonCount})`);
  lines.push(`${i18n.analytics.averageWordLength}: ${stats.averageWordLength} chars`);
  lines.push('');

  if (stats.frequencies.length > 0) {
    lines.push(i18n.topWordsTitle);
    lines.push('-'.repeat(i18n.topWordsTitle.length));
    lines.push(`${i18n.analytics.rank.padEnd(4)} ${i18n.analytics.word.padEnd(20)} ${i18n.analytics.count.padEnd(8)} ${i18n.analytics.percentage}`);
    lines.push('-'.repeat(60));
    
    const topWords = stats.frequencies.slice(0, 50); // Show top 50 words in report
    topWords.forEach((freq, index) => {
      const rank = (index + 1).toString().padEnd(4);
      const word = freq.word.padEnd(20);
      const count = freq.count.toString().padEnd(8);
      const percentage = `${freq.percentage.toFixed(2)}%`;
      lines.push(`${rank} ${word} ${count} ${percentage}`);
    });
    lines.push('');
  }

  lines.push(i18n.originalText);
  lines.push('-'.repeat(i18n.originalText.length));
  lines.push(text && text.length > 0 ? text : '(empty)');
  lines.push('');

  return lines.join('\n');
}


