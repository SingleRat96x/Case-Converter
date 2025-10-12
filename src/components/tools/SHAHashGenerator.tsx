'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { SHAHashAnalytics } from '@/components/shared/SHAHashAnalytics';
import { ToolOptionsAccordion } from '@/components/shared/ToolOptionsAccordion';
import { useCommonTranslations } from '@/lib/i18n/hooks';
import { usePathname } from 'next/navigation';
import { getLocaleFromPathname } from '@/lib/i18n';
import { 
  generateSHAHash, 
  generateSHAHashFromFile,
  generateBatchHashes,
  compareHashes,
  HashOptions, 
  HashResult 
} from '@/lib/shaHashUtils';
import { 
  Hash, 
  Upload, 
  FileText, 
  Key,
  Binary,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Copy,
  Download,
  RefreshCw
} from 'lucide-react';

export function SHAHashGenerator() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [translations, setTranslations] = useState<Record<string, any>>({});
  
  useEffect(() => {
    // Load translations directly from the JSON file
    import('@/locales/tools/seo-content/sha256-hash-generator.json')
      .then(data => {
        setTranslations(data[locale] || data.en);
      })
      .catch(err => console.error('Failed to load SHA translations:', err));
  }, [locale]);
  
  const tool = (key: string) => {
    const keys = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = translations;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };
  
  const { tSync: common } = useCommonTranslations();
  
  // State management
  const [inputText, setInputText] = useState('');
  const [hashResult, setHashResult] = useState<HashResult | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<HashOptions['algorithm']>('SHA-256');
  const [encoding, setEncoding] = useState<HashOptions['encoding']>('hex');
  const [uppercase, setUppercase] = useState(false);
  const [hmacKey, setHmacKey] = useState('');
  const [hmacMode, setHmacMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareHash, setCompareHash] = useState('');
  const [compareResult, setCompareResult] = useState<boolean | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [batchResults, setBatchResults] = useState<HashResult[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Algorithm options
  const algorithms: Array<{ value: HashOptions['algorithm']; label: string; secure: boolean }> = [
    { value: 'SHA-1', label: 'SHA-1 (160-bit)', secure: false },
    { value: 'SHA-256', label: 'SHA-256 (256-bit)', secure: true },
    { value: 'SHA-384', label: 'SHA-384 (384-bit)', secure: true },
    { value: 'SHA-512', label: 'SHA-512 (512-bit)', secure: true },
  ];

  // Encoding options
  const encodings: Array<{ value: HashOptions['encoding']; label: string; icon: React.ReactNode }> = [
    { value: 'hex', label: tool('options.encodings.hex'), icon: <Hash className="h-4 w-4" /> },
    { value: 'base64', label: tool('options.encodings.base64'), icon: <FileText className="h-4 w-4" /> },
    { value: 'binary', label: tool('options.encodings.binary'), icon: <Binary className="h-4 w-4" /> },
  ];

  // Generate hash function
  const handleGenerateHash = useCallback(async () => {
    if (!inputText && !uploadedFile) return;

    setIsProcessing(true);
    try {
      const options: HashOptions = {
        algorithm: selectedAlgorithm,
        encoding,
        uppercase,
        hmacKey: hmacMode ? hmacKey : undefined,
      };

      let result: HashResult;
      
      if (uploadedFile) {
        result = await generateSHAHashFromFile(uploadedFile, options);
      } else if (batchMode) {
        const lines = inputText.split('\n').filter(line => line.trim());
        const results = await generateBatchHashes(lines, options);
        setBatchResults(results);
        return;
      } else {
        result = await generateSHAHash(inputText, options);
      }
      
      setHashResult(result);
      
      if (compareMode && compareHash) {
        const comparison = compareHashes(result.hash, compareHash, selectedAlgorithm);
        setCompareResult(comparison.matches);
      }
    } catch (error) {
      console.error('Error generating hash:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, uploadedFile, selectedAlgorithm, encoding, uppercase, hmacMode, hmacKey, batchMode, compareMode, compareHash]);

  // Handle text change
  const handleTextChange = (text: string) => {
    setInputText(text);
    setUploadedFile(null); // Clear file if text is entered
    if (text) {
      handleGenerateHash();
    } else {
      setHashResult(null);
      setBatchResults([]);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploadedFile(file);
    setInputText(''); // Clear text if file is uploaded
    
    // Generate hash for the file
    setIsProcessing(true);
    try {
      const options: HashOptions = {
        algorithm: selectedAlgorithm,
        encoding,
        uppercase,
        hmacKey: hmacMode ? hmacKey : undefined,
      };
      
      const result = await generateSHAHashFromFile(file, options);
      setHashResult(result);
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy hash to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Download results
  const downloadResults = () => {
    const content = batchMode && batchResults.length > 0
      ? batchResults.map((r, i) => `Input ${i + 1}: ${r.hash}`).join('\n')
      : hashResult?.hash || '';
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sha-hashes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear all
  const handleClear = () => {
    setInputText('');
    setHashResult(null);
    setBatchResults([]);
    setUploadedFile(null);
    setCompareHash('');
    setCompareResult(null);
    setHmacKey('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Update hash when options change
  React.useEffect(() => {
    if (inputText || uploadedFile) {
      handleGenerateHash();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAlgorithm, encoding, uppercase, hmacMode, hmacKey]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{tool('title')}</h1>
        <p className="text-muted-foreground">{tool('description')}</p>
      </div>

      {/* Algorithm Selector */}
      <Card className="p-4">
        <Label className="text-sm font-medium mb-3 block">{tool('labels.algorithm')}</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {algorithms.map((algo) => (
            <Button
              key={algo.value}
              variant={selectedAlgorithm === algo.value ? 'default' : 'outline'}
              onClick={() => setSelectedAlgorithm(algo.value)}
              className="relative"
            >
              {!algo.secure && (
                <AlertCircle className="absolute top-1 right-1 h-3 w-3 text-destructive" />
              )}
              <span className="text-xs sm:text-sm">{algo.label}</span>
            </Button>
          ))}
        </div>
        {selectedAlgorithm === 'SHA-1' && (
          <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-xs text-destructive flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {tool('warnings.sha1Deprecated')}
            </p>
          </div>
        )}
      </Card>

      {/* Main Input/Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>{tool('labels.inputText')}</Label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  {tool('actions.uploadFile')}
                </Button>
              </div>
            </div>
            
            {uploadedFile ? (
              <div className="p-4 bg-muted rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{uploadedFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(uploadedFile.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setUploadedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <textarea
                className="w-full h-48 p-3 border rounded-md bg-background resize-none font-mono text-sm"
                placeholder={tool('placeholders.enterText')}
                value={inputText}
                onChange={(e) => handleTextChange(e.target.value)}
              />
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".txt,.md,.json,.xml,.csv,.*"
            />
          </div>
        </Card>

        {/* Output Panel */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>{tool('labels.outputHash')}</Label>
              <div className="flex gap-2">
                {hashResult && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(hashResult.hash)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      {common('actions.copy')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={downloadResults}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {common('actions.download')}
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <div className="relative">
              {isProcessing ? (
                <div className="h-48 flex items-center justify-center bg-muted rounded-md">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : batchMode && batchResults.length > 0 ? (
                <div className="h-48 overflow-y-auto p-3 bg-muted rounded-md space-y-2 font-mono text-sm">
                  {batchResults.map((result, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-muted-foreground">{index + 1}.</span>
                      <span className="break-all">{result.hash}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-auto"
                        onClick={() => copyToClipboard(result.hash)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : hashResult ? (
                <div className="h-48 p-3 bg-muted rounded-md font-mono text-sm break-all overflow-y-auto">
                  {hashResult.hash}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center bg-muted rounded-md text-muted-foreground">
                  {tool('placeholders.hashWillAppear')}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Options */}
      <ToolOptionsAccordion title={tool('options.title') || 'Advanced Options'} defaultOpen={false}>
        <div className="space-y-6 p-4">
          {/* Encoding Options */}
          <div className="space-y-3">
            <Label>{tool('labels.encoding')}</Label>
            <div className="flex gap-2">
              {encodings.map((enc) => (
                <Button
                  key={enc.value}
                  variant={encoding === enc.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEncoding(enc.value)}
                  className="flex items-center gap-2"
                >
                  {enc.icon}
                  {enc.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Additional Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="uppercase" className="cursor-pointer">
                {tool('features.uppercase')}
              </Label>
              <Switch
                id="uppercase"
                checked={uppercase}
                onCheckedChange={setUppercase}
                disabled={encoding !== 'hex'}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="batch" className="cursor-pointer">
                {tool('features.batchMode')}
              </Label>
              <Switch
                id="batch"
                checked={batchMode}
                onCheckedChange={setBatchMode}
                disabled={!!uploadedFile}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="hmac" className="cursor-pointer">
                {tool('features.hmacMode')}
              </Label>
              <Switch
                id="hmac"
                checked={hmacMode}
                onCheckedChange={setHmacMode}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="compare" className="cursor-pointer">
                {tool('features.compareMode')}
              </Label>
              <Switch
                id="compare"
                checked={compareMode}
                onCheckedChange={setCompareMode}
                disabled={batchMode}
              />
            </div>
          </div>

          {/* HMAC Key Input */}
          {hmacMode && (
            <div className="space-y-2">
              <Label htmlFor="hmac-key">{tool('labels.hmacKey')}</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="hmac-key"
                  type="password"
                  className="w-full pl-10 pr-3 py-2 border rounded-md bg-background"
                  placeholder={tool('placeholders.enterHmacKey')}
                  value={hmacKey}
                  onChange={(e) => setHmacKey(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Compare Hash Input */}
          {compareMode && (
            <div className="space-y-2">
              <Label htmlFor="compare-hash">{tool('labels.compareHash')}</Label>
              <div className="relative">
                <input
                  id="compare-hash"
                  type="text"
                  className="w-full pr-10 px-3 py-2 border rounded-md bg-background font-mono text-sm"
                  placeholder={tool('placeholders.enterCompareHash')}
                  value={compareHash}
                  onChange={(e) => setCompareHash(e.target.value)}
                />
                {compareResult !== null && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {compareResult ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                )}
              </div>
              {compareResult !== null && (
                <p className={`text-sm ${compareResult ? 'text-green-500' : 'text-destructive'}`}>
                  {compareResult ? tool('compare.match') : tool('compare.noMatch')}
                </p>
              )}
            </div>
          )}
        </div>
      </ToolOptionsAccordion>

      {/* Action Buttons */}
      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          onClick={handleClear}
          disabled={!inputText && !hashResult && !uploadedFile}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {common('actions.clear')}
        </Button>
      </div>

      {/* Analytics */}
      <SHAHashAnalytics 
        hashResult={hashResult}
        inputText={inputText || `File: ${uploadedFile?.name || ''}`}
        hmacKey={hmacMode ? hmacKey : undefined}
        encoding={encoding}
      />
    </div>
  );
}