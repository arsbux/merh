const CACHE_NAME = 'ventra-v2';
const RUNTIME_CACHE = 'ventra-runtime-v2';

// Assets to cache on install
const PRECACHE_ASSETS = [
    '/ventra-logo.png',
    '/manifest.json'
];

// Install event - precache essential assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => !name.includes('v2'))
                        .map(name => caches.delete(name))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - Network-First strategy with offline fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // NEVER cache Next.js development chunks - this fixes ChunkLoadError
    if (url.pathname.startsWith('/_next/')) {
        return;
    }

    // Skip API and auth requests
    if (url.pathname.startsWith('/api/') || url.pathname.includes('supabase')) {
        return;
    }

    // Only cache static assets like images and the manifest
    if (url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|json)$/)) {
        event.respondWith(
            caches.match(request)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return fetch(request).then(response => {
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(RUNTIME_CACHE).then(cache => {
                                cache.put(request, responseClone);
                            });
                        }
                        return response;
                    });
                })
        );
    }
});
