'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { BasePasswordGenerator } from '@/components/shared/BasePasswordGenerator';
import { AnimatedPasswordOutput } from '@/components/shared/AnimatedPasswordOutput';
import { InteractiveSlider } from '@/components/shared/InteractiveSlider';
import { VisualCheckboxGrid } from '@/components/shared/VisualCheckboxGrid';

export function PasswordGenerator() {
  const { common, tool } = useToolTranslations('tools/random-generators');
  
  // Form state
  const [length, setLength] = useState<number>(18);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(false);
  
  // Generated content state
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Character sets
  const getCharacterSets = (): { [key: string]: string } => {
    return {
      uppercase: 'ABCDEFGHIJKLMNPQRSTUVWXYZ', // Excluded O
      lowercase: 'abcdefghijkmnpqrstuvwxyz', // Excluded l, o
      numbers: '23456789', // Excluded 0, 1
      symbols: '!@#$%^&*()_+-=[]{}:,.<>?'
    };
  };

  // Generate cryptographically secure random character
  const generateSecureRandomChar = (charset: string): string => {
    const randomBytes = new Uint8Array(1);
    crypto.getRandomValues(randomBytes);
    const randomIndex = randomBytes[0] % charset.length;
    return charset[randomIndex];
  };

  // Calculate password strength
  const calculatePasswordStrength = (password: string): number => {
    let score = 0;
    
    // Length scoring
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 25;
    if (password.length >= 16) score += 25;
    
    // Character type scoring
    if (/[a-z]/.test(password)) score += 5;
    if (/[A-Z]/.test(password)) score += 5;
    if (/[0-9]/.test(password)) score += 5;
    if (/[^a-zA-Z0-9]/.test(password)) score += 10;
    
    // Bonus for variety
    const uniqueChars = new Set(password.split('')).size;
    if (uniqueChars / password.length > 0.7) score += 5;
    
    return Math.min(100, score);
  };

  // Generate secure password
  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setIsAnimating(true);
    
    try {
      // Delay for animation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const charSets = getCharacterSets();
      
      // Build available character pool and ensure at least one of each selected type
      let availableChars = '';
      const requiredChars: string[] = [];
      
      if (includeUppercase) {
        availableChars += charSets.uppercase;
        requiredChars.push(generateSecureRandomChar(charSets.uppercase));
      }
      
      if (includeLowercase) {
        availableChars += charSets.lowercase;
        requiredChars.push(generateSecureRandomChar(charSets.lowercase));
      }
      
      if (includeNumbers) {
        availableChars += charSets.numbers;
        requiredChars.push(generateSecureRandomChar(charSets.numbers));
      }
      
      if (includeSymbols) {
        availableChars += charSets.symbols;
        requiredChars.push(generateSecureRandomChar(charSets.symbols));
      }

      // Fallback if no character sets selected
      if (availableChars.length === 0) {
        availableChars = charSets.uppercase + charSets.lowercase + charSets.numbers;
        requiredChars.push(
          generateSecureRandomChar(charSets.uppercase),
          generateSecureRandomChar(charSets.lowercase),
          generateSecureRandomChar(charSets.numbers)
        );
      }

      // Generate password
      const password: string[] = [];
      
      // Add required characters first (but don't exceed length)
      const numRequired = Math.min(requiredChars.length, length);
      password.push(...requiredChars.slice(0, numRequired));
      
      // Fill remaining positions
      for (let i = password.length; i < length; i++) {
        password.push(generateSecureRandomChar(availableChars));
      }
      
      // Shuffle password to randomize required character positions
      for (let i = password.length - 1; i > 0; i--) {
        const randomBytes = new Uint8Array(1);
        crypto.getRandomValues(randomBytes);
        const j = randomBytes[0] % (i + 1);
        [password[i], password[j]] = [password[j], password[i]];
      }
      
      const finalPassword = password.join('');
      setGeneratedPassword(finalPassword);
      
      // Reset animation after password is set
      setTimeout(() => {
        setIsAnimating(false);
      }, 200);
      
    } catch (error) {
      console.error('Error generating password:', error);
      // Show a simple fallback password
      setGeneratedPassword('TempPass123!');
      setIsAnimating(false);
    } finally {
      setIsGenerating(false);
    }
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  // Generate password on component mount and when settings change
  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const passwordStrength = generatedPassword ? calculatePasswordStrength(generatedPassword) : 0;

  const strengthLabels = {
    weak: 'Weak',
    fair: 'Fair', 
    good: 'Good',
    strong: 'Very strong'
  };

  const characterOptions = [
    {
      id: 'uppercase',
      label: 'ABC',
      icon: 'ABC',
      checked: includeUppercase,
      onChange: setIncludeUppercase
    },
    {
      id: 'lowercase',
      label: 'abc',
      icon: 'abc',
      checked: includeLowercase,
      onChange: setIncludeLowercase
    },
    {
      id: 'numbers',
      label: '123',
      icon: '123',
      checked: includeNumbers,
      onChange: setIncludeNumbers
    },
    {
      id: 'symbols',
      label: '#$&',
      icon: '#$&',
      checked: includeSymbols,
      onChange: setIncludeSymbols
    }
  ];

  return (
    <BasePasswordGenerator
      title={tool('passwordGenerator.title')}
      description={tool('passwordGenerator.description')}
    >
      {/* Password Output */}
      <AnimatedPasswordOutput
        password={generatedPassword}
        strength={passwordStrength}
        onRegenerate={handleGenerate}
        isGenerating={isGenerating}
        isAnimating={isAnimating}
        copyText={common('buttons.copy')}
        strengthLabels={strengthLabels}
      />

      {/* Password Length Slider */}
      <InteractiveSlider
        value={length}
        min={4}
        max={50}
        step={1}
        label={`${tool('passwordGenerator.options.length')}: ${length}`}
        onChange={setLength}
      />

      {/* Character Types */}
      <VisualCheckboxGrid
        title={tool('passwordGenerator.options.characterTypes')}
        options={characterOptions}
        columns={4}
      />
    </BasePasswordGenerator>
  );
}