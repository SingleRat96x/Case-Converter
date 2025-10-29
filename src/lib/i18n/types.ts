// TypeScript type definitions for translation structure validation

/**
 * Common shared translations structure
 */
export interface CommonTranslations {
  buttons: {
    copy: string;
    clear: string;
    download: string;
    upload: string;
  };
  messages: {
    copied: string;
    cleared: string;
    uploadSuccess: string;
    uploadError: string;
    invalidFile: string;
  };
  labels: {
    inputText: string;
    outputText: string;
  };
  placeholders: {
    enterText: string;
  };
  descriptions: {
    uploadFile: string;
  };
}

/**
 * Navigation translations structure
 */
export interface NavigationTranslations {
  header: {
    title: string;
    subtitle: string;
    language: string;
  };
  navigation: {
    convertCaseTools: string;
    uppercase: string;
    lowercase: string;
    titleCase: string;
    sentenceCase: string;
    alternatingCase: string;
    textFormatting: string;
    boldText: string;
    italicText: string;
    subscriptText: string;
    bigText: string;
  };
  footer: {
    copyright: string;
    madeWith: string;
  };
}

/**
 * Tool-specific translation structure
 */
interface ToolTranslation {
  title: string;
  description: string;
  outputLabel: string;
  copiedMessage: string;
  downloadFileName: string;
  convertButton: string;
  uploadDescription: string;
}

/**
 * Case converter tools translations
 */
export interface CaseConverterTranslations {
  main: {
    title: string;
    description: string;
    downloadFileName: string;
  };
  uppercase: ToolTranslation;
  lowercase: ToolTranslation;
  titleCase: ToolTranslation;
  sentenceCase: ToolTranslation;
  alternatingCase: ToolTranslation;
}

/**
 * Text generator tools translations
 */
export interface TextGeneratorTranslations {
  bold: ToolTranslation;
  italic: ToolTranslation;
  subscript: ToolTranslation;
  bigText: ToolTranslation;
}

/**
 * Text modifier tools translations
 */
export interface TextModifierTranslations {
  invisibleText: {
    title: string;
    description: string;
    outputLabel: string;
    inputPlaceholder: string;
    methods: {
      zeroWidth: string;
      unicode: string;
    };
    info: string;
    stats: {
      visible: string;
      invisible: string;
      total: string;
    };
    copyInvisible: string;
    copied: string;
  };
  repeatText: {
    title: string;
    description: string;
    outputLabel: string;
    inputPlaceholder: string;
    times: string;
    reset: string;
    separator: string;
    separators: {
      newline: string;
      space: string;
      none: string;
      custom: string;
    };
    customPlaceholder: string;
    warning: string;
    hint: string;
  };
  textReplace: {
    title: string;
    description: string;
    outputLabel: string;
    inputPlaceholder: string;
    find: string;
    findPlaceholder: string;
    replaceWith: string;
    replacePlaceholder: string;
    swap: string;
    options: {
      caseSensitive: string;
      wholeWord: string;
      regex: string;
    };
    matches: string;
    noMatches: string;
    preview: string;
    regexInfo: string;
    regexExamples: string;
  };
}

/**
 * Code & Data tool translations
 */
export interface CodeDataTranslations {
  base64: {
    title: string;
    description: string;
    labels: {
      plainText: string;
      base64Text: string;
    };
    placeholders: {
      encode: string;
      decode: string;
    };
    uploadDescription: string;
    modes: {
      encode: string;
      decode: string;
    };
    options: {
      title: string;
      urlSafe: string;
      includePadding: string;
      lineBreaks: string;
      lineLength: string;
    };
    errors: {
      encodeFailed: string;
      decodeFailed: string;
      invalidBase64: string;
      fileReadFailed: string;
      conversionFailed: string;
    };
    messages: {
      encodeSuccess: string;
      decodeSuccess: string;
      fileUploaded: string;
    };
    info: {
      description: string;
      encodingNote: string;
    };
    stats: {
      inputSize: string;
      outputSize: string;
      expansionRatio: string;
      compressionRatio: string;
    };
  };
  binary: {
    title: string;
    description: string;
    labels: {
      binaryCode: string;
    };
    placeholders: {
      encode: string;
      decode: string;
      encodeOutput: string;
      decodeOutput: string;
    };
    modes: {
      textToBinary: string;
      binaryToText: string;
    };
    options: {
      title: string;
      delimiter: string;
      delimiters: {
        space: string;
        none: string;
        newline: string;
      };
      groupSize: string;
      bitLabel: string;
      padding: string;
    };
    errors: {
      encodeFailed: string;
      decodeFailed: string;
      invalidBinary: string;
      invalidCharCode: string;
      conversionFailed: string;
    };
    info: {
      description: string;
      encodingNote: string;
      decodingNote: string;
    };
    stats: {
      characters: string;
      bits: string;
      bytes: string;
    };
  };
}

