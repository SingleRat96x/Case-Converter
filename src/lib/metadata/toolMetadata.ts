import type { SupportedLocale, ToolMetadataConfig, LocalizedMetadataFields, ValidationIssue } from './types';
import { META_LIMITS } from './types';

// Helper function to generate advanced schema for tools
function createAdvancedSchema(toolSlug: string, features: string[], objectType: string, resultType: string, rating: number, reviewCount: number) {
  return {
    type: 'WebApplication' as const,
    applicationCategory: 'UtilityApplication',
    features,
    operatingSystem: 'Web Browser',
    browserRequirements: 'Any modern browser',
    softwareVersion: '2.0',
    datePublished: '2024-01-01',
    dateModified: '2025-02-10',
    aggregateRating: {
      ratingValue: rating.toString(),
      reviewCount: reviewCount.toString()
    },
    potentialAction: {
      target: `/tools/${toolSlug}`,
      object: objectType,
      result: resultType
    },
    offers: {
      price: '0',
      priceCurrency: 'USD'
    },
    softwareRequirements: 'Web Browser',
    memoryRequirements: '50MB',
    processorRequirements: 'Any'
  };
}

// Helper function to generate advanced schema for category pages
function createCategorySchema(categorySlug: string, toolCount: number, categoryName: string) {
  return {
    type: 'CollectionPage' as const,
    applicationCategory: 'UtilityApplication',
    name: categoryName,
    numberOfItems: toolCount,
    datePublished: '2024-01-01',
    dateModified: '2025-02-10',
    url: `/category/${categorySlug}`,
    mainEntity: {
      type: 'ItemList',
      numberOfItems: toolCount,
      name: `${categoryName} Tools`
    }
  };
}

// Helper function to generate advanced schema for static pages
function createStaticPageSchema(pageSlug: string, pageName: string) {
  return {
    type: 'WebPage' as const,
    applicationCategory: 'UtilityApplication',
    name: pageName,
    datePublished: '2024-01-01',
    dateModified: '2025-02-10',
    url: `/${pageSlug}`,
    mainEntity: {
      type: 'WebPage',
      name: pageName
    }
  };
}

// In-memory registry populated at import time
const registry = new Map<string, ToolMetadataConfig>();

// Utility: clamp and validate text length
function validateFieldLength(slug: string, locale: SupportedLocale, field: keyof LocalizedMetadataFields, value: string): ValidationIssue | null {
  const limits =
    field === 'title' ? META_LIMITS.title :
    field === 'description' ? META_LIMITS.description :
    field === 'shortDescription' ? META_LIMITS.shortDescription :
    null;
  if (!limits || typeof value !== 'string') return null;
  const length = value.trim().length;
  if (length < limits.min || length > limits.max) {
    return { slug, locale, field, message: `${field} length ${length} out of range [${limits.min}, ${limits.max}]` };
  }
  return null;
}

