/**
 * ZANTARA Service Worker - PWA Support
 * 
 * Implements offline caching, background sync, and push notifications.
 * Version: 5.2.0
 */

const CACHE_VERSION = 'zantara-v5.2.0';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;
const CACHE_API = `${CACHE_VERSION}-api`;

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/chat.html',
  '/login.html',
  '/js/core/error-handler.js',
  '/js/core/cache-manager.js',
  '/js/core/request-deduplicator.js',
  '/js/api-config.js',
  '/js/config.js',
  '/styles/chat.css',
  '/styles/design-tokens.css',
  '/assets/logoscon.png',
  '/manifest.json'
];

// API endpoints to cache (with short TTL)
const CACHEABLE_API_ENDPOINTS = [
  '/health',
  '/config/flags',
  '/contact.info',
  '/team.list',
  '/bali.zero.pricing'
];

// Max cache sizes
const MAX_CACHE_SIZE = {
  [CACHE_DYNAMIC]: 50,  // 50 dynamic pages
  [CACHE_API]: 20       // 20 API responses
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v5.2.0');
  
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting(); // Activate immediately
      })
      .catch(error => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v5.2.0');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              // Delete caches from different versions
              return cacheName.startsWith('zantara-') && 
                     !cacheName.startsWith(CACHE_VERSION);
            })
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (except API)
  if (url.origin !== location.origin && !isAPIRequest(url)) {
    return;
  }

  // Handle API requests differently
  if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

// Handle static asset requests (Cache First strategy)
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Return cached version, update in background
      updateCacheInBackground(request);
      return cachedResponse;
    }

    // Fetch from network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, networkResponse.clone());
      trimCache(CACHE_DYNAMIC, MAX_CACHE_SIZE[CACHE_DYNAMIC]);
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    return new Response('Offline - Please check your connection', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Handle API requests (Network First with cache fallback)
async function handleAPIRequest(request) {
  try {
    // Try network first (fresher data)
    const networkResponse = await fetch(request);

    // Cache successful API responses (short TTL)
    if (networkResponse.ok && isCacheableAPIEndpoint(request.url)) {
      const cache = await caches.open(CACHE_API);
      cache.put(request, networkResponse.clone());
      trimCache(CACHE_API, MAX_CACHE_SIZE[CACHE_API]);
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving API from cache (offline):', request.url);
      return cachedResponse;
    }

    // Return error response
    return new Response(JSON.stringify({
      ok: false,
      error: 'Network unavailable',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Update cache in background (stale-while-revalidate)
async function updateCacheInBackground(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, networkResponse.clone());
    }
  } catch (error) {
    // Silently fail - we already served from cache
  }
}

// Check if request is to API
function isAPIRequest(url) {
  return url.hostname.includes('railway.app') ||
         url.hostname.includes('run.app') ||
         url.pathname.startsWith('/call') ||
         url.pathname.startsWith('/api/');
}

// Check if API endpoint should be cached
function isCacheableAPIEndpoint(url) {
  return CACHEABLE_API_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

// Trim cache to max size (LRU eviction)
async function trimCache(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxSize) {
    // Remove oldest entries
    const toDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(toDelete.map(key => cache.delete(key)));
  }
}

// Background sync (for offline actions)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

async function syncOfflineActions() {
  // Implement offline action queue sync
  console.log('[SW] Syncing offline actions...');
  
  // TODO: Get offline actions from IndexedDB and sync
  // This would be implemented based on your specific needs
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'ZANTARA';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/assets/logoscon.png',
    badge: '/assets/logoscon.png',
    data: data.url || '/',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});

// Message handler (communication with page)
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
  
  if (event.data.type === 'GET_CACHE_SIZE') {
    event.waitUntil(
      getCacheSize().then(size => {
        event.ports[0].postMessage({ size });
      })
    );
  }
});

// Get total cache size
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    totalSize += keys.length;
  }
  
  return totalSize;
}

console.log('[SW] Service worker loaded');
