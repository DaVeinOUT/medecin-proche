'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Medecin } from '@/types/medecin';
import { formatTel, nomAffiche } from '@/lib/utils';

const MAX_MAP_MARKERS = 300;

// Palette « Édition Lagon »
const INK    = '#0A2B25';
const LAGOON = '#0E8E76';
const MIST   = '#71857D';
const PAPER  = '#FFFDF9';

function escapeHtml(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Position utilisateur — pastille lagon avec onde (styles dans globals.css)
const userIcon = L.divIcon({
  className: '',
  html: `<div class="user-dot"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
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

    // Tuiles CARTO Voyager servies via notre proxy (/app/tiles) — les CDN de
    // tuiles directs sont throttlés ou cassés sur beaucoup de réseaux mobiles DOM-TOM
    L.tileLayer('/tiles/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/">OSM</a> © <a href="https://carto.com/">CARTO</a>',
      maxZoom: 20,
      updateWhenIdle: false,
      keepBuffer: 2,
    }).addTo(map);

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
      .bindPopup(`<strong style="color:${LAGOON};font-family:var(--font-display),Georgia,serif">Vous êtes ici</strong>`)
      .addTo(map);

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Recentrer quand le territoire change ──────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo(mapCenter, 11, { animate: true, duration: 0.8 });
  }, [mapCenter]);

  // ── Marqueur utilisateur ──────────────────────────────────────────────────
  useEffect(() => {
    if (!userMarkerRef.current) return;
    userMarkerRef.current.setLatLng(userPosition);
  }, [userPosition]);

  // ── Rafraîchir les marqueurs médecins ────────────────────────────────────
  useEffect(() => {
    if (!clusterRef.current) return;

    clusterRef.current.clearLayers();
    markerMapRef.current = {};

    medecins.slice(0, MAX_MAP_MARKERS).forEach((m) => {
      if (!m.lat || !m.lng) return;

      const displayNom = escapeHtml(nomAffiche(m.prenom, m.nom, m.specialite));
      const specialite = escapeHtml(m.specialite);
      const safeId     = encodeURIComponent(m.id);

      const dispo = m.accepte_nouveaux_patients
        ? `<span style="display:inline-flex;align-items:center;gap:5px;color:#0B7A66;font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-top:6px"><span style="width:6px;height:6px;border-radius:99px;background:#14A88B;display:inline-block"></span>Disponible</span>`
        : `<span style="display:inline-flex;align-items:center;gap:5px;color:${MIST};font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;margin-top:6px"><span style="width:6px;height:6px;border-radius:99px;background:#D8C6A8;display:inline-block"></span>Complet</span>`;
      const tel = m.telephone
        ? `<a href="tel:${escapeHtml(m.telephone)}" style="color:${LAGOON};display:block;margin-top:6px;font-size:11px;font-weight:600;font-variant-numeric:tabular-nums">${escapeHtml(formatTel(m.telephone))}</a>`
        : '';
      const fiche = `<a href="/medecin/${safeId}" style="color:${LAGOON};font-weight:800;display:block;margin-top:5px;font-size:11px">Voir la fiche →</a>`;
      const dist  = m.distance
        ? `<span style="color:#8FA29A;font-size:10px;font-variant-numeric:tabular-nums"> · ${(m.distance / 1000).toFixed(1)} km</span>`
        : '';

      const markerIcon = L.divIcon({
        className: '',
        html: `<div class="pin-medecin"><span>+</span></div><span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap">${displayNom} — ${specialite}</span>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([m.lat, m.lng], { icon: markerIcon, title: `${displayNom} — ${specialite}` })
        .bindPopup(`
          <div style="font-size:12px;min-width:170px;line-height:1.5;color:${INK}">
            <p style="font-weight:600;margin:0 0 1px;font-size:14px;font-family:var(--font-display),Georgia,serif">${displayNom}</p>
            <p style="color:${LAGOON};margin:0;font-size:11px;font-weight:700">${specialite}${dist}</p>
            ${dispo}${tel}${fiche}
          </div>
        `, {
          maxWidth: 230,
          // Décale l'autopan pour que le popup s'ouvre sous l'overlay (header + pills ≈ 210px)
          autoPanPaddingTopLeft: L.point(10, 220),
          autoPanPaddingBottomRight: L.point(10, 80),
        });

      marker.on('click', () => { if (onSelectMedecin) onSelectMedecin(m); });

      clusterRef.current.addLayer(marker);
      markerMapRef.current[m.id] = marker;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medecins]);

  // ── Centrer sur médecin sélectionné depuis la liste ───────────────────────
  useEffect(() => {
    if (!selectedMedecin || !mapRef.current) return;
    mapRef.current.flyTo([selectedMedecin.lat, selectedMedecin.lng], 14, { animate: true, duration: 0.5 });
    const marker = markerMapRef.current[selectedMedecin.id];
    if (marker) setTimeout(() => marker.openPopup(), 600);
  }, [selectedMedecin]);

  return <div ref={containerRef} className="w-full h-full" />;
}
