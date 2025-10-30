'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { MobileNavigation } from '@/components/ui/mobile-navigation';
import { MegaMenu, type ToolCategory } from '@/components/ui/mega-menu';
import { Type, Palette, Code2, Image as ImageIcon, BarChart3, Settings, Shuffle } from 'lucide-react';
import { getLocaleFromPathname, getLocalizedPathname, type Locale } from '@/lib/i18n';
import { useNavigationTranslations, useCommonTranslations } from '@/lib/i18n/hooks';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = getLocaleFromPathname(pathname);
  const { tSync: t } = useNavigationTranslations();
  const { tSync: tCommon } = useCommonTranslations();

  const switchLanguage = (newLocale: Locale) => {
    // Don't switch if we're already on the target locale
    if (newLocale === currentLocale) {
      return;
    }
    
    // Save language preference in cookie for future visits
    document.cookie = `preferred-locale=${newLocale}; max-age=${60 * 60 * 24 * 365}; path=/; samesite=lax`;
    
    const newPath = getLocalizedPathname(pathname, newLocale);
    
    // Use router.push for better navigation handling
    router.push(newPath);
  };

  // Define navigation structure for mega menu
  const navigationCategories: ToolCategory[] = [
    {
      id: 'analysis-counter-tools',
      titleKey: 'navigation.analysisCounterTools',
      icon: <BarChart3 className="h-4 w-4" />,
      items: [
        { titleKey: 'navigation.textCounter', href: '/tools/text-counter', isPopular: true },
        { titleKey: 'navigation.sentenceCounter', href: '/tools/sentence-counter' },
        { titleKey: 'navigation.wordFrequency', href: '/tools/word-frequency' },
        { titleKey: 'navigation.extractNumbers', href: '/tools/extract-numbers' },
      ]
    },
    {
      id: 'social-media-text-generators',
      titleKey: 'navigation.socialMediaTextGenerators',
      icon: <Palette className="h-4 w-4" />,
      items: [
        { titleKey: 'navigation.instagramFonts', href: '/tools/instagram-fonts', isPopular: true },
        { titleKey: 'navigation.facebookFont', href: '/tools/facebook-font' },
        { titleKey: 'navigation.discordFont', href: '/tools/discord-font' },
      ]
    },
    {
      id: 'text-modification-formatting',
      titleKey: 'navigation.textModificationFormatting',
      icon: <Type className="h-4 w-4" />,
      items: [
        // Case converters
        { titleKey: 'navigation.uppercase', href: '/tools/uppercase', isPopular: true },
        { titleKey: 'navigation.lowercase', href: '/tools/lowercase', isPopular: true },
        { titleKey: 'navigation.titleCase', href: '/tools/title-case', isPopular: true },
        { titleKey: 'navigation.sentenceCase', href: '/tools/sentence-case' },
        { titleKey: 'navigation.alternatingCase', href: '/tools/alternating-case' },
        { titleKey: 'navigation.camelCaseConverter', href: '/tools/camel-case-converter' },
        // Text formatting
        { titleKey: 'navigation.boldText', href: '/tools/bold-text' },
        { titleKey: 'navigation.italicText', href: '/tools/italic-text' },
        { titleKey: 'navigation.subscriptText', href: '/tools/subscript-text' },
        { titleKey: 'navigation.bigText', href: '/tools/big-text' },
        { titleKey: 'navigation.bubbleText', href: '/tools/bubble-text' },
        { titleKey: 'navigation.cursedText', href: '/tools/cursed-text' },
        { titleKey: 'navigation.mirrorText', href: '/tools/mirror-text' },
        { titleKey: 'navigation.invisibleText', href: '/tools/invisible-text' },
        // Text manipulation
        { titleKey: 'navigation.repeatText', href: '/tools/repeat-text' },
        { titleKey: 'navigation.textReplace', href: '/tools/text-replace' },
        { titleKey: 'navigation.removeLineBreaks', href: '/tools/remove-line-breaks' },
        { titleKey: 'navigation.removePunctuation', href: '/tools/remove-punctuation' },
        { titleKey: 'navigation.removeTextFormatting', href: '/tools/remove-text-formatting' },
        { titleKey: 'navigation.duplicateLineRemover', href: '/tools/duplicate-line-remover' },
        { titleKey: 'navigation.sortWords', href: '/tools/sort-words' },
        { titleKey: 'navigation.plainText', href: '/tools/plain-text' },
        { titleKey: 'navigation.extractEmailsFromText', href: '/tools/extract-emails-from-text' },
      ]
    },
    {
      id: 'random-generators',
      titleKey: 'navigation.randomGenerators',
      icon: <Shuffle className="h-4 w-4" />,
      items: [
        { titleKey: 'navigation.randomNumber', href: '/tools/random-number' },
        { titleKey: 'navigation.randomLetter', href: '/tools/random-letter' },
        { titleKey: 'navigation.randomDate', href: '/tools/random-date' },
        { titleKey: 'navigation.randomMonth', href: '/tools/random-month' },
        { titleKey: 'navigation.randomIP', href: '/tools/random-ip' },
        { titleKey: 'navigation.randomChoice', href: '/tools/random-choice' },
        { titleKey: 'navigation.passwordGenerator', href: '/tools/password-generator', isPopular: true },
        { titleKey: 'navigation.uuidGenerator', href: '/tools/uuid-generator' }
      ]
    },
    {
      id: 'code-data-translation',
      titleKey: 'navigation.codeDataTranslation',
      icon: <Code2 className="h-4 w-4" />,
      items: [
        { titleKey: 'navigation.base64EncoderDecoder', href: '/tools/base64-encoder-decoder', isPopular: true },
        { titleKey: 'navigation.binaryCodeTranslator', href: '/tools/binary-code-translator' },
        { titleKey: 'navigation.hexToText', href: '/tools/hex-to-text' },
        { titleKey: 'navigation.morseCode', href: '/tools/morse-code' },
        { titleKey: 'navigation.caesarCipher', href: '/tools/caesar-cipher' },
        { titleKey: 'navigation.rot13', href: '/tools/rot13' },
        { titleKey: 'navigation.csvToJson', href: '/tools/csv-to-json' },
        { titleKey: 'navigation.jsonStringify', href: '/tools/json-stringify', isPopular: true },
        { titleKey: 'navigation.urlConverter', href: '/tools/url-converter' },
        { titleKey: 'navigation.utf8Converter', href: '/tools/utf8-converter' },
        { titleKey: 'navigation.slugifyUrl', href: '/tools/slugify-url' },
      ]
    },
    {
      id: 'image-tools',
      titleKey: 'navigation.imageTools',
      icon: <ImageIcon className="h-4 w-4" />,
      items: [
        { titleKey: 'navigation.imageCropper', href: '/tools/image-cropper' },
        { titleKey: 'navigation.imageResizer', href: '/tools/image-resizer', isPopular: true },
        { titleKey: 'navigation.imageToText', href: '/tools/image-to-text' },
        { titleKey: 'navigation.jpgToPng', href: '/tools/jpg-to-png' },
        { titleKey: 'navigation.jpgToWebp', href: '/tools/jpg-to-webp' },
        { titleKey: 'navigation.pngToJpg', href: '/tools/png-to-jpg' },
        { titleKey: 'navigation.pngToWebp', href: '/tools/png-to-webp' },
        { titleKey: 'navigation.webpToJpg', href: '/tools/webp-to-jpg' },
        { titleKey: 'navigation.webpToPng', href: '/tools/webp-to-png' },
      ]
    },
    {
      id: 'misc-tools',
      titleKey: 'navigation.miscellaneousTools',
      icon: <Settings className="h-4 w-4" />,
      items: [
        { titleKey: 'navigation.onlineNotepad', href: '/tools/online-notepad' },
        { titleKey: 'navigation.numberSorter', href: '/tools/number-sorter' },
        { titleKey: 'navigation.asciiArtGenerator', href: '/tools/ascii-art-generator' },
        { titleKey: 'navigation.natoPhonetic', href: '/tools/nato-phonetic' },
        { titleKey: 'navigation.md5Hash', href: '/tools/md5-hash' },
        { titleKey: 'navigation.phoneticSpelling', href: '/tools/phonetic-spelling' },
        { titleKey: 'navigation.pigLatin', href: '/tools/pig-latin' },
        { titleKey: 'navigation.romanNumeralDate', href: '/tools/roman-numeral-date' },
        { titleKey: 'navigation.utmBuilder', href: '/tools/utm-builder' },
        { titleKey: 'navigation.extractEmailsFromPdf', href: '/tools/extract-emails-from-pdf' },
      ]
    }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link href={currentLocale === 'en' ? '/' : '/ru/'} className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div className="block">
                <h1 className="text-xl font-bold text-foreground">{tCommon('header.title')}</h1>
              </div>
            </Link>
          </div>

          {/* Navigation Menu - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <MegaMenu categories={navigationCategories} />
            
            {/* Additional Navigation Links */}
            <Link 
              href={currentLocale === 'en' ? '/about-us' : '/ru/about-us'}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              {t('navigation.about')}
            </Link>
            <Link 
              href={currentLocale === 'en' ? '/contact-us' : '/ru/contact-us'}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              {t('navigation.contact')}
            </Link>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-3">
            {/* Mobile Navigation */}
            <MobileNavigation locale={currentLocale} onLocaleChange={switchLanguage} />
            
            {/* Language Switcher and Theme Toggle - Hidden on Mobile */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex rounded-md border">
                <Button
                  variant={currentLocale === 'en' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => switchLanguage('en')}
                  className="rounded-r-none border-r-0 transition-all duration-200 hover:scale-105 active:scale-95"
                  disabled={currentLocale === 'en'}
                >
                  <span className="mr-1">🇺🇸</span>
                  EN
                </Button>
                <Button
                  variant={currentLocale === 'ru' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => switchLanguage('ru')}
                  className="rounded-l-none transition-all duration-200 hover:scale-105 active:scale-95"
                  disabled={currentLocale === 'ru'}
                >
                  <span className="mr-1">🇷🇺</span>
                  RU
                </Button>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}