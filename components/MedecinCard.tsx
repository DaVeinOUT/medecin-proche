'use client';

import Link from 'next/link';
import { Phone, MapPin, ChevronRight } from 'lucide-react';
import { Medecin } from '@/types/medecin';
import { avatarBg, getInitiales } from '@/lib/avatar';
import { toTitleCase } from '@/lib/utils';

interface MedecinCardProps {
  medecin: Medecin;
  onSelect?: () => void;
  selected?: boolean;
}

export default function MedecinCard({ medecin, onSelect, selected }: MedecinCardProps) {
  const rawDist = medecin.distance;
  const distanceLabel = rawDist !== undefined
    ? rawDist < 100 ? 'À côté' : `${(rawDist / 1000).toFixed(1)} km`
    : null;

  const displayNom = toTitleCase(medecin.nom);
  const initiales  = getInitiales(medecin.prenom, medecin.nom);

  return (
    <div
      data-medecin-id={medecin.id}
      onClick={onSelect}
      role={onSelect ? 'button' : undefined}
      className={`medecin-card flex items-center gap-3 pl-3.5 pr-3 py-3.5 cursor-pointer ${selected ? 'selected' : ''}`}
    >
      {/* Avatar — initiales serif, teinte spécialité */}
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display font-semibold text-[15px] shrink-0 ${avatarBg(medecin.nom, medecin.specialite)}`}>
        {initiales}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-bold text-ink-950 text-[15px] leading-tight truncate">
            Dr {medecin.prenom ? toTitleCase(medecin.prenom) : ''} {displayNom}
          </p>
          {distanceLabel && (
            <span className="label-mono tnum text-mist-600 bg-sand-100 border border-sand-200 px-2 py-0.5 rounded-full shrink-0">
              {distanceLabel}
            </span>
          )}
        </div>

        <p className="text-xs text-lagoon-700 font-bold mt-0.5 truncate">{medecin.specialite}</p>

        <div className="flex items-center gap-2.5 mt-1.5">
          <div className="flex items-center gap-1 text-mist-500 text-[11px] truncate">
            <MapPin size={10} aria-hidden="true" />
            <span className="truncate">{medecin.ville}</span>
          </div>
          {medecin.accepte_nouveaux_patients ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-lagoon-700 shrink-0">
              <span className="relative flex w-1.5 h-1.5" aria-hidden="true">
                <span className="absolute inline-flex w-full h-full rounded-full bg-lagoon-400 animate-pulse-ring" />
                <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-lagoon-500" />
              </span>
              Disponible
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-mist-500 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-sand-300" aria-hidden="true" />
              Complet
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {medecin.telephone && (
          <a
            href={`tel:${medecin.telephone}`}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Appeler ${medecin.prenom} ${displayNom}`}
            className="w-11 h-11 rounded-2xl bg-lagoon-600 text-white flex items-center justify-center tap-scale shadow-lift hover:bg-lagoon-700 transition-colors"
          >
            <Phone size={16} />
          </a>
        )}
        <Link
          href={`/medecin/${medecin.id}`}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Voir la fiche de ${medecin.prenom} ${displayNom}`}
          className="w-8 h-11 flex items-center justify-center"
        >
          <ChevronRight size={16} className="text-sand-300" />
        </Link>
      </div>
    </div>
  );
}
