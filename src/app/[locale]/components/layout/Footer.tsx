'use client';

import Link from 'next/link';

export function Footer() {
  const textModificationTools = [
    { href: "/tools/big-text", label: "Big Text" },
    { href: "/tools/bold-text", label: "Bold Text" },
    { href: "/tools/bubble-text", label: "Bubble Text" },
    { href: "/tools/cursed-text", label: "Cursed Text" },
    { href: "/tools/discord-font", label: "Discord Font" },
    { href: "/tools/duplicate-line-remover", label: "Remove Duplicates" },
    { href: "/tools/facebook-font", label: "Facebook Font" },
    { href: "/tools/instagram-fonts", label: "Instagram Fonts" },
    { href: "/tools/invisible-text", label: "Invisible Text" },
    { href: "/tools/italic-text", label: "Italic Text" },
    { href: "/tools/mirror-text", label: "Mirror Text" },
    { href: "/tools/phonetic-spelling", label: "Phonetic Spelling" },
    { href: "/tools/pig-latin", label: "Pig Latin" },
    { href: "/tools/plain-text", label: "Plain Text" },
    { href: "/tools/remove-line-breaks", label: "Remove Line Breaks" },
    { href: "/tools/remove-text-formatting", label: "Remove Formatting" },
  ];

  const randomGeneratorTools = [
    { href: "/tools/random-choice", label: "Random Choice" },
    { href: "/tools/random-date", label: "Random Date" },
    { href: "/tools/random-ip", label: "Random IP" },
    { href: "/tools/random-letter", label: "Random Letter" },
    { href: "/tools/random-month", label: "Random Month" },
    { href: "/tools/random-number", label: "Random Number" },
    { href: "/tools/password-generator", label: "Password Generator" },
    { href: "/tools/uuid-generator", label: "UUID Generator" },
  ];

  const codeTranslationTools = [
    { href: "/tools/json-stringify", label: "JSON Stringify" },
    { href: "/tools/md5-hash", label: "MD5 Hash" },
    { href: "/tools/morse-code", label: "Morse Code" },
    { href: "/tools/number-sorter", label: "Number Sorter" },
    { href: "/tools/rot13", label: "ROT13" },
    { href: "/tools/slugify-url", label: "Slugify URL" },
    { href: "/tools/utf8-converter", label: "UTF-8 Converter" },
    // fixed: url-encode-decode -> url-converter (existing route)
    { href: "/tools/url-converter", label: "URL Converter" },
    { href: "/tools/utm-builder", label: "UTM Builder" },
  ];

  const basicTools = [
    { href: "/tools/sentence-case", label: "Sentence Case" },
    { href: "/tools/title-case", label: "Title Case" },
    { href: "/tools/uppercase", label: "UPPERCASE" },
    { href: "/tools/lowercase", label: "lowercase" },
    { href: "/tools/alternating-case", label: "aLtErNaTiNg cAsE" },
    { href: "/tools/text-counter", label: "Text Counter" },
  ];

  const miscTools = [
    { href: "/tools/nato-phonetic", label: "NATO Phonetic Alphabet" },
    { href: "/tools/online-notepad", label: "Online Notepad" },
    // fixed: online-sentence-counter -> sentence-counter (existing route)
    { href: "/tools/sentence-counter", label: "Sentence Counter" },
    { href: "/tools/repeat-text", label: "Repeat Text Generator" },
    { href: "/tools/roman-numeral-date", label: "Roman Numeral Date" },
    { href: "/tools/sort-words", label: "Sort Words" },
    // fixed: text-replacement -> text-replace (existing route)
    { href: "/tools/text-replace", label: "Text Replacement" },
    { href: "/tools/word-frequency", label: "Word Frequency Counter" },
  ];

  const imageTools = [
    { href: "/tools/ascii-art-generator", label: "ASCII Art Generator" },
    { href: "/tools/image-to-text", label: "Image to Text" },
    { href: "/tools/image-cropper", label: "Image Cropper" },
    { href: "/tools/image-resizer", label: "Image Resizer" },
    { href: "/tools/jpg-to-png", label: "JPG to PNG" },
    { href: "/tools/jpg-to-webp", label: "JPG to WebP" },
    { href: "/tools/png-to-webp", label: "PNG to WebP" },
    { href: "/tools/webp-to-png", label: "WebP to PNG" }
  ];

  return (
    <footer className="border-t bg-gray-50/50 dark:bg-gray-950/50">
      <div className="container py-12 px-4">
        {/* Top: Brand + brief description for AdSense-friendly spacing */}
        <div className="flex flex-col items-center text-center gap-3 pb-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              Text Case Converter
            </span>
          </Link>
          <p className="max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            Fast, privacy-friendly tools for transforming text, images, and data.
          </p>
        </div>

        {/* Main tools grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          {/* Basic */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Basic Tools
            </h3>
            <ul className="space-y-2.5">
              {basicTools.map((tool) => (
                <li key={tool.href}>
                  <Link
                    href={tool.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                  >
                    {tool.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Text Modification - flowed into two columns on larger screens */}
          <div className="space-y-4 sm:col-span-1 lg:col-span-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Text Modification
            </h3>
            <ul className="space-y-2.5 lg:columns-2 [column-fill:_balance]">
              {textModificationTools.map((tool) => (
                <li key={tool.href} className="break-inside-avoid">
                  <Link
                    href={tool.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                  >
                    {tool.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Random Generators */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Random Generators
            </h3>
            <ul className="space-y-2.5">
              {randomGeneratorTools.map((tool) => (
                <li key={tool.href}>
                  <Link
                    href={tool.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                  >
                    {tool.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Code & Data Tools */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Code & Data Tools
            </h3>
            <ul className="space-y-2.5">
              {codeTranslationTools.map((tool) => (
                <li key={tool.href}>
                  <Link
                    href={tool.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                  >
                    {tool.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Image Tools */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Image Tools
            </h3>
            <ul className="space-y-2.5">
              {imageTools.map((tool) => (
                <li key={tool.href}>
                  <Link
                    href={tool.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                  >
                    {tool.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Misc Tools */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Misc. Tools
            </h3>
            <ul className="space-y-2.5">
              {miscTools.map((tool) => (
                <li key={tool.href}>
                  <Link
                    href={tool.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                  >
                    {tool.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Company / Legal */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 grid gap-8 sm:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Company
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/about-us"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Legal
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            © {new Date().getFullYear()} Text Case Converter. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 