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

  const convertCaseTools = [
    {
      title: t('navigation.uppercase'),
      href: currentLocale === 'en' ? '/tools/uppercase' : '/ru/tools/uppercase'
    },
    {
      title: t('navigation.lowercase'),
      href: currentLocale === 'en' ? '/tools/lowercase' : '/ru/tools/lowercase'
    },
    {
      title: t('navigation.titleCase'),
      href: currentLocale === 'en' ? '/tools/title-case' : '/ru/tools/title-case'
    },
    {
      title: t('navigation.sentenceCase'),
      href: currentLocale === 'en' ? '/tools/sentence-case' : '/ru/tools/sentence-case'
    },
    {
      title: t('navigation.alternatingCase'),
      href: currentLocale === 'en' ? '/tools/alternating-case' : '/ru/tools/alternating-case'
    },
    {
      title: t('navigation.camelCaseConverter'),
      href: currentLocale === 'en' ? '/tools/camel-case-converter' : '/ru/tools/camel-case-converter'
    }
  ].sort((a, b) => a.title.localeCompare(b.title));

  const analysisCounterTools = [
    {
      title: t('navigation.textCounter'),
      href: currentLocale === 'en' ? '/tools/text-counter' : '/ru/tools/text-counter'
    },
    {
      title: t('navigation.sentenceCounter'),
      href: currentLocale === 'en' ? '/tools/sentence-counter' : '/ru/tools/sentence-counter'
    },
    {
      title: t('navigation.wordFrequency'),
      href: currentLocale === 'en' ? '/tools/word-frequency' : '/ru/tools/word-frequency'
    },
    {
      title: t('navigation.extractNumbers'),
      href: currentLocale === 'en' ? '/tools/extract-numbers' : '/ru/tools/extract-numbers'
    }
  ].sort((a, b) => a.title.localeCompare(b.title));

  const textFormattingTools = [
    {
      title: t('navigation.invisibleText'),
      href: currentLocale === 'en' ? '/tools/invisible-text' : '/ru/tools/invisible-text'
    },
    {
      title: t('navigation.repeatText'),
      href: currentLocale === 'en' ? '/tools/repeat-text' : '/ru/tools/repeat-text'
    },
    {
      title: t('navigation.textReplace'),
      href: currentLocale === 'en' ? '/tools/text-replace' : '/ru/tools/text-replace'
    },
    {
      title: t('navigation.removeLineBreaks'),
      href: currentLocale === 'en' ? '/tools/remove-line-breaks' : '/ru/tools/remove-line-breaks'
    },
    {
      title: t('navigation.removePunctuation'),
      href: currentLocale === 'en' ? '/tools/remove-punctuation' : '/ru/tools/remove-punctuation'
    },
    {
      title: t('navigation.removeTextFormatting'),
      href: currentLocale === 'en' ? '/tools/remove-text-formatting' : '/ru/tools/remove-text-formatting'
    },
    {
      title: t('navigation.duplicateLineRemover'),
      href: currentLocale === 'en' ? '/tools/duplicate-line-remover' : '/ru/tools/duplicate-line-remover'
    },
    {
      title: t('navigation.boldText'),
      href: currentLocale === 'en' ? '/tools/bold-text' : '/ru/tools/bold-text'
    },
    {
      title: t('navigation.italicText'),
      href: currentLocale === 'en' ? '/tools/italic-text' : '/ru/tools/italic-text'
    },
    {
      title: t('navigation.subscriptText'),
      href: currentLocale === 'en' ? '/tools/subscript-text' : '/ru/tools/subscript-text'
    },
    {
      title: t('navigation.bigText'),
      href: currentLocale === 'en' ? '/tools/big-text' : '/ru/tools/big-text'
    },
    {
      title: t('navigation.bubbleText'),
      href: currentLocale === 'en' ? '/tools/bubble-text' : '/ru/tools/bubble-text'
    },
    {
      title: t('navigation.cursedText'),
      href: currentLocale === 'en' ? '/tools/cursed-text' : '/ru/tools/cursed-text'
    },
    {
      title: t('navigation.mirrorText'),
      href: currentLocale === 'en' ? '/tools/mirror-text' : '/ru/tools/mirror-text'
    },
    {
      title: t('navigation.sortWords'),
      href: currentLocale === 'en' ? '/tools/sort-words' : '/ru/tools/sort-words'
    },
    {
      title: t('navigation.plainText'),
      href: currentLocale === 'en' ? '/tools/plain-text' : '/ru/tools/plain-text'
    },
    {
      title: t('navigation.extractEmailsFromText'),
      href: currentLocale === 'en' ? '/tools/extract-emails-from-text' : '/ru/tools/extract-emails-from-text'
    }
  ].sort((a, b) => a.title.localeCompare(b.title));

  const codeDataTools = [
    {
      title: t('navigation.base64EncoderDecoder'),
      href: currentLocale === 'en' ? '/tools/base64-encoder-decoder' : '/ru/tools/base64-encoder-decoder'
    },
    {
      title: t('navigation.binaryCodeTranslator'),
      href: currentLocale === 'en' ? '/tools/binary-code-translator' : '/ru/tools/binary-code-translator'
    },
    {
      title: t('navigation.hexToText'),
      href: currentLocale === 'en' ? '/tools/hex-to-text' : '/ru/tools/hex-to-text'
    },
    {
      title: t('navigation.morseCode'),
      href: currentLocale === 'en' ? '/tools/morse-code' : '/ru/tools/morse-code'
    },
    {
      title: t('navigation.caesarCipher'),
      href: currentLocale === 'en' ? '/tools/caesar-cipher' : '/ru/tools/caesar-cipher'
    },
    {
      title: t('navigation.rot13'),
      href: currentLocale === 'en' ? '/tools/rot13' : '/ru/tools/rot13'
    },
    {
      title: t('navigation.csvToJson'),
      href: currentLocale === 'en' ? '/tools/csv-to-json' : '/ru/tools/csv-to-json'
    },
    {
      title: t('navigation.jsonStringify'),
      href: currentLocale === 'en' ? '/tools/json-stringify' : '/ru/tools/json-stringify'
    },
    {
      title: t('navigation.urlConverter'),
      href: currentLocale === 'en' ? '/tools/url-converter' : '/ru/tools/url-converter'
    },
    {
      title: t('navigation.utf8Converter'),
      href: currentLocale === 'en' ? '/tools/utf8-converter' : '/ru/tools/utf8-converter'
    },
    {
      title: t('navigation.slugifyUrl'),
      href: currentLocale === 'en' ? '/tools/slugify-url' : '/ru/tools/slugify-url'
    }
  ].sort((a, b) => a.title.localeCompare(b.title));

  const imageTools = [
    {
      title: t('navigation.imageCropper'),
      href: currentLocale === 'en' ? '/tools/image-cropper' : '/ru/tools/image-cropper'
    },
    {
      title: t('navigation.imageResizer'),
      href: currentLocale === 'en' ? '/tools/image-resizer' : '/ru/tools/image-resizer'
    },
    {
      title: t('navigation.imageToText'),
      href: currentLocale === 'en' ? '/tools/image-to-text' : '/ru/tools/image-to-text'
    },
    {
      title: t('navigation.jpgToPng'),
      href: currentLocale === 'en' ? '/tools/jpg-to-png' : '/ru/tools/jpg-to-png'
    },
    {
      title: t('navigation.jpgToWebp'),
      href: currentLocale === 'en' ? '/tools/jpg-to-webp' : '/ru/tools/jpg-to-webp'
    },
    {
      title: t('navigation.pngToJpg'),
      href: currentLocale === 'en' ? '/tools/png-to-jpg' : '/ru/tools/png-to-jpg'
    },
    {
      title: t('navigation.pngToWebp'),
      href: currentLocale === 'en' ? '/tools/png-to-webp' : '/ru/tools/png-to-webp'
    },
    {
      title: t('navigation.webpToJpg'),
      href: currentLocale === 'en' ? '/tools/webp-to-jpg' : '/ru/tools/webp-to-jpg'
    },
    {
      title: t('navigation.webpToPng'),
      href: currentLocale === 'en' ? '/tools/webp-to-png' : '/ru/tools/webp-to-png'
    }
  ].sort((a, b) => a.title.localeCompare(b.title));

  const randomGenerators = [
    {
      title: t('navigation.randomNumber'),
      href: currentLocale === 'en' ? '/tools/random-number' : '/ru/tools/random-number'
    },
    {
      title: t('navigation.randomLetter'),
      href: currentLocale === 'en' ? '/tools/random-letter' : '/ru/tools/random-letter'
    },
    {
      title: t('navigation.randomDate'),
      href: currentLocale === 'en' ? '/tools/random-date' : '/ru/tools/random-date'
    },
    {
      title: t('navigation.randomMonth'),
      href: currentLocale === 'en' ? '/tools/random-month' : '/ru/tools/random-month'
    },
    {
      title: t('navigation.randomIP'),
      href: currentLocale === 'en' ? '/tools/random-ip' : '/ru/tools/random-ip'
    },
    {
      title: t('navigation.randomChoice'),
      href: currentLocale === 'en' ? '/tools/random-choice' : '/ru/tools/random-choice'
    },
    {
      title: t('navigation.passwordGenerator'),
      href: currentLocale === 'en' ? '/tools/password-generator' : '/ru/tools/password-generator'
    },
    {
      title: t('navigation.uuidGenerator'),
      href: currentLocale === 'en' ? '/tools/uuid-generator' : '/ru/tools/uuid-generator'
    }
  ].sort((a, b) => a.title.localeCompare(b.title));

  const socialMediaTools = [
    {
      title: t('navigation.instagramFonts'),
      href: currentLocale === 'en' ? '/tools/instagram-fonts' : '/ru/tools/instagram-fonts'
    },
    {
      title: t('navigation.facebookFont'),
      href: currentLocale === 'en' ? '/tools/facebook-font' : '/ru/tools/facebook-font'
    },
    {
      title: t('navigation.discordFont'),
      href: currentLocale === 'en' ? '/tools/discord-font' : '/ru/tools/discord-font'
    }
  ].sort((a, b) => a.title.localeCompare(b.title));

  const miscellaneousTools = [
    {
      title: t('navigation.onlineNotepad'),
      href: currentLocale === 'en' ? '/tools/online-notepad' : '/ru/tools/online-notepad'
    },
    {
      title: t('navigation.numberSorter'),
      href: currentLocale === 'en' ? '/tools/number-sorter' : '/ru/tools/number-sorter'
    },
    {
      title: t('navigation.asciiArtGenerator'),
      href: currentLocale === 'en' ? '/tools/ascii-art-generator' : '/ru/tools/ascii-art-generator'
    },
    {
      title: t('navigation.natoPhonetic'),
      href: currentLocale === 'en' ? '/tools/nato-phonetic' : '/ru/tools/nato-phonetic'
    },
    {
      title: t('navigation.md5Hash'),
      href: currentLocale === 'en' ? '/tools/md5-hash' : '/ru/tools/md5-hash'
    },
    {
      title: t('navigation.phoneticSpelling'),
      href: currentLocale === 'en' ? '/tools/phonetic-spelling' : '/ru/tools/phonetic-spelling'
    },
    {
      title: t('navigation.pigLatin'),
      href: currentLocale === 'en' ? '/tools/pig-latin' : '/ru/tools/pig-latin'
    },
    {
      title: t('navigation.romanNumeralDate'),
      href: currentLocale === 'en' ? '/tools/roman-numeral-date' : '/ru/tools/roman-numeral-date'
    },
    {
      title: t('navigation.utmBuilder'),
      href: currentLocale === 'en' ? '/tools/utm-builder' : '/ru/tools/utm-builder'
    },
    {
      title: t('navigation.extractEmailsFromPdf'),
      href: currentLocale === 'en' ? '/tools/extract-emails-from-pdf' : '/ru/tools/extract-emails-from-pdf'
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
                        href={currentLocale === 'en' ? '/about-us' : '/ru/about-us'}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {t('footer.links.aboutUs')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={currentLocale === 'en' ? '/contact-us' : '/ru/contact-us'}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {t('footer.links.contactUs')}
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
                        href={currentLocale === 'en' ? '/privacy-policy' : '/ru/privacy-policy'}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {t('footer.links.privacyPolicy')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={currentLocale === 'en' ? '/terms-of-service' : '/ru/terms-of-service'}
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
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
