'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/hooks';
import { getLocaleFromPathname } from '@/lib/i18n';
import { usePathname } from 'next/navigation';
import { PageHeader } from '@/components/legal/PageHeader';
import { SectionCard } from '@/components/legal/SectionCard';
import { Callout } from '@/components/legal/Callout';
import { LegalLayout } from '@/components/legal/LegalLayout';
import { StructuredDataScript } from '@/components/legal/StructuredDataScript';
import { SITE_LEGAL_CONFIG } from '@/config/site-legal';
import { Shield, Zap, Users, Heart } from 'lucide-react';

export function AboutUsContent() {
  const { tSync: t } = useTranslation('legal');
  const pathname = usePathname();
  const currentLocale = getLocaleFromPathname(pathname);

  // Interpolate config values into translations
  const interpolate = (text: string, values: Record<string, string | number> = {}) => {
    const allValues: Record<string, string | number> = {
      companyName: SITE_LEGAL_CONFIG.companyName,
      contactEmail: SITE_LEGAL_CONFIG.contactEmail,
      ...values
    };

    return text.replace(/\{(\w+)\}/g, (match, key) => {
      const value = allValues[key];
      return value !== undefined ? String(value) : match;
    });
  };

  const tocSections = [
    { id: 'mission', title: t('about.sections.mission.title') },
    { id: 'how-it-works', title: t('about.sections.howItWorks.title') },
    { id: 'accessibility', title: t('about.sections.accessibility.title') },
    { id: 'roadmap', title: t('about.sections.roadmap.title') },
    { id: 'contact', title: t('about.sections.contact.title') }
  ];

  const valueIcons = [Shield, Zap, Users, Heart];

  return (
    <>
      <StructuredDataScript type="organization" locale={currentLocale} pathname={pathname} />
      <LegalLayout tocSections={tocSections} tocTitle={t('about.tableOfContents.title')}>
        <div className="space-y-8">
        {/* Header */}
        <PageHeader
          title={t('about.title')}
          subtitle={t('about.subtitle')}
          breadcrumbs={[
            { label: 'Home', href: currentLocale === 'en' ? '/' : '/ru' },
            { label: t('about.title') }
          ]}
        />

        {/* Mission & Value Proposition */}
        <SectionCard
          id="mission"
          title={t('about.sections.mission.title')}
        >
          <p className="text-lg leading-relaxed mb-6">{t('about.sections.mission.content')}</p>
          
          <div className="grid gap-6 md:grid-cols-2">
            {['0', '1', '2', '3'].map((index, i) => {
              const Icon = valueIcons[i];
              return (
                <div key={index} className="flex gap-4 p-4 border rounded-lg bg-muted/20">
                  <div className="flex-shrink-0">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      {t(`about.sections.mission.values.${index}.title`)}
                    </h4>
                    <p className="text-muted-foreground">
                      {t(`about.sections.mission.values.${index}.description`)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* How Our Tools Work */}
        <SectionCard
          id="how-it-works"
          title={t('about.sections.howItWorks.title')}
        >
          <p className="mb-6">{t('about.sections.howItWorks.intro')}</p>
          
          <div className="space-y-6">
            {/* Client-Side Processing */}
            <div className="border rounded-lg p-6 bg-muted/20">
              <h4 className="font-semibold mb-3">
                {t('about.sections.howItWorks.clientSide.title')}
              </h4>
              <p className="text-muted-foreground mb-4">
                {t('about.sections.howItWorks.clientSide.description')}
              </p>
              <ul className="space-y-2">
                {['0', '1', '2', '3'].map((index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>{t(`about.sections.howItWorks.clientSide.benefits.${index}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Server-Side Processing */}
            <div className="border rounded-lg p-6 bg-muted/10">
              <h4 className="font-semibold mb-3">
                {t('about.sections.howItWorks.serverSide.title')}
              </h4>
              <p className="text-muted-foreground mb-4">
                {t('about.sections.howItWorks.serverSide.description')}
              </p>
              <ul className="space-y-2">
                {['0', '1', '2', '3'].map((index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{t(`about.sections.howItWorks.serverSide.examples.${index}`)}</span>
                  </li>
                ))}
              </ul>
              <Callout variant="info" className="mt-4">
                <p>{t('about.sections.howItWorks.serverSide.privacy')}</p>
              </Callout>
            </div>
          </div>
        </SectionCard>


        {/* Accessibility Commitment */}
        <SectionCard
          id="accessibility"
          title={t('about.sections.accessibility.title')}
        >
          <p className="mb-6">{t('about.sections.accessibility.intro')}</p>
          
          <div className="grid gap-4 md:grid-cols-2">
            {['0', '1', '2', '3'].map((index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">
                  {t(`about.sections.accessibility.features.${index}.title`)}
                </h4>
                <p className="text-muted-foreground">
                  {t(`about.sections.accessibility.features.${index}.description`)}
                </p>
              </div>
            ))}
          </div>
          
          <Callout variant="info" className="mt-6">
            <p>{interpolate(t('about.sections.accessibility.feedback'))}</p>
          </Callout>
        </SectionCard>

        {/* Development Roadmap */}
        <SectionCard
          id="roadmap"
          title={t('about.sections.roadmap.title')}
        >
          <p className="mb-6">{t('about.sections.roadmap.intro')}</p>
          
          <div className="space-y-4">
            {['0', '1', '2', '3'].map((index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-muted/20 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">
                    {t(`about.sections.roadmap.upcoming.${index}.title`)}
                  </h4>
                  <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                    {t(`about.sections.roadmap.upcoming.${index}.timeline`)}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  {t(`about.sections.roadmap.upcoming.${index}.description`)}
                </p>
              </div>
            ))}
          </div>
          
          <Callout variant="success" className="mt-6">
            <p>{t('about.sections.roadmap.feedback')}</p>
          </Callout>
        </SectionCard>

        {/* Contact & Partnerships */}
        <SectionCard
          id="contact"
          title={t('about.sections.contact.title')}
        >
          <p className="mb-6">{t('about.sections.contact.intro')}</p>
          
          <div className="grid gap-4 md:grid-cols-2">
            {['0', '1', '2', '3'].map((index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">
                  {t(`about.sections.contact.purposes.${index}.title`)}
                </h4>
                <p className="text-muted-foreground">
                  {t(`about.sections.contact.purposes.${index}.description`)}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-muted/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>{t('about.responseTime')}</strong> {t('about.sections.contact.response')}
            </p>
          </div>
        </SectionCard>
        </div>
      </LegalLayout>
    </>
  );
}

