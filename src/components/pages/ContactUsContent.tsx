'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/hooks';
import { getLocaleFromPathname } from '@/lib/i18n';
import { usePathname } from 'next/navigation';
import { PageHeader } from '@/components/legal/PageHeader';
import { SectionCard } from '@/components/legal/SectionCard';
import { LegalLayout } from '@/components/legal/LegalLayout';
import { ContactForm } from '@/components/legal/ContactForm';
import { StructuredDataScript } from '@/components/legal/StructuredDataScript';
import { SITE_LEGAL_CONFIG } from '@/config/site-legal';
import { Mail, Clock } from 'lucide-react';

export function ContactUsContent() {
  const { tSync: t } = useTranslation('legal');
  const pathname = usePathname();
  const currentLocale = getLocaleFromPathname(pathname);

  // Interpolate config values into translations
  const interpolate = (text: string, values: Record<string, string | number> = {}) => {
    const allValues: Record<string, string | number> = {
      contactEmail: SITE_LEGAL_CONFIG.contactEmail,
      ...values
    };

    return text.replace(/\{(\w+)\}/g, (match, key) => {
      const value = allValues[key];
      return value !== undefined ? String(value) : match;
    });
  };

  const tocSections = [
    { id: 'reasons', title: t('contact.reasons.title') },
    { id: 'form', title: t('contact.form.title') },
    { id: 'direct', title: t('contact.direct.title') }
  ];

  return (
    <>
      <StructuredDataScript type="contact" locale={currentLocale} pathname={pathname} />
      <LegalLayout tocSections={tocSections} showTOC={false}>
        <div className="space-y-8">
        {/* Header */}
        <PageHeader
          title={t('contact.title')}
          subtitle={t('contact.subtitle')}
          breadcrumbs={[
            { label: 'Home', href: currentLocale === 'en' ? '/' : '/ru' },
            { label: t('contact.title') }
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Reasons to Contact */}
            <SectionCard
              id="reasons"
              title={t('contact.reasons.title')}
            >
              <div className="grid gap-4 md:grid-cols-2">
                {['0', '1', '2', '3'].map((index) => (
                  <div key={index} className="border rounded-lg p-4 bg-muted/20">
                    <h4 className="font-semibold mb-2">
                      {t(`contact.reasons.items.${index}.title`)}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {t(`contact.reasons.items.${index}.description`)}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Contact Form */}
            <SectionCard
              id="form"
              title={t('contact.form.title')}
            >
              <ContactForm />
            </SectionCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Direct Contact */}
            <SectionCard
              id="direct"
              title={t('contact.direct.title')}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">
                      {interpolate(t('contact.direct.email'))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium text-sm">
                      {t('contact.direct.response')}
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Additional Info */}
            <div className="p-4 bg-muted/20 rounded-lg">
              <h4 className="font-semibold mb-2">{t('contact.additional.title')}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {t('contact.additional.description1')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('contact.additional.description2')}
              </p>
            </div>

            {/* Privacy Notice */}
            <div className="p-4 border bg-muted/10 rounded-lg">
              <h4 className="font-semibold mb-2">
                {t('contact.privacy.title')}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t('contact.privacy.description')}
              </p>
            </div>
          </div>
        </div>
        </div>
      </LegalLayout>
    </>
  );
}

