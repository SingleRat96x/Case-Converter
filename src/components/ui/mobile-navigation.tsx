'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { X, ChevronDown, ChevronRight, Globe, Sun, Moon, Monitor, Type, Palette, Code2, Image as ImageIcon, BarChart3, Settings } from 'lucide-react';
import { useNavigationTranslations } from '@/lib/i18n/hooks';

interface MobileNavigationProps {
  locale: 'en' | 'ru';
  onLocaleChange: (locale: 'en' | 'ru') => void;
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
          href: locale === 'en' ? '/tools/uppercase' : '/ru/tools/uppercase',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.lowercase'),
          href: locale === 'en' ? '/tools/lowercase' : '/ru/tools/lowercase',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.titleCase'),
          href: locale === 'en' ? '/tools/title-case' : '/ru/tools/title-case',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.sentenceCase'),
          href: locale === 'en' ? '/tools/sentence-case' : '/ru/tools/sentence-case',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.alternatingCase'),
          href: locale === 'en' ? '/tools/alternating-case' : '/ru/tools/alternating-case',
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
          href: locale === 'en' ? '/tools/text-counter' : '/ru/tools/text-counter',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.sentenceCounter'),
          href: locale === 'en' ? '/tools/sentence-counter' : '/ru/tools/sentence-counter',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.wordFrequency'),
          href: locale === 'en' ? '/tools/word-frequency' : '/ru/tools/word-frequency',
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
          href: locale === 'en' ? '/tools/instagram-fonts' : '/ru/tools/instagram-fonts',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.facebookFont'),
          href: locale === 'en' ? '/tools/facebook-font' : '/ru/tools/facebook-font',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.discordFont'),
          href: locale === 'en' ? '/tools/discord-font' : '/ru/tools/discord-font',
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
          href: locale === 'en' ? '/tools/invisible-text' : '/ru/tools/invisible-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.repeatText'),
          href: locale === 'en' ? '/tools/repeat-text' : '/ru/tools/repeat-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.textReplace'),
          href: locale === 'en' ? '/tools/text-replace' : '/ru/tools/text-replace',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.removeLineBreaks'),
          href: locale === 'en' ? '/tools/remove-line-breaks' : '/ru/tools/remove-line-breaks',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.removeTextFormatting'),
          href: locale === 'en' ? '/tools/remove-text-formatting' : '/ru/tools/remove-text-formatting',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.duplicateLineRemover'),
          href: locale === 'en' ? '/tools/duplicate-line-remover' : '/ru/tools/duplicate-line-remover',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.boldText'),
          href: locale === 'en' ? '/tools/bold-text' : '/ru/tools/bold-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.italicText'),
          href: locale === 'en' ? '/tools/italic-text' : '/ru/tools/italic-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.subscriptText'),
          href: locale === 'en' ? '/tools/subscript-text' : '/ru/tools/subscript-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.bigText'),
          href: locale === 'en' ? '/tools/big-text' : '/ru/tools/big-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.bubbleText'),
          href: locale === 'en' ? '/tools/bubble-text' : '/ru/tools/bubble-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.cursedText'),
          href: locale === 'en' ? '/tools/cursed-text' : '/ru/tools/cursed-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.mirrorText'),
          href: locale === 'en' ? '/tools/mirror-text' : '/ru/tools/mirror-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.sortWords'),
          href: locale === 'en' ? '/tools/sort-words' : '/ru/tools/sort-words',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.plainText'),
          href: locale === 'en' ? '/tools/plain-text' : '/ru/tools/plain-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.extractEmailsFromText'),
          href: locale === 'en' ? '/tools/extract-emails-from-text' : '/ru/tools/extract-emails-from-text',
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
          href: locale === 'en' ? '/tools/random-number' : '/ru/tools/random-number',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.randomLetter'),
          href: locale === 'en' ? '/tools/random-letter' : '/ru/tools/random-letter',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.randomDate'),
          href: locale === 'en' ? '/tools/random-date' : '/ru/tools/random-date',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.randomMonth'),
          href: locale === 'en' ? '/tools/random-month' : '/ru/tools/random-month',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.randomIP'),
          href: locale === 'en' ? '/tools/random-ip' : '/ru/tools/random-ip',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.randomChoice'),
          href: locale === 'en' ? '/tools/random-choice' : '/ru/tools/random-choice',
          icon: <ChevronRight className="h-4 w-4" />
        }
        ,
        {
          title: t('navigation.passwordGenerator'),
          href: locale === 'en' ? '/tools/password-generator' : '/ru/tools/password-generator',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.uuidGenerator'),
          href: locale === 'en' ? '/tools/uuid-generator' : '/ru/tools/uuid-generator',
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
          href: locale === 'en' ? '/tools/base64-encoder-decoder' : '/ru/tools/base64-encoder-decoder',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.binaryCodeTranslator'),
          href: locale === 'en' ? '/tools/binary-code-translator' : '/ru/tools/binary-code-translator',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.hexToText'),
          href: locale === 'en' ? '/tools/hex-to-text' : '/ru/tools/hex-to-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.morseCode'),
          href: locale === 'en' ? '/tools/morse-code' : '/ru/tools/morse-code',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.caesarCipher'),
          href: locale === 'en' ? '/tools/caesar-cipher' : '/ru/tools/caesar-cipher',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.rot13'),
          href: locale === 'en' ? '/tools/rot13' : '/ru/tools/rot13',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.csvToJson'),
          href: locale === 'en' ? '/tools/csv-to-json' : '/ru/tools/csv-to-json',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.jsonStringify'),
          href: locale === 'en' ? '/tools/json-stringify' : '/ru/tools/json-stringify',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.urlConverter'),
          href: locale === 'en' ? '/tools/url-converter' : '/ru/tools/url-converter',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.utf8Converter'),
          href: locale === 'en' ? '/tools/utf8-converter' : '/ru/tools/utf8-converter',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.slugifyUrl'),
          href: locale === 'en' ? '/tools/slugify-url' : '/ru/tools/slugify-url',
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
          href: locale === 'en' ? '/tools/image-cropper' : '/ru/tools/image-cropper',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.imageResizer'),
          href: locale === 'en' ? '/tools/image-resizer' : '/ru/tools/image-resizer',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.imageToText'),
          href: locale === 'en' ? '/tools/image-to-text' : '/ru/tools/image-to-text',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.jpgToPng'),
          href: locale === 'en' ? '/tools/jpg-to-png' : '/ru/tools/jpg-to-png',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.jpgToWebp'),
          href: locale === 'en' ? '/tools/jpg-to-webp' : '/ru/tools/jpg-to-webp',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.pngToJpg'),
          href: locale === 'en' ? '/tools/png-to-jpg' : '/ru/tools/png-to-jpg',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.pngToWebp'),
          href: locale === 'en' ? '/tools/png-to-webp' : '/ru/tools/png-to-webp',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.webpToJpg'),
          href: locale === 'en' ? '/tools/webp-to-jpg' : '/ru/tools/webp-to-jpg',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.webpToPng'),
          href: locale === 'en' ? '/tools/webp-to-png' : '/ru/tools/webp-to-png',
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
          href: locale === 'en' ? '/tools/online-notepad' : '/ru/tools/online-notepad',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.numberSorter'),
          href: locale === 'en' ? '/tools/number-sorter' : '/ru/tools/number-sorter',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.asciiArtGenerator'),
          href: locale === 'en' ? '/tools/ascii-art-generator' : '/ru/tools/ascii-art-generator',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.natoPhonetic'),
          href: locale === 'en' ? '/tools/nato-phonetic' : '/ru/tools/nato-phonetic',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.md5Hash'),
          href: locale === 'en' ? '/tools/md5-hash' : '/ru/tools/md5-hash',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.phoneticSpelling'),
          href: locale === 'en' ? '/tools/phonetic-spelling' : '/ru/tools/phonetic-spelling',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.pigLatin'),
          href: locale === 'en' ? '/tools/pig-latin' : '/ru/tools/pig-latin',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.romanNumeralDate'),
          href: locale === 'en' ? '/tools/roman-numeral-date' : '/ru/tools/roman-numeral-date',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.utmBuilder'),
          href: locale === 'en' ? '/tools/utm-builder' : '/ru/tools/utm-builder',
          icon: <ChevronRight className="h-4 w-4" />
        },
        {
          title: t('navigation.extractEmailsFromPdf'),
          href: locale === 'en' ? '/tools/extract-emails-from-pdf' : '/ru/tools/extract-emails-from-pdf',
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
