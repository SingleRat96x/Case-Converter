'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw, Shield, Settings, Eye, EyeOff } from 'lucide-react';

export default function PasswordGeneratorConverter() {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [count, setCount] = useState(1);
  const [generatedPasswords, setGeneratedPasswords] = useState<string[]>([]);
  const [showPasswords, setShowPasswords] = useState(true);

  const characters = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  const generatePassword = (): string => {
    let charPool = '';
    if (includeUppercase) charPool += characters.uppercase;
    if (includeLowercase) charPool += characters.lowercase;
    if (includeNumbers) charPool += characters.numbers;
    if (includeSymbols) charPool += characters.symbols;

    if (charPool === '') return 'Error: Please select at least one character type';

    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charPool.length);
      password += charPool[randomIndex];
    }

    return password;
  };

  const handleGenerate = () => {
    const newPasswords = Array.from({ length: count }, () => generatePassword());
    setGeneratedPasswords(newPasswords);
  };

  const getResult = (): string => {
    return generatedPasswords.join('\n');
  };

  const handleDownload = () => {
    const result = getResult();
    const filename = `passwords-${count}.txt`;
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getResult());
  };

  const handleClear = () => {
    setGeneratedPasswords([]);
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-4">
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">Password Generator Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Length</label>
                <input
                  type="number"
                  min="4"
                  max="128"
                  value={length}
                  onChange={(e) => setLength(Math.min(128, Math.max(4, parseInt(e.target.value) || 4)))}
                  className="w-full px-3 py-2 border rounded text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Count</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={count}
                  onChange={(e) => setCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-3 py-2 border rounded text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Character Types</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={(e) => setIncludeUppercase(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Uppercase (A-Z)
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={includeLowercase}
                  onChange={(e) => setIncludeLowercase(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Lowercase (a-z)
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Numbers (0-9)
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Symbols (!@#$%^&*)
              </label>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={handleGenerate}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors inline-flex items-center justify-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Generate Password{count > 1 ? 's' : ''}
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Security Info</label>
          <div className="min-h-[300px] p-4 rounded-lg border bg-background text-gray-900 dark:text-gray-100">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Password Settings</h4>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div>Length: {length} characters</div>
                  <div>Character Types: {[includeUppercase && 'Upper', includeLowercase && 'Lower', includeNumbers && 'Numbers', includeSymbols && 'Symbols'].filter(Boolean).join(', ')}</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Security Tips</h4>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div>• Use unique passwords for each account</div>
                  <div>• Enable 2FA when available</div>
                  <div>• Use a password manager</div>
                  <div>• Minimum 12 characters recommended</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
              Generated Passwords ({generatedPasswords.length})
            </label>
            <button
              onClick={() => setShowPasswords(!showPasswords)}
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 inline-flex items-center gap-1"
            >
              {showPasswords ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showPasswords ? 'Hide' : 'Show'}
            </button>
          </div>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y text-gray-900 dark:text-gray-100 font-mono text-sm"
            readOnly
            value={showPasswords ? getResult() : generatedPasswords.map(p => '•'.repeat(p.length)).join('\n')}
            placeholder="Generated passwords will appear here..."
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          disabled={generatedPasswords.length === 0}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button
          onClick={handleCopy}
          disabled={generatedPasswords.length === 0}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Copy className="h-4 w-4" />
          Copy
        </button>
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