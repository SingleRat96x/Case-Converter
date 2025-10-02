/**
 * Roman Numeral Date Conversion Library
 * Handles conversion between modern dates and Roman numeral format
 */

// Roman numeral mapping for numbers 1-3999
const ROMAN_NUMERALS = [
  { value: 1000, numeral: 'M' },
  { value: 900, numeral: 'CM' },
  { value: 500, numeral: 'D' },
  { value: 400, numeral: 'CD' },
  { value: 100, numeral: 'C' },
  { value: 90, numeral: 'XC' },
  { value: 50, numeral: 'L' },
  { value: 40, numeral: 'XL' },
  { value: 10, numeral: 'X' },
  { value: 9, numeral: 'IX' },
  { value: 5, numeral: 'V' },
  { value: 4, numeral: 'IV' },
  { value: 1, numeral: 'I' }
];

// Month names in Latin for Roman dates
const LATIN_MONTHS = {
  1: 'IANUARIUS',
  2: 'FEBRUARIUS', 
  3: 'MARTIUS',
  4: 'APRILIS',
  5: 'MAIUS',
  6: 'IUNIUS',
  7: 'IULIUS',
  8: 'AUGUSTUS',
  9: 'SEPTEMBER',
  10: 'OCTOBER',
  11: 'NOVEMBER',
  12: 'DECEMBER'
};

// Abbreviated Latin months
const LATIN_MONTHS_SHORT = {
  1: 'IAN',
  2: 'FEB',
  3: 'MAR',
  4: 'APR',
  5: 'MAI',
  6: 'IUN',
  7: 'IUL',
  8: 'AUG',
  9: 'SEP',
  10: 'OCT',
  11: 'NOV',
  12: 'DEC'
};

// Reverse mapping for parsing
const LATIN_MONTH_REVERSE: { [key: string]: number } = {};
Object.entries(LATIN_MONTHS).forEach(([num, name]) => {
  LATIN_MONTH_REVERSE[name] = parseInt(num);
});
Object.entries(LATIN_MONTHS_SHORT).forEach(([num, name]) => {
  LATIN_MONTH_REVERSE[name] = parseInt(num);
});

export type RomanDateFormat = 'classical' | 'medieval' | 'minimal' | 'decorative';

export interface DateConversionResult {
  success: boolean;
  result?: string;
  error?: string;
}

export interface ParsedRomanDate {
  day?: number;
  month?: number;
  year?: number;
  format: RomanDateFormat;
}

/**
 * Convert a number to Roman numerals (1-3999)
 */
export function convertToRoman(num: number): string {
  if (num <= 0 || num > 3999) {
    throw new Error('Number must be between 1 and 3999');
  }

  let result = '';
  let remaining = num;

  for (const { value, numeral } of ROMAN_NUMERALS) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }

  return result;
}

/**
 * Convert Roman numerals to a number
 */
export function convertFromRoman(roman: string): number {
  if (!roman || typeof roman !== 'string') {
    throw new Error('Invalid Roman numeral string');
  }

  const cleanRoman = roman.toUpperCase().trim();
  let result = 0;
  let i = 0;

  const romanValues: { [key: string]: number } = {
    'I': 1, 'V': 5, 'X': 10, 'L': 50,
    'C': 100, 'D': 500, 'M': 1000
  };

  while (i < cleanRoman.length) {
    const current = romanValues[cleanRoman[i]];
    const next = romanValues[cleanRoman[i + 1]];

    if (!current) {
      throw new Error(`Invalid Roman numeral character: ${cleanRoman[i]}`);
    }

    if (next && current < next) {
      result += (next - current);
      i += 2;
    } else {
      result += current;
      i += 1;
    }
  }

  return result;
}

/**
 * Validate if a string is a valid Roman numeral
 */
export function isValidRoman(roman: string): boolean {
  try {
    const num = convertFromRoman(roman);
    return num > 0 && num <= 3999 && convertToRoman(num) === roman.toUpperCase().trim();
  } catch {
    return false;
  }
}

/**
 * Format a modern date into Roman numeral format
 */
