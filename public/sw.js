// Service Worker for Text Case Converter
// Implements aggressive caching strategies for performance

const CACHE_NAME = 'textcaseconverter-v1';
const RUNTIME_CACHE = 'runtime-cache-v1';

// Static assets that should be cached immediately
const STATIC_CACHE_URLS = [
  '/',
  '/tools',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png',
  '/site.webmanifest'
];

// Cache strategies for different resource types
const CACHE_STRATEGIES = {
  // Cache static assets with cache-first strategy
  static: {
    pattern: /\.(js|css|woff2?|png|jpg|jpeg|webp|svg|ico)$/,
    strategy: 'CacheFirst',
    maxAge: 365 * 24 * 60 * 60 // 1 year
  },
  
  // Cache API responses with network-first strategy
  api: {
    pattern: /\/api\//,
    strategy: 'NetworkFirst',
    maxAge: 5 * 60 // 5 minutes
  },
  
  // Cache pages with stale-while-revalidate
  pages: {
    pattern: /\/(?:tools|category)\//,
    strategy: 'StaleWhileRevalidate',
    maxAge: 24 * 60 * 60 // 24 hours
  },
  
  // Cache Google Fonts
  fonts: {
    pattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
    strategy: 'CacheFirst',
    maxAge: 365 * 24 * 60 * 60 // 1 year
  }
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('SW: Install event');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('SW: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('SW: Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activate event');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('SW: Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Apply caching strategy based on request type
  for (const [name, config] of Object.entries(CACHE_STRATEGIES)) {
    if (config.pattern.test(request.url)) {
      event.respondWith(handleRequest(request, config));
      return;
    }
  }
  
  // Default strategy for other requests
  event.respondWith(
    handleRequest(request, { strategy: 'NetworkFirst', maxAge: 60 * 60 })
  );
});

// Handle requests with specified caching strategy
async function handleRequest(request, config) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  switch (config.strategy) {
    case 'CacheFirst':
      return cacheFirst(request, cache, config);
    case 'NetworkFirst':
      return networkFirst(request, cache, config);
    case 'StaleWhileRevalidate':
      return staleWhileRevalidate(request, cache, config);
    default:
      return fetch(request);
  }
}

// Cache-first strategy
async function cacheFirst(request, cache, config) {
  try {
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Check if cache is still valid
      const cacheTime = new Date(cachedResponse.headers.get('sw-cache-time') || 0);
      const now = new Date();
      const maxAge = config.maxAge * 1000; // Convert to milliseconds
      
      if (now - cacheTime < maxAge) {
        return cachedResponse;
      }
    }
    
    // Fetch from network and cache
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      const responseWithTimestamp = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: {
          ...Object.fromEntries(responseClone.headers.entries()),
          'sw-cache-time': new Date().toISOString()
        }
      });
      
      await cache.put(request, responseWithTimestamp);
    }
    
    return networkResponse;
  } catch (error) {
    // Return cached version if network fails
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Network-first strategy
async function networkFirst(request, cache, config) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      const responseWithTimestamp = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: {
          ...Object.fromEntries(responseClone.headers.entries()),
          'sw-cache-time': new Date().toISOString()
        }
      });
      
      await cache.put(request, responseWithTimestamp);
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache if network fails
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cache, config) {
  const cachedResponse = await cache.match(request);
  
  // Start network request regardless of cache
  const networkPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        const responseClone = networkResponse.clone();
        const responseWithTimestamp = new Response(responseClone.body, {
          status: responseClone.status,
          statusText: responseClone.statusText,
          headers: {
            ...Object.fromEntries(responseClone.headers.entries()),
            'sw-cache-time': new Date().toISOString()
          }
        });
        
        await cache.put(request, responseWithTimestamp);
      }
      return networkResponse;
    })
    .catch(() => {
      // Ignore network errors in background
    });
  
  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for network
  return networkPromise;
}

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  console.log('SW: Background sync triggered');
  // Implement background sync logic here
  // For example, sync offline form submissions
}

// Push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/favicon-32x32.png',
      badge: '/favicon-16x16.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };
    
    event.waitUntil(
      self.registration.showNotification('Text Case Converter', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('SW: Service Worker loaded successfully');