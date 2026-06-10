/// <reference lib="webworker" />
/**
 * Service worker — mode hors-ligne pour les DOM-TOM
 * (coupures réseau fréquentes, cyclones, zones blanches).
 *
 * - Shell applicatif précaché par @serwist/next
 * - Tuiles OpenStreetMap : CacheFirst (le territoire consulté reste affichable)
 * - Données Supabase (GET) : NetworkFirst avec repli cache (derniers résultats)
 */
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { defaultCache } from '@serwist/next/worker';
import { Serwist, CacheFirst, NetworkFirst, ExpirationPlugin } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) => url.hostname.endsWith('tile.openstreetmap.org'),
      handler: new CacheFirst({
        cacheName: 'osm-tiles',
        plugins: [
          new ExpirationPlugin({ maxEntries: 300, maxAgeSeconds: 30 * 24 * 3600 }),
        ],
      }),
    },
    {
      matcher: ({ url }) => url.hostname.endsWith('.supabase.co'),
      handler: new NetworkFirst({
        cacheName: 'supabase-data',
        networkTimeoutSeconds: 5,
        plugins: [
          new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 7 * 24 * 3600 }),
        ],
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
