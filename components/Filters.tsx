'use client';

import { FiltersState, SPECIALITES } from '@/types/medecin';

interface FiltersProps {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
}

const selectClass = 'flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500';

export default function Filters({ filters, onChange }: FiltersProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filtres</p>
      <div className="flex gap-2">
        <select
          value={filters.specialite}
          onChange={(e) => onChange({ ...filters, specialite: e.target.value })}
          className={selectClass}
          aria-label="Filtrer par spécialité"
        >
          <option value="">Toutes spécialités</option>
          {SPECIALITES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={filters.distance}
          onChange={(e) => onChange({ ...filters, distance: Number(e.target.value) })}
          className={selectClass}
          aria-label="Rayon de recherche"
        >
          <option value={5}>5 km</option>
          <option value={10}>10 km</option>
          <option value={20}>20 km</option>
          <option value={50}>50 km</option>
          <option value={100}>100 km</option>
        </select>
      </div>

      <div className="flex gap-2 items-center">
        <select
          value={filters.secteur ?? ''}
          onChange={(e) => onChange({ ...filters, secteur: e.target.value ? Number(e.target.value) as 1 | 2 | 3 : null })}
          className={selectClass}
          aria-label="Filtrer par secteur"
        >
          <option value="">Tous secteurs</option>
          <option value="1">Secteur 1</option>
          <option value="2">Secteur 2</option>
          <option value="3">Secteur 3</option>
        </select>

        <button
          type="button"
          onClick={() => onChange({ ...filters, accepteNouveauxPatients: !filters.accepteNouveauxPatients })}
          aria-pressed={filters.accepteNouveauxPatients}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-colors whitespace-nowrap ${
            filters.accepteNouveauxPatients
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-gray-50 text-gray-600 border-gray-200'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${filters.accepteNouveauxPatients ? 'bg-white' : 'bg-gray-300'}`} />
          Disponible
        </button>
      </div>
    </div>
  );
}
