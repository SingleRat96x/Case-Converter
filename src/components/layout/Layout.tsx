import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { FooterAd, StickyBottomAd } from '@/components/ads/AdPlacements';
import { MobileMenuProvider } from '@/contexts/MobileMenuContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <MobileMenuProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
        
        {/* Strategic ad placement before footer */}
        <FooterAd className="container mx-auto px-4 sm:px-6 lg:px-8" />
        
        <Footer />
        
        {/* Sticky bottom ad for mobile */}
        <StickyBottomAd />
        
      </div>
    </MobileMenuProvider>
  );
}
