'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import SearchBar from '@/components/SearchBar';
import TerritoireSelector from '@/components/TerritoireSelector';
import MedecinList from '@/components/MedecinList';
import Filters from '@/components/Filters';
import BottomNav from '@/components/BottomNav';
import LangSelector from '@/components/LangSelector';
import BrandMark from '@/components/BrandMark';
import PulseLine from '@/components/PulseLine';
import { useLang } from '@/hooks/useLang';
import { Medecin, FiltersState } from '@/types/medecin';
import { getMedecinsProches, getMedecinsByTerritoire, searchMedecins } from '@/lib/supabase';
import { LocateFixed, SlidersHorizontal, X } from 'lucide-react';
import { POSITIONS_DOM } from '@/lib/geo';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

type SearchMode = 'proximity' | 'territoire' | 'text';
type SheetState = 'peek' | 'half' | 'full';

const SHEET_TRANSLATE: Record<SheetState, string> = {
  full: '0px',
  half: '40%',
  peek: 'calc(100% - var(--bottom-sheet-peek) - var(--bottom-nav-height))',
};

export default function HomePage() {
  const { t } = useLang();
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
      console.error('Erreur de récupération des médecins :', e);
      setFetchError('Vérifiez votre connexion et réessayez.');
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
  const listHeight  = sheetState === 'full' ? 'calc(100vh - 165px)' : '150px';

  return (
    <div className="relative w-full h-screen overflow-hidden bg-sand-50">

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
        <div className="absolute top-0 left-0 right-0 z-50 bg-coral-600 text-white text-xs font-bold text-center py-2 px-4">
          Erreur de connexion — {fetchError}
        </div>
      )}

      {/* BANNIÈRE GÉOLOCALISATION REFUSÉE (fermable) — encre informative, non alarmante */}
      {showBanner && (
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between glass-ink text-sand-100 text-xs font-semibold py-2 px-4">
          <span>{t('geo.refusee')}</span>
          <button
            onClick={() => setGeolocBannerDismissed(true)}
            aria-label="Fermer la bannière"
            className="ml-3 shrink-0 text-lagoon-300 hover:text-lagoon-200"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* OVERLAY HAUT */}
      <div className="map-overlay" style={{ top: showBanner ? 34 : 0 }}>

        {/* Capsule identité — verre encré */}
        <div className="px-3 pt-3 pb-2">
          <div className="glass-ink rounded-[26px] shadow-float pl-3 pr-2 py-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <BrandMark size={40} />
              <div className="min-w-0">
                <p className="font-display font-semibold text-base leading-none text-sand-50 truncate">
                  Médecin Proche
                </p>
                <p className="label-mono text-lagoon-300/90 mt-1 truncate">
                  Santé · DOM-TOM
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <LangSelector />
              <button
                onClick={handleGeolocate}
                aria-label="Me localiser"
                className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center transition-colors text-sand-100 hover:text-lagoon-300 tap-scale"
              >
                <LocateFixed size={17} />
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                aria-label={showFilters ? 'Fermer les filtres' : 'Ouvrir les filtres'}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors tap-scale ${
                  showFilters
                    ? 'bg-lagoon-400 text-ink-950 shadow-glow'
                    : 'bg-white/10 border border-white/10 text-sand-100 hover:text-lagoon-300'
                }`}
              >
                {showFilters ? <X size={17} /> : <SlidersHorizontal size={17} />}
              </button>
            </div>
          </div>
        </div>

        <div className="px-3 pb-2">
          <SearchBar onSearch={handleSearch} placeholder={t('search.placeholder')} />
        </div>

        <div className="px-3 pb-2">
          <TerritoireSelector onSelect={handleTerritoireSelect} territoire={territoire} />
        </div>

        {showFilters && (
          <div className="mx-3 mb-2 bg-paper/95 backdrop-blur-sm border border-sand-200 rounded-2xl shadow-lift p-4 animate-rise">
            <Filters filters={filters} onChange={setFilters} />
          </div>
        )}
      </div>

      {/* BOTTOM SHEET */}
      <div
        className="bottom-sheet grain"
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
          <div className="flex items-end justify-between px-5 pt-2 pb-1.5">
            <div className="min-w-0">
              <p className="label-mono text-lagoon-700">
                {searchMode === 'territoire' ? territoire : searchMode === 'text' ? t('sheet.resultats') : t('sheet.proximite')}
              </p>
              <p className="font-display font-semibold text-[26px] leading-9 text-ink-950 tnum truncate">
                {loading ? t('sheet.recherche') : `${medecins.length} ${t(medecins.length > 1 ? 'sheet.trouves' : 'sheet.trouve')}`}
              </p>
            </div>
            <button
              onClick={() => setSheetState(sheetState === 'full' ? 'peek' : 'full')}
              className="shrink-0 mb-1 text-xs font-bold text-sand-50 bg-ink-900 px-3.5 py-2 rounded-full transition hover:bg-ink-800 tap-scale"
            >
              {sheetState === 'full' ? t('sheet.reduire') : t('sheet.toutVoir')}
            </button>
          </div>
          <div className="px-5 pb-1">
            <PulseLine animated className="w-full h-[14px] text-lagoon-400/70" />
          </div>
        </div>

        <div
          className="overflow-y-auto no-scrollbar"
          style={{ height: listHeight, paddingBottom: sheetState === 'full' ? 'calc(var(--bottom-nav-height) + 8px)' : '8px' }}
        >
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
