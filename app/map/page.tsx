'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { getMapPoints } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import type { MapPoint } from '@/lib/types';
import 'leaflet/dist/leaflet.css';

// Dynamically import react-leaflet components (no SSR)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

type FilterType = 'all' | 'job_offer' | 'service_proposal';

const workTypeLabels: Record<string, string> = { remote: 'Remoto', hybrid: 'Ibrido', onsite: 'In sede' };

// All 20 Italian regions
const ITALIAN_REGIONS: { name: string; center: [number, number] }[] = [
  { name: 'Lombardia', center: [45.47, 9.19] },
  { name: 'Lazio', center: [41.89, 12.48] },
  { name: 'Campania', center: [40.85, 14.27] },
  { name: 'Veneto', center: [45.44, 12.32] },
  { name: 'Sicilia', center: [37.6, 14.0] },
  { name: 'Emilia-Romagna', center: [44.49, 11.34] },
  { name: 'Piemonte', center: [45.07, 7.69] },
  { name: 'Puglia', center: [41.13, 16.87] },
  { name: 'Toscana', center: [43.77, 11.25] },
  { name: 'Calabria', center: [38.91, 16.60] },
  { name: 'Sardegna', center: [39.22, 9.12] },
  { name: 'Liguria', center: [44.41, 8.93] },
  { name: 'Marche', center: [43.62, 13.52] },
  { name: 'Abruzzo', center: [42.35, 13.4] },
  { name: 'Friuli Venezia Giulia', center: [45.64, 13.78] },
  { name: 'Trentino-Alto Adige', center: [46.07, 11.12] },
  { name: 'Umbria', center: [42.71, 12.39] },
  { name: 'Basilicata', center: [40.64, 15.81] },
  { name: 'Molise', center: [41.56, 14.67] },
  { name: "Valle d'Aosta", center: [45.74, 7.32] },
];

