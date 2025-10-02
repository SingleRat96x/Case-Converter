'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FeedbackMessage } from '@/components/shared/FeedbackMessage';
import { useToolTranslations, useCommonTranslations } from '@/lib/i18n/hooks';
import { copyToClipboard, downloadAsFile, getAsciiStats } from '@/lib/asciiUtils';
import { Copy, Download, FileText, BarChart3, Eye, Code2 } from 'lucide-react';

interface AsciiOutputProps {
  ascii: string;
  stats?: {
    lines: number;
    characters: number;
    originalText?: string;
    font?: string;
    fileName?: string;
  } | null;
  className?: string;
}

export function AsciiOutput({ ascii, stats, className = '' }: AsciiOutputProps) {
  const { tool } = useToolTranslations('tools/miscellaneous');
  const { tSync: common } = useCommonTranslations();
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!ascii) return;

    try {
      const success = await copyToClipboard(ascii);
      if (success) {
        setFeedback({
          message: tool('asciiArtGenerator.output.copySuccess'),
          type: 'success'
        });
      } else {
        setFeedback({
          message: tool('asciiArtGenerator.output.copyError'),
          type: 'error'
        });
      }
    } catch {
      setFeedback({
        message: tool('asciiArtGenerator.output.copyError'),
        type: 'error'
      });
    }

    setTimeout(() => setFeedback(null), 3000);
  }, [ascii, tool]);

  const handleDownload = useCallback(() => {
    if (!ascii) return;

    const filename = tool('asciiArtGenerator.output.downloadFileName');
    downloadAsFile(ascii, filename);
    
    setFeedback({
      message: 'ASCII art downloaded successfully!',
      type: 'success'
    });
    
    setTimeout(() => setFeedback(null), 3000);
  }, [ascii, tool]);


  const asciiStats = ascii ? getAsciiStats(ascii) : null;

  const dataStats: Array<{
    key: string;
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = [];
  
  if (asciiStats) {
    dataStats.push(
      {
        key: 'lines',
        label: tool('asciiArtGenerator.stats.lines'),
        value: asciiStats.lines.toString(),
        icon: FileText,
        color: 'text-blue-600 dark:text-blue-400'
      },
      {
        key: 'characters',
        label: tool('asciiArtGenerator.stats.characters'),
        value: asciiStats.characters.toString(),
        icon: Code2,
        color: 'text-green-600 dark:text-green-400'
      },
      {
        key: 'maxLineLength',
        label: tool('asciiArtGenerator.stats.maxLineLength'),
        value: asciiStats.maxLineLength.toString(),
        icon: BarChart3,
        color: 'text-purple-600 dark:text-purple-400'
      },
      {
        key: 'avgLineLength',
        label: tool('asciiArtGenerator.stats.avgLineLength'),
        value: asciiStats.avgLineLength.toString(),
        icon: BarChart3,
        color: 'text-orange-600 dark:text-orange-400'
      }
    );
  }

  if (stats) {
    if (stats.font) {
      dataStats.unshift({
        key: 'font',
        label: 'Font',
        value: stats.font.charAt(0).toUpperCase() + stats.font.slice(1),
        icon: FileText,
        color: 'text-indigo-600 dark:text-indigo-400'
      });
    }
    
    if (stats.fileName) {
      dataStats.unshift({
        key: 'source',
        label: 'Source',
        value: stats.fileName,
        icon: FileText,
        color: 'text-slate-600 dark:text-slate-400'
      });
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Output Display */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {tool('asciiArtGenerator.output.label')}
            </h3>
            
            {ascii && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {showPreview ? 'Edit View' : tool('asciiArtGenerator.output.previewLabel')}
                </Button>
              </div>
            )}
          </div>

          {/* ASCII Art Display */}
          <div className="relative">
            {ascii ? (
              <div className="space-y-3">
                {showPreview ? (
                  /* Preview Mode - formatted display */
                  <div className="bg-background border border-border rounded-lg p-6 overflow-auto">
                    <pre className="font-mono text-sm leading-tight text-foreground whitespace-pre">
                      {ascii}
                    </pre>
                  </div>
                ) : (
                  /* Edit Mode - textarea for easy copying */
                  <textarea
                    value={ascii}
                    readOnly
                    className="w-full h-64 sm:h-80 p-4 font-mono text-sm leading-tight bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    style={{ 
                      tabSize: 1,
                      whiteSpace: 'pre',
                      overflowWrap: 'normal'
                    }}
                  />
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleCopy}
                    variant="default"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    {common('buttons.copy')}
                  </Button>
                  
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {common('buttons.download')}
                  </Button>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                  <p className="text-muted-foreground">
                    {tool('asciiArtGenerator.output.placeholder')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>


      {/* Feedback Message */}
      {feedback && (
        <FeedbackMessage
          feedback={feedback}
        />
      )}
    </div>
  );
}