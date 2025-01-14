'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {!isAdminRoute && <Header />}
      <main className="w-full">
        <div className="container py-4 md:py-6 lg:py-8">
          {children}
        </div>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
} 