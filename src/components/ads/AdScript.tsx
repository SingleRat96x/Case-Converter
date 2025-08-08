"use client";

import { useEffect } from 'react';

const AdScript = () => {
  useEffect(() => {
    try {
      // Check if the adsbygoogle array exists before pushing
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle as any[]).push({});
      }
    } catch (error) {
      console.error('Adsense script error:', error);
    }
  }, []);

  return (
    // Render only the ad unit container
    <ins
      className="adsbygoogle ad-slot-stable"
      data-ad-client="ca-pub-8899111851490905"
      data-ad-slot="1588643719"
      data-ad-format="auto"
      data-full-width-responsive="true"
    >
    </ins>
  );
};

export default AdScript;