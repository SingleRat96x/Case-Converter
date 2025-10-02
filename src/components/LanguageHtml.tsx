'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function LanguageHtml({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine language based on pathname
  const lang = pathname.startsWith('/ru') ? 'ru' : 'en';

  // Only update the lang attribute after mounting to avoid hydration mismatch
  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = lang;
    }
  }, [lang, mounted]);

  return <>{children}</>;
}
