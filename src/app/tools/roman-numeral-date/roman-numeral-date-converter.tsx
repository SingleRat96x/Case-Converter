'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function toRoman(num: number): string {
  const romanNumerals = [
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

  let result = '';
  let remaining = num;

  for (const { value, numeral } of romanNumerals) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }

  return result;
}

function fromRoman(roman: string): number {
  const romanValues: { [key: string]: number } = {
    'I': 1,
    'V': 5,
    'X': 10,
    'L': 50,
    'C': 100,
    'D': 500,
    'M': 1000
  };

  let result = 0;
  for (let i = 0; i < roman.length; i++) {
    const current = romanValues[roman[i]];
    const next = romanValues[roman[i + 1]];

    if (next > current) {
      result += next - current;
      i++;
    } else {
      result += current;
    }
  }

  return result;
}

export function RomanNumeralDateConverter() {
  const [date, setDate] = useState('');
  const [romanDate, setRomanDate] = useState('');
  const [mode, setMode] = useState('to-roman');
  const [format, setFormat] = useState('dd-mm-yyyy');

  const convertToRoman = (dateStr: string) => {
    try {
      let day: number, month: number, year: number;

      if (format === 'dd-mm-yyyy') {
        [day, month, year] = dateStr.split('-').map(Number);
      } else {
        [month, day, year] = dateStr.split('-').map(Number);
      }

      if (isNaN(day) || isNaN(month) || isNaN(year)) {
        throw new Error('Invalid date format');
      }

      const romanDay = toRoman(day);
      const romanMonth = toRoman(month);
      const romanYear = toRoman(year);

      setRomanDate(`${romanDay}-${romanMonth}-${romanYear}`);
    } catch (error) {
      setRomanDate('Invalid date format');
    }
  };

  const convertFromRoman = (romanStr: string) => {
    try {
      const [romanDay, romanMonth, romanYear] = romanStr.split('-');
      
      const day = fromRoman(romanDay.toUpperCase());
      const month = fromRoman(romanMonth.toUpperCase());
      const year = fromRoman(romanYear.toUpperCase());

      if (format === 'dd-mm-yyyy') {
        setDate(`${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`);
      } else {
        setDate(`${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}-${year}`);
      }
    } catch (error) {
      setDate('Invalid Roman numeral format');
    }
  };

  const handleConvert = () => {
    if (mode === 'to-roman') {
      convertToRoman(date);
    } else {
      convertFromRoman(romanDate);
    }
  };

  const handleClear = () => {
    setDate('');
    setRomanDate('');
  };

  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="mode">Conversion Mode:</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger id="mode">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="to-roman">Date to Roman Numerals</SelectItem>
                  <SelectItem value="from-roman">Roman Numerals to Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="format">Date Format:</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger id="format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                  <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {mode === 'to-roman' ? (
            <div className="grid gap-2">
              <Label htmlFor="date">Enter Date (e.g., {format === 'dd-mm-yyyy' ? '25-12-2024' : '12-25-2024'}):</Label>
              <Input
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder={format === 'dd-mm-yyyy' ? 'DD-MM-YYYY' : 'MM-DD-YYYY'}
              />
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="roman">Enter Roman Numeral Date (e.g., XXV-XII-MMXXIV):</Label>
              <Input
                id="roman"
                value={romanDate}
                onChange={(e) => setRomanDate(e.target.value)}
                placeholder="XXV-XII-MMXXIV"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleConvert}>
              Convert
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {(mode === 'to-roman' ? romanDate : date) && (
        <Card className="p-6">
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Result</h3>
            <p className="text-xl font-mono">
              {mode === 'to-roman' ? romanDate : date}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
} 