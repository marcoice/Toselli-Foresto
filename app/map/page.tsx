'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMapPoints } from '@/lib/api';
import type { MapPoint } from '@/lib/types';

type FilterType = 'all' | 'job_offer' | 'service_proposal';

// Convert lat/lng to SVG coordinates on a simplified world map
// Using a modified Mercator-like projection for the 1000x500 SVG viewport
function latLngToSVG(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * 1000;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = (500 / 2) - (500 * mercN) / (2 * Math.PI);
  return { x: Math.max(2, Math.min(998, x)), y: Math.max(2, Math.min(498, y)) };
}

// Italy default center (for when no points exist, we'll still show the world)
const ITALY_CENTER = { lat: 41.9, lng: 12.5 };
const ITALY_SVG = latLngToSVG(ITALY_CENTER.lat, ITALY_CENTER.lng);

interface TooltipData {
  point: MapPoint;
  x: number;
  y: number;
}

const categoryEmojis: Record<string, string> = {
  development: '💻', security: '🔒', cloud: '☁️', data: '📊',
  networking: '🌐', design: '🎨', database: '🗄️', management: '📋', general: '🔧',
};

export default function MapPage() {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchPoints = useCallback(() => {
    setLoading(true);
    getMapPoints(filter === 'all' ? undefined : filter)
      .then(setPoints)
      .catch(() => setPoints([]))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetchPoints(); }, [fetchPoints]);

  // Auto-center to Italy on load
  useEffect(() => {
    if (!loading && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      // Center on Italy at zoom 3
      const targetZoom = 3;
      const targetX = containerWidth / 2 - ITALY_SVG.x * targetZoom;
      const targetY = containerHeight / 2 - ITALY_SVG.y * targetZoom;
      setZoom(targetZoom);
      setPan({ x: targetX, y: targetY });
    }
  }, [loading]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.85 : 1.18;
    setZoom((z) => Math.min(12, Math.max(0.5, z * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    setTooltip(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handlePointClick = (point: MapPoint, svgX: number, svgY: number) => {
    if (!svgRef.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const screenX = svgX * zoom + pan.x;
    const screenY = svgY * zoom + pan.y;
    // Keep tooltip inside container
    const tx = Math.min(screenX + 10, containerRect.width - 220);
    const ty = Math.max(screenY - 80, 10);
    setTooltip({ point, x: tx, y: ty });
  };

  const italy_focused_path = "M 527.5 145 L 527.6 146 L 527.8 147 L 528.1 147.5 L 528.5 148 L 529 148.4 L 529.2 148.9 L 529 149.5 L 528.6 149.9 L 528.2 150.4 L 528 151 L 528.3 151.4 L 528.7 151.7 L 529.1 152.2 L 529 152.8 L 528.5 153.2 L 528.1 153.7 L 528 154.3 L 528.2 154.8 L 528.6 155.3 L 529.1 155.7 L 529.1 156.3 L 528.8 156.8 L 528.4 157.2 L 528 157.7 L 527.8 158.3 L 527.9 158.9 L 528.3 159.3 L 528.8 159.8 L 529.2 160.3 L 529.4 160.9 L 529.5 161.5 L 529.3 162 L 529 162.5 L 529.1 163.1 L 529.5 163.5 L 530 163.9 L 530.4 164.4 L 530.5 165 L 530.3 165.6 L 530.5 166.2 L 531 166.6 L 531.5 167 L 531.9 167.5 L 531.8 168.1 L 531.3 168.5 L 530.8 168.9 L 530.5 169.5 L 530.6 170.1 L 531 170.6 L 531.1 171.2 L 530.8 171.7 L 530.3 172.1 L 529.8 172.5 L 529.5 173.1 L 529.7 173.7 L 530 174.2 L 530 174.8 L 529.6 175.3 L 529.1 175.7 L 528.8 176.3 L 529 176.9 L 529.5 177.3 L 529.9 177.8 L 530 178.4 L 529.6 178.9 L 529.1 179.3 L 529 179.9";

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-zinc-950">
      {/* Top Controls */}
      <div className="relative z-20 flex items-center gap-3 px-4 py-3 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div>
          <h1 className="text-base font-black text-white leading-tight">
            🗺️ Mappa Opportunità
          </h1>
          <p className="text-[10px] text-white/40">{points.length} {points.length === 1 ? 'annuncio' : 'annunci'} attivi</p>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {([
            { id: 'all', label: 'Tutti' },
            { id: 'job_offer', label: '💼 Offerte' },
            { id: 'service_proposal', label: '🧑‍💻 Proposte' },
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

      {/* Map Container */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Loading overlay */}
        <AnimatePresence>
          {loading && (
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

        {/* SVG World Map */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            willChange: 'transform',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          <svg
            ref={svgRef}
            viewBox="0 0 1000 500"
            width="1000"
            height="500"
            style={{ display: 'block' }}
          >
            {/* Deep space background */}
            <defs>
              <radialGradient id="earthGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0f0f23" />
                <stop offset="100%" stopColor="#030308" />
              </radialGradient>
              <filter id="pinGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="glowSoft">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(99,102,241,0.04)" strokeWidth="0.5"/>
              </pattern>
            </defs>

            <rect width="1000" height="500" fill="url(#earthGlow)" />
            <rect width="1000" height="500" fill="url(#grid)" />

            {/* Ocean tint */}
            <rect width="1000" height="500" fill="rgba(15,30,80,0.3)" rx="0" />

            {/* Simplified world coastlines */}
            <g fill="rgba(30,40,70,0.9)" stroke="rgba(99,102,241,0.25)" strokeWidth="0.5">
              {/* North America */}
              <path d="M180,60 L220,50 L250,45 L280,50 L290,65 L285,80 L295,95 L300,115 L285,130 L270,145 L250,155 L240,170 L220,175 L205,165 L195,150 L185,130 L175,110 L165,90 L170,70 Z" />
              {/* Greenland */}
              <path d="M310,15 L340,10 L365,18 L370,35 L355,50 L335,55 L315,45 L305,30 Z" />
              {/* South America */}
              <path d="M240,200 L265,195 L280,210 L285,235 L280,260 L270,285 L255,305 L245,320 L235,310 L225,290 L220,265 L225,240 L230,215 Z" />
              {/* Europe */}
              <path d="M460,60 L490,55 L510,58 L525,65 L535,80 L530,95 L520,105 L510,115 L500,110 L490,105 L480,110 L470,115 L460,105 L450,95 L452,80 Z" />
              {/* Scandinavia */}
              <path d="M485,30 L500,25 L515,30 L520,45 L510,55 L495,58 L480,50 L477,38 Z" />
              {/* Africa */}
              <path d="M480,145 L510,140 L535,148 L550,165 L555,190 L550,215 L540,240 L525,260 L510,270 L495,265 L480,250 L470,225 L465,200 L468,175 L472,160 Z" />
              {/* Asia */}
              <path d="M545,50 L600,40 L660,35 L720,40 L770,45 L800,55 L820,70 L815,90 L800,105 L780,110 L755,105 L730,110 L705,105 L685,115 L660,115 L640,105 L620,100 L600,105 L580,100 L560,90 L545,80 Z" />
              {/* India */}
              <path d="M625,130 L645,125 L660,135 L665,155 L655,175 L640,185 L625,175 L618,155 Z" />
              {/* Southeast Asia */}
              <path d="M720,140 L745,135 L765,145 L770,165 L755,175 L735,170 L718,158 Z" />
              {/* Australia */}
              <path d="M740,265 L790,258 L830,265 L855,285 L855,310 L840,330 L810,340 L780,335 L755,320 L740,300 L735,280 Z" />
              {/* Japan */}
              <path d="M810,95 L825,90 L835,98 L830,110 L815,112 L807,104 Z" />
              {/* UK */}
              <path d="M463,68 L470,63 L477,68 L478,78 L470,83 L462,78 Z" />
              {/* Iceland */}
              <path d="M415,38 L435,33 L445,40 L440,52 L422,55 L412,48 Z" />
            </g>

            {/* Italy highlighted specially */}
            <g>
              <path d="M 507 95 L 510 94 L 515 93 L 519 92 L 522 93 L 524 95 L 523 98 L 521 100 L 518 102 L 515 104 L 513 107 L 513 110 L 515 113 L 518 115 L 520 118 L 520 121 L 518 124 L 516 127 L 515 130 L 516 133 L 519 135 L 521 138 L 520 141 L 517 143 L 514 145 L 512 148 L 513 151 L 516 153 L 517 156 L 515 159 L 512 160 L 509 159 L 507 157 L 506 154 L 507 151 L 509 149 L 510 146 L 508 143 L 505 141 L 504 138 L 505 135 L 507 133 L 508 130 L 506 127 L 503 125 L 501 122 L 502 119 L 504 117 L 505 114 L 503 111 L 500 109 L 499 106 L 500 103 L 503 101 L 505 98 Z"
                fill="rgba(99,102,241,0.3)" stroke="rgba(99,102,241,0.7)" strokeWidth="0.8" />
              {/* Sicily */}
              <path d="M505 164 L513 162 L518 165 L517 169 L511 171 L505 169 Z"
                fill="rgba(99,102,241,0.25)" stroke="rgba(99,102,241,0.6)" strokeWidth="0.6" />
              {/* Sardinia */}
              <path d="M499 140 L503 138 L506 141 L505 146 L501 147 L498 144 Z"
                fill="rgba(99,102,241,0.25)" stroke="rgba(99,102,241,0.5)" strokeWidth="0.5" />
            </g>

            {/* Latitude/Longitude grid lines */}
            <g stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" fill="none">
              {[-60,-30,0,30,60].map((lat) => {
                const { y } = latLngToSVG(lat, 0);
                return <line key={lat} x1="0" y1={y} x2="1000" y2={y} />;
              })}
              {[-120,-60,0,60,120].map((lng) => {
                const { x } = latLngToSVG(0, lng);
                return <line key={lng} x1={x} y1="0" x2={x} y2="500" />;
              })}
            </g>

            {/* Map pins */}
            {points.map((point) => {
              const { x, y } = latLngToSVG(point.lat, point.lng);
              const isOffer = point.listing_type === 'job_offer';
              const isHovered = hoveredId === point.id;
              const pinColor = isOffer ? '#6366f1' : '#c026d3';
              const glowColor = isOffer ? 'rgba(99,102,241,0.6)' : 'rgba(192,38,211,0.6)';

              return (
                <g
                  key={point.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handlePointClick(point, x, y)}
                  onMouseEnter={() => setHoveredId(point.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Pulse ring */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 12 : 8}
                    fill="transparent"
                    stroke={glowColor}
                    strokeWidth="1"
                    opacity={isHovered ? 0.6 : 0.3}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                  {/* Outer ring animation placeholder */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 18 : 13}
                    fill="transparent"
                    stroke={glowColor}
                    strokeWidth="0.5"
                    opacity={isHovered ? 0.3 : 0.1}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                  {/* Main pin */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 7 : 5}
                    fill={pinColor}
                    filter="url(#pinGlow)"
                    style={{ transition: 'all 0.2s ease' }}
                  />
                  {/* Inner bright dot */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 3 : 2}
                    fill="white"
                    opacity={0.9}
                    style={{ transition: 'all 0.2s ease' }}
                  />
                </g>
              );
            })}

            {/* Decorative stars */}
            {[[50, 20], [150, 40], [350, 25], [700, 15], [850, 30], [950, 60], [30, 400], [900, 380], [800, 410]].map(([sx, sy], i) => (
              <circle key={i} cx={sx} cy={sy} r={0.8} fill="rgba(255,255,255,0.3)" />
            ))}
          </svg>
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-6 right-4 z-10 flex flex-col gap-1">
          <button
            onClick={() => setZoom((z) => Math.min(12, z * 1.3))}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20 transition-all text-lg font-bold"
          >+</button>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z * 0.77))}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20 transition-all text-lg font-bold"
          >−</button>
          <button
            onClick={() => {
              if (!containerRef.current) return;
              const w = containerRef.current.clientWidth;
              const h = containerRef.current.clientHeight;
              setZoom(3);
              setPan({ x: w / 2 - ITALY_SVG.x * 3, y: h / 2 - ITALY_SVG.y * 3 });
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20 transition-all text-sm"
            title="Centra sull'Italia"
          >🇮🇹</button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 left-4 z-10 flex flex-col gap-1.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" />
            <span className="text-[11px] text-white/60">Offerte lavoro</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50" />
            <span className="text-[11px] text-white/60">Proposte servizio</span>
          </div>
          <div className="mt-1 pt-1 border-t border-white/10 text-[10px] text-white/30">scroll = zoom · drag = sposta</div>
        </div>

        {/* Empty state */}
        {!loading && points.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-3 text-center bg-black/60 backdrop-blur-xl rounded-3xl px-8 py-6 border border-white/10">
              <div className="text-4xl">🌍</div>
              <p className="text-white font-bold">Nessun annuncio sulla mappa</p>
              <p className="text-xs text-white/50 max-w-xs">Pubblica il tuo primo annuncio con la tua posizione per apparire qui!</p>
            </div>
          </div>
        )}

        {/* Tooltip */}
        <AnimatePresence>
          {tooltip && (
            <motion.div
              key={tooltip.point.id}
              initial={{ opacity: 0, scale: 0.85, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute z-20 w-56 rounded-2xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl p-3 shadow-2xl"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              <button
                onClick={() => setTooltip(null)}
                className="absolute top-2 right-2 text-white/30 hover:text-white/70 text-xs"
              >✕</button>
              <div className="flex items-start gap-2">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white ${
                  tooltip.point.listing_type === 'job_offer' ? 'bg-indigo-500' : 'bg-purple-500'
                }`}>
                  {(tooltip.point.author_name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white leading-tight truncate">{tooltip.point.title}</p>
                  <p className="text-[10px] text-white/50 mt-0.5">{tooltip.point.author_name}</p>
                </div>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  tooltip.point.listing_type === 'job_offer'
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'bg-purple-500/20 text-purple-300'
                }`}>
                  {tooltip.point.listing_type === 'job_offer' ? '💼 Offerta' : '🧑‍💻 Proposta'}
                </span>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                  {categoryEmojis[tooltip.point.category] || '🔧'} {tooltip.point.category}
                </span>
                {tooltip.point.city && (
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                    📍 {tooltip.point.city}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
