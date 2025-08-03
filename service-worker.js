// Define um nome e versão para o cache
const CACHE_NAME = 'mega-sena-cache-v1';

// Lista de ficheiros essenciais para guardar em cache (a "App Shell")
const urlsToCache = [
  '/', // A raiz do site
  'index.html', // O ficheiro HTML principal
  'manifest.json', // O ficheiro de manifesto
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap',
  'https://asloterias.com.br/arquivos/2022/03/logo-mega-sena.png'
];

// Evento 'install': é acionado quando o Service Worker é instalado
self.addEventListener('install', event => {
  // Espera até que o cache seja aberto e todos os ficheiros sejam guardados
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto com sucesso');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento 'fetch': é acionado para cada pedido que a página faz (ex: imagens, scripts)
self.addEventListener('fetch', event => {
  // Ignora os pedidos que não são do tipo GET (ex: POST)
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Estratégia: Cache, e depois rede (Cache then Network)
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        // Se houver uma resposta no cache, retorna-a.
        // Enquanto isso, busca uma versão atualizada na rede para o próximo carregamento.
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // Se o pedido for bem-sucedido, guarda a nova resposta no cache
          if (networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });

        // Retorna a resposta do cache (se existir) ou espera pela resposta da rede
        return response || fetchPromise;
      });
    })
  );
});


// Evento 'activate': é acionado quando o Service Worker é ativado
// É usado para limpar caches antigos e garantir que a nova versão esteja a correr
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Se o nome do cache não estiver na lista de permissões, apaga-o
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
