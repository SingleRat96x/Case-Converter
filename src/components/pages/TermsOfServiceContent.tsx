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

export function TermsOfServiceContent() {
  const { tSync: t } = useTranslation('legal');
  const pathname = usePathname();
  const currentLocale = getLocaleFromPathname(pathname);

  // Interpolate config values into translations
  const interpolate = (text: string, values: Record<string, string | number> = {}) => {
    const allValues: Record<string, string | number> = {
      companyName: SITE_LEGAL_CONFIG.companyName,
      domain: SITE_LEGAL_CONFIG.domain,
      contactEmail: SITE_LEGAL_CONFIG.contactEmail,
      governingLaw: SITE_LEGAL_CONFIG.governingLaw,
      minimumAge: SITE_LEGAL_CONFIG.minimumAge,
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
    { id: 'acceptance', title: t('terms.sections.acceptance.title') },
    { id: 'description', title: t('terms.sections.description.title') },
    { id: 'acceptable-use', title: t('terms.sections.acceptableUse.title') },
    { id: 'user-content', title: t('terms.sections.userContent.title') },
    { id: 'intellectual-property', title: t('terms.sections.intellectualProperty.title') },
    { id: 'availability', title: t('terms.sections.availability.title') },
    { id: 'disclaimers', title: t('terms.sections.disclaimers.title') },
    { id: 'liability', title: t('terms.sections.liability.title') },
    { id: 'indemnification', title: t('terms.sections.indemnification.title') },
    { id: 'governing-law', title: t('terms.sections.governingLaw.title') },
    { id: 'dmca', title: t('terms.sections.dmca.title') },
    { id: 'age', title: t('terms.sections.age.title') },
    { id: 'changes', title: t('terms.sections.changes.title') },
    { id: 'contact', title: t('terms.sections.contact.title') }
  ];

  return (
    <>
      <StructuredDataScript type="terms" locale={currentLocale} pathname={pathname} />
      <LegalLayout tocSections={tocSections} tocTitle={t('terms.tableOfContents.title')}>
        <div className="space-y-8">
        {/* Header */}
        <PageHeader
          title={t('terms.title')}
          lastUpdated={interpolate(t('terms.lastUpdated'))}
          version={interpolate(t('terms.version'))}
          effectiveDate={interpolate(t('terms.effectiveDate'))}
          breadcrumbs={[
            { label: 'Home', href: currentLocale === 'en' ? '/' : '/ru' },
            { label: t('terms.title') }
          ]}
        />

        {/* Acceptance of Terms */}
        <SectionCard
          id="acceptance"
          title={t('terms.sections.acceptance.title')}
        >
          <p>{interpolate(t('terms.sections.acceptance.content'))}</p>
        </SectionCard>

        {/* Service Description */}
        <SectionCard
          id="description"
          title={t('terms.sections.description.title')}
        >
          <p>{t('terms.sections.description.content')}</p>
        </SectionCard>

        {/* Acceptable Use */}
        <SectionCard
          id="acceptable-use"
          title={t('terms.sections.acceptableUse.title')}
        >
          <p className="mb-4">{t('terms.sections.acceptableUse.intro')}</p>
          
          <div className="space-y-4">
            <Callout variant="warning" title={t('terms.prohibitedActivities')}>
              <ul className="space-y-2">
                {['0', '1', '2', '3', '4', '5', '6'].map((index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-destructive mt-1">✗</span>
                    <span>{t(`terms.sections.acceptableUse.prohibited.${index}`)}</span>
                  </li>
                ))}
              </ul>
            </Callout>
            
            <p className="text-muted-foreground">{t('terms.sections.acceptableUse.enforcement')}</p>
          </div>
        </SectionCard>

        {/* User Content & License */}
        <SectionCard
          id="user-content"
          title={t('terms.sections.userContent.title')}
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">{t('terms.ownership')}</h4>
              <p className="text-muted-foreground">{t('terms.sections.userContent.ownership')}</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">{t('terms.licenseGrant')}</h4>
              <p className="text-muted-foreground">{t('terms.sections.userContent.license')}</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">{t('terms.yourResponsibility')}</h4>
              <p className="text-muted-foreground">{t('terms.sections.userContent.responsibility')}</p>
            </div>
          </div>
        </SectionCard>

        {/* Intellectual Property */}
        <SectionCard
          id="intellectual-property"
          title={t('terms.sections.intellectualProperty.title')}
        >
          <p>{interpolate(t('terms.sections.intellectualProperty.content'))}</p>
        </SectionCard>

        {/* Service Availability */}
        <SectionCard
          id="availability"
          title={t('terms.sections.availability.title')}
        >
          <p>{t('terms.sections.availability.content')}</p>
        </SectionCard>

        {/* Disclaimers */}
        <SectionCard
          id="disclaimers"
          title={t('terms.sections.disclaimers.title')}
        >
          <Callout variant="warning" title={t('terms.importantDisclaimer')}>
            <p>{t('terms.sections.disclaimers.content')}</p>
          </Callout>
        </SectionCard>

        {/* Limitation of Liability */}
        <SectionCard
          id="liability"
          title={t('terms.sections.liability.title')}
        >
          <Callout variant="error" title={t('terms.liabilityLimitation')}>
            <p>{t('terms.sections.liability.content')}</p>
          </Callout>
        </SectionCard>

        {/* Indemnification */}
        <SectionCard
          id="indemnification"
          title={t('terms.sections.indemnification.title')}
        >
          <p>{t('terms.sections.indemnification.content')}</p>
        </SectionCard>

        {/* Governing Law */}
        <SectionCard
          id="governing-law"
          title={t('terms.sections.governingLaw.title')}
        >
          <p>{interpolate(t('terms.sections.governingLaw.content'))}</p>
        </SectionCard>

        {/* DMCA Notice */}
        <SectionCard
          id="dmca"
          title={t('terms.sections.dmca.title')}
        >
          <p>{interpolate(t('terms.sections.dmca.content'))}</p>
        </SectionCard>

        {/* Age Requirements */}
        <SectionCard
          id="age"
          title={t('terms.sections.age.title')}
        >
          <p>{interpolate(t('terms.sections.age.content'))}</p>
        </SectionCard>

        {/* Changes to Terms */}
        <SectionCard
          id="changes"
          title={t('terms.sections.changes.title')}
        >
          <p>{t('terms.sections.changes.content')}</p>
        </SectionCard>

        {/* Contact Information */}
        <SectionCard
          id="contact"
          title={t('terms.sections.contact.title')}
        >
          <p>{interpolate(t('terms.sections.contact.content'))}</p>
        </SectionCard>
        </div>
      </LegalLayout>
    </>
  );
}

