'use client';

import { useRouter } from 'next/navigation';
import { Phone, MapPin, ChevronRight } from 'lucide-react';
import { Medecin } from '@/types/medecin';
import { avatarBg, getInitiales } from '@/lib/avatar';

interface MedecinCardProps {
  medecin: Medecin;
}

export default function MedecinCard({ medecin }: MedecinCardProps) {
  const router = useRouter();
  const distanceKm = medecin.distance ? (medecin.distance / 1000).toFixed(1) : null;
  const initiales = getInitiales(medecin.prenom, medecin.nom);

  return (
    <div
      onClick={() => router.push(`/medecin/${medecin.id}`)}
      className="flex items-center gap-3 px-4 py-3.5 bg-white active:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50"
    >
      {/* Avatar */}
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${avatarBg(medecin.nom)}`}>
        {initiales}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-gray-900 text-sm leading-tight truncate">
            Dr {medecin.prenom} {medecin.nom}
          </p>
          {distanceKm && (
            <span className="text-[11px] font-medium text-gray-400 shrink-0 bg-gray-100 px-1.5 py-0.5 rounded-full">
              {distanceKm} km
            </span>
          )}
        </div>

        <p className="text-xs text-primary-600 font-medium mt-0.5 truncate">{medecin.specialite}</p>

        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex items-center gap-1 text-gray-400 text-[11px] truncate">
            <MapPin size={10} />
            <span className="truncate">{medecin.ville}</span>
          </div>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
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
            className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center tap-scale"
          >
            <Phone size={14} className="text-primary-600" />
          </a>
        )}
        <ChevronRight size={16} className="text-gray-300 ml-1" />
      </div>
    </div>
  );
}
