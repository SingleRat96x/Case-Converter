'use client';

import { ThemeProvider as NextThemeProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={true}
      enableColorScheme={true}
      storageKey="case-converter-theme"
      themes={['light', 'dark', 'system']}
      {...props}
    >
      {children}
    </NextThemeProvider>
  );
}
