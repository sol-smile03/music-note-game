const CACHE_NAME = "dingdingding-note-game-v1";

const FILES_TO_CACHE = [
  "./",
  "index.html",
  "manifest.json",
  "static/style.css",
  "static/game.js",
  "static/images/character_idle.png",
  "static/images/character_happy.png",
  "static/images/character_sad.png",
  "static/images/app-icon-192.png",
  "static/images/app-icon-512.png",
  "static/sounds/ding.mp3",
  "static/sounds/wrong.mp3"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
