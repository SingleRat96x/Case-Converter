'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Copy, Download, RefreshCw } from 'lucide-react';

export function AsciiArtConverter() {
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState('');
  const [width, setWidth] = useState('80');
  const [colorMode, setColorMode] = useState('monochrome');
  const [inverted, setInverted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleConvert = async () => {
    if (!image) return;

    setLoading(true);
    try {
      // Here you would implement the actual ASCII art conversion
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResult('ASCII art will be generated here...\nImplement actual conversion logic.');
    } catch (error) {
      console.error('Error converting image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
    }
  };

  const handleDownload = () => {
    if (result) {
      const blob = new Blob([result], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ascii-art.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setImage(null);
    setResult('');
    setWidth('80');
    setColorMode('monochrome');
    setInverted(false);
  };

  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="image">Upload Image:</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="cursor-pointer"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="width">Output Width (characters):</Label>
              <Input
                id="width"
                type="number"
                min="20"
                max="200"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="colorMode">Color Mode:</Label>
              <Select value={colorMode} onValueChange={setColorMode}>
                <SelectTrigger id="colorMode">
                  <SelectValue placeholder="Select color mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monochrome">Monochrome</SelectItem>
                  <SelectItem value="grayscale">Grayscale</SelectItem>
                  <SelectItem value="color">Color</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="inverted"
              checked={inverted}
              onCheckedChange={setInverted}
            />
            <Label htmlFor="inverted">Invert Colors</Label>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleConvert}
              disabled={!image || loading}
              className="flex-1 sm:flex-none"
            >
              {loading ? 'Converting...' : 'Convert to ASCII'}
            </Button>
            <Button
              onClick={handleCopy}
              disabled={!result}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button
              onClick={handleDownload}
              disabled={!result}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {result && (
        <Card className="p-6">
          <div className="grid gap-2">
            <Label>Result:</Label>
            <Textarea
              value={result}
              readOnly
              rows={20}
              className="font-mono text-xs whitespace-pre"
            />
          </div>
        </Card>
      )}
    </div>
  );
} 