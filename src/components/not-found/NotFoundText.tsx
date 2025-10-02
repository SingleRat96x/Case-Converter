'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCommonTranslations } from '@/lib/i18n/hooks';
import { usePathname } from 'next/navigation';
import { getLocaleFromPathname } from '@/lib/i18n';
import React from 'react';

export default function NotFoundText() {
  const { tSync: t, isLoaded } = useCommonTranslations();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const homeHref = locale === 'en' ? '/' : '/ru/';
  const toolsHref = locale === 'en' ? '/tools' : '/ru/tools';

  return (
    <div className="max-w-xl mx-auto text-center space-y-6">
      <div className="text-6xl font-extrabold tracking-tight">404</div>
      {!isLoaded ? (
        <>
          <div className="h-6 bg-muted rounded mx-auto w-2/3" />
          <div className="h-4 bg-muted rounded mx-auto w-1/2" />
        </>
      ) : (
        <>
          <h1 className="text-2xl md:text-3xl font-bold">{t('notFound.title')}</h1>
          <p className="text-muted-foreground">{t('notFound.description')}</p>
        </>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild>
          <Link href={homeHref}>{t('notFound.backHome')}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={toolsHref}>{t('notFound.viewTools')}</Link>
        </Button>
      </div>
    </div>
  );
}

