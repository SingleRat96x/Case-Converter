'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { PdfUploader, type PdfFile } from '@/components/shared/PdfUploader';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { 
  extractEmailsFromPdf, 
  validatePdfFile, 
  formatFileSize, 
  formatProcessingTime,
  type PdfEmailExtractionResult 
} from '@/lib/pdfUtils';
import { 
  exportEmails, 
  analyzeEmailPatterns,
  type EmailExtractionOptions 
} from '@/lib/emailUtils';
import { 
  CheckCircle, 
  Mail, 
  Globe,
  Filter,
  HelpCircle,
  Target,
  Percent,
  AlertTriangle,
  FileText,
  Clock,
  Copy,
  Download
} from 'lucide-react';
import { copyToClipboard, downloadTextAsFile } from '@/lib/utils';

type ProcessingState = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

export function PdfEmailExtractor() {
  const { common, tool } = useToolTranslations('tools/pdf-tools');
  
  // State management
  const [state, setState] = useState<ProcessingState>('idle');
  const [uploadedFile, setUploadedFile] = useState<PdfFile | null>(null);
  const [extractionResult, setExtractionResult] = useState<PdfEmailExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  
  // Extraction options
  const [extractionOptions, setExtractionOptions] = useState<EmailExtractionOptions>({
    mode: 'comprehensive',
    removeDuplicates: true,
    sortBy: 'alphabetical',
    sortOrder: 'asc',
    validateEmails: true
  });

  // Memoized pattern analysis
  const patternAnalysis = useMemo(() => {
    if (!extractionResult?.emails) return null;
    return analyzeEmailPatterns(extractionResult.emails);
  }, [extractionResult?.emails]);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setState('uploading');
      setError(null);
      
      // Validate file
      const validation = validatePdfFile(file);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid PDF file');
        setState('error');
        return;
      }
      
      // Create PdfFile object
      const pdfFile: PdfFile = {
        file,
        name: file.name,
        size: file.size,
        isValid: validation.isValid,
        error: validation.error
      };
      
      setUploadedFile(pdfFile);
      setState('processing');
      
      // Extract emails from PDF
      const result = await extractEmailsFromPdf(file, extractionOptions);
      setExtractionResult(result);
      setState('completed');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process PDF file';
      setError(errorMessage);
      setState('error');
    }
  }, [extractionOptions]);

  // Handle clear/reset
  const handleClear = useCallback(() => {
    setState('idle');
    setUploadedFile(null);
    setExtractionResult(null);
    setError(null);
  }, []);

  // Update extraction options
  const updateExtractionOption = useCallback(<K extends keyof EmailExtractionOptions>(
    key: K,
    value: EmailExtractionOptions[K]
  ) => {
    setExtractionOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  // Generate output text
  const outputText = useMemo(() => {
    if (!extractionResult?.emails || extractionResult.emails.length === 0) {
      return tool('pdfEmailExtractor.noEmailsFound');
    }
    return extractionResult.emails.map(e => e.email).join('\n');
  }, [extractionResult?.emails, tool]);

  // Handle copy emails
  const handleCopyEmails = useCallback(async () => {
    if (extractionResult?.emails) {
      const emailList = extractionResult.emails.map(e => e.email).join('\n');
      await copyToClipboard(emailList);
    }
  }, [extractionResult?.emails]);

  // Handle export
  const handleExport = useCallback((format: 'txt' | 'csv' | 'json') => {
    if (extractionResult?.emails) {
      const exportData = exportEmails(extractionResult.emails, format);
      const fileName = `pdf-extracted-emails.${format}`;
      downloadTextAsFile(exportData, fileName);
    }
  }, [extractionResult?.emails]);

  // Handle responsive accordion behavior
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
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {tool('pdfEmailExtractor.title')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {tool('pdfEmailExtractor.description')}
          </p>
        </div>

        {/* PDF Uploader */}
        <PdfUploader
          onFileUpload={handleFileUpload}
          onClear={handleClear}
          isUploading={state === 'uploading'}
          isProcessing={state === 'processing'}
          error={error}
          uploadedFile={uploadedFile}
          uploadAreaLabel={tool('pdfEmailExtractor.uploadArea')}
          dragDropLabel={tool('pdfEmailExtractor.dragDrop')}
          supportedFormatsLabel={tool('pdfEmailExtractor.supportedFormats')}
          replaceText={tool('pdfEmailExtractor.replace')}
          clearText={tool('pdfEmailExtractor.clear')}
          processingText={tool('pdfEmailExtractor.processing')}
        />

        {/* Results Section */}
        {state === 'completed' && extractionResult && (
          <div className="space-y-4">
            {/* Output Textarea */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {tool('pdfEmailExtractor.results')} ({extractionResult.emails.length})
              </h3>
              <textarea
                value={outputText}
                readOnly
                className="w-full h-64 p-3 border border-border rounded-md bg-background text-foreground font-mono text-sm resize-vertical focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                placeholder={tool('pdfEmailExtractor.noEmailsFound')}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                onClick={handleCopyEmails}
                variant="default"
                size="sm"
                className="gap-2"
                disabled={extractionResult.emails.length === 0}
              >
                <Copy className="h-4 w-4" />
                {common('buttons.copy')}
              </Button>
              
              <Button
                onClick={() => handleExport('txt')}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={extractionResult.emails.length === 0}
              >
                <Download className="h-4 w-4" />
                TXT
              </Button>
              
              <Button
                onClick={() => handleExport('csv')}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={extractionResult.emails.length === 0}
              >
                <Download className="h-4 w-4" />
                CSV
              </Button>
              
              <Button
                onClick={() => handleExport('json')}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={extractionResult.emails.length === 0}
              >
                <Download className="h-4 w-4" />
                JSON
              </Button>
            </div>
          </div>
        )}

        {/* Settings Accordion */}
        <Accordion className="w-full">
          <AccordionItem 
            title={tool('pdfEmailExtractor.settings')}
            defaultOpen={isAccordionOpen}
            className="w-full"
          >
            <div className="space-y-4">
              {/* Sort By */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">{tool('pdfEmailExtractor.sortBy')}</label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">{tool('pdfEmailExtractor.sortTooltip')}</p>
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
                    <SelectItem value="alphabetical">{tool('pdfEmailExtractor.sortOptions.alphabetical')}</SelectItem>
                    <SelectItem value="domain">{tool('pdfEmailExtractor.sortOptions.domain')}</SelectItem>
                    <SelectItem value="position">{tool('pdfEmailExtractor.sortOptions.position')}</SelectItem>
                    <SelectItem value="validity">{tool('pdfEmailExtractor.sortOptions.validity')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Processing Options */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Filter className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('pdfEmailExtractor.processingOptions')}</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                    <div className="flex items-center gap-2">
                      <label htmlFor="remove-duplicates" className="text-sm font-medium cursor-pointer flex-1">
                        {tool('pdfEmailExtractor.removeDuplicates')}
                      </label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs">{tool('pdfEmailExtractor.duplicatesTooltip')}</p>
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
                        {tool('pdfEmailExtractor.validateEmails')}
                      </label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs">{tool('pdfEmailExtractor.validationTooltip')}</p>
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

        {/* Analytics Cards */}
        {state === 'completed' && extractionResult && (
          <div className="space-y-4">
            {/* Email Analytics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow">
                <Mail className="h-4 w-4 mb-1 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-foreground">
                  {extractionResult.totalCount.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground text-center">{tool('pdfEmailExtractor.stats.totalFound')}</span>
              </div>

              <div className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow">
                <Target className="h-4 w-4 mb-1 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-foreground">
                  {extractionResult.uniqueCount.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground text-center">{tool('pdfEmailExtractor.stats.unique')}</span>
              </div>

              <div className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow">
                <CheckCircle className="h-4 w-4 mb-1 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-foreground">
                  {extractionResult.validCount.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground text-center">{tool('pdfEmailExtractor.stats.valid')}</span>
              </div>

              <div className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow">
                <AlertTriangle className="h-4 w-4 mb-1 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-foreground">
                  {extractionResult.invalidCount.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground text-center">{tool('pdfEmailExtractor.stats.invalid')}</span>
              </div>

              <div className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow">
                <Globe className="h-4 w-4 mb-1 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-foreground">
                  {Object.keys(extractionResult.domains).length.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground text-center">{tool('pdfEmailExtractor.uniqueDomains')}</span>
              </div>

              <div className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow">
                <Percent className="h-4 w-4 mb-1 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-foreground">
                  {patternAnalysis?.validityRate || 0}%
                </span>
                <span className="text-xs text-muted-foreground text-center">{tool('pdfEmailExtractor.validityRate')}</span>
              </div>
            </div>

            {/* PDF Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow">
                <FileText className="h-4 w-4 mb-1 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-foreground">
                  {extractionResult.pdfInfo.pageCount}
                </span>
                <span className="text-xs text-muted-foreground text-center">{tool('pdfEmailExtractor.pages')}</span>
              </div>

              <div className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow">
                <FileText className="h-4 w-4 mb-1 text-cyan-600 dark:text-cyan-400" />
                <span className="text-sm font-medium text-foreground">
                  {formatFileSize(extractionResult.pdfInfo.fileSize)}
                </span>
                <span className="text-xs text-muted-foreground text-center">{tool('pdfEmailExtractor.fileSize')}</span>
              </div>

              <div className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow">
                <Clock className="h-4 w-4 mb-1 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-foreground">
                  {formatProcessingTime(extractionResult.pdfInfo.processingTime)}
                </span>
                <span className="text-xs text-muted-foreground text-center">{tool('pdfEmailExtractor.processingTime')}</span>
              </div>

              <div className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow">
                <FileText className="h-4 w-4 mb-1 text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-medium text-foreground truncate max-w-full">
                  {extractionResult.pdfInfo.filename}
                </span>
                <span className="text-xs text-muted-foreground text-center">{tool('pdfEmailExtractor.filename')}</span>
              </div>
            </div>

            {/* Top Domains Analysis */}
            {patternAnalysis && patternAnalysis.topDomains.length > 0 && (
              <div className="space-y-2 p-2 bg-muted/50 rounded-md border border-border">
                <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {tool('pdfEmailExtractor.topDomains')}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {patternAnalysis.topDomains.slice(0, 8).map((domain, index) => (
                    <span key={index} className="px-2 py-1 bg-card border rounded text-xs font-mono">
                      {domain.domain}: {domain.count} ({domain.percentage}%)
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground opacity-75">{tool('pdfEmailExtractor.domainsHint')}</p>
              </div>
            )}

            {/* Duplicates Warning */}
            {extractionResult.duplicates.length > 0 && !extractionOptions.removeDuplicates && (
              <div className="space-y-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                <h4 className="text-xs font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {tool('pdfEmailExtractor.duplicatesFound')}: {extractionResult.duplicates.length}
                </h4>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 opacity-75">{tool('pdfEmailExtractor.duplicatesHint')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}