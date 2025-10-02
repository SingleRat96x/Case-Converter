import { NextRequest, NextResponse } from 'next/server';
import { SITE_LEGAL_CONFIG, type ContactCategory } from '@/config/site-legal';

// Simple in-memory rate limiting (for demo purposes)
// In production, use Redis or a proper rate limiting service
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

function getRateLimitKey(ip: string): string {
  return `rate_limit_${ip}`;
}

function checkRateLimit(ip: string): boolean {
  const key = getRateLimitKey(ip);
  const now = Date.now();
  const hourInMs = 60 * 60 * 1000;
  
  const current = rateLimitMap.get(key);
  
  if (!current || now - current.lastReset > hourInMs) {
    rateLimitMap.set(key, { count: 1, lastReset: now });
    return true;
  }
  
  if (current.count >= SITE_LEGAL_CONFIG.contactForm.rateLimitPerHour) {
    return false;
  }
  
  current.count++;
  return true;
}

interface ContactFormData {
  name: string;
  email: string;
  category: ContactCategory;
  message: string;
  [key: string]: string; // For honeypot fields
}

function validateContactForm(data: ContactFormData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  if (!data.name?.trim()) {
    errors.push('Name is required');
  }
  
  if (!data.email?.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!data.category?.trim()) {
    errors.push('Category is required');
  } else if (!SITE_LEGAL_CONFIG.contactForm.categories.includes(data.category)) {
    errors.push('Invalid category selected');
  }
  
  if (!data.message?.trim()) {
    errors.push('Message is required');
  } else if (data.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters long');
  }
  
  // Honeypot check - if the honeypot field is filled, it's likely a bot
  if (data[SITE_LEGAL_CONFIG.contactForm.honeypotField]) {
    errors.push('Bot detected');
  }
  
  // Basic content validation
  const suspiciousPatterns = [
    /http[s]?:\/\//gi, // URLs
    /[а-я]+/gi, // Cyrillic characters (basic spam check, can be removed if Russian is expected)
    /<[^>]*>/gi // HTML tags
  ];
  
  const messageContent = `${data.name} ${data.email} ${data.message}`;
  const suspiciousCount = suspiciousPatterns.reduce((count, pattern) => {
    const matches = messageContent.match(pattern);
    return count + (matches ? matches.length : 0);
  }, 0);
  
  if (suspiciousCount > 2) {
    errors.push('Message content appears to be spam');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

async function sendContactEmail(data: ContactFormData): Promise<boolean> {
  // In a real implementation, you would integrate with an email service
  // like SendGrid, Mailgun, AWS SES, etc.
  
  console.log('Contact form submission:', {
    name: data.name,
    email: data.email,
    category: data.category,
    message: data.message,
    timestamp: new Date().toISOString()
  });
  
  // Simulate email sending
  return Promise.resolve(true);
}

export async function POST(request: NextRequest) {
  try {
    // Get IP address for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please wait before sending another message.',
          code: 'RATE_LIMITED'
        },
        { status: 429 }
      );
    }
    
    // Parse form data
    const formData: ContactFormData = await request.json();
    
    // Validate form data
    const validation = validateContactForm(formData);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: validation.errors.join(', '),
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }
    
    // Send email (in production, integrate with your email service)
    const emailSent = await sendContactEmail(formData);
    
    if (!emailSent) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send message. Please try again later.',
          code: 'EMAIL_ERROR'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Message sent successfully'
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred. Please try again later.',
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return contact form configuration
  return NextResponse.json({
    categories: SITE_LEGAL_CONFIG.contactForm.categories,
    rateLimitPerHour: SITE_LEGAL_CONFIG.contactForm.rateLimitPerHour,
    honeypotField: SITE_LEGAL_CONFIG.contactForm.honeypotField
  });
}