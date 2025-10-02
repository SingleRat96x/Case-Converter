'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, Binary, FileUp, FileDown, Percent, Activity } from 'lucide-react';

export interface DataStat {
  key: string;
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: string;
  suffix?: string;
}

interface DataStatsProps {
  title?: string;
  stats: DataStat[];
  variant?: 'default' | 'compact' | 'inline';
  showIcons?: boolean;
  className?: string;
}

export function DataStats({ 
  title, 
  stats, 
  variant = 'default', 
  showIcons = true,
  className = '' 
}: DataStatsProps) {
  
  if (variant === 'inline') {
    return (
      <div className={`text-center text-sm text-muted-foreground space-y-1 ${className}`}>
        {stats.map((stat, index) => (
          <p key={stat.key}>
            {index > 0 && <span className="mx-2">|</span>}
            <span className="font-medium">{stat.label}:</span>{' '}
            <span className="text-foreground">
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              {stat.suffix && ` ${stat.suffix}`}
            </span>
          </p>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 ${className}`}>
        {stats.map(({ key, label, value, icon: Icon, color = 'text-muted-foreground', suffix }) => (
          <div
            key={key}
            className="flex flex-col items-center p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
          >
            {showIcons && Icon && (
              <Icon className={`h-4 w-4 mb-1 ${color}`} />
            )}
            <span className="text-sm font-medium text-foreground">
              {typeof value === 'number' ? value.toLocaleString() : value}
              {suffix && ` ${suffix}`}
            </span>
            <span className="text-xs text-muted-foreground text-center">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  // Default variant
  return (
    <Card className={className}>
      {title && (
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? '' : 'pt-6'}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {stats.map(({ key, label, value, icon: Icon, color = 'text-muted-foreground', suffix }) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center gap-2">
                {showIcons && Icon && (
                  <Icon className={`h-4 w-4 ${color}`} />
                )}
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
              <p className="text-2xl font-semibold text-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
                {suffix && <span className="text-sm font-normal ml-1">{suffix}</span>}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Commonly used icons for data stats
export const DataStatsIcons = {
  input: FileUp,
  output: FileDown,
  ratio: Percent,
  size: Binary,
  performance: Activity,
} as const;