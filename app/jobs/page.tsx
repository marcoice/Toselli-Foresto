'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '@/components/TopBar';
import AuthGuard from '@/components/AuthGuard';
import { PageTransition } from '@/lib/animations';
import { getListings } from '@/lib/api';
import type { Listing } from '@/lib/types';
import Link from 'next/link';

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

export default function JobsPage() {
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
    <AuthGuard>
      <TopBar />

      <PageTransition>
        <div className="px-4 py-6 space-y-5">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">Opportunità</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Offerte e proposte dalla community</p>
          </div>

          {/* Filter tabs */}
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
                    : 'text-zinc-500 dark:text-zinc-400'
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
                    : 'border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
                }`}
              >
                <span>{cat.emoji}</span> {cat.label}
              </button>
            ))}
          </div>

          {/* Count */}
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {loading ? (
              <span className="inline-block w-32 h-4 skeleton rounded" />
            ) : (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <span className="font-bold text-zinc-900 dark:text-white">{listings.length}</span> annunci trovati
              </motion.span>
            )}
          </p>

          {/* Listings */}
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`skeleton rounded-2xl h-28 stagger-${i + 1}`} />
              ))
            ) : listings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4"
                >
                  <span className="text-3xl">📋</span>
                </motion.div>
                <h3 className="font-bold text-zinc-900 dark:text-white">Nessun annuncio trovato</h3>
                <p className="mt-1 text-sm text-zinc-500">Pubblica il primo dalla community!</p>
                <Link href="/publish">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/25"
                  >
                    Pubblica annuncio
                  </motion.button>
                </Link>
              </motion.div>
            ) : (
              listings.map((listing, i) => {
                const isOffer = listing.listing_type === 'job_offer';
                const tags: string[] = typeof listing.tags === 'string' ? JSON.parse(listing.tags as unknown as string) : (listing.tags || []);
                return (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-2xl border border-zinc-200/70 bg-white dark:bg-zinc-900/80 dark:border-zinc-800/70 p-4 transition-all hover:border-indigo-300/60 hover:shadow-lg group"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-black text-white shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${listing.author_avatar_color || '#6366f1'}, ${listing.author_avatar_color || '#8b5cf6'})` }}
                      >
                        {(listing.author_name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-zinc-900 dark:text-white text-sm leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
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
                          {listing.author_name}{listing.city ? ` · 📍 ${listing.city}` : ''}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">{listing.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {listing.level && (
                        <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
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
                      <span className="ml-auto text-[10px] text-zinc-300 dark:text-zinc-600">
                        {new Date(listing.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </PageTransition>
    </AuthGuard>
  );
}
