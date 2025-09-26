'use client';

import { useState } from 'react';
import { CaseConverterButtons } from '@/components/shared/CaseConverterButtons';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { generateTextStats } from '@/app/components/shared/TextAnalytics';

export function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [result, setResult] = useState('');

  const characters = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  const generatePassword = () => {
    let charPool = '';
    if (includeUppercase) charPool += characters.uppercase;
    if (includeLowercase) charPool += characters.lowercase;
    if (includeNumbers) charPool += characters.numbers;
    if (includeSymbols) charPool += characters.symbols;

    if (charPool === '') {
      setResult('Please select at least one character type');
      return;
    }

    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charPool.length);
      password += charPool[randomIndex];
    }

    // Ensure at least one character from each selected type
    const requiredChars = [];
    if (includeUppercase) requiredChars.push(characters.uppercase[Math.floor(Math.random() * characters.uppercase.length)]);
    if (includeLowercase) requiredChars.push(characters.lowercase[Math.floor(Math.random() * characters.lowercase.length)]);
    if (includeNumbers) requiredChars.push(characters.numbers[Math.floor(Math.random() * characters.numbers.length)]);
    if (includeSymbols) requiredChars.push(characters.symbols[Math.floor(Math.random() * characters.symbols.length)]);

    // Replace first few characters with required ones
    password = requiredChars.join('') + password.slice(requiredChars.length);

    setResult(password);
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'password.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
  };

  const handleClear = () => {
    setResult('');
    setLength(16);
    setIncludeUppercase(true);
    setIncludeLowercase(true);
    setIncludeNumbers(true);
    setIncludeSymbols(true);
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="length">Password Length</Label>
              <input
                type="number"
                id="length"
                min="8"
                max="128"
                value={length}
                onChange={(e) => setLength(Math.min(128, Math.max(8, parseInt(e.target.value) || 8)))}
                className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-950 dark:border-gray-800 dark:bg-gray-950"
              />
            </div>
            <div className="space-y-2">
              <Label>Character Types</Label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeUppercase}
                    onChange={(e) => setIncludeUppercase(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span>Uppercase Letters (A-Z)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeLowercase}
                    onChange={(e) => setIncludeLowercase(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span>Lowercase Letters (a-z)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span>Numbers (0-9)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeSymbols}
                    onChange={(e) => setIncludeSymbols(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span>Special Characters (!@#$%^&*)</span>
                </label>
              </div>
            </div>
          </div>
          <Button 
            onClick={generatePassword}
            className="w-full"
          >
            Generate Password
          </Button>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="output">Generated Password</Label>
            <div
              id="output"
              className="min-h-[200px] p-4 rounded-md bg-muted font-mono break-all whitespace-pre-wrap"
            >
              {result}
            </div>
          </div>
          <CaseConverterButtons
            onDownload={handleDownload}
            onCopy={handleCopy}
            onClear={handleClear}
            stats={generateTextStats(result)}
          />
        </Card>
      </div>
    </div>
  );
} 