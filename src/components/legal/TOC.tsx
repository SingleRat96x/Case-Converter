'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

interface TOCSection {
  id: string;
  title: string;
  level?: number;
}

interface TOCProps {
  title?: string;
  sections: TOCSection[];
  className?: string;
  sticky?: boolean;
}

export function TOC({ 
  title = 'Table of Contents', 
  sections, 
  className = '',
  sticky = true 
}: TOCProps) {
  const { tSync: t } = useTranslation('legal');
  const [activeSection, setActiveSection] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for fixed header
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
      setIsOpen(false); // Close mobile menu
    }
  };

  return (
    <>
      {/* Mobile TOC */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full p-3 border rounded-lg bg-background hover:bg-muted/50 transition-colors text-sm"
          aria-expanded={isOpen}
          aria-controls="mobile-toc"
        >
          <div className="flex items-center gap-2">
            <Menu className="w-4 h-4" />
            <span className="font-medium">{title}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <nav
            id="mobile-toc"
            className="mt-2 p-3 border rounded-lg bg-background space-y-1 max-h-64 overflow-y-auto"
            aria-label={title}
          >
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`block w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                } ${section.level === 2 ? 'pl-4' : ''}`}
              >
                {section.title}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* Desktop TOC */}
      <aside
        className={`hidden lg:block ${sticky ? 'sticky top-24 self-start' : ''} ${className}`}
        aria-label={title}
      >
        <nav className="space-y-3">
          <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide border-b pb-2">
            {title}
          </h2>
          
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`block w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                } ${section.level === 2 ? 'pl-4' : ''}`}
                title={section.title}
              >
                <span className="line-clamp-2">{section.title}</span>
              </button>
            ))}
          </div>
          
          <div className="pt-3 border-t">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ↑ {t('common.backToTop')}
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}