'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw, Link, ExternalLink } from 'lucide-react';

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
  'youtube',
  'email',
  'newsletter',
  'blog',
  'referral',
  'direct',
  'other',
];

const commonMediums = [
  'cpc',
  'cpm',
  'social',
  'email',
  'display',
  'banner',
  'affiliate',
  'referral',
  'organic',
  'video',
  'audio',
  'other',
];

export default function UtmBuilderConverter() {
  const [params, setParams] = useState<UtmParams>(defaultParams);
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
    setParams(prev => ({ ...prev, [key]: value }));
    setError('');
  };

  const generateUrl = (): string => {
    if (!params.url) return '';
    if (!isValidUrl(params.url)) return 'Error: Please enter a valid URL';
    if (!params.source || !params.medium || !params.campaign) {
      return 'Error: Source, Medium, and Campaign are required';
    }

    try {
      const url = new URL(params.url);
      url.searchParams.set('utm_source', params.source);
      url.searchParams.set('utm_medium', params.medium);
      url.searchParams.set('utm_campaign', params.campaign);

      if (params.term) {
        url.searchParams.set('utm_term', params.term);
      }
      if (params.content) {
        url.searchParams.set('utm_content', params.content);
      }

      return url.toString();
    } catch (err) {
      return 'Error: Failed to generate URL';
    }
  };

  const getStats = () => {
    const generatedUrl = generateUrl();
    return {
      originalLength: params.url.length,
      finalLength: generatedUrl.startsWith('Error:') ? 0 : generatedUrl.length,
      paramCount: [
        params.source,
        params.medium,
        params.campaign,
        params.term,
        params.content,
      ].filter(p => p?.trim()).length,
    };
  };

  const handleClear = () => {
    setParams(defaultParams);
    setError('');
  };

  const handleCopy = () => {
    const result = generateUrl();
    if (!result.startsWith('Error:')) {
      navigator.clipboard.writeText(result);
    }
  };

  const handleDownload = () => {
    const result = generateUrl();
    if (result.startsWith('Error:')) return;

    const content = `UTM Campaign URL
Generated on: ${new Date().toLocaleString()}

Campaign Details:
- Source: ${params.source}
- Medium: ${params.medium}
- Campaign: ${params.campaign}
${params.term ? `- Term: ${params.term}` : ''}
${params.content ? `- Content: ${params.content}` : ''}

Original URL: ${params.url}
UTM URL: ${result}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'utm-campaign.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generatedUrl = generateUrl();
  const stats = getStats();

  return (
    <div className="w-full space-y-4">
      {/* URL Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
          Website URL *
        </label>
        <input
          type="url"
          className="w-full p-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
          placeholder="https://example.com"
          value={params.url}
          onChange={e => handleParamChange('url', e.target.value)}
        />
      </div>

      {/* UTM Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Campaign Source *
          </label>
          <select
            value={params.source}
            onChange={e => handleParamChange('source', e.target.value)}
            className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
          >
            <option value="">Select source...</option>
            {commonSources.map(source => (
              <option key={source} value={source}>
                {source.charAt(0).toUpperCase() + source.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Campaign Medium *
          </label>
          <select
            value={params.medium}
            onChange={e => handleParamChange('medium', e.target.value)}
            className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
          >
            <option value="">Select medium...</option>
            {commonMediums.map(medium => (
              <option key={medium} value={medium}>
                {medium.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Campaign Name *
          </label>
          <input
            type="text"
            className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
            placeholder="spring_sale_2024"
            value={params.campaign}
            onChange={e => handleParamChange('campaign', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Campaign Term (Optional)
          </label>
          <input
            type="text"
            className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
            placeholder="running+shoes"
            value={params.term}
            onChange={e => handleParamChange('term', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
          Campaign Content (Optional)
        </label>
        <input
          type="text"
          className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
          placeholder="logolink or textlink"
          value={params.content}
          onChange={e => handleParamChange('content', e.target.value)}
        />
      </div>

      {/* Generated URL */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
          Generated UTM URL
        </label>
        <div className="relative">
          <textarea
            className={`w-full min-h-[120px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y font-mono text-sm ${
              generatedUrl.startsWith('Error:')
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-900 dark:text-gray-100'
            }`}
            readOnly
            value={generatedUrl || 'Enter URL and campaign details above...'}
            placeholder="Generated UTM URL will appear here..."
          />
          {generatedUrl && !generatedUrl.startsWith('Error:') && (
            <a
              href={generatedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Test URL in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      {/* UTM Guide */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
          UTM Parameter Guide
        </h3>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>
            <strong>Source:</strong> Identifies which site sent the traffic
            (google, facebook, newsletter)
          </div>
          <div>
            <strong>Medium:</strong> Identifies the marketing medium (cpc,
            banner, email)
          </div>
          <div>
            <strong>Campaign:</strong> Identifies a specific product promotion
            or strategic campaign
          </div>
          <div>
            <strong>Term:</strong> Identifies search terms (for paid search
            campaigns)
          </div>
          <div>
            <strong>Content:</strong> Identifies what specifically was clicked
            to bring the user
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          disabled={!generatedUrl || generatedUrl.startsWith('Error:')}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Download Campaign
        </button>
        <button
          onClick={handleCopy}
          disabled={!generatedUrl || generatedUrl.startsWith('Error:')}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Copy className="h-4 w-4" />
          Copy URL
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Clear
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-4">
        <span>Original: {stats.originalLength} chars</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Final: {stats.finalLength} chars</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Parameters: {stats.paramCount}/5</span>
      </div>
    </div>
  );
}
