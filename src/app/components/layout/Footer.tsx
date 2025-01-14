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

  // Split tools into chunks of 8
  const chunkSize = 8;
  const textModificationColumns = Array.from({ length: Math.ceil(textModificationTools.length / chunkSize) }, (_, i) =>
    textModificationTools.slice(i * chunkSize, (i + 1) * chunkSize)
  );

  return (
    <footer className="border-t bg-gray-50/50 dark:bg-gray-950/50">
      <div className="container py-12 px-4">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pb-2 border-b border-gray-200 dark:border-gray-800">
              Text Tools
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link 
                  href="/tools/sentence-case" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1"
                >
                  Sentence Case
                </Link>
              </li>
              <li>
                <Link 
                  href="/tools/title-case" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1"
                >
                  Title Case
                </Link>
              </li>
              <li>
                <Link 
                  href="/tools/uppercase" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1"
                >
                  UPPERCASE
                </Link>
              </li>
              <li>
                <Link 
                  href="/tools/lowercase" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1"
                >
                  lowercase
                </Link>
              </li>
              <li>
                <Link 
                  href="/tools/alternating-case" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1"
                >
                  aLtErNaTiNg cAsE
                </Link>
              </li>
              <li>
                <Link 
                  href="/tools/text-counter" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1"
                >
                  Text Counter
                </Link>
              </li>
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
              Resources
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link 
                  href="/blog" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  href="/docs" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link 
                  href="/api" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1"
                >
                  API
                </Link>
              </li>
              <li>
                <Link 
                  href="/changelog" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1"
                >
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pb-2 border-b border-gray-200 dark:border-gray-800">
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
              <li>
                <Link 
                  href="/sitemap.xml" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1"
                >
                  Sitemap
                </Link>
              </li>
              <li>
                <Link 
                  href="/feed.xml" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1"
                >
                  RSS Feed
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