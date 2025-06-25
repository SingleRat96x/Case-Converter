'use client';

import { Download, Copy, RefreshCw } from 'lucide-react';
import { TextStats } from './types';

interface CaseConverterButtonsProps {
  onDownload: () => void;
  onCopy: () => void;
  onClear: () => void;
  stats: TextStats;
}

export function CaseConverterButtons({ onDownload, onCopy, onClear, stats }: CaseConverterButtonsProps) {
  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <button
          onClick={onDownload}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 w-full sm:w-auto min-w-[140px]"
        >
          <Download className="h-4 w-4" />
          Download Text
        </button>
        <button
          onClick={onCopy}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 w-full sm:w-auto min-w-[140px]"
        >
          <Copy className="h-4 w-4" />
          Copy to Clipboard
        </button>
        <button
          onClick={onClear}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 w-full sm:w-auto min-w-[140px]"
        >
          <RefreshCw className="h-4 w-4" />
          Clear
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
        <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 shadow-sm">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.characters}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Characters</div>
        </div>
        <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 shadow-sm">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.words}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Words</div>
        </div>
        <div className="p-4 rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 dark:from-gray-800 dark:to-gray-900 shadow-sm">
          <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{stats.sentences}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Sentences</div>
        </div>
        <div className="p-4 rounded-lg bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 shadow-sm">
          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{stats.lines}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Lines</div>
        </div>
      </div>
    </div>
  );
} 