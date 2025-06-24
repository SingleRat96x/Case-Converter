'use client';

import { useState } from 'react';
import { Copy, RefreshCw, MessageSquare } from 'lucide-react';

const discordStyles = {
  bold: {
    name: 'Bold',
    syntax: '**text**',
    description: 'Makes text bold',
    transform: (text: string) => `**${text}**`,
  },
  italic: {
    name: 'Italic',
    syntax: '*text*',
    description: 'Makes text italic',
    transform: (text: string) => `*${text}*`,
  },
  underline: {
    name: 'Underline',
    syntax: '__text__',
    description: 'Underlines text',
    transform: (text: string) => `__${text}__`,
  },
  strikethrough: {
    name: 'Strikethrough',
    syntax: '~~text~~',
    description: 'Strikes through text',
    transform: (text: string) => `~~${text}~~`,
  },
  code: {
    name: 'Code',
    syntax: '`text`',
    description: 'Monospace code formatting',
    transform: (text: string) => `\`${text}\``,
  },
  'code-block': {
    name: 'Code Block',
    syntax: '```text```',
    description: 'Multi-line code block',
    transform: (text: string) => `\`\`\`\n${text}\n\`\`\``,
  },
  spoiler: {
    name: 'Spoiler',
    syntax: '||text||',
    description: 'Hidden spoiler text',
    transform: (text: string) => `||${text}||`,
  },
  quote: {
    name: 'Quote',
    syntax: '> text',
    description: 'Quote formatting',
    transform: (text: string) =>
      text
        .split('\n')
        .map(line => `> ${line}`)
        .join('\n'),
  },
  'block-quote': {
    name: 'Block Quote',
    syntax: '>>> text',
    description: 'Multi-line quote block',
    transform: (text: string) => `>>> ${text}`,
  },
};

const unicodeStyles = {
  'bold-unicode': {
    name: 'Bold Unicode',
    description: 'Unicode bold characters',
    transform: (text: string) =>
      text.replace(/[a-zA-Z0-9]/g, char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90)
          return String.fromCharCode(code - 65 + 0x1d400); // Bold A-Z
        if (code >= 97 && code <= 122)
          return String.fromCharCode(code - 97 + 0x1d41a); // Bold a-z
        if (code >= 48 && code <= 57)
          return String.fromCharCode(code - 48 + 0x1d7ce); // Bold 0-9
        return char;
      }),
  },
  'italic-unicode': {
    name: 'Italic Unicode',
    description: 'Unicode italic characters',
    transform: (text: string) =>
      text.replace(/[a-zA-Z]/g, char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90)
          return String.fromCharCode(code - 65 + 0x1d434); // Italic A-Z
        if (code >= 97 && code <= 122)
          return String.fromCharCode(code - 97 + 0x1d44e); // Italic a-z
        return char;
      }),
  },
  'monospace-unicode': {
    name: 'Monospace Unicode',
    description: 'Unicode monospace characters',
    transform: (text: string) =>
      text.replace(/[a-zA-Z0-9]/g, char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90)
          return String.fromCharCode(code - 65 + 0x1d670); // Monospace A-Z
        if (code >= 97 && code <= 122)
          return String.fromCharCode(code - 97 + 0x1d68a); // Monospace a-z
        if (code >= 48 && code <= 57)
          return String.fromCharCode(code - 48 + 0x1d7f6); // Monospace 0-9
        return char;
      }),
  },
};

export default function DiscordFontConverter() {
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'markdown' | 'unicode'>(
    'markdown'
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleClear = () => {
    setInput('');
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          Discord Text Formatter
        </h2>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
          Enter your text
        </label>
        <textarea
          className="w-full min-h-[100px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
          placeholder="Type your Discord message here..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('markdown')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'markdown'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Discord Markdown
        </button>
        <button
          onClick={() => setActiveTab('unicode')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'unicode'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Unicode Styles
        </button>
      </div>

      {/* Content */}
      {input && (
        <div className="space-y-3">
          {activeTab === 'markdown' ? (
            <>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">
                Discord Markdown Formatting:
              </h3>
              <div className="grid gap-3">
                {Object.entries(discordStyles).map(([key, style]) => {
                  const formattedText = style.transform(input);
                  return (
                    <div
                      key={key}
                      className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {style.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Syntax:{' '}
                            <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                              {style.syntax}
                            </code>
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopy(formattedText)}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-medium transition-colors inline-flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </button>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-800 rounded border font-mono text-sm text-gray-900 dark:text-gray-100 min-h-[40px] break-words whitespace-pre-wrap">
                        {formattedText}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">
                Unicode Font Styles:
              </h3>
              <div className="grid gap-3">
                {Object.entries(unicodeStyles).map(([key, style]) => {
                  const styledText = style.transform(input);
                  return (
                    <div
                      key={key}
                      className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {style.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {style.description}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopy(styledText)}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-medium transition-colors inline-flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </button>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-800 rounded border font-display text-lg text-gray-900 dark:text-gray-100 min-h-[40px] break-words">
                        {styledText}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Guide */}
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
          {activeTab === 'markdown'
            ? 'Discord Markdown Guide'
            : 'Unicode Font Guide'}
        </h3>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          {activeTab === 'markdown' ? (
            <>
              <div>• Use Discord's built-in markdown syntax for formatting</div>
              <div>• These formats work in Discord messages and embeds</div>
              <div>
                • Combine multiple formats: ***bold italic*** or __**bold
                underline**__
              </div>
              <div>
                • Code blocks support syntax highlighting with language names
              </div>
            </>
          ) : (
            <>
              <div>• Unicode fonts work in Discord and other platforms</div>
              <div>
                • These bypass Discord's markdown and appear as styled text
              </div>
              <div>
                • Perfect for nicknames, status messages, and bot responses
              </div>
              <div>• Compatible with most devices and operating systems</div>
            </>
          )}
        </div>
      </div>

      {/* Example */}
      {!input && (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
            Example
          </h3>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <div>Input: "Hello Discord!"</div>
            <div>
              <strong>Bold Markdown:</strong>{' '}
              <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                **Hello Discord!**
              </code>
            </div>
            <div>
              <strong>Spoiler:</strong>{' '}
              <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">
                ||Hello Discord!||
              </code>
            </div>
            <div>
              <strong>Bold Unicode:</strong>{' '}
              <span className="font-display text-lg">
                {unicodeStyles['bold-unicode'].transform('Hello Discord!')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Clear
        </button>
      </div>
    </div>
  );
}
