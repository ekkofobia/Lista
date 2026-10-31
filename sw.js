const CACHE = "minha-lista-v8";
const ARQUIVOS = ["./", "./manifest.json", "./icon.svg", "./icon-192.png", "./icon-512.png"];

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

/* rede primeiro: sempre busca a versão nova do site; se não houver internet, usa a guardada */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request, { cache: "no-cache" }).then(res => {
      if (res.ok) {
        const copia = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia));
      }
      return res;
    }).catch(() => caches.match(e.request).then(cached => cached || caches.match("./")))
  );
});
