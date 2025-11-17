'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getLocaleFromPathname } from '@/lib/i18n';
import { useNavigationTranslations, useCommonTranslations } from '@/lib/i18n/hooks';

export function Footer() {
  const pathname = usePathname();
  const currentLocale = getLocaleFromPathname(pathname);
  const { tSync: t } = useNavigationTranslations();
  const { tSync: tCommon } = useCommonTranslations();

  // Helper function to generate tool href based on locale
  const getToolHref = (toolPath: string) => {
    if (currentLocale === 'en') return toolPath;
    return `/${currentLocale}${toolPath}`;
  };

  const convertCaseTools = [
    {
      title: t('navigation.uppercase'),
      href: getToolHref('/tools/uppercase')
    },
    {
      title: t('navigation.lowercase'),
      href: getToolHref('/tools/lowercase')
    },
    {
      title: t('navigation.titleCase'),
      href: getToolHref('/tools/title-case')
    },
    {
      title: t('navigation.sentenceCase'),
      href: getToolHref('/tools/sentence-case')
    },
    {
      title: t('navigation.alternatingCase'),
      href: getToolHref('/tools/alternating-case')
    },
    {
      title: t('navigation.camelCaseConverter'),
      href: getToolHref('/tools/camel-case-converter')
    },
    {
      title: t('navigation.snakeCaseConverter'),
      href: getToolHref('/tools/snake-case-converter')
    },
    {
      title: t('navigation.kebabCaseConverter'),
      href: getToolHref('/tools/kebab-case-converter')
    }
  ].sort((a, b) => a.title.localeCompare(b.title));

  const analysisCounterTools = [
    {
      title: t('navigation.textCounter'),
      href: getToolHref('/tools/text-counter')
    },
    {
      title: t('navigation.sentenceCounter'),
      href: getToolHref('/tools/sentence-counter')
    },
    {
      title: t('navigation.wordFrequency'),
      href: getToolHref('/tools/word-frequency')
    },
    {
      title: t('navigation.extractNumbers'),
      href: getToolHref('/tools/extract-numbers')
    },
    {
      title: t('navigation.readingTimeEstimator'),
      href: getToolHref('/tools/reading-time-estimator')
    }
  ].sort((a, b) => a.title.localeCompare(b.title));

  const textFormattingTools = [
    {
      title: t('navigation.invisibleText'),
      href: getToolHref('/tools/invisible-text')
    },
    {
      title: t('navigation.repeatText'),
      href: getToolHref('/tools/repeat-text')
    },
    {
      title: t('navigation.textReplace'),
      href: getToolHref('/tools/text-replace')
    },
    {
      title: t('navigation.removeLineBreaks'),
      href: getToolHref('/tools/remove-line-breaks')
    },
    {
      title: t('navigation.removePunctuation'),
      href: getToolHref('/tools/remove-punctuation')
    },
    {
      title: t('navigation.removeTextFormatting'),
      href: getToolHref('/tools/remove-text-formatting')
    },
    {
      title: t('navigation.duplicateLineRemover'),
      href: getToolHref('/tools/duplicate-line-remover')
    },
    {
      title: t('navigation.boldText'),
      href: getToolHref('/tools/bold-text')
    },
    {
      title: t('navigation.italicText'),
      href: getToolHref('/tools/italic-text')
    },
    {
      title: t('navigation.subscriptText'),
      href: getToolHref('/tools/subscript-text')
    },
    {
      title: t('navigation.bigText'),
      href: getToolHref('/tools/big-text')
    },
    {
      title: t('navigation.bubbleText'),
      href: getToolHref('/tools/bubble-text')
    },
    {
      title: t('navigation.cursedText'),
      href: getToolHref('/tools/cursed-text')
    },
    {
      title: t('navigation.mirrorText'),
      href: getToolHref('/tools/mirror-text')
    },
    {
      title: t('navigation.sortWords'),
      href: getToolHref('/tools/sort-words')
    },
    {
      title: t('navigation.plainText'),
      href: getToolHref('/tools/plain-text')
    },
    {
      title: t('navigation.extractEmailsFromText'),
      href: getToolHref('/tools/extract-emails-from-text')
    },
    {
      title: t('navigation.addLineNumbers'),
      href: getToolHref('/tools/add-line-numbers-to-text')
    },
    {
      title: t('navigation.addPrefixSuffix'),
      href: getToolHref('/tools/add-prefix-and-suffix-to-lines')
    }
  ].sort((a, b) => a.title.localeCompare(b.title));

  const codeDataTools = [
    {
      title: t('navigation.base64EncoderDecoder'),
      href: getToolHref('/tools/base64-encoder-decoder')
    },
    {
      title: t('navigation.binaryCodeTranslator'),
      href: getToolHref('/tools/binary-code-translator')
    },
    {
      title: t('navigation.hexToText'),
      href: getToolHref('/tools/hex-to-text')
    },
    {
      title: t('navigation.morseCode'),
      href: getToolHref('/tools/morse-code')
    },
    {
      title: t('navigation.caesarCipher'),
      href: getToolHref('/tools/caesar-cipher')
    },
    {
      title: t('navigation.rot13'),
      href: getToolHref('/tools/rot13')
    },
    {
      title: t('navigation.csvToJson'),
      href: getToolHref('/tools/csv-to-json')
    },
    {
      title: t('navigation.jsonStringify'),
      href: getToolHref('/tools/json-stringify')
    },
    {
      title: t('navigation.jsonFormatter'),
      href: getToolHref('/tools/json-formatter')
    },
    {
      title: t('navigation.urlConverter'),
      href: getToolHref('/tools/url-converter')
    },
    {
      title: t('navigation.utf8Converter'),
      href: getToolHref('/tools/utf8-converter')
    },
    {
      title: t('navigation.slugifyUrl'),
      href: getToolHref('/tools/slugify-url')
    }
  ].sort((a, b) => a.title.localeCompare(b.title));

  const imageTools = [
    {
      title: t('navigation.imageCropper'),
      href: getToolHref('/tools/image-cropper')
    },
    {
      title: t('navigation.imageResizer'),
      href: getToolHref('/tools/image-resizer')
    },
    {
      title: t('navigation.imageToText'),
      href: getToolHref('/tools/image-to-text')
    },
    {
      title: t('navigation.jpgToPng'),
      href: getToolHref('/tools/jpg-to-png')
    },
    {
      title: t('navigation.jpgToWebp'),
      href: getToolHref('/tools/jpg-to-webp')
    },
    {
      title: t('navigation.pngToJpg'),
      href: getToolHref('/tools/png-to-jpg')
    },
    {
      title: t('navigation.pngToWebp'),
      href: getToolHref('/tools/png-to-webp')
    },
    {
      title: t('navigation.webpToJpg'),
      href: getToolHref('/tools/webp-to-jpg')
    },
    {
      title: t('navigation.webpToPng'),
      href: getToolHref('/tools/webp-to-png')
    }
  ].sort((a, b) => a.title.localeCompare(b.title));

  const randomGenerators = [
    {
      title: t('navigation.randomNumber'),
      href: getToolHref('/tools/random-number')
    },
    {
      title: t('navigation.randomLetter'),
      href: getToolHref('/tools/random-letter')
    },
    {
      title: t('navigation.randomDate'),
      href: getToolHref('/tools/random-date')
    },
    {
      title: t('navigation.randomMonth'),
      href: getToolHref('/tools/random-month')
    },
    {
      title: t('navigation.randomIP'),
      href: getToolHref('/tools/random-ip')
    },
    {
      title: t('navigation.randomChoice'),
      href: getToolHref('/tools/random-choice')
    },
    {
      title: t('navigation.passwordGenerator'),
      href: getToolHref('/tools/password-generator')
    },
    {
      title: t('navigation.uuidGenerator'),
      href: getToolHref('/tools/uuid-generator')
    }
  ].sort((a, b) => a.title.localeCompare(b.title));

  const socialMediaTools = [
    {
      title: t('navigation.instagramFonts'),
      href: getToolHref('/tools/instagram-fonts')
    },
    {
      title: t('navigation.facebookFont'),
      href: getToolHref('/tools/facebook-font')
    },
    {
      title: t('navigation.discordFont'),
      href: getToolHref('/tools/discord-font')
    }
  ].sort((a, b) => a.title.localeCompare(b.title));

  const miscellaneousTools = [
    {
      title: t('navigation.onlineNotepad'),
      href: getToolHref('/tools/online-notepad')
    },
    {
      title: t('navigation.numberSorter'),
      href: getToolHref('/tools/number-sorter')
    },
    {
      title: t('navigation.asciiArtGenerator'),
      href: getToolHref('/tools/ascii-art-generator')
    },
    {
      title: t('navigation.natoPhonetic'),
      href: getToolHref('/tools/nato-phonetic')
    },
    {
      title: t('navigation.md5Hash'),
      href: getToolHref('/tools/md5-hash')
    },
    {
      title: t('navigation.sha1HashGenerator'),
      href: getToolHref('/tools/sha1-hash-generator')
    },
    {
      title: t('navigation.phoneticSpelling'),
      href: getToolHref('/tools/phonetic-spelling')
    },
    {
      title: t('navigation.pigLatin'),
      href: getToolHref('/tools/pig-latin')
    },
    {
      title: t('navigation.romanNumeralDate'),
      href: getToolHref('/tools/roman-numeral-date')
    },
    {
      title: t('navigation.utmBuilder'),
      href: getToolHref('/tools/utm-builder')
    },
    {
      title: t('navigation.extractEmailsFromPdf'),
      href: getToolHref('/tools/extract-emails-from-pdf')
    }
  ].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="space-y-8 mb-8">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">{t('header.title')}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto md:mx-0">
              {tCommon('footer.tagline')}
            </p>
          </div>

          {/* First Row - 4 Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Analysis & Counter Tools */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">
                {t('navigation.analysisCounterTools')}
              </h4>
              <ul className="space-y-2">
                {analysisCounterTools.map((tool, index) => (
                  <li key={index}>
                    <Link
                      href={tool.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {tool.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Code & Data Translation */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">
                {t('navigation.codeDataTranslation')}
              </h4>
              <ul className="space-y-2">
                {codeDataTools.map((tool, index) => (
                  <li key={index}>
                    <Link
                      href={tool.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {tool.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Convert Case Tools */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">
                {t('navigation.convertCaseTools')}
              </h4>
              <ul className="space-y-2">
                {convertCaseTools.map((tool, index) => (
                  <li key={index}>
                    <Link
                      href={tool.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {tool.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Image Tools */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">
                {t('navigation.imageTools')}
              </h4>
              <ul className="space-y-2">
                {imageTools.map((tool, index) => (
                  <li key={index}>
                    <Link
                      href={tool.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {tool.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Second Row - Remaining Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Miscellaneous Tools */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">
                {t('navigation.miscellaneousTools')}
              </h4>
              <ul className="space-y-2">
                {miscellaneousTools.map((tool, index) => (
                  <li key={index}>
                    <Link
                      href={tool.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {tool.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Random Generators */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">
                {t('navigation.randomGenerators')}
              </h4>
              <ul className="space-y-2">
                {randomGenerators.map((tool, index) => (
                  <li key={index}>
                    <Link
                      href={tool.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {tool.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Media Text Generators */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">
                {t('navigation.socialMediaTextGenerators')}
              </h4>
              <ul className="space-y-2">
                {socialMediaTools.map((tool, index) => (
                  <li key={index}>
                    <Link
                      href={tool.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {tool.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Text Formatting */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">
                {t('navigation.textFormatting')}
              </h4>
              <ul className="space-y-2">
                {textFormattingTools.map((tool, index) => (
                  <li key={index}>
                    <Link
                      href={tool.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {tool.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Separator and centered Company/Legal links */}
          <div className="mt-10 pt-8 border-t border-border">
            <div className="flex flex-col items-center gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full md:w-auto text-center">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    {t('footer.headings.company')}
                  </h4>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href={getToolHref('/about-us')}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {t('footer.links.aboutUs')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={getToolHref('/contact-us')}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {t('footer.links.contactUs')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={getToolHref('/changelog')}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {t('footer.links.changelog')}
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    {t('footer.headings.legal')}
                  </h4>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href={getToolHref('/privacy-policy')}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {t('footer.links.privacyPolicy')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={getToolHref('/terms-of-service')}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {t('footer.links.termsOfService')}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="flex flex-col items-center space-y-2 md:items-start">
              <p className="text-sm text-muted-foreground text-center md:text-left">
                {t('footer.copyright')}
              </p>
              <p className="text-sm text-muted-foreground text-center md:text-left">
                {t('footer.madeWith')}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{tCommon('footer.availableIn')}</span>
              <span className="text-sm">{tCommon('footer.languages.en')}</span>
              <span className="text-sm">{tCommon('footer.languages.ru')}</span>
              <span className="text-sm">{tCommon('footer.languages.de')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
