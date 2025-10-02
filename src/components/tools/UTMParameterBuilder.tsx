'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UTMBuilderAnalytics } from '@/components/shared/UTMBuilderAnalytics';
import { copyToClipboard } from '@/lib/utils';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { EnhancedResponsiveAd } from '@/components/ads/EnhancedResponsiveAd';
import { 
  Link2, 
  Trash2, 
  Mail,
  Facebook,
  Search,
  Monitor,
  Zap,
  AlertCircle,
  CheckCircle,
  Check,
  Copy
} from 'lucide-react';

interface UTMParameters {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
  url: string;
}

export function UTMParameterBuilder() {
  const { tool } = useToolTranslations('tools/miscellaneous');
  
  // UTM Parameters state
  const [parameters, setParameters] = useState<UTMParameters>({
    source: '',
    medium: '',
    campaign: '',
    term: '',
    content: '',
    url: ''
  });
  
  // Generated URL state
  const [generatedURL, setGeneratedURL] = useState('');
  const [showCopied, setShowCopied] = useState(false);
  const [highlightField, setHighlightField] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Common medium suggestions
  const commonMediums = [
    'email',
    'social',
    'cpc',
    'organic',
    'referral',
    'display',
    'affiliate',
    'direct',
    'newsletter',
    'banner'
  ];
  
  // Common source suggestions  
  const commonSources = [
    'google',
    'facebook',
    'twitter',
    'instagram',
    'linkedin',
    'youtube',
    'newsletter',
    'blog',
    'partner',
    'advertisement'
  ];

  // Generate UTM URL manually
  const generateUTMURL = () => {
    // Clear any existing highlights
    setHighlightField(null);
    
    // Validate required fields
    if (!parameters.url) {
      setHighlightField('url');
      showFeedback('error', 'Please enter a base URL');
      document.getElementById('url')?.focus();
      return;
    }
    
    if (!validateURL(parameters.url)) {
      setHighlightField('url');
      showFeedback('error', tool('utmBuilder.baseUrlInvalid'));
      document.getElementById('url')?.focus();
      return;
    }
    
    if (!parameters.source) {
      setHighlightField('source');
      showFeedback('error', 'Please enter a UTM source');
      document.getElementById('source')?.focus();
      return;
    }
    
    if (!parameters.medium) {
      setHighlightField('medium');
      showFeedback('error', 'Please enter a UTM medium');
      document.getElementById('medium')?.focus();
      return;
    }
    
    if (!parameters.campaign) {
      setHighlightField('campaign');
      showFeedback('error', 'Please enter a UTM campaign');
      document.getElementById('campaign')?.focus();
      return;
    }
    
    // Generate URL
    const baseUrl = parameters.url;
    const urlParams = new URLSearchParams();
    
    urlParams.append('utm_source', parameters.source);
    urlParams.append('utm_medium', parameters.medium);
    urlParams.append('utm_campaign', parameters.campaign);
    if (parameters.term) urlParams.append('utm_term', parameters.term);
    if (parameters.content) urlParams.append('utm_content', parameters.content);
    
    const separator = baseUrl.includes('?') ? '&' : '?';
    const newUrl = `${baseUrl}${separator}${urlParams.toString()}`;
    setGeneratedURL(newUrl);
    showFeedback('success', 'UTM URL generated successfully!');
  };

  const handleParameterChange = (field: keyof UTMParameters, value: string) => {
    setParameters(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear highlight when user starts typing in the highlighted field
    if (highlightField === field) {
      setHighlightField(null);
    }
  };

  const handleCopy = async () => {
    if (!generatedURL) {
      showFeedback('error', tool('utmBuilder.generateFirst'));
      return;
    }
    
    const success = await copyToClipboard(generatedURL);
    if (success) {
      setShowCopied(true);
      showFeedback('success', tool('utmBuilder.urlCopied'));
      setTimeout(() => setShowCopied(false), 2000);
    } else {
      showFeedback('error', 'Failed to copy UTM URL');
    }
  };

  // Removed unused handleDownload function

  const handleClear = () => {
    setParameters({
      source: '',
      medium: '',
      campaign: '',
      term: '',
      content: '',
      url: ''
    });
    setGeneratedURL('');
    showFeedback('success', tool('utmBuilder.allFieldsCleared'));
  };

  // Removed unused handlePreview function

  const handlePreset = (preset: string) => {
    const presets: { [key: string]: Partial<UTMParameters> } = {
      email: { source: 'newsletter', medium: 'email' },
      social_facebook: { source: 'facebook', medium: 'social' },
      social_twitter: { source: 'twitter', medium: 'social' },
      social_linkedin: { source: 'linkedin', medium: 'social' },
      google_ads: { source: 'google', medium: 'cpc' },
      display_banner: { source: 'partner_site', medium: 'display' }
    };
    
    const presetData = presets[preset];
    if (presetData) {
      setParameters(prev => ({ ...prev, ...presetData }));
    }
  };

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setToastNotification({ type, message });
    setTimeout(() => setToastNotification(null), 3000);
  };

  const validateURL = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateField = (value: string): boolean => {
    return value.trim().length >= 2 && !value.includes(' ');
  };

  // Removed unused getParameterBreakdown function

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Link2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            {tool('utmBuilder.title')}
          </h1>
        </div>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          {tool('utmBuilder.description')}
        </p>
      </div>

      {/* Strategic Ad Placement */}
      <EnhancedResponsiveAd className="my-6" format="auto" lazy={true} />

      {/* UTM Parameters Form - Full Width */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            {tool('utmBuilder.formTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Base URL - Full Width */}
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-medium">
              {tool('utmBuilder.baseUrl')} *
            </Label>
            <Input
              id="url"
              type="url"
              placeholder={tool('utmBuilder.baseUrlPlaceholder')}
              value={parameters.url}
              onChange={(e) => handleParameterChange('url', e.target.value)}
              className={`${
                (parameters.url && !validateURL(parameters.url)) || highlightField === 'url' 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500 ring-2 ring-red-500/20' 
                  : ''
              }`}
            />
            {parameters.url && !validateURL(parameters.url) && (
              <p className="text-xs text-red-500">{tool('utmBuilder.baseUrlInvalid')}</p>
            )}
          </div>

          {/* Required Parameters Row */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="source" className="text-sm font-medium">
                {tool('utmBuilder.source')} *
              </Label>
              <Input
                id="source"
                placeholder={tool('utmBuilder.sourcePlaceholder')}
                value={parameters.source}
                onChange={(e) => handleParameterChange('source', e.target.value)}
                list="sources"
                className={`${
                  (parameters.source && !validateField(parameters.source)) || highlightField === 'source'
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500 ring-2 ring-red-500/20' 
                    : ''
                }`}
              />
              <datalist id="sources">
                {commonSources.map(source => (
                  <option key={source} value={source} />
                ))}
              </datalist>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medium" className="text-sm font-medium">
                {tool('utmBuilder.medium')} *
              </Label>
              <Input
                id="medium"
                placeholder={tool('utmBuilder.mediumPlaceholder')}
                value={parameters.medium}
                onChange={(e) => handleParameterChange('medium', e.target.value)}
                list="mediums"
                className={`${
                  (parameters.medium && !validateField(parameters.medium)) || highlightField === 'medium'
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500 ring-2 ring-red-500/20' 
                    : ''
                }`}
              />
              <datalist id="mediums">
                {commonMediums.map(medium => (
                  <option key={medium} value={medium} />
                ))}
              </datalist>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign" className="text-sm font-medium">
                {tool('utmBuilder.campaign')} *
              </Label>
              <Input
                id="campaign"
                placeholder={tool('utmBuilder.campaignPlaceholder')}
                value={parameters.campaign}
                onChange={(e) => handleParameterChange('campaign', e.target.value)}
                className={`${
                  (parameters.campaign && !validateField(parameters.campaign)) || highlightField === 'campaign'
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500 ring-2 ring-red-500/20' 
                    : ''
                }`}
              />
            </div>
          </div>

          {/* Optional Parameters Row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="term" className="text-sm font-medium">
                {tool('utmBuilder.term')}
                <span className="text-xs text-muted-foreground ml-1">{tool('utmBuilder.termOptional')}</span>
              </Label>
              <Input
                id="term"
                placeholder={tool('utmBuilder.termPlaceholder')}
                value={parameters.term}
                onChange={(e) => handleParameterChange('term', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium">
                {tool('utmBuilder.content')}
                <span className="text-xs text-muted-foreground ml-1">{tool('utmBuilder.contentOptional')}</span>
              </Label>
              <Input
                id="content"
                placeholder={tool('utmBuilder.contentPlaceholder')}
                value={parameters.content}
                onChange={(e) => handleParameterChange('content', e.target.value)}
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{tool('utmBuilder.presets')}</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset('email')}
                className="flex items-center gap-2 justify-center py-3 h-auto"
              >
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">{tool('utmBuilder.presetEmailCampaign')}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset('social_facebook')}
                className="flex items-center gap-2 justify-center py-3 h-auto"
              >
                <Facebook className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">{tool('utmBuilder.presetFacebook')}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset('google_ads')}
                className="flex items-center gap-2 justify-center py-3 h-auto"
              >
                <Search className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">{tool('utmBuilder.presetGoogleAds')}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset('display_banner')}
                className="flex items-center gap-2 justify-center py-3 h-auto"
              >
                <Monitor className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">{tool('utmBuilder.presetDisplayAd')}</span>
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t justify-center">
            <Button
              onClick={generateUTMURL}
              variant="default"
              className="flex-1 sm:flex-none min-w-[140px]"
            >
              <Zap className="h-4 w-4 mr-2" />
              {tool('utmBuilder.generate')}
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              className="flex-1 sm:flex-none min-w-[140px]"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {tool('utmBuilder.clear')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* UTM URL Output - MD5 Style Display */}
      <div className="w-full relative">
        {/* Copied Notice */}
        {showCopied && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-green-500 text-white px-3 py-1 rounded-md text-sm font-medium shadow-lg flex items-center gap-2">
              <Check className="h-4 w-4" />
              {tool('utmBuilder.copied')}
            </div>
          </div>
        )}
        
        {/* Main UTM URL Display - Exact MD5 Style */}
        <div 
          className={`
            relative min-h-[140px] p-8 rounded-xl border-2 border-dashed border-border/50
            bg-gradient-to-br from-card/80 to-muted/30 backdrop-blur-sm
            shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer
            ${generatedURL ? 'hover:border-primary/30 hover:shadow-primary/10' : 'hover:border-border/70'}
          `}
          onClick={handleCopy}
        >
          {generatedURL ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              {/* UTM URL Value */}
              <div className="w-full">
                <code className="
                  font-mono text-sm sm:text-base lg:text-lg 
                  text-foreground break-all text-center leading-relaxed
                  bg-background/60 px-4 py-3 rounded-lg border
                  shadow-inner block
                ">
                  {generatedURL}
                </code>
              </div>
              
              {/* Click to copy hint */}
              <div className="text-xs text-muted-foreground/60 flex items-center gap-1">
                <Copy className="w-3 h-3" />
                Click to copy
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                {/* URL Icon */}
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted/20 border-2 border-dashed border-muted-foreground/20 mx-auto">
                  <Link2 className="w-8 h-8 text-muted-foreground/40" />
                </div>
                
                <div className="text-muted-foreground text-lg font-medium">
                  {tool('utmBuilder.urlPreview')}
                </div>
                <div className="text-sm text-muted-foreground/70">
                  {tool('utmBuilder.noUrlGenerated')}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Strategic Ad Placement */}
      <EnhancedResponsiveAd 
        format="auto" 
        className="my-8" 
        lazy={true}
      />

      {/* UTM Analytics - Bottom */}
      <UTMBuilderAnalytics
        parameters={parameters}
        generatedURL={generatedURL}
        variant="default"
      />

      {/* Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-4 z-50 animate-in slide-in-from-bottom sm:slide-in-from-right duration-300">
          <div className={`
            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm
            max-w-sm mx-auto sm:mx-0 sm:max-w-md
            ${toastNotification.type === 'success' 
              ? 'bg-green-50/95 border-green-200 text-green-800 dark:bg-green-900/95 dark:border-green-700 dark:text-green-100' 
              : 'bg-red-50/95 border-red-200 text-red-800 dark:bg-red-900/95 dark:border-red-700 dark:text-red-100'
            }
          `}>
            {toastNotification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium leading-relaxed">{toastNotification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}