"use client";

import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";
import {
  LayoutGrid,
  Settings,
  Menu as MenuIcon,
  FileText,
  FileCode,
  RefreshCw,
  LogOut,
} from "lucide-react";
import { clearAuthToken, isAuthenticated } from "@/lib/auth";
import { invalidateAllCaches } from "@/lib/tools";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/admin');
      return;
    }
  }, [router]);

  const handleLogout = async () => {
    clearAuthToken();
    router.push('/admin');
  };

  const handleClearCache = async () => {
    try {
      await invalidateAllCaches();
      window.open(`/?t=${Date.now()}`, '_blank');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  const isActive = (path: string) => pathname === path;

  // If not authenticated, don't render anything
  if (typeof window !== 'undefined' && !isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={handleClearCache}
              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
              title="Clear Cache"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
        <nav className="mt-4 flex gap-2">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isActive('/admin/dashboard')
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            }`}
          >
            <LayoutGrid className="h-5 w-5" />
            Tools
          </button>
          <button
            onClick={() => router.push('/admin/dashboard/visibility')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isActive('/admin/dashboard/visibility')
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            }`}
          >
            <Settings className="h-5 w-5" />
            Visibility
          </button>
          <button
            onClick={() => router.push('/admin/dashboard/menu')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isActive('/admin/dashboard/menu')
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            }`}
          >
            <MenuIcon className="h-5 w-5" />
            Menu
          </button>
        </nav>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Desktop Only */}
        <div className="hidden lg:block w-64 border-r border-border bg-card min-h-screen p-4">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
              <div className="flex gap-2">
                <button
                  onClick={handleClearCache}
                  className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  title="Clear Cache"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin/dashboard')
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <LayoutGrid className="h-5 w-5" />
                Tools
              </button>
              <button
                onClick={() => router.push('/admin/dashboard/visibility')}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin/dashboard/visibility')
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <Settings className="h-5 w-5" />
                Visibility Settings
              </button>
              <button
                onClick={() => router.push('/admin/dashboard/menu')}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin/dashboard/menu')
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <MenuIcon className="h-5 w-5" />
                Menu Management
              </button>
              <button
                onClick={() => router.push('/admin/dashboard/pages')}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin/dashboard/pages')
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <FileText className="h-5 w-5" />
                Static Pages
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
} 