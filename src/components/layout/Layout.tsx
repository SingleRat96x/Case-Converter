import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { FooterAd } from '@/components/ads/AdPlacements';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="flex-1">
        {children}
      </main>
      
      {/* Strategic ad placement before footer */}
      <FooterAd className="container mx-auto px-4 sm:px-6 lg:px-8" />
      
      <Footer />
    </div>
  );
}
