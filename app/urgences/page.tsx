'use client';

import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { useLang } from '@/hooks/useLang';
import { NUMEROS_NATIONAUX, URGENCES_PAR_TERRITOIRE } from '@/lib/urgences';
import { Phone, Siren, Pill, ExternalLink, Stethoscope } from 'lucide-react';

export default function UrgencesPage() {
  const { t } = useLang();
  const [territoire, setTerritoire] = useState('Martinique');
  const local = URGENCES_PAR_TERRITOIRE.find((t) => t.territoire === territoire);

  return (
    <div className="min-h-screen bg-surface pb-24">

      {/* HEADER — rouge urgence, dégradé */}
      <div className="bg-gradient-to-br from-red-500 to-red-700 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="max-w-2xl mx-auto px-4 pt-14 pb-6 relative z-10">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Siren size={20} className="text-white" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">{t('nav.urgences')}</h1>
          </div>
          <p className="text-white/80 text-sm">{t('urgences.sousTitre')}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {/* APPEL VITAL — toujours en premier */}
        <a
          href="tel:15"
          className="flex items-center justify-between bg-red-600 text-white rounded-2xl px-5 py-4 shadow-float tap-scale"
        >
          <div>
            <p className="font-extrabold text-lg leading-tight">{t('urgences.vital')}</p>
            <p className="text-white/80 text-xs mt-0.5">{t('urgences.vitalSous')}</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <Phone size={22} aria-hidden="true" />
          </div>
        </a>

        {/* NUMÉROS NATIONAUX */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <p className="px-5 pt-4 pb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            {t('urgences.nationaux')}
          </p>
          <div className="divide-y divide-gray-50">
            {NUMEROS_NATIONAUX.map((n) => (
              <a
                key={n.numero}
                href={`tel:${n.numero}`}
                className="flex items-center justify-between px-5 py-3.5 tap-scale"
              >
                <div>
                  <p className="text-sm text-gray-800 font-semibold">{n.nom}</p>
                  {n.description && <p className="text-xs text-gray-400 mt-0.5">{n.description}</p>}
                </div>
                <span className="text-base font-extrabold text-red-600 shrink-0 ml-4">{n.affichage}</span>
              </a>
            ))}
          </div>
        </div>

        {/* SÉLECTEUR TERRITOIRE */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 py-1">
          {URGENCES_PAR_TERRITOIRE.map((t) => (
            <button
              key={t.territoire}
              onClick={() => setTerritoire(t.territoire)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                territoire === t.territoire
                  ? 'bg-primary-600 text-white shadow-float'
                  : 'bg-white text-gray-500 shadow-card'
              }`}
            >
              {t.territoire}
            </button>
          ))}
        </div>

        {/* SERVICES LOCAUX */}
        {local && (
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <p className="px-5 pt-4 pb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
              Gardes — {local.territoire}
            </p>
            <div className="divide-y divide-gray-50">

              {local.sosMedecins ? (
                <a
                  href={`tel:${local.sosMedecins.numero}`}
                  className="flex items-center gap-4 px-5 py-3.5 tap-scale"
                >
                  <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <Stethoscope size={15} className="text-primary-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 font-semibold">{local.sosMedecins.nom}</p>
                    {local.sosMedecins.description && (
                      <p className="text-xs text-gray-400 mt-0.5">{local.sosMedecins.description}</p>
                    )}
                  </div>
                  <span className="text-sm font-extrabold text-primary-600 shrink-0">{local.sosMedecins.affichage}</span>
                </a>
              ) : (
                <div className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <Stethoscope size={15} className="text-primary-600" aria-hidden="true" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Pas de SOS Médecins sur ce territoire — appelez le <a href="tel:15" className="font-bold text-primary-600">15</a> pour le médecin de garde.
                  </p>
                </div>
              )}

              {local.pharmaciesGarde.url && (
                <a
                  href={local.pharmaciesGarde.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-5 py-3.5 tap-scale"
                >
                  <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                    <Pill size={15} className="text-emerald-600" aria-hidden="true" />
                  </div>
                  <p className="flex-1 text-sm text-gray-800 font-semibold">{local.pharmaciesGarde.label}</p>
                  <ExternalLink size={14} className="text-gray-300 shrink-0" aria-hidden="true" />
                </a>
              )}

            </div>
          </div>
        )}

        {/* Avertissement fraîcheur des données */}
        <p className="text-[11px] text-gray-400 text-center px-6 leading-relaxed">
          Numéros vérifiés manuellement — en cas de doute, le 15 reste le bon réflexe.
          Pharmacies de garde : consultez aussi le 3237.
        </p>

      </div>

      <BottomNav activePage="urgences" />
    </div>
  );
}
