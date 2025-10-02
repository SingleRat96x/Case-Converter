'use client';

import React, { useState } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { BaseRandomGenerator } from '@/components/shared/BaseRandomGenerator';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { InteractiveSlider } from '@/components/shared/InteractiveSlider';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type UUIDVersion = '1' | '4';
type UUIDFormat = 'standard' | 'compact' | 'braced' | 'urn';

export function UUIDGenerator() {
  const { common, tool } = useToolTranslations('tools/random-generators');
  
  // Form state
  const [version, setVersion] = useState<UUIDVersion>('4');
  const [format, setFormat] = useState<UUIDFormat>('standard');
  const [quantity, setQuantity] = useState<number>(10);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [removeDashes, setRemoveDashes] = useState<boolean>(false);
  
  // Generated content state
  const [generatedUUIDs, setGeneratedUUIDs] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Generate UUID v4 (random)
  const generateUUIDv4 = (): string => {
    const randomValues = new Uint8Array(16);
    crypto.getRandomValues(randomValues);
    
    // Set version (4) and variant bits
    randomValues[6] = (randomValues[6] & 0x0f) | 0x40; // Version 4
    randomValues[8] = (randomValues[8] & 0x3f) | 0x80; // Variant 10
    
    const hex = Array.from(randomValues)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return [
      hex.substring(0, 8),
      hex.substring(8, 12),
      hex.substring(12, 16),
      hex.substring(16, 20),
      hex.substring(20, 32)
    ].join('-');
  };

  // Generate UUID v1 (timestamp-based) - simplified version
  const generateUUIDv1 = (): string => {
    const timestamp = Date.now();
    const randomValues = new Uint8Array(10);
    crypto.getRandomValues(randomValues);
    
    // Convert timestamp to UUID v1 format (simplified)
    const timeHex = timestamp.toString(16).padStart(16, '0');
    const clockSeq = Array.from(randomValues.slice(0, 2))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const node = Array.from(randomValues.slice(2, 8))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const uuid = [
      timeHex.substring(8, 16), // time_low
      timeHex.substring(4, 8),  // time_mid
      '1' + timeHex.substring(1, 4), // time_hi_and_version
      clockSeq,
      node
    ].join('-');
    
    return uuid;
  };

  // Format UUID according to selected format
  const formatUUID = React.useCallback((uuid: string): string => {
    let formatted = uuid;
    
    if (removeDashes || format === 'compact') {
      formatted = formatted.replace(/-/g, '');
    }
    
    if (uppercase) {
      formatted = formatted.toUpperCase();
    }
    
    switch (format) {
      case 'braced':
        return `{${formatted}}`;
      case 'urn':
        return `urn:uuid:${formatted}`;
      case 'compact':
        return formatted.replace(/-/g, '');
      default:
        return formatted;
    }
  }, [format, uppercase, removeDashes]);

  // Generate UUIDs
  const handleGenerate = React.useCallback(async () => {
    setIsGenerating(true);
    
    try {
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const uuids: string[] = [];
      
      for (let i = 0; i < quantity; i++) {
        let uuid: string;
        
        if (version === '1') {
          uuid = generateUUIDv1();
        } else {
          uuid = generateUUIDv4();
        }
        
        uuids.push(formatUUID(uuid));
      }
      
      setGeneratedUUIDs(uuids.join('\n'));
      
    } catch (error) {
      console.error('Error generating UUIDs:', error);
      setGeneratedUUIDs('Error generating UUIDs');
    } finally {
      setIsGenerating(false);
    }
  }, [version, quantity, formatUUID]);

  // Generate on component mount and when settings change
  React.useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleClear = () => {
    setGeneratedUUIDs('');
  };

  return (
    <BaseRandomGenerator
      title={tool('uuidGenerator.title')}
      description={tool('uuidGenerator.description')}
      generateButtonText={tool('uuidGenerator.generateButton')}
      outputLabel={tool('uuidGenerator.outputLabel')}
      copyText={common('buttons.copy')}
      clearText={common('buttons.clear')}
      downloadText={common('buttons.download')}
      downloadFileName={tool('uuidGenerator.downloadFileName')}
      onGenerate={handleGenerate}
      generatedContent={generatedUUIDs}
      onClearContent={handleClear}
      isGenerating={isGenerating}
      useMonoFont={true}
      showAnalytics={false}
      alwaysShowActions={true}
      hideUploadButton={true}
    >
      {/* UUID Version */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="uuid-version">{tool('uuidGenerator.options.version')}</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tool('uuidGenerator.help.version')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select value={version} onValueChange={(value: UUIDVersion) => setVersion(value)}>
          <SelectTrigger id="uuid-version">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="4">{tool('uuidGenerator.versions.v4')}</SelectItem>
            <SelectItem value="1">{tool('uuidGenerator.versions.v1')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* UUID Format */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="uuid-format">{tool('uuidGenerator.options.format')}</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tool('uuidGenerator.help.format')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select value={format} onValueChange={(value: UUIDFormat) => setFormat(value)}>
          <SelectTrigger id="uuid-format">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">{tool('uuidGenerator.formats.standard')}</SelectItem>
            <SelectItem value="compact">{tool('uuidGenerator.formats.compact')}</SelectItem>
            <SelectItem value="braced">{tool('uuidGenerator.formats.braced')}</SelectItem>
            <SelectItem value="urn">{tool('uuidGenerator.formats.urn')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quantity Slider */}
      <InteractiveSlider
        value={quantity}
        min={1}
        max={100}
        step={1}
        label={`${tool('uuidGenerator.options.quantity')}: ${quantity}`}
        onChange={setQuantity}
      />

      {/* Formatting Options */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">{tool('uuidGenerator.options.formatting')}</h3>
        
        {/* Uppercase */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="uppercase-switch">{tool('uuidGenerator.options.uppercase')}</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{tool('uuidGenerator.help.uppercase')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Switch
            id="uppercase-switch"
            checked={uppercase}
            onCheckedChange={setUppercase}
          />
        </div>

        {/* Remove Dashes (only show when not using compact/braced/urn format) */}
        {format === 'standard' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="remove-dashes-switch">{tool('uuidGenerator.options.removeDashes')}</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{tool('uuidGenerator.help.removeDashes')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              id="remove-dashes-switch"
              checked={removeDashes}
              onCheckedChange={setRemoveDashes}
            />
          </div>
        )}
      </div>
    </BaseRandomGenerator>
  );
}