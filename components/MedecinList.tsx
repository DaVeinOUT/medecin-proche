import MedecinCard from './MedecinCard';
import { Medecin } from '@/types/medecin';

interface MedecinListProps {
  medecins: Medecin[];
  loading: boolean;
  mode?: 'proximity' | 'territoire' | 'text';
  territoire?: string;
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

export default function MedecinList({ medecins, loading, mode = 'proximity', territoire }: MedecinListProps) {
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

  return (
    <div>
      {medecins.map((m) => <MedecinCard key={m.id} medecin={m} />)}
      <div className="py-4 text-center">
        <p className="text-xs text-gray-300">— {medecins.length} résultat{medecins.length > 1 ? 's' : ''} —</p>
      </div>
    </div>
  );
}
