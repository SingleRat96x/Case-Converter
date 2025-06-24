'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 theme-transition">
      {!isAdminRoute && <Header />}
      <main className="w-full">
        <div className="container py-4 md:py-6 lg:py-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50 my-4">{children}</div>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}
