// Email extraction and validation utilities

export interface ExtractedEmail {
  email: string;
  isValid: boolean;
  domain: string;
  localPart: string;
  position: number;
}

export interface EmailExtractionResult {
  emails: ExtractedEmail[];
  totalCount: number;
  uniqueCount: number;
  validCount: number;
  invalidCount: number;
  domains: Record<string, number>;
  duplicates: string[];
}

export interface EmailExtractionOptions {
  mode: 'simple' | 'comprehensive' | 'strict';
  removeDuplicates: boolean;
  sortBy: 'alphabetical' | 'domain' | 'position' | 'validity';
  sortOrder: 'asc' | 'desc';
  validateEmails: boolean;
}

// Email regex patterns
const EMAIL_PATTERNS = {
  // Simple pattern for basic email extraction
  simple: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  
  // Comprehensive pattern for more thorough extraction
  comprehensive: /\b[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}\b/g,
  
  // Strict pattern following RFC 5322 more closely
  strict: /\b[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\b/g
};

// More comprehensive email validation
export function validateEmail(email: string): boolean {
  // Basic format check
  const basicPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basicPattern.test(email)) return false;
  
  // Check for valid characters
  const validPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!validPattern.test(email)) return false;
  
  // Additional checks
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  
  const [localPart, domain] = parts;
  
  // Local part checks
  if (localPart.length === 0 || localPart.length > 64) return false;
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
  if (localPart.includes('..')) return false;
  
  // Domain checks
  if (domain.length === 0 || domain.length > 253) return false;
  if (domain.startsWith('.') || domain.endsWith('.')) return false;
  if (domain.includes('..')) return false;
  
  // Check for valid TLD
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2 || tld.length > 6) return false;
  
  return true;
}

// Extract domain from email
export function extractDomain(email: string): string {
  const atIndex = email.lastIndexOf('@');
  return atIndex !== -1 ? email.substring(atIndex + 1).toLowerCase() : '';
}

// Extract local part from email
export function extractLocalPart(email: string): string {
  const atIndex = email.lastIndexOf('@');
  return atIndex !== -1 ? email.substring(0, atIndex) : email;
}

// Main email extraction function
export function extractEmails(
  text: string, 
  options: EmailExtractionOptions = {
    mode: 'comprehensive',
    removeDuplicates: true,
    sortBy: 'alphabetical',
    sortOrder: 'asc',
    validateEmails: true
  }
): EmailExtractionResult {
  if (!text || text.trim().length === 0) {
    return {
      emails: [],
      totalCount: 0,
      uniqueCount: 0,
      validCount: 0,
      invalidCount: 0,
      domains: {},
      duplicates: []
    };
  }

  // Get the appropriate regex pattern
  const pattern = EMAIL_PATTERNS[options.mode];
  const matches = Array.from(text.matchAll(pattern));
  
  // Extract emails with position information
  const extractedEmails: ExtractedEmail[] = matches.map(match => {
    const email = match[0].toLowerCase().trim();
    const domain = extractDomain(email);
    const localPart = extractLocalPart(email);
    const isValid = options.validateEmails ? validateEmail(email) : true;
    
    return {
      email,
      isValid,
      domain,
      localPart,
      position: match.index || 0
    };
  });

  // Handle duplicates
  const duplicates: string[] = [];
  const uniqueEmails: ExtractedEmail[] = [];
  const seenEmails = new Set<string>();

  for (const emailObj of extractedEmails) {
    if (seenEmails.has(emailObj.email)) {
      if (!duplicates.includes(emailObj.email)) {
        duplicates.push(emailObj.email);
      }
    } else {
      seenEmails.add(emailObj.email);
      uniqueEmails.push(emailObj);
    }
  }

  // Use unique emails or all emails based on options
  const finalEmails = options.removeDuplicates ? uniqueEmails : extractedEmails;

  // Sort emails
  const sortedEmails = sortEmails(finalEmails, options.sortBy, options.sortOrder);

  // Calculate domain statistics
  const domains: Record<string, number> = {};
  finalEmails.forEach(emailObj => {
    domains[emailObj.domain] = (domains[emailObj.domain] || 0) + 1;
  });

  // Calculate statistics
  const validCount = finalEmails.filter(e => e.isValid).length;
  const invalidCount = finalEmails.length - validCount;

  return {
    emails: sortedEmails,
    totalCount: extractedEmails.length,
    uniqueCount: uniqueEmails.length,
    validCount,
    invalidCount,
    domains,
    duplicates
  };
}

