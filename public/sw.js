const CACHE='mfaro-static-v2';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/favicon.svg','/manifest.webmanifest','/brand/mfarobooking-logo.png'])));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method==='GET'&&u.origin===self.location.origin&&['/favicon.svg','/manifest.webmanifest','/brand/mfarobooking-logo.png'].includes(u.pathname))e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request)))});
