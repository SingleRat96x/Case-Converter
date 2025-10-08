'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    workbox?: unknown;
  }
}

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      console.log('Registering service worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service worker registered successfully:', registration);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is available
              console.log('New service worker available');
              
              // Optionally show a notification to the user
              if (window.confirm('New version available! Reload to update?')) {
                window.location.reload();
              }
            }
          });
        }
      });

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update available
                console.log('New content available; please refresh.');
              } else {
                // Content is cached for offline use
                console.log('Content is cached for offline use.');
              }
            }
          });
        }
      });

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      });

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute

    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  };

  return null; // This component doesn't render anything
}

// Utility functions for working with service worker
export const swUtils = {
  // Check if service worker is supported
  isSupported: () => {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator;
  },

  // Get registration
  getRegistration: async () => {
    if (!swUtils.isSupported()) return null;
    return await navigator.serviceWorker.getRegistration();
  },

  // Update service worker
  update: async () => {
    const registration = await swUtils.getRegistration();
    if (registration) {
      return registration.update();
    }
  },

  // Unregister service worker
  unregister: async () => {
    const registration = await swUtils.getRegistration();
    if (registration) {
      return registration.unregister();
    }
  },

  // Check if app is running in standalone mode (PWA)
  isStandalone: () => {
    return typeof window !== 'undefined' && 
           (window.matchMedia('(display-mode: standalone)').matches || 
            (window.navigator as unknown as { standalone?: boolean }).standalone);
  },

  // Preload critical pages
  preloadCriticalPages: async () => {
    if (!swUtils.isSupported() || typeof window === 'undefined' || !('caches' in window)) return;
    
    const criticalPages = [
      '/tools/uppercase',
      '/tools/lowercase', 
      '/tools/title-case',
      '/tools/sentence-case'
    ];

    const cache = await caches.open('page-preload-v1');
    
    try {
      await cache.addAll(criticalPages);
      console.log('Critical pages preloaded');
    } catch (error) {
      console.warn('Failed to preload some critical pages:', error);
    }
  },

  // Clear all caches
  clearCaches: async () => {
    if (typeof window === 'undefined' || !('caches' in window)) return;
    
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('All caches cleared');
  }
};

// Web App Install Prompt
export function useInstallPrompt() {
  useEffect(() => {
    let deferredPrompt: Event | null = null;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install button or notification
      console.log('App can be installed', deferredPrompt);
    };

    const handleAppInstalled = () => {
      console.log('App was installed');
      deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    // This would trigger the install prompt
    // Implementation depends on your UI needs
    console.log('Install app functionality not implemented yet');
  };

  return { installApp };
}