'use client';

import Link from 'next/link';

export function Footer() {
  const footerSections = [
    {
      title: 'Case Conversion',
      tools: [
        { href: '/tools/sentence-case', label: 'Sentence Case' },
        { href: '/tools/title-case', label: 'Title Case' },
        { href: '/tools/uppercase', label: 'UPPERCASE' },
        { href: '/tools/lowercase', label: 'lowercase' },
        { href: '/tools/alternating-case', label: 'aLtErNaTiNg cAsE' },
        { href: '/tools/text-counter', label: 'Text Counter' },
      ],
    },
    {
      title: 'Text Formatting',
      tools: [
        { href: '/tools/big-text', label: 'Big Text' },
        { href: '/tools/bold-text', label: 'Bold Text' },
        { href: '/tools/italic-text', label: 'Italic Text' },
        { href: '/tools/bubble-text', label: 'Bubble Text' },
        { href: '/tools/mirror-text', label: 'Mirror Text' },
        { href: '/tools/cursed-text', label: 'Cursed Text' },
        { href: '/tools/invisible-text', label: 'Invisible Text' },
        { href: '/tools/plain-text', label: 'Plain Text' },
      ],
    },
    {
      title: 'Social Fonts',
      tools: [
        { href: '/tools/discord-font', label: 'Discord Font' },
        { href: '/tools/facebook-font', label: 'Facebook Font' },
        { href: '/tools/instagram-fonts', label: 'Instagram Fonts' },
      ],
    },
    {
      title: 'Text Utilities',
      tools: [
        { href: '/tools/duplicate-line-remover', label: 'Remove Duplicates' },
        { href: '/tools/remove-line-breaks', label: 'Remove Line Breaks' },
        { href: '/tools/remove-text-formatting', label: 'Remove Formatting' },
        { href: '/tools/text-replacement', label: 'Text Replacement' },
        { href: '/tools/repeat-text', label: 'Repeat Text' },
        { href: '/tools/sort-words', label: 'Sort Words' },
      ],
    },
    {
      title: 'Generators',
      tools: [
        { href: '/tools/password-generator', label: 'Password Generator' },
        { href: '/tools/uuid-generator', label: 'UUID Generator' },
        { href: '/tools/random-choice', label: 'Random Choice' },
        { href: '/tools/random-number', label: 'Random Number' },
        { href: '/tools/random-letter', label: 'Random Letter' },
        { href: '/tools/random-date', label: 'Random Date' },
      ],
    },
    {
      title: 'Code & Data',
      tools: [
        { href: '/tools/json-stringify', label: 'JSON Stringify' },
        { href: '/tools/url-encode-decode', label: 'URL Encode/Decode' },
        { href: '/tools/md5-hash', label: 'MD5 Hash' },
        { href: '/tools/rot13', label: 'ROT13' },
        { href: '/tools/morse-code', label: 'Morse Code' },
        { href: '/tools/utf8-converter', label: 'UTF-8 Converter' },
      ],
    },
  ];

  return (
    <footer className="bg-background border-t border-border">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16">
        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8 mb-12">
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground relative">
                {section.title}
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-primary rounded-full"></div>
              </h3>
              <ul className="space-y-3">
                {section.tools.map(tool => (
                  <li key={tool.href}>
                    <Link
                      href={tool.href}
                      className="group text-sm text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors duration-200"></span>
                      {tool.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Secondary Links */}
        <div className="border-t border-border pt-12 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-foreground relative">
                Company
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-primary rounded-full"></div>
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about-us"
                    className="group text-sm text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors duration-200"></span>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact-us"
                    className="group text-sm text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors duration-200"></span>
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-foreground relative">
                Legal
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-primary rounded-full"></div>
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/privacy-policy"
                    className="group text-sm text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors duration-200"></span>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="group text-sm text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors duration-200"></span>
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-foreground relative">
                Image Tools
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-primary rounded-full"></div>
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/tools/ascii-art-generator"
                    className="group text-sm text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors duration-200"></span>
                    ASCII Art Generator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/image-to-text"
                    className="group text-sm text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors duration-200"></span>
                    Image to Text
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/image-resizer"
                    className="group text-sm text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors duration-200"></span>
                    Image Resizer
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-foreground relative">
                Miscellaneous
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-primary rounded-full"></div>
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/tools/nato-phonetic"
                    className="group text-sm text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors duration-200"></span>
                    NATO Phonetic
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/online-notepad"
                    className="group text-sm text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors duration-200"></span>
                    Online Notepad
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/word-frequency"
                    className="group text-sm text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors duration-200"></span>
                    Word Frequency
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Text Case Converter. All rights
              reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-sm text-muted-foreground">
                Made with ❤️ for developers
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
