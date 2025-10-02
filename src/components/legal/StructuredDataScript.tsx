'use client';

import React from 'react';
import { SITE_LEGAL_CONFIG } from '@/config/site-legal';
import type { Locale } from '@/lib/i18n';

interface StructuredDataScriptProps {
  type: 'organization' | 'website' | 'contact' | 'privacy' | 'terms';
  locale: Locale;
  pathname: string;
}

export function StructuredDataScript({ type, locale, pathname }: StructuredDataScriptProps) {
  const baseUrl = `https://${SITE_LEGAL_CONFIG.domain}`;
  const currentUrl = `${baseUrl}${pathname}`;

  const getStructuredData = () => {
    const baseData = {
      '@context': 'https://schema.org',
    };

    switch (type) {
      case 'organization':
        return {
          ...baseData,
          '@type': 'Organization',
          name: SITE_LEGAL_CONFIG.companyName,
          url: baseUrl,
          logo: `${baseUrl}/images/og-default.jpg`,
          description: locale === 'en' 
            ? 'Professional text transformation and utility tools for developers, writers, and content creators.'
            : 'Профессиональные инструменты преобразования текста и утилиты для разработчиков, писателей и создателей контента.',
          sameAs: [
            // Add social media URLs here when available
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            email: SITE_LEGAL_CONFIG.contactEmail,
            availableLanguage: ['en', 'ru']
          }
        };

      case 'website':
        return {
          ...baseData,
          '@type': 'WebSite',
          name: SITE_LEGAL_CONFIG.companyName,
          url: baseUrl,
          description: locale === 'en' 
            ? 'Professional text transformation and utility tools for developers, writers, and content creators.'
            : 'Профессиональные инструменты преобразования текста и утилиты для разработчиков, писателей и создателей контента.',
          inLanguage: [
            {
              '@type': 'Language',
              name: 'English',
              alternateName: 'en'
            },
            {
              '@type': 'Language', 
              name: 'Russian',
              alternateName: 'ru'
            }
          ],
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/tools?search={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          }
        };

      case 'contact':
        return {
          ...baseData,
          '@type': 'ContactPage',
          name: locale === 'en' ? 'Contact Us' : 'Свяжитесь с нами',
          url: currentUrl,
          description: locale === 'en' 
            ? 'Get in touch with our team for support, feedback, or partnerships.'
            : 'Свяжитесь с нашей командой для поддержки, отзывов или партнерства.',
          inLanguage: locale,
          isPartOf: {
            '@type': 'WebSite',
            name: SITE_LEGAL_CONFIG.companyName,
            url: baseUrl
          },
          mainEntity: {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            email: SITE_LEGAL_CONFIG.contactEmail,
            availableLanguage: ['en', 'ru'],
            hoursAvailable: {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
              opens: '09:00',
              closes: '17:00'
            }
          }
        };

      case 'privacy':
        return {
          ...baseData,
          '@type': 'PrivacyPolicy',
          name: locale === 'en' ? 'Privacy Policy' : 'Политика конфиденциальности',
          url: currentUrl,
          description: locale === 'en' 
            ? 'Our privacy policy explains how we collect, use, and protect your data.'
            : 'Наша политика конфиденциальности объясняет, как мы собираем, используем и защищаем ваши данные.',
          inLanguage: locale,
          datePublished: SITE_LEGAL_CONFIG.effectiveDate,
          dateModified: SITE_LEGAL_CONFIG.lastUpdated,
          version: SITE_LEGAL_CONFIG.policyVersion,
          isPartOf: {
            '@type': 'WebSite',
            name: SITE_LEGAL_CONFIG.companyName,
            url: baseUrl
          },
          about: {
            '@type': 'Organization',
            name: SITE_LEGAL_CONFIG.companyName,
            url: baseUrl
          }
        };

      case 'terms':
        return {
          ...baseData,
          '@type': 'TermsOfService',
          name: locale === 'en' ? 'Terms of Service' : 'Условия обслуживания',
          url: currentUrl,
          description: locale === 'en' 
            ? 'Terms and conditions for using our text transformation tools and services.'
            : 'Условия использования наших инструментов преобразования текста и услуг.',
          inLanguage: locale,
          datePublished: SITE_LEGAL_CONFIG.effectiveDate,
          dateModified: SITE_LEGAL_CONFIG.lastUpdated,
          version: SITE_LEGAL_CONFIG.policyVersion,
          isPartOf: {
            '@type': 'WebSite',
            name: SITE_LEGAL_CONFIG.companyName,
            url: baseUrl
          },
          about: {
            '@type': 'Organization',
            name: SITE_LEGAL_CONFIG.companyName,
            url: baseUrl
          }
        };

      default:
        return null;
    }
  };

  const structuredData = getStructuredData();

  if (!structuredData) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
}