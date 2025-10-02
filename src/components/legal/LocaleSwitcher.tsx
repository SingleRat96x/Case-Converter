'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { getLocalizedPathname, locales, localeNames } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

interface LocaleSwitcherProps {
  currentLocale: Locale;
  className?: string;
  showLabel?: boolean;
}

export function LocaleSwitcher({ 
  currentLocale, 
  className = '',
  showLabel = true 
}: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;
    
    const newPathname = getLocalizedPathname(pathname, newLocale);
    router.push(newPathname);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Globe className="w-4 h-4" />
          <span>Language:</span>
        </div>
      )}
      
      <div className="flex rounded-lg border bg-background overflow-hidden">
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => switchLocale(locale)}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              locale === currentLocale
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
            aria-current={locale === currentLocale ? 'page' : undefined}
            title={`Switch to ${localeNames[locale]}`}
          >
            {localeNames[locale]}
          </button>
        ))}
      </div>
    </div>
  );
}