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

      {/* HEADER */}
      <div className="bg-white shadow-card">
        <div className="max-w-2xl mx-auto px-4 pt-12 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-primary-600 text-sm font-semibold mb-4 tap-scale"
          >
            <ChevronLeft size={16} />
            Retour
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Mes favoris</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {favoris.length === 0
              ? 'Aucun médecin enregistré'
              : `${favoris.length} médecin${favoris.length > 1 ? 's' : ''} enregistré${favoris.length > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* LISTE */}
      <div className="max-w-2xl mx-auto">
        {favoris.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <span className="text-5xl mb-4" aria-hidden="true">🤍</span>
            <p className="text-gray-600 font-medium">Aucun favori pour l&apos;instant</p>
            <p className="text-sm text-gray-400 mt-1">
              Appuyez sur ❤️ sur la fiche d&apos;un médecin pour l&apos;enregistrer ici.
            </p>
            <Link
              href="/"
              className="mt-6 bg-primary-600 text-white text-sm font-semibold px-5 py-2.5 rounded-2xl tap-scale hover:bg-primary-700 transition-colors"
            >
              Rechercher des médecins
            </Link>
          </div>
        ) : (
          <div className="mt-2">
            {favoris.map((m) => (
              <MedecinCard key={m.id} medecin={m as Medecin} />
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM NAV PERSISTANTE */}
      <BottomNav activePage="favoris" />
    </div>
  );
}
