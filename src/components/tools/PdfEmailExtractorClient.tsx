'use client';

import dynamic from 'next/dynamic';

// Dynamically import the PDF component to avoid SSR issues
const PdfEmailExtractor = dynamic(
  () => import('./PdfEmailExtractor').then(mod => ({ default: mod.PdfEmailExtractor })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }
);

export { PdfEmailExtractor };