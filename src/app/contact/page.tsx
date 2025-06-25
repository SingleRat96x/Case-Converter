import { ContactForm } from './contact-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - Case Converter Tool',
  description: 'Get in touch with us about the Case Converter tool. We value your feedback and suggestions.',
};

export default function ContactPage() {
  return (
    <div className="container py-8 max-w-[600px]">
      <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
      <div className="space-y-6">
        <p className="text-lg text-muted-foreground">
          Have questions, suggestions, or feedback about our Case Converter tool? We&apos;d love to hear from you! Fill out the form below and we&apos;ll get back to you as soon as possible.
        </p>
        <ContactForm />
      </div>
    </div>
  );
} 