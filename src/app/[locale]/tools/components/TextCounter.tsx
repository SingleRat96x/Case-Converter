'use client';

import { useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ToolLayout,
  TextAreaSection,
  SingleColumnLayout,
  ActionSection,
} from '@/lib/shared/ToolLayout';
import {
  TextAnalytics,
  useTextStats,
  type TextStats,
} from '@/app/components/shared/TextAnalytics';
import AdSpace from '../components/AdSpace';

export default function TextCounter() {
  const [inputText, setInputText] = useState('');
  const [stats, setStats] = useState<TextStats>({});
  const { calculateStats } = useTextStats();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    setStats(calculateStats(newText));
  };

  const handleCopy = () => {
    const statsText = `Text Statistics:
Characters: ${stats.characters}
Characters (no spaces): ${stats.charactersNoSpaces}
Words: ${stats.words}
Unique Words: ${stats.uniqueWords}
Sentences: ${stats.sentences}
Paragraphs: ${stats.paragraphs}
Lines: ${stats.lines}
Reading Time: ${stats.readingTime} minute${stats.readingTime !== 1 ? 's' : ''}`;

    navigator.clipboard.writeText(statsText);
  };

  const handleClear = () => {
    setInputText('');
    setStats({});
  };

  return (
    <ToolLayout>
      <SingleColumnLayout>
        <TextAreaSection
          title="Input Text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Enter your text here to analyze..."
        />

        {/* Ad Space */}
        <AdSpace position="middle" />

        {/* Statistics Display */}
        <Card className="w-full shadow-sm border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">
              Text Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <TextAnalytics stats={stats} mode="grid" />
          </CardContent>
        </Card>
      </SingleColumnLayout>

      {/* Action Buttons */}
      <ActionSection>
        <Button
          onClick={handleCopy}
          className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Statistics
        </Button>
        <Button
          onClick={handleClear}
          variant="outline"
          className="px-6 py-2.5 border-border hover:bg-accent"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </ActionSection>
    </ToolLayout>
  );
}
