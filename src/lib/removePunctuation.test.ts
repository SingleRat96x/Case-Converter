import { 
  removePunctuation, 
  getPunctuationStats, 
  validateCustomKeepList,
  DEFAULT_OPTIONS,
  type RemovePunctuationOptions 
} from './removePunctuation';

describe('removePunctuation', () => {
  describe('Basic ASCII punctuation removal', () => {
    it('should remove basic punctuation marks', () => {
      const input = 'Hello, world! How are you? I\'m fine.';
      const result = removePunctuation(input, { ...DEFAULT_OPTIONS, keepApostrophes: false });
      expect(result).toBe('Hello world How are you I m fine');
    });

    it('should handle empty string', () => {
      const result = removePunctuation('', DEFAULT_OPTIONS);
      expect(result).toBe('');
    });

    it('should handle text with no punctuation', () => {
      const input = 'Hello world';
      const result = removePunctuation(input, DEFAULT_OPTIONS);
      expect(result).toBe('Hello world');
    });
  });

  describe('Unicode punctuation removal', () => {
    it('should remove Unicode quotes and dashes', () => {
      const input = '"Smart quotes" and — em dashes… ellipses';
      const result = removePunctuation(input, DEFAULT_OPTIONS);
      expect(result).toBe('Smart quotes and em dashes ellipses');
    });

    it('should remove various Unicode punctuation categories', () => {
      const input = '¡Hola! ¿Cómo estás? «Bien» ‹gracias›';
      const result = removePunctuation(input, DEFAULT_OPTIONS);
      expect(result).toBe('Hola Cómo estás Bien gracias');
    });
  });

  describe('Keep apostrophes option', () => {
    it('should preserve apostrophes in contractions when enabled', () => {
      const input = 'Don\'t worry, we\'ll handle it. It\'s not a problem.';
      const options = { ...DEFAULT_OPTIONS, keepApostrophes: true };
      const result = removePunctuation(input, options);
      expect(result).toBe('Don\'t worry we\'ll handle it It\'s not a problem');
    });

    it('should preserve possessives', () => {
      const input = 'John\'s book and the cats\' toys.';
      const options = { ...DEFAULT_OPTIONS, keepApostrophes: true };
      const result = removePunctuation(input, options);
      expect(result).toBe('John\'s book and the cats\' toys');
    });

    it('should remove apostrophes when disabled', () => {
      const input = 'Don\'t worry, it\'s fine.';
      const options = { ...DEFAULT_OPTIONS, keepApostrophes: false };
      const result = removePunctuation(input, options);
      expect(result).toBe('Don t worry it s fine');
    });
  });

  describe('Keep hyphens/underscores option', () => {
    it('should preserve hyphens in compound words when enabled', () => {
      const input = 'Well-being and state-of-the-art technology.';
      const options = { ...DEFAULT_OPTIONS, keepHyphens: true };
      const result = removePunctuation(input, options);
      expect(result).toBe('Well-being and state-of-the-art technology');
    });

    it('should preserve underscores in identifiers', () => {
      const input = 'Use snake_case and camel-case naming.';
      const options = { ...DEFAULT_OPTIONS, keepHyphens: true };
      const result = removePunctuation(input, options);
      expect(result).toBe('Use snake_case and camel-case naming');
    });

    it('should remove hyphens when disabled', () => {
      const input = 'Well-being and snake_case.';
      const options = { ...DEFAULT_OPTIONS, keepHyphens: false };
      const result = removePunctuation(input, options);
      expect(result).toBe('Well being and snake case');
    });
  });

  describe('Keep email/URL punctuation option', () => {
    it('should preserve email addresses', () => {
      const input = 'Contact team@example.com for support!';
      const options = { ...DEFAULT_OPTIONS, keepEmailUrl: true };
      const result = removePunctuation(input, options);
      expect(result).toBe('Contact team@example.com for support');
    });

    it('should preserve URLs', () => {
      const input = 'Visit https://example.com or www.test.org for info.';
      const options = { ...DEFAULT_OPTIONS, keepEmailUrl: true };
      const result = removePunctuation(input, options);
      expect(result).toBe('Visit https://example.com or www.test.org for info');
    });

    it('should preserve complex URLs with paths', () => {
      const input = 'Check https://api.example.com/v1/users?id=123&format=json.';
      const options = { ...DEFAULT_OPTIONS, keepEmailUrl: true };
      const result = removePunctuation(input, options);
      expect(result).toBe('Check https://api.example.com/v1/users?id=123&format=json');
    });

    it('should break emails and URLs when disabled', () => {
      const input = 'Email: test@example.com and site: https://example.com';
      const options = { ...DEFAULT_OPTIONS, keepEmailUrl: false };
      const result = removePunctuation(input, options);
      expect(result).toBe('Email test example com and site https example com');
    });
  });

  describe('Keep numbers option', () => {
    it('should preserve numbers when enabled', () => {
      const input = 'Price: $29.99 (20% off)!';
      const options = { ...DEFAULT_OPTIONS, keepNumbers: true };
      const result = removePunctuation(input, options);
      expect(result).toBe('Price 2999 20 off');
    });

    it('should remove numbers when disabled', () => {
      const input = 'Price: $29.99 (20% off)!';
      const options = { ...DEFAULT_OPTIONS, keepNumbers: false };
      const result = removePunctuation(input, options);
      expect(result).toBe('Price off');
    });
  });

  describe('Keep line breaks option', () => {
    it('should preserve line breaks when enabled', () => {
      const input = 'Line 1.\nLine 2!\nLine 3?';
      const options = { ...DEFAULT_OPTIONS, keepLineBreaks: true };
      const result = removePunctuation(input, options);
      expect(result).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should remove line breaks when disabled', () => {
      const input = 'Line 1.\nLine 2!\nLine 3?';
      const options = { ...DEFAULT_OPTIONS, keepLineBreaks: false };
      const result = removePunctuation(input, options);
      expect(result).toBe('Line 1 Line 2 Line 3');
    });

    it('should limit consecutive line breaks', () => {
      const input = 'Para 1.\n\n\n\nPara 2.';
      const options = { ...DEFAULT_OPTIONS, keepLineBreaks: true };
      const result = removePunctuation(input, options);
      expect(result).toBe('Para 1\n\nPara 2');
    });
  });

  describe('Custom keep list', () => {
    it('should preserve characters in custom keep list', () => {
      const input = 'Price: $29.99 @ 20% off!';
      const options = { ...DEFAULT_OPTIONS, customKeepList: '$@%' };
      const result = removePunctuation(input, options);
      expect(result).toBe('Price $2999 @ 20% off');
    });

    it('should work with empty custom keep list', () => {
      const input = 'Hello, world!';
      const options = { ...DEFAULT_OPTIONS, customKeepList: '' };
      const result = removePunctuation(input, options);
      expect(result).toBe('Hello world');
    });

    it('should prioritize custom keep list over other options', () => {
      const input = 'Don\'t use @ symbol.';
      const options = { 
        ...DEFAULT_OPTIONS, 
        keepApostrophes: false, 
        customKeepList: '\'' 
      };
      const result = removePunctuation(input, options);
      expect(result).toBe('Don\'t use symbol');
    });
  });

  describe('Complex scenarios', () => {
    it('should handle all options together', () => {
      const input = 'Email: john@test.com, don\'t forget! Visit https://api.example.com/users?id=123. Price: $29.99.';
      const options: RemovePunctuationOptions = {
        keepApostrophes: true,
        keepHyphens: true,
        keepEmailUrl: true,
        keepNumbers: true,
        keepLineBreaks: true,
        customKeepList: '$'
      };
      const result = removePunctuation(input, options);
      expect(result).toBe('Email john@test.com don\'t forget Visit https://api.example.com/users?id=123 Price $2999');
    });

    it('should handle mixed content with protection', () => {
      const input = 'Contact support@company.co.uk or visit https://help.company.com/faq#section-1 for help!';
      const options = { ...DEFAULT_OPTIONS, keepEmailUrl: true };
      const result = removePunctuation(input, options);
      expect(result).toBe('Contact support@company.co.uk or visit https://help.company.com/faq#section-1 for help');
    });
  });

  describe('Edge cases', () => {
    it('should handle text with only punctuation', () => {
      const input = '!@#$%^&*()';
      const result = removePunctuation(input, DEFAULT_OPTIONS);
      expect(result).toBe('');
    });

    it('should handle text with mixed Unicode and ASCII', () => {
      const input = 'Hello… "world" — test!';
      const result = removePunctuation(input, DEFAULT_OPTIONS);
      expect(result).toBe('Hello world test');
    });

    it('should preserve spaces correctly', () => {
      const input = 'Word1 , word2 ! word3 ?';
      const result = removePunctuation(input, DEFAULT_OPTIONS);
      expect(result).toBe('Word1 word2 word3');
    });
  });
});

