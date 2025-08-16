import { ReactNode } from 'react';

type RootLayoutProps = {
  children: ReactNode;
};

// This is the root layout that wraps all pages
// The locale-specific layout is in [locale]/layout.tsx
export default function RootLayout({ children }: RootLayoutProps) {
  return children;
}