'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw, Shuffle, Settings } from 'lucide-react';

export default function RandomChoiceConverter() {
  const [inputText, setInputText] = useState('');
  const [choiceCount, setChoiceCount] = useState(1);
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [generatedChoices, setGeneratedChoices] = useState<string[]>([]);

  const getChoicesFromInput = (): string[] => {
    return inputText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  };

  const handleGenerate = () => {
    const choices = getChoicesFromInput();

    if (choices.length === 0) {
      setGeneratedChoices(['Error: Please enter some choices (one per line)']);
      return;
    }

    if (!allowDuplicates && choiceCount > choices.length) {
      setGeneratedChoices([
        `Error: Cannot select ${choiceCount} unique items from ${choices.length} choices`,
      ]);
      return;
    }

    const selectedChoices = [];
    const availableChoices = [...choices];

    for (let i = 0; i < choiceCount; i++) {
      if (availableChoices.length === 0 && !allowDuplicates) break;

      const randomIndex = Math.floor(Math.random() * availableChoices.length);
      const selectedChoice = availableChoices[randomIndex];
      selectedChoices.push(selectedChoice);

      if (!allowDuplicates) {
        availableChoices.splice(randomIndex, 1);
      }
    }

    setGeneratedChoices(selectedChoices);
  };

  const getResult = (): string => {
    return generatedChoices.join('\n');
  };

  const handleDownload = () => {
    const result = getResult();
    const filename = `random-choice-${choiceCount}.txt`;
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
    setGeneratedChoices([]);
  };

  const availableChoices = getChoicesFromInput();

  return (
    <div className="w-full space-y-4">
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Random Choice Generator Settings
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
                Number of Choices
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={choiceCount}
                onChange={e =>
                  setChoiceCount(
                    Math.min(50, Math.max(1, parseInt(e.target.value) || 1))
                  )
                }
                className="w-full px-3 py-2 border rounded text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={allowDuplicates}
                  onChange={e => setAllowDuplicates(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Allow Duplicate Selections
              </label>
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors inline-flex items-center justify-center gap-2"
            >
              <Shuffle className="h-4 w-4" />
              Make Random Choice{choiceCount > 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Enter Choices (one per line)
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
            placeholder={`Option 1\nOption 2\nOption 3\nOption 4\nOption 5`}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
          />
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Available choices: {availableChoices.length}
            {!allowDuplicates && choiceCount > availableChoices.length && (
              <span className="text-red-500 ml-2">
                (Need at least {choiceCount} choices for unique selection)
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Random Selection Result ({generatedChoices.length})
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y text-gray-900 dark:text-gray-100 font-mono text-sm"
            readOnly
            value={getResult()}
            placeholder="Random choices will appear here..."
          />
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
          How to Use
        </h3>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>1. Enter your options in the left text area, one per line</div>
          <div>2. Set the number of choices you want to select</div>
          <div>3. Choose whether to allow duplicate selections</div>
          <div>4. Click "Make Random Choice" to get your random selection</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          disabled={generatedChoices.length === 0}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button
          onClick={handleCopy}
          disabled={generatedChoices.length === 0}
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
