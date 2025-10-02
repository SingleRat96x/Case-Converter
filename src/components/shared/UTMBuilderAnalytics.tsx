'use client';

import React, { useMemo } from 'react';
// Removed unused Card imports and tool translations
import { 
  Hash,
  Target,
  FileText,
  Globe,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface UTMParameters {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
  url: string;
}

interface UTMBuilderAnalyticsProps {
  parameters: UTMParameters;
  generatedURL: string;
  variant?: 'default' | 'compact';
}

interface UTMStats {
  baseUrlLength: number;
  totalUrlLength: number;
  parameterCount: number;
  requiredParamsComplete: number;
  optionalParamsUsed: number;
  urlStatus: 'Valid' | 'Invalid' | 'Too Long';
  campaignType: string;
  trackingComplete: boolean;
}

export function UTMBuilderAnalytics({ 
  parameters, 
  generatedURL, 
  variant = 'default' 
}: UTMBuilderAnalyticsProps) {
  
  const stats: UTMStats = useMemo(() => {
    const baseUrlLength = parameters.url ? parameters.url.length : 0;
    const totalUrlLength = generatedURL ? generatedURL.length : 0;
    
    const requiredParams = [parameters.source, parameters.medium, parameters.campaign];
    const optionalParams = [parameters.term, parameters.content];
    
    const requiredParamsComplete = requiredParams.filter(p => p.trim().length > 0).length;
    const optionalParamsUsed = optionalParams.filter(p => p.trim().length > 0).length;
    const parameterCount = requiredParamsComplete + optionalParamsUsed;
    
    let urlStatus: 'Valid' | 'Invalid' | 'Too Long' = 'Invalid';
    if (generatedURL) {
      if (totalUrlLength > 2083) {
        urlStatus = 'Too Long';
      } else if (requiredParamsComplete === 3 && baseUrlLength > 0) {
        urlStatus = 'Valid';
      }
    }
    
    // Determine campaign type based on medium and source
    let campaignType = 'Generic';
    if (parameters.medium && parameters.source) {
      if (parameters.medium === 'email') {
        campaignType = 'Email Marketing';
      } else if (parameters.medium === 'social') {
        campaignType = parameters.source;
      } else if (parameters.medium === 'cpc') {
        campaignType = 'Paid Search';
      } else if (parameters.medium === 'organic') {
        campaignType = 'Organic Search';
      } else if (parameters.medium === 'display') {
        campaignType = 'Display Advertising';
      } else if (parameters.medium === 'referral') {
        campaignType = 'Referral Traffic';
      }
    }
    
    const trackingComplete = requiredParamsComplete === 3 && baseUrlLength > 0;

    return {
      baseUrlLength,
      totalUrlLength,
      parameterCount,
      requiredParamsComplete,
      optionalParamsUsed,
      urlStatus,
      campaignType,
      trackingComplete
    };
  }, [parameters, generatedURL]);

  const statisticsData = [
    {
      key: 'baseUrlLength',
      label: 'Base URL Length',
      value: stats.baseUrlLength,
      icon: Globe,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'totalUrlLength', 
      label: 'Total URL Length',
      value: stats.totalUrlLength,
      icon: FileText,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      key: 'parameterCount',
      label: 'UTM Parameters',
      value: stats.parameterCount,
      icon: Hash,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      key: 'requiredParams',
      label: 'Required Complete',
      value: `${stats.requiredParamsComplete}/3`,
      icon: Target,
      color: 'text-orange-600 dark:text-orange-400',
      isText: true
    },
    {
      key: 'campaignType',
      label: 'Campaign Type',
      value: stats.campaignType,
      icon: Zap,
      color: 'text-indigo-600 dark:text-indigo-400',
      isText: true
    },
    {
      key: 'status',
      label: 'URL Status',
      value: stats.urlStatus,
      icon: CheckCircle2,
      color: stats.urlStatus === 'Valid' 
        ? 'text-green-600 dark:text-green-400' 
        : stats.urlStatus === 'Too Long'
        ? 'text-red-600 dark:text-red-400'
        : 'text-yellow-600 dark:text-yellow-400',
      isText: true
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="space-y-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {statisticsData.map(({ key, label, value, icon: Icon, color, isText }) => (
            <div
              key={key}
              className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
            >
              <Icon className={`h-4 w-4 mb-1 ${color}`} />
              <span className="text-sm font-medium text-foreground">
                {isText ? value : typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              <span className="text-xs text-muted-foreground text-center">{label}</span>
            </div>
          ))}
        </div>

        {/* AdSense Optimized Spacing */}
        <div className="mt-4 min-h-[50px] flex items-center justify-center">
          <div className="w-full border-t border-border/50"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {statisticsData.map(({ key, label, value, icon: Icon, color, isText }) => (
          <div
            key={key}
            className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
          >
            <Icon className={`h-4 w-4 mb-1 ${color}`} />
            <span className="text-sm font-medium text-foreground">
              {isText ? value : typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            <span className="text-xs text-muted-foreground text-center">{label}</span>
          </div>
        ))}
      </div>

      {/* AdSense Optimized Spacing */}
      <div className="mt-4 min-h-[50px] flex items-center justify-center">
        <div className="w-full border-t border-border/50"></div>
      </div>
    </div>
  );
}