// Minimal, data-driven overrides for high-impact pages based on console data
const overrides: Array<ToolMetadataConfig> = [
  {
    slug: 'random-number',
    pathname: '/tools/random-number',
    type: 'tool',
    category: 'random-generator',
    i18n: {
      en: {
        title: 'Free Random Number Generator — Secure RNG for Tests & Games',
        description: 'Generate secure random numbers in a custom range. Great for games, testing, analysis, and sampling. Bulk output, no limits.',
        shortDescription: 'Generate secure random numbers in any range. Bulk, no limits.',
      },
      ru: {
        title: 'Генератор Случайных Чисел — Безопасный RNG для Тестов и Игр',
        description: 'Генерируйте безопасные случайные числа в заданном диапазоне. Подходит для игр, тестирования, анализа и выборок. Массовая генерация без ограничений.',
        shortDescription: 'Безопасные случайные числа в любом диапазоне. Массово, без лимитов.',
      },
    },
    schema: createAdvancedSchema('random-number', ['Custom ranges', 'Bulk generation', 'No limits'], 'Number Input', 'Random Numbers', 4.8, 1250),
    relatedTools: ['random-letter', 'random-date', 'random-choice'],
  },
  // Remaining tools (image + security/dev + text styles)
  {
    slug: 'image-cropper',
    pathname: '/tools/image-cropper',
    type: 'tool',
    category: 'image-tool',
    i18n: {
      en: {
        title: 'Image Cropper — Crop Pictures to Exact Size',
        description: 'Crop images to exact dimensions or aspect ratios. Drag to select, preview, and download. All in your browser, no uploads stored.',
        shortDescription: 'Crop images to size or aspect ratio.',
      },
      ru: {
        title: 'Обрезка Изображений — Точный Размер и Пропорции',
        description: 'Обрезайте изображения до точных размеров или пропорций. Перетаскивание, предпросмотр и скачивание. В браузере, без хранения.',
        shortDescription: 'Обрезка по размеру/пропорциям.',
      }
    },
    schema: createAdvancedSchema('image-cropper', ['Fixed size', 'Aspect ratios'], 'Image Input', 'Cropped Image', 4.7, 892),
    relatedTools: ['image-resizer','jpg-to-png','png-to-webp']
  },
  {
    slug: 'image-resizer',
    pathname: '/tools/image-resizer',
    type: 'tool',
    category: 'image-tool',
    i18n: {
      en: {
        title: 'Image Resizer — Resize Photos by Width/Height',
        description: 'Resize images by width/height or percentage. Preserve aspect ratio and quality. Fast, privacy‑friendly, in your browser.',
        shortDescription: 'Resize images by size or percent.',
      },
      ru: {
        title: 'Изменение Размеров Изображений — По Ширине/Высоте',
        description: 'Меняйте размер изображений по ширине/высоте или процентам. Сохранение пропорций и качества. Быстро и приватно.',
        shortDescription: 'Изменение размеров по размеру/процентам.',
      }
    },
    schema: createAdvancedSchema('image-resizer', ['Keep aspect', 'Quality'], 'Image Input', 'Resized Image', 4.6, 743),
    relatedTools: ['image-cropper','png-to-webp','jpg-to-webp']
  },
  {
    slug: 'image-to-text',
    pathname: '/tools/image-to-text',
    type: 'tool',
    category: 'image-tool',
    i18n: {
      en: {
        title: 'Image to Text (OCR) — Extract Text from Pictures',
        description: 'Turn images into searchable text using OCR. Paste or upload, then copy results. Great for receipts, scans, and screenshots.',
        shortDescription: 'Extract text from images (OCR).',
      },
      ru: {
        title: 'Изображение в Текст (OCR) — Распознавание Текста',
        description: 'Преобразуйте изображения в текст с помощью OCR. Вставляйте или загружайте и копируйте результат. Для чеков, сканов и скриншотов.',
        shortDescription: 'Распознавание текста в изображениях.',
      }
    },
    schema: createAdvancedSchema('image-to-text', ['OCR', 'Copy results'], 'Image Input', 'Extracted Text', 4.5, 634),
    relatedTools: ['plain-text','remove-text-formatting','json-stringify']
  },
  {
    slug: 'jpg-to-png',
    pathname: '/tools/jpg-to-png',
    type: 'tool',
    category: 'image-tool',
    i18n: {
      en: {
        title: 'JPG to PNG — Convert Photos to Transparent PNG',
        description: 'Convert JPG images to PNG with optional transparency. Drag‑and‑drop multiple files and download quickly. Free and private.',
        shortDescription: 'Convert JPG images to PNG.',
      },
      ru: {
        title: 'JPG → PNG — Конвертация Фото в PNG с Прозрачностью',
        description: 'Конвертируйте JPG в PNG с поддержкой прозрачности. Перетаскивайте несколько файлов и скачивайте быстро. Приватно.',
        shortDescription: 'JPG → PNG конвертация.',
      }
    },
    schema: createAdvancedSchema('jpg-to-png', ['Batch convert', 'Transparency'], 'Image Input', 'PNG Image', 4.4, 567),
    relatedTools: ['png-to-jpg','png-to-webp','webp-to-png']
  },
  {
    slug: 'jpg-to-webp',
    pathname: '/tools/jpg-to-webp',
    type: 'tool',
    category: 'image-tool',
    i18n: {
      en: {
        title: 'JPG to WebP — Smaller Images with Great Quality',
        description: 'Convert JPG images to WebP to reduce size while keeping quality. Fast, in‑browser conversion. Drag multiple files, download fast.',
        shortDescription: 'Convert JPG to WebP efficiently.',
      },
      ru: {
        title: 'JPG → WebP — Меньший Размер с Отличным Качеством',
        description: 'Конвертируйте JPG в WebP для меньшего размера при хорошем качестве. Быстрая конверсия в браузере. Пакетная обработка.',
        shortDescription: 'JPG → WebP быстро.',
      }
    },
    schema: createAdvancedSchema('jpg-to-webp', ['Batch', 'Quality'], 'Image Input', 'WebP Image', 4.3, 498),
    relatedTools: ['png-to-webp','webp-to-jpg','jpg-to-png']
  },
  {
    slug: 'png-to-jpg',
    pathname: '/tools/png-to-jpg',
    type: 'tool',
    category: 'image-tool',
    i18n: {
      en: {
        title: 'PNG to JPG — Convert Transparent PNGs to JPG',
        description: 'Convert PNG files to JPG for better compatibility. Adjust quality, batch convert in the browser, and download in seconds.',
        shortDescription: 'Convert PNG images to JPG.',
      },
      ru: {
        title: 'PNG → JPG — Конвертация Прозрачных PNG в JPG',
        description: 'Конвертируйте PNG в JPG для совместимости. Настройка качества, пакетная обработка в браузере, быстрое скачивание.',
        shortDescription: 'PNG → JPG конвертация.',
      }
    },
    schema: createAdvancedSchema('png-to-jpg', ['Quality control', 'Batch'], 'Image Input', 'JPG Image', 4.2, 432),
    relatedTools: ['jpg-to-png','png-to-webp','webp-to-jpg']
  },
  {
    slug: 'webp-to-jpg',
    pathname: '/tools/webp-to-jpg',
    type: 'tool',
    category: 'image-tool',
    i18n: {
      en: {
        title: 'WebP to JPG — Convert WebP Images for Compatibility',
        description: 'Convert WebP images back to JPG for apps that don\'t support WebP. Drag‑and‑drop and download quickly. Free and private.',
        shortDescription: 'Convert WebP images to JPG.',
      },
      ru: {
        title: 'WebP → JPG — Совместимый Формат',
        description: 'Конвертируйте WebP обратно в JPG для приложений без поддержки WebP. Перетаскивание и быстрое скачивание. Приватно.',
        shortDescription: 'WebP → JPG конвертация.',
      }
    },
    schema: createAdvancedSchema('webp-to-jpg', ['Compatibility', 'Batch'], 'Image Input', 'JPG Image', 4.1, 389),
    relatedTools: ['webp-to-png','png-to-jpg','jpg-to-webp']
  },
  {
    slug: 'webp-to-png',
    pathname: '/tools/webp-to-png',
    type: 'tool',
    category: 'image-tool',
    i18n: {
      en: {
        title: 'WebP to PNG — Keep Transparency when Converting',
        description: 'Convert WebP to PNG while preserving transparency. Works in your browser, supports multiple files, and quick downloads.',
        shortDescription: 'Convert WebP images to PNG.',
      },
      ru: {
        title: 'WebP → PNG — Сохранение Прозрачности',
        description: 'Конвертируйте WebP в PNG с сохранением прозрачности. В браузере, пакетно и быстрое скачивание.',
        shortDescription: 'WebP → PNG конвертация.',
      }
    },
    schema: createAdvancedSchema('webp-to-png', ['Transparency', 'Batch'], 'Image Input', 'PNG Image', 4.0, 356),
    relatedTools: ['png-to-webp','webp-to-jpg','jpg-to-png']
  },
  {
    slug: 'base64-encoder-decoder',
    pathname: '/tools/base64-encoder-decoder',
    type: 'tool',
    category: 'code-data-tools',
    i18n: {
      en: {
        title: 'Base64 Encoder/Decoder — Convert Text & Files',
        description: 'Encode/Decode Base64 for text and files safely. Copy, download, and validate. Useful for data URIs, tests, and debugging.',
        shortDescription: 'Encode/decode Base64 (text/files).',
      },
      ru: {
        title: 'Base64 Кодер/Декодер — Текст и Файлы',
        description: 'Кодируйте/декодируйте Base64 для текста и файлов. Копируйте, загружайте и проверяйте. Полезно для data URI и отладки.',
        shortDescription: 'Base64 для текста/файлов.',
      }
    },
    schema: createAdvancedSchema('base64-encoder-decoder', ['Text/file', 'Copy/download'], 'Data Input', 'Base64 Encoded/Decoded', 4.6, 678),
    relatedTools: ['md5-hash','json-stringify','csv-to-json']
  },
  {
    slug: 'uuid-generator',
    pathname: '/tools/uuid-generator',
    type: 'tool',
    category: 'random-generator',
    i18n: {
      en: {
        title: 'UUID Generator — Create UUID v1/v4 Identifiers',
        description: 'Generate UUIDs v1 (time-based) and v4 (random) safely. Copy, download, and bulk‑generate for apps, tests, and databases.',
        shortDescription: 'Generate UUID v1/v4 identifiers.',
      },
      ru: {
        title: 'Генератор UUID — Идентификаторы v1/v4',
        description: 'Генерируйте UUID v1 (по времени) и v4 (случайные). Копирование, скачивание и массовая генерация для приложений и БД.',
        shortDescription: 'UUID v1/v4 генерация.',
      }
    },
    schema: createAdvancedSchema('uuid-generator', ['v1/v4', 'Bulk'], 'Number Input', 'UUID Identifiers', 4.7, 789),
    relatedTools: ['password-generator','md5-hash','random-number']
  },
  {
    slug: 'utm-builder',
    pathname: '/tools/utm-builder',
    type: 'tool',
    category: 'miscellaneous-utility',
    i18n: {
      en: {
        title: 'UTM Builder — Tag Campaign URLs Correctly',
        description: 'Build campaign URLs with UTM parameters reliably. Validate and copy links for analytics. Prevent typos and inconsistent tagging.',
        shortDescription: 'Create and validate UTM links.',
      },
      ru: {
        title: 'UTM Конструктор — Корректная Разметка Ссылок',
        description: 'Создавайте ссылки с UTM‑метками надёжно. Проверяйте и копируйте для аналитики. Избегайте опечаток и несогласованности.',
        shortDescription: 'Создание и проверка UTM‑ссылок.',
      }
    },
    schema: createAdvancedSchema('utm-builder', ['UTM validation', 'Copy links'], 'URL Input', 'UTM Tagged URLs', 4.5, 567),
    relatedTools: ['url-converter','slugify-url','json-stringify']
  },
  {
    slug: 'random-choice',
    pathname: '/tools/random-choice',
    type: 'tool',
    category: 'random-generator',
    i18n: {
      en: {
        title: 'Random Choice Picker — Fair Decision Maker',
        description: 'Pick a random choice from a list fairly. Avoid duplicates, choose counts, and export results. Great for raffles and decisions.',
        shortDescription: 'Pick random choices fairly.',
      },
      ru: {
        title: 'Случайный Выбор — Честный Выбор Варианта',
        description: 'Выбирайте случайные варианты из списка честно. Исключайте повторы, задавайте количество и экспортируйте результат.',
        shortDescription: 'Случайный выбор из списка.',
      }
    },
    schema: createAdvancedSchema('random-choice', ['No duplicates', 'Export'], 'List Input', 'Random Choice', 4.4, 456),
    relatedTools: ['random-number','random-letter','random-date']
  },
  {
    slug: 'random-letter',
    pathname: '/tools/random-letter',
    type: 'tool',
    category: 'random-generator',
    i18n: {
      en: {
        title: 'Random Letter Generator — Uppercase/Lowercase, Bulk',
        description: 'Generate random letters in uppercase, lowercase, or mixed. Control counts and avoid repeats. Copy lists instantly.',
        shortDescription: 'Generate random letters (A–Z).',
      },
      ru: {
        title: 'Генератор Случайных Букв — Верхний/Нижний Регистр',
        description: 'Генерируйте случайные буквы: верхний, нижний или смешанный регистр. Контроль количества и исключение повторов.',
        shortDescription: 'Случайные буквы (А–Я).',
      }
    },
    schema: createAdvancedSchema('random-letter', ['Upper/lower', 'No repeats'], 'Number Input', 'Random Letters', 4.3, 389),
    relatedTools: ['random-number','random-choice','password-generator']
  },
  {
    slug: 'pig-latin',
    pathname: '/tools/pig-latin',
    type: 'tool',
    category: 'miscellaneous-tool',
    i18n: {
      en: {
        title: 'Pig Latin Translator — English ↔ Pig Latin',
        description: 'Translate English to Pig Latin and back for fun or learning. Paste text and copy results instantly. Free and unlimited.',
        shortDescription: 'Translate English ↔ Pig Latin.',
      },
      ru: {
        title: 'Переводчик Pig Latin — Английский ↔ Поросячий Латынь',
        description: 'Переводите английский в Pig Latin и обратно для развлечения и обучения. Вставляйте текст и копируйте результат.',
        shortDescription: 'Английский ↔ Pig Latin.',
      }
    },
    schema: createAdvancedSchema('pig-latin', ['Two-way translation'], 'Text Input', 'Pig Latin Text', 4.2, 321),
    relatedTools: ['nato-phonetic','phonetic-spelling','url-converter']
  },
  {
    slug: 'phonetic-spelling',
    pathname: '/tools/phonetic-spelling',
    type: 'tool',
    category: 'miscellaneous-tool',
    i18n: {
      en: {
        title: 'Phonetic Spelling — Spell Names Clearly',
        description: 'Generate phonetic spellings for names and words to ensure clear pronunciation. Useful for calls, meetings, and transcripts.',
        shortDescription: 'Generate phonetic spellings.',
      },
      ru: {
        title: 'Фонетическое Написание — Чёткое Произношение',
        description: 'Создавайте фонетические написания имен и слов для чёткого произношения. Полезно для звонков, встреч и транскрипций.',
        shortDescription: 'Фонетические написания.',
      }
    },
    schema: createAdvancedSchema('phonetic-spelling', ['Names/words', 'Pronunciation'], 'Text Input', 'Phonetic Spelling', 4.1, 298),
    relatedTools: ['nato-phonetic','slugify-url','title-case']
  },
  {
    slug: 'hex-to-text',
    pathname: '/tools/hex-to-text',
    type: 'tool',
    category: 'code-data-tools',
    i18n: {
      en: {
        title: 'Hex to Text — Convert Hex Strings to Readable Text',
        description: 'Convert hexadecimal strings to human‑readable text and back. Great for debugging, encodings, and data conversions.',
        shortDescription: 'Convert hex ↔ text.',
      },
      ru: {
        title: 'Hex ↔ Текст — Конвертация Шестнадцатеричных Строк',
        description: 'Преобразуйте шестнадцатеричные строки в читаемый текст и обратно. Полезно для отладки и конвертаций данных.',
        shortDescription: 'Hex ↔ текст.',
      }
    },
    schema: createAdvancedSchema('hex-to-text', ['Two-way', 'Debugging'], 'Hex Input', 'Text Output', 4.0, 267),
    relatedTools: ['binary-code-translator','utf8-converter','base64-encoder-decoder']
  },
  {
    slug: 'morse-code',
    pathname: '/tools/morse-code',
    type: 'tool',
    category: 'code-data-tools',
    i18n: {
      en: {
        title: 'Morse Code Translator — Text ↔ Morse (with Audio)',
        description: 'Translate text to Morse code and back. Optional audio playback for learning and practice. Copy and share results instantly.',
        shortDescription: 'Translate text ↔ Morse code.',
      },
      ru: {
        title: 'Азбука Морзе — Перевод Текста в Морзе (С Аудио)',
        description: 'Переводите текст в азбуку Морзе и обратно. Опциональное аудио для обучения и практики. Мгновенное копирование.',
        shortDescription: 'Текст ↔ код Морзе.',
      }
    },
    schema: createAdvancedSchema('morse-code', ['Audio', 'Two-way translation'], 'Text Input', 'Morse Code', 3.9, 234),
    relatedTools: ['rot13','caesar-cipher','json-stringify']
  },
  {
    slug: 'caesar-cipher',
    pathname: '/tools/caesar-cipher',
    type: 'tool',
    category: 'code-data-tools',
    i18n: {
      en: {
        title: 'Caesar Cipher — Encode/Decode with Shift',
        description: 'Encode or decode text with a Caesar cipher. Control shift amount, copy results, and learn about simple substitution ciphers.',
        shortDescription: 'Encode/decode using Caesar shift.',
      },
      ru: {
        title: 'Шифр Цезаря — Кодирование/Декодирование Со Сдвигом',
        description: 'Кодируйте или декодируйте текст шифром Цезаря. Управляйте величиной сдвига, копируйте результаты и изучайте шифры.',
        shortDescription: 'Шифр Цезаря для текста.',
      }
    },
    schema: createAdvancedSchema('caesar-cipher', ['Shift control', 'Instant copy'], 'Text Input', 'Encrypted Text', 3.8, 201),
    relatedTools: ['rot13','morse-code','binary-code-translator']
  },
  {
    slug: 'password-generator',
    pathname: '/tools/password-generator',
    type: 'tool',
    category: 'security-tool',
    i18n: {
      en: {
        title: 'Secure Password Generator — Strong Random Passwords Online',
        description: 'Create strong, unique passwords with customizable rules. Secure by default. Copy or download results. Free, unlimited.',
        shortDescription: 'Strong random passwords with custom rules. Free and unlimited.',
      },
      ru: {
        title: 'Генератор Паролей — Надёжные Случайные Пароли Онлайн',
        description: 'Создавайте надёжные уникальные пароли с настраиваемыми правилами. Безопасно по умолчанию. Копируйте или скачивайте. Бесплатно, без лимитов.',
        shortDescription: 'Надёжные пароли с правилами. Бесплатно и без ограничений.',
      },
    },
    schema: createAdvancedSchema('password-generator', ['Custom length', 'Character sets', 'Strength meter'], 'Settings Input', 'Secure Password', 4.8, 1234),
    relatedTools: ['uuid-generator', 'random-letter'],
  },
  {
    slug: 'random-ip',
    pathname: '/tools/random-ip',
    type: 'tool',
    category: 'random-generator',
    i18n: {
      en: {
        title: 'Random IP Address Generator — IPv4 & IPv6 for Testing',
        description: 'Generate random IPv4/IPv6 addresses for development and testing. CIDR ranges, private/public, bulk output.',
        shortDescription: 'Random IPv4/IPv6 addresses with CIDR and bulk options.',
      },
      ru: {
        title: 'Генератор Случайных IP — IPv4 и IPv6 для Тестирования',
        description: 'Генерируйте случайные IPv4/IPv6 адреса для разработки и тестов. CIDR диапазоны, приватные/публичные, массовый вывод.',
        shortDescription: 'Случайные IPv4/IPv6 с CIDR и массовой генерацией.',
      },
    },
    schema: createAdvancedSchema('random-ip', ['IPv4', 'IPv6', 'CIDR ranges', 'Bulk'], 'Settings Input', 'Random IP Addresses', 4.6, 567),
    relatedTools: ['random-number', 'uuid-generator'],
  },
  {
    slug: 'ascii-art-generator',
    pathname: '/tools/ascii-art-generator',
    type: 'tool',
    category: 'text-modification',
    i18n: {
      en: {
        title: 'ASCII Art Generator — Stylish Text Banners (Free)',
        description: 'Create ASCII text banners in many fonts. Copy or download instantly. Great for terminals, READMEs, and fun!',
        shortDescription: 'Create ASCII text banners in many fonts. Free.',
      },
      ru: {
        title: 'Генератор ASCII Арта — Стильные Текстовые Баннеры',
        description: 'Создавайте ASCII-баннеры во множестве шрифтов. Копируйте или скачивайте. Отлично для терминалов, README и развлечения!',
        shortDescription: 'ASCII-баннеры в разных шрифтах. Бесплатно.',
      },
    },
    schema: createAdvancedSchema('ascii-art-generator', ['Many fonts', 'Copy/Download', 'Instant output'], 'Text Input', 'ASCII Art', 4.4, 456),
  },
  {
    slug: 'random-generators',
    pathname: '/category/random-generators',
    type: 'category',
    i18n: {
      en: {
        title: 'Random Generators — Numbers, Letters, Dates & More',
        description: 'Generate random numbers, letters, dates, IPs and more. Custom ranges, bulk options, copy/export. Fast, free, no limits.',
        shortDescription: 'Random numbers, letters, dates, IPs. Free and fast.',
      },
      ru: {
        title: 'Генераторы Случайных Данных — Числа, Буквы, Даты и Другое',
        description: 'Генерируйте случайные числа, буквы, даты, IP и другое. Пользовательские диапазоны, массовая генерация, копирование/экспорт. Быстро и бесплатно.',
        shortDescription: 'Случайные числа, буквы, даты, IP. Бесплатно.',
      }
    },
    schema: createCategorySchema('random-generators', 8, 'Random Generators')
  },
  {
    slug: 'text-modification-formatting',
    pathname: '/category/text-modification-formatting',
    type: 'category',
    i18n: {
      en: {
        title: 'Text Modification & Formatting — Bold, Italic, Clean, Replace',
        description: 'Format and transform text: bold, italic, bubble, mirror, replace, remove formatting, sort, dedupe and more. Free and unlimited.',
        shortDescription: 'Format and transform text. Free and unlimited.',
      },
      ru: {
        title: 'Изменение и Форматирование Текста — Жирный, Курсив, Очистка',
        description: 'Форматируйте и преобразуйте текст: жирный, курсив, пузырьки, отражение, замена, удаление форматирования, сортировка, удаление дублей и другое.',
        shortDescription: 'Форматируйте и преобразуйте текст.',
      }
    },
    schema: createCategorySchema('text-modification-formatting', 15, 'Text Modification & Formatting')
  },
  {
    slug: 'code-data-translation',
    pathname: '/category/code-data-translation',
    type: 'category',
    i18n: {
      en: {
        title: 'Code & Data Translation — Base64, JSON, CSV, URL',
        description: 'Convert and encode data: Base64, JSON stringify, CSV⇄JSON, URL encode/decode, hex, binary, ROT13, ciphers. Safe and fast.',
        shortDescription: 'Convert Base64, JSON, CSV, URL, hex, binary.',
      },
      ru: {
        title: 'Код и Данные — Base64, JSON, CSV, URL',
        description: 'Конвертируйте и кодируйте данные: Base64, JSON stringify, CSV⇄JSON, URL кодирование/декодирование, hex, бинарный, ROT13 и шифры.',
        shortDescription: 'Base64, JSON, CSV, URL, hex, бинарный.',
      }
    },
    schema: createCategorySchema('code-data-translation', 12, 'Code & Data Translation')
  },
  {
    slug: 'image-tools',
    pathname: '/category/image-tools',
    type: 'category',
    i18n: {
      en: {
        title: 'Image Tools — Resize, Crop, JPG/PNG/WebP Convert',
        description: 'Resize and crop images. Convert JPG, PNG, and WebP both ways. Quick, browser‑based, no uploads stored. Free and unlimited.',
        shortDescription: 'Resize, crop, convert JPG/PNG/WebP.',
      },
      ru: {
        title: 'Инструменты Изображений — Изменение, Обрезка, JPG/PNG/WebP',
        description: 'Изменяйте размер и обрезайте изображения. Конвертируйте JPG, PNG и WebP в обе стороны. Быстро, в браузере, без хранения файлов.',
        shortDescription: 'Размер, обрезка, конвертер JPG/PNG/WebP.',
      }
    },
    schema: createCategorySchema('image-tools', 8, 'Image Tools')
  },
  {
    slug: 'analysis-counter-tools',
    pathname: '/category/analysis-counter-tools',
    type: 'category',
    i18n: {
      en: {
        title: 'Text Analysis & Counters — Sentences, Words, Characters',
        description: 'Analyze text fast: count sentences, words, characters, lines and frequency metrics. Accurate stats for writers and students.',
        shortDescription: 'Sentence, word, char counters and stats.',
      },
      ru: {
        title: 'Анализ Текста и Счётчики — Предложения, Слова, Символы',
        description: 'Быстрый анализ текста: счётчик предложений, слов, символов, строк и частоты. Точные метрики для авторов и студентов.',
        shortDescription: 'Счётчики и метрики текста.',
      }
    },
    schema: createCategorySchema('analysis-counter-tools', 4, 'Text Analysis & Counters')
  },
  {
    slug: 'social-media-text-generators',
    pathname: '/category/social-media-text-generators',
    type: 'category',
    i18n: {
      en: {
        title: 'Social Media Fonts — Instagram, Facebook, Discord',
        description: 'Stylish text generators for Instagram, Facebook, and Discord. Create unique fonts and symbols for bios, posts, and chats. Copy & paste.',
        shortDescription: 'Stylish text for Instagram, Facebook, Discord.',
      },
      ru: {
        title: 'Шрифты для Соцсетей — Instagram, Facebook, Discord',
        description: 'Генераторы стильного текста для Instagram, Facebook и Discord. Уникальные шрифты и символы для био, постов и чатов. Копируйте и вставляйте.',
        shortDescription: 'Стильный текст для соцсетей.',
      }
    },
    schema: createCategorySchema('social-media-text-generators', 4, 'Social Media Text Generators')
  },
  {
    slug: 'misc-tools',
    pathname: '/category/misc-tools',
    type: 'category',
    i18n: {
      en: {
        title: 'Misc Tools — Notepad, Sorters, Utilities',
        description: 'Handy utilities: online notepad, sorters, organizers and more. Simple browser tools that are fast, free, and reliable.',
        shortDescription: 'Notepad, sorters, and utilities.',
      },
      ru: {
        title: 'Прочие Инструменты — Блокнот, Сортировки, Утилиты',
        description: 'Полезные утилиты: онлайн блокнот, сортировки, организаторы и другое. Простые браузерные инструменты — быстро и бесплатно.',
        shortDescription: 'Блокнот, сортировки и утилиты.',
      }
    },
    schema: createCategorySchema('misc-tools', 5, 'Miscellaneous Tools')
  },
  // High-impact tools (batch 1)
  {
    slug: 'sentence-counter',
    pathname: '/tools/sentence-counter',
    type: 'tool',
    category: 'text-analysis',
    i18n: {
      en: {
        title: 'Sentence Counter — Count Sentences, Fast & Accurate',
        description: 'Instantly count sentences in your text with high accuracy. Includes word/character stats and reading time. Free and unlimited.',
        shortDescription: 'Count sentences with accurate text stats.',
      },
      ru: {
        title: 'Счётчик Предложений — Быстро и Точно',
        description: 'Мгновенно считайте предложения в тексте с высокой точностью. Счётчики слов/символов и время чтения. Бесплатно и без ограничений.',
        shortDescription: 'Счётчик предложений и метрики текста.',
      }
    },
    schema: createAdvancedSchema('sentence-counter', ['Sentence counting', 'Reading time', 'Text stats'], 'Text Input', 'Text Statistics', 4.5, 567),
    relatedTools: ['text-counter','word-frequency','plain-text']
  },
  {
    slug: 'random-date',
    pathname: '/tools/random-date',
    type: 'tool',
    category: 'random-generator',
    i18n: {
      en: {
        title: 'Random Date Generator — Pick Dates in Any Range',
        description: 'Generate random dates within custom ranges. Choose formats, exclude weekends, and bulk-generate lists. Perfect for testing and sampling.',
        shortDescription: 'Generate random dates in any range and format.',
      },
      ru: {
        title: 'Генератор Случайных Дат — Любые Диапазоны',
        description: 'Генерируйте случайные даты в заданных диапазонах. Выбирайте форматы, исключайте выходные, создавайте списки. Идеально для тестов и выборок.',
        shortDescription: 'Случайные даты в любом диапазоне и формате.',
      }
    },
    schema: createAdvancedSchema('random-date', ['Custom ranges', 'Date formats', 'Bulk output'], 'Date Input', 'Random Dates', 4.4, 456),
    relatedTools: ['random-month','random-number','random-choice']
  },
  {
    slug: 'nato-phonetic',
    pathname: '/tools/nato-phonetic',
    type: 'tool',
    category: 'code-data-tools',
    i18n: {
      en: {
        title: 'NATO Phonetic Alphabet Translator — Spell by Code Words',
        description: 'Convert text to the NATO phonetic alphabet and back. Great for clear spelling over phone/radio. Copy results instantly. Free tool.',
        shortDescription: 'Translate text ↔ NATO phonetic words.',
      },
      ru: {
        title: 'Переводчик НАТО-Фонетического Алфавита — Слова‑коды',
        description: 'Преобразуйте текст в фонетический алфавит НАТО и обратно. Удобно для чёткого произношения по телефону/рации. Мгновальное копирование.',
        shortDescription: 'Текст ↔ фонетический алфавит НАТО.',
      }
    },
    schema: createAdvancedSchema('nato-phonetic', ['Text to code words', 'Reverse translation'], 'Text Input', 'NATO Phonetic', 4.3, 389),
    relatedTools: ['phonetic-spelling','url-converter','slugify-url']
  },
  {
    slug: 'online-notepad',
    pathname: '/tools/online-notepad',
    type: 'tool',
    category: 'miscellaneous-utility',
    i18n: {
      en: {
        title: 'Online Notepad — Simple, Secure, Free',
        description: 'Write and save notes in your browser. Autosave, dark mode, and privacy‑friendly. Perfect for quick drafts and copy/paste tasks.',
        shortDescription: 'Fast browser notepad with autosave.',
      },
      ru: {
        title: 'Онлайн Блокнот — Просто, Надёжно, Бесплатно',
        description: 'Пишите и сохраняйте заметки в браузере. Автосохранение, тёмная тема и приватность. Идеально для быстрых черновиков и копирования.',
        shortDescription: 'Быстрый блокнот с автосохранением.',
      }
    },
    schema: createAdvancedSchema('online-notepad', ['Autosave', 'Dark mode'], 'Text Input', 'Saved Notes', 4.6, 678),
    relatedTools: ['plain-text','remove-text-formatting','text-replace']
  },
  {
    slug: 'bold-text',
    pathname: '/tools/bold-text',
    type: 'tool',
    category: 'text-modification',
    i18n: {
      en: {
        title: 'Bold Text Generator — Copy & Paste Stylish Bold',
        description: 'Make bold Unicode text that works on social, chats, and bios. Type, preview, and copy instantly. Free with no limits.',
        shortDescription: 'Create bold Unicode text for social and chat.',
      },
      ru: {
        title: 'Генератор Жирного Текста — Копируйте Стильный Bold',
        description: 'Создавайте жирный Unicode‑текст для соцсетей, чатов и био. Пишите, просматривайте и копируйте мгновенно. Бесплатно без лимитов.',
        shortDescription: 'Жирный Unicode‑текст для соцсетей.',
      }
    },
    schema: createAdvancedSchema('bold-text', ['Unicode bold', 'Instant copy'], 'Text Input', 'Bold Text', 4.7, 789),
    relatedTools: ['italic-text','big-text','bubble-text']
  },
  {
    slug: 'roman-numeral-date',
    pathname: '/tools/roman-numeral-date',
    type: 'tool',
    category: 'code-data-tools',
    i18n: {
      en: {
        title: 'Roman Numeral Date Converter — Today\'s Date to Roman',
        description: 'Convert any date to Roman numerals (and back). Great for wedding dates, plaques, and projects. Multiple formats supported.',
        shortDescription: 'Convert dates ↔ Roman numerals.',
      },
      ru: {
        title: 'Конвертер Даты в Римские Цифры — Сегодняшняя Дата',
        description: 'Преобразуйте любую дату в римские цифры и обратно. Подходит для свадебных дат, табличек и проектов. Несколько форматов.',
        shortDescription: 'Даты ↔ римские цифры.',
      }
    },
    schema: createAdvancedSchema('roman-numeral-date', ['Both directions', 'Multiple formats'], 'Date Input', 'Roman Numerals', 4.2, 321),
    relatedTools: ['random-date','random-month','title-case']
  },
  {
    slug: 'facebook-font',
    pathname: '/tools/facebook-font',
    type: 'tool',
    category: 'social-media',
    i18n: {
      en: {
        title: 'Facebook Font Generator — Stylish Text for Posts & Bios',
        description: 'Generate stylish Facebook fonts for posts, bios, and comments. Copy & paste instantly. Free, fast, no limits.',
        shortDescription: 'Stylish FB fonts for posts & bios.',
      },
      ru: {
        title: 'Генератор Шрифтов Facebook — Стиль для Постов и Био',
        description: 'Создавайте стильные шрифты для постов, био и комментариев в Facebook. Копируйте и вставляйте мгновенно. Бесплатно.',
        shortDescription: 'Стильные FB‑шрифты для постов и био.',
      }
    },
    schema: createAdvancedSchema('facebook-font', ['Stylish text', 'Copy & paste'], 'Text Input', 'Facebook Font', 4.5, 567),
    relatedTools: ['instagram-fonts','discord-font','bold-text']
  },
  {
    slug: 'discord-font',
    pathname: '/tools/discord-font',
    type: 'tool',
    category: 'social-media',
    i18n: {
      en: {
        title: 'Discord Font Generator — Fancy Chat Fonts & Nickname Styles',
        description: 'Create fancy Discord fonts for chats and nicknames. Copy & paste instantly. Works for channels, bios, and servers.',
        shortDescription: 'Fancy Discord fonts for chats & names.',
      },
      ru: {
        title: 'Генератор Шрифтов Discord — Красивые Шрифты и Ники',
        description: 'Создавайте красивые шрифты для чатов и ников в Discord. Копируйте и вставляйте мгновенно. Подходит для каналов и био.',
        shortDescription: 'Красивые шрифты для Discord.',
      }
    },
    schema: createAdvancedSchema('discord-font', ['Stylish fonts', 'Copy & paste'], 'Text Input', 'Discord Font', 4.4, 456),
    relatedTools: ['instagram-fonts','facebook-font','bold-text']
  },
  {
    slug: 'number-sorter',
    pathname: '/tools/number-sorter',
    type: 'tool',
    category: 'miscellaneous-utility',
    i18n: {
      en: {
        title: 'Number Sorter — Sort Numbers Asc/Desc, Remove Duplicates',
        description: 'Quickly sort numbers ascending or descending and remove duplicates. Paste your list and get clean results for spreadsheets or code.',
        shortDescription: 'Sort numbers and remove duplicates.',
      },
      ru: {
        title: 'Сортировка Чисел — По Возрастанию/Убыванию, Без Дубликатов',
        description: 'Быстро сортируйте числа по возрастанию или убыванию и удаляйте дубликаты. Вставьте список и получите чистый результат.',
        shortDescription: 'Сортировка чисел и удаление дублей.',
      }
    },
    schema: createAdvancedSchema('number-sorter', ['Asc/Desc', 'Deduplicate'], 'Number List Input', 'Sorted Numbers', 4.3, 389),
    relatedTools: ['sort-words','duplicate-line-remover','csv-to-json']
  },
  {
    slug: 'binary-code-translator',
    pathname: '/tools/binary-code-translator',
    type: 'tool',
    category: 'code-data-tools',
    i18n: {
      en: {
        title: 'Binary Translator — Text ↔ Binary Code Converter',
        description: 'Translate text to binary and binary to text instantly. Great for learning encodings and quick conversions. Copy results in one click.',
        shortDescription: 'Convert text ↔ binary code.',
      },
      ru: {
        title: 'Переводчик Бинарного Кода — Текст ↔ Бинарный',
        description: 'Переводите текст в бинарный код и обратно мгновенно. Подходит для изучения кодировок и быстрых конвертаций. Копирование в один клик.',
        shortDescription: 'Текст ↔ бинарный код.',
      }
    },
    schema: createAdvancedSchema('binary-code-translator', ['Two-way conversion', 'Instant copy'], 'Binary Input', 'Text Output', 4.2, 321),
    relatedTools: ['hex-to-text','base64-encoder-decoder','utf8-converter']
  },
  {
    slug: 'utf8-converter',
    pathname: '/tools/utf8-converter',
    type: 'tool',
    category: 'code-data-tools',
    i18n: {
      en: {
        title: 'UTF‑8 Converter — Decode/Encode UTF‑8 to Text',
        description: 'Decode UTF‑8 to readable text and encode text back to UTF‑8 safely. Fix garbled characters and encoding issues in seconds.',
        shortDescription: 'Decode/encode UTF‑8 ↔ text.',
      },
      ru: {
        title: 'Конвертер UTF‑8 — Декодирование/Кодирование в Текст',
        description: 'Декодируйте UTF‑8 в читаемый текст и кодируйте обратно. Исправляйте «кракозябры» и проблемы кодировок за секунды.',
        shortDescription: 'UTF‑8 ↔ текст.',
      }
    },
    schema: createAdvancedSchema('utf8-converter', ['Decode', 'Encode', 'Fix garbled text'], 'Text Input', 'UTF-8 Output', 4.1, 298),
    relatedTools: ['binary-code-translator','hex-to-text','base64-encoder-decoder']
  },
  {
    slug: 'remove-text-formatting',
    pathname: '/tools/remove-text-formatting',
    type: 'tool',
    category: 'text-modification',
    i18n: {
      en: {
        title: 'Remove Text Formatting — Convert to Plain Text',
        description: 'Strip bold/italic/fonts, links, and styles from pasted text. Get clean plain text for docs, emails, and code. One‑click copy.',
        shortDescription: 'Strip styling to clean plain text.',
      },
      ru: {
        title: 'Удалить Форматирование Текста — В Чистый Текст',
        description: 'Удаляйте жирный/курсив/шрифты, ссылки и стили из вставленного текста. Получайте чистый текст для документов, почты и кода.',
        shortDescription: 'Очистка форматирования до простого текста.',
      }
    },
    schema: createAdvancedSchema('remove-text-formatting', ['Strip styles', 'Clean output'], 'Formatted Text Input', 'Plain Text', 4.6, 678),
    relatedTools: ['plain-text','remove-line-breaks','text-replace']
  },
  {
    slug: 'instagram-fonts',
    pathname: '/tools/instagram-fonts',
    type: 'tool',
    category: 'social-media',
    i18n: {
      en: {
        title: 'Instagram Font Generator — Stylish Fonts for Bios & Captions',
        description: 'Make stylish Instagram fonts for bios and captions. Preview, copy & paste in one click. Free, fast, no limits.',
        shortDescription: 'Stylish IG fonts for bios & captions.',
      },
      ru: {
        title: 'Генератор Шрифтов Instagram — Стиль для Био и Подписей',
        description: 'Создавайте стильные шрифты и символы для био и подписей в Instagram. Предпросмотр и копирование в один клик. Бесплатно.',
        shortDescription: 'Стильные IG‑шрифты для био и подписей.',
      }
    },
    schema: createAdvancedSchema('instagram-fonts', ['Stylish fonts', 'Copy & paste'], 'Text Input', 'Instagram Font', 4.5, 567),
    relatedTools: ['facebook-font','discord-font','bold-text']
  },
  {
    slug: 'word-frequency',
    pathname: '/tools/word-frequency',
    type: 'tool',
    category: 'text-analysis',
    i18n: {
      en: {
        title: 'Word Frequency Analyzer — Count Word Occurrences',
        description: 'Analyze word frequency in any text. Get counts, percentages, and stop‑word control for SEO, research, and editing. Export results.',
        shortDescription: 'Analyze word frequency and counts.',
      },
      ru: {
        title: 'Анализ Частоты Слов — Подсчёт Повторений',
        description: 'Анализируйте частоту слов в тексте. Подсчёты, проценты и стоп‑слова для SEO, исследований и редактирования. Экспорт результатов.',
        shortDescription: 'Частота слов и подсчёты.',
      }
    },
    schema: createAdvancedSchema('word-frequency', ['Counts', 'Stop-words', 'Export'], 'Text Input', 'Word Frequency Analysis', 4.4, 456),
    relatedTools: ['text-counter','sentence-counter','sort-words']
  },
  {
    slug: 'random-month',
    pathname: '/tools/random-month',
    type: 'tool',
    category: 'random-generator',
    i18n: {
      en: {
        title: 'Random Month Generator — Pick a Month (Any Year Range)',
        description: 'Pick random months with names or numbers. Choose year ranges and bulk-generate lists for planning, testing, and games.',
        shortDescription: 'Pick random months with custom ranges.',
      },
      ru: {
        title: 'Генератор Случайных Месяцев — Любые Диапазоны',
        description: 'Выбирайте случайные месяцы по названию или номеру. Указывайте диапазоны лет и генерируйте списки для планирования и тестов.',
        shortDescription: 'Случайные месяцы и списки.',
      }
    },
    schema: createAdvancedSchema('random-month', ['Names/numbers', 'Year ranges', 'Bulk list'], 'Settings Input', 'Random Months', 4.3, 389),
    relatedTools: ['random-date','random-number','random-choice']
  },
  {
    slug: 'plain-text',
    pathname: '/tools/plain-text',
    type: 'tool',
    category: 'text-modification',
    i18n: {
      en: {
        title: 'Plain Text Converter — Clean Text, No Formatting',
        description: 'Convert any text to plain text. Remove hidden styles, links, and fonts. Perfect for email, docs, and code snippets. One‑click copy.',
        shortDescription: 'Convert to clean plain text.',
      },
      ru: {
        title: 'Конвертер В Простой Текст — Без Форматирования',
        description: 'Преобразуйте любой текст в простой. Удалите скрытые стили, ссылки и шрифты. Идеально для писем, документов и кода.',
        shortDescription: 'Чистый простой текст.',
      }
    },
    schema: createAdvancedSchema('plain-text', ['Strip styles', 'One-click copy'], 'Formatted Text Input', 'Plain Text', 4.7, 789),
    relatedTools: ['remove-text-formatting','remove-line-breaks','text-replace']
  },
  {
    slug: 'json-stringify',
    pathname: '/tools/json-stringify',
    type: 'tool',
    category: 'code-data-tools',
    i18n: {
      en: {
        title: 'JSON Stringify — Safe Text ↔ JSON Converter',
        description: 'Stringify JSON safely or parse text to JSON with proper escaping. Copy, pretty‑print, and validate data for dev and QA tasks.',
        shortDescription: 'Stringify/parse JSON with escaping.',
      },
      ru: {
        title: 'JSON Stringify — Безопасное Преобразование Текста и JSON',
        description: 'Преобразуйте JSON в строку безопасно или парсите текст в JSON с экранированием. Копирование, форматирование и валидация данных.',
        shortDescription: 'Строка/парсинг JSON с экранированием.',
      }
    },
    schema: createAdvancedSchema('json-stringify', ['Stringify', 'Parse', 'Pretty-print'], 'JSON Input', 'JSON String', 4.8, 1234),
    relatedTools: ['csv-to-json','url-converter','base64-encoder-decoder']
  },
  {
    slug: 'png-to-webp',
    pathname: '/tools/png-to-webp',
    type: 'tool',
    category: 'image-tool',
    i18n: {
      en: {
        title: 'PNG to WebP Converter — Compress Images, Keep Quality',
        description: 'Convert PNG images to WebP for smaller size with great quality. Fast, browser‑based, and secure. Drag‑and‑drop multiple files.',
        shortDescription: 'Convert PNG images to WebP quickly.',
      },
      ru: {
        title: 'PNG → WebP Конвертер — Сжать Изображения с Качеством',
        description: 'Конвертируйте PNG в WebP для меньшего размера и отличного качества. Быстро, в браузере и безопасно. Перетаскивайте файлы.',
        shortDescription: 'Быстрый PNG → WebP.',
      }
    },
    schema: createAdvancedSchema('png-to-webp', ['Batch convert', 'Browser-based'], 'PNG Image Input', 'WebP Image', 4.5, 567),
    relatedTools: ['webp-to-png','jpg-to-webp','png-to-jpg']
  },
  {
    slug: 'rot13',
    pathname: '/tools/rot13',
    type: 'tool',
    category: 'code-data-tools',
    i18n: {
      en: {
        title: 'ROT13 Encoder/Decoder — Simple Text Obfuscation',
        description: 'Encode or decode text with ROT13 instantly. A quick way to hide spoilers or answers. Copy results in one click. Free tool.',
        shortDescription: 'Encode/decode text with ROT13.',
      },
      ru: {
        title: 'ROT13 Кодер/Декодер — Простое Сокрытие Текста',
        description: 'Кодируйте или декодируйте текст алгоритмом ROT13 мгновенно. Быстрый способ скрыть спойлеры или ответы. Копирование в один клик.',
        shortDescription: 'ROT13 кодирование/декодирование.',
      }
    },
    schema: createAdvancedSchema('rot13', ['Encode/decode', 'Instant copy'], 'Text Input', 'ROT13 Text', 4.0, 267),
    relatedTools: ['caesar-cipher','url-converter','json-stringify']
  },
  {
    slug: 'url-converter',
    pathname: '/tools/url-converter',
    type: 'tool',
    category: 'code-data-tools',
    i18n: {
      en: {
        title: 'URL Converter — Encode/Decode URLs Safely',
        description: 'Encode or decode URLs and query strings safely. Prevent broken links and invalid characters. Copy and validate instantly.',
        shortDescription: 'Encode/decode URLs and queries.',
      },
      ru: {
        title: 'URL Конвертер — Безопасное Кодирование/Декодирование',
        description: 'Кодируйте или декодируйте URL и строки запросов безопасно. Избегайте битых ссылок и недопустимых символов. Мгновенная проверка.',
        shortDescription: 'Кодирование/декодирование URL.',
      }
    },
    schema: createAdvancedSchema('url-converter', ['Encode/decode', 'Validation'], 'URL Input', 'Encoded/Decoded URL', 4.6, 678),
    relatedTools: ['slugify-url','utm-builder','json-stringify']
  },
  {
    slug: 'csv-to-json',
    pathname: '/tools/csv-to-json',
    type: 'tool',
    category: 'code-data-tools',
    i18n: {
      en: {
        title: 'CSV to JSON Converter — Fast, Accurate, Free',
        description: 'Convert CSV data to clean JSON and back. Handle headers, delimiters, and quotes. Copy, download, and validate structure.',
        shortDescription: 'Convert CSV ↔ JSON with options.',
      },
      ru: {
        title: 'CSV ↔ JSON Конвертер — Быстро и Точно',
        description: 'Преобразуйте CSV в корректный JSON и обратно. Настраивайте заголовки, разделители и кавычки. Копируйте и загружайте.',
        shortDescription: 'CSV ↔ JSON с настройками.',
      }
    },
    schema: createAdvancedSchema('csv-to-json', ['CSV ↔ JSON', 'Delimiter options'], 'CSV Input', 'JSON Output', 4.7, 789),
    relatedTools: ['json-stringify','url-converter','base64-encoder-decoder']
  },
  {
    slug: 'md5-hash',
    pathname: '/tools/md5-hash',
    type: 'tool',
    category: 'security-tool',
    i18n: {
      en: {
        title: 'MD5 Hash Generator — Create MD5 Checksums',
        description: 'Generate MD5 hashes from text or files for quick checksums and integrity tests. Copy or download results. Free and fast.',
        shortDescription: 'Generate MD5 hashes and checksums.',
      },
      ru: {
        title: 'MD5 Хэш — Генератор Контрольных Сумм',
        description: 'Генерируйте MD5‑хэши из текста или файлов для быстрых проверок и целостности. Копируйте или скачивайте результаты. Быстро бесплатно.',
        shortDescription: 'MD5 хэши и контрольные суммы.',
      }
    },
    schema: createAdvancedSchema('md5-hash', ['Text/file input', 'Copy/download'], 'Data Input', 'MD5 Hash', 4.8, 1234),
    relatedTools: ['base64-encoder-decoder','uuid-generator','json-stringify']
  },
  {
    slug: 'slugify-url',
    pathname: '/tools/slugify-url',
    type: 'tool',
    category: 'code-data-tools',
    i18n: {
      en: {
        title: 'Slugify URL — SEO‑Friendly, Clean URLs from Text',
        description: 'Turn titles into SEO‑friendly slugs: lowercase, hyphens, and safe characters. Great for blogs, docs, and product pages.',
        shortDescription: 'Create clean, SEO‑friendly slugs.',
      },
      ru: {
        title: 'Slugify URL — SEO‑Чистые Ссылки из Текста',
        description: 'Преобразуйте заголовки в SEO‑дружественные слаги: нижний регистр, дефисы и безопасные символы. Для блогов и страниц.',
        shortDescription: 'Чистые SEO‑слаги из текста.',
      }
    },
    schema: createAdvancedSchema('slugify-url', ['Lowercase', 'Safe characters'], 'Text Input', 'URL Slug', 4.5, 567),
    relatedTools: ['url-converter','title-case','nato-phonetic']
  },
  {
    slug: 'uppercase',
    pathname: '/tools/uppercase',
    type: 'tool',
    category: 'text-transform',
    i18n: {
      en: {
        title: 'Uppercase Converter — Make Text UPPERCASE',
        description: 'Convert any text to UPPERCASE instantly. Paste or type, then copy your result. Works with large texts. Free and unlimited.',
        shortDescription: 'Convert text to UPPERCASE.',
      },
      ru: {
        title: 'Конвертер В ВЕРХНИЙ РЕГИСТР — Uppercase',
        description: 'Преобразуйте текст в ВЕРХНИЙ РЕГИСТР мгновенно. Вставьте или введите — результат сразу готов. Поддержка больших текстов.',
        shortDescription: 'Текст в ВЕРХНИЙ РЕГИСТР.',
      }
    },
    schema: createAdvancedSchema('uppercase', ['Instant convert', 'Large input'], 'Text Input', 'Uppercase Text', 4.6, 678),
    relatedTools: ['lowercase','title-case','sentence-case']
  },
  {
    slug: 'lowercase',
    pathname: '/tools/lowercase',
    type: 'tool',
    category: 'text-transform',
    i18n: {
      en: {
        title: 'Lowercase Converter — Make Text lowercase',
        description: 'Convert any text to lowercase instantly. Paste or type, then copy your result. Great for normalization and cleanup.',
        shortDescription: 'Convert text to lowercase.',
      },
      ru: {
        title: 'Конвертер в нижний регистр — lowercase',
        description: 'Преобразуйте текст в нижний регистр мгновенно. Вставьте или введите — получите результат. Удобно для нормализации.',
        shortDescription: 'Текст в нижний регистр.',
      }
    },
    schema: createAdvancedSchema('lowercase', ['Instant convert', 'Cleanup'], 'Text Input', 'Lowercase Text', 4.7, 789),
    relatedTools: ['uppercase','title-case','sentence-case']
  },
  {
    slug: 'title-case',
    pathname: '/tools/title-case',
    type: 'tool',
    category: 'text-transform',
    i18n: {
      en: {
        title: 'Title Case Converter — Capitalize Titles Properly',
        description: 'Convert text to proper Title Case using common style rules. Fix capitalization for headlines, documents, and articles.',
        shortDescription: 'Convert text to Title Case.',
      },
      ru: {
        title: 'Title Case — Правильная Капитализация Заголовков',
        description: 'Преобразуйте текст в корректный Title Case по общим правилам. Исправляйте регистр в заголовках и документах.',
        shortDescription: 'Корректная капитализация заголовков.',
      }
    },
    schema: createAdvancedSchema('title-case', ['Style rules', 'Headline ready'], 'Text Input', 'Title Case Text', 4.8, 1234),
    relatedTools: ['sentence-case','uppercase','lowercase']
  },
  {
    slug: 'sentence-case',
    pathname: '/tools/sentence-case',
    type: 'tool',
    category: 'text-transform',
    i18n: {
      en: {
        title: 'Sentence Case Converter — Capitalize Sentences',
        description: 'Convert text to Sentence case instantly. Fix capitalization at sentence level and tidy inconsistent text. Free and unlimited.',
        shortDescription: 'Convert text to Sentence case.',
      },
      ru: {
        title: 'Sentence case — Капитализация Предложений',
        description: 'Преобразуйте текст в Sentence case мгновенно. Исправляйте регистр на уровне предложений и приводите текст к порядку.',
        shortDescription: 'Sentence case для текста.',
      }
    },
    schema: createAdvancedSchema('sentence-case', ['Instant convert', 'Cleanup'], 'Text Input', 'Sentence Case Text', 4.6, 678),
    relatedTools: ['title-case','uppercase','lowercase']
  },
  {
    slug: 'alternating-case',
    pathname: '/tools/alternating-case',
    type: 'tool',
    category: 'text-modification',
    i18n: {
      en: {
        title: 'Alternating Case — aLtErNaTiNg TeXt Generator',
        description: 'Generate alternating capitalization for fun text effects. Paste or type and copy instantly. Great for memes and playful copy.',
        shortDescription: 'Generate alternating case text.',
      },
      ru: {
        title: 'Alternating Case — Чередование Регистра',
        description: 'Создавайте текст с чередующимся регистром для весёлых эффектов. Вставьте или введите и копируйте мгновенно.',
        shortDescription: 'Чередование регистра для текста.',
      }
    },
    schema: createAdvancedSchema('alternating-case', ['Fun effects', 'Instant copy'], 'Text Input', 'Alternating Case Text', 4.3, 389),
    relatedTools: ['cursed-text','big-text','bubble-text']
  },
  {
    slug: 'mirror-text',
    pathname: '/tools/mirror-text',
    type: 'tool',
    category: 'text-modification',
    i18n: {
      en: {
        title: 'Mirror Text — Reverse and Flip Text Online',
        description: 'Reverse or mirror text horizontally in one click. Paste input and copy results for creative effects, puzzles, and usernames.',
        shortDescription: 'Reverse or mirror your text.',
      },
      ru: {
        title: 'Зеркальный Текст — Переворот и Отражение Онлайн',
        description: 'Переворачивайте или отражайте текст по горизонтали в один клик. Для креативных эффектов, головоломок и никнеймов.',
        shortDescription: 'Отразить или перевернуть текст.',
      }
    },
    schema: createAdvancedSchema('mirror-text', ['Reverse/mirror', 'One-click copy'], 'Text Input', 'Mirrored Text', 4.2, 321),
    relatedTools: ['cursed-text','repeat-text','bold-text']
  },
  {
    slug: 'repeat-text',
    pathname: '/tools/repeat-text',
    type: 'tool',
    category: 'text-modification',
    i18n: {
      en: {
        title: 'Text Repeater — Repeat Text with Custom Separators',
        description: 'Repeat lines or phrases many times with custom separators and numbering. Generate lists fast for tests, demos, and content.',
        shortDescription: 'Repeat text with separators.',
      },
      ru: {
        title: 'Повтор Текста — С Повторителями и Разделителями',
        description: 'Повторяйте строки или фразы много раз с разделителями и нумерацией. Быстро создавайте списки для тестов и демонстраций.',
        shortDescription: 'Повтор текста с разделителями.',
      }
    },
    schema: createAdvancedSchema('repeat-text', ['Repeats', 'Numbering', 'Separators'], 'Text Input', 'Repeated Text', 4.1, 298),
    relatedTools: ['remove-line-breaks','duplicate-line-remover','sort-words']
  },
  {
    slug: 'remove-line-breaks',
    pathname: '/tools/remove-line-breaks',
    type: 'tool',
    category: 'text-modification',
    i18n: {
      en: {
        title: 'Remove Line Breaks — Flatten Text to Single Lines',
        description: 'Remove line breaks and extra spaces from pasted text. Get compact, single‑line output for forms, code, or CSV. One‑click copy.',
        shortDescription: 'Remove line breaks and spaces.',
      },
      ru: {
        title: 'Удалить Разрывы Строк — Компактный Однострочный Текст',
        description: 'Удаляйте переносы строк и лишние пробелы из текста. Получайте компактный однострочный вывод для форм, кода или CSV.',
        shortDescription: 'Удаление переносов и пробелов.',
      }
    },
    schema: createAdvancedSchema('remove-line-breaks', ['Line-break removal', 'Trim spaces'], 'Text Input', 'Single Line Text', 4.5, 567),
    relatedTools: ['plain-text','remove-text-formatting','text-replace']
  },
  {
    slug: 'duplicate-line-remover',
    pathname: '/tools/duplicate-line-remover',
    type: 'tool',
    category: 'text-modification',
    i18n: {
      en: {
        title: 'Remove Duplicate Lines — Clean and Deduplicate Text',
        description: 'Remove duplicate lines from your text, keeping the first or unique only. Sort and clean lists for spreadsheets and code.',
        shortDescription: 'Remove duplicate lines in text.',
      },
      ru: {
        title: 'Удалить Дубликаты Строк — Очистка Текста',
        description: 'Удаляйте повторяющиеся строки, оставляя первые или только уникальные. Сортируйте и очищайте списки для таблиц и кода.',
        shortDescription: 'Удаление дубликатов строк.',
      }
    },
    schema: createAdvancedSchema('duplicate-line-remover', ['Deduplicate', 'Sort options'], 'Text Input', 'Deduplicated Text', 4.4, 456),
    relatedTools: ['sort-words','repeat-text','plain-text']
  },
  {
    slug: 'sort-words',
    pathname: '/tools/sort-words',
    type: 'tool',
    category: 'text-modification',
    i18n: {
      en: {
        title: 'Sort Words — Alphabetize or Reverse Lists',
        description: 'Sort words or lines alphabetically (A→Z/Z→A). Remove duplicates and trim spaces. Perfect for lists, tags, and SEO clean‑up.',
        shortDescription: 'Alphabetize words and lists.',
      },
      ru: {
        title: 'Сортировка Слов — Алфавитная или Обратная',
        description: 'Сортируйте слова или строки по алфавиту (А→Я/Я→А). Удаляйте дубликаты и пробелы. Подходит для списков и тегов.',
        shortDescription: 'Алфавитная сортировка слов.',
      }
    },
    schema: createAdvancedSchema('sort-words', ['Alphabetize', 'Deduplicate'], 'Text Input', 'Sorted Words', 4.3, 389),
    relatedTools: ['duplicate-line-remover','word-frequency','text-replace']
  },
  {
    slug: 'bubble-text',
    pathname: '/tools/bubble-text',
    type: 'tool',
    category: 'text-modification',
    i18n: {
      en: {
        title: 'Bubble Text Generator — Cute Bubble Letters (Copy & Paste)',
        description: 'Make cute bubble letters for posts and messages. Type, preview, copy & paste instantly. Free and unlimited.',
        shortDescription: 'Cute bubble letters (copy & paste).',
      },
      ru: {
        title: 'Пузырьковый Текст — Милые Буквы (Копировать и Вставить)',
        description: 'Делайте милые пузырьковые буквы для постов и сообщений. Пишите, просматривайте и копируйте мгновенно. Бесплатно.',
        shortDescription: 'Милые пузырьковые буквы.',
      }
    },
    schema: createAdvancedSchema('bubble-text', ['Bubble style', 'Instant copy'], 'Text Input', 'Bubble Text', 4.6, 678),
    relatedTools: ['big-text','bold-text','italic-text']
  },
  {
    slug: 'big-text',
    pathname: '/tools/big-text',
    type: 'tool',
    category: 'text-modification',
    i18n: {
      en: {
        title: 'Big Text Generator — Large Letters for Headers (Free)',
        description: 'Make large letters for headers, titles, and banners. Type, preview, copy & paste in one click. Free and unlimited.',
        shortDescription: 'Large letters for headers (free).',
      },
      ru: {
        title: 'Большой Текст — Крупные Буквы для Заголовков',
        description: 'Делайте крупные буквы для заголовков и баннеров. Пишите, просматривайте и копируйте одним кликом. Бесплатно без лимитов.',
        shortDescription: 'Крупные буквы для заголовков.',
      }
    },
    schema: createAdvancedSchema('big-text', ['Large letters', 'Instant copy'], 'Text Input', 'Big Text', 4.5, 567),
    relatedTools: ['bubble-text','bold-text','italic-text']
  },
  {
    slug: 'subscript-text',
    pathname: '/tools/subscript-text',
    type: 'tool',
    category: 'text-modification',
    i18n: {
      en: {
        title: 'Subscript Text Generator — X₂ Small Characters (Copy)',
        description: 'Create subscript characters (like X₂) for math and notation. Type, preview, copy & paste instantly. Free and unlimited.',
        shortDescription: 'Create subscript characters (X₂).',
      },
      ru: {
        title: 'Нижний Индекс — Маленькие Символы X₂ (Копировать)',
        description: 'Создавайте символы нижнего индекса (например, X₂) для математики и научной записи. Пишите, просматривайте и копируйте.',
        shortDescription: 'Нижний индекс (X₂).',
      }
    },
    schema: createAdvancedSchema('subscript-text', ['Subscript', 'Instant copy'], 'Text Input', 'Subscript Text', 4.4, 456),
    relatedTools: ['superscript-text','italic-text','bold-text']
  },
  {
    slug: 'italic-text',
    pathname: '/tools/italic-text',
    type: 'tool',
    category: 'text-modification',
    i18n: {
      en: {
        title: 'Italic Text Generator — Slanted Unicode (Copy & Paste)',
        description: 'Make slanted italic Unicode text for posts, bios, and messages. Type, preview, copy & paste instantly. Free and unlimited.',
        shortDescription: 'Italic Unicode text (copy & paste).',
      },
      ru: {
        title: 'Курсив — Наклонный Unicode (Копировать и Вставить)',
        description: 'Делайте наклонный курсивный Unicode‑текст для постов, био и сообщений. Пишите, просматривайте, копируйте мгновенно.',
        shortDescription: 'Курсивный Unicode‑текст (копировать).',
      }
    },
    schema: createAdvancedSchema('italic-text', ['Italic style', 'Instant copy'], 'Text Input', 'Italic Text', 4.7, 789),
    relatedTools: ['bold-text','bubble-text','big-text']
  },
  {
    slug: 'invisible-text',
    pathname: '/tools/invisible-text',
    type: 'tool',
    category: 'text-modification',
    i18n: {
      en: {
        title: 'Invisible Text Generator — Blank/Empty Characters (Copy)',
        description: 'Create invisible characters and blank spaces (zero‑width) for formatting and spacing. Copy & paste instantly.',
        shortDescription: 'Blank/empty characters (copy).',
      },
      ru: {
        title: 'Невидимый Текст — Пустые Символы (Копировать)',
        description: 'Создавайте невидимые символы и пустые пробелы (нулевой ширины) для форматирования и отступов. Копируйте мгновенно.',
        shortDescription: 'Пустые символы (копировать).',
      }
    },
    schema: createAdvancedSchema('invisible-text', ['Invisible chars', 'Zero-width spaces'], 'Text Input', 'Invisible Text', 4.0, 267),
    relatedTools: ['plain-text','remove-text-formatting','repeat-text']
  },
  // Missing schema tools - adding now
  {
    slug: 'text-replace',
    pathname: '/tools/text-replace',
    type: 'tool',
    category: 'text-modification',
    i18n: {
      en: {
        title: 'Text Replace — Find and Replace Text Online',
        description: 'Find and replace text in documents, code, or any text. Support for case-sensitive matching, regex patterns, and bulk replacement.',
        shortDescription: 'Find and replace text with advanced options.',
      },
      ru: {
        title: 'Замена Текста — Поиск и Замена Онлайн',
        description: 'Находите и заменяйте текст в документах, коде или любом тексте. Поддержка регистро-зависимого поиска, regex-паттернов и массовой замены.',
        shortDescription: 'Поиск и замена текста с расширенными опциями.',
      }
    },
    schema: createAdvancedSchema('text-replace', ['Find and replace', 'Case sensitive', 'Regex support', 'Bulk replacement'], 'Text Input', 'Replaced Text', 4.6, 678),
    relatedTools: ['text-counter','remove-text-formatting','plain-text']
  },
  {
    slug: 'text-counter',
    pathname: '/tools/text-counter',
    type: 'tool',
    category: 'text-analysis',
    i18n: {
      en: {
        title: 'Text Counter — Count Characters, Words, Lines & More',
        description: 'Count characters, words, lines, sentences, and paragraphs in any text. Get detailed statistics including reading time and character frequency.',
        shortDescription: 'Count characters, words, lines, and get text statistics.',
      },
      ru: {
        title: 'Счётчик Текста — Символы, Слова, Строки и Другое',
        description: 'Считайте символы, слова, строки, предложения и абзацы в любом тексте. Получайте детальную статистику включая время чтения и частоту символов.',
        shortDescription: 'Счётчик символов, слов, строк и статистика текста.',
      }
    },
    schema: createAdvancedSchema('text-counter', ['Character count', 'Word count', 'Line count', 'Reading time', 'Statistics'], 'Text Input', 'Text Statistics', 4.7, 789),
    relatedTools: ['sentence-counter','word-frequency','plain-text']
  },
  {
    slug: 'cursed-text',
    pathname: '/tools/cursed-text',
    type: 'tool',
    category: 'text-modification',
    i18n: {
      en: {
        title: 'Cursed Text Generator — Unicode Stylized Text',
        description: 'Generate cursed, stylized text using Unicode characters. Create unique fonts for social media, usernames, and creative projects.',
        shortDescription: 'Generate cursed Unicode text for social media.',
      },
      ru: {
        title: 'Генератор Проклятого Текста — Unicode Стилизация',
        description: 'Создавайте проклятый, стилизованный текст с помощью Unicode символов. Уникальные шрифты для соцсетей, ников и креативных проектов.',
        shortDescription: 'Генератор проклятого Unicode текста для соцсетей.',
      }
    },
    schema: createAdvancedSchema('cursed-text', ['Unicode text', 'Stylish fonts', 'Social media ready', 'Creative styling'], 'Text Input', 'Cursed Text', 4.3, 389),
    relatedTools: ['bold-text','italic-text','big-text']
  }
];

