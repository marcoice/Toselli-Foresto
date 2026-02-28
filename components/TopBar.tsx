'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const pageTitles: Record<string, string> = {
  '/': 'DevHub IT',
  '/jobs': 'Opportunità',
  '/learn': 'Formazione',
  '/profile': 'Profilo',
};

interface TopBarProps {
  onFilterToggle?: () => void;
  showFilter?: boolean;
}

export default function TopBar({ onFilterToggle, showFilter }: TopBarProps) {
  const pathname = usePathname();

  const getTitle = () => {
    if (pageTitles[pathname]) return pageTitles[pathname];
    if (pathname.startsWith('/learn/')) return 'Corso';
    if (pathname.startsWith('/jobs/')) return 'Dettaglio';
    return 'DevHub IT';
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200/50 glass-strong dark:border-zinc-800/50"
    >
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/25"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
              <path fillRule="evenodd" d="M14.447 3.027a.75.75 0 0 1 .527.92l-4.5 16.5a.75.75 0 0 1-1.448-.394l4.5-16.5a.75.75 0 0 1 .921-.526ZM16.72 6.22a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06L21.44 12l-4.72-4.72a.75.75 0 0 1 0-1.06Zm-9.44 0a.75.75 0 0 1 0 1.06L2.56 12l4.72 4.72a.75.75 0 0 1-1.06 1.06L.97 12.53a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
            </svg>
            {/* Animated ring */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 opacity-0 animate-glow-pulse" />
          </motion.div>
          <motion.h1
            key={getTitle()}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="text-lg font-bold text-zinc-900 dark:text-white"
          >
            {getTitle()}
          </motion.h1>
        </div>
        <div className="flex items-center gap-1.5">
          {showFilter && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={onFilterToggle}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
              whileTap={{ scale: 0.9 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 transition-colors dark:text-zinc-300"
              aria-label="Filtri"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
              </svg>
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
            whileTap={{ scale: 0.9 }}
            className="notification-dot flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 transition-colors dark:text-zinc-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
