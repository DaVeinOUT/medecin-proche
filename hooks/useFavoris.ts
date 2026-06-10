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
      if (!stored) return;
      // Validation défensive : un localStorage trafiqué ne doit pas casser l'affichage
      const parsed: unknown = JSON.parse(stored);
      if (!Array.isArray(parsed)) return;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydratation depuis localStorage après montage (un init lazy provoquerait un mismatch SSR)
      setFavoris(
        parsed.filter(
          (m): m is FavoriData =>
            typeof m === 'object' && m !== null &&
            typeof (m as FavoriData).id === 'string' &&
            typeof (m as FavoriData).nom === 'string'
        )
      );
    } catch {
      // localStorage indisponible (SSR, mode privé bloqué) ou JSON invalide
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
