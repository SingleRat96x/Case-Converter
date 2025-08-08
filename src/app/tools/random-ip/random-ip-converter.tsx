'use client';

import { useState } from 'react';
import { CaseConverterButtons } from '@/components/shared/CaseConverterButtons';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { generateTextStats } from '@/app/components/shared/TextAnalytics';

export function RandomIpConverter() {
  const [ipVersion, setIpVersion] = useState<'ipv4' | 'ipv6'>('ipv4');
  const [result, setResult] = useState('');

  const generateRandomIpv4 = () => {
    const octets = Array.from({ length: 4 }, () => 
      Math.floor(Math.random() * 256)
    );
    return octets.join('.');
  };

  const generateRandomIpv6 = () => {
    const segments = Array.from({ length: 8 }, () => 
      Math.floor(Math.random() * 65536)
        .toString(16)
        .padStart(4, '0')
    );
    return segments.join(':');
  };

  const generateRandomIp = () => {
    const ip = ipVersion === 'ipv4' ? generateRandomIpv4() : generateRandomIpv6();
    setResult(ip);
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'random-ip.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
  };

  const handleClear = () => {
    setResult('');
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>IP Version</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="ipv4"
                    checked={ipVersion === 'ipv4'}
                    onChange={(e) => setIpVersion(e.target.value as 'ipv4')}
                    className="h-4 w-4"
                  />
                  <span>IPv4</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="ipv6"
                    checked={ipVersion === 'ipv6'}
                    onChange={(e) => setIpVersion(e.target.value as 'ipv6')}
                    className="h-4 w-4"
                  />
                  <span>IPv6</span>
                </label>
              </div>
            </div>
          </div>
          <Button 
            onClick={generateRandomIp}
            className="w-full"
          >
            Generate Random IP Address
          </Button>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="output">Random IP Address Result</Label>
            <div
              id="output"
              className="min-h-[200px] p-4 rounded-md bg-muted font-mono break-all whitespace-pre-wrap"
            >
              {result}
            </div>
          </div>
          <CaseConverterButtons
            onDownload={handleDownload}
            onCopy={handleCopy}
            onClear={handleClear}
            stats={generateTextStats(result)}
          />
        </Card>
      </div>
    </div>
  );
} 