/**
 * Other tools section translations
 */
export interface OtherToolsTranslations {
  section: {
    title: string;
    description: string;
  };
  tools: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    href: string;
    isPopular?: boolean;
    isViewAll?: boolean;
  }>;
}

/**
 * Image tools translations
 */
export interface ImageToolsTranslations {
  imageCropper: {
    title: string;
    description: string;
    upload: {
      title: string;
      description: string;
      dragDrop: string;
      browse: string;
      restrictions: string;
    };
    controls: {
      crop: string;
      rotate: string;
      format: string;
      quality: string;
      reset: string;
      download: string;
    };
    formats: {
      jpeg: string;
      png: string;
      webp: string;
    };
    quality: {
      high: string;
      medium: string;
      low: string;
    };
    messages: {
      uploadSuccess: string;
      processingError: string;
      downloadReady: string;
      invalidFormat: string;
    };
    stats: {
      original: string;
      cropped: string;
      dimensions: string;
      fileSize: string;
      reduction: string;
    };
    dialog: {
      clearTitle: string;
      clearDescription: string;
    };
  };
}

/**
 * Miscellaneous tools translations structure
 */
export interface MiscellaneousTranslations {
  onlineNotepad: {
    title: string;
    description: string;
    inputPlaceholder: string;
    uploadDescription: string;
    downloadFileName: string;
  };
}

/**
 * Random generators translations structure
 */
export interface RandomGeneratorsTranslations {
  randomNumber: {
    title: string;
    description: string;
    outputLabel: string;
    generateButton: string;
    options: {
      minValue: string;
      maxValue: string;
      quantity: string;
      allowDuplicates: string;
      sortResults: string;
      sortOrder: string;
      ascending: string;
      descending: string;
      none: string;
    };
    placeholders: {
      minValue: string;
      maxValue: string;
      quantity: string;
    };
    validation: {
      minRequired: string;
      maxRequired: string;
      quantityRequired: string;
      minMaxInvalid: string;
      quantityInvalid: string;
      quantityTooLarge: string;
      invalidNumber: string;
      rangeTooBig: string;
    };
    downloadFileName: string;
    copiedMessage: string;
    generatedMessage: string;
    help: {
      minValue: string;
      maxValue: string;
      quantity: string;
      allowDuplicates: string;
      sortResults: string;
    };
  };
}

/**
 * PDF tools translations structure
 */
export interface PdfToolsTranslations {
  pdfEmailExtractor: {
    title: string;
    description: string;
    uploadArea: string;
    dragDrop: string;
    supportedFormats: string;
    replace: string;
    clear: string;
    processing: string;
    results: string;
    noEmailsFound: string;
    settings: string;
    sortBy: string;
    sortTooltip: string;
    sortOptions: {
      alphabetical: string;
      domain: string;
      position: string;
      validity: string;
    };
    processingOptions: string;
    removeDuplicates: string;
    validateEmails: string;
    duplicatesTooltip: string;
    validationTooltip: string;
    stats: {
      totalFound: string;
      unique: string;
      valid: string;
      invalid: string;
    };
    uniqueDomains: string;
    validityRate: string;
    pages: string;
    fileSize: string;
    processingTime: string;
    filename: string;
    topDomains: string;
    domainsHint: string;
    duplicatesFound: string;
    duplicatesHint: string;
  };
}

