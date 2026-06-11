'use client';

import Link from 'next/link';
import { MapPin, List, Heart, Siren } from 'lucide-react';
import { useLang } from '@/hooks/useLang';

interface BottomNavProps {
  /** 'none' : aucune entrée active (pages annexes type annuaire) */
  activePage?: 'map' | 'favoris' | 'urgences' | 'none';
  listActive?: boolean;   // true quand le bottom sheet est en état 'full'
  onMapClick?: () => void;
  onListClick?: () => void;
}

const itemBase =
  'flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-2xl tap-scale transition-colors min-h-[52px]';

export default function BottomNav({ activePage = 'map', listActive = false, onMapClick, onListClick }: BottomNavProps) {
  const { t } = useLang();
  const isMap      = activePage === 'map';
  const isFavoris  = activePage === 'favoris';
  const isUrgences = activePage === 'urgences';
  const mapActive = isMap && !listActive;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      aria-label="Navigation principale"
    >
      <div
        className="glass-ink rounded-t-[22px] px-2 pt-1.5"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}
      >
        <div className="max-w-2xl mx-auto flex items-stretch gap-1">

          {/* Carte */}
          {isMap ? (
            <button
              onClick={onMapClick}
              aria-label="Voir la carte"
              className={`${itemBase} ${mapActive ? 'bg-white/10' : ''}`}
            >
              <MapPin size={21} className={mapActive ? 'text-lagoon-300' : 'text-sand-200/60'} />
              <span className={`text-[11px] tracking-wide ${mapActive ? 'font-bold text-lagoon-300' : 'font-semibold text-sand-200/60'}`}>
                {t('nav.carte')}
              </span>
            </button>
          ) : (
            <Link href="/" className={itemBase} aria-label="Voir la carte">
              <MapPin size={21} className="text-sand-200/60" />
              <span className="text-[11px] font-semibold tracking-wide text-sand-200/60">{t('nav.carte')}</span>
            </Link>
          )}

          {/* Liste */}
          {isMap ? (
            <button
              onClick={onListClick}
              aria-label="Voir la liste des médecins"
              className={`${itemBase} ${listActive ? 'bg-white/10' : ''}`}
            >
              <List size={21} className={listActive ? 'text-lagoon-300' : 'text-sand-200/60'} />
              <span className={`text-[11px] tracking-wide ${listActive ? 'font-bold text-lagoon-300' : 'font-semibold text-sand-200/60'}`}>
                {t('nav.liste')}
              </span>
            </button>
          ) : (
            <Link href="/" className={itemBase} aria-label="Voir la liste">
              <List size={21} className="text-sand-200/60" />
              <span className="text-[11px] font-semibold tracking-wide text-sand-200/60">{t('nav.liste')}</span>
            </Link>
          )}

          {/* Favoris */}
          <Link
            href="/favoris"
            aria-label="Mes médecins favoris"
            className={`${itemBase} ${isFavoris ? 'bg-white/10' : ''}`}
          >
            <Heart
              size={21}
              className={isFavoris ? 'text-coral-400 fill-coral-400' : 'text-sand-200/60'}
              aria-hidden="true"
            />
            <span className={`text-[11px] tracking-wide ${isFavoris ? 'font-bold text-coral-400' : 'font-semibold text-sand-200/60'}`}>
              {t('nav.favoris')}
            </span>
          </Link>

          {/* Urgences */}
          <Link
            href="/urgences"
            aria-label="Numéros d'urgence et services de garde"
            className={`${itemBase} ${isUrgences ? 'bg-coral-500/20' : ''}`}
          >
            <Siren size={21} className={isUrgences ? 'text-coral-400' : 'text-sand-200/60'} aria-hidden="true" />
            <span className={`text-[11px] tracking-wide ${isUrgences ? 'font-bold text-coral-400' : 'font-semibold text-sand-200/60'}`}>
              {t('nav.urgences')}
            </span>
          </Link>

        </div>
      </div>
    </nav>
  );
}
