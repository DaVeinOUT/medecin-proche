'use client';

import { useFavoris } from '@/hooks/useFavoris';
import { Medecin } from '@/types/medecin';
import { Heart } from 'lucide-react';

interface FavoriButtonProps {
  medecin: Medecin;
}

/** Pastille verre — conçue pour les héros encre (fiche médecin) */
export default function FavoriButton({ medecin }: FavoriButtonProps) {
  const { isFavori, toggleFavori } = useFavoris();
  const favori = isFavori(medecin.id);

  return (
    <button
      onClick={() => toggleFavori(medecin)}
      aria-label={favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className="w-11 h-11 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center tap-scale transition-colors hover:bg-white/20"
    >
      <Heart
        size={19}
        className={`transition-transform ${favori ? 'scale-110 text-coral-400 fill-coral-400' : 'scale-100 text-sand-100'}`}
        aria-hidden="true"
      />
    </button>
  );
}
