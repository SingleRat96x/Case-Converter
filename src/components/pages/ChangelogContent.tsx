'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/hooks';
import { getLocaleFromPathname } from '@/lib/i18n';
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Package, Sparkles, Wrench, Bug, AlertTriangle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

export function ChangelogContent() {
  const { tSync: t } = useTranslation('pages/changelog');
  const pathname = usePathname();
  const currentLocale = getLocaleFromPathname(pathname);

  // Get category icon
  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'new':
        return <Sparkles className="w-5 h-5" />;
      case 'improved':
        return <Wrench className="w-5 h-5" />;
      case 'fixed':
        return <Bug className="w-5 h-5" />;
      case 'deprecated':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  // Get category color classes
  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'new':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
      case 'improved':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
      case 'fixed':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800';
      case 'deprecated':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800';
    }
  };

  // Sample data structure
  const sampleMonths = [
    {
      title: t('sample.month1.title'),
      entries: [
        {
          type: t('sample.month1.entries.1.type'),
          title: t('sample.month1.entries.1.title'),
          description: t('sample.month1.entries.1.description'),
          date: t('sample.month1.entries.1.date')
        },
        {
          type: t('sample.month1.entries.2.type'),
          title: t('sample.month1.entries.2.title'),
          description: t('sample.month1.entries.2.description'),
          date: t('sample.month1.entries.2.date')
        }
      ]
    },
    {
      title: t('sample.month2.title'),
      entries: [
        {
          type: t('sample.month2.entries.1.type'),
          title: t('sample.month2.entries.1.title'),
          description: t('sample.month2.entries.1.description'),
          date: t('sample.month2.entries.1.date')
        },
        {
          type: t('sample.month2.entries.2.type'),
          title: t('sample.month2.entries.2.title'),
          description: t('sample.month2.entries.2.description'),
          date: t('sample.month2.entries.2.date')
        },
        {
          type: t('sample.month2.entries.3.type'),
          title: t('sample.month2.entries.3.title'),
          description: t('sample.month2.entries.3.description'),
          date: t('sample.month2.entries.3.date')
        },
        {
          type: t('sample.month2.entries.4.type'),
          title: t('sample.month2.entries.4.title'),
          description: t('sample.month2.entries.4.description'),
          date: t('sample.month2.entries.4.date')
        },
        {
          type: t('sample.month2.entries.5.type'),
          title: t('sample.month2.entries.5.title'),
          description: t('sample.month2.entries.5.description'),
          date: t('sample.month2.entries.5.date')
        }
      ]
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Package className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                {t('title')}
              </h1>
            </div>
            <p className="text-lg text-muted-foreground mb-2">
              {t('subtitle')}
            </p>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              {t('description')}
            </p>
          </div>

          {/* Preview Notice */}
          <Card className="mb-12 border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {t('sectionTitle')}
              </CardTitle>
              <CardDescription>
                {t('sectionDescription')}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Layout Option 1: Simple List */}
          <section className="mb-16">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t('layoutOptions.option1')}
              </h2>
              <div className="h-1 w-20 bg-primary rounded-full"></div>
            </div>

            <div className="space-y-8">
              {sampleMonths.map((month, monthIndex) => (
                <div key={monthIndex} className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground border-b border-border pb-2">
                    {month.title}
                  </h3>
                  <ul className="space-y-3">
                    {month.entries.map((entry, entryIndex) => (
                      <li key={entryIndex} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`mt-0.5 p-2 rounded-lg ${getCategoryColor(entry.type)}`}>
                          {getCategoryIcon(entry.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <h4 className="font-semibold text-foreground">{entry.title}</h4>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {entry.date}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Layout Option 2: Card Layout */}
          <section className="mb-16">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t('layoutOptions.option2')}
              </h2>
              <div className="h-1 w-20 bg-primary rounded-full"></div>
            </div>

            <div className="space-y-8">
              {sampleMonths.map((month, monthIndex) => (
                <div key={monthIndex} className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground border-b border-border pb-2">
                    {month.title}
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {month.entries.map((entry, entryIndex) => (
                      <Card key={entryIndex} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className={`p-2 rounded-lg ${getCategoryColor(entry.type)}`}>
                              {getCategoryIcon(entry.type)}
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getCategoryColor(entry.type)}`}>
                              {t(`categories.${entry.type}`)}
                            </span>
                          </div>
                          <CardTitle className="text-lg">{entry.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">{entry.description}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {entry.date}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Layout Option 3: Timeline View */}
          <section className="mb-16">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t('layoutOptions.option3')}
              </h2>
              <div className="h-1 w-20 bg-primary rounded-full"></div>
            </div>

            <div className="space-y-8">
              {sampleMonths.map((month, monthIndex) => (
                <div key={monthIndex} className="space-y-6">
                  <h3 className="text-xl font-semibold text-foreground border-b border-border pb-2">
                    {month.title}
                  </h3>
                  <div className="relative pl-8 space-y-6">
                    {/* Timeline line */}
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border"></div>
                    
                    {month.entries.map((entry, entryIndex) => (
                      <div key={entryIndex} className="relative">
                        {/* Timeline dot */}
                        <div className={`absolute -left-[26px] w-4 h-4 rounded-full border-2 ${getCategoryColor(entry.type)} bg-background`}></div>
                        
                        <Card className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${getCategoryColor(entry.type)}`}>
                                  {getCategoryIcon(entry.type)}
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getCategoryColor(entry.type)}`}>
                                  {t(`categories.${entry.type}`)}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {entry.date}
                              </span>
                            </div>
                            <CardTitle className="text-lg mt-2">{entry.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{entry.description}</p>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Subscribe Section */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t('subscribe.title')}</CardTitle>
              <CardDescription className="text-base">
                {t('subscribe.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <button className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                {t('subscribe.button')}
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
