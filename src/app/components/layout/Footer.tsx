'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold mb-3">Text Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/tools/sentence-case" className="text-sm text-muted-foreground hover:text-primary">
                  Sentence Case
                </Link>
              </li>
              <li>
                <Link href="/tools/title-case" className="text-sm text-muted-foreground hover:text-primary">
                  Title Case
                </Link>
              </li>
              <li>
                <Link href="/tools/uppercase" className="text-sm text-muted-foreground hover:text-primary">
                  UPPERCASE
                </Link>
              </li>
              <li>
                <Link href="/tools/lowercase" className="text-sm text-muted-foreground hover:text-primary">
                  lowercase
                </Link>
              </li>
              <li>
                <Link href="/tools/alternating-case" className="text-sm text-muted-foreground hover:text-primary">
                  aLtErNaTiNg cAsE
                </Link>
              </li>
              <li>
                <Link href="/tools/text-counter" className="text-sm text-muted-foreground hover:text-primary">
                  Text Counter
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Text Modification</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/tools/big-text" className="text-sm text-muted-foreground hover:text-primary">
                  Big Text
                </Link>
              </li>
              <li>
                <Link href="/tools/bold-text" className="text-sm text-muted-foreground hover:text-primary">
                  Bold Text
                </Link>
              </li>
              <li>
                <Link href="/tools/bubble-text" className="text-sm text-muted-foreground hover:text-primary">
                  Bubble Text
                </Link>
              </li>
              <li>
                <Link href="/tools/cursed-text" className="text-sm text-muted-foreground hover:text-primary">
                  Cursed Text
                </Link>
              </li>
              <li>
                <Link href="/tools/discord-font" className="text-sm text-muted-foreground hover:text-primary">
                  Discord Font
                </Link>
              </li>
              <li>
                <Link href="/tools/duplicate-line-remover" className="text-sm text-muted-foreground hover:text-primary">
                  Remove Duplicates
                </Link>
              </li>
              <li>
                <Link href="/tools/facebook-font" className="text-sm text-muted-foreground hover:text-primary">
                  Facebook Font
                </Link>
              </li>
              <li>
                <Link href="/tools/instagram-fonts" className="text-sm text-muted-foreground hover:text-primary">
                  Instagram Fonts
                </Link>
              </li>
              <li>
                <Link href="/tools/invisible-text" className="text-sm text-muted-foreground hover:text-primary">
                  Invisible Text
                </Link>
              </li>
              <li>
                <Link href="/tools/italic-text" className="text-sm text-muted-foreground hover:text-primary">
                  Italic Text
                </Link>
              </li>
              <li>
                <Link href="/tools/mirror-text" className="text-sm text-muted-foreground hover:text-primary">
                  Mirror Text
                </Link>
              </li>
              <li>
                <Link href="/tools/phonetic-spelling" className="text-sm text-muted-foreground hover:text-primary">
                  Phonetic Spelling
                </Link>
              </li>
              <li>
                <Link href="/tools/pig-latin" className="text-sm text-muted-foreground hover:text-primary">
                  Pig Latin
                </Link>
              </li>
              <li>
                <Link href="/tools/plain-text" className="text-sm text-muted-foreground hover:text-primary">
                  Plain Text
                </Link>
              </li>
              <li>
                <Link href="/tools/remove-line-breaks" className="text-sm text-muted-foreground hover:text-primary">
                  Remove Line Breaks
                </Link>
              </li>
              <li>
                <Link href="/tools/remove-text-formatting" className="text-sm text-muted-foreground hover:text-primary">
                  Remove Formatting
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-sm text-muted-foreground hover:text-primary">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-sm text-muted-foreground hover:text-primary">
                  API
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-sm text-muted-foreground hover:text-primary">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/sitemap.xml" className="text-sm text-muted-foreground hover:text-primary">
                  Sitemap
                </Link>
              </li>
              <li>
                <Link href="/feed.xml" className="text-sm text-muted-foreground hover:text-primary">
                  RSS Feed
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Text Case Converter. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 