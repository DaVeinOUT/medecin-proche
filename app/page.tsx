'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import SearchBar from '@/components/SearchBar';
import TerritoireSelector from '@/components/TerritoireSelector';
import MedecinList from '@/components/MedecinList';
import Filters from '@/components/Filters';
import BottomNav from '@/components/BottomNav';
import { Medecin, FiltersState } from '@/types/medecin';
import { getMedecinsProches, getMedecinsByTerritoire, searchMedecins } from '@/lib/supabase';
import { LocateFixed, SlidersHorizontal, X, Stethoscope } from 'lucide-react';
import { POSITIONS_DOM } from '@/lib/geo';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

type SearchMode = 'proximity' | 'territoire' | 'text';
type SheetState = 'peek' | 'half' | 'full';

const SHEET_TRANSLATE: Record<SheetState, string> = {
  full: '0px',
  half: '40%',
  peek: 'calc(100% - 220px - 64px)',
};

export default function HomePage() {
  const [userPosition, setUserPosition]       = useState<[number, number]>(POSITIONS_DOM.martinique);
  const [mapCenter, setMapCenter]             = useState<[number, number]>(POSITIONS_DOM.martinique);
  const [medecins, setMedecins]               = useState<Medecin[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [fetchError, setFetchError]           = useState<string | null>(null);
  const [geolocDenied, setGeolocDenied]       = useState(false);
  const [geolocBannerDismissed, setGeolocBannerDismissed] = useState(false);
  const [searchMode, setSearchMode]           = useState<SearchMode>('territoire');
  const [searchQuery, setSearchQuery]         = useState('');
  const [territoire, setTerritoire]           = useState('Martinique');
  const [sheetState, setSheetState]           = useState<SheetState>('peek');
  const [showFilters, setShowFilters]         = useState(false);
  const [selectedMedecin, setSelectedMedecin] = useState<Medecin | null>(null);
  const [filters, setFilters] = useState<FiltersState>({
    specialite: '',
    distance: 10,
    secteur: null,
    accepteNouveauxPatients: false,
  });

  const dragStartY     = useRef(0);
  const dragStartState = useRef<SheetState>('peek');
  const fetchTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const scheduleFetch = useCallback((
    mode: SearchMode,
    opts: { position?: [number, number]; territoire?: string; query?: string; filters: FiltersState },
    delay = 0
  ) => {
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(() => fetchMedecins(mode, opts), delay);
  }, [fetchMedecins]);

  // Pas de géolocalisation automatique au chargement — l'utilisateur déclenche via "Me localiser"

  // ── Relance la géolocalisation manuellement ───────────────────────────────
  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPosition(p); setMapCenter(p); setSearchMode('proximity');
        setGeolocDenied(false); setGeolocBannerDismissed(false);
      },
      () => setGeolocDenied(true),
    );
  }, []);

  // ── Déclenchement des requêtes ────────────────────────────────────────────
  useEffect(() => {
    if (searchMode === 'proximity' && !userPosition) return;
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

  // Médecin sélectionné depuis la liste — centre la carte
  const handleSelectFromList = useCallback((m: Medecin) => {
    setSelectedMedecin(m);
    setSheetState('half');
  }, []);

  // Médecin sélectionné depuis la carte — scroll dans la liste + expand sheet
  const handleSelectFromMap = useCallback((m: Medecin) => {
    setSelectedMedecin(m);
    setSheetState('half');
  }, []);

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

  const showBanner  = geolocDenied && !geolocBannerDismissed;
  const listHeight  = sheetState === 'full' ? 'calc(100vh - 130px)' : '140px';

  return (
    <div className="relative w-full h-screen overflow-hidden bg-surface">

      {/* CARTE PLEIN ÉCRAN */}
      <div className="absolute inset-0">
        {mapCenter && (
          <Map
            userPosition={userPosition}
            mapCenter={mapCenter}
            medecins={medecins}
            selectedMedecin={selectedMedecin}
            onSelectMedecin={handleSelectFromMap}
          />
        )}
      </div>

      {/* BANNIÈRE ERREUR RÉSEAU */}
      {fetchError && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-red-500 text-white text-xs font-semibold text-center py-2 px-4">
          Erreur de connexion — {fetchError}
        </div>
      )}

      {/* BANNIÈRE GÉOLOCALISATION REFUSÉE (fermable) — bleu informatif, non alarmant */}
      {showBanner && (
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between bg-sky-500 text-white text-xs font-semibold py-2 px-4">
          <span>Localisation désactivée — sélectionnez un territoire ou effectuez une recherche</span>
          <button
            onClick={() => setGeolocBannerDismissed(true)}
            aria-label="Fermer la bannière"
            className="ml-3 shrink-0 opacity-80 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* OVERLAY HAUT */}
      <div className="map-overlay" style={{ top: showBanner ? 32 : 0 }}>
        <div className="flex items-center justify-between px-4 pt-5 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center shadow-float">
              <Stethoscope size={20} className="text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">Médecin Proche</p>
              <p className="text-xs text-gray-500 mt-0.5">Martinique · Guadeloupe · Guyane · Réunion · Mayotte</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGeolocate}
              aria-label="Me localiser"
              className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-float transition-colors text-gray-500 hover:text-primary-600"
            >
              <LocateFixed size={17} />
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              aria-label={showFilters ? 'Fermer les filtres' : 'Ouvrir les filtres'}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-float transition-colors ${
                showFilters ? 'bg-primary-600 text-white' : 'bg-white text-gray-500'
              }`}
            >
              {showFilters ? <X size={17} /> : <SlidersHorizontal size={17} />}
            </button>
          </div>
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
          <MedecinList
            medecins={medecins}
            loading={loading}
            mode={searchMode}
            territoire={territoire}
            onSelectMedecin={handleSelectFromList}
            selectedMedecinId={selectedMedecin?.id}
          />
        </div>
      </div>

      {/* BOTTOM NAV */}
      <BottomNav
        activePage="map"
        listActive={sheetState === 'full'}
        onMapClick={() => setSheetState('peek')}
        onListClick={() => setSheetState(sheetState === 'full' ? 'peek' : 'full')}
      />

    </div>
  );
}
