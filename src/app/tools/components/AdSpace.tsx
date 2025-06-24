'use client';

import { useEffect } from 'react';

interface AdSpaceProps {
  position: 'top' | 'middle' | 'bottom';
  className?: string;
}

export default function AdSpace({ position, className = '' }: AdSpaceProps) {
  useEffect(() => {
    try {
      // Load AdSense script if not already loaded
      if (typeof window !== 'undefined') {
        // Check if script is already loaded
        const existingScript = document.querySelector('script[src*="pagead2.googlesyndication.com"]');
        
        if (!existingScript) {
          const script = document.createElement('script');
          script.async = true;
          script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8899111851490905';
          script.crossOrigin = 'anonymous';
          document.head.appendChild(script);
        }

        // Push ads after a short delay to ensure script is loaded
        const timer = setTimeout(() => {
          if (window.adsbygoogle) {
            (window.adsbygoogle as any[]).push({});
          }
        }, 100);

        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  const getAdContent = () => {
    return (
      <div className="w-full text-center my-4">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-8899111851490905"
          data-ad-slot="9893563624"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  };

  return <div className={`w-full ${className}`}>{getAdContent()}</div>;
}
