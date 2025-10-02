'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BaseTextConverter } from '@/components/shared/BaseTextConverter';
import { MorseCodeAnalytics } from '@/components/shared/MorseCodeAnalytics';
import { InteractiveSlider } from '@/components/shared/InteractiveSlider';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { ArrowRightLeft, XCircle, Play, Pause, Volume2, VolumeX, Settings, Radio } from 'lucide-react';

type ConversionMode = 'encode' | 'decode';

interface ConversionOptions {
  delimiter: 'space' | 'slash' | 'pipe';
  playSpeed: number;
  frequency: number;
  dotDuration: number;
}

interface AudioSettings {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
}

// Morse code mapping
const MORSE_CODE_MAP: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', 
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
  ' ': '/'
};

const REVERSE_MORSE_MAP: Record<string, string> = Object.entries(MORSE_CODE_MAP)
  .reduce((acc, [char, morse]) => ({ ...acc, [morse]: char }), {});

export function MorseCodeTranslator() {
  const { common, tool } = useToolTranslations('tools/code-data');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<ConversionMode>('encode');
  const [error, setError] = useState<string | null>(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [options, setOptions] = useState<ConversionOptions>({
    delimiter: 'space',
    playSpeed: 20, // WPM (Words Per Minute)
    frequency: 600, // Hz
    dotDuration: 60, // milliseconds base duration
  });
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    isPlaying: false,
    isMuted: false,
    volume: 0.5,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackTimeoutRef = useRef<number | null>(null);

  // Initialize Web Audio API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
      }
    }
    
    return () => {
      if (playbackTimeoutRef.current) {
        window.clearTimeout(playbackTimeoutRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Text to Morse encoding
  const encodeToMorse = useCallback((text: string): string => {
    try {
      const morseArray = Array.from(text.toUpperCase()).map(char => {
        if (char === ' ') {
          return '/'; // Word separator
        }
        return MORSE_CODE_MAP[char] || char;
      });

      // Apply delimiter
      switch (options.delimiter) {
        case 'slash':
          return morseArray.join(' / ');
        case 'pipe':
          return morseArray.join(' | ');
        case 'space':
        default:
          return morseArray.join(' ');
      }
    } catch {
      throw new Error(tool('morse.errors.encodeFailed'));
    }
  }, [options.delimiter, tool]);

  // Morse to Text decoding
  const decodeFromMorse = useCallback((morse: string): string => {
    try {
      // Clean and normalize the input
      const cleanMorse = morse
        .replace(/\s*\/\s*/g, ' / ') // Normalize word separators
        .replace(/\s*\|\s*/g, ' | ') // Normalize pipe separators
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();

      // Split by different delimiters
      let morseGroups: string[];
      
      if (cleanMorse.includes(' / ')) {
        morseGroups = cleanMorse.split(' / ').flatMap(word => 
          word.split(' ').filter(g => g.length > 0).concat('/')
        ).slice(0, -1); // Remove last separator
      } else if (cleanMorse.includes(' | ')) {
        morseGroups = cleanMorse.split(' | ').flatMap(word => 
          word.split(' ').filter(g => g.length > 0).concat('|')
        ).slice(0, -1); // Remove last separator
      } else {
        morseGroups = cleanMorse.split(' ').filter(group => group.length > 0);
      }
      
      // Validate morse groups
      const invalidGroups = morseGroups.filter(group => 
        group !== '/' && group !== '|' && !/^[.\-]+$/.test(group)
      );
      if (invalidGroups.length > 0) {
        throw new Error(tool('morse.errors.invalidMorse'));
      }
      
      // Convert to text
      const text = morseGroups.map(morseChar => {
        if (morseChar === '/' || morseChar === '|') {
          return ' ';
        }
        return REVERSE_MORSE_MAP[morseChar] || morseChar;
      }).join('');
      
      return text;
    } catch (err) {
      if (err instanceof Error && err.message.includes(tool('morse.errors'))) {
        throw err;
      }
      throw new Error(tool('morse.errors.decodeFailed'));
    }
  }, [tool]);

  // Play morse code audio
  const playMorseAudio = useCallback(async (morseText: string) => {
    if (!audioContextRef.current || audioSettings.isMuted) return;

    try {
      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      setAudioSettings((prev: AudioSettings) => ({ ...prev, isPlaying: true }));
      
      const ctx = audioContextRef.current;
      const { frequency, playSpeed } = options;
      const { volume } = audioSettings;
      
      // Calculate timing based on WPM
      const wpm = Math.max(5, Math.min(50, playSpeed));
      const dotTime = (1200 / wpm); // milliseconds per dot
      const dashTime = dotTime * 3;
      const intraCharGap = dotTime;
      const charGap = dotTime * 3;
      const wordGap = dotTime * 7;
      
      let currentTime = ctx.currentTime + 0.1; // Small delay to start
      
      // Parse morse text and play
      const cleanMorse = morseText.replace(/\s*\/\s*/g, '/').replace(/\s*\|\s*/g, '/');
      const tokens = cleanMorse.split(' ').filter(token => token.length > 0);
      
      for (const token of tokens) {
        if (token === '/') {
          // Word gap
          currentTime += wordGap / 1000;
          continue;
        }
        
        // Play each dot/dash in the character
        for (let i = 0; i < token.length; i++) {
          const symbol = token[i];
          if (symbol === '.' || symbol === '-') {
            const duration = symbol === '.' ? dotTime : dashTime;
            
            // Create oscillator for the tone
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.value = 0;
            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.01);
            gainNode.gain.setValueAtTime(volume, currentTime + duration / 1000 - 0.01);
            gainNode.gain.linearRampToValueAtTime(0, currentTime + duration / 1000);
            
            oscillator.start(currentTime);
            oscillator.stop(currentTime + duration / 1000);
            
            currentTime += duration / 1000;
            
            // Add intra-character gap (except after last symbol in character)
            if (i < token.length - 1) {
              currentTime += intraCharGap / 1000;
            }
          }
        }
        
        // Add inter-character gap
        currentTime += charGap / 1000;
      }
      
      // Set timeout to reset playing state
      const totalDuration = (currentTime - ctx.currentTime) * 1000;
      playbackTimeoutRef.current = window.setTimeout(() => {
        setAudioSettings((prev: AudioSettings) => ({ ...prev, isPlaying: false }));
      }, totalDuration);
      
    } catch (error) {
      console.error('Audio playback error:', error);
      setAudioSettings((prev: AudioSettings) => ({ ...prev, isPlaying: false }));
    }
  }, [options, audioSettings]);

  // Stop audio playback
  const stopMorseAudio = useCallback(() => {
    if (playbackTimeoutRef.current) {
      window.clearTimeout(playbackTimeoutRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.suspend();
    }
    setAudioSettings((prev: AudioSettings) => ({ ...prev, isPlaying: false }));
  }, []);

  // Process conversion based on mode
  const processConversion = useCallback((inputText: string) => {
    setError(null);
    
    if (!inputText.trim()) {
      setOutput('');
      return;
    }
    
    try {
      if (mode === 'encode') {
        const encoded = encodeToMorse(inputText);
        setOutput(encoded);
      } else {
        const decoded = decodeFromMorse(inputText);
        setOutput(decoded);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tool('morse.errors.conversionFailed'));
      setOutput('');
    }
  }, [mode, encodeToMorse, decodeFromMorse, tool]);

  // Handle input change
  const handleInputChange = useCallback((newInput: string) => {
    setInput(newInput);
    processConversion(newInput);
  }, [processConversion]);

  // Handle mode switch
  const handleModeSwitch = useCallback(() => {
    const newMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(newMode);
    setInput(output);
    setOutput(input);
    setError(null);
  }, [mode, input, output]);

  // Handle option change
  const handleOptionChange = useCallback((key: keyof ConversionOptions, value: string | number) => {
    setOptions((prev: ConversionOptions) => ({ ...prev, [key]: value }));
  }, []);

  // Handle audio setting change
  const handleAudioSettingChange = useCallback((key: keyof AudioSettings, value: boolean | number) => {
    setAudioSettings((prev: AudioSettings) => ({ ...prev, [key]: value }));
  }, []);

  // Update output when options change (only for encoding)
  React.useEffect(() => {
    if (mode === 'encode') {
      processConversion(input);
    }
  }, [options.delimiter, processConversion, input, mode]);

  // Handle responsive accordion behavior
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) { // sm breakpoint
        setIsAccordionOpen(true);
      } else {
        setIsAccordionOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <BaseTextConverter
      title={tool('morse.title')}
      description={tool('morse.description')}
      inputLabel={mode === 'encode' ? common('labels.inputText') : tool('morse.labels.morseCode')}
      outputLabel={mode === 'encode' ? tool('morse.labels.morseCode') : common('labels.outputText')}
      inputPlaceholder={mode === 'encode' ? tool('morse.placeholders.encode') : tool('morse.placeholders.decode')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      uploadText={common('buttons.upload')}
      uploadDescription=""
      downloadFileName={mode === 'encode' ? 'encoded-morse.txt' : 'decoded-text.txt'}
      onTextChange={handleInputChange}
      text={input}
      convertedText={output}
      onConvertedTextUpdate={setOutput}
      onFileUploaded={(content: string) => {
        setInput(content);
        processConversion(content);
      }}
      showAnalytics={false}
      mobileLayout="2x2"
      useMonoFont={mode === 'encode' ? false : true}
    >
      <div className="space-y-3">
        {/* Mode Switcher with Inline Audio Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={handleModeSwitch}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            {mode === 'encode' ? tool('morse.modes.textToMorse') : tool('morse.modes.morseToText')}
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
          
          {/* Inline Audio Controls */}
          {mode === 'encode' && output && (
            <div className="flex items-center gap-2">
              <Button
                onClick={audioSettings.isPlaying ? stopMorseAudio : () => playMorseAudio(output)}
                variant="outline"
                size="sm"
                className="gap-1"
                disabled={!output.trim()}
              >
                {audioSettings.isPlaying ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
                {audioSettings.isPlaying ? tool('morse.audio.stop') : tool('morse.audio.play')}
              </Button>
              
              <Button
                onClick={() => handleAudioSettingChange('isMuted', !audioSettings.isMuted)}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                {audioSettings.isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              </Button>
            </div>
          )}
        </div>

        {/* Morse Code Options Accordion */}
        <Accordion className="w-full">
          <AccordionItem 
            title={tool('morse.accordion.title')}
            defaultOpen={isAccordionOpen}
            className="w-full"
          >
            <div className="space-y-6">
              {/* Format Options Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Settings className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('morse.sections.format')}</h3>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block">
                    {tool('morse.options.delimiter')}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['space', 'slash', 'pipe'] as const).map((delim) => (
                      <Button
                        key={delim}
                        variant={options.delimiter === delim ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleOptionChange('delimiter', delim)}
                        className="text-xs"
                      >
                        {tool(`morse.options.delimiters.${delim}`)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Audio Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Radio className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{tool('morse.sections.audio')}</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Play Speed Slider */}
                  <InteractiveSlider
                    value={options.playSpeed}
                    min={5}
                    max={50}
                    step={1}
                    label={`${tool('morse.options.playSpeed')}: ${options.playSpeed} WPM`}
                    onChange={(value) => handleOptionChange('playSpeed', value)}
                  />
                  
                  {/* Frequency Slider */}
                  <InteractiveSlider
                    value={options.frequency}
                    min={300}
                    max={1000}
                    step={50}
                    label={`${tool('morse.options.frequency')}: ${options.frequency}Hz`}
                    onChange={(value) => handleOptionChange('frequency', value)}
                  />
                  
                  {/* Volume Slider */}
                  <InteractiveSlider
                    value={audioSettings.volume}
                    min={0}
                    max={1}
                    step={0.1}
                    label={`${tool('morse.options.volume')}: ${Math.round(audioSettings.volume * 100)}%`}
                    onChange={(value) => handleAudioSettingChange('volume', value)}
                  />
                </div>
              </div>
            </div>
          </AccordionItem>
        </Accordion>

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
            <XCircle className="h-3 w-3 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Morse Code Analytics */}
        <MorseCodeAnalytics 
          inputText={input}
          outputText={output}
          mode={mode}
          playSpeed={options.playSpeed}
          variant="compact"
          showTitle={false}
        />

      </div>
    </BaseTextConverter>
  );
}