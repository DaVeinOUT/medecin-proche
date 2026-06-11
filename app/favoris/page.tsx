'use client';

import { useFavoris } from '@/hooks/useFavoris';
import MedecinCard from '@/components/MedecinCard';
import BottomNav from '@/components/BottomNav';
import PulseLine from '@/components/PulseLine';
import Link from 'next/link';
import { ChevronLeft, Heart, Stethoscope, MapPin } from 'lucide-react';
import { Medecin } from '@/types/medecin';

export default function FavorisPage() {
  const { favoris } = useFavoris();

  return (
    <div className="min-h-screen bg-sand-50" style={{ paddingBottom: 'calc(var(--bottom-nav-height) + 16px)' }}>

      {/* HÉROS ENCRE — aurora corail (les favoris, affaire de cœur) */}
      <div className="relative bg-ink-950 grain overflow-hidden">
        <div className="aurora w-60 h-60 -top-20 -right-14" style={{ background: '#FF7E66', opacity: 0.4 }} />
        <div className="aurora w-44 h-44 -bottom-16 -left-10" style={{ background: '#14A88B', opacity: 0.35 }} />

        <div className="max-w-2xl mx-auto px-4 pt-12 pb-7 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sand-50 text-sm font-bold bg-white/10 border border-white/20 backdrop-blur-sm px-3.5 py-2 rounded-full mb-5 tap-scale"
          >
            <ChevronLeft size={15} />
            Retour
          </Link>
          <p className="label-mono text-coral-400 mb-1.5">Carnet de santé</p>
          <h1 className="font-display font-semibold text-3xl text-sand-50">Mes favoris</h1>
          <p className="text-sand-200/70 text-sm mt-1 tnum">
            {favoris.length === 0
              ? 'Aucun médecin enregistré'
              : `${favoris.length} médecin${favoris.length > 1 ? 's' : ''} enregistré${favoris.length > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* LISTE */}
      <div className="max-w-2xl mx-auto pt-4">
        {favoris.length === 0 ? (

          /* ── État vide — signature Lagon ── */
          <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
            <div className="relative w-32 h-32 mb-6">
              <div className="absolute inset-0 bg-sand-100 border border-sand-200 rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Stethoscope size={52} className="text-lagoon-500" aria-hidden="true" />
              </div>
              <div className="absolute -top-1 -right-1 w-9 h-9 bg-coral-50 rounded-full flex items-center justify-center border-2 border-paper shadow-card">
                <Heart size={16} className="text-coral-500 fill-coral-500" aria-hidden="true" />
              </div>
            </div>

            <h2 className="font-display font-semibold text-xl text-ink-900">Aucun favori pour l&apos;instant</h2>
            <p className="text-mist-500 text-sm mt-2 max-w-xs leading-relaxed">
              Explorez les médecins des DOM-TOM et ajoutez vos praticiens préférés pour les retrouver rapidement.
            </p>

            <PulseLine className="w-28 h-5 mt-6 text-lagoon-300" />

            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-1.5 bg-lagoon-600 hover:bg-lagoon-700 text-white text-sm font-bold px-6 py-3.5 rounded-full tap-scale shadow-glow transition-colors"
            >
              <MapPin size={15} aria-hidden="true" />
              Trouver un médecin
            </Link>
          </div>

        ) : (
          <div className="pt-2">
            {favoris.map((m) => (
              <MedecinCard key={m.id} medecin={m as Medecin} />
            ))}
          </div>
        )}
      </div>

      <BottomNav activePage="favoris" />
    </div>
  );
}
