'use client';

import React, { lazy, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSEOContent, type SEOContentItem } from '@/hooks/useSEOContent';
import { getLocaleFromPathname } from '@/lib/i18n';
import { useCommonTranslations } from '@/lib/i18n/hooks';
import { CheckCircle, ArrowRight, HelpCircle } from 'lucide-react';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { SEOContentAd } from '@/components/ads/SEOContentAd';

// Lazy load structured data component for better performance
const AdvancedStructuredData = lazy(() => import('./AdvancedStructuredData'));

interface SEOContentProps {
  toolName: string;
  // enableAds?: boolean; // TODO: Implement ad integration
  // adDensity?: 'low' | 'medium' | 'high'; // TODO: Implement ad density control
  className?: string;
}

export function SEOContent({ 
  toolName, 
  // enableAds = true, 
  // adDensity = 'medium',
  className = '' 
}: SEOContentProps) {
  const { content, isLoading, error, hasContent } = useSEOContent(toolName);
  const { tSync } = useCommonTranslations();
  const pathname = usePathname();
  const currentLocale = getLocaleFromPathname(pathname);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8 mt-12">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !hasContent || !content) {
    return null; // Gracefully fail without breaking the page
  }


  const renderFeaturesList = (items: SEOContentItem[]) => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <div key={index} className="bg-card rounded-lg p-6 border hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderHowToSteps = (steps: SEOContentItem[]) => (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-4 p-6 bg-muted/50 rounded-lg border-l-4 border-primary">
          <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
            {step.step || index + 1}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderExamples = (examples: SEOContentItem[]) => (
    <div className="space-y-6">
      {examples.map((example, index) => (
        <div key={index} className="bg-card border rounded-lg p-6 hover:shadow-sm transition-shadow">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span>Input:</span>
            </div>
            <div className="bg-muted p-3 rounded font-mono text-sm border">
              {example.input}
            </div>
            
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ArrowRight className="h-4 w-4" />
              <span>Output:</span>
            </div>
            <div className="bg-primary/10 p-3 rounded font-mono text-sm border border-primary/20">
              {example.output}
            </div>
            
            {example.description && (
              <p className="text-sm text-muted-foreground italic">{example.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderUseCases = (useCases: SEOContentItem[]) => (
    <div className="grid gap-4 md:grid-cols-2">
      {useCases.map((useCase, index) => (
        <div key={index} className="seo-use-case-card rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-3">{useCase.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{useCase.description}</p>
        </div>
      ))}
    </div>
  );

  const renderRelatedTools = (tools: SEOContentItem[]) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {tools.map((tool, index) => {
        const providedHref = (tool as SEOContentItem & { href?: string }).href;
        const fallbackSlug = `${currentLocale === 'ru' ? '/ru' : ''}/tools/${tool.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        const href = providedHref || fallbackSlug;
        return (
          <Link
            key={index}
            href={href}
            className="bg-card border rounded-lg p-4 hover:shadow-md transition-all hover:scale-105 group"
          >
            <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
              {tool.name}
            </h3>
            <p className="text-sm text-muted-foreground">{tool.description}</p>
            <ArrowRight className="h-4 w-4 text-primary mt-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        );
      })}
    </div>
  );

  const renderFAQs = (faqs: SEOContentItem[]) => (
    <Accordion>
      {faqs.map((faq, index) => (
        <AccordionItem
          key={index}
          title={faq.question || 'Question'}
          defaultOpen={index === 0} // Open first FAQ by default
        >
          <div className="flex gap-3">
            <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-muted-foreground leading-relaxed">
              <p>{faq.answer}</p>
            </div>
          </div>
        </AccordionItem>
      ))}
    </Accordion>
  );

  return (
    <article className={`max-w-4xl mx-auto mt-16 space-y-16 ${className}`}>
      {/* Advanced Structured Data for SEO */}
      <Suspense fallback={null}>
        <AdvancedStructuredData toolSlug={toolName} />
      </Suspense>

      {/* Introduction Section */}
      <section className="prose prose-lg max-w-none">
        <h2 className="text-3xl font-bold text-foreground mb-6">{content.sections.intro.title}</h2>
        <p className="text-lg text-muted-foreground leading-relaxed">{content.sections.intro.content}</p>
      </section>

      {/* Test ad in top half */}
      <SEOContentAd slot="4917772104" className="my-12" />

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-foreground mb-8">{content.sections.features.title}</h2>
        {renderFeaturesList(content.sections.features.items as SEOContentItem[])}
      </section>

      {/* Space for auto ads */}
      <div className="my-12"></div>

      {/* How to Use Section */}
      <section>
        <h2 className="text-3xl font-bold text-foreground mb-6">{content.sections.howToUse.title}</h2>
        <p className="text-lg text-muted-foreground mb-8">{content.sections.howToUse.description}</p>
        {renderHowToSteps(content.sections.howToUse.steps as SEOContentItem[])}
      </section>

      {/* Space for auto ads */}
      <div className="my-12"></div>

      {/* Ad before Examples section */}
      <SEOContentAd slot="9659974650" className="my-12" />

      {/* Examples Section */}
      <section>
        <h2 className="text-3xl font-bold text-foreground mb-6">{content.sections.examples.title}</h2>
        <p className="text-muted-foreground mb-8">{content.sections.examples.description}</p>
        {renderExamples(content.sections.examples.items as SEOContentItem[])}
      </section>

      {/* Space for auto ads */}
      <div className="my-12"></div>

      {/* Use Cases Section */}
      <section>
        <h2 className="text-3xl font-bold text-foreground mb-6">{content.sections.useCases.title}</h2>
        <p className="text-muted-foreground mb-8">{content.sections.useCases.description}</p>
        {renderUseCases(content.sections.useCases.items as SEOContentItem[])}
      </section>

      {/* Space for auto ads */}
      <div className="my-12"></div>

      {/* Ad before Benefits section */}
      <SEOContentAd slot="9659974650" className="my-12" />

      {/* Benefits Section */}
      <section className="seo-benefits-section rounded-xl p-8">
        <h2 className="text-3xl font-bold text-foreground mb-6">{content.sections.benefits.title}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {(content.sections.benefits.items as string[]).map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{benefit}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Space for auto ads */}
      <div className="my-12"></div>

      {/* Related Tools Section */}
      <section>
        <h2 className="text-3xl font-bold text-foreground mb-6">{content.sections.relatedTools.title}</h2>
        <p className="text-muted-foreground mb-8">{content.sections.relatedTools.description}</p>
        {renderRelatedTools(content.sections.relatedTools.items as SEOContentItem[])}
      </section>

      {/* Space for auto ads */}
      <div className="my-12"></div>

      {/* FAQ Section */}
      <section>
        <h2 className="text-3xl font-bold text-foreground mb-8">{tSync('generator.faqTitle')}</h2>
        {renderFAQs(content.sections.faqs)}
      </section>

      {/* Space for auto ads at bottom */}
      <div className="mt-16"></div>
    </article>
  );
}