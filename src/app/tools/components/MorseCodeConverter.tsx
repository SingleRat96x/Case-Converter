'use client';

import { useState, useRef, useCallback } from 'react';
import { Copy, Download, RefreshCw, Play, Pause, Volume2, RotateCcw } from 'lucide-react';

const MORSE_CODE: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..',
  '!': '-.-.--', "'": '.----.', '"': '.-..-.', '(': '-.--.',
  ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.', '/': '-..-.',
  '_': '..--.-', '=': '-...-', '+': '.-.-.', '-': '-....-', ' ': '/'
};

const REVERSE_MORSE_CODE: Record<string, string> = Object.entries(MORSE_CODE).reduce(
  (acc, [char, morse]) => ({ ...acc, [morse]: char }),
  {}
);

export default function MorseCodeConverter() {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(0.5);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);

  const initAudio = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  }, []);

  const textToMorse = (text: string): string => {
    return text
      .toUpperCase()
      .split('')
      .map(char => MORSE_CODE[char] || char)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const morseToText = (morse: string): string => {
    return morse
      .split(' ')
      .map(code => REVERSE_MORSE_CODE[code] || code)
      .join('')
      .trim();
  };

  const getResult = (): string => {
    if (!inputText.trim()) return '';
    
    try {
      return mode === 'encode' ? textToMorse(inputText) : morseToText(inputText);
    } catch {
      return 'Error: Invalid input';
    }
  };

  const playTone = useCallback(async (duration: number) => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioContextRef.current.currentTime);
    gainNode.gain.value = volume;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + duration / 1000);

    return new Promise<void>((resolve) => {
      oscillator.onended = () => resolve();
    });
  }, [volume]);

  const playMorseCode = useCallback(async () => {
    const result = getResult();
    if (!result || mode !== 'encode' || result.startsWith('Error:')) return;

    try {
      await initAudio();
      setIsPlaying(true);
      isPlayingRef.current = true;

      const dotDuration = 100 / speed;
      const dashDuration = 300 / speed;
      const symbolSpace = 100 / speed;
      const letterSpace = 300 / speed;
      const wordSpace = 700 / speed;

      for (let i = 0; i < result.length; i++) {
        if (!isPlayingRef.current) break;

        const symbol = result[i];
        
        if (symbol === '.') {
          await playTone(dotDuration);
          await new Promise(resolve => setTimeout(resolve, symbolSpace));
        } else if (symbol === '-') {
          await playTone(dashDuration);
          await new Promise(resolve => setTimeout(resolve, symbolSpace));
        } else if (symbol === ' ') {
          await new Promise(resolve => setTimeout(resolve, letterSpace));
        } else if (symbol === '/') {
          await new Promise(resolve => setTimeout(resolve, wordSpace));
        }
      }
    } catch (error) {
      console.error('Failed to play morse code:', error);
    } finally {
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  }, [getResult, mode, speed, playTone, initAudio]);

  const stopAudio = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
  };

  const handleDownload = () => {
    const result = getResult();
    const filename = `morse-code-${mode}.txt`;
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
    setInputText('');
    stopAudio();
  };

  const handleSwapMode = () => {
    const result = getResult();
    setInputText(result);
    setMode(mode === 'encode' ? 'decode' : 'encode');
    stopAudio();
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center justify-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <button
          onClick={() => setMode('encode')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'encode'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Text to Morse
        </button>
        <button
          onClick={handleSwapMode}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          title="Swap input/output"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={() => setMode('decode')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'decode'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Morse to Text
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            {mode === 'encode' ? 'Text Input' : 'Morse Code Input'}
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
            placeholder={mode === 'encode' ? 'Enter text to convert to Morse code...' : 'Enter Morse code (dots, dashes, spaces)...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            {mode === 'encode' ? 'Morse Code Output' : 'Text Output'}
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y text-gray-900 dark:text-gray-100 font-mono text-sm"
            readOnly
            value={getResult()}
            placeholder="Converted result will appear here..."
          />
        </div>
      </div>

      {/* Audio Controls (only for encode mode) */}
      {mode === 'encode' && getResult() && !getResult().startsWith('Error:') && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <button
              onClick={isPlaying ? stopAudio : playMorseCode}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Stop' : 'Play'} Audio
            </button>
            
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Speed:</span>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 w-8">{speed}x</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">Volume:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-20"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reference */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">Morse Code Reference</h3>
        <div className="text-xs text-gray-600 dark:text-gray-400 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-1">
          {Object.entries(MORSE_CODE).slice(0, 26).map(([char, morse]) => (
            <div key={char} className="font-mono">
              {char}: {morse}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          disabled={!getResult()}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button
          onClick={handleCopy}
          disabled={!getResult()}
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