'use client';

import React from 'react';
import { Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface CalloutProps {
  variant?: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const variants = {
  info: {
    icon: Info,
    bgClass: 'bg-blue-50 dark:bg-blue-950/30',
    borderClass: 'border-blue-200 dark:border-blue-800',
    iconClass: 'text-blue-600 dark:text-blue-400',
    titleClass: 'text-blue-900 dark:text-blue-100',
    textClass: 'text-blue-800 dark:text-blue-200'
  },
  warning: {
    icon: AlertTriangle,
    bgClass: 'bg-yellow-50 dark:bg-yellow-950/30',
    borderClass: 'border-yellow-200 dark:border-yellow-800',
    iconClass: 'text-yellow-600 dark:text-yellow-400',
    titleClass: 'text-yellow-900 dark:text-yellow-100',
    textClass: 'text-yellow-800 dark:text-yellow-200'
  },
  success: {
    icon: CheckCircle,
    bgClass: 'bg-green-50 dark:bg-green-950/30',
    borderClass: 'border-green-200 dark:border-green-800',
    iconClass: 'text-green-600 dark:text-green-400',
    titleClass: 'text-green-900 dark:text-green-100',
    textClass: 'text-green-800 dark:text-green-200'
  },
  error: {
    icon: XCircle,
    bgClass: 'bg-red-50 dark:bg-red-950/30',
    borderClass: 'border-red-200 dark:border-red-800',
    iconClass: 'text-red-600 dark:text-red-400',
    titleClass: 'text-red-900 dark:text-red-100',
    textClass: 'text-red-800 dark:text-red-200'
  }
};

export function Callout({ 
  variant = 'info', 
  title, 
  children, 
  className = '' 
}: CalloutProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      className={`relative rounded-lg border p-4 ${config.bgClass} ${config.borderClass} ${className}`}
      role={variant === 'error' ? 'alert' : variant === 'warning' ? 'alert' : 'note'}
      aria-live={variant === 'error' || variant === 'warning' ? 'assertive' : 'polite'}
    >
      <div className="flex gap-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconClass}`} />
        
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`font-semibold mb-2 ${config.titleClass}`}>
              {title}
            </h3>
          )}
          
          <div className={`${config.textClass} leading-relaxed`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}