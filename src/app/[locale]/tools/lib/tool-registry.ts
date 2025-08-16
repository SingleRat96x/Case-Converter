import { ComponentType, lazy } from 'react';

// Define the interface for tool components
export interface ToolComponentProps {
  // Add any common props that all tools might need
}

// Type for the dynamic component loader
type ComponentLoader = () => Promise<{
  default: ComponentType<ToolComponentProps>;
}>;

// Registry of tool components with dynamic imports
export const toolRegistry: Record<string, ComponentLoader> = {
  // Step 1 tools (Case converters & basic text tools)
  uppercase: () => import('../components/UppercaseConverter'),
  lowercase: () => import('../components/LowercaseConverter'),
  'title-case': () => import('../components/TitleCaseConverter'),
  'sentence-case': () => import('../components/SentenceCaseConverter'),
  'alternating-case': () => import('../components/AlternatingCaseConverter'),
  'text-counter': () => import('../components/TextCounter'),
  'bold-text': () => import('../components/BoldTextConverter'),
  'italic-text': () => import('../components/ItalicTextConverter'),

  // Step 2 tools (Text formatting tools)
  'plain-text': () => import('../components/PlainTextConverter'),
  'remove-text-formatting': () =>
    import('../components/RemoveTextFormattingConverter'),
  'remove-line-breaks': () => import('../components/RemoveLineBreaksConverter'),
  'repeat-text': () => import('../components/RepeatTextConverter'),
  'mirror-text': () => import('../components/MirrorTextConverter'),
  'invisible-text': () => import('../components/InvisibleTextConverter'),
  'subscript-text': () => import('../components/SubscriptTextConverter'),
  'bubble-text': () => import('../components/BubbleTextConverter'),

  // Step 3 tools (Text Analysis Tools)
  'sentence-counter': () => import('../components/SentenceCounter'),
  'word-frequency': () => import('../components/WordFrequencyConverter'),
  'duplicate-line-remover': () =>
    import('../components/DuplicateLineRemoverConverter'),
  'sort-words': () => import('../components/SortWordsConverter'),
  'text-replace': () => import('../components/TextReplaceConverter'),
  'slugify-url': () => import('../components/SlugifyUrlConverter'),
  'number-sorter': () => import('../components/NumberSorterConverter'),
  'json-stringify': () => import('../components/JsonStringifyConverter'),

  // Step 4 tools (Encoding/Decoding Tools)
  'base64-encoder-decoder': () =>
    import('../components/Base64EncoderDecoderConverter'),
  'binary-code-translator': () =>
    import('../components/BinaryCodeTranslatorConverter'),
  'hex-to-text': () => import('../components/HexToTextConverter'),
  'utf8-converter': () => import('../components/Utf8Converter'),
  'url-converter': () => import('../components/UrlConverter'),
  'md5-hash': () => import('../components/Md5HashConverter'),
  'caesar-cipher': () => import('../components/CaesarCipherConverter'),
  rot13: () => import('../components/Rot13Converter'),

  // Step 5 tools (Generator Tools)
  'uuid-generator': () => import('../components/UuidGeneratorConverter'),
  'password-generator': () =>
    import('../components/PasswordGeneratorConverter'),
  'random-number': () => import('../components/RandomNumberGeneratorConverter'),
  'random-choice': () => import('../components/RandomChoiceConverter'),
  'random-letter': () => import('../components/RandomLetterGeneratorConverter'),
  'random-date': () => import('../components/RandomDateGeneratorConverter'),
  'random-month': () => import('../components/RandomMonthGeneratorConverter'),
  'random-ip': () => import('../components/RandomIpGeneratorConverter'),

  // Step 6 tools (Text Manipulation Tools)
  'morse-code': () => import('../components/MorseCodeConverter'),
  'pig-latin': () => import('../components/PigLatinConverter'),
  'nato-phonetic': () => import('../components/NatoPhoneticConverter'),
  'phonetic-spelling': () => import('../components/PhoneticSpellingConverter'),
  'cursed-text': () => import('../components/CursedTextConverter'),
  'big-text': () => import('../components/BigTextConverter'),
  'ascii-art-generator': () =>
    import('../components/AsciiArtGeneratorConverter'),
  'instagram-fonts': () => import('../components/InstagramFontsConverter'),

  // Step 7 tools (File Processing Tools)
  'csv-to-json': () => import('../components/CsvToJsonConverter'),
  'utm-builder': () => import('../components/UtmBuilderConverter'),
  'roman-numeral-date': () => import('../components/RomanNumeralDateConverter'),
  'online-notepad': () => import('../components/OnlineNotepadConverter'),
  'facebook-font': () => import('../components/FacebookFontConverter'),
  'discord-font': () => import('../components/DiscordFontConverter'),
  'image-to-text': () => import('../components/ImageToTextConverter'),
  'image-resizer': () => import('../components/ImageResizerConverter'),

  // Step 8 tools (Image Conversion Tools)
  'webp-to-png': () => import('../components/WebpToPngConverter'),
  'webp-to-jpg': () => import('../components/WebpToJpgConverter'),
  'png-to-jpg': () => import('../components/PngToJpgConverter'),
  'png-to-webp': () => import('../components/PngToWebpConverter'),
  'jpg-to-webp': () => import('../components/JpgToWebpConverter'),
  'jpg-to-png': () => import('../components/JpgToPngConverter'),
  'image-cropper': () => import('../components/ImageCropperConverter'),
};

// Function to get a lazy-loaded component
export function getToolComponent(toolId: string) {
  const componentLoader = toolRegistry[toolId];

  if (!componentLoader) {
    return null;
  }

  return lazy(componentLoader);
}

// Function to check if a tool exists in the registry
export function isToolRegistered(toolId: string): boolean {
  return toolId in toolRegistry;
}

// Get all registered tool IDs
export function getRegisteredToolIds(): string[] {
  return Object.keys(toolRegistry);
}
