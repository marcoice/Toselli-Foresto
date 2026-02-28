'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Course } from '@/lib/types';

interface CourseCardProps {
  course: Course;
  progress?: {
    completed_modules: number[];
    quiz_completed: number;
    quiz_score: number;
  };
  index?: number;
}

const levelConfig: Record<string, { label: string; dots: number; color: string }> = {
  beginner: { label: 'Base', dots: 1, color: '#22c55e' },
  intermediate: { label: 'Intermedio', dots: 2, color: '#3b82f6' },
  advanced: { label: 'Avanzato', dots: 3, color: '#f59e0b' },
  expert: { label: 'Esperto', dots: 4, color: '#ef4444' },
};

const categoryIcons: Record<string, string> = {
  networking: '🌐',
  security: '🔒',
  cloud: '☁️',
  development: '💻',
  data: '📊',
  database: '🗄️',
};

export default function CourseCard({ course, progress, index = 0 }: CourseCardProps) {
  const levelInfo = levelConfig[course.level] || { label: course.level, dots: 1, color: '#6366f1' };
  const icon = categoryIcons[course.category] || '📚';
  const moduleCount = course.modules?.length || 5;
  const completedCount = progress?.completed_modules?.length || 0;
  const progressPercent = moduleCount > 0 ? Math.round((completedCount / moduleCount) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/learn/${course.id}`}
        className="group block rounded-2xl border border-zinc-200/80 bg-white p-4 transition-all duration-300 hover:border-indigo-300/60 hover:shadow-xl hover:shadow-indigo-500/10 active:scale-[0.98] dark:border-zinc-800/80 dark:bg-zinc-900/80 dark:hover:border-indigo-700/50 card-shine"
      >
        <div className="flex items-start gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl"
            style={{ backgroundColor: `${course.badge_color}12`, boxShadow: `0 4px 12px ${course.badge_color}15` }}
          >
            {icon}
          </motion.div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-zinc-900 dark:text-white text-sm leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {course.title}
            </h3>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className={`h-1.5 w-1.5 rounded-full transition-all ${i >= levelInfo.dots ? 'bg-zinc-200 dark:bg-zinc-700' : ''}`}
                    style={i < levelInfo.dots ? { backgroundColor: levelInfo.color } : undefined}
                  />
                ))}
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{levelInfo.label}</span>
              <span className="text-xs text-zinc-300 dark:text-zinc-600">·</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{course.duration}</span>
            </div>
          </div>
          {progress?.quiz_completed ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 glow-emerald"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-emerald-600 dark:text-emerald-400">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
              </svg>
            </motion.div>
          ) : null}
        </div>

        <p className="mt-2.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">{course.description}</p>

        {/* Progress bar */}
        {completedCount > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Progresso</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
              />
            </div>
          </div>
        )}

        {/* Badge preview */}
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/30 px-3 py-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${course.badge_color}, ${course.badge_color}aa)`,
              boxShadow: `0 2px 8px ${course.badge_color}30`,
            }}
          >
            ★
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Badge: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{course.badge_name}</span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
