'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Job } from '@/lib/types';
import { RippleButton } from '@/lib/animations';

interface JobDetailProps {
  job: Job;
  onClose: () => void;
}

const typeLabels: Record<string, string> = {
  remote: 'Full Remote',
  hybrid: 'Ibrido',
  onsite: 'In sede',
};

const levelLabels: Record<string, string> = {
  junior: 'Junior (0-2 anni)',
  mid: 'Mid-Level (2-5 anni)',
  senior: 'Senior (5+ anni)',
  lead: 'Lead / Architect (8+ anni)',
};

export default function JobDetail({ job, onClose }: JobDetailProps) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-80 flex items-end justify-center sm:items-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.97 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900 sm:rounded-3xl sm:m-4"
        >
          {/* Drag indicator */}
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700 sm:hidden" />

          {/* Close button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </motion.button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-start gap-4 pr-8"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: -3 }}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${job.logo_color}, ${job.logo_color}cc)`,
                boxShadow: `0 8px 24px ${job.logo_color}40`,
              }}
            >
              {job.company.charAt(0)}
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{job.title}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{job.company}</p>
            </div>
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 flex flex-wrap gap-2"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 shadow-sm shadow-indigo-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              {job.location}
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shadow-sm shadow-emerald-500/10">
              {typeLabels[job.type]}
            </span>
            <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 shadow-sm shadow-purple-500/10">
              {levelLabels[job.level]}
            </span>
          </motion.div>

          {/* Salary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-4 rounded-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-4 dark:from-indigo-900/20 dark:via-purple-900/15 dark:to-pink-900/10 border border-indigo-100/50 dark:border-indigo-800/30"
          >
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">RAL Annua</p>
            <p className="text-2xl font-black gradient-text">
              €{job.salary_min.toLocaleString()} - €{job.salary_max.toLocaleString()}
            </p>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
              Descrizione
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{job.description}</p>
          </motion.div>

          {/* Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-6"
          >
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-blue-500 to-cyan-500" />
              Requisiti
            </h3>
            <ul className="mt-2 space-y-2">
              {job.requirements?.map((req, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                  </svg>
                  {req}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
              Benefits
            </h3>
            <ul className="mt-2 space-y-2">
              {job.benefits?.map((ben, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.05 }}
                  className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                >
                  <span className="mt-0.5 text-emerald-500">✦</span>
                  {ben}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Apply button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <RippleButton className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 transition-all hover:shadow-2xl hover:shadow-indigo-500/30 animate-gradient-x">
              Candidati ora ✨
            </RippleButton>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
