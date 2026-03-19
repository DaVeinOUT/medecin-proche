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
      className={`medecin-card flex items-center gap-3 px-4 py-3.5 cursor-pointer ${selected ? 'selected' : ''}`}
    >
      {/* Avatar coloré par spécialité */}
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 ${avatarBg(medecin.nom, medecin.specialite)}`}>
        {initiales}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-bold text-gray-900 text-[15px] leading-tight truncate">
            Dr {medecin.prenom ? toTitleCase(medecin.prenom) : ''} {displayNom}
          </p>
          {distanceLabel && (
            <span className="text-[11px] font-semibold text-gray-400 shrink-0 bg-gray-100 px-1.5 py-0.5 rounded-full">
              {distanceLabel}
            </span>
          )}
        </div>

        <p className="text-xs text-primary-600 font-semibold mt-0.5 truncate">{medecin.specialite}</p>

        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex items-center gap-1 text-gray-400 text-[11px] truncate">
            <MapPin size={10} />
            <span className="truncate">{medecin.ville}</span>
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
            medecin.accepte_nouveaux_patients ? 'badge-green' : 'badge-red'
          }`}>
            {medecin.accepte_nouveaux_patients ? 'Disponible' : 'Complet'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {medecin.telephone && (
          <a
            href={`tel:${medecin.telephone}`}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Appeler ${medecin.prenom} ${displayNom}`}
            className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center tap-scale"
          >
            <Phone size={15} className="text-primary-600" />
          </a>
        )}
        <Link
          href={`/medecin/${medecin.id}`}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Voir la fiche de ${medecin.prenom} ${displayNom}`}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ChevronRight size={16} className="text-gray-300" />
        </Link>
      </div>
    </div>
  );
}
