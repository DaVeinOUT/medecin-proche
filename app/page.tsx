'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import SearchBar from '@/components/SearchBar';
import TerritoireSelector from '@/components/TerritoireSelector';
import MedecinList from '@/components/MedecinList';
import Filters from '@/components/Filters';
import { Medecin, FiltersState } from '@/types/medecin';
import { getMedecinsProches, getMedecinsByTerritoire, searchMedecins } from '@/lib/supabase';
import { MapPin, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

type SearchMode = 'proximity' | 'territoire' | 'text';
type SheetState = 'peek' | 'half' | 'full';

const SHEET_TRANSLATE: Record<SheetState, string> = {
  full: '0px',
  half: '40%',
  peek: 'calc(100% - 220px - 64px)',
};

export default function HomePage() {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter]       = useState<[number, number] | null>(null);
  const [medecins, setMedecins]         = useState<Medecin[]>([]);
  const [loading, setLoading]           = useState(true);
  const [fetchError, setFetchError]     = useState<string | null>(null);
  const [searchMode, setSearchMode]     = useState<SearchMode>('proximity');
  const [searchQuery, setSearchQuery]   = useState('');
  const [territoire, setTerritoire]     = useState('Martinique');
  const [sheetState, setSheetState]     = useState<SheetState>('peek');
  const [showFilters, setShowFilters]   = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    specialite: '',
    distance: 10,
    secteur: null,
    accepteNouveauxPatients: false,
  });

  const dragStartY        = useRef(0);
  const dragStartState    = useRef<SheetState>('peek');
  const fetchTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchMedecins = useCallback(async (
    mode: SearchMode,
    opts: { position?: [number, number]; territoire?: string; query?: string; filters: FiltersState }
  ) => {
    setLoading(true);
    setFetchError(null);
    let results: Medecin[] = [];

    try {
      if (mode === 'proximity' && opts.position) {
        results = await getMedecinsProches({
          lat: opts.position[0], lng: opts.position[1],
          rayon: opts.filters.distance,
          specialite: opts.filters.specialite,
          secteur: opts.filters.secteur,
          accepteNouveauxPatients: opts.filters.accepteNouveauxPatients || undefined,
        });
      } else if (mode === 'territoire' && opts.territoire) {
        results = await getMedecinsByTerritoire(
          opts.territoire,
          opts.filters.specialite,
          opts.filters.secteur,
          opts.filters.accepteNouveauxPatients || undefined,
        );
      } else if (mode === 'text' && opts.query) {
        results = await searchMedecins(
          opts.query,
          opts.filters.specialite,
          opts.filters.secteur,
          opts.filters.accepteNouveauxPatients || undefined,
        );
        if (results.length > 0) setMapCenter([results[0].lat, results[0].lng]);
      }
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Erreur réseau');
    }

    setMedecins(results);
    setLoading(false);
  }, []);

  // Fetch avec debounce — évite les requêtes multiples pendant que l'utilisateur ajuste les filtres
  const scheduleFetch = useCallback((
    mode: SearchMode,
    opts: { position?: [number, number]; territoire?: string; query?: string; filters: FiltersState },
    delay = 0
  ) => {
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(() => fetchMedecins(mode, opts), delay);
  }, [fetchMedecins]);

  // Géolocalisation
  useEffect(() => {
    const fallback: [number, number] = [14.6037, -61.0588];
    if (!navigator.geolocation) {
      setUserPosition(fallback); setMapCenter(fallback); return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPosition(p); setMapCenter(p);
      },
      () => { setUserPosition(fallback); setMapCenter(fallback); }
    );
  }, []);

  // Déclenchement des requêtes — debounce 400ms en mode proximité, immédiat sinon
  useEffect(() => {
    if (!userPosition) return;
    const delay = searchMode === 'proximity' ? 400 : 0;
    scheduleFetch(searchMode, {
      position: mapCenter ?? userPosition,
      territoire, query: searchQuery, filters,
    }, delay);
  }, [searchMode, searchQuery, territoire, userPosition, mapCenter, filters, scheduleFetch]);

  const handleTerritoireSelect = (position: [number, number], nom: string) => {
    setTerritoire(nom); setMapCenter(position); setSearchQuery(''); setSearchMode('territoire');
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) { setSearchQuery(''); setSearchMode('proximity'); }
    else { setSearchQuery(query); setSearchMode('text'); }
  };

  const onDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    dragStartY.current = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    dragStartState.current = sheetState;
  };
  const onDragEnd = (e: React.TouchEvent | React.MouseEvent) => {
    const endY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;
    const delta = endY - dragStartY.current;
    if (delta < -60) setSheetState(dragStartState.current === 'peek' ? 'half' : 'full');
    else if (delta > 60) setSheetState(dragStartState.current === 'full' ? 'half' : 'peek');
  };

  const listHeight = sheetState === 'full' ? 'calc(100vh - 130px)' : '140px';

  return (
    <div className="relative w-full h-screen overflow-hidden bg-surface">

      {/* CARTE PLEIN ÉCRAN */}
      <div className="absolute inset-0">
        {mapCenter && userPosition && (
          <Map userPosition={userPosition} mapCenter={mapCenter} medecins={medecins} />
        )}
      </div>

      {/* BANNIÈRE ERREUR */}
      {fetchError && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-red-500 text-white text-xs font-semibold text-center py-2 px-4">
          Erreur de connexion — {fetchError}
        </div>
      )}

      {/* OVERLAY HAUT */}
      <div className="map-overlay">
        <div className="flex items-center justify-between px-4 pt-5 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center shadow-float">
              <span className="text-white text-xl">🏥</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">Médecin Proche</p>
              <p className="text-xs text-gray-500 mt-0.5">Guyane · Martinique · Guadeloupe</p>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-float transition-colors ${
              showFilters ? 'bg-primary-600 text-white' : 'bg-white text-gray-500'
            }`}
          >
            {showFilters ? <X size={17} /> : <SlidersHorizontal size={17} />}
          </button>
        </div>

        <div className="px-4 pb-2">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="px-4 pb-3">
          <TerritoireSelector onSelect={handleTerritoireSelect} territoire={territoire} />
        </div>

        {showFilters && (
          <div className="mx-4 mb-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-float p-4">
            <Filters filters={filters} onChange={setFilters} />
          </div>
        )}
      </div>

      {/* BOTTOM SHEET */}
      <div
        className="bottom-sheet"
        style={{ transform: `translateY(${SHEET_TRANSLATE[sheetState]})` }}
      >
        <div
          className="cursor-grab active:cursor-grabbing select-none"
          onTouchStart={onDragStart}
          onTouchEnd={onDragEnd}
          onMouseDown={onDragStart}
          onMouseUp={onDragEnd}
        >
          <div className="bottom-sheet-handle" />
          <div className="flex items-center justify-between px-5 pt-3 pb-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-600">
                {searchMode === 'territoire' ? territoire : searchMode === 'text' ? 'Résultats' : 'À proximité'}
              </p>
              <p className="text-base font-bold text-gray-900 leading-tight">
                {loading ? 'Recherche...' : `${medecins.length} médecin${medecins.length > 1 ? 's' : ''} trouvé${medecins.length > 1 ? 's' : ''}`}
              </p>
            </div>
            <button
              onClick={() => setSheetState(sheetState === 'full' ? 'peek' : 'full')}
              className="text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full transition hover:bg-primary-100"
            >
              {sheetState === 'full' ? 'Réduire ↓' : 'Tout voir ↑'}
            </button>
          </div>
        </div>

        <div className="overflow-y-auto no-scrollbar" style={{ height: listHeight }}>
          <MedecinList medecins={medecins} loading={loading} mode={searchMode} territoire={territoire} />
        </div>
      </div>

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-100"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
        <div className="flex items-center justify-around px-6 pt-2 pb-2">
          <button onClick={() => setSheetState('peek')} className="flex flex-col items-center gap-0.5 tap-scale">
            <MapPin size={22} className="text-primary-600" />
            <span className="text-[11px] font-semibold text-primary-600">Carte</span>
          </button>
          <button onClick={() => setSheetState(sheetState === 'full' ? 'peek' : 'full')} className="flex flex-col items-center gap-0.5 tap-scale">
            <span className="text-[22px]">🏥</span>
            <span className="text-[11px] font-medium text-gray-400">Médecins</span>
          </button>
          <Link href="/favoris" className="flex flex-col items-center gap-0.5 tap-scale">
            <span className="text-[22px]">❤️</span>
            <span className="text-[11px] font-medium text-gray-400">Favoris</span>
          </Link>
        </div>
      </nav>

    </div>
  );
}
