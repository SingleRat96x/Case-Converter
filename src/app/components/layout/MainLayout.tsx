'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <div className="relative min-h-screen">
      {!isAdminRoute && <Header />}
      <main className="pb-16">{children}</main>
      {!isAdminRoute && <Footer />}
    </div>
  );
} 