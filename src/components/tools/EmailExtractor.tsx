'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { 
  extractEmails, 
  exportEmails, 
  analyzeEmailPatterns,
  type EmailExtractionOptions,
  type EmailExtractionResult
} from '@/lib/emailUtils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Download, Copy, Settings, BarChart3, Mail, Globe } from 'lucide-react';
import { copyToClipboard, downloadTextAsFile } from '@/lib/utils';

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
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Memoized email extraction result
  const extractionResult: EmailExtractionResult = useMemo(() => {
    return extractEmails(text, extractionOptions);
  }, [text, extractionOptions]);

  // Memoized pattern analysis
  const patternAnalysis = useMemo(() => {
    return analyzeEmailPatterns(extractionResult.emails);
  }, [extractionResult.emails]);

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
  }, []);

  const handleFileUploaded = useCallback((content: string) => {
    setText(content);
  }, []);

  const showFeedback = useCallback((type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  const handleCopyEmails = useCallback(async () => {
    const emailList = extractionResult.emails.map(e => e.email).join('\n');
    const success = await copyToClipboard(emailList);
    if (success) {
      showFeedback('success', tool('extractEmails.copiedMessage'));
    } else {
      showFeedback('error', 'Failed to copy emails');
    }
  }, [extractionResult.emails, showFeedback, tool]);

  const handleExport = useCallback((format: 'txt' | 'csv' | 'json') => {
    const exportData = exportEmails(extractionResult.emails, format);
    const fileName = `extracted-emails.${format}`;
    downloadTextAsFile(exportData, fileName);
    showFeedback('success', `Exported ${extractionResult.emails.length} emails as ${format.toUpperCase()}`);
  }, [extractionResult.emails, showFeedback]);

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

  return (
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
      uploadDescription={tool('extractEmails.uploadDescription')}
      downloadFileName={tool('extractEmails.downloadFileName')}
      useMonoFont={true}
      onTextChange={handleTextChange}
      text={text}
      convertedText={extractedEmailsDisplay}
      onConvertedTextUpdate={() => {}} // Not needed for this tool
      onFileUploaded={handleFileUploaded}
      showAnalytics={false} // We'll show custom analytics
      actionButtonsPosition="before-children"
      mobileLayout="2x2"
    >
      {/* Advanced Options */}
      <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {tool('extractEmails.extractionOptions')}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            {showAdvancedOptions ? tool('extractEmails.hideOptions') : tool('extractEmails.showOptions')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Extraction Mode */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{tool('extractEmails.extractionMode')}</label>
            <Select
              value={extractionOptions.mode}
              onValueChange={(value: EmailExtractionOptions['mode']) => 
                updateExtractionOption('mode', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">{tool('extractEmails.modes.simple')}</SelectItem>
                <SelectItem value="comprehensive">{tool('extractEmails.modes.comprehensive')}</SelectItem>
                <SelectItem value="strict">{tool('extractEmails.modes.strict')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{tool('extractEmails.sortBy')}</label>
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

          {/* Sort Order */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{tool('extractEmails.sortOrder')}</label>
            <Select
              value={extractionOptions.sortOrder}
              onValueChange={(value: EmailExtractionOptions['sortOrder']) => 
                updateExtractionOption('sortOrder', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">{tool('extractEmails.sortOrderOptions.ascending')}</SelectItem>
                <SelectItem value="desc">{tool('extractEmails.sortOrderOptions.descending')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Remove Duplicates */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{tool('extractEmails.removeDuplicates')}</label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={extractionOptions.removeDuplicates}
                onCheckedChange={(checked) => updateExtractionOption('removeDuplicates', checked)}
              />
              <span className="text-sm text-muted-foreground">
                {extractionOptions.removeDuplicates ? common('labels.enabled') : common('labels.disabled')}
              </span>
            </div>
          </div>
        </div>

        {showAdvancedOptions && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            {/* Validate Emails */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{tool('extractEmails.validateEmails')}</label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={extractionOptions.validateEmails}
                  onCheckedChange={(checked) => updateExtractionOption('validateEmails', checked)}
                />
                <span className="text-sm text-muted-foreground">
                  {extractionOptions.validateEmails ? common('labels.enabled') : common('labels.disabled')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {text && (
        <div className="space-y-4">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-primary">{extractionResult.totalCount}</div>
              <div className="text-sm text-muted-foreground">{tool('extractEmails.stats.totalFound')}</div>
            </div>
            <div className="bg-card p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-green-600">{extractionResult.uniqueCount}</div>
              <div className="text-sm text-muted-foreground">{tool('extractEmails.stats.unique')}</div>
            </div>
            <div className="bg-card p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-green-600">{extractionResult.validCount}</div>
              <div className="text-sm text-muted-foreground">{tool('extractEmails.stats.valid')}</div>
            </div>
            <div className="bg-card p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-red-600">{extractionResult.invalidCount}</div>
              <div className="text-sm text-muted-foreground">{tool('extractEmails.stats.invalid')}</div>
            </div>
          </div>

          {/* Action Buttons */}
          {extractionResult.emails.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleCopyEmails} variant="default" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                {tool('extractEmails.copyEmails')}
              </Button>
              <Button onClick={() => handleExport('txt')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                {tool('extractEmails.exportTxt')}
              </Button>
              <Button onClick={() => handleExport('csv')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                {tool('extractEmails.exportCsv')}
              </Button>
              <Button onClick={() => handleExport('json')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                {tool('extractEmails.exportJson')}
              </Button>
            </div>
          )}

          {/* Email List with Validation Status */}
          {extractionResult.emails.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {tool('extractEmails.extractedEmails')} ({extractionResult.emails.length})
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1 p-3 bg-muted/30 rounded border">
                {extractionResult.emails.map((emailObj, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="font-mono">{emailObj.email}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {emailObj.domain}
                      </Badge>
                      {extractionOptions.validateEmails && (
                        emailObj.isValid ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Domain Analysis */}
          {patternAnalysis.topDomains.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {tool('extractEmails.topDomains')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {patternAnalysis.topDomains.slice(0, 6).map((domain, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                    <span className="font-mono">{domain.domain}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{domain.count}</span>
                      <Badge variant="secondary" className="text-xs">
                        {domain.percentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Duplicates Warning */}
          {extractionResult.duplicates.length > 0 && !extractionOptions.removeDuplicates && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
              <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                <span className="font-medium">
                  {tool('extractEmails.duplicatesFound')}: {extractionResult.duplicates.length}
                </span>
              </div>
              <div className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                {tool('extractEmails.duplicatesHint')}
              </div>
            </div>
          )}

          {/* Pattern Analysis */}
          {extractionResult.emails.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {tool('extractEmails.analysis')}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold">{patternAnalysis.validityRate}%</div>
                  <div className="text-muted-foreground">{tool('extractEmails.validityRate')}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{patternAnalysis.averageLocalPartLength}</div>
                  <div className="text-muted-foreground">{tool('extractEmails.avgLocalLength')}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{patternAnalysis.averageDomainLength}</div>
                  <div className="text-muted-foreground">{tool('extractEmails.avgDomainLength')}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{Object.keys(extractionResult.domains).length}</div>
                  <div className="text-muted-foreground">{tool('extractEmails.uniqueDomains')}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feedback Message */}
      {feedback && (
        <div className={`p-3 rounded border ${
          feedback.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
        }`}>
          {feedback.message}
        </div>
      )}
    </BaseTextConverter>
  );
}