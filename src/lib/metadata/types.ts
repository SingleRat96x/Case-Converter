
export type SupportedLocale = 'en' | 'ru' | 'de';

export interface LocalizedMetadataFields {
  title: string; // 30-60 chars recommended
  description: string; // 80-160 chars recommended
  alternateTitle?: string; // 30-60 chars
  shortDescription?: string; // 60-120 chars
  ogImage?: string; // public path like /images/og-<slug>.jpg
}

export type MetadataCategory =
  | 'text-transform'
  | 'random-generator'
  | 'converter'
  | 'image-tool'
  | 'security-tool'
  | 'text-analysis'
  | 'social-media-tool'
  | 'miscellaneous-tool'
  | 'text-modification'
  | 'code-data-tools'
  | 'image-processing'
  | 'miscellaneous-utility'
  | 'social-media';

export interface ToolMetadataConfig {
  // Bilingual localized fields
  i18n: Record<SupportedLocale, LocalizedMetadataFields>;

  // Route information
  slug: string; // e.g., random-number, category slug, etc.
  pathname: string; // e.g., /tools/random-number or /category/<slug>
  type: 'tool' | 'category';

  // Optional enhanced metadata
  category?: MetadataCategory;

  // Structured data (optional)
  schema?: {
    type: 'SoftwareApplication' | 'WebApplication' | 'CollectionPage' | 'WebPage';
    applicationCategory: string;
    features?: string[];
    operatingSystem?: string;
    browserRequirements?: string;
    softwareVersion?: string;
    datePublished?: string;
    dateModified?: string;
    aggregateRating?: {
      ratingValue: string;
      reviewCount: string;
    };
    potentialAction?: {
      target: string;
      object: string;
      result: string;
    };
    offers?: {
      price: string;
      priceCurrency: string;
    };
    softwareRequirements?: string;
    memoryRequirements?: string;
    processorRequirements?: string;
    numberOfItems?: number;
    name?: string;
    url?: string;
    mainEntity?: {
      type: string;
      numberOfItems?: number;
      name?: string;
    };
  };

  // Related tools (verified slugs only)
  relatedTools?: string[];
}

export interface MetadataGenerationOptions {
  locale?: SupportedLocale;
  pathname: string;
  overrides?: Partial<LocalizedMetadataFields> & { category?: MetadataCategory };
}

export const META_LIMITS = {
  title: { min: 30, max: 60 },
  description: { min: 80, max: 160 },
  alt: { min: 20, max: 150 },
  shortDescription: { min: 40, max: 140 },
} as const;

export interface ValidationIssue {
  slug: string;
  locale: SupportedLocale;
  field: keyof LocalizedMetadataFields;
  message: string;
}