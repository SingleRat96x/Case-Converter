'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Callout } from './Callout';
import { SITE_LEGAL_CONFIG } from '@/config/site-legal';
import Link from 'next/link';
import { getLocaleFromPathname } from '@/lib/i18n';
import { usePathname } from 'next/navigation';

interface FormData {
  name: string;
  email: string;
  category: string;
  message: string;
  [key: string]: string; // For honeypot field
}

interface FormErrors {
  [key: string]: string;
}

export function ContactForm() {
  const { tSync: t } = useTranslation('legal');
  const pathname = usePathname();
  const currentLocale = getLocaleFromPathname(pathname);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    category: '',
    message: '',
    [SITE_LEGAL_CONFIG.contactForm.honeypotField]: '' // Honeypot field
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return t('contact.errors.required');
        return '';
      
      case 'email':
        if (!value.trim()) return t('contact.errors.required');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return t('contact.errors.invalidEmail');
        }
        return '';
      
      case 'category':
        if (!value.trim()) return t('contact.errors.required');
        return '';
      
      case 'message':
        if (!value.trim()) return t('contact.errors.required');
        if (value.trim().length < 10) {
          return 'Message must be at least 10 characters long';
        }
        return '';
      
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    Object.keys(formData).forEach(key => {
      if (key !== SITE_LEGAL_CONFIG.contactForm.honeypotField) {
        const error = validateField(key, formData[key]);
        if (error) {
          newErrors[key] = error;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubmitStatus('success');
        setSubmitMessage(t('contact.success.description'));
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          category: '',
          message: '',
          [SITE_LEGAL_CONFIG.contactForm.honeypotField]: ''
        });
      } else {
        setSubmitStatus('error');
        
        // Handle specific error codes
        switch (result.code) {
          case 'RATE_LIMITED':
            setSubmitMessage(t('contact.errors.rateLimited'));
            break;
          case 'VALIDATION_ERROR':
            setSubmitMessage(result.error);
            break;
          default:
            setSubmitMessage(t('contact.errors.serverError'));
        }
      }
    } catch {
      setSubmitStatus('error');
      setSubmitMessage(t('contact.errors.networkError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitStatus('idle');
    setSubmitMessage('');
  };

  if (submitStatus === 'success') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">{t('contact.success.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Callout variant="success">
            <p>{submitMessage}</p>
          </Callout>
          <Button 
            onClick={resetForm}
            variant="outline"
            className="mt-4"
          >
            {t('contact.success.sendAnother')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              {t('contact.form.fields.name.label')}
              {t('contact.form.fields.name.required') && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t('contact.form.fields.name.placeholder')}
              className={`transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm ${errors.name ? 'border-destructive focus:ring-destructive/20' : 'border-border hover:border-primary/50'}`}
              required
            />
            {errors.name && (
              <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                <span className="text-xs">⚠</span>
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              {t('contact.form.fields.email.label')}
              {t('contact.form.fields.email.required') && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t('contact.form.fields.email.placeholder')}
              className={`transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm ${errors.email ? 'border-destructive focus:ring-destructive/20' : 'border-border hover:border-primary/50'}`}
              required
            />
            {errors.email && (
              <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                <span className="text-xs">⚠</span>
                {errors.email}
              </p>
            )}
          </div>

          {/* Category Field */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-foreground">
              {t('contact.form.fields.category.label')}
              {t('contact.form.fields.category.required') && <span className="text-destructive ml-1">*</span>}
            </Label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border rounded-lg bg-background transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm ${errors.category ? 'border-destructive focus:ring-destructive/20' : 'border-border hover:border-primary/50'}`}
              required
            >
              <option value="">{t('contact.form.fields.category.placeholder')}</option>
              {SITE_LEGAL_CONFIG.contactForm.categories.map((category) => (
                <option key={category} value={category}>
                  {t(`contact.form.fields.category.options.${category}`)}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                <span className="text-xs">⚠</span>
                {errors.category}
              </p>
            )}
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium text-foreground">
              {t('contact.form.fields.message.label')}
              {t('contact.form.fields.message.required') && <span className="text-destructive ml-1">*</span>}
            </Label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t('contact.form.fields.message.placeholder')}
              className={`w-full p-3 border rounded-lg bg-background min-h-[120px] resize-y transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm ${errors.message ? 'border-destructive focus:ring-destructive/20' : 'border-border hover:border-primary/50'}`}
              required
            />
            {errors.message && (
              <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                <span className="text-xs">⚠</span>
                {errors.message}
              </p>
            )}
          </div>

          {/* Honeypot Field (hidden) */}
          <div style={{ display: 'none' }}>
            <Input
              name={SITE_LEGAL_CONFIG.contactForm.honeypotField}
              value={formData[SITE_LEGAL_CONFIG.contactForm.honeypotField]}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Privacy Notice */}
          <div className="p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-border/50">
            <p className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-0.5">🔒</span>
              <span>
                {t('contact.form.privacy')
                  .split('{privacyLink}')
                  .map((part, index) => (
                    index === 0 ? part : (
                      <React.Fragment key={index}>
                        <Link 
                          href={currentLocale === 'en' ? '/privacy-policy' : '/ru/privacy-policy'}
                          className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
                        >
                          {t('contact.form.privacyLinkText')}
                        </Link>
                        {part}
                      </React.Fragment>
                    )
                  ))
                }
              </span>
            </p>
          </div>

          {/* Error Message */}
          {submitStatus === 'error' && (
            <Callout variant="error">
              <p>{submitMessage}</p>
            </Callout>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {t('contact.form.submitting')}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>📧</span>
                {t('contact.form.submit')}
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}