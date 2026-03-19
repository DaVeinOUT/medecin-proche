'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Medecin } from '@/types/medecin';

const MAX_MAP_MARKERS = 300;

function escapeHtml(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

const userIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(37,99,235,0.5)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const medecinIcon = L.divIcon({
  className: '',
  html: `<div style="width:28px;height:28px;background:#1A6FE8;border:2.5px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3)"><div style="transform:rotate(45deg);width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:12px">+</div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -30],
});

interface MapProps {
  userPosition: [number, number];
  mapCenter: [number, number];
  medecins: Medecin[];
  selectedMedecin?: Medecin | null;
  onSelectMedecin?: (m: Medecin) => void;
}

export default function Map({ userPosition, mapCenter, medecins, selectedMedecin, onSelectMedecin }: MapProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<L.Map | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clusterRef    = useRef<any>(null);
  const markerMapRef  = useRef<Record<string, L.Marker>>({});
  const userMarkerRef = useRef<L.Marker | null>(null);

  // ── Initialisation carte (une seule fois) ──────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: mapCenter,
      zoom: 12,
      zoomControl: false,
      preferCanvas: true,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/">OSM</a>',
      maxZoom: 19,
      updateWhenIdle: false,
      keepBuffer: 2,
    }).addTo(map);

    // Groupe de clustering
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cluster = (L as any).markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      disableClusteringAtZoom: 16,
    });
    map.addLayer(cluster);
    clusterRef.current = cluster;

    mapRef.current = map;

    userMarkerRef.current = L.marker(userPosition, { icon: userIcon })
      .bindPopup('<strong>Vous êtes ici</strong>')
      .addTo(map);

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Recentrer la carte quand le territoire change ─────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo(mapCenter, 11, { animate: true, duration: 0.8 });
  }, [mapCenter]);

  // ── Mettre à jour le marqueur utilisateur ────────────────────────────────
  useEffect(() => {
    if (!userMarkerRef.current) return;
    userMarkerRef.current.setLatLng(userPosition);
  }, [userPosition]);

  // ── Rafraîchir les marqueurs médecins ────────────────────────────────────
  useEffect(() => {
    if (!clusterRef.current) return;

    clusterRef.current.clearLayers();
    markerMapRef.current = {};

    const toShow = medecins.slice(0, MAX_MAP_MARKERS);

    toShow.forEach((m) => {
      if (!m.lat || !m.lng) return;

      const prenom     = escapeHtml(m.prenom);
      const nom        = escapeHtml(m.nom);
      const specialite = escapeHtml(m.specialite);
      const safeId     = encodeURIComponent(m.id);

      const disponible = m.accepte_nouveaux_patients
        ? `<span style="color:#166534;font-size:10px">● Disponible</span>`
        : `<span style="color:#991B1B;font-size:10px">● Complet</span>`;
      const tel = m.telephone
        ? `<a href="tel:${escapeHtml(m.telephone)}" style="color:#1A6FE8;display:block;margin-top:3px;font-size:11px">${escapeHtml(m.telephone)}</a>`
        : '';
      const fiche = `<a href="/medecin/${safeId}" style="color:#1A6FE8;font-weight:700;display:block;margin-top:4px;font-size:11px">Voir la fiche →</a>`;
      const dist  = m.distance
        ? `<span style="color:#9ca3af;font-size:10px"> · ${(m.distance / 1000).toFixed(1)} km</span>`
        : '';

      const marker = L.marker([m.lat, m.lng], { icon: medecinIcon })
        .bindPopup(`
          <div style="font-size:12px;min-width:160px;line-height:1.4">
            <p style="font-weight:700;margin:0 0 2px">Dr ${prenom} ${nom}</p>
            <p style="color:#1A6FE8;margin:0;font-size:11px">${specialite}${dist}</p>
            ${disponible}${tel}${fiche}
          </div>
        `, { maxWidth: 220 });

      // Synchronisation carte → liste
      marker.on('click', () => {
        if (onSelectMedecin) onSelectMedecin(m);
      });

      clusterRef.current.addLayer(marker);
      markerMapRef.current[m.id] = marker;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medecins]);

  // ── Centrer sur le médecin sélectionné depuis la liste ───────────────────
  useEffect(() => {
    if (!selectedMedecin || !mapRef.current) return;
    mapRef.current.flyTo([selectedMedecin.lat, selectedMedecin.lng], 14, { animate: true, duration: 0.5 });
    const marker = markerMapRef.current[selectedMedecin.id];
    if (marker) setTimeout(() => marker.openPopup(), 600);
  }, [selectedMedecin]);

  return <div ref={containerRef} className="w-full h-full" />;
}
