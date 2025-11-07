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

// Tool data structure matching the Header navigation (German locale)
const toolCategories = [
  {
    id: 'convert-case-tools',
    slug: 'convert-case-tools',
    titleKey: 'navigation.convertCaseTools',
    icon: <Type className="h-6 w-6" />,
    tools: [
      { id: 'alternating-case', titleKey: 'navigation.alternatingCase', href: '/de/tools/alternating-case', icon: '🔄' },
      { id: 'camel-case-converter', titleKey: 'navigation.camelCaseConverter', href: '/de/tools/camel-case-converter', icon: '🐫' },
      { id: 'kebab-case-converter', titleKey: 'navigation.kebabCaseConverter', href: '/de/tools/kebab-case-converter', icon: '🔗' },
      { id: 'lowercase', titleKey: 'navigation.lowercase', href: '/de/tools/lowercase', icon: '🔡', isPopular: true },
      { id: 'sentence-case', titleKey: 'navigation.sentenceCase', href: '/de/tools/sentence-case', icon: '📝' },
      { id: 'snake-case-converter', titleKey: 'navigation.snakeCaseConverter', href: '/de/tools/snake-case-converter', icon: '🐍' },
      { id: 'title-case', titleKey: 'navigation.titleCase', href: '/de/tools/title-case', icon: '📰' },
      { id: 'uppercase', titleKey: 'navigation.uppercase', href: '/de/tools/uppercase', icon: '🔠' },
    ]
  },
  {
    id: 'text-modification-formatting',
    slug: 'text-modification-formatting',
    titleKey: 'navigation.textModificationFormatting',
    icon: <Settings className="h-6 w-6" />,
    tools: [
      // Text formatting
      { id: 'bold-text', titleKey: 'navigation.boldText', href: '/de/tools/bold-text', icon: '𝐁' },
      { id: 'italic-text', titleKey: 'navigation.italicText', href: '/de/tools/italic-text', icon: '𝘐' },
      { id: 'subscript-text', titleKey: 'navigation.subscriptText', href: '/de/tools/subscript-text', icon: 'X₂' },
      { id: 'superscript-text', titleKey: 'navigation.superscriptText', href: '/de/tools/superscript-text', icon: 'X²' },
      { id: 'strikethrough-text', titleKey: 'navigation.strikethroughText', href: '/de/tools/strikethrough-text', icon: 'S̶' },
      { id: 'underline-text', titleKey: 'navigation.underlineText', href: '/de/tools/underline-text', icon: 'U̲' },
      { id: 'big-text', titleKey: 'navigation.bigText', href: '/de/tools/big-text', icon: '🔤' },
      { id: 'small-caps', titleKey: 'navigation.smallCaps', href: '/de/tools/small-caps', icon: 'ᴀʙᴄ' },
      { id: 'bubble-text', titleKey: 'navigation.bubbleText', href: '/de/tools/bubble-text', icon: '🫧' },
      { id: 'cursed-text', titleKey: 'navigation.cursedText', href: '/de/tools/cursed-text', icon: '👾' },
      { id: 'mirror-text', titleKey: 'navigation.mirrorText', href: '/de/tools/mirror-text', icon: '🪞' },
      { id: 'upside-down-text', titleKey: 'navigation.upsideDownText', href: '/de/tools/upside-down-text', icon: '🙃' },
      { id: 'invisible-text', titleKey: 'navigation.invisibleText', href: '/de/tools/invisible-text', icon: '👻' },
      { id: 'wide-text', titleKey: 'navigation.wideText', href: '/de/tools/wide-text', icon: '全角' },
      { id: 'repeat-text', titleKey: 'navigation.repeatText', href: '/de/tools/repeat-text', icon: '🔁' },
      { id: 'text-replace', titleKey: 'navigation.textReplace', href: '/de/tools/text-replace', icon: '🔄' },
      { id: 'reverse-text', titleKey: 'navigation.reverseText', href: '/de/tools/reverse-text', icon: '◀️' },
      { id: 'remove-line-breaks', titleKey: 'navigation.removeLineBreaks', href: '/de/tools/remove-line-breaks', icon: '📄' },
      { id: 'remove-text-formatting', titleKey: 'navigation.removeTextFormatting', href: '/de/tools/remove-text-formatting', icon: '🧹' },
      { id: 'duplicate-line-remover', titleKey: 'navigation.duplicateLineRemover', href: '/de/tools/duplicate-line-remover', icon: '🔍' },
      { id: 'sort-lines', titleKey: 'navigation.sortLines', href: '/de/tools/sort-lines', icon: '↕️' },
      { id: 'sort-words', titleKey: 'navigation.sortWords', href: '/de/tools/sort-words', icon: '📊' },
      { id: 'plain-text', titleKey: 'navigation.plainText', href: '/de/tools/plain-text', icon: '📃' },
      { id: 'remove-punctuation', titleKey: 'navigation.removePunctuation', href: '/de/tools/remove-punctuation', icon: '🧼' },
      { id: 'extract-emails-from-text', titleKey: 'navigation.extractEmailsFromText', href: '/de/tools/extract-emails-from-text', icon: '📧' },
      { id: 'extract-emails-from-pdf', titleKey: 'navigation.extractEmailsFromPdf', href: '/de/tools/extract-emails-from-pdf', icon: '📄' },
      { id: 'add-line-numbers-to-text', titleKey: 'navigation.addLineNumbers', href: '/de/tools/add-line-numbers-to-text', icon: '🔢' },
      { id: 'add-prefix-and-suffix-to-lines', titleKey: 'navigation.addPrefixSuffix', href: '/de/tools/add-prefix-and-suffix-to-lines', icon: '🔗' },
    ]
  },
  {
    id: 'code-data-translation',
    slug: 'code-data-translation',
    titleKey: 'navigation.codeDataTranslation',
    icon: <Code2 className="h-6 w-6" />,
    tools: [
      { id: 'base64-encoder-decoder', titleKey: 'navigation.base64EncoderDecoder', href: '/de/tools/base64-encoder-decoder', icon: '🔐', isPopular: true },
      { id: 'binary-code-translator', titleKey: 'navigation.binaryCodeTranslator', href: '/de/tools/binary-code-translator', icon: '01' },
      { id: 'hex-to-text', titleKey: 'navigation.hexToText', href: '/de/tools/hex-to-text', icon: '#️⃣' },
      { id: 'morse-code', titleKey: 'navigation.morseCode', href: '/de/tools/morse-code', icon: '📟' },
      { id: 'caesar-cipher', titleKey: 'navigation.caesarCipher', href: '/de/tools/caesar-cipher', icon: '🔒' },
      { id: 'rot13', titleKey: 'navigation.rot13', href: '/de/tools/rot13', icon: '🔄' },
      { id: 'csv-to-json', titleKey: 'navigation.csvToJson', href: '/de/tools/csv-to-json', icon: '📊' },
      { id: 'json-stringify', titleKey: 'navigation.jsonStringify', href: '/de/tools/json-stringify', icon: '{ }', isPopular: true },
      { id: 'json-formatter', titleKey: 'navigation.jsonFormatter', href: '/de/tools/json-formatter', icon: '✨', isPopular: true },
      { id: 'url-converter', titleKey: 'navigation.urlConverter', href: '/de/tools/url-converter', icon: '🔗' },
      { id: 'utf8-converter', titleKey: 'navigation.utf8Converter', href: '/de/tools/utf8-converter', icon: '🌐' },
      { id: 'slugify-url', titleKey: 'navigation.slugifyUrl', href: '/de/tools/slugify-url', icon: '🔗' },
    ]
  },
  {
    id: 'image-tools',
    slug: 'image-tools',
    titleKey: 'navigation.imageTools',
    icon: <ImageIcon className="h-6 w-6" />,
    tools: [
      { id: 'image-cropper', titleKey: 'navigation.imageCropper', href: '/de/tools/image-cropper', icon: '✂️' },
      { id: 'image-resizer', titleKey: 'navigation.imageResizer', href: '/de/tools/image-resizer', icon: '📏', isPopular: true },
      { id: 'image-to-text', titleKey: 'navigation.imageToText', href: '/de/tools/image-to-text', icon: '📝' },
      { id: 'jpg-to-png', titleKey: 'navigation.jpgToPng', href: '/de/tools/jpg-to-png', icon: '🔄' },
      { id: 'jpg-to-webp', titleKey: 'navigation.jpgToWebp', href: '/de/tools/jpg-to-webp', icon: '🔄' },
      { id: 'png-to-jpg', titleKey: 'navigation.pngToJpg', href: '/de/tools/png-to-jpg', icon: '🔄' },
      { id: 'png-to-webp', titleKey: 'navigation.pngToWebp', href: '/de/tools/png-to-webp', icon: '🔄' },
      { id: 'webp-to-jpg', titleKey: 'navigation.webpToJpg', href: '/de/tools/webp-to-jpg', icon: '🔄' },
      { id: 'webp-to-png', titleKey: 'navigation.webpToPng', href: '/de/tools/webp-to-png', icon: '🔄' },
    ]
  },
  {
    id: 'random-generators',
    slug: 'random-generators',
    titleKey: 'navigation.randomGenerators',
    icon: <Shuffle className="h-6 w-6" />,
    tools: [
      { id: 'random-number', titleKey: 'navigation.randomNumber', href: '/de/tools/random-number', icon: '🎲' },
      { id: 'random-letter', titleKey: 'navigation.randomLetter', href: '/de/tools/random-letter', icon: '🔤' },
      { id: 'random-date', titleKey: 'navigation.randomDate', href: '/de/tools/random-date', icon: '📅' },
      { id: 'random-month', titleKey: 'navigation.randomMonth', href: '/de/tools/random-month', icon: '🗓️' },
      { id: 'random-ip', titleKey: 'navigation.randomIP', href: '/de/tools/random-ip', icon: '🌐' },
      { id: 'random-choice', titleKey: 'navigation.randomChoice', href: '/de/tools/random-choice', icon: '🎯' },
      { id: 'password-generator', titleKey: 'navigation.passwordGenerator', href: '/de/tools/password-generator', icon: '🔑', isPopular: true },
      { id: 'uuid-generator', titleKey: 'navigation.uuidGenerator', href: '/de/tools/uuid-generator', icon: '🆔' }
    ]
  },
  {
    id: 'analysis-counter-tools',
    slug: 'analysis-counter-tools',
    titleKey: 'navigation.analysisCounterTools',
    icon: <BarChart3 className="h-6 w-6" />,
    tools: [
      { id: 'text-counter', titleKey: 'navigation.textCounter', href: '/de/tools/text-counter', icon: '📊', isPopular: true },
      { id: 'sentence-counter', titleKey: 'navigation.sentenceCounter', href: '/de/tools/sentence-counter', icon: '📝' },
      { id: 'word-frequency', titleKey: 'navigation.wordFrequency', href: '/de/tools/word-frequency', icon: '📈' },
      { id: 'extract-numbers', titleKey: 'navigation.extractNumbers', href: '/de/tools/extract-numbers', icon: '🔢' },
      { id: 'reading-time-estimator', titleKey: 'navigation.readingTimeEstimator', href: '/de/tools/reading-time-estimator', icon: '⏱️' },
    ]
  },
  {
    id: 'social-media-text-generators',
    slug: 'social-media-text-generators',
    titleKey: 'navigation.socialMediaTextGenerators',
    icon: <Palette className="h-6 w-6" />,
    tools: [
      { id: 'instagram-fonts', titleKey: 'navigation.instagramFonts', href: '/de/tools/instagram-fonts', icon: '📸', isPopular: true },
      { id: 'facebook-font', titleKey: 'navigation.facebookFont', href: '/de/tools/facebook-font', icon: '👤' },
      { id: 'discord-font', titleKey: 'navigation.discordFont', href: '/de/tools/discord-font', icon: '💬' },
    ]
  },
  {
    id: 'misc-tools',
    slug: 'misc-tools',
    titleKey: 'navigation.miscellaneousTools',
    icon: <Settings className="h-6 w-6" />,
    tools: [
      { id: 'online-notepad', titleKey: 'navigation.onlineNotepad', href: '/de/tools/online-notepad', icon: '📝' },
      { id: 'number-sorter', titleKey: 'navigation.numberSorter', href: '/de/tools/number-sorter', icon: '🔢' },
      { id: 'ascii-art-generator', titleKey: 'navigation.asciiArtGenerator', href: '/de/tools/ascii-art-generator', icon: '🎨' },
      { id: 'nato-phonetic', titleKey: 'navigation.natoPhonetic', href: '/de/tools/nato-phonetic', icon: '✈️' },
      { id: 'md5-hash', titleKey: 'navigation.md5Hash', href: '/de/tools/md5-hash', icon: '#️⃣' },
      { id: 'sha1-hash-generator', titleKey: 'navigation.sha1HashGenerator', href: '/de/tools/sha1-hash-generator', icon: '🔐' },
      { id: 'phonetic-spelling', titleKey: 'navigation.phoneticSpelling', href: '/de/tools/phonetic-spelling', icon: '🔤' },
      { id: 'pig-latin', titleKey: 'navigation.pigLatin', href: '/de/tools/pig-latin', icon: '🐷' },
      { id: 'roman-numeral-date', titleKey: 'navigation.romanNumeralDate', href: '/de/tools/roman-numeral-date', icon: '🏛️' },
      { id: 'utm-builder', titleKey: 'navigation.utmBuilder', href: '/de/tools/utm-builder', icon: '🔗' },
    ]
  }
];

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata('tools', { locale: 'de', pathname: '/de/tools' });
}

export default function AllToolsPageRoute() {
  return <AllToolsPage categories={toolCategories} />;
}
