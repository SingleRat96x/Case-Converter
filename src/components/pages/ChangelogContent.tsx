'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/hooks';
import { Clock, Package, Sparkles, Wrench, Bug, AlertTriangle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ChangelogStructuredData } from '@/components/seo/ChangelogStructuredData';

export function ChangelogContent() {
  const { tSync: t } = useTranslation('pages/changelog');

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
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/50 border-green-300 dark:border-green-800';
      case 'improved':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800';
      case 'fixed':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/50 border-orange-300 dark:border-orange-800';
      case 'deprecated':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/50 border-red-300 dark:border-red-800';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-950/50 border-gray-300 dark:border-gray-800';
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
    },
    {
      title: t('sample.month3.title'),
      entries: [
        {
          type: t('sample.month3.entries.1.type'),
          title: t('sample.month3.entries.1.title'),
          description: t('sample.month3.entries.1.description'),
          date: t('sample.month3.entries.1.date')
        },
        {
          type: t('sample.month3.entries.2.type'),
          title: t('sample.month3.entries.2.title'),
          description: t('sample.month3.entries.2.description'),
          date: t('sample.month3.entries.2.date')
        },
        {
          type: t('sample.month3.entries.3.type'),
          title: t('sample.month3.entries.3.title'),
          description: t('sample.month3.entries.3.description'),
          date: t('sample.month3.entries.3.date')
        }
      ]
    }
  ];

  return (
    <Layout>
      <ChangelogStructuredData />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Package className="w-10 h-10 text-primary" />
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

          {/* Timeline View */}
          <div className="space-y-12">
            {sampleMonths.map((month, monthIndex) => (
              <div key={monthIndex} className="space-y-8">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-foreground">
                    {month.title}
                  </h2>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
                
                <div className="relative pl-8 space-y-8">
                  {/* Timeline line */}
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border"></div>
                  
                  {month.entries.map((entry, entryIndex) => (
                    <div key={entryIndex} className="relative">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[26px] w-4 h-4 rounded-full border-2 ${getCategoryColor(entry.type)} bg-background`}></div>
                      
                      {/* Entry content - flat design without card borders */}
                      <div className="group">
                        <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${getCategoryColor(entry.type)}`}>
                              {getCategoryIcon(entry.type)}
                            </div>
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getCategoryColor(entry.type)}`}>
                              {t(`categories.${entry.type}`)}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {entry.date}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {entry.title}
                        </h3>
                        
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {entry.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Subscribe Section */}
          <div className="mt-16 p-8 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
            <div className="text-center max-w-xl mx-auto">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {t('subscribe.title')}
              </h3>
              <p className="text-base text-muted-foreground mb-6">
                {t('subscribe.description')}
              </p>
              <button className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
                {t('subscribe.button')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
