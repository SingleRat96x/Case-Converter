'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { BasePasswordGenerator } from '@/components/shared/BasePasswordGenerator';
import { AnimatedIPOutput } from '@/components/shared/AnimatedIPOutput';
import { InteractiveSlider } from '@/components/shared/InteractiveSlider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ValidationErrors {
  quantity?: string;
  customRange?: string;
}

type IPVersion = 'ipv4' | 'ipv6';
type IPType = 'any' | 'private' | 'public' | 'custom';
type OutputFormat = 'standard' | 'cidr' | 'hex' | 'binary';

export function RandomIPGenerator() {
  const { common, tool } = useToolTranslations('tools/random-generators');
  
  // Form state
  const [ipVersion, setIPVersion] = useState<IPVersion>('ipv4');
  const [ipType, setIPType] = useState<IPType>('any');
  const [quantity, setQuantity] = useState<number>(1);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('standard');
  const [allowDuplicates, setAllowDuplicates] = useState<boolean>(true);
  const [sortResults, setSortResults] = useState<boolean>(false);
  const [customRange, setCustomRange] = useState<string>('192.168.1.0/24');
  
  // Generated content state
  const [generatedIPs, setGeneratedIPs] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Private IP ranges
  const privateRanges = {
    ipv4: [
      '10.0.0.0/8',
      '172.16.0.0/12', 
      '192.168.0.0/16'
    ],
    ipv6: [
      'fc00::/7',  // Unique local addresses
      'fe80::/10'  // Link-local addresses
    ]
  };

  // CIDR validation
  const isValidCIDR = useCallback((cidr: string): boolean => {
    const parts = cidr.split('/');
    if (parts.length !== 2) return false;
    
    const [ip, mask] = parts;
    const maskNum = parseInt(mask);
    
    if (ipVersion === 'ipv4') {
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      return ipRegex.test(ip) && maskNum >= 1 && maskNum <= 32;
    } else {
      const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
      return ipv6Regex.test(ip) && maskNum >= 1 && maskNum <= 128;
    }
  }, [ipVersion]);

  // Validation function
  const validateInputs = useCallback((): boolean => {
    const errors: ValidationErrors = {};
    
    // Validate quantity
    if (quantity < 1 || quantity > 10000) {
      errors.quantity = tool('randomIP.validation.quantityInvalid');
    }

    // Validate custom range if selected
    if (ipType === 'custom') {
      if (!customRange.trim()) {
        errors.customRange = tool('randomIP.validation.customRangeRequired');
      } else if (!isValidCIDR(customRange)) {
        errors.customRange = tool('randomIP.validation.invalidCIDR');
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [quantity, ipType, customRange, tool, isValidCIDR]);

  // Generate cryptographically secure random IP
  const generateSecureRandomIP = useCallback((): string => {
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    
    if (ipVersion === 'ipv4') {
      return generateIPv4(randomBytes);
    } else {
      return generateIPv6(randomBytes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ipVersion]);

  // Generate IPv4 address
  const generateIPv4 = (randomBytes: Uint8Array): string => {
    let ip: string;
    
    if (ipType === 'private') {
      // Generate from private ranges
      const range = privateRanges.ipv4[Math.floor((randomBytes[0] / 256) * privateRanges.ipv4.length)];
      ip = generateFromRange(range, randomBytes);
    } else if (ipType === 'public') {
      // Generate public IP (avoid private ranges)
      do {
        const octets = Array.from(randomBytes.slice(0, 4));
        ip = octets.join('.');
      } while (isPrivateIP(ip));
    } else if (ipType === 'custom') {
      ip = generateFromRange(customRange, randomBytes);
    } else {
      // Any IP
      const octets = Array.from(randomBytes.slice(0, 4));
      ip = octets.join('.');
    }
    
    return ip;
  };

  // Generate IPv6 address
  const generateIPv6 = (randomBytes: Uint8Array): string => {
    if (ipType === 'private') {
      const range = privateRanges.ipv6[Math.floor((randomBytes[0] / 256) * privateRanges.ipv6.length)];
      return generateFromRange(range, randomBytes);
    }
    
    // Generate full IPv6 address
    const groups = [];
    for (let i = 0; i < 8; i++) {
      const group = (randomBytes[i * 2] << 8) | randomBytes[i * 2 + 1];
      groups.push(group.toString(16).padStart(4, '0'));
    }
    return groups.join(':');
  };

  // Generate IP from CIDR range
  const generateFromRange = (cidr: string, randomBytes: Uint8Array): string => {
    const [baseIP, mask] = cidr.split('/');
    const maskBits = parseInt(mask);
    
    if (ipVersion === 'ipv4') {
      const baseOctets = baseIP.split('.').map(Number);
      const availableBits = 32 - maskBits;
      const maxHosts = Math.pow(2, availableBits) - 1;
      
      // Generate random host part
      const hostId = Math.floor((randomBytes[0] / 256) * maxHosts);
      
      // Apply host ID to base IP
      let ip = (baseOctets[0] << 24) | (baseOctets[1] << 16) | (baseOctets[2] << 8) | baseOctets[3];
      ip = (ip & ~(maxHosts)) | hostId;
      
      return [
        (ip >>> 24) & 255,
        (ip >>> 16) & 255,
        (ip >>> 8) & 255,
        ip & 255
      ].join('.');
    }
    
    return baseIP; // Simplified IPv6 generation
  };

  // Check if IPv4 is private
  const isPrivateIP = (ip: string): boolean => {
    const octets = ip.split('.').map(Number);
    const ipNum = (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
    
    return (
      (ipNum >= 0x0A000000 && ipNum <= 0x0AFFFFFF) || // 10.0.0.0/8
      (ipNum >= 0xAC100000 && ipNum <= 0xAC1FFFFF) || // 172.16.0.0/12
      (ipNum >= 0xC0A80000 && ipNum <= 0xC0A8FFFF)    // 192.168.0.0/16
    );
  };

  // Format IP based on selected format
  const formatIP = useCallback((ip: string): string => {
    switch (outputFormat) {
      case 'standard':
        return ip;
      case 'cidr':
        return `${ip}/${ipVersion === 'ipv4' ? '32' : '128'}`;
      case 'hex':
        if (ipVersion === 'ipv4') {
          return ip.split('.').map(octet => 
            parseInt(octet).toString(16).padStart(2, '0')
          ).join(':');
        }
        return ip.replace(/:/g, '');
      case 'binary':
        if (ipVersion === 'ipv4') {
          return ip.split('.').map(octet =>
            parseInt(octet).toString(2).padStart(8, '0')
          ).join('.');
        }
        return ip; // IPv6 binary conversion is complex
      default:
        return ip;
    }
  }, [outputFormat, ipVersion]);

  // Generate random IPs
  const handleGenerate = useCallback(async () => {
    if (!validateInputs()) {
      return;
    }

    setIsGenerating(true);
    setIsAnimating(true);
    
    try {
      // Delay for animation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const ips: string[] = [];
      const usedIPs = new Set<string>();
      
      for (let i = 0; i < quantity; i++) {
        let randomIP: string;
        
        if (allowDuplicates) {
          randomIP = generateSecureRandomIP();
        } else {
          let attempts = 0;
          do {
            randomIP = generateSecureRandomIP();
            attempts++;
            if (attempts > quantity * 10) break;
          } while (usedIPs.has(randomIP) && usedIPs.size < Math.pow(2, ipVersion === 'ipv4' ? 32 : 64));
          
          usedIPs.add(randomIP);
        }
        
        ips.push(randomIP);
      }
      
      // Sort IPs if requested
      if (sortResults) {
        ips.sort((a, b) => {
          if (ipVersion === 'ipv4') {
            const aNum = a.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
            const bNum = b.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
            return aNum - bNum;
          }
          return a.localeCompare(b);
        });
      }
      
      // Format output with separators
      const formattedIPs = ips.map(ip => formatIP(ip));
      const output = formattedIPs.join(' | ');
      setGeneratedIPs(output);
      
      // Reset animation after IPs are set
      setTimeout(() => {
        setIsAnimating(false);
      }, 200);
      
    } catch (error) {
      console.error('Error generating random IPs:', error);
      setValidationErrors({ quantity: tool('randomIP.validation.generationError') });
      setIsAnimating(false);
    } finally {
      setIsGenerating(false);
    }
  }, [quantity, ipVersion, allowDuplicates, sortResults, validateInputs, generateSecureRandomIP, formatIP, tool]);

  // Generate IPs on component mount and when settings change
  useEffect(() => {
    const generateIPs = async () => {
      if (!validateInputs()) {
        return;
      }

      setIsGenerating(true);
      setIsAnimating(true);
      
      try {
        // Delay for animation
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const ips: string[] = [];
        const usedIPs = new Set<string>();
        
        for (let i = 0; i < quantity; i++) {
          let randomIP: string;
          
          if (allowDuplicates) {
            randomIP = generateSecureRandomIP();
          } else {
            let attempts = 0;
            do {
              randomIP = generateSecureRandomIP();
              attempts++;
              if (attempts > quantity * 10) break;
            } while (usedIPs.has(randomIP) && usedIPs.size < Math.pow(2, ipVersion === 'ipv4' ? 32 : 64));
            
            usedIPs.add(randomIP);
          }
          
          ips.push(randomIP);
        }
        
        // Sort IPs if requested
        if (sortResults) {
          ips.sort((a, b) => {
            if (ipVersion === 'ipv4') {
              const aNum = a.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
              const bNum = b.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
              return aNum - bNum;
            }
            return a.localeCompare(b);
          });
        }
        
        // Format output with separators
        const formattedIPs = ips.map(ip => formatIP(ip));
        const output = formattedIPs.join(' | ');
        setGeneratedIPs(output);
        
        // Reset animation after IPs are set
        setTimeout(() => {
          setIsAnimating(false);
        }, 200);
        
      } catch (error) {
        console.error('Error generating random IPs:', error);
        setValidationErrors({ quantity: tool('randomIP.validation.generationError') });
        setIsAnimating(false);
      } finally {
        setIsGenerating(false);
      }
    };

    generateIPs();
  }, [quantity, ipVersion, ipType, customRange, allowDuplicates, sortResults, outputFormat, validateInputs, generateSecureRandomIP, formatIP, tool]);

  const ipTypeOptions = [
    {
      id: 'any',
      label: tool('randomIP.options.any'),
      icon: '🌐',
      checked: ipType === 'any',
      onChange: () => setIPType('any')
    },
    {
      id: 'private',
      label: tool('randomIP.options.private'),
      icon: '🏠',
      checked: ipType === 'private',
      onChange: () => setIPType('private')
    },
    {
      id: 'public',
      label: tool('randomIP.options.public'),
      icon: '🌍',
      checked: ipType === 'public',
      onChange: () => setIPType('public')
    },
    {
      id: 'custom',
      label: tool('randomIP.options.custom'),
      icon: '⚙️',
      checked: ipType === 'custom',
      onChange: () => setIPType('custom')
    }
  ];

  const outputFormatOptions = [
    {
      id: 'standard',
      label: tool('randomIP.options.standard'),
      icon: '📝',
      checked: outputFormat === 'standard',
      onChange: () => setOutputFormat('standard')
    },
    {
      id: 'cidr',
      label: tool('randomIP.options.cidr'),
      icon: '🔗',
      checked: outputFormat === 'cidr',
      onChange: () => setOutputFormat('cidr')
    },
    {
      id: 'hex',
      label: tool('randomIP.options.hex'),
      icon: '🔢',
      checked: outputFormat === 'hex',
      onChange: () => setOutputFormat('hex')
    },
    {
      id: 'binary',
      label: tool('randomIP.options.binary'),
      icon: '⚡',
      checked: outputFormat === 'binary',
      onChange: () => setOutputFormat('binary')
    }
  ];

  return (
    <BasePasswordGenerator
      title={tool('randomIP.title')}
      description={tool('randomIP.description')}
    >
      {/* IP Output */}
      <AnimatedIPOutput
        ips={generatedIPs}
        onRegenerate={handleGenerate}
        isGenerating={isGenerating}
        isAnimating={isAnimating}
        copyText={common('buttons.copy')}
      />

      {/* Quantity Slider */}
      <InteractiveSlider
        value={quantity}
        min={1}
        max={100}
        step={1}
        label={`${tool('randomIP.options.quantity')}: ${quantity}`}
        onChange={setQuantity}
      />

      {/* IP Version Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">{tool('randomIP.options.ipVersion')}</Label>
        <div className="flex gap-2">
          <button
            onClick={() => setIPVersion('ipv4')}
            className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
              ipVersion === 'ipv4'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-input hover:bg-muted'
            }`}
          >
            {tool('randomIP.options.ipv4')}
          </button>
          <button
            onClick={() => setIPVersion('ipv6')}
            className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
              ipVersion === 'ipv6'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-input hover:bg-muted'
            }`}
          >
            {tool('randomIP.options.ipv6')}
          </button>
        </div>
      </div>

      {/* IP Type Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">{tool('randomIP.options.ipType')}</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tool('randomIP.help.ipType')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ipTypeOptions.map((option) => (
            <label
              key={option.id}
              className={`
                relative flex flex-col items-center justify-center min-h-[60px] px-3 py-2 rounded-lg border cursor-pointer
                transition-all duration-200 hover:scale-105 select-none text-sm font-medium
                ${
                  option.checked
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-input bg-background text-foreground hover:border-primary/50 hover:bg-muted/50'
                }
              `}
            >
              <input
                type="radio"
                name="ipType"
                checked={option.checked}
                onChange={() => option.onChange()}
                className="sr-only"
              />
              <span className="text-lg mb-1">{option.icon}</span>
              <span className="text-xs text-center">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Custom Range Input */}
      {ipType === 'custom' && (
        <div className="space-y-2">
          <Label htmlFor="customRange">{tool('randomIP.options.customRange')}</Label>
          <Input
            id="customRange"
            value={customRange}
            onChange={(e) => setCustomRange(e.target.value)}
            placeholder={tool('randomIP.placeholders.customRange')}
            className={validationErrors.customRange ? 'border-destructive' : ''}
          />
          {validationErrors.customRange && (
            <p className="text-sm text-destructive">{validationErrors.customRange}</p>
          )}
        </div>
      )}

      {/* Output Format Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">{tool('randomIP.options.outputFormat')}</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tool('randomIP.help.outputFormat')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {outputFormatOptions.map((option) => (
            <label
              key={option.id}
              className={`
                relative flex flex-col items-center justify-center min-h-[60px] px-3 py-2 rounded-lg border cursor-pointer
                transition-all duration-200 hover:scale-105 select-none text-sm font-medium
                ${
                  option.checked
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-input bg-background text-foreground hover:border-primary/50 hover:bg-muted/50'
                }
              `}
            >
              <input
                type="radio"
                name="outputFormat"
                checked={option.checked}
                onChange={() => option.onChange()}
                className="sr-only"
              />
              <span className="text-lg mb-1">{option.icon}</span>
              <span className="text-xs text-center">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="allowDuplicates">{tool('randomIP.options.allowDuplicates')}</Label>
          <Switch
            id="allowDuplicates"
            checked={allowDuplicates}
            onCheckedChange={setAllowDuplicates}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="sortResults">{tool('randomIP.options.sortResults')}</Label>
          <Switch
            id="sortResults"
            checked={sortResults}
            onCheckedChange={setSortResults}
          />
        </div>
      </div>
    </BasePasswordGenerator>
  );
}