// Explicitly declare ALL tool and category slugs so the registry is complete and maintainable
const TOOL_SLUGS: string[] = [
  'webp-to-png','png-to-webp','random-month','remove-line-breaks','text-replace','text-counter','uuid-generator','slugify-url',
  'roman-numeral-date','rot13','random-number','url-converter','utm-builder','subscript-text','sentence-case','repeat-text',
  'pig-latin','title-case','sentence-counter','remove-text-formatting','webp-to-jpg','utf8-converter','random-letter','plain-text',
  'random-choice','word-frequency','sort-words','uppercase','png-to-jpg','random-ip','random-date','jpg-to-png','invisible-text',
  'csv-to-json','alternating-case','instagram-fonts','lowercase','image-cropper','nato-phonetic','image-to-text','image-resizer',
  'italic-text','ascii-art-generator','jpg-to-webp','mirror-text','cursed-text','online-notepad','facebook-font','password-generator',
  'discord-font','big-text','number-sorter','json-stringify','morse-code','binary-code-translator','md5-hash','base64-encoder-decoder',
  'bubble-text','duplicate-line-remover','hex-to-text','bold-text','phonetic-spelling'
];

const CATEGORY_SLUGS: string[] = [
  'misc-tools','random-generators','code-data-translation','text-modification-formatting','analysis-counter-tools','image-tools','social-media-text-generators'
];