// Sort emails based on criteria
function sortEmails(
  emails: ExtractedEmail[], 
  sortBy: EmailExtractionOptions['sortBy'], 
  sortOrder: EmailExtractionOptions['sortOrder']
): ExtractedEmail[] {
  const sorted = [...emails].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'alphabetical':
        comparison = a.email.localeCompare(b.email);
        break;
      case 'domain':
        comparison = a.domain.localeCompare(b.domain) || a.email.localeCompare(b.email);
        break;
      case 'position':
        comparison = a.position - b.position;
        break;
      case 'validity':
        comparison = (b.isValid ? 1 : 0) - (a.isValid ? 1 : 0) || a.email.localeCompare(b.email);
        break;
      default:
        comparison = a.email.localeCompare(b.email);
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
  
  return sorted;
}

// Export emails to different formats
export function exportEmails(emails: ExtractedEmail[], format: 'txt' | 'csv' | 'json'): string {
  switch (format) {
    case 'txt':
      return emails.map(e => e.email).join('\n');
    
    case 'csv':
      const csvHeader = 'Email,Valid,Domain,Local Part\n';
      const csvRows = emails.map(e => 
        `"${e.email}","${e.isValid}","${e.domain}","${e.localPart}"`
      ).join('\n');
      return csvHeader + csvRows;
    
    case 'json':
      return JSON.stringify(emails, null, 2);
    
    default:
      return emails.map(e => e.email).join('\n');
  }
}

// Get common email domains for suggestions/filtering
export function getCommonDomains(): string[] {
  return [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'aol.com',
    'icloud.com',
    'protonmail.com',
    'yandex.com',
    'mail.ru',
    'live.com',
    'msn.com',
    'comcast.net',
    'verizon.net',
    'att.net',
    'sbcglobal.net'
  ];
}

// Analyze email patterns and provide insights
export function analyzeEmailPatterns(emails: ExtractedEmail[]): {
  topDomains: Array<{ domain: string; count: number; percentage: number }>;
  commonProviders: Array<{ provider: string; count: number; percentage: number }>;
  validityRate: number;
  averageLocalPartLength: number;
  averageDomainLength: number;
} {
  if (emails.length === 0) {
    return {
      topDomains: [],
      commonProviders: [],
      validityRate: 0,
      averageLocalPartLength: 0,
      averageDomainLength: 0
    };
  }

  // Domain analysis
  const domainCounts: Record<string, number> = {};
  emails.forEach(email => {
    domainCounts[email.domain] = (domainCounts[email.domain] || 0) + 1;
  });

  const topDomains = Object.entries(domainCounts)
    .map(([domain, count]) => ({
      domain,
      count,
      percentage: Math.round((count / emails.length) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Provider analysis (group similar domains)
  const providerMap: Record<string, string[]> = {
    'Google': ['gmail.com', 'googlemail.com'],
    'Microsoft': ['hotmail.com', 'outlook.com', 'live.com', 'msn.com'],
    'Yahoo': ['yahoo.com', 'yahoo.co.uk', 'yahoo.ca', 'yahoo.de'],
    'Apple': ['icloud.com', 'me.com', 'mac.com'],
    'AOL': ['aol.com'],
    'Yandex': ['yandex.com', 'yandex.ru'],
    'Mail.ru': ['mail.ru']
  };

  const providerCounts: Record<string, number> = {};
  emails.forEach(email => {
    let provider = 'Other';
    for (const [providerName, domains] of Object.entries(providerMap)) {
      if (domains.includes(email.domain)) {
        provider = providerName;
        break;
      }
    }
    providerCounts[provider] = (providerCounts[provider] || 0) + 1;
  });

  const commonProviders = Object.entries(providerCounts)
    .map(([provider, count]) => ({
      provider,
      count,
      percentage: Math.round((count / emails.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  // Other statistics
  const validityRate = Math.round((emails.filter(e => e.isValid).length / emails.length) * 100);
  const averageLocalPartLength = Math.round(
    emails.reduce((sum, e) => sum + e.localPart.length, 0) / emails.length
  );
  const averageDomainLength = Math.round(
    emails.reduce((sum, e) => sum + e.domain.length, 0) / emails.length
  );

  return {
    topDomains,
    commonProviders,
    validityRate,
    averageLocalPartLength,
    averageDomainLength
  };
}