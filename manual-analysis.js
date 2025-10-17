#!/usr/bin/env node

// Manual analysis of specific tools from the metadata file
const tools = [
  {
    slug: 'random-number',
    en: {
      title: 'Free Random Number Generator — Secure RNG for Tests & Games',
      description: 'Generate secure random numbers in a custom range. Great for games, testing, analysis, and sampling. Bulk output, no limits.'
    },
    ru: {
      title: 'Генератор Случайных Чисел — Безопасный RNG для Тестов и Игр',
      description: 'Генерируйте безопасные случайные числа в заданном диапазоне. Подходит для игр, тестирования, анализа и выборок. Массовая генерация без ограничений.'
    }
  },
  {
    slug: 'image-cropper',
    en: {
      title: 'Image Cropper — Crop Pictures to Exact Size',
      description: 'Crop images to exact dimensions or aspect ratios. Drag to select, preview, and download. All in your browser, no uploads stored.'
    },
    ru: {
      title: 'Обрезка Изображений — Точный Размер и Пропорции',
      description: 'Обрезайте изображения до точных размеров или пропорций. Перетаскивание, предпросмотр и скачивание. В браузере, без хранения.'
    }
  },
  {
    slug: 'webp-to-png',
    en: {
      title: 'WebP to PNG — Keep Transparency when Converting',
      description: 'Convert WebP to PNG while preserving transparency. Works in your browser, supports multiple files, and quick downloads.'
    },
    ru: {
      title: 'WebP → PNG — Сохранение Прозрачности',
      description: 'Конвертируйте WebP в PNG с сохранением прозрачности. В браузере, пакетно и быстрое скачивание.'
    }
  },
  {
    slug: 'random-month',
    en: {
      title: 'Random Month Generator — Pick a Month (Any Year Range)',
      description: 'Pick random months with names or numbers. Choose year ranges and bulk-generate lists for planning, testing, and games.'
    },
    ru: {
      title: 'Генератор Случайных Месяцев — Любые Диапазоны',
      description: 'Выбирайте случайные месяцы по названию или номеру. Указывайте диапазоны лет и генерируйте списки для планирования и тестов.'
    }
  },
  {
    slug: 'password-generator',
    en: {
      title: 'Secure Password Generator — Strong Random Passwords Online',
      description: 'Create strong, unique passwords with customizable rules. Secure by default. Copy or download results. Free, unlimited.'
    },
    ru: {
      title: 'Генератор Паролей — Надёжные Случайные Пароли Онлайн',
      description: 'Создавайте надёжные уникальные пароли с настраиваемыми правилами. Безопасно по умолчанию. Копируйте или скачивайте. Бесплатно, без лимитов.'
    }
  },
  {
    slug: 'uppercase',
    en: {
      title: 'Uppercase Converter — Make Text UPPERCASE',
      description: 'Convert any text to UPPERCASE instantly. Paste or type, then copy your result. Works with large texts. Free and unlimited.'
    },
    ru: {
      title: 'Конвертер В ВЕРХНИЙ РЕГИСТР — Uppercase',
      description: 'Преобразуйте текст в ВЕРХНИЙ РЕГИСТР мгновенно. Вставьте или введите — результат сразу готов. Поддержка больших текстов.'
    }
  },
  {
    slug: 'title-case',
    en: {
      title: 'Title Case Converter — Capitalize Titles Properly',
      description: 'Convert text to proper Title Case using common style rules. Fix capitalization for headlines, documents, and articles.'
    },
    ru: {
      title: 'Title Case — Правильная Капитализация Заголовков',
      description: 'Преобразуйте текст в корректный Title Case по общим правилам. Исправляйте регистр в заголовках и документах.'
    }
  },
  {
    slug: 'pig-latin',
    en: {
      title: 'Pig Latin Translator — English ↔ Pig Latin',
      description: 'Translate English to Pig Latin and back for fun or learning. Paste text and copy results instantly. Free and unlimited.'
    },
    ru: {
      title: 'Переводчик Pig Latin — Английский ↔ Поросячий Латынь',
      description: 'Переводите английский в Pig Latin и обратно для развлечения и обучения. Вставляйте текст и копируйте результат.'
    }
  },
  {
    slug: 'rot13',
    en: {
      title: 'ROT13 Encoder/Decoder — Simple Text Obfuscation',
      description: 'Encode or decode text with ROT13 instantly. A quick way to hide spoilers or answers. Copy results in one click. Free tool.'
    },
    ru: {
      title: 'ROT13 Кодер/Декодер — Простое Сокрытие Текста',
      description: 'Кодируйте или декодируйте текст алгоритмом ROT13 мгновенно. Быстрый способ скрыть спойлеры или ответы. Копирование в один клик.'
    }
  },
  {
    slug: 'slugify-url',
    en: {
      title: 'Slugify URL — SEO‑Friendly, Clean URLs from Text',
      description: 'Turn titles into SEO‑friendly slugs: lowercase, hyphens, and safe characters. Great for blogs, docs, and product pages.'
    },
    ru: {
      title: 'Slugify URL — SEO‑Чистые Ссылки из Текста',
      description: 'Преобразуйте заголовки в SEO‑дружественные слаги: нижний регистр, дефисы и безопасные символы. Для блогов и страниц.'
    }
  }
];