describe('getPunctuationStats', () => {
  it('should calculate basic statistics', () => {
    const original = 'Hello, world! How are you?';
    const result = 'Hello world How are you';
    const stats = getPunctuationStats(original, result, DEFAULT_OPTIONS);
    
    expect(stats.originalLength).toBe(25);
    expect(stats.resultLength).toBe(22);
    expect(stats.charactersRemoved).toBe(3);
    expect(stats.reductionPercentage).toBe(12);
  });

  it('should identify unique punctuation marks', () => {
    const original = 'Hello, world! How are you???';
    const result = 'Hello world How are you';
    const stats = getPunctuationStats(original, result, DEFAULT_OPTIONS);
    
    expect(stats.punctuationFound).toContain(',');
    expect(stats.punctuationFound).toContain('!');
    expect(stats.punctuationFound).toContain('?');
    expect(stats.punctuationFound).toHaveLength(3);
  });

  it('should count protected elements', () => {
    const original = 'Email: test@example.com, don\'t visit https://malicious.com!';
    const result = 'Email test@example.com don\'t visit https://malicious.com';
    const options = { ...DEFAULT_OPTIONS, keepEmailUrl: true, keepApostrophes: true };
    const stats = getPunctuationStats(original, result, options);
    
    expect(stats.protectedElements.emails).toBe(1);
    expect(stats.protectedElements.urls).toBe(1);
    expect(stats.protectedElements.contractions).toBe(1);
  });

  it('should handle empty text', () => {
    const stats = getPunctuationStats('', '', DEFAULT_OPTIONS);
    
    expect(stats.originalLength).toBe(0);
    expect(stats.resultLength).toBe(0);
    expect(stats.charactersRemoved).toBe(0);
    expect(stats.reductionPercentage).toBe(0);
    expect(stats.punctuationFound).toHaveLength(0);
  });
});

