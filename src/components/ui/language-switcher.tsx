'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { locales, localeInfo } from '@/i18n/routing';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    // Get the path without the locale prefix
    const segments = pathname.split('/');
    const currentLocaleInPath = segments[1];
    
    // Check if the current path has a locale prefix
    let newPath;
    if (locales.includes(currentLocaleInPath as any)) {
      // Replace the locale in the path
      segments[1] = newLocale;
      newPath = segments.join('/');
    } else {
      // Add the new locale to the path
      newPath = `/${newLocale}${pathname}`;
    }
    
    // For default locale (en), we don't need the prefix
    if (newLocale === 'en' && newPath.startsWith('/en')) {
      newPath = newPath.slice(3) || '/';
    }
    
    router.push(newPath);
    router.refresh();
  };

  return (
    <div className="flex items-center">
      <Globe className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
      <Select value={locale} onValueChange={handleLocaleChange}>
        <SelectTrigger className="w-[140px] h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {locales.map((loc) => {
            const info = localeInfo[loc];
            
            return (
              <SelectItem key={loc} value={loc}>
                <span className="flex items-center justify-between w-full">
                  <span>{info.name}</span>
                  {info.dir === 'rtl' && (
                    <span className="ms-2 text-xs text-muted-foreground">(RTL)</span>
                  )}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}