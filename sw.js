const CACHE = "minha-lista-v2";
const ARQUIVOS = ["./minha-lista.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

/* cada arquivo é guardado separadamente: se um falhar, o resto ainda é instalado */
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(ARQUIVOS.map(u => c.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copia));
        }
        return res;
      }).catch(() => caches.match("./minha-lista.html"));
    })
  );
});
