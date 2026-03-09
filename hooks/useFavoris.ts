'use client';

import { useState, useEffect, useCallback } from 'react';
import { Medecin } from '@/types/medecin';

const STORAGE_KEY = 'medecin-proche:favoris';

// Champs stockés en localStorage — on exclut horaires (JSONB lourd)
type FavoriData = Omit<Medecin, 'horaires' | 'langues'>;

export function useFavoris() {
  const [favoris, setFavoris] = useState<FavoriData[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setFavoris(JSON.parse(stored));
    } catch {
      // localStorage indisponible (SSR, mode privé bloqué)
    }
  }, []);

  const toggleFavori = useCallback((medecin: Medecin) => {
    setFavoris((prev) => {
      const exists = prev.some((m) => m.id === medecin.id);
      const next: FavoriData[] = exists
        ? prev.filter((m) => m.id !== medecin.id)
        : [
            ...prev,
            {
              id: medecin.id,
              nom: medecin.nom,
              prenom: medecin.prenom,
              specialite: medecin.specialite,
              adresse: medecin.adresse,
              ville: medecin.ville,
              territoire: medecin.territoire,
              code_postal: medecin.code_postal,
              telephone: medecin.telephone,
              secteur: medecin.secteur,
              accepte_nouveaux_patients: medecin.accepte_nouveaux_patients,
              lat: medecin.lat,
              lng: medecin.lng,
              distance: medecin.distance,
            },
          ];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const isFavori = useCallback((id: string) => favoris.some((m) => m.id === id), [favoris]);

  return { favoris, toggleFavori, isFavori };
}
