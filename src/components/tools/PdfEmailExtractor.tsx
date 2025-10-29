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
  Check,
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
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied'>('idle');
  
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
      try {
        const emailList = extractionResult.emails.map(e => e.email).join('\n');
        const success = await copyToClipboard(emailList);
        
        if (success) {
          setCopyState('copied');
          // Show "Copied" state for 2 seconds, then revert to normal
          setTimeout(() => {
            setCopyState('idle');
          }, 2000);
        }
      } catch {
        // If copy fails, don't show copied state
      }
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
                className={`gap-2 transition-all duration-300 ease-in-out ${
                  copyState === 'copied'
                    ? 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white'
                    : ''
                }`}
                disabled={extractionResult.emails.length === 0}
              >
                <span className="transition-all duration-200">
                  {copyState === 'copied' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </span>
                <span className="transition-all duration-200">
                  {copyState === 'copied' ? 'Copied!' : common('buttons.copy')}
                </span>
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

        {/* Top Domains Analysis - Redesigned */}
        {state === 'completed' && extractionResult && patternAnalysis && patternAnalysis.topDomains.length > 0 && (
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground">{tool('pdfEmailExtractor.topDomains')}</h4>
                <p className="text-sm text-muted-foreground">Most common email domains found in your PDF</p>
              </div>
            </div>
            
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {patternAnalysis.topDomains.slice(0, 6).map((domain, index) => (
                <div key={index} className="bg-card rounded-lg p-4 border border-border hover:shadow-md transition-all hover:border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm font-medium text-foreground truncate">
                        {domain.domain}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {domain.count} email{domain.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        {domain.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {patternAnalysis.topDomains.length > 6 && (
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Showing top 6 domains • {patternAnalysis.topDomains.length - 6} more found
              </p>
            )}
          </div>
        )}

        {/* Duplicates Warning */}
        {state === 'completed' && extractionResult && extractionResult.duplicates.length > 0 && !extractionOptions.removeDuplicates && (
          <div className="space-y-2 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {tool('pdfEmailExtractor.duplicatesFound')}: {extractionResult.duplicates.length}
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">{tool('pdfEmailExtractor.duplicatesHint')}</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}