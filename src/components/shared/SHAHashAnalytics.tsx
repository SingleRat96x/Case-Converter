'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Hash, 
  Shield, 
  Clock, 
  Copy,
  AlertTriangle,
  CheckCircle2,
  Info,
  Binary,
  FileText
} from 'lucide-react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { getHashSecurityInfo, formatHashForDisplay, getCollisionProbability, HashResult } from '@/lib/shaHashUtils';
import { ReportDownloadButton } from './ReportDownloadButton';

interface SHAHashAnalyticsProps {
  hashResult: HashResult | null;
  inputText: string;
  hmacKey?: string;
  encoding: 'hex' | 'base64' | 'binary';
}

export function SHAHashAnalytics({ 
  hashResult, 
  inputText,
  hmacKey,
  encoding
}: SHAHashAnalyticsProps) {
  const { tool } = useToolTranslations('tools/seo-content/sha256-hash-generator');
  
  if (!hashResult) {
    return (
      <Card className="p-6 bg-muted/50">
        <div className="flex items-center justify-center text-muted-foreground">
          <Info className="mr-2 h-4 w-4" />
          <span>{tool('analytics.noHashGenerated')}</span>
        </div>
      </Card>
    );
  }

  const securityInfo = getHashSecurityInfo(hashResult.algorithm as 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512');
  const collisionProbability = getCollisionProbability(hashResult.bitLength, 1000000);
  const formattedHash = encoding === 'hex' ? formatHashForDisplay(hashResult.hash) : hashResult.hash;

  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(hashResult.hash);
    } catch (err) {
      console.error('Failed to copy hash:', err);
    }
  };

  const generateReport = () => {
    const report = {
      title: 'SHA Hash Generation Report',
      generatedAt: new Date().toISOString(),
      input: {
        text: inputText.substring(0, 100) + (inputText.length > 100 ? '...' : ''),
        length: inputText.length,
        hmacEnabled: !!hmacKey,
      },
      output: {
        hash: hashResult.hash,
        algorithm: hashResult.algorithm,
        encoding: encoding,
        bitLength: hashResult.bitLength,
        charLength: hashResult.length,
        processingTime: `${hashResult.processingTime.toFixed(2)}ms`,
      },
      security: {
        isSecure: securityInfo.secure,
        isDeprecated: securityInfo.deprecated,
        recommendation: securityInfo.recommendation,
        useCase: securityInfo.useCase,
        collisionProbability: collisionProbability,
      },
      timestamp: hashResult.timestamp,
    };

    return {
      content: JSON.stringify(report, null, 2),
      filename: `sha-hash-report-${Date.now()}.json`,
      mimeType: 'application/json' as const,
    };
  };

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <Hash className="mr-2 h-5 w-5" />
        {tool('analytics.title')}
      </h3>

      {/* Hash Output Display */}
      <Card className="p-4 bg-muted/50">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{tool('analytics.generatedHash')}</p>
              <div className="font-mono text-sm break-all p-3 bg-background rounded-md border">
                {formattedHash}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyHash}
              className="ml-2 mt-6"
              title={tool('actions.copyHash')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Security Status */}
      <Card className={`p-4 ${securityInfo.deprecated ? 'border-destructive/50 bg-destructive/5' : 'border-green-500/50 bg-green-500/5'}`}>
        <div className="flex items-start space-x-3">
          {securityInfo.deprecated ? (
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-semibold text-sm mb-1">
              {tool('analytics.securityStatus')}
            </p>
            <p className="text-sm text-muted-foreground">{securityInfo.recommendation}</p>
            <p className="text-xs text-muted-foreground mt-1">
              <strong>{tool('analytics.recommendedUse')}:</strong> {securityInfo.useCase}
            </p>
          </div>
        </div>
      </Card>

      {/* Hash Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{tool('analytics.algorithm')}</p>
              <p className="text-xl font-semibold">{hashResult.algorithm}</p>
            </div>
            <Shield className="h-8 w-8 text-muted-foreground/50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{tool('analytics.hashLength')}</p>
              <p className="text-xl font-semibold">{hashResult.length} {tool('analytics.chars')}</p>
              <p className="text-xs text-muted-foreground">{hashResult.bitLength} {tool('analytics.bits')}</p>
            </div>
            <Binary className="h-8 w-8 text-muted-foreground/50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{tool('analytics.processingTime')}</p>
              <p className="text-xl font-semibold">{hashResult.processingTime.toFixed(2)} ms</p>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground/50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{tool('analytics.encoding')}</p>
              <p className="text-xl font-semibold capitalize">{encoding}</p>
            </div>
            <FileText className="h-8 w-8 text-muted-foreground/50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{tool('analytics.hmacMode')}</p>
              <p className="text-xl font-semibold">{hmacKey ? tool('analytics.enabled') : tool('analytics.disabled')}</p>
            </div>
            <Hash className="h-8 w-8 text-muted-foreground/50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{tool('analytics.collisionRisk')}</p>
              <p className="text-sm font-semibold">{collisionProbability}</p>
            </div>
            <Info className="h-8 w-8 text-muted-foreground/50" />
          </div>
        </Card>
      </div>

      {/* Technical Details */}
      <Card className="p-4">
        <h4 className="font-semibold text-sm mb-3">{tool('analytics.technicalDetails')}</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{tool('analytics.inputLength')}:</span>
            <span className="font-mono">{inputText.length} {tool('analytics.characters')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{tool('analytics.outputFormat')}:</span>
            <span className="font-mono">{encoding.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{tool('analytics.timestamp')}:</span>
            <span className="font-mono">{hashResult.timestamp.toLocaleString()}</span>
          </div>
        </div>
      </Card>

      {/* Download Report */}
      <div className="flex justify-end">
        <ReportDownloadButton generateReport={generateReport} />
      </div>
    </div>
  );
}