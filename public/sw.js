const CACHE='pedevia-shell-v13249rollback1';
const SHELL=['/','/manifest.webmanifest','/pedevia-icon.svg'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  const isCode=e.request.mode==='navigate'||/\.(?:html?|js|css|json|webmanifest)$/i.test(u.pathname);
  if(isCode){
    e.respondWith(fetch(e.request).then(r=>{
      if(r&&r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c)).catch(()=>{});}
      return r;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match('/'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{
    if(r&&r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c)).catch(()=>{});}
    return r;
  })));
});
