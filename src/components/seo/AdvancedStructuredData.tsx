'use client';

import { usePathname } from 'next/navigation';
import { getLocaleFromPathname } from '@/lib/i18n';
import { getToolMetadataLocalized } from '@/lib/metadata/toolMetadata';

interface AdvancedStructuredDataProps {
  toolSlug: string;
}

export default function AdvancedStructuredData({ toolSlug }: AdvancedStructuredDataProps) {
  const pathname = usePathname();
  const currentLocale = getLocaleFromPathname(pathname);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://textcaseconverter.net';
  const currentUrl = `${baseUrl}${pathname}`;
  
  // Get the tool configuration with advanced schema
  const toolConfig = getToolMetadataLocalized(toolSlug, currentLocale);
  
  if (!toolConfig?.schema) {
    return null; // No schema data available
  }

  const schema = toolConfig.schema;
  
  // Convert the schema to JSON-LD format
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': schema.type,
    name: toolConfig.title,
    description: toolConfig.description,
    url: currentUrl,
    applicationCategory: schema.applicationCategory,
    ...(schema.features && { featureList: schema.features }),
    ...(schema.operatingSystem && { operatingSystem: schema.operatingSystem }),
    ...(schema.browserRequirements && { browserRequirements: schema.browserRequirements }),
    ...(schema.softwareVersion && { softwareVersion: schema.softwareVersion }),
    ...(schema.datePublished && { datePublished: schema.datePublished }),
    ...(schema.dateModified && { dateModified: schema.dateModified }),
    ...(schema.aggregateRating && { 
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: schema.aggregateRating.ratingValue,
        reviewCount: schema.aggregateRating.reviewCount
      }
    }),
    ...(schema.potentialAction && {
      potentialAction: {
        '@type': 'UseAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${baseUrl}${schema.potentialAction.target}`
        },
        object: {
          '@type': 'Thing',
          name: schema.potentialAction.object
        },
        result: {
          '@type': 'Thing',
          name: schema.potentialAction.result
        }
      }
    }),
    ...(schema.offers && {
      offers: {
        '@type': 'Offer',
        price: schema.offers.price,
        priceCurrency: schema.offers.priceCurrency
      }
    }),
    ...(schema.softwareRequirements && { softwareRequirements: schema.softwareRequirements }),
    ...(schema.memoryRequirements && { memoryRequirements: schema.memoryRequirements }),
    ...(schema.processorRequirements && { processorRequirements: schema.processorRequirements }),
    ...(schema.numberOfItems && { numberOfItems: schema.numberOfItems }),
    ...(schema.name && { name: schema.name }),
    ...(schema.url && { url: `${baseUrl}${schema.url}` }),
    ...(schema.mainEntity && {
      mainEntity: {
        '@type': schema.mainEntity.type,
        ...(schema.mainEntity.numberOfItems && { numberOfItems: schema.mainEntity.numberOfItems }),
        ...(schema.mainEntity.name && { name: schema.mainEntity.name })
      }
    }),
    publisher: {
      '@type': 'Organization',
      name: 'Text Case Converter',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/globe.svg`
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLdSchema)
      }}
    />
  );
}