function buildDefaultI18n(slug: string): Record<SupportedLocale, LocalizedMetadataFields> {
  const readable = slug.replace(/-/g, ' ');
  const titleEn = `${readable.charAt(0).toUpperCase()}${readable.slice(1)} — Free Online Tool`;
  const titleRu = `${readable.charAt(0).toUpperCase()}${readable.slice(1)} — Онлайн Инструмент`;
  return {
    en: {
      title: titleEn,
      description: 'Use this free online tool for fast, reliable results. No limits, no signup.',
      shortDescription: 'Free online tool. Fast, reliable, no limits.',
    },
    ru: {
      title: titleRu,
      description: 'Бесплатный онлайн инструмент для быстрых и надежных результатов. Без ограничений и регистрации.',
      shortDescription: 'Бесплатный онлайн инструмент. Быстро и без лимитов.',
    },
  };
}

// Initialize registry with declared tools
for (const slug of TOOL_SLUGS) {
  if (!registry.has(slug)) {
    registry.set(slug, {
      slug,
      pathname: `/tools/${slug}`,
      type: 'tool',
      i18n: buildDefaultI18n(slug),
    });
  }
}

// Initialize registry with declared categories
for (const slug of CATEGORY_SLUGS) {
  if (!registry.has(slug)) {
    registry.set(slug, {
      slug,
      pathname: `/category/${slug}`,
      type: 'category',
      i18n: buildDefaultI18n(slug),
      schema: { type: 'CollectionPage', applicationCategory: 'UtilityApplication' }
    });
  }
}

