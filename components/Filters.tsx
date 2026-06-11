'use client';

import { ChevronDown } from 'lucide-react';
import { FiltersState, SPECIALITES } from '@/types/medecin';

interface FiltersProps {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
}

const selectClass =
  'w-full appearance-none bg-sand-50 border border-sand-200 rounded-xl pl-3.5 pr-9 py-2.5 text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-lagoon-400 cursor-pointer';

function SelectWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex-1 min-w-0">
      {children}
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-mist-500 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}

export default function Filters({ filters, onChange }: FiltersProps) {
  return (
    <div className="space-y-3">
      <p className="label-mono text-mist-600">Affiner la recherche</p>
      <div className="flex gap-2">
        <SelectWrap>
          <select
            value={filters.specialite}
            onChange={(e) => onChange({ ...filters, specialite: e.target.value })}
            className={selectClass}
            aria-label="Filtrer par spécialité"
          >
            <option value="">Toutes spécialités</option>
            {SPECIALITES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </SelectWrap>

        <SelectWrap>
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
        </SelectWrap>
      </div>

      <div className="flex gap-2 items-center">
        <SelectWrap>
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
        </SelectWrap>

        <button
          type="button"
          onClick={() => onChange({ ...filters, accepteNouveauxPatients: !filters.accepteNouveauxPatients })}
          aria-pressed={filters.accepteNouveauxPatients}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold border transition-colors whitespace-nowrap tap-scale ${
            filters.accepteNouveauxPatients
              ? 'bg-lagoon-600 text-white border-lagoon-600 shadow-glow'
              : 'bg-sand-50 text-mist-600 border-sand-200'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${filters.accepteNouveauxPatients ? 'bg-lagoon-200' : 'bg-sand-300'}`} />
          Disponible
        </button>
      </div>
    </div>
  );
}
