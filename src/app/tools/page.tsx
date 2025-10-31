import { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import { AllToolsPage } from '@/components/pages/AllToolsPage';
import { 
  Type, 
  Palette, 
  Code2, 
  Image as ImageIcon, 
  BarChart3, 
  Settings, 
  Shuffle 
} from 'lucide-react';

// Tool data structure matching the Header navigation
const toolCategories = [
  {
    id: 'convert-case-tools',
    slug: 'convert-case-tools',
    titleKey: 'navigation.convertCaseTools',
    icon: <Type className="h-6 w-6" />,
    tools: [
      { id: 'alternating-case', titleKey: 'navigation.alternatingCase', href: '/tools/alternating-case', icon: '🔄' },
      { id: 'camel-case-converter', titleKey: 'navigation.camelCaseConverter', href: '/tools/camel-case-converter', icon: '🐫' },
      { id: 'kebab-case-converter', titleKey: 'navigation.kebabCaseConverter', href: '/tools/kebab-case-converter', icon: '🔗' },
      { id: 'lowercase', titleKey: 'navigation.lowercase', href: '/tools/lowercase', icon: '🔡', isPopular: true },
      { id: 'sentence-case', titleKey: 'navigation.sentenceCase', href: '/tools/sentence-case', icon: '📝' },
    ]
  },
  {
    id: 'text-modification-formatting',
    slug: 'text-modification-formatting',
    titleKey: 'navigation.textModificationFormatting',
    icon: <Settings className="h-6 w-6" />,
    tools: [
      // Text formatting
      { id: 'bold-text', titleKey: 'navigation.boldText', href: '/tools/bold-text', icon: '𝐁' },
      { id: 'italic-text', titleKey: 'navigation.italicText', href: '/tools/italic-text', icon: '𝘐' },
      { id: 'subscript-text', titleKey: 'navigation.subscriptText', href: '/tools/subscript-text', icon: 'X₂' },
      { id: 'big-text', titleKey: 'navigation.bigText', href: '/tools/big-text', icon: '🔤' },
      { id: 'bubble-text', titleKey: 'navigation.bubbleText', href: '/tools/bubble-text', icon: '🫧' },
      { id: 'cursed-text', titleKey: 'navigation.cursedText', href: '/tools/cursed-text', icon: '👾' },
      { id: 'mirror-text', titleKey: 'navigation.mirrorText', href: '/tools/mirror-text', icon: '🪞' },
      { id: 'invisible-text', titleKey: 'navigation.invisibleText', href: '/tools/invisible-text', icon: '👻' },
      { id: 'repeat-text', titleKey: 'navigation.repeatText', href: '/tools/repeat-text', icon: '🔁' },
      { id: 'text-replace', titleKey: 'navigation.textReplace', href: '/tools/text-replace', icon: '🔄' },
      { id: 'remove-line-breaks', titleKey: 'navigation.removeLineBreaks', href: '/tools/remove-line-breaks', icon: '📄' },
      { id: 'remove-text-formatting', titleKey: 'navigation.removeTextFormatting', href: '/tools/remove-text-formatting', icon: '🧹' },
      { id: 'duplicate-line-remover', titleKey: 'navigation.duplicateLineRemover', href: '/tools/duplicate-line-remover', icon: '🔍' },
      { id: 'sort-words', titleKey: 'navigation.sortWords', href: '/tools/sort-words', icon: '📊' },
      { id: 'plain-text', titleKey: 'navigation.plainText', href: '/tools/plain-text', icon: '📃' },
      { id: 'remove-punctuation', titleKey: 'navigation.removePunctuation', href: '/tools/remove-punctuation', icon: '🧼' },
      { id: 'extract-emails-from-text', titleKey: 'navigation.extractEmailsFromText', href: '/tools/extract-emails-from-text', icon: '📧' },
    ]
  },
  {
    id: 'code-data-translation',
    slug: 'code-data-translation',
    titleKey: 'navigation.codeDataTranslation',
    icon: <Code2 className="h-6 w-6" />,
    tools: [
      { id: 'base64-encoder-decoder', titleKey: 'navigation.base64EncoderDecoder', href: '/tools/base64-encoder-decoder', icon: '🔐', isPopular: true },
      { id: 'binary-code-translator', titleKey: 'navigation.binaryCodeTranslator', href: '/tools/binary-code-translator', icon: '01' },
      { id: 'hex-to-text', titleKey: 'navigation.hexToText', href: '/tools/hex-to-text', icon: '#️⃣' },
      { id: 'morse-code', titleKey: 'navigation.morseCode', href: '/tools/morse-code', icon: '📟' },
      { id: 'caesar-cipher', titleKey: 'navigation.caesarCipher', href: '/tools/caesar-cipher', icon: '🔒' },
      { id: 'rot13', titleKey: 'navigation.rot13', href: '/tools/rot13', icon: '🔄' },
      { id: 'csv-to-json', titleKey: 'navigation.csvToJson', href: '/tools/csv-to-json', icon: '📊' },
      { id: 'json-stringify', titleKey: 'navigation.jsonStringify', href: '/tools/json-stringify', icon: '{ }', isPopular: true },
      { id: 'json-formatter', titleKey: 'navigation.jsonFormatter', href: '/tools/json-formatter', icon: '✨', isPopular: true },
      { id: 'url-converter', titleKey: 'navigation.urlConverter', href: '/tools/url-converter', icon: '🔗' },
      { id: 'utf8-converter', titleKey: 'navigation.utf8Converter', href: '/tools/utf8-converter', icon: '🌐' },
      { id: 'slugify-url', titleKey: 'navigation.slugifyUrl', href: '/tools/slugify-url', icon: '🔗' },
    ]
  },
  {
    id: 'image-tools',
    slug: 'image-tools',
    titleKey: 'navigation.imageTools',
    icon: <ImageIcon className="h-6 w-6" />,
    tools: [
      { id: 'image-cropper', titleKey: 'navigation.imageCropper', href: '/tools/image-cropper', icon: '✂️' },
      { id: 'image-resizer', titleKey: 'navigation.imageResizer', href: '/tools/image-resizer', icon: '📏', isPopular: true },
      { id: 'image-to-text', titleKey: 'navigation.imageToText', href: '/tools/image-to-text', icon: '📝' },
      { id: 'jpg-to-png', titleKey: 'navigation.jpgToPng', href: '/tools/jpg-to-png', icon: '🔄' },
      { id: 'jpg-to-webp', titleKey: 'navigation.jpgToWebp', href: '/tools/jpg-to-webp', icon: '🔄' },
      { id: 'png-to-jpg', titleKey: 'navigation.pngToJpg', href: '/tools/png-to-jpg', icon: '🔄' },
      { id: 'png-to-webp', titleKey: 'navigation.pngToWebp', href: '/tools/png-to-webp', icon: '🔄' },
      { id: 'webp-to-jpg', titleKey: 'navigation.webpToJpg', href: '/tools/webp-to-jpg', icon: '🔄' },
      { id: 'webp-to-png', titleKey: 'navigation.webpToPng', href: '/tools/webp-to-png', icon: '🔄' },
    ]
  },
  {
    id: 'random-generators',
    slug: 'random-generators',
    titleKey: 'navigation.randomGenerators',
    icon: <Shuffle className="h-6 w-6" />,
    tools: [
      { id: 'random-number', titleKey: 'navigation.randomNumber', href: '/tools/random-number', icon: '🎲' },
      { id: 'random-letter', titleKey: 'navigation.randomLetter', href: '/tools/random-letter', icon: '🔤' },
      { id: 'random-date', titleKey: 'navigation.randomDate', href: '/tools/random-date', icon: '📅' },
      { id: 'random-month', titleKey: 'navigation.randomMonth', href: '/tools/random-month', icon: '🗓️' },
      { id: 'random-ip', titleKey: 'navigation.randomIP', href: '/tools/random-ip', icon: '🌐' },
      { id: 'random-choice', titleKey: 'navigation.randomChoice', href: '/tools/random-choice', icon: '🎯' },
      { id: 'password-generator', titleKey: 'navigation.passwordGenerator', href: '/tools/password-generator', icon: '🔑', isPopular: true },
      { id: 'uuid-generator', titleKey: 'navigation.uuidGenerator', href: '/tools/uuid-generator', icon: '🆔' }
    ]
  },
  {
    id: 'analysis-counter-tools',
    slug: 'analysis-counter-tools',
    titleKey: 'navigation.analysisCounterTools',
    icon: <BarChart3 className="h-6 w-6" />,
    tools: [
      { id: 'text-counter', titleKey: 'navigation.textCounter', href: '/tools/text-counter', icon: '📊', isPopular: true },
      { id: 'sentence-counter', titleKey: 'navigation.sentenceCounter', href: '/tools/sentence-counter', icon: '📝' },
      { id: 'word-frequency', titleKey: 'navigation.wordFrequency', href: '/tools/word-frequency', icon: '📈' },
      { id: 'extract-numbers', titleKey: 'navigation.extractNumbers', href: '/tools/extract-numbers', icon: '🔢' },
    ]
  },
  {
    id: 'social-media-text-generators',
    slug: 'social-media-text-generators',
    titleKey: 'navigation.socialMediaTextGenerators',
    icon: <Palette className="h-6 w-6" />,
    tools: [
      { id: 'instagram-fonts', titleKey: 'navigation.instagramFonts', href: '/tools/instagram-fonts', icon: '📸', isPopular: true },
      { id: 'facebook-font', titleKey: 'navigation.facebookFont', href: '/tools/facebook-font', icon: '👤' },
      { id: 'discord-font', titleKey: 'navigation.discordFont', href: '/tools/discord-font', icon: '💬' },
    ]
  },
  {
    id: 'misc-tools',
    slug: 'misc-tools',
    titleKey: 'navigation.miscellaneousTools',
    icon: <Settings className="h-6 w-6" />,
    tools: [
      { id: 'online-notepad', titleKey: 'navigation.onlineNotepad', href: '/tools/online-notepad', icon: '📝' },
      { id: 'number-sorter', titleKey: 'navigation.numberSorter', href: '/tools/number-sorter', icon: '🔢' },
      { id: 'ascii-art-generator', titleKey: 'navigation.asciiArtGenerator', href: '/tools/ascii-art-generator', icon: '🎨' },
      { id: 'nato-phonetic', titleKey: 'navigation.natoPhonetic', href: '/tools/nato-phonetic', icon: '✈️' },
      { id: 'md5-hash', titleKey: 'navigation.md5Hash', href: '/tools/md5-hash', icon: '#️⃣' },
      { id: 'phonetic-spelling', titleKey: 'navigation.phoneticSpelling', href: '/tools/phonetic-spelling', icon: '🔤' },
      { id: 'pig-latin', titleKey: 'navigation.pigLatin', href: '/tools/pig-latin', icon: '🐷' },
      { id: 'roman-numeral-date', titleKey: 'navigation.romanNumeralDate', href: '/tools/roman-numeral-date', icon: '🏛️' },
      { id: 'utm-builder', titleKey: 'navigation.utmBuilder', href: '/tools/utm-builder', icon: '🔗' },
    ]
  }
];

// (Count available via categories if needed; removed to satisfy linter)

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata('tools', { locale: 'en', pathname: '/tools' });
}

export default function AllToolsPageRoute() {
  return <AllToolsPage categories={toolCategories} />;
}