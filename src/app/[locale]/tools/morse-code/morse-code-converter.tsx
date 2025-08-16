'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Copy, RefreshCw, Volume2 } from 'lucide-react';

// Morse code mapping
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
  '_': '..--.-', '=': '-...-', '+': '.-.-.', '-': '-....-', '$': '...-..-',
  '@': '.--.-.', ' ': '/'
};

// Reverse mapping for decoding
const REVERSE_MORSE_CODE: Record<string, string> = Object.entries(MORSE_CODE).reduce(
  (acc, [char, morse]) => ({ ...acc, [morse]: char }),
  {}
);

// Audio settings
const DOT_DURATION = 100;
const DASH_DURATION = DOT_DURATION * 3;
const SYMBOL_SPACE = DOT_DURATION;
const LETTER_SPACE = DOT_DURATION * 3;
const WORD_SPACE = DOT_DURATION * 7;
const FREQUENCY = 600; // Hz

export function MorseCodeConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('encode');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(0.5);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    return () => {
      // Cleanup audio context on component unmount
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const initAudio = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      if (!gainNodeRef.current) {
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
      }

      gainNodeRef.current.gain.value = volume;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      throw new Error('Failed to initialize audio system');
    }
  }, [volume]);

  const playTone = useCallback(async (duration: number) => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(FREQUENCY, audioContextRef.current.currentTime);
    oscillator.connect(gainNodeRef.current);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration / 1000);

    return new Promise<void>((resolve) => {
      oscillator.onended = () => {
        oscillator.disconnect();
        resolve();
      };
    });
  }, []);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const playMorseCode = useCallback(async () => {
    if (!output || activeTab !== 'encode') return;

    try {
      await initAudio();
      setIsPlaying(true);
      isPlayingRef.current = true;

      const adjustedDotDuration = DOT_DURATION / speed;
      const adjustedDashDuration = DASH_DURATION / speed;
      const adjustedSymbolSpace = SYMBOL_SPACE / speed;
      const adjustedLetterSpace = LETTER_SPACE / speed;
      const adjustedWordSpace = WORD_SPACE / speed;

      for (let i = 0; i < output.length; i++) {
        if (!isPlayingRef.current) break;

        const symbol = output[i];
        
        if (symbol === '.') {
          await playTone(adjustedDotDuration);
          await sleep(adjustedSymbolSpace);
        } else if (symbol === '-') {
          await playTone(adjustedDashDuration);
          await sleep(adjustedSymbolSpace);
        } else if (symbol === ' ') {
          await sleep(adjustedLetterSpace);
        } else if (symbol === '/') {
          await sleep(adjustedWordSpace);
        }
      }
    } catch (error) {
      console.error('Failed to play morse code:', error);
    } finally {
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  }, [output, activeTab, speed, playTone, initAudio]);

  const stopAudio = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    
    if (audioContextRef.current) {
      audioContextRef.current.suspend();
    }
  }, []);

  const textToMorse = (text: string): string => {
    try {
      return text
        .toUpperCase()
        .split('')
        .map(char => MORSE_CODE[char] || char)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    } catch (error) {
      throw new Error('Failed to convert text to Morse code');
    }
  };

  const morseToText = (morse: string): string => {
    try {
      return morse
        .split(' ')
        .map(code => REVERSE_MORSE_CODE[code] || code)
        .join('')
        .trim();
    } catch (error) {
      throw new Error('Failed to convert Morse code to text');
    }
  };

  const handleConvert = () => {
    try {
      const result = activeTab === 'encode' ? textToMorse(input) : morseToText(input);
      setOutput(result);
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Error: ${error.message}`);
      } else {
        setOutput('Error: Failed to convert');
      }
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    stopAudio();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <Card className="p-6">
      <Tabs defaultValue="encode" onValueChange={(value) => {
        setActiveTab(value);
        stopAudio();
      }}>
        <TabsList className="mb-4">
          <TabsTrigger value="encode">Text to Morse</TabsTrigger>
          <TabsTrigger value="decode">Morse to Text</TabsTrigger>
        </TabsList>

        <div className="space-y-4">
          <div>
            <Label htmlFor="input">
              {activeTab === 'encode' ? 'Text to Convert' : 'Morse Code to Convert'}
            </Label>
            <Textarea
              id="input"
              placeholder={
                activeTab === 'encode'
                  ? 'Enter text to convert to Morse code...'
                  : 'Enter Morse code (use spaces between letters, / between words)...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[100px] font-mono"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleConvert} className="flex-1 gap-2">
              {activeTab === 'encode' ? 'Convert to Morse' : 'Convert to Text'}
            </Button>
            <Button onClick={handleClear} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Clear
            </Button>
          </div>

          <div>
            <Label htmlFor="output">Result</Label>
            <Textarea
              id="output"
              value={output}
              readOnly
              className="min-h-[100px] font-mono"
            />
          </div>

          {activeTab === 'encode' && output && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  <Label>Volume</Label>
                </div>
                <Slider
                  value={[volume]}
                  onValueChange={([value]) => setVolume(value)}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Speed (WPM)</Label>
                <Slider
                  value={[speed]}
                  onValueChange={([value]) => setSpeed(value)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={isPlaying ? stopAudio : playMorseCode}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Stop Audio
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Play Morse Code
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          <Button
            onClick={handleCopy}
            variant="outline"
            className="w-full gap-2"
            disabled={!output}
          >
            <Copy className="h-4 w-4" />
            Copy Result
          </Button>
        </div>
      </Tabs>
    </Card>
  );
} 