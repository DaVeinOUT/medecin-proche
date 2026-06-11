'use client';

import { useState, useEffect, useRef } from 'react';
import MedecinCard from './MedecinCard';
import PulseLine from './PulseLine';
import { Medecin } from '@/types/medecin';
import { toTitleCase } from '@/lib/utils';
import { Stethoscope, Globe } from 'lucide-react';

const PAGE_SIZE = 15;

type SortBy = 'distance' | 'nom' | 'disponible';

interface MedecinListProps {
  medecins: Medecin[];
  /** Total réel en base — la liste peut être plafonnée (300 territoire, 150 recherche) */
  total?: number;
  loading: boolean;
  mode?: 'proximity' | 'territoire' | 'text';
  territoire?: string;
  onSelectMedecin?: (m: Medecin) => void;
  selectedMedecinId?: string | null;
}

// Territoires avec couverture partielle (message adapté)
const COUVERTURE_LIMITEE = ['Réunion', 'Mayotte'];

function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="w-12 h-12 rounded-2xl skeleton shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 skeleton rounded-full w-2/3" />
        <div className="h-3 skeleton rounded-full w-1/3" />
        <div className="h-2.5 skeleton rounded-full w-1/2" />
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
  medecins, total, loading, mode = 'proximity', territoire, onSelectMedecin, selectedMedecinId,
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
    const couvertureLimitee = territoire && COUVERTURE_LIMITEE.some(t => territoire.includes(t));
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
        <div className="w-16 h-16 bg-sand-100 border border-sand-200 rounded-3xl flex items-center justify-center mb-4">
          {couvertureLimitee
            ? <Globe size={28} className="text-lagoon-500" aria-hidden="true" />
            : <Stethoscope size={28} className="text-lagoon-500" aria-hidden="true" />
          }
        </div>
        <p className="font-display font-semibold text-lg text-ink-900">Aucun médecin trouvé</p>
        <p className="text-mist-500 text-sm mt-1.5 max-w-xs leading-relaxed">
          {couvertureLimitee
            ? `Nous travaillons à améliorer la couverture de ${territoire}. Essayez une recherche par nom ou spécialité.`
            : mode === 'proximity'
              ? 'Sélectionnez un territoire ou élargissez le rayon'
              : 'Essayez une autre recherche'}
        </p>
        <PulseLine className="w-28 h-5 mt-5 text-lagoon-300" />
      </div>
    );
  }

  const sorted = sortMedecins(medecins, sortBy);
  const shown  = sorted.slice(0, visible);
  const hasMore = visible < sorted.length;

  return (
    <div ref={containerRef}>
      {/* Barre de tri */}
      <div className="flex items-center gap-2 px-4 py-2.5">
        <span className="label-mono text-mist-500 shrink-0">Trier</span>
        {(['distance', 'disponible', 'nom'] as SortBy[]).map((opt) => (
          <button
            key={opt}
            onClick={() => setSortBy(opt)}
            aria-pressed={sortBy === opt}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors tap-scale ${
              sortBy === opt
                ? 'bg-ink-900 text-sand-50'
                : 'bg-sand-100 text-mist-600 border border-sand-200'
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
          className="block w-fit mx-auto my-3 px-5 py-2.5 rounded-full border border-lagoon-600 text-xs font-bold text-lagoon-700 hover:bg-lagoon-50 transition-colors tap-scale"
        >
          Afficher {Math.min(PAGE_SIZE, sorted.length - visible)} de plus ({sorted.length - visible} restants)
        </button>
      )}

      <div className="py-4 text-center space-y-1.5">
        <PulseLine className="w-20 h-4 mx-auto text-sand-300" />
        <p className="text-xs text-mist-400 tnum">
          {total && total > medecins.length
            ? `${medecins.length} affichés sur ${total.toLocaleString('fr-FR')} — affinez avec les filtres`
            : `${medecins.length} résultat${medecins.length > 1 ? 's' : ''}`}
        </p>
        <p className="text-[10px] text-mist-400/80">Données non actualisées en temps réel · Vérifiez par téléphone</p>
      </div>
    </div>
  );
}
