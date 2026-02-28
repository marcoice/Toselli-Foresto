'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { JobFilters } from '@/lib/types';

interface HamburgerFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: JobFilters;
  onApply: (filters: JobFilters) => void;
}

const categories = [
  { value: '', label: 'Tutte' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Full-Stack' },
  { value: 'devops', label: 'DevOps' },
  { value: 'data', label: 'Data / ML' },
  { value: 'security', label: 'Cybersecurity' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'cloud', label: 'Cloud / Infra' },
];

const levels = [
  { value: '', label: 'Tutti' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead / Architect' },
];

const types = [
  { value: '', label: 'Tutti' },
  { value: 'remote', label: 'Full Remote' },
  { value: 'hybrid', label: 'Ibrido' },
  { value: 'onsite', label: 'In sede' },
];

export default function HamburgerFilters({ isOpen, onClose, filters, onApply }: HamburgerFiltersProps) {
  const [localFilters, setLocalFilters] = useState<JobFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const empty: JobFilters = {};
    setLocalFilters(empty);
    onApply(empty);
    onClose();
  };

  const activeCount = Object.values(localFilters).filter(v => v !== undefined && v !== '' && v !== null).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-60 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-70 h-full w-[85%] max-w-sm overflow-y-auto bg-white shadow-2xl dark:bg-zinc-900"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200/50 glass-strong px-5 py-4 dark:border-zinc-700/50">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                    <path d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Filtri</h2>
                {activeCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-bold text-white shadow-lg shadow-indigo-500/25"
                  >
                    {activeCount}
                  </motion.span>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            <div className="px-5 py-6 space-y-8">
              {/* Search */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <label className="mb-2 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Ricerca</label>
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Ruolo, azienda, tecnologia..."
                    value={localFilters.search || ''}
                    onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              </motion.div>

              {/* Category */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <label className="mb-3 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Categoria</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <motion.button
                      key={cat.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setLocalFilters({ ...localFilters, category: cat.value || undefined })}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        (localFilters.category || '') === cat.value
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {cat.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Level */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <label className="mb-3 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Livello</label>
                <div className="flex flex-wrap gap-2">
                  {levels.map((lvl) => (
                    <motion.button
                      key={lvl.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setLocalFilters({ ...localFilters, level: lvl.value || undefined })}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        (localFilters.level || '') === lvl.value
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {lvl.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Work Type */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <label className="mb-3 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Modalità</label>
                <div className="flex flex-wrap gap-2">
                  {types.map((t) => (
                    <motion.button
                      key={t.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setLocalFilters({ ...localFilters, type: t.value || undefined })}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        (localFilters.type || '') === t.value
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {t.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Salary Range */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <label className="mb-3 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Range RAL (€)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localFilters.salary_min || ''}
                    onChange={(e) => setLocalFilters({ ...localFilters, salary_min: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                  <span className="text-zinc-400 font-medium">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={localFilters.salary_max || ''}
                    onChange={(e) => setLocalFilters({ ...localFilters, salary_max: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              </motion.div>
            </div>

            {/* Action buttons */}
            <div className="sticky bottom-0 flex gap-3 border-t border-zinc-200/50 glass-strong p-4 dark:border-zinc-700/50">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="flex-1 rounded-xl border border-zinc-300 py-3 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Reset
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleApply}
                className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl"
              >
                Applica filtri
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
