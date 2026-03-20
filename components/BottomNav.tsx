'use client';

import Link from 'next/link';
import { MapPin, List, Heart } from 'lucide-react';

interface BottomNavProps {
  activePage?: 'map' | 'favoris';
  listActive?: boolean;   // true quand le bottom sheet est en état 'full'
  onMapClick?: () => void;
  onListClick?: () => void;
}

export default function BottomNav({ activePage = 'map', listActive = false, onMapClick, onListClick }: BottomNavProps) {
  const isMap     = activePage === 'map';
  const isFavoris = activePage === 'favoris';
  const mapActive = isMap && !listActive;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
      aria-label="Navigation principale"
    >
      <div className="flex items-center justify-around px-4 pt-2 pb-2">

        {/* Carte */}
        {isMap ? (
          <button
            onClick={onMapClick}
            aria-label="Voir la carte"
            className={`flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-2xl tap-scale transition-colors ${
              mapActive ? 'bg-primary-50' : ''
            }`}
          >
            <MapPin size={22} className={mapActive ? 'text-primary-600' : 'text-gray-300'} />
            <span className={`text-[11px] ${mapActive ? 'font-bold text-primary-600' : 'font-medium text-gray-300'}`}>
              Carte
            </span>
          </button>
        ) : (
          <Link href="/" className="flex flex-col items-center gap-0.5 px-5 py-1.5 tap-scale" aria-label="Voir la carte">
            <MapPin size={22} className="text-gray-300" />
            <span className="text-[11px] font-medium text-gray-300">Carte</span>
          </Link>
        )}

        {/* Liste */}
        {isMap ? (
          <button
            onClick={onListClick}
            aria-label="Voir la liste des médecins"
            className={`flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-2xl tap-scale transition-colors ${
              listActive ? 'bg-primary-50' : ''
            }`}
          >
            <List size={22} className={listActive ? 'text-primary-600' : 'text-gray-400'} />
            <span className={`text-[11px] ${listActive ? 'font-bold text-primary-600' : 'font-medium text-gray-400'}`}>
              Liste
            </span>
          </button>
        ) : (
          <Link href="/" className="flex flex-col items-center gap-0.5 px-5 py-1.5 tap-scale" aria-label="Voir la liste">
            <List size={22} className="text-gray-300" />
            <span className="text-[11px] font-medium text-gray-300">Liste</span>
          </Link>
        )}

        {/* Favoris */}
        <Link
          href="/favoris"
          aria-label="Mes médecins favoris"
          className={`flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-2xl tap-scale ${isFavoris ? 'bg-primary-50' : ''}`}
        >
          <Heart size={22} className={isFavoris ? 'text-primary-600 fill-primary-600' : 'text-gray-400'} aria-hidden="true" />
          <span className={`text-[11px] ${isFavoris ? 'font-bold text-primary-600' : 'font-medium text-gray-400'}`}>
            Favoris
          </span>
        </Link>

      </div>
    </nav>
  );
}
