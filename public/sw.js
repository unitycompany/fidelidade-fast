// Service Worker para PWA
const CACHE_NAME = 'fast-fidelidade-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/src/assets/icon.png',
    // Assets do Vite são gerados dinamicamente, então cache na demanda
];

// Install event
self.addEventListener('install', (event) => {
    console.log('Service Worker instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('Erro ao adicionar ao cache:', error);
            })
    );
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Service Worker ativando...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - Cache First Strategy para assets, Network First para API
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Ignorar requisições do Chrome Extensions
    if (event.request.url.startsWith('chrome-extension://')) {
        return;
    }

    // Network First para APIs (Supabase, etc)
    if (url.pathname.includes('/rest/v1/') || url.hostname.includes('supabase')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match(event.request);
                })
        );
        return;
    }

    // Cache First para outros recursos
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Retorna do cache se encontrar
                if (response) {
                    return response;
                }

                // Senão, busca da rede e adiciona ao cache
                return fetch(event.request).then((response) => {
                    // Verifica se é uma resposta válida
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clona a resposta
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }).catch(() => {
                    // Fallback para páginas offline
                    if (event.request.destination === 'document') {
                        return caches.match('/');
                    }
                });
            })
    );
});

// Push notification
self.addEventListener('push', (event) => {
    console.log('Push notification recebida');

    const options = {
        body: event.data ? event.data.text() : 'Você tem uma nova recompensa! 🎁',
        icon: '/src/assets/icon.png',
        badge: '/src/assets/icon.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: Math.random()
        },
        actions: [
            {
                action: 'explore',
                title: 'Ver Recompensas',
                icon: '/src/assets/icon.png'
            },
            {
                action: 'close',
                title: 'Fechar'
            }
        ],
        tag: 'fast-fidelidade-notification',
        requireInteraction: false
    };

    event.waitUntil(
        self.registration.showNotification('Fast Fidelidade 🎯', options)
    );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
    console.log('Notification click:', event);

    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/?page=premios')
        );
    } else if (event.action === 'close') {
        // Apenas fecha a notificação
    } else {
        // Click no corpo da notificação
        const url = event.notification.data?.url || '/';
        event.waitUntil(
            clients.matchAll().then((clientList) => {
                // Verificar se já há uma aba aberta
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        client.focus();
                        client.postMessage({ action: 'navigate', url });
                        return;
                    }
                }
                // Se não há aba aberta, abrir uma nova
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
        );
    }
});
