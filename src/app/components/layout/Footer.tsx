'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Special Text</h3>
            <ul className="space-y-2">
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
                <Link href="/tools/invisible-text" className="text-sm text-muted-foreground hover:text-primary">
                  Invisible Text
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Case Converter. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 