describe('validateCustomKeepList', () => {
  it('should accept valid characters', () => {
    const validation = validateCustomKeepList('$@#%&*');
    expect(validation.isValid).toBe(true);
    expect(validation.invalidChars).toHaveLength(0);
  });

  it('should reject problematic characters', () => {
    const validation = validateCustomKeepList('$@\n\t');
    expect(validation.isValid).toBe(false);
    expect(validation.invalidChars).toContain('\\n');
    expect(validation.invalidChars).toContain('\\t');
  });

  it('should handle empty string', () => {
    const validation = validateCustomKeepList('');
    expect(validation.isValid).toBe(true);
    expect(validation.invalidChars).toHaveLength(0);
  });

  it('should identify carriage returns', () => {
    const validation = validateCustomKeepList('test\r');
    expect(validation.isValid).toBe(false);
    expect(validation.invalidChars).toContain('\\r');
  });
});

describe('Idempotence and performance', () => {
  it('should be idempotent', () => {
    const input = 'Hello, world! How are you?';
    const options = DEFAULT_OPTIONS;
    
    const firstPass = removePunctuation(input, options);
    const secondPass = removePunctuation(firstPass, options);
    
    expect(firstPass).toBe(secondPass);
  });

  it('should handle large input efficiently', () => {
    const largeInput = 'Hello, world! '.repeat(10000);
    const startTime = Date.now();
    
    const result = removePunctuation(largeInput, DEFAULT_OPTIONS);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(result).toBeTruthy();
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });
});