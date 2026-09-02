const FALLBACK_ICON = "/images/logo.png";
const FALLBACK_BADGE = "/images/logo.png";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  let data;
  try {
    data = event.data ? event.data.json() : null;
  } catch {
    data = null;
  }
  if (!data) {
    const text = event.data ? event.data.text() : "";
    data = text ? { title: "TGAW", body: text } : { title: "TGAW", body: "New notification" };
  }
  const title = data.title || "TGAW";
  const body = data.body || "New notification";
  const icon = data.icon || FALLBACK_ICON;
  const badge = data.badge || FALLBACK_BADGE;
  const tag = data.tag || undefined;
  const link = data.link || data.url || "/";

  event.waitUntil(
    self.registration
      .showNotification(title, {
        body,
        icon,
        badge,
        tag,
        data: { link },
      })
      .catch(async (err) => {
        // Icon fetch may 404 — retry without icon/badge so notification still shows
        console.error("[SW] showNotification failed, retrying without icon", err);
        return self.registration.showNotification(title, {
          body,
          tag,
          data: { link },
        });
      }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = event.notification.data?.link || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          if (client.url.endsWith(link) || link === "/") return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(link);
      return undefined;
    }),
  );
});

// Trivial offline placeholder — cache-first for navigations if needed later
self.addEventListener("fetch", (event) => {
  // Only handle GET navigations for offline UX; pass through otherwise
  if (event.request.method !== "GET") return;
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((res) => res || fetch(event.request))),
  );
});
