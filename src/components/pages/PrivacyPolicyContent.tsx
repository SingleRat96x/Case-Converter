'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/hooks';
import { getLocaleFromPathname } from '@/lib/i18n';
import { usePathname } from 'next/navigation';
import { PageHeader } from '@/components/legal/PageHeader';
import { SectionCard } from '@/components/legal/SectionCard';
import { KeyValueTable } from '@/components/legal/KeyValueTable';
import { Callout } from '@/components/legal/Callout';
import { LegalLayout } from '@/components/legal/LegalLayout';
import { StructuredDataScript } from '@/components/legal/StructuredDataScript';
import { SITE_LEGAL_CONFIG } from '@/config/site-legal';

export function PrivacyPolicyContent() {
  const { tSync: t } = useTranslation('legal');
  const pathname = usePathname();
  const currentLocale = getLocaleFromPathname(pathname);

  // Interpolate config values into translations
  const interpolate = (text: string, values: Record<string, string | number> = {}) => {
    const allValues: Record<string, string | number> = {
      companyName: SITE_LEGAL_CONFIG.companyName,
      domain: SITE_LEGAL_CONFIG.domain,
      privacyEmail: SITE_LEGAL_CONFIG.privacyEmail,
      contactEmail: SITE_LEGAL_CONFIG.contactEmail,
      minimumAge: SITE_LEGAL_CONFIG.minimumAge,
      analyticsRetention: SITE_LEGAL_CONFIG.dataRetention.analytics,
      logsRetention: SITE_LEGAL_CONFIG.dataRetention.logs,
      cookiesRetention: SITE_LEGAL_CONFIG.dataRetention.cookies,
      contactRetention: SITE_LEGAL_CONFIG.dataRetention.contactForms,
      responseDays: '30',
      version: SITE_LEGAL_CONFIG.policyVersion,
      date: SITE_LEGAL_CONFIG.lastUpdated,
      ...values
    };

    return text.replace(/\{(\w+)\}/g, (match, key) => {
      const value = allValues[key];
      return value !== undefined ? String(value) : match;
    });
  };

  const tocSections = [
    { id: 'summary', title: t('privacy.summary.title') },
    { id: 'introduction', title: t('privacy.sections.introduction.title') },
    { id: 'data-processing', title: t('privacy.sections.dataProcessing.title') },
    { id: 'legal-bases', title: t('privacy.sections.legalBases.title') },
    { id: 'data-use', title: t('privacy.sections.dataUse.title') },
    { id: 'data-sharing', title: t('privacy.sections.dataSharing.title') },
    { id: 'international-transfers', title: t('privacy.sections.internationalTransfers.title') },
    { id: 'retention', title: t('privacy.sections.retention.title') },
    { id: 'security', title: t('privacy.sections.security.title') },
    { id: 'rights', title: t('privacy.sections.rights.title') },
    { id: 'opt-out', title: t('privacy.sections.optOut.title') },
    { id: 'children', title: t('privacy.sections.children.title') },
    { id: 'contact', title: t('privacy.sections.contact.title') },
    { id: 'changes', title: t('privacy.sections.changes.title') },
    { id: 'cookies', title: t('cookies.title') }
  ];

  const cookieColumns = [
    { key: 'name', label: t('cookies.table.headers.name'), width: '20%' },
    { key: 'purpose', label: t('cookies.table.headers.purpose'), width: '35%' },
    { key: 'duration', label: t('cookies.table.headers.duration'), width: '15%' },
    { key: 'type', label: t('cookies.table.headers.type'), width: '15%' },
    { key: 'category', label: t('cookies.table.headers.category'), width: '15%' }
  ];

  const cookieData = SITE_LEGAL_CONFIG.cookies.map(cookie => ({
    name: cookie.name,
    purpose: t(`cookies.cookiePurposes.${cookie.name}`),
    duration: cookie.duration,
    type: t(`cookies.types.${cookie.type}`),
    category: t(`cookies.categories.${cookie.category}`)
  }));

  return (
    <>
      <StructuredDataScript type="privacy" locale={currentLocale} pathname={pathname} />
      <LegalLayout tocSections={tocSections} tocTitle={t('privacy.tableOfContents.title')}>
        <div className="space-y-8">
        {/* Header */}
        <PageHeader
          title={t('privacy.title')}
          lastUpdated={interpolate(t('privacy.lastUpdated'))}
          version={interpolate(t('privacy.version'))}
          effectiveDate={interpolate(t('privacy.effectiveDate'))}
          breadcrumbs={[
            { label: 'Home', href: currentLocale === 'en' ? '/' : '/ru' },
            { label: t('privacy.title') }
          ]}
        />

        {/* Plain-English Summary */}
        <SectionCard
          id="summary"
          title={t('privacy.summary.title')}
          summary={t('privacy.summary.intro')}
        >
          <ul className="space-y-2">
            {['0', '1', '2', '3'].map((index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>{t(`privacy.summary.points.${index}`)}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Introduction & Scope */}
        <SectionCard
          id="introduction"
          title={t('privacy.sections.introduction.title')}
        >
          <p>{interpolate(t('privacy.sections.introduction.content'))}</p>
        </SectionCard>

        {/* Data We Process */}
        <SectionCard
          id="data-processing"
          title={t('privacy.sections.dataProcessing.title')}
          summary={t('privacy.sections.dataProcessing.subtitle')}
        >
          <div className="space-y-6">
            {['0', '1', '2', '3'].map((index) => (
              <div key={index} className="border-l-4 border-primary/20 pl-4">
                <h4 className="font-semibold mb-2">
                  {t(`privacy.sections.dataProcessing.categories.${index}.title`)}
                </h4>
                <p className="text-muted-foreground mb-2">
                  {t(`privacy.sections.dataProcessing.categories.${index}.description`)}
                </p>
                <p className="text-sm text-muted-foreground italic">
                  <strong>{t('privacy.examples')}</strong> {t(`privacy.sections.dataProcessing.categories.${index}.examples`)}
                </p>
              </div>
            ))}

            <Callout variant="info" title={t('privacy.sections.dataProcessing.noAccountData.title')}>
              <p>{t('privacy.sections.dataProcessing.noAccountData.description')}</p>
            </Callout>
          </div>
        </SectionCard>

        {/* Legal Bases */}
        <SectionCard
          id="legal-bases"
          title={t('privacy.sections.legalBases.title')}
        >
          <p className="mb-4">{t('privacy.sections.legalBases.intro')}</p>
          <div className="space-y-4">
            {['0', '1', '2'].map((index) => (
              <div key={index} className="border rounded-lg p-4 bg-muted/20">
                <h4 className="font-semibold mb-2">
                  {t(`privacy.sections.legalBases.bases.${index}.title`)}
                </h4>
                <p className="text-muted-foreground">
                  {t(`privacy.sections.legalBases.bases.${index}.description`)}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* How We Use Data */}
        <SectionCard
          id="data-use"
          title={t('privacy.sections.dataUse.title')}
        >
          <ul className="space-y-2 mb-4">
            {['0', '1', '2', '3', '4'].map((index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{t(`privacy.sections.dataUse.purposes.${index}`)}</span>
              </li>
            ))}
          </ul>
          <Callout variant="success">
            <p>{t('privacy.sections.dataUse.noSelling')}</p>
          </Callout>
        </SectionCard>

        {/* Data Sharing */}
        <SectionCard
          id="data-sharing"
          title={t('privacy.sections.dataSharing.title')}
        >
          <p className="mb-4">{t('privacy.sections.dataSharing.intro')}</p>
          <p className="mb-4">{t('privacy.sections.dataSharing.vendors')}</p>
          
          <div className="space-y-4">
            <h4 className="font-semibold">{t('privacy.sections.dataSharing.circumstances.title')}</h4>
            <ul className="space-y-2">
              {['0', '1', '2'].map((index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{t(`privacy.sections.dataSharing.circumstances.items.${index}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </SectionCard>

        {/* International Transfers */}
        <SectionCard
          id="international-transfers"
          title={t('privacy.sections.internationalTransfers.title')}
        >
          <p className="mb-4">{t('privacy.sections.internationalTransfers.description')}</p>
          <ul className="space-y-2">
            {['0', '1', '2'].map((index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{t(`privacy.sections.internationalTransfers.safeguards.${index}`)}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Data Retention */}
        <SectionCard
          id="retention"
          title={t('privacy.sections.retention.title')}
        >
          <p className="mb-4">{t('privacy.sections.retention.intro')}</p>
          <ul className="space-y-2 mb-4">
            {['0', '1', '2', '3'].map((index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{interpolate(t(`privacy.sections.retention.periods.${index}`))}</span>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground">{t('privacy.sections.retention.criteria')}</p>
        </SectionCard>

        {/* Security Measures */}
        <SectionCard
          id="security"
          title={t('privacy.sections.security.title')}
        >
          <p className="mb-4">{t('privacy.sections.security.intro')}</p>
          <ul className="space-y-2">
            {['0', '1', '2', '3', '4'].map((index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">🔒</span>
                <span>{t(`privacy.sections.security.measures.${index}`)}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Your Rights */}
        <SectionCard
          id="rights"
          title={t('privacy.sections.rights.title')}
        >
          <p className="mb-4">{t('privacy.sections.rights.intro')}</p>
          <ul className="space-y-2 mb-6">
            {['0', '1', '2', '3', '4', '5'].map((index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{t(`privacy.sections.rights.list.${index}`)}</span>
              </li>
            ))}
          </ul>
          
          <Callout variant="info" title={t('privacy.sections.rights.exercise.title')}>
            <p>{interpolate(t('privacy.sections.rights.exercise.description'))}</p>
          </Callout>
        </SectionCard>

        {/* Opt-Out Options */}
        <SectionCard
          id="opt-out"
          title={t('privacy.sections.optOut.title')}
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">{t('privacy.sections.optOut.analytics.title')}</h4>
              <p className="text-muted-foreground">{t('privacy.sections.optOut.analytics.description')}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{t('privacy.sections.optOut.advertising.title')}</h4>
              <p className="text-muted-foreground">{t('privacy.sections.optOut.advertising.description')}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{t('privacy.sections.optOut.cookies.title')}</h4>
              <p className="text-muted-foreground">{t('privacy.sections.optOut.cookies.description')}</p>
            </div>
          </div>
        </SectionCard>

        {/* Children's Privacy */}
        <SectionCard
          id="children"
          title={t('privacy.sections.children.title')}
        >
          <p>{interpolate(t('privacy.sections.children.description'))}</p>
        </SectionCard>

        {/* Contact Information */}
        <SectionCard
          id="contact"
          title={t('privacy.sections.contact.title')}
        >
          <p className="mb-4">{t('privacy.sections.contact.intro')}</p>
          <div className="space-y-2">
            <p><strong>{interpolate(t('privacy.sections.contact.email'))}</strong></p>
            <p><strong>{interpolate(t('privacy.sections.contact.postal'))}</strong></p>
          </div>
        </SectionCard>

        {/* Policy Changes */}
        <SectionCard
          id="changes"
          title={t('privacy.sections.changes.title')}
        >
          <p>{t('privacy.sections.changes.description')}</p>
        </SectionCard>

        {/* Cookie Details */}
        <SectionCard
          id="cookies"
          title={t('cookies.title')}
        >
          <p className="mb-6">{t('cookies.description')}</p>
          <KeyValueTable
            columns={cookieColumns}
            data={cookieData}
            striped
          />
        </SectionCard>
        </div>
      </LegalLayout>
    </>
  );
}

