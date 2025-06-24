'use client';

import { useEffect, useState } from 'react';
import { StagewiseToolbar } from '@stagewise/toolbar-next';
import { ReactPlugin } from '@stagewise-plugins/react';

export function StagewiseWrapper() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only render on client-side and in development
  if (!isClient || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />;
}
