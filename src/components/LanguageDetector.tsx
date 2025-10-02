'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getLocaleFromPathname } from '@/lib/i18n';
import { htmlLangCodes } from '@/lib/seo';

export function LanguageDetector() {
  const pathname = usePathname();

  useEffect(() => {
    // Update HTML lang attribute based on current locale
    const currentLocale = getLocaleFromPathname(pathname);
    const htmlLang = htmlLangCodes[currentLocale];
    
    if (document.documentElement.lang !== htmlLang) {
      document.documentElement.lang = htmlLang;
    }
  }, [pathname]);

  return null; // This component doesn't render anything
}