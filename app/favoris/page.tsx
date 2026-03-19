'use client';

import { useFavoris } from '@/hooks/useFavoris';
import MedecinCard from '@/components/MedecinCard';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Medecin } from '@/types/medecin';

export default function FavorisPage() {
  const { favoris } = useFavoris();

  return (
    <div className="min-h-screen bg-surface pb-20">

      {/* HEADER avec dégradé tropical */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-700 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="max-w-2xl mx-auto px-4 pt-14 pb-6 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-white/90 text-sm font-semibold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-xl mb-4 tap-scale"
          >
            <ChevronLeft size={15} />
            Retour
          </Link>
          <h1 className="text-2xl font-extrabold text-white">Mes favoris</h1>
          <p className="text-white/70 text-sm mt-0.5">
            {favoris.length === 0
              ? 'Aucun médecin enregistré'
              : `${favoris.length} médecin${favoris.length > 1 ? 's' : ''} enregistré${favoris.length > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* LISTE */}
      <div className="max-w-2xl mx-auto pt-4">
        {favoris.length === 0 ? (

          /* ── État vide — identité tropicale ── */
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            {/* Illustration */}
            <div className="relative w-32 h-32 mb-6">
              <div className="absolute inset-0 bg-primary-100 rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl" aria-hidden="true">🌺</span>
              </div>
              {/* Petits éléments décoratifs */}
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-coral-50 rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-base" aria-hidden="true">❤️</span>
              </div>
            </div>

            <h2 className="text-gray-800 font-extrabold text-lg">Aucun favori pour l&apos;instant</h2>
            <p className="text-gray-400 text-sm mt-2 max-w-xs leading-relaxed">
              Explorez les médecins des DOM-TOM et ajoutez vos praticiens préférés pour les retrouver rapidement.
            </p>

            <Link
              href="/"
              className="mt-8 bg-gradient-to-r from-primary-500 to-primary-700 text-white text-sm font-bold px-6 py-3 rounded-2xl tap-scale shadow-float transition"
            >
              Trouver un médecin 🗺️
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