export default function MapPage() {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [showRegionList, setShowRegionList] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fix default Leaflet marker icon
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
      });
    }
  }, []);

  const fetchPoints = useCallback(() => {
    setLoading(true);
    getMapPoints(
      filter === 'all' ? undefined : filter,
      selectedRegion || undefined
    )
      .then(setPoints)
      .catch(() => setPoints([]))
      .finally(() => setLoading(false));
  }, [filter, selectedRegion]);

  useEffect(() => { fetchPoints(); }, [fetchPoints]);

  // Group points by region for display in region list
  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    points.forEach((p) => {
      const r = p.region || 'Altro';
      counts[r] = (counts[r] || 0) + 1;
    });
    return counts;
  }, [points]);

  // When no region filter, also fetch all to get full counts
  const [allPoints, setAllPoints] = useState<MapPoint[]>([]);
  useEffect(() => {
    getMapPoints(filter === 'all' ? undefined : filter)
      .then(setAllPoints)
      .catch(() => setAllPoints([]));
  }, [filter]);

  const allRegionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allPoints.forEach((p) => {
      const r = p.region || 'Altro';
      counts[r] = (counts[r] || 0) + 1;
    });
    return counts;
  }, [allPoints]);

  return (
    <AuthGuard>
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-zinc-950">
      {/* Top Controls */}
      <div className="relative z-20 flex items-center gap-3 px-4 py-3 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-black text-white leading-tight">
            🗺️ Mappa Italia
          </h1>
          <p className="text-[10px] text-white/40">
            {selectedRegion ? `📍 ${selectedRegion}` : 'Tutte le regioni'} · {points.length} {points.length === 1 ? 'annuncio' : 'annunci'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {([
            { id: 'all', label: 'Tutti' },
            { id: 'job_offer', label: '💼' },
            { id: 'service_proposal', label: '🧑‍💻' },
          ] as { id: FilterType; label: string }[]).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                filter === f.id
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected region pill */}
      <AnimatePresence>
        {selectedRegion && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden z-20 relative"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 border-b border-indigo-500/20">
              <span className="text-xs text-indigo-300 font-semibold">📍 {selectedRegion}</span>
              <span className="text-[10px] text-indigo-400/60">{regionCounts[selectedRegion] || 0} annunci</span>
              <button
                onClick={() => setSelectedRegion(null)}
                className="ml-auto text-xs text-indigo-300 hover:text-white font-semibold"
              >
                ✕ Rimuovi filtro
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Container */}
      <div className="relative flex-1 overflow-hidden">
        {/* Loading overlay */}
        <AnimatePresence>
          {(loading || !mounted) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="w-10 h-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-500"
                />
                <p className="text-sm text-white/50">Caricamento mappa…</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Leaflet Map */}
        {mounted && (
          <MapContainer
            center={(selectedRegion
              ? ITALIAN_REGIONS.find(r => r.name === selectedRegion)?.center || [41.9, 12.5]
              : [41.9, 12.5]) as [number, number]}
            zoom={selectedRegion ? 8 : 6}
            className="h-full w-full z-10"
            style={{ background: '#09090b' }}
            zoomControl={false}
            key={selectedRegion || 'all'}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {points.filter(p => p.lat && p.lng).map((point) => {
              const isOffer = point.listing_type === 'job_offer';
              return (
                <Marker
                  key={point.id}
                  position={[point.lat, point.lng] as [number, number]}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isOffer ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {isOffer ? '💼 Offerta' : '🧑‍💻 Proposta'}
                        </span>
                        {point.level && (
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                            {point.level.charAt(0).toUpperCase() + point.level.slice(1)}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-sm text-zinc-900">{point.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{point.author_name}</p>
                      {point.city && (
                        <p className="text-xs text-zinc-400 mt-0.5">
                          📍 {point.city}{point.region ? `, ${point.region}` : ''}
                        </p>
                      )}
                      {point.work_type && (
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {workTypeLabels[point.work_type] || point.work_type}
                        </p>
                      )}
                      {point.salary_min && point.salary_max && (
                        <p className="text-xs font-bold text-emerald-600 mt-1">
                          €{(point.salary_min / 1000).toFixed(0)}k–€{(point.salary_max / 1000).toFixed(0)}k
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}

        {/* "Vedi per regione" button */}
        <button
          onClick={() => setShowRegionList(true)}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/30 hover:bg-indigo-500 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
          </svg>
          Vedi per regione
        </button>

        {/* Legend */}
        <div className="absolute bottom-6 left-4 z-20 flex flex-col gap-1.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" />
            <span className="text-[11px] text-white/60">Offerte lavoro</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50" />
            <span className="text-[11px] text-white/60">Proposte servizio</span>
          </div>
        </div>

        {/* Empty state */}
        {!loading && points.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="flex flex-col items-center gap-3 text-center bg-black/60 backdrop-blur-xl rounded-3xl px-8 py-6 border border-white/10 pointer-events-auto">
              <div className="text-4xl">🌍</div>
              <p className="text-white font-bold">
                Nessun annuncio {selectedRegion ? `in ${selectedRegion}` : 'sulla mappa'}
              </p>
              <p className="text-xs text-white/50 max-w-xs">
                Pubblica il tuo primo annuncio con la tua posizione per apparire qui!
              </p>
              {selectedRegion && (
                <button
                  onClick={() => setSelectedRegion(null)}
                  className="mt-1 text-xs text-indigo-400 font-semibold hover:text-indigo-300"
                >
                  Mostra tutte le regioni
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Region selector bottom sheet */}
      <AnimatePresence>
        {showRegionList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setShowRegionList(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-zinc-900 rounded-t-3xl border-t border-white/10 max-h-[70vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              <div className="px-5 py-3 border-b border-white/5">
                <h2 className="text-lg font-black text-white">Regioni d&apos;Italia</h2>
                <p className="text-xs text-white/40 mt-0.5">Seleziona una regione per filtrare gli annunci</p>
              </div>

              <div className="overflow-y-auto flex-1 px-3 py-2">
                {/* All regions option */}
                <button
                  onClick={() => { setSelectedRegion(null); setShowRegionList(false); }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 mb-1 transition-all ${
                    !selectedRegion
                      ? 'bg-indigo-500/20 border border-indigo-500/30'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span className="text-lg">🇮🇹</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-white">Tutte le regioni</p>
                    <p className="text-[10px] text-white/40">{allPoints.length} annunci totali</p>
                  </div>
                  {!selectedRegion && (
                    <span className="text-xs text-indigo-400 font-bold">✓</span>
                  )}
                </button>

                {/* Individual regions */}
                {ITALIAN_REGIONS.map((region) => {
                  const count = allRegionCounts[region.name] || 0;
                  const isSelected = selectedRegion === region.name;
                  return (
                    <button
                      key={region.name}
                      onClick={() => { setSelectedRegion(region.name); setShowRegionList(false); }}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 mb-1 transition-all ${
                        isSelected
                          ? 'bg-indigo-500/20 border border-indigo-500/30'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-sm">
                        📍
                      </span>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-white">{region.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {count > 0 && (
                          <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-bold text-indigo-400">
                            {count}
                          </span>
                        )}
                        {isSelected ? (
                          <span className="text-xs text-indigo-400 font-bold">✓</span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white/20">
                            <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </AuthGuard>
  );
}