export function formatRomanDate(date: Date, format: RomanDateFormat = 'classical'): DateConversionResult {
  try {
    const day = date.getDate();
    const month = date.getMonth() + 1; // JavaScript months are 0-based
    const year = date.getFullYear();

    if (year <= 0 || year > 3999) {
      return {
        success: false,
        error: 'Year must be between 1 and 3999 CE'
      };
    }

    const romanDay = convertToRoman(day);
    const romanYear = convertToRoman(year);
    const latinMonth = LATIN_MONTHS[month as keyof typeof LATIN_MONTHS];
    const latinMonthShort = LATIN_MONTHS_SHORT[month as keyof typeof LATIN_MONTHS_SHORT];

    let result: string;

    switch (format) {
      case 'classical':
        result = `${romanDay} ${latinMonth} ${romanYear}`;
        break;
      case 'medieval':
        result = `${romanDay} DIE ${latinMonth} ANNO DOMINI ${romanYear}`;
        break;
      case 'minimal':
        result = `${romanDay}.${latinMonthShort}.${romanYear}`;
        break;
      case 'decorative':
        // Use Unicode Roman numeral characters where possible
        const decorativeDay = romanDay.replace(/I/g, 'Ⅰ').replace(/V/g, 'Ⅴ').replace(/X/g, 'Ⅹ');
        const decorativeYear = romanYear.replace(/M/g, 'Ⅿ').replace(/I/g, 'Ⅰ').replace(/V/g, 'Ⅴ').replace(/X/g, 'Ⅹ');
        result = `${decorativeDay} • ${latinMonth} • ${decorativeYear}`;
        break;
      default:
        result = `${romanDay} ${latinMonth} ${romanYear}`;
    }

    return {
      success: true,
      result
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Parse a Roman date string back to a modern date
 */
export function parseRomanDate(romanDate: string): ParsedRomanDate | null {
  if (!romanDate || typeof romanDate !== 'string') {
    return null;
  }

  const cleaned = romanDate.toUpperCase().trim();
  
  // Try different patterns
  const patterns = [
    // Classical: "XIX APRILIS MMXXIV"
    /^([IVXLCDM]+)\s+([A-Z]+)\s+([IVXLCDM]+)$/,
    // Medieval: "XIX DIE APRILIS ANNO DOMINI MMXXIV"
    /^([IVXLCDM]+)\s+DIE\s+([A-Z]+)\s+ANNO\s+DOMINI\s+([IVXLCDM]+)$/,
    // Minimal: "XIX.APR.MMXXIV"
    /^([IVXLCDM]+)\.([A-Z]+)\.([IVXLCDM]+)$/,
    // Decorative (convert back to regular Roman)
    /^([ⅠⅤⅩⅬⅭⅮⅯIVXLCDM]+)\s*[•·]\s*([A-Z]+)\s*[•·]\s*([ⅠⅤⅩⅬⅭⅮⅯIVXLCDM]+)$/
  ];

  for (let i = 0; i < patterns.length; i++) {
    const match = cleaned.match(patterns[i]);
    if (match) {
      try {
        let dayRoman = match[1];
        const monthLatin = match[2];
        let yearRoman = match[3];

        // Convert decorative Unicode back to regular Roman
        if (i === 3) {
          dayRoman = dayRoman.replace(/[ⅠⅤⅩⅬⅭⅮⅯ]/g, (char) => {
            const map: { [key: string]: string } = {
              'Ⅰ': 'I', 'Ⅴ': 'V', 'Ⅹ': 'X', 'Ⅼ': 'L',
              'Ⅽ': 'C', 'Ⅾ': 'D', 'Ⅿ': 'M'
            };
            return map[char] || char;
          });
          yearRoman = yearRoman.replace(/[ⅠⅤⅩⅬⅭⅮⅯ]/g, (char) => {
            const map: { [key: string]: string } = {
              'Ⅰ': 'I', 'Ⅴ': 'V', 'Ⅹ': 'X', 'Ⅼ': 'L',
              'Ⅽ': 'C', 'Ⅾ': 'D', 'Ⅿ': 'M'
            };
            return map[char] || char;
          });
        }

        const day = convertFromRoman(dayRoman);
        const year = convertFromRoman(yearRoman);
        const month = LATIN_MONTH_REVERSE[monthLatin];

        if (!month || day < 1 || day > 31 || year < 1 || year > 3999) {
          continue;
        }

        return {
          day,
          month,
          year,
          format: ['classical', 'medieval', 'minimal', 'decorative'][i] as RomanDateFormat
        };
      } catch {
        continue;
      }
    }
  }

  return null;
}

/**
 * Convert a Roman date string to a JavaScript Date object
 */
export function romanDateToDate(romanDate: string): Date | null {
  const parsed = parseRomanDate(romanDate);
  if (!parsed || !parsed.day || !parsed.month || !parsed.year) {
    return null;
  }

  try {
    const date = new Date(parsed.year, parsed.month - 1, parsed.day);
    
    // Validate the date is correct (handles invalid dates like Feb 30)
    if (date.getFullYear() === parsed.year && 
        date.getMonth() === parsed.month - 1 && 
        date.getDate() === parsed.day) {
      return date;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Get all supported date formats for a given date
 */
export function getAllRomanFormats(date: Date): { [K in RomanDateFormat]: string } {
  const formats: { [K in RomanDateFormat]: string } = {
    classical: '',
    medieval: '',
    minimal: '',
    decorative: ''
  };

  const formatKeys: RomanDateFormat[] = ['classical', 'medieval', 'minimal', 'decorative'];
  
  formatKeys.forEach(format => {
    const result = formatRomanDate(date, format);
    formats[format] = result.success ? result.result! : 'Error';
  });

  return formats;
}

/**
 * Validate a date range for Roman numeral conversion
 */
export function validateDateRange(date: Date): { valid: boolean; error?: string } {
  const year = date.getFullYear();
  
  if (year <= 0) {
    return { valid: false, error: 'Year must be positive (CE dates only)' };
  }
  
  if (year > 3999) {
    return { valid: false, error: 'Year must be 3999 or earlier for Roman numeral conversion' };
  }
  
  return { valid: true };
}

/**
 * Get date examples for demonstration
 */
export function getDateExamples(): Array<{ modern: string; roman: string; description: string }> {
  return [
    {
      modern: '2024-12-25',
      roman: 'XXV DECEMBER MMXXIV',
      description: 'Christmas Day 2024'
    },
    {
      modern: '1776-07-04',
      roman: 'IV IULIUS MDCCLXXVI',
      description: 'American Independence Day'
    },
    {
      modern: '2000-01-01',
      roman: 'I IANUARIUS MM',
      description: 'Millennium celebration'
    },
    {
      modern: '1969-07-20',
      roman: 'XX IULIUS MCMLXIX',
      description: 'Moon landing date'
    },
    {
      modern: '44-03-15',
      roman: 'XV MARTIUS XLIV',
      description: 'Ides of March (Caesar assassination)'
    }
  ];
}