// Add All Tools index page
if (!registry.has('tools')) {
  registry.set('tools', {
    slug: 'tools',
    pathname: '/tools',
    type: 'category',
    i18n: {
      en: {
        title: 'All Free Online Tools — Text, Code, Image, Utilities',
        description: 'Browse all free online tools in one place. Text formatting, random generators, code/data converters, image tools, and more.',
        shortDescription: 'All free online tools in one place.',
      },
      ru: {
        title: 'Все Бесплатные Онлайн Инструменты — Текст, Код, Изображения',
        description: 'Просматривайте все бесплатные онлайн инструменты в одном месте: форматирование текста, генераторы случайных данных, конвертеры кода/данных, инструменты для изображений и другое.',
        shortDescription: 'Все бесплатные инструменты в одном месте.',
      }
    },
    schema: createCategorySchema('tools', 64, 'All Tools')
  });
}

// Add Home pages (EN and RU) metadata via a unified slug 'home'
if (!registry.has('home')) {
  registry.set('home', {
    slug: 'home',
    pathname: '/',
    type: 'category',
    i18n: {
      en: {
        title: 'Text Case Converter — Free Text, Code & Image Tools',
        description: 'Professional text and utility tools: case converters, random generators, code/data converters, and image tools. Free and unlimited.',
        shortDescription: 'Free text, code, and image tools. No limits.',
      },
      ru: {
        title: 'Text Case Converter — Бесплатные Текстовые, Кодовые и Графические Инструменты',
        description: 'Профессиональные инструменты: преобразование регистра, генераторы случайных данных, конвертеры кода/данных и инструменты для изображений. Бесплатно и без ограничений.',
        shortDescription: 'Бесплатные инструменты для текста, кода и изображений.',
      }
    },
    schema: createCategorySchema('home', 64, 'Text Case Converter')
  });
}

    // Add Company/Legal static pages
    const staticPages: ToolMetadataConfig[] = [
      {
        slug: 'about-us',
        pathname: '/about-us',
        type: 'category',
        i18n: {
          en: {
            title: 'About Us — Text Case Converter',
            description: 'Learn about Text Case Converter: our mission, quality standards, and the tools we build for developers and creators.',
            shortDescription: 'About Text Case Converter and our mission.'
          },
          ru: {
            title: 'О нас — Text Case Converter',
            description: 'Узнайте о Text Case Converter: наша миссия, стандарты качества и инструменты для разработчиков и создателей.',
            shortDescription: 'О Text Case Converter и нашей миссии.'
          }
        },
        schema: createStaticPageSchema('about-us', 'About Us')
      },
      {
        slug: 'contact-us',
        pathname: '/contact-us',
        type: 'category',
        i18n: {
          en: {
            title: 'Contact Us — Text Case Converter',
            description: 'Get in touch with the Text Case Converter team for feedback, support, or partnership inquiries.',
            shortDescription: 'Contact the Text Case Converter team.'
          },
          ru: {
            title: 'Связаться с нами — Text Case Converter',
            description: 'Свяжитесь с командой Text Case Converter: отзывы, поддержка или партнерство.',
            shortDescription: 'Свяжитесь с командой Text Case Converter.'
          }
        },
        schema: createStaticPageSchema('contact-us', 'Contact Us')
      },
      {
        slug: 'privacy-policy',
        pathname: '/privacy-policy',
        type: 'category',
        i18n: {
          en: {
            title: 'Privacy Policy — Text Case Converter',
            description: 'Privacy Policy for Text Case Converter. Learn how we handle data with user privacy first. No content yet.',
            shortDescription: 'Privacy Policy information.'
          },
          ru: {
            title: 'Политика конфиденциальности — Text Case Converter',
            description: 'Политика конфиденциальности Text Case Converter. Как мы обрабатываем данные с приоритетом приватности. Контент позже.',
            shortDescription: 'Информация о политике конфиденциальности.'
          }
        },
        schema: createStaticPageSchema('privacy-policy', 'Privacy Policy')
      },
      {
        slug: 'terms-of-service',
        pathname: '/terms-of-service',
        type: 'category',
        i18n: {
          en: {
            title: 'Terms of Service — Text Case Converter',
            description: 'Terms of Service for Text Case Converter. Details about using our services. No content yet.',
            shortDescription: 'Terms of Service information.'
          },
          ru: {
            title: 'Условия использования — Text Case Converter',
            description: 'Условия использования Text Case Converter. Подробности об использовании наших сервисов. Контент позже.',
            shortDescription: 'Информация об условиях использования.'
          }
        },
        schema: createStaticPageSchema('terms-of-service', 'Terms of Service')
      }
    ];

    for (const page of staticPages) {
      registry.set(page.slug, page);
    }

