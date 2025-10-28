'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { 
  extractEmails, 
  analyzeEmailPatterns,
  type EmailExtractionOptions,
  type EmailExtractionResult
} from '@/lib/emailUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CheckCircle, 
  XCircle, 
  Mail, 
  Globe,
  Filter,
  HelpCircle,
  Target,
  Percent,
  AlertTriangle
} from 'lucide-react';

export function EmailExtractor() {
  const { common, tool } = useToolTranslations('tools/text-generators');
  const [text, setText] = useState('');
  const [extractionOptions, setExtractionOptions] = useState<EmailExtractionOptions>({
    mode: 'comprehensive',
    removeDuplicates: true,
    sortBy: 'alphabetical',
    sortOrder: 'asc',
    validateEmails: true
  });
  const [isAccordionOpen, setIsAccordionOpen] = useState(false); // Closed by default on mobile
  const [error, setError] = useState<string | null>(null);

  // Memoized email extraction result
  const extractionResult: EmailExtractionResult = useMemo(() => {
    try {
      return extractEmails(text, extractionOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Email extraction failed');
      return {
        emails: [],
        totalCount: 0,
        uniqueCount: 0,
        validCount: 0,
        invalidCount: 0,
        domains: {},
        duplicates: []
      };
    }
  }, [text, extractionOptions]);

  // Memoized pattern analysis
  const patternAnalysis = useMemo(() => {
    return analyzeEmailPatterns(extractionResult.emails);
  }, [extractionResult.emails]);

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
    setError(null);
  }, []);

  const handleFileUploaded = useCallback((content: string) => {
    setText(content);
    setError(null);
  }, []);

  const updateExtractionOption = useCallback(<K extends keyof EmailExtractionOptions>(
    key: K,
    value: EmailExtractionOptions[K]
  ) => {
    setExtractionOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  // Generate the extracted emails display
  const extractedEmailsDisplay = useMemo(() => {
    if (extractionResult.emails.length === 0) {
      return tool('extractEmails.noEmailsFound');
    }
    return extractionResult.emails.map(e => e.email).join('\n');
  }, [extractionResult.emails, tool]);

  // Handle responsive accordion behavior - closed by default on mobile
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) { // sm breakpoint
        setIsAccordionOpen(true);
      } else {
        setIsAccordionOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <TooltipProvider>
      <BaseTextConverter
        title={tool('extractEmails.title')}
        description={tool('extractEmails.description')}
        inputLabel={common('labels.inputText')}
        outputLabel={tool('extractEmails.outputLabel')}
        inputPlaceholder={tool('extractEmails.inputPlaceholder')}
        copyText={common('buttons.copy')}
        clearText={common('buttons.clear')}
        downloadText={common('buttons.download')}
        uploadText={common('buttons.upload')}
        uploadDescription=""
        downloadFileName={tool('extractEmails.downloadFileName')}
        useMonoFont={true}
        onTextChange={handleTextChange}
        text={text}
        convertedText={extractedEmailsDisplay}
        onConvertedTextUpdate={() => {}}
        onFileUploaded={handleFileUploaded}
        showAnalytics={false}
        mobileLayout="2x2"
      >
        <div className="space-y-3">

          {/* Email Extraction Options Accordion */}
          <Accordion className="w-full">
            <AccordionItem 
              title={tool('extractEmails.extractionOptions')}
              defaultOpen={isAccordionOpen}
              className="w-full"
            >
              <div className="space-y-4">
                {/* Sort By */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">{tool('extractEmails.sortBy')}</label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">{tool('extractEmails.sortTooltip')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select
                    value={extractionOptions.sortBy}
                    onValueChange={(value: EmailExtractionOptions['sortBy']) => 
                      updateExtractionOption('sortBy', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alphabetical">{tool('extractEmails.sortOptions.alphabetical')}</SelectItem>
                      <SelectItem value="domain">{tool('extractEmails.sortOptions.domain')}</SelectItem>
                      <SelectItem value="position">{tool('extractEmails.sortOptions.position')}</SelectItem>
                      <SelectItem value="validity">{tool('extractEmails.sortOptions.validity')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Processing Options Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <Filter className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold text-foreground">{tool('extractEmails.sections.processing')}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <div className="flex items-center gap-2">
                        <label htmlFor="remove-duplicates" className="text-sm font-medium cursor-pointer flex-1">
                          {tool('extractEmails.removeDuplicates')}
                        </label>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs text-xs">{tool('extractEmails.duplicatesTooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Switch
                        id="remove-duplicates"
                        checked={extractionOptions.removeDuplicates}
                        onCheckedChange={(checked) => updateExtractionOption('removeDuplicates', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <div className="flex items-center gap-2">
                        <label htmlFor="validate-emails" className="text-sm font-medium cursor-pointer flex-1">
                          {tool('extractEmails.validateEmails')}
                        </label>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs text-xs">{tool('extractEmails.validationTooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Switch
                        id="validate-emails"
                        checked={extractionOptions.validateEmails}
                        onCheckedChange={(checked) => updateExtractionOption('validateEmails', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AccordionItem>
          </Accordion>

          {/* Error Display */}
          {error && (
            <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
              <XCircle className="h-3 w-3 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Email Extraction Analytics */}
          {text && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow">
                <Mail className="h-4 w-4 mb-1 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-foreground">
                  {extractionResult.totalCount.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground text-center">{tool('extractEmails.stats.totalFound')}</span>
              </div>

              <div className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow">
                <Target className="h-4 w-4 mb-1 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-foreground">
                  {extractionResult.uniqueCount.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground text-center">{tool('extractEmails.stats.unique')}</span>
              </div>

              <div className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow">
                <CheckCircle className="h-4 w-4 mb-1 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-foreground">
                  {extractionResult.validCount.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground text-center">{tool('extractEmails.stats.valid')}</span>
              </div>

              <div className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow">
                <AlertTriangle className="h-4 w-4 mb-1 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-foreground">
                  {extractionResult.invalidCount.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground text-center">{tool('extractEmails.stats.invalid')}</span>
              </div>

              <div className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow">
                <Globe className="h-4 w-4 mb-1 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-foreground">
                  {Object.keys(extractionResult.domains).length.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground text-center">{tool('extractEmails.uniqueDomains')}</span>
              </div>

              <div className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow">
                <Percent className="h-4 w-4 mb-1 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-foreground">
                  {patternAnalysis.validityRate}%
                </span>
                <span className="text-xs text-muted-foreground text-center">{tool('extractEmails.validityRate')}</span>
              </div>
            </div>
          )}

          {/* Duplicates Warning */}
          {extractionResult.duplicates.length > 0 && !extractionOptions.removeDuplicates && (
            <div className="space-y-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-md border border-yellow-200 dark:border-yellow-800">
              <h4 className="text-xs font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {tool('extractEmails.duplicatesFound')}: {extractionResult.duplicates.length}
              </h4>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 opacity-75">{tool('extractEmails.duplicatesHint')}</p>
            </div>
          )}

          {/* Top Domains Analysis */}
          {patternAnalysis.topDomains.length > 0 && (
            <div className="space-y-2 p-2 bg-muted/50 rounded-md border border-border">
              <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {tool('extractEmails.topDomains')}
              </h4>
              <div className="flex flex-wrap gap-1">
                {patternAnalysis.topDomains.slice(0, 8).map((domain, index) => (
                  <span key={index} className="px-2 py-1 bg-card border rounded text-xs font-mono">
                    {domain.domain}: {domain.count} ({domain.percentage}%)
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground opacity-75">{tool('extractEmails.domainsHint')}</p>
            </div>
          )}

        </div>
      </BaseTextConverter>
    </TooltipProvider>
  );
}