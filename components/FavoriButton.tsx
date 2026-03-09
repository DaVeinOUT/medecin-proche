'use client';

import { useFavoris } from '@/hooks/useFavoris';
import { Medecin } from '@/types/medecin';

interface FavoriButtonProps {
  medecin: Medecin;
}

export default function FavoriButton({ medecin }: FavoriButtonProps) {
  const { isFavori, toggleFavori } = useFavoris();
  const favori = isFavori(medecin.id);

  return (
    <button
      onClick={() => toggleFavori(medecin)}
      aria-label={favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className="w-10 h-10 rounded-2xl bg-white shadow-card flex items-center justify-center tap-scale transition-colors hover:bg-red-50"
    >
      <span className={`text-xl transition-transform ${favori ? 'scale-110' : 'scale-100'}`}>
        {favori ? '❤️' : '🤍'}
      </span>
    </button>
  );
}
