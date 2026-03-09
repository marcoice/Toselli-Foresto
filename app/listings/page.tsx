'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { getListings } from '@/lib/api';
import type { Listing } from '@/lib/types';
import Link from 'next/link';
import { PageTransition } from '@/lib/animations';

const CATEGORIES = [
  { id: '', label: 'Tutti', emoji: '✨' },
  { id: 'development', label: 'Dev', emoji: '💻' },
  { id: 'security', label: 'Security', emoji: '🔒' },
  { id: 'cloud', label: 'Cloud', emoji: '☁️' },
  { id: 'data', label: 'Data/AI', emoji: '📊' },
  { id: 'networking', label: 'Network', emoji: '🌐' },
  { id: 'design', label: 'UI/UX', emoji: '🎨' },
];

const workTypeLabels: Record<string, string> = { remote: 'Remoto', hybrid: 'Ibrido', onsite: 'In sede' };
const levelColors: Record<string, string> = {
  junior: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30',
  mid: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30',
  senior: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/30',
  lead: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/30',
};

function ListingCard({ listing, index }: { listing: Listing; index: number }) {
  const isOffer = listing.listing_type === 'job_offer';
  const tags: string[] = typeof listing.tags === 'string' ? JSON.parse(listing.tags as unknown as string) : (listing.tags || []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-zinc-200/70 bg-white dark:bg-zinc-900/80 dark:border-zinc-800/70 p-4 transition-all hover:border-indigo-300/60 hover:shadow-lg hover:shadow-indigo-500/8 group"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-black text-white shadow-sm"
          style={{ background: `linear-gradient(135deg, ${listing.author_avatar_color || '#6366f1'}, ${listing.author_avatar_color || '#8b5cf6'})` }}
        >
          {(listing.author_name || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-zinc-900 dark:text-white text-sm leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {listing.title}
            </h3>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              isOffer
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                : 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400'
            }`}>
              {isOffer ? '💼 Offerta' : '🧑‍💻 Richiesta'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {listing.author_role === 'company'
              ? (listing.author_company_name || listing.author_name)
              : listing.author_name}
            {listing.city ? ` · 📍 ${listing.city}` : ''}
          </p>
        </div>
      </div>

      <p className="mt-2.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
        {listing.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {listing.level && (
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${levelColors[listing.level] || 'text-zinc-500 bg-zinc-50'}`}>
            {listing.level.charAt(0).toUpperCase() + listing.level.slice(1)}
          </span>
        )}
        <span className="rounded-full bg-zinc-50 dark:bg-zinc-800 px-2.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
          {workTypeLabels[listing.work_type] || listing.work_type}
        </span>
        {listing.salary_min && listing.salary_max && (
          <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            €{(listing.salary_min / 1000).toFixed(0)}k–€{(listing.salary_max / 1000).toFixed(0)}k
          </span>
        )}
        {tags.slice(0, 3).map((t) => (
          <span key={t} className="rounded-full bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 px-2.5 py-0.5 text-[10px] font-medium text-indigo-500 dark:text-indigo-400">
            {t}
          </span>
        ))}
        {tags.length > 3 && (
          <span className="text-[10px] text-zinc-400">+{tags.length - 3}</span>
        )}
        <span className="ml-auto text-[10px] text-zinc-300 dark:text-zinc-600">
          {new Date(listing.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
        </span>
      </div>
    </motion.div>
  );
}

export default function ListingsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'job_offer' | 'service_proposal'>('all');
  const [category, setCategory] = useState('');

  useEffect(() => {
    setLoading(true);
    getListings({
      type: filter === 'all' ? undefined : filter,
      category: category || undefined,
    })
      .then(setListings)
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [filter, category]);

  return (
    <PageTransition>
      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">Bacheca</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Offerte & proposte dalla community</p>
          </div>
          {user ? (
            <Link href="/publish">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/25 hover:opacity-90 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                </svg>
                Pubblica
              </motion.button>
            </Link>
          ) : (
            <Link href="/auth">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="rounded-xl border border-indigo-300 dark:border-indigo-700 px-4 py-2.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
              >
                Accedi
              </motion.button>
            </Link>
          )}
        </div>

        {/* Filter tabs: Tutti / Offerte / Proposte */}
        <div className="flex rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 p-1 gap-1">
          {([
            { id: 'all', label: 'Tutti' },
            { id: 'job_offer', label: '💼 Offerte' },
            { id: 'service_proposal', label: '🧑‍💻 Proposte' },
          ] as { id: typeof filter; label: string }[]).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all ${
                filter === f.id
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Category scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                category === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-indigo-400'
              }`}
            >
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* Map CTA */}
        <Link href="/map">
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 cursor-pointer"
          >
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur-sm">🗺️</div>
              <div className="flex-1">
                <p className="font-bold text-white">Esplora sulla Mappa</p>
                <p className="text-xs text-white/70">Scopri opportunità vicino a te</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-5 h-5 opacity-70">
                <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" />
              </svg>
            </div>
          </motion.div>
        </Link>

        {/* Results count */}
        {!loading && (
          <p className="text-xs text-zinc-400">
            {listings.length === 0 ? 'Nessun risultato' : `${listings.length} annunci`}
          </p>
        )}

        {/* List */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-28 rounded-2xl" />
              ))}
            </motion.div>
          ) : listings.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-16 gap-3 text-center"
            >
              <div className="text-5xl">🔍</div>
              <p className="font-bold text-zinc-700 dark:text-zinc-300">Nessun annuncio trovato</p>
              <p className="text-sm text-zinc-400 max-w-xs">
                {user ? 'Sii il primo a pubblicare un annuncio!' : 'Registrati e pubblica il tuo primo annuncio.'}
              </p>
              <Link href={user ? '/publish' : '/auth'}>
                <button className="mt-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors">
                  {user ? 'Pubblica ora →' : 'Registrati →'}
                </button>
              </Link>
            </motion.div>
          ) : (
            <motion.div key="list" className="space-y-3">
              {listings.map((listing, i) => (
                <ListingCard key={listing.id} listing={listing} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
