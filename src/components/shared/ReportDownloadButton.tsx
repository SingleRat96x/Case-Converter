'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { downloadTextAsFile } from '@/lib/utils';
import { calculateExtendedTextStats } from './TextCounterAnalytics';

interface ReportDownloadButtonProps {
  text: string;
  fileName: string;
  /** Localized button label, e.g. "Download Report" */
  label: string;
  /** Localized strings for report structure and analytics labels */
  i18n: {
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
      readingTimeUnit: string; // e.g. "min"
      speakingTimeUnit: string; // e.g. "min"
    };
  };
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  className?: string;
}

export function ReportDownloadButton({
  text,
  fileName,
  label,
  i18n,
  variant = 'outline',
  className = ''
}: ReportDownloadButtonProps) {
  const handleDownloadReport = () => {
    const stats = calculateExtendedTextStats(text);
    const timestamp = new Date().toISOString();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

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

    const report = lines.join('\n');
    downloadTextAsFile(report, fileName);
  };

  return (
    <Button onClick={handleDownloadReport} variant={variant} className={`flex items-center gap-2 ${className}`}>
      <FileDown className="h-4 w-4" />
      {label}
    </Button>
  );
}

export default ReportDownloadButton;


