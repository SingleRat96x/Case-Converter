/**
 * Legal site configuration constants
 * Update these placeholders with actual company information
 */

export const SITE_LEGAL_CONFIG = {
  // Company Information
  companyName: 'Text Case Converter',
  domain: 'textcaseconverter.net',
  contactEmail: 'medshi8@gmail.com',
  privacyEmail: 'medshi8@gmail.com',
  // Postal address removed - not displayed publicly
  
  // Legal Jurisdiction
  governingLaw: 'United States',
  
  // Data Retention Periods (in days)
  dataRetention: {
    analytics: 14,
    logs: 30,
    cookies: 365,
    contactForms: 180
  },
  
  // Third-party Services and Vendors
  vendors: [
    {
      name: 'Google Analytics',
      purpose: 'Website analytics and usage tracking',
      dataShared: 'IP address, user agent, page views, device information',
      policyUrl: 'https://policies.google.com/privacy',
      category: 'analytics'
    },
    {
      name: 'Google AdSense',
      purpose: 'Advertising and monetization',
      dataShared: 'IP address, user agent, browsing behavior, ad interactions',
      policyUrl: 'https://policies.google.com/privacy',
      category: 'advertising'
    },
    {
      name: 'Vercel',
      purpose: 'Website hosting and CDN services',
      dataShared: 'IP address, user agent, request logs',
      policyUrl: 'https://vercel.com/legal/privacy-policy',
      category: 'hosting'
    }
  ],
  
  // Cookie Categories
  cookieCategories: [
    {
      name: 'Essential',
      description: 'Required for basic site functionality',
      required: true
    },
    {
      name: 'Analytics',
      description: 'Help us understand how visitors use our site',
      required: false
    },
    {
      name: 'Advertising',
      description: 'Used to show relevant ads',
      required: false
    },
    {
      name: 'Preferences',
      description: 'Remember your settings and preferences',
      required: false
    }
  ],
  
  // Specific Cookies Used
  cookies: [
    {
      name: 'theme-preference',
      purpose: 'Remember dark/light mode preference',
      duration: '1 year',
      type: 'first-party',
      category: 'preferences'
    },
    {
      name: 'language-preference',
      purpose: 'Remember selected language (en/ru)',
      duration: '1 year',
      type: 'first-party',
      category: 'preferences'
    },
    {
      name: '_ga',
      purpose: 'Google Analytics - distinguish users',
      duration: '2 years',
      type: 'third-party',
      category: 'analytics'
    },
    {
      name: '_ga_*',
      purpose: 'Google Analytics - session data',
      duration: '2 years',
      type: 'third-party',
      category: 'analytics'
    },
    {
      name: '__gads',
      purpose: 'Google AdSense - ad serving',
      duration: '13 months',
      type: 'third-party',
      category: 'advertising'
    }
  ],
  
  // Age Requirements
  minimumAge: 13, // COPPA compliance
  
  // Data Processing Legal Bases (GDPR)
  legalBases: {
    analytics: 'legitimate-interest',
    advertising: 'consent',
    essential: 'necessary-performance',
    security: 'legitimate-interest'
  },
  
  // Policy Version and Update Info
  policyVersion: '1.0',
  lastUpdated: '2025-01-10',
  effectiveDate: '2025-01-10',
  
  // Contact Form Configuration
  contactForm: {
    categories: [
      'general-inquiry',
      'bug-report', 
      'feature-request',
      'business-partnership',
      'privacy-request',
      'other'
    ],
    rateLimitPerHour: 5,
    honeypotField: 'website', // Anti-spam field
    enableCaptcha: false // Set to true if hCaptcha is configured
  }
} as const;

export type SiteLegalConfig = typeof SITE_LEGAL_CONFIG;
export type Vendor = typeof SITE_LEGAL_CONFIG.vendors[0];
export type Cookie = typeof SITE_LEGAL_CONFIG.cookies[0];
export type CookieCategory = typeof SITE_LEGAL_CONFIG.cookieCategories[0];
export type ContactCategory = typeof SITE_LEGAL_CONFIG.contactForm.categories[number];