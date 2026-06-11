'use client';

import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import PulseLine from '@/components/PulseLine';
import { useLang } from '@/hooks/useLang';
import { NUMEROS_NATIONAUX, URGENCES_PAR_TERRITOIRE } from '@/lib/urgences';
import { Phone, Siren, Pill, ExternalLink, Stethoscope } from 'lucide-react';

export default function UrgencesPage() {
  const { t } = useLang();
  const [territoire, setTerritoire] = useState('Martinique');
  const local = URGENCES_PAR_TERRITOIRE.find((t) => t.territoire === territoire);

  return (
    <div className="min-h-screen bg-sand-50" style={{ paddingBottom: 'calc(var(--bottom-nav-height) + 16px)' }}>

      {/* HÉROS ENCRE — aurora corail, le souffle de l'alarme */}
      <div className="relative bg-ink-950 grain overflow-hidden">
        <div className="aurora w-72 h-72 -top-24 -right-16" style={{ background: '#F0604A', opacity: 0.55 }} />
        <div className="aurora w-44 h-44 -bottom-14 -left-12" style={{ background: '#FF7E66', opacity: 0.25 }} />

        <div className="max-w-2xl mx-auto px-4 pt-12 pb-6 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 bg-coral-500/20 border border-coral-400/30 rounded-2xl flex items-center justify-center">
              <Siren size={20} className="text-coral-400" aria-hidden="true" />
            </div>
            <h1 className="font-display font-semibold text-3xl text-sand-50">{t('nav.urgences')}</h1>
          </div>
          <p className="text-sand-200/80 text-sm leading-relaxed">{t('urgences.sousTitre')}</p>
          <PulseLine animated className="w-40 h-4 mt-4 text-coral-400/80" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {/* APPEL VITAL — toujours en premier */}
        <a
          href="tel:15"
          className="btn-vital flex items-center justify-between bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-3xl pl-5 pr-3 py-4 tap-scale"
        >
          <div className="min-w-0">
            <p className="font-display font-semibold text-xl leading-tight">{t('urgences.vital')}</p>
            <p className="text-white/85 text-xs mt-1">{t('urgences.vitalSous')}</p>
          </div>
          <div className="w-14 h-14 bg-white/20 border border-white/25 rounded-2xl flex items-center justify-center shrink-0 ml-3">
            <span className="font-display font-bold text-2xl tnum" aria-hidden="true">15</span>
            <span className="sr-only">Appeler le 15</span>
          </div>
        </a>

        {/* NUMÉROS NATIONAUX */}
        <div className="bg-paper border border-sand-200 rounded-3xl shadow-card overflow-hidden">
          <p className="px-5 pt-4 pb-2 label-mono text-mist-500">
            {t('urgences.nationaux')}
          </p>
          <div className="divide-y divide-sand-100">
            {NUMEROS_NATIONAUX.map((n) => (
              <a
                key={n.numero}
                href={`tel:${n.numero}`}
                className="flex items-center justify-between px-5 py-3.5 tap-scale hover:bg-sand-50 transition-colors"
              >
                <div>
                  <p className="text-sm text-ink-900 font-semibold">{n.nom}</p>
                  {n.description && <p className="text-xs text-mist-500 mt-0.5">{n.description}</p>}
                </div>
                <span className="font-display font-bold text-xl text-coral-600 tnum shrink-0 ml-4">{n.affichage}</span>
              </a>
            ))}
          </div>
        </div>

        {/* SÉLECTEUR TERRITOIRE */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 py-1" role="tablist" aria-label="Choisir un territoire">
          {URGENCES_PAR_TERRITOIRE.map((u) => {
            const active = territoire === u.territoire;
            return (
              <button
                key={u.territoire}
                onClick={() => setTerritoire(u.territoire)}
                role="tab"
                aria-selected={active}
                className={`shrink-0 h-10 px-4 rounded-full text-xs font-bold transition-all tap-scale ${
                  active
                    ? 'bg-coral-500 text-white shadow-glow-coral'
                    : 'glass-ink text-sand-100 shadow-card'
                }`}
              >
                {u.territoire}
              </button>
            );
          })}
        </div>

        {/* SERVICES LOCAUX */}
        {local && (
          <div className="bg-paper border border-sand-200 rounded-3xl shadow-card overflow-hidden">
            <p className="px-5 pt-4 pb-2 label-mono text-mist-500">
              Gardes — {local.territoire}
            </p>
            <div className="divide-y divide-sand-100">

              {local.sosMedecins ? (
                <a
                  href={`tel:${local.sosMedecins.numero}`}
                  className="flex items-center gap-4 px-5 py-3.5 tap-scale hover:bg-sand-50 transition-colors"
                >
                  <div className="w-9 h-9 bg-lagoon-50 rounded-xl flex items-center justify-center shrink-0">
                    <Stethoscope size={15} className="text-lagoon-700" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-ink-900 font-semibold">{local.sosMedecins.nom}</p>
                    {local.sosMedecins.description && (
                      <p className="text-xs text-mist-500 mt-0.5">{local.sosMedecins.description}</p>
                    )}
                  </div>
                  <span className="font-display font-bold text-sm text-lagoon-700 tnum shrink-0">{local.sosMedecins.affichage}</span>
                </a>
              ) : (
                <div className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-9 h-9 bg-lagoon-50 rounded-xl flex items-center justify-center shrink-0">
                    <Stethoscope size={15} className="text-lagoon-700" aria-hidden="true" />
                  </div>
                  <p className="text-sm text-mist-600">
                    Pas de SOS Médecins sur ce territoire — appelez le <a href="tel:15" className="font-bold text-coral-600">15</a> pour le médecin de garde.
                  </p>
                </div>
              )}

              {local.pharmaciesGarde.url && (
                <a
                  href={local.pharmaciesGarde.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-5 py-3.5 tap-scale hover:bg-sand-50 transition-colors"
                >
                  <div className="w-9 h-9 bg-mango-50 rounded-xl flex items-center justify-center shrink-0">
                    <Pill size={15} className="text-mango-600" aria-hidden="true" />
                  </div>
                  <p className="flex-1 text-sm text-ink-900 font-semibold">{local.pharmaciesGarde.label}</p>
                  <ExternalLink size={14} className="text-sand-300 shrink-0" aria-hidden="true" />
                </a>
              )}

            </div>
          </div>
        )}

        {/* Avertissement fraîcheur des données */}
        <div className="text-center space-y-1.5 px-6">
          <PulseLine className="w-20 h-4 mx-auto text-sand-300" />
          <p className="text-[11px] text-mist-500 leading-relaxed">
            Numéros vérifiés manuellement — en cas de doute, le <a href="tel:15" className="font-bold text-coral-600">15</a> reste le bon réflexe.
            Pharmacies de garde : consultez aussi le 3237.
          </p>
        </div>

      </div>

      <BottomNav activePage="urgences" />
    </div>
  );
}