// Add Not Found page (noindex intent; generator can set robots noindex)
if (!registry.has('not-found')) {
  registry.set('not-found', {
    slug: 'not-found',
    pathname: '/not-found',
    type: 'category',
    i18n: {
      en: {
        title: 'Page Not Found — Text Case Converter',
        description: 'The page you\'re looking for doesn\'t exist. Go back to Home or explore all tools.',
        shortDescription: 'Page not found. Explore all tools.',
      },
      ru: {
        title: 'Страница Не Найдена — Text Case Converter',
        description: 'Страница не существует. Вернитесь на главную или посмотрите все инструменты.',
        shortDescription: 'Страница не найдена. Посмотрите все инструменты.',
      }
    },
    schema: { type: 'CollectionPage', applicationCategory: 'UtilityApplication' }
  });
}

// Apply targeted overrides
for (const conf of overrides) {
  registry.set(conf.slug, { ...(registry.get(conf.slug) || {} as ToolMetadataConfig), ...conf });
}

// Exported API: get localized metadata for a slug
export function getToolMetadataLocalized(slug: string, locale: SupportedLocale): LocalizedMetadataFields & { category?: ToolMetadataConfig['category']; schema?: ToolMetadataConfig['schema'] } | null {
  const conf = registry.get(slug);
  if (!conf) return null;
  const base = conf.i18n[locale] || conf.i18n.en;
  return { ...base, category: conf.category, schema: conf.schema };
}

// Validation helper for CI/build time
export function validateRegistry(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const [slug, conf] of registry.entries()) {
    for (const locale of (['en', 'ru'] as SupportedLocale[])) {
      const loc = conf.i18n[locale];
      if (!loc) {
        issues.push({ slug, locale, field: 'title', message: 'Missing locale block' });
        continue;
      }
      for (const key of ['title', 'description', 'shortDescription'] as (keyof LocalizedMetadataFields)[]) {
        const val = typeof loc[key] === 'string' ? (loc[key] as string) : undefined;
        if (!val) continue;
        const issue = validateFieldLength(slug, locale, key, val);
        if (issue) issues.push(issue);
      }
    }
  }
  return issues;
}

// Expose a simple list for other systems (sitemap, inventory)
export function getAllMetadataEntries(): ToolMetadataConfig[] {
  return Array.from(registry.values());
}