/**
 * Miscellaneous tools translations structure
 */
export interface MiscToolsTranslations {
  numberSorter: {
    title: string;
    description: string;
    inputLabel: string;
    inputPlaceholder: string;
    uploadDescription: string;
    downloadFileName: string;
    options: {
      title: string;
      sortOrder: string;
      ascending: string;
      descending: string;
      sortType: string;
      numerical: string;
      lexicographical: string;
      removeDuplicates: string;
      preserveFormat: string;
      separator: string;
      separatorAuto: string;
      separatorNewline: string;
      separatorSpace: string;
      separatorComma: string;
      separatorDash: string;
      separatorSemicolon: string;
      primaryOptions: string;
      additionalOptions: string;
      removeDuplicatesDesc: string;
      preserveFormatDesc: string;
    };
    results: {
      title: string;
    };
    statistics: {
      title: string;
      originalCount: string;
      sortedCount: string;
      duplicatesRemoved: string;
      sortMethod: string;
    };
    analytics: {
      numericValues: string;
      minValue: string;
      maxValue: string;
      average: string;
    };
  };
}

/**
 * Complete translation schema validation
 */
export interface TranslationNamespaces {
  'shared/common': CommonTranslations;
  'shared/navigation': NavigationTranslations;
  'legal': Record<string, unknown>;
  'pages/about-us': Record<string, unknown>;
  'pages/contact-us': Record<string, unknown>;
  'pages/privacy-policy': Record<string, unknown>;
  'pages/terms-of-service': Record<string, unknown>;
  'tools/case-converters': CaseConverterTranslations;
  'tools/text-generators': TextGeneratorTranslations;
  'tools/text-modifiers': TextModifierTranslations;
  'tools/code-data': CodeDataTranslations;
  'tools/other-tools': OtherToolsTranslations;
  'tools/image-tools': ImageToolsTranslations;
  'tools/random-generators': RandomGeneratorsTranslations;
  'tools/miscellaneous': MiscellaneousTranslations;
  'tools/misc-tools': MiscToolsTranslations;
  'tools/pdf-tools': PdfToolsTranslations;
}

/**
 * Type-safe translation key paths
 */
export type TranslationKeyPath<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? T[K] extends Array<unknown>
            ? K
            : `${K}.${TranslationKeyPath<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

/**
 * Valid translation keys for each namespace
 */
export type CommonKeys = TranslationKeyPath<CommonTranslations>;
export type NavigationKeys = TranslationKeyPath<NavigationTranslations>;
export type CaseConverterKeys = TranslationKeyPath<CaseConverterTranslations>;
export type TextGeneratorKeys = TranslationKeyPath<TextGeneratorTranslations>;
export type TextModifierKeys = TranslationKeyPath<TextModifierTranslations>;
export type OtherToolsKeys = TranslationKeyPath<OtherToolsTranslations>;

/**
 * Utility type to validate translation completeness
 */
export type ValidateTranslations<T extends Record<string, unknown>> = {
  [L in 'en' | 'ru']: T;
};

/**
 * Runtime validation function (for development)
 */
export function validateTranslationStructure<T extends Record<string, unknown>>(
  translations: Record<string, unknown>,
  schema: T,
  namespace: string
): translations is ValidateTranslations<T> {
  try {
    // Basic validation - check if both locales exist
    if (!translations.en || !translations.ru) {
      console.error(`Missing locale data in ${namespace}`);
      return false;
    }

    // Deep validation would go here
    // For now, just check basic structure
    const englishKeys = Object.keys(translations.en);
    const russianKeys = Object.keys(translations.ru);
    
    if (englishKeys.length !== russianKeys.length) {
      console.warn(`Key count mismatch in ${namespace}: EN(${englishKeys.length}) vs RU(${russianKeys.length})`);
    }

    return true;
  } catch (error) {
    console.error(`Validation failed for ${namespace}:`, error);
    return false;
  }
}