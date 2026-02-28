'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '@/components/TopBar';
import HamburgerFilters from '@/components/HamburgerFilters';
import JobCard from '@/components/JobCard';
import JobDetail from '@/components/JobDetail';
import { PageTransition } from '@/lib/animations';
import { getJobs } from '@/lib/api';
import type { Job, JobFilters } from '@/lib/types';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<JobFilters>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const fetchJobs = useCallback(async (f: JobFilters) => {
    setLoading(true);
    try {
      const data = await getJobs(f);
      setJobs(data);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(filters);
  }, [filters, fetchJobs]);

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '' && v !== null).length;

  return (
    <>
      <TopBar showFilter onFilterToggle={() => setFiltersOpen(true)} />

      <PageTransition>
        {/* Active filters bar */}
        <AnimatePresence>
          {activeFilterCount > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 border-b border-zinc-100 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 px-4 py-2.5 dark:border-zinc-800 dark:from-indigo-900/10 dark:via-purple-900/10 dark:to-indigo-900/10">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-sm shadow-indigo-500/25">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-3 h-3">
                    <path fillRule="evenodd" d="M3.792 2.938A49.069 49.069 0 0 1 12 2.25c2.797 0 5.54.236 8.209.688a1.857 1.857 0 0 1 1.541 1.836v1.044a3 3 0 0 1-.879 2.121l-6.182 6.182a1.5 1.5 0 0 0-.439 1.061v2.927a3 3 0 0 1-1.658 2.684l-1.757.878A.75.75 0 0 1 9.75 21v-5.818a1.5 1.5 0 0 0-.44-1.06L3.13 7.938a3 3 0 0 1-.879-2.121V4.774c0-.897.64-1.683 1.542-1.836Z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  {activeFilterCount} {activeFilterCount === 1 ? 'filtro attivo' : 'filtri attivi'}
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilters({})}
                  className="ml-auto text-xs font-semibold text-indigo-600 underline dark:text-indigo-400"
                >
                  Rimuovi tutti
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Job count */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {loading ? (
              <span className="inline-block w-32 h-4 skeleton rounded" />
            ) : (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="font-bold text-zinc-900 dark:text-white">{jobs.length}</span> posizioni trovate
              </motion.span>
            )}
          </p>
        </div>

        {/* Job list */}
        <div className="px-4 pb-4 space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`skeleton rounded-2xl h-28 stagger-${i + 1}`} />
            ))
          ) : jobs.length === 0 ? (
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 text-zinc-300 dark:text-zinc-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </motion.div>
              <h3 className="font-bold text-zinc-900 dark:text-white">Nessuna posizione trovata</h3>
              <p className="mt-1 text-sm text-zinc-500">Prova a modificare i filtri di ricerca</p>
            </motion.div>
          ) : (
            jobs.map((job, i) => (
              <JobCard key={job.id} job={job} onSelect={setSelectedJob} index={i} />
            ))
          )}
        </div>
      </PageTransition>

      {/* Hamburger Filter Panel */}
      <HamburgerFilters
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApply={setFilters}
      />

      {/* Job Detail Modal */}
      {selectedJob && <JobDetail job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </>
  );
}
