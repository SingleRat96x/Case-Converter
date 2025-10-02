'use client';

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { TOC } from './TOC';

interface TOCSection {
  id: string;
  title: string;
  level?: number;
}

interface LegalLayoutProps {
  children: React.ReactNode;
  tocSections?: TOCSection[];
  tocTitle?: string;
  showTOC?: boolean;
  className?: string;
}

export function LegalLayout({
  children,
  tocSections = [],
  tocTitle = 'Table of Contents',
  showTOC = true,
  className = ''
}: LegalLayoutProps) {
  return (
    <Layout>
      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="max-w-none">
              {children}
            </div>
          </main>

          {/* Table of Contents Sidebar */}
          {showTOC && tocSections.length > 0 && (
            <TOC
              title={tocTitle}
              sections={tocSections}
              className="flex-shrink-0 lg:w-64"
              sticky
            />
          )}
        </div>
      </div>
    </Layout>
  );
}