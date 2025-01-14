"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChangeEvent } from 'react';

interface UtmParams {
  url: string;
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
}

const defaultParams: UtmParams = {
  url: '',
  source: '',
  medium: '',
  campaign: '',
  term: '',
  content: '',
};

const commonSources = [
  'google',
  'facebook',
  'twitter',
  'linkedin',
  'instagram',
  'email',
  'newsletter',
  'other',
] as const;

const commonMediums = [
  'cpc',
  'social',
  'email',
  'display',
  'banner',
  'referral',
  'organic',
  'other',
] as const;

export function UtmBuilder() {
  const [params, setParams] = useState<UtmParams>(defaultParams);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [error, setError] = useState('');

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleParamChange = (key: keyof UtmParams, value: string) => {
    setParams((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, key: keyof UtmParams) => {
    handleParamChange(key, e.target.value);
  };

  const generateUrl = () => {
    if (!params.url) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidUrl(params.url)) {
      setError('Please enter a valid URL');
      return;
    }

    if (!params.source || !params.medium || !params.campaign) {
      setError('Source, Medium, and Campaign are required');
      return;
    }

    try {
      const url = new URL(params.url);
      url.searchParams.append('utm_source', params.source);
      url.searchParams.append('utm_medium', params.medium);
      url.searchParams.append('utm_campaign', params.campaign);

      if (params.term) {
        url.searchParams.append('utm_term', params.term);
      }
      if (params.content) {
        url.searchParams.append('utm_content', params.content);
      }

      setGeneratedUrl(url.toString());
      setError('');
    } catch (err) {
      setError('Error generating URL');
    }
  };

  const handleClear = () => {
    setParams(defaultParams);
    setGeneratedUrl('');
    setError('');
  };

  const handleCopy = async () => {
    if (generatedUrl) {
      await navigator.clipboard.writeText(generatedUrl);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="url">Website URL *</Label>
          <Input
            id="url"
            placeholder="https://example.com"
            value={params.url}
            onChange={(e) => handleInputChange(e, 'url')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="source">Campaign Source *</Label>
            <Select
              value={params.source}
              onValueChange={(value: string) => handleParamChange('source', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {commonSources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source.charAt(0).toUpperCase() + source.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="medium">Campaign Medium *</Label>
            <Select
              value={params.medium}
              onValueChange={(value: string) => handleParamChange('medium', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select medium" />
              </SelectTrigger>
              <SelectContent>
                {commonMediums.map((medium) => (
                  <SelectItem key={medium} value={medium}>
                    {medium.charAt(0).toUpperCase() + medium.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="campaign">Campaign Name *</Label>
          <Input
            id="campaign"
            placeholder="spring_sale"
            value={params.campaign}
            onChange={(e) => handleInputChange(e, 'campaign')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="term">Campaign Term (Optional)</Label>
            <Input
              id="term"
              placeholder="running+shoes"
              value={params.term}
              onChange={(e) => handleInputChange(e, 'term')}
            />
          </div>

          <div>
            <Label htmlFor="content">Campaign Content (Optional)</Label>
            <Input
              id="content"
              placeholder="logolink"
              value={params.content}
              onChange={(e) => handleInputChange(e, 'content')}
            />
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <div className="flex gap-2">
          <Button onClick={generateUrl} className="flex-1">
            Generate URL
          </Button>
          <Button onClick={handleClear} variant="outline">
            Clear
          </Button>
        </div>

        {generatedUrl && (
          <div>
            <Label>Generated URL</Label>
            <div className="relative">
              <Input
                value={generatedUrl}
                readOnly
                className="pr-20"
              />
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                Copy
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 