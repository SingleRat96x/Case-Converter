# Legal Pages Setup Guide

This document describes how to update and maintain the legal constants and translations for the privacy policy, terms of service, about us, and contact pages.

## Configuration Files

### 1. Site Legal Constants (`src/config/site-legal.ts`)

Update the following placeholders with your actual company information:

```typescript
export const SITE_LEGAL_CONFIG = {
  // TODO: Update these with actual company information
  companyName: 'Text Case Converter',
  domain: 'textcaseconverter.com', // TODO: fill with actual domain
  contactEmail: 'contact@textcaseconverter.com', // TODO: fill with actual email
  privacyEmail: 'privacy@textcaseconverter.com', // TODO: fill with actual email
  
  postalAddress: {
    street: '123 Main Street', // TODO: fill with actual address
    city: 'New York', // TODO: fill with actual city
    state: 'NY', // TODO: fill with actual state
    zipCode: '10001', // TODO: fill with actual zip
    country: 'United States' // TODO: fill with actual country
  },
  
  governingLaw: 'New York, United States', // TODO: fill with actual jurisdiction
  
  // Update these dates when policies are finalized
  lastUpdated: '2024-01-01', // TODO: update with actual date
  effectiveDate: '2024-01-01', // TODO: update with actual date
  
  // Add your actual service vendors
  vendors: [
    // Update with your actual analytics/advertising/hosting providers
  ]
}
```

### 2. Translations (`src/locales/en/legal.json` and `src/locales/ru/legal.json`)

The legal content is stored in JSON files for internationalization. All content is pulled from these files to ensure consistency and easy translation updates.

#### Structure:
- `privacy.*` - Privacy Policy content
- `terms.*` - Terms of Service content  
- `about.*` - About Us page content
- `contact.*` - Contact Us page content
- `cookies.*` - Cookie table details
- `common.*` - Shared UI text

## Features Implemented

### ✅ Privacy Policy
- GDPR/CCPA compliant structure
- Comprehensive data processing sections
- Cookie table with technical details
- Legal bases and user rights
- Vendor information and data sharing
- Retention periods and security measures

### ✅ Terms of Service
- Practical, reader-friendly terms
- Service description and acceptable use
- Intellectual property and liability sections
- Age requirements and governing law
- DMCA procedures and dispute resolution

### ✅ About Us
- Mission and value proposition
- Technology stack and reliability info
- Accessibility commitments (WCAG AA)
- Development roadmap
- Contact and partnership information

### ✅ Contact Us
- Functional contact form with validation
- Rate limiting (5 submissions per hour per IP)
- Anti-spam measures (honeypot field)
- Form categories and privacy notice
- Success/error handling with i18n

### ✅ Technical Features
- Full internationalization (English + Russian)
- Responsive design (mobile, tablet, desktop)
- Dark mode support
- Print-friendly stylesheets
- SEO optimization with JSON-LD structured data
- Accessibility features (WCAG AA compliance)
- Table of Contents with scroll-sync
- Breadcrumb navigation
- Language switcher

## API Endpoints

### Contact Form API (`/api/contact`)
- **POST** - Submit contact form
- **GET** - Get form configuration (categories, rate limits)

Rate limiting: 5 submissions per hour per IP address
Spam protection: Honeypot field + basic content validation

## Print Functionality

All legal pages are optimized for printing with:
- A4 page size with 1-inch margins
- Proper page breaks between sections
- Print-friendly typography and colors
- Hidden non-essential elements (navigation, buttons)
- URL expansion for links

## Accessibility Features

- Keyboard navigation for all interactive elements
- Screen reader support with proper ARIA labels
- WCAG AA color contrast ratios
- Focus indicators and skip links
- Semantic HTML structure
- Alt text for images and icons

## Content Updates

To update legal content:

1. **Modify constants** in `src/config/site-legal.ts`
2. **Update translations** in `src/locales/[lang]/legal.json`  
3. **Test thoroughly** on different devices and screen sizes
4. **Verify print layouts** look correct
5. **Check accessibility** with screen readers
6. **Update effective dates** when publishing changes

## Deployment Checklist

Before deploying legal pages to production:

- [ ] Update all TODO placeholders in `site-legal.ts`
- [ ] Review and finalize all legal content
- [ ] Test contact form functionality
- [ ] Verify email delivery (if configured)
- [ ] Test print layouts
- [ ] Run accessibility audit
- [ ] Test on mobile and tablet devices
- [ ] Verify language switching works
- [ ] Test all internal links
- [ ] Update sitemap if needed

## Email Configuration

The contact form currently logs submissions to console. To enable email delivery:

1. Choose an email service (SendGrid, Mailgun, AWS SES, etc.)
2. Update the `sendContactEmail` function in `/api/contact/route.ts`
3. Add environment variables for API keys
4. Test email delivery in staging environment

## Legal Review

⚠️ **Important**: Have all legal content reviewed by qualified legal counsel before publishing to production. The provided templates are examples and may not be suitable for your specific jurisdiction or business needs.