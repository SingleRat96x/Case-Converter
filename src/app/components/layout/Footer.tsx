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
    { href: "/tools/url-encode-decode", label: "URL Encode/Decode" },
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

  // Split tools into chunks of 8
  const chunkSize = 8;
  const textModificationColumns = Array.from({ length: Math.ceil(textModificationTools.length / chunkSize) }, (_, i) =>
    textModificationTools.slice(i * chunkSize, (i + 1) * chunkSize)
  );

  return (
    <footer className="border-t bg-gray-50/50 dark:bg-gray-950/50">
      <div className="container py-12 px-4">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pb-2 border-b border-gray-200 dark:border-gray-800">
              Basic Tools
            </h3>
            <ul className="space-y-2.5">
              {basicTools.map((tool) => (
                <li key={tool.href}>
                  <Link 
                    href={tool.href} 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1"
                  >
                    {tool.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pb-2 border-b border-gray-200 dark:border-gray-800 text-center">
              Text Modification
            </h3>
            <div className="grid grid-cols-2 gap-8">
              {textModificationColumns.map((column, columnIndex) => (
                <ul key={columnIndex} className="space-y-2.5">
                  {column.map((tool) => (
                    <li key={tool.href}>
                      <Link 
                        href={tool.href} 
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1"
                      >
                        {tool.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pb-2 border-b border-gray-200 dark:border-gray-800">
              Random Generators
            </h3>
            <ul className="space-y-2.5">
              {randomGeneratorTools.map((tool) => (
                <li key={tool.href}>
                  <Link 
                    href={tool.href} 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1"
                  >
                    {tool.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pb-2 border-b border-gray-200 dark:border-gray-800">
              Code & Data Tools
            </h3>
            <ul className="space-y-2.5">
              {codeTranslationTools.map((tool) => (
                <li key={tool.href}>
                  <Link 
                    href={tool.href} 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1"
                  >
                    {tool.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Company
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link 
                    href="/about" 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/contact" 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Legal
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link 
                    href="/privacy" 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/terms" 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
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