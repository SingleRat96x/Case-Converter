'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { X, ChevronDown, ChevronRight, Globe, Sun, Moon, Monitor, Type, Palette, Code2, Image as ImageIcon, BarChart3, Settings } from 'lucide-react';
import { useNavigationTranslations } from '@/lib/i18n/hooks';

interface MobileNavigationProps {
  locale: 'en' | 'ru' | 'de';
  onLocaleChange: (locale: 'en' | 'ru' | 'de') => void;
}

export function MobileNavigation({ locale, onLocaleChange }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>('system');
  const { tSync: t } = useNavigationTranslations();

  // Detect current theme on mount and changes
  useEffect(() => {
    const detectTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setCurrentTheme('dark');
      } else if (savedTheme === 'light') {
        setCurrentTheme('light');
      } else {
        setCurrentTheme('system');
      }
    };
    
    detectTheme();
    
    // Listen for theme changes
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setExpandedCategory(null);
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setCurrentTheme(theme);
    
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.removeItem('theme');
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const menuCategories = [
    {
      id: 'case-converter',
      title: t('navigation.convertCaseTools'),
      icon: <Type className="h-5 w-5" />,
      items: [
        {
          title: t('navigation.uppercase'),
          href: locale === 'en' ? '/tools/uppercase' : locale === 'ru' ? '/ru/tools/uppercase' : '/de/tools/uppercase',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.lowercase'),
          href: locale === 'en' ? '/tools/lowercase' : locale === 'ru' ? '/ru/tools/lowercase' : '/de/tools/lowercase',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.titleCase'),
          href: locale === 'en' ? '/tools/title-case' : locale === 'ru' ? '/ru/tools/title-case' : '/de/tools/title-case',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.sentenceCase'),
          href: locale === 'en' ? '/tools/sentence-case' : locale === 'ru' ? '/ru/tools/sentence-case' : '/de/tools/sentence-case',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.alternatingCase'),
          href: locale === 'en' ? '/tools/alternating-case' : locale === 'ru' ? '/ru/tools/alternating-case' : '/de/tools/alternating-case',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.camelCaseConverter'),
          href: locale === 'en' ? '/tools/camel-case-converter' : locale === 'ru' ? '/ru/tools/camel-case-converter' : '/de/tools/camel-case-converter',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.snakeCaseConverter'),
          href: locale === 'en' ? '/tools/snake-case-converter' : locale === 'ru' ? '/ru/tools/snake-case-converter' : '/de/tools/snake-case-converter',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.kebabCaseConverter'),
          href: locale === 'en' ? '/tools/kebab-case-converter' : locale === 'ru' ? '/ru/tools/kebab-case-converter' : '/de/tools/kebab-case-converter',
          icon: <ChevronRight className="h-4 w-4" />
        }
      ]
    },
    {
      id: 'analysis-counter',
      title: t('navigation.analysisCounterTools'),
      icon: <BarChart3 className="h-5 w-5" />,
      items: [
        {
          title: t('navigation.textCounter'),
          href: locale === 'en' ? '/tools/text-counter' : locale === 'ru' ? '/ru/tools/text-counter' : '/de/tools/text-counter',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.sentenceCounter'),
          href: locale === 'en' ? '/tools/sentence-counter' : locale === 'ru' ? '/ru/tools/sentence-counter' : '/de/tools/sentence-counter',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.wordFrequency'),
          href: locale === 'en' ? '/tools/word-frequency' : locale === 'ru' ? '/ru/tools/word-frequency' : '/de/tools/word-frequency',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.extractNumbers'),
          href: locale === 'en' ? '/tools/extract-numbers' : locale === 'ru' ? '/ru/tools/extract-numbers' : '/de/tools/extract-numbers',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.readingTimeEstimator'),
          href: locale === 'en' ? '/tools/reading-time-estimator' : locale === 'ru' ? '/ru/tools/reading-time-estimator' : '/de/tools/reading-time-estimator',
          icon: <ChevronRight className="h-4 w-4" />
        }
      ]
    },
    {
      id: 'social-media',
      title: t('navigation.socialMediaTextGenerators'),
      icon: <Palette className="h-5 w-5" />,
      items: [
        {
          title: t('navigation.instagramFonts'),
          href: locale === 'en' ? '/tools/instagram-fonts' : locale === 'ru' ? '/ru/tools/instagram-fonts' : '/de/tools/instagram-fonts',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.facebookFont'),
          href: locale === 'en' ? '/tools/facebook-font' : locale === 'ru' ? '/ru/tools/facebook-font' : '/de/tools/facebook-font',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.discordFont'),
          href: locale === 'en' ? '/tools/discord-font' : locale === 'ru' ? '/ru/tools/discord-font' : '/de/tools/discord-font',
          icon: <ChevronRight className="h-4 w-4" />
        }
      ]
    },
    {
      id: 'text-formatting',
      title: t('navigation.textFormatting'),
      icon: <Palette className="h-5 w-5" />,
      items: [
        {
          title: t('navigation.invisibleText'),
          href: locale === 'en' ? '/tools/invisible-text' : locale === 'ru' ? '/ru/tools/invisible-text' : '/de/tools/invisible-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.repeatText'),
          href: locale === 'en' ? '/tools/repeat-text' : locale === 'ru' ? '/ru/tools/repeat-text' : '/de/tools/repeat-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.textReplace'),
          href: locale === 'en' ? '/tools/text-replace' : locale === 'ru' ? '/ru/tools/text-replace' : '/de/tools/text-replace',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.removeLineBreaks'),
          href: locale === 'en' ? '/tools/remove-line-breaks' : locale === 'ru' ? '/ru/tools/remove-line-breaks' : '/de/tools/remove-line-breaks',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.removeTextFormatting'),
          href: locale === 'en' ? '/tools/remove-text-formatting' : locale === 'ru' ? '/ru/tools/remove-text-formatting' : '/de/tools/remove-text-formatting',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.duplicateLineRemover'),
          href: locale === 'en' ? '/tools/duplicate-line-remover' : locale === 'ru' ? '/ru/tools/duplicate-line-remover' : '/de/tools/duplicate-line-remover',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.removePunctuation'),
          href: locale === 'en' ? '/tools/remove-punctuation' : locale === 'ru' ? '/ru/tools/remove-punctuation' : '/de/tools/remove-punctuation',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.boldText'),
          href: locale === 'en' ? '/tools/bold-text' : locale === 'ru' ? '/ru/tools/bold-text' : '/de/tools/bold-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.italicText'),
          href: locale === 'en' ? '/tools/italic-text' : locale === 'ru' ? '/ru/tools/italic-text' : '/de/tools/italic-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.subscriptText'),
          href: locale === 'en' ? '/tools/subscript-text' : locale === 'ru' ? '/ru/tools/subscript-text' : '/de/tools/subscript-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.bigText'),
          href: locale === 'en' ? '/tools/big-text' : locale === 'ru' ? '/ru/tools/big-text' : '/de/tools/big-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.bubbleText'),
          href: locale === 'en' ? '/tools/bubble-text' : locale === 'ru' ? '/ru/tools/bubble-text' : '/de/tools/bubble-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.cursedText'),
          href: locale === 'en' ? '/tools/cursed-text' : locale === 'ru' ? '/ru/tools/cursed-text' : '/de/tools/cursed-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.mirrorText'),
          href: locale === 'en' ? '/tools/mirror-text' : locale === 'ru' ? '/ru/tools/mirror-text' : '/de/tools/mirror-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.sortWords'),
          href: locale === 'en' ? '/tools/sort-words' : locale === 'ru' ? '/ru/tools/sort-words' : '/de/tools/sort-words',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.plainText'),
          href: locale === 'en' ? '/tools/plain-text' : locale === 'ru' ? '/ru/tools/plain-text' : '/de/tools/plain-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.extractEmailsFromText'),
          href: locale === 'en' ? '/tools/extract-emails-from-text' : locale === 'ru' ? '/ru/tools/extract-emails-from-text' : '/de/tools/extract-emails-from-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.addLineNumbers'),
          href: locale === 'en' ? '/tools/add-line-numbers-to-text' : locale === 'ru' ? '/ru/tools/add-line-numbers-to-text' : '/de/tools/add-line-numbers-to-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.addPrefixSuffix'),
          href: locale === 'en' ? '/tools/add-prefix-and-suffix-to-lines' : locale === 'ru' ? '/ru/tools/add-prefix-and-suffix-to-lines' : '/de/tools/add-prefix-and-suffix-to-lines',
          icon: <ChevronRight className="h-4 w-4" />
        }
      ]
    },
    {
      id: 'random-generators',
      title: t('navigation.randomGenerators'),
      icon: <Type className="h-5 w-5" />,
      items: [
        {
          title: t('navigation.randomNumber'),
          href: locale === 'en' ? '/tools/random-number' : locale === 'ru' ? '/ru/tools/random-number' : '/de/tools/random-number',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.randomLetter'),
          href: locale === 'en' ? '/tools/random-letter' : locale === 'ru' ? '/ru/tools/random-letter' : '/de/tools/random-letter',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.randomDate'),
          href: locale === 'en' ? '/tools/random-date' : locale === 'ru' ? '/ru/tools/random-date' : '/de/tools/random-date',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.randomMonth'),
          href: locale === 'en' ? '/tools/random-month' : locale === 'ru' ? '/ru/tools/random-month' : '/de/tools/random-month',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.randomIP'),
          href: locale === 'en' ? '/tools/random-ip' : locale === 'ru' ? '/ru/tools/random-ip' : '/de/tools/random-ip',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.randomChoice'),
          href: locale === 'en' ? '/tools/random-choice' : locale === 'ru' ? '/ru/tools/random-choice' : '/de/tools/random-choice',
          icon: <ChevronRight className="h-4 w-4" />
        }
        ,
        {
          title: t('navigation.passwordGenerator'),
          href: locale === 'en' ? '/tools/password-generator' : locale === 'ru' ? '/ru/tools/password-generator' : '/de/tools/password-generator',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.uuidGenerator'),
          href: locale === 'en' ? '/tools/uuid-generator' : locale === 'ru' ? '/ru/tools/uuid-generator' : '/de/tools/uuid-generator',
          icon: <ChevronRight className="h-4 w-4" />
        }
      ]
    },
    {
      id: 'code-data',
      title: t('navigation.codeDataTranslation'),
      icon: <Code2 className="h-5 w-5" />,
      items: [
        {
          title: t('navigation.base64EncoderDecoder'),
          href: locale === 'en' ? '/tools/base64-encoder-decoder' : locale === 'ru' ? '/ru/tools/base64-encoder-decoder' : '/de/tools/base64-encoder-decoder',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.binaryCodeTranslator'),
          href: locale === 'en' ? '/tools/binary-code-translator' : locale === 'ru' ? '/ru/tools/binary-code-translator' : '/de/tools/binary-code-translator',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.hexToText'),
          href: locale === 'en' ? '/tools/hex-to-text' : locale === 'ru' ? '/ru/tools/hex-to-text' : '/de/tools/hex-to-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.morseCode'),
          href: locale === 'en' ? '/tools/morse-code' : locale === 'ru' ? '/ru/tools/morse-code' : '/de/tools/morse-code',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.caesarCipher'),
          href: locale === 'en' ? '/tools/caesar-cipher' : locale === 'ru' ? '/ru/tools/caesar-cipher' : '/de/tools/caesar-cipher',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.rot13'),
          href: locale === 'en' ? '/tools/rot13' : locale === 'ru' ? '/ru/tools/rot13' : '/de/tools/rot13',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.csvToJson'),
          href: locale === 'en' ? '/tools/csv-to-json' : locale === 'ru' ? '/ru/tools/csv-to-json' : '/de/tools/csv-to-json',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.jsonStringify'),
          href: locale === 'en' ? '/tools/json-stringify' : locale === 'ru' ? '/ru/tools/json-stringify' : '/de/tools/json-stringify',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.jsonFormatter'),
          href: locale === 'en' ? '/tools/json-formatter' : locale === 'ru' ? '/ru/tools/json-formatter' : '/de/tools/json-formatter',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.urlConverter'),
          href: locale === 'en' ? '/tools/url-converter' : locale === 'ru' ? '/ru/tools/url-converter' : '/de/tools/url-converter',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.utf8Converter'),
          href: locale === 'en' ? '/tools/utf8-converter' : locale === 'ru' ? '/ru/tools/utf8-converter' : '/de/tools/utf8-converter',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.slugifyUrl'),
          href: locale === 'en' ? '/tools/slugify-url' : locale === 'ru' ? '/ru/tools/slugify-url' : '/de/tools/slugify-url',
          icon: <ChevronRight className="h-4 w-4" />
        }
      ]
    },
    {
      id: 'image-tools',
      title: t('navigation.imageTools'),
      icon: <ImageIcon className="h-5 w-5" />,
      items: [
        {
          title: t('navigation.imageCropper'),
          href: locale === 'en' ? '/tools/image-cropper' : locale === 'ru' ? '/ru/tools/image-cropper' : '/de/tools/image-cropper',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.imageResizer'),
          href: locale === 'en' ? '/tools/image-resizer' : locale === 'ru' ? '/ru/tools/image-resizer' : '/de/tools/image-resizer',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.imageToText'),
          href: locale === 'en' ? '/tools/image-to-text' : locale === 'ru' ? '/ru/tools/image-to-text' : '/de/tools/image-to-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.jpgToPng'),
          href: locale === 'en' ? '/tools/jpg-to-png' : locale === 'ru' ? '/ru/tools/jpg-to-png' : '/de/tools/jpg-to-png',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.jpgToWebp'),
          href: locale === 'en' ? '/tools/jpg-to-webp' : locale === 'ru' ? '/ru/tools/jpg-to-webp' : '/de/tools/jpg-to-webp',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.pngToJpg'),
          href: locale === 'en' ? '/tools/png-to-jpg' : locale === 'ru' ? '/ru/tools/png-to-jpg' : '/de/tools/png-to-jpg',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.pngToWebp'),
          href: locale === 'en' ? '/tools/png-to-webp' : locale === 'ru' ? '/ru/tools/png-to-webp' : '/de/tools/png-to-webp',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.webpToJpg'),
          href: locale === 'en' ? '/tools/webp-to-jpg' : locale === 'ru' ? '/ru/tools/webp-to-jpg' : '/de/tools/webp-to-jpg',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.webpToPng'),
          href: locale === 'en' ? '/tools/webp-to-png' : locale === 'ru' ? '/ru/tools/webp-to-png' : '/de/tools/webp-to-png',
          icon: <ChevronRight className="h-4 w-4" />
        }
      ]
    },
    {
      id: 'miscellaneous-tools',
      title: t('navigation.miscellaneousTools'),
      icon: <Settings className="h-5 w-5" />,
      items: [
        {
          title: t('navigation.onlineNotepad'),
          href: locale === 'en' ? '/tools/online-notepad' : locale === 'ru' ? '/ru/tools/online-notepad' : '/de/tools/online-notepad',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.numberSorter'),
          href: locale === 'en' ? '/tools/number-sorter' : locale === 'ru' ? '/ru/tools/number-sorter' : '/de/tools/number-sorter',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.asciiArtGenerator'),
          href: locale === 'en' ? '/tools/ascii-art-generator' : locale === 'ru' ? '/ru/tools/ascii-art-generator' : '/de/tools/ascii-art-generator',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.natoPhonetic'),
          href: locale === 'en' ? '/tools/nato-phonetic' : locale === 'ru' ? '/ru/tools/nato-phonetic' : '/de/tools/nato-phonetic',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.md5Hash'),
          href: locale === 'en' ? '/tools/md5-hash' : locale === 'ru' ? '/ru/tools/md5-hash' : '/de/tools/md5-hash',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.sha1HashGenerator'),
          href: locale === 'en' ? '/tools/sha1-hash-generator' : locale === 'ru' ? '/ru/tools/sha1-hash-generator' : '/de/tools/sha1-hash-generator',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.phoneticSpelling'),
          href: locale === 'en' ? '/tools/phonetic-spelling' : locale === 'ru' ? '/ru/tools/phonetic-spelling' : '/de/tools/phonetic-spelling',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.pigLatin'),
          href: locale === 'en' ? '/tools/pig-latin' : locale === 'ru' ? '/ru/tools/pig-latin' : '/de/tools/pig-latin',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.romanNumeralDate'),
          href: locale === 'en' ? '/tools/roman-numeral-date' : locale === 'ru' ? '/ru/tools/roman-numeral-date' : '/de/tools/roman-numeral-date',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.utmBuilder'),
          href: locale === 'en' ? '/tools/utm-builder' : locale === 'ru' ? '/ru/tools/utm-builder' : '/de/tools/utm-builder',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.extractEmailsFromPdf'),
          href: locale === 'en' ? '/tools/extract-emails-from-pdf' : locale === 'ru' ? '/ru/tools/extract-emails-from-pdf' : '/de/tools/extract-emails-from-pdf',
          icon: <ChevronRight className="h-4 w-4" />
        }
      ]
    }
  ];

  return (
    <div className="md:hidden">
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleMenu}
        className="h-9 w-9 p-0 relative overflow-hidden"
        aria-label="Toggle mobile menu"
      >
        <div className="relative w-4 h-4 flex flex-col justify-center items-center">
          {/* Hamburger Lines */}
          <span
            className={`block h-0.5 w-4 bg-current rounded-full transition-all duration-300 ease-in-out transform ${
              isOpen 
                ? 'rotate-45 translate-y-0.5' 
                : 'rotate-0 translate-y-0'
            }`}
          />
          <span
            className={`block h-0.5 w-4 bg-current rounded-full transition-all duration-300 ease-in-out transform my-0.5 ${
              isOpen 
                ? 'opacity-0 scale-0' 
                : 'opacity-100 scale-100'
            }`}
          />
          <span
            className={`block h-0.5 w-4 bg-current rounded-full transition-all duration-300 ease-in-out transform ${
              isOpen 
                ? '-rotate-45 -translate-y-0.5' 
                : 'rotate-0 translate-y-0'
            }`}
          />
        </div>
      </Button>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-[9999] transition-all duration-500 ease-in-out ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-500 ease-in-out ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMenu}
        />
        
        {/* Menu Panel - Full Screen */}
        <div className={`absolute inset-0 bg-background border-r border-border shadow-2xl flex flex-col h-screen transition-all duration-500 ease-in-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border bg-background">
            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{t('header.title')}</h2>
                <p className="text-xs text-muted-foreground">{t('header.subtitle')}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={closeMenu}
              className="h-8 w-8 p-0 hover:scale-110 active:scale-95 transition-transform"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
            
          {/* Menu Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-background min-h-0 mobile-menu-scroll">
            {menuCategories.map((category) => (
              <div key={category.id} className="space-y-1">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {category.icon}
                    <span className="font-medium text-foreground">{category.title}</span>
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform duration-200 ${
                      expandedCategory === category.id ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </button>
                
                {/* Sub-menu Items */}
                <div className={`ml-8 space-y-1 transition-all duration-300 mobile-submenu-scroll ${
                  expandedCategory === category.id 
                    ? 'max-h-[60vh] overflow-y-auto opacity-100 pb-2' 
                    : 'max-h-0 overflow-hidden opacity-0'
                }`}>
                  {category.items.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      onClick={closeMenu}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {item.icon}
                      <span className="text-foreground">{item.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Controls */}
          <div className="flex-shrink-0 border-t border-border p-4 space-y-3 bg-background">
            {/* Theme Toggle */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                <Sun className="h-4 w-4" />
                <span>Theme</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={currentTheme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 transition-colors"
                  onClick={() => handleThemeChange('light')}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </Button>
                <Button
                  variant={currentTheme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 transition-colors"
                  onClick={() => handleThemeChange('dark')}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </Button>
                <Button
                  variant={currentTheme === 'system' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 transition-colors"
                  onClick={() => handleThemeChange('system')}
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  System
                </Button>
              </div>
            </div>

            {/* Language Toggle */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>Language</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={locale === 'en' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 transition-colors"
                  onClick={() => onLocaleChange('en')}
                >
                  EN
                </Button>
                <Button
                  variant={locale === 'ru' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 transition-colors"
                  onClick={() => onLocaleChange('ru')}
                >
                  RU
                </Button>
                <Button
                  variant={locale === 'de' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 transition-colors"
                  onClick={() => onLocaleChange('de')}
                >
                  DE
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
