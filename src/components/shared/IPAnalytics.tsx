'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCommonTranslations } from '@/lib/i18n/hooks';
import { Globe, Network, Shield, Hash, Users, HardDrive } from 'lucide-react';

interface IPAnalyticsProps {
  ips: string;
  showTitle?: boolean;
  variant?: 'default' | 'compact';
}

interface IPStats {
  count: number;
  ipv4Count: number;
  ipv6Count: number;
  privateCount: number;
  publicCount: number;
  uniqueCount: number;
}

export function IPAnalytics({ ips, showTitle = true, variant = 'default' }: IPAnalyticsProps) {
  const { tSync } = useCommonTranslations();

  const stats: IPStats = useMemo(() => {
    // Helper function to check if IPv4 is private
    const isPrivateIPv4 = (ip: string): boolean => {
      const octets = ip.split('.').map(Number);
      if (octets.length !== 4 || octets.some(isNaN)) return false;
      
      const ipNum = (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
      
      return (
        (ipNum >= 0x0A000000 && ipNum <= 0x0AFFFFFF) || // 10.0.0.0/8
        (ipNum >= 0xAC100000 && ipNum <= 0xAC1FFFFF) || // 172.16.0.0/12
        (ipNum >= 0xC0A80000 && ipNum <= 0xC0A8FFFF)    // 192.168.0.0/16
      );
    };
    if (!ips || ips.trim().length === 0) {
      return {
        count: 0,
        ipv4Count: 0,
        ipv6Count: 0,
        privateCount: 0,
        publicCount: 0,
        uniqueCount: 0
      };
    }

    const ipList = ips.split('\n').filter(line => line.trim());
    const uniqueIPs = new Set();
    let ipv4Count = 0;
    let ipv6Count = 0;
    let privateCount = 0;
    let publicCount = 0;

    ipList.forEach(ip => {
      const cleanIP = ip.trim();
      if (!cleanIP) return;

      // Extract base IP (remove CIDR notation if present)
      const baseIP = cleanIP.split('/')[0];
      uniqueIPs.add(baseIP);

      // Determine IP version
      if (baseIP.includes(':')) {
        ipv6Count++;
        // Check if it's a private IPv6 address
        if (baseIP.startsWith('fc00:') || baseIP.startsWith('fd00:') || baseIP.startsWith('fe80:')) {
          privateCount++;
        } else {
          publicCount++;
        }
      } else if (baseIP.includes('.')) {
        ipv4Count++;
        // Check if it's a private IPv4 address
        if (isPrivateIPv4(baseIP)) {
          privateCount++;
        } else {
          publicCount++;
        }
      }
    });

    return {
      count: ipList.length,
      ipv4Count,
      ipv6Count,
      privateCount,
      publicCount,
      uniqueCount: uniqueIPs.size
    };
  }, [ips]);

  const statisticsData = [
    {
      key: 'count',
      label: tSync('analytics.count'),
      value: stats.count,
      icon: Hash,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'ipv4Count', 
      label: 'IPv4',
      value: stats.ipv4Count,
      icon: Globe,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      key: 'ipv6Count',
      label: 'IPv6', 
      value: stats.ipv6Count,
      icon: Network,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      key: 'privateCount',
      label: tSync('analytics.private'),
      value: stats.privateCount,
      icon: Shield,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      key: 'publicCount',
      label: tSync('analytics.public'),
      value: stats.publicCount,
      icon: Users,
      color: 'text-red-600 dark:text-red-400'
    },
    {
      key: 'uniqueCount',
      label: tSync('analytics.unique'),
      value: stats.uniqueCount,
      icon: HardDrive,
      color: 'text-indigo-600 dark:text-indigo-400'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {statisticsData.map(({ key, label, value, icon: Icon, color }) => (
          <div
            key={key}
            className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
          >
            <Icon className={`h-4 w-4 mb-1 ${color}`} />
            <span className="text-sm font-medium text-foreground">
              {typeof value === 'string' ? value : value.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground text-center">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className="w-full">
      {showTitle && (
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Network className="h-5 w-5 text-primary" />
            {tSync('analytics.ipAnalysis')}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {statisticsData.map(({ key, label, value, icon: Icon, color }) => (
            <div
              key={key}
              className="flex flex-col items-center p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Icon className={`h-5 w-5 mb-2 ${color}`} />
              <span className="text-lg font-semibold text-foreground text-center">
                {typeof value === 'string' ? value : value.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground text-center mt-1">{label}</span>
            </div>
          ))}
        </div>
        
        {/* AdSense Optimized Spacing */}
        <div className="mt-4 min-h-[50px] flex items-center justify-center">
          {/* This space can be used for ads - proper spacing from content */}
          <div className="w-full border-t border-border/50"></div>
        </div>
      </CardContent>
    </Card>
  );
}