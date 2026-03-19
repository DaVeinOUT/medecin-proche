'use client';

import { useState, useEffect, useRef } from 'react';
import MedecinCard from './MedecinCard';
import { Medecin } from '@/types/medecin';
import { toTitleCase } from '@/lib/utils';

const PAGE_SIZE = 15;

type SortBy = 'distance' | 'nom' | 'disponible';

interface MedecinListProps {
  medecins: Medecin[];
  loading: boolean;
  mode?: 'proximity' | 'territoire' | 'text';
  territoire?: string;
  onSelectMedecin?: (m: Medecin) => void;
  selectedMedecinId?: string | null;
}

function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 animate-pulse">
      <div className="w-11 h-11 rounded-2xl bg-gray-100 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-100 rounded-full w-2/3" />
        <div className="h-3 bg-gray-100 rounded-full w-1/3" />
        <div className="h-2.5 bg-gray-100 rounded-full w-1/2" />
      </div>
    </div>
  );
}

function sortMedecins(list: Medecin[], by: SortBy): Medecin[] {
  if (by === 'distance') return list; // already sorted by API
  if (by === 'nom') return [...list].sort((a, b) => toTitleCase(a.nom).localeCompare(toTitleCase(b.nom), 'fr'));
  if (by === 'disponible') return [...list].sort((a, b) => Number(b.accepte_nouveaux_patients) - Number(a.accepte_nouveaux_patients));
  return list;
}

export default function MedecinList({
  medecins, loading, mode = 'proximity', onSelectMedecin, selectedMedecinId,
}: MedecinListProps) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [sortBy, setSortBy]   = useState<SortBy>('distance');
  const containerRef          = useRef<HTMLDivElement>(null);

  // Réinitialise la pagination à chaque nouvelle liste
  useEffect(() => { setVisible(PAGE_SIZE); }, [medecins]);

  // Scroll vers le médecin sélectionné depuis la carte
  useEffect(() => {
    if (!selectedMedecinId || !containerRef.current) return;

    // S'assurer que la carte est visible (étendre la liste si nécessaire)
    const idx = sorted.findIndex((m) => m.id === selectedMedecinId);
    if (idx >= visible) setVisible(idx + 1);

    // Scroll après rendu
    requestAnimationFrame(() => {
      const el = containerRef.current?.querySelector(`[data-medecin-id="${selectedMedecinId}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMedecinId]);

  if (loading) {
    return (
      <div>
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (medecins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mb-4">
          <span className="text-3xl">🏥</span>
        </div>
        <p className="font-semibold text-gray-800">Aucun médecin trouvé</p>
        <p className="text-gray-400 text-sm mt-1">
          {mode === 'proximity'
            ? 'Sélectionnez un territoire ou élargissez le rayon'
            : 'Essayez une autre recherche'}
        </p>
      </div>
    );
  }

  const sorted = sortMedecins(medecins, sortBy);
  const shown  = sorted.slice(0, visible);
  const hasMore = visible < sorted.length;

  return (
    <div ref={containerRef}>
      {/* Barre de tri */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-50">
        <span className="text-[11px] text-gray-400 font-medium shrink-0">Trier :</span>
        {(['distance', 'disponible', 'nom'] as SortBy[]).map((opt) => (
          <button
            key={opt}
            onClick={() => setSortBy(opt)}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
              sortBy === opt ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {opt === 'distance' ? 'Distance' : opt === 'disponible' ? 'Disponibles' : 'Nom A–Z'}
          </button>
        ))}
      </div>

      {shown.map((m) => (
        <MedecinCard
          key={m.id}
          medecin={m}
          selected={m.id === selectedMedecinId}
          onSelect={onSelectMedecin ? () => onSelectMedecin(m) : undefined}
        />
      ))}

      {hasMore && (
        <button
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
          className="w-full py-3 text-xs font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
        >
          Afficher {Math.min(PAGE_SIZE, sorted.length - visible)} de plus ({sorted.length - visible} restants)
        </button>
      )}

      <div className="py-4 text-center space-y-1">
        <p className="text-xs text-gray-300">— {medecins.length} résultat{medecins.length > 1 ? 's' : ''} —</p>
        <p className="text-[10px] text-gray-200">Données non actualisées en temps réel · Vérifiez par téléphone</p>
      </div>
    </div>
  );
}