console.log('=== DETAILED METADATA ANALYSIS REPORT ===\n');

console.log(`Analyzing ${tools.length} sample tools from metadata file\n`);

// Analyze each tool
tools.forEach(tool => {
  console.log(`=== ${tool.slug.toUpperCase()} ===`);
  
  // English analysis
  const enTitleLen = tool.en.title.length;
  const enDescLen = tool.en.description.length;
  
  console.log(`EN Title: "${tool.en.title}" (${enTitleLen} chars)`);
  console.log(`EN Description: "${tool.en.description}" (${enDescLen} chars)`);
  
  // Russian analysis
  const ruTitleLen = tool.ru.title.length;
  const ruDescLen = tool.ru.description.length;
  
  console.log(`RU Title: "${tool.ru.title}" (${ruTitleLen} chars)`);
  console.log(`RU Description: "${tool.ru.description}" (${ruDescLen} chars)`);
  
  // Issues
  const issues = [];
  if (enTitleLen < 45 || enTitleLen > 65) issues.push(`EN title length ${enTitleLen} outside 45-65 range`);
  if (enDescLen < 120 || enDescLen > 160) issues.push(`EN description length ${enDescLen} outside 120-160 range`);
  if (ruTitleLen < 45 || ruTitleLen > 65) issues.push(`RU title length ${ruTitleLen} outside 45-65 range`);
  if (ruDescLen < 120 || ruDescLen > 160) issues.push(`RU description length ${ruDescLen} outside 120-160 range`);
  if (!tool.en.title.includes('Text Case Converter') && !tool.en.title.includes('—') && !tool.en.title.includes('|')) {
    issues.push('EN title missing brand suffix');
  }
  if (!tool.ru.title.includes('Text Case Converter') && !tool.ru.title.includes('—') && !tool.ru.title.includes('|')) {
    issues.push('RU title missing brand suffix');
  }
  
  if (issues.length > 0) {
    console.log(`ISSUES: ${issues.join(', ')}`);
  } else {
    console.log('✅ No issues found');
  }
  
  console.log('');
});

// Summary statistics
const allEnTitles = tools.map(t => t.en.title.length);
const allEnDescs = tools.map(t => t.en.description.length);
const allRuTitles = tools.map(t => t.ru.title.length);
const allRuDescs = tools.map(t => t.ru.description.length);

console.log('=== SUMMARY STATISTICS ===');
console.log(`English Titles - Avg: ${(allEnTitles.reduce((a,b) => a+b, 0) / allEnTitles.length).toFixed(1)}, Range: ${Math.min(...allEnTitles)}-${Math.max(...allEnTitles)}`);
console.log(`English Descriptions - Avg: ${(allEnDescs.reduce((a,b) => a+b, 0) / allEnDescs.length).toFixed(1)}, Range: ${Math.min(...allEnDescs)}-${Math.max(...allEnDescs)}`);
console.log(`Russian Titles - Avg: ${(allRuTitles.reduce((a,b) => a+b, 0) / allRuTitles.length).toFixed(1)}, Range: ${Math.min(...allRuTitles)}-${Math.max(...allRuTitles)}`);
console.log(`Russian Descriptions - Avg: ${(allRuDescs.reduce((a,b) => a+b, 0) / allRuDescs.length).toFixed(1)}, Range: ${Math.min(...allRuDescs)}-${Math.max(...allRuDescs)}`);

// Count issues
const enTitleIssues = allEnTitles.filter(len => len < 45 || len > 65).length;
const enDescIssues = allEnDescs.filter(len => len < 120 || len > 160).length;
const ruTitleIssues = allRuTitles.filter(len => len < 45 || len > 65).length;
const ruDescIssues = allRuDescs.filter(len => len < 120 || len > 160).length;

console.log(`\n=== ISSUE COUNTS ===`);
console.log(`English title length issues: ${enTitleIssues}/${tools.length}`);
console.log(`English description length issues: ${enDescIssues}/${tools.length}`);
console.log(`Russian title length issues: ${ruTitleIssues}/${tools.length}`);
console.log(`Russian description length issues: ${ruDescIssues}/${tools.length}`);