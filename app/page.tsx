'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TopBar from '@/components/TopBar';
import JobCard from '@/components/JobCard';
import CourseCard from '@/components/CourseCard';
import JobDetail from '@/components/JobDetail';
import { AnimatedCounter, FloatingParticles, PageTransition } from '@/lib/animations';
import { getJobs, getCourses, getStats } from '@/lib/api';
import type { Job, Course, PlatformStats } from '@/lib/types';
import Link from 'next/link';

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buongiorno');
    else if (hour < 18) setGreeting('Buon pomeriggio');
    else setGreeting('Buonasera');
  }, []);

  useEffect(() => {
    Promise.all([
      getJobs().catch(() => []),
      getCourses().catch(() => []),
      getStats().catch(() => null),
    ]).then(([jobsData, coursesData, statsData]) => {
      setJobs(jobsData.slice(0, 5));
      setCourses(coursesData.slice(0, 4));
      setStats(statsData);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <TopBar />
      <PageTransition>
        {/* Hero Section with particles */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-5 py-10 text-white">
          <FloatingParticles count={15} color="#ffffff" />
          
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-indigo-200 font-medium"
            >
              {greeting} 👋
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-2xl font-black leading-tight mt-1"
            >
              La tua carriera IT
              <br />
              <span className="bg-gradient-to-r from-white via-indigo-100 to-white bg-clip-text">
                inizia qui.
              </span>{' '}
              <motion.span
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                className="inline-block"
              >
                🚀
              </motion.span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-sm text-indigo-200 max-w-[280px]"
            >
              Trova lavoro, impara nuove competenze e ottieni certificazioni nel mondo tech.
            </motion.p>

            {/* Stats */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-6 grid grid-cols-3 gap-3"
              >
                {[
                  { value: stats.jobs, label: 'Posizioni', icon: '💼' },
                  { value: stats.courses, label: 'Corsi', icon: '📚' },
                  { value: stats.badges_awarded, label: 'Badge', icon: '🏅' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1, type: 'spring', stiffness: 300 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="rounded-2xl bg-white/10 backdrop-blur-md p-3 text-center border border-white/10 hover:bg-white/15 transition-colors"
                  >
                    <div className="text-lg mb-0.5">{stat.icon}</div>
                    <p className="text-xl font-black">
                      <AnimatedCounter value={stat.value} duration={1.2} />
                    </p>
                    <p className="text-[10px] text-indigo-200 font-medium">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Latest Jobs */}
        <section className="px-4 py-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
              <h3 className="text-lg font-black text-zinc-900 dark:text-white">Ultime posizioni</h3>
            </div>
            <Link href="/jobs" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 group">
              Vedi tutte
              <motion.span
                className="inline-block"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`skeleton rounded-2xl h-28 stagger-${i}`} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job, i) => (
                <JobCard key={job.id} job={job} onSelect={setSelectedJob} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Featured Courses */}
        <section className="px-4 pb-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
              <h3 className="text-lg font-black text-zinc-900 dark:text-white">Percorsi formativi</h3>
            </div>
            <Link href="/learn" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              Vedi tutti
              <motion.span
                className="inline-block"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className={`skeleton rounded-2xl h-32 stagger-${i + 3}`} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Quick tips section */}
        <section className="px-4 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ y: -2 }}
            className="rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200/60 p-5 dark:from-amber-900/10 dark:via-orange-900/10 dark:to-yellow-900/10 dark:border-amber-800/30 hover-lift"
          >
            <div className="flex items-center gap-2 mb-3">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-lg"
              >
                💡
              </motion.span>
              <h3 className="font-black text-zinc-900 dark:text-white">Consiglio del giorno</h3>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Le aziende IT italiane nel 2026 cercano principalmente profili con competenze in{' '}
              <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/20 px-1 rounded">Cloud (AWS/Azure)</span>,{' '}
              <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/20 px-1 rounded">React + TypeScript</span> e{' '}
              <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/20 px-1 rounded">Cybersecurity</span>.
              Investi nella formazione su queste tecnologie per aumentare le tue opportunità.
            </p>
          </motion.div>
        </section>

        {/* Trending technologies */}
        <section className="px-4 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
              <h3 className="text-lg font-black text-zinc-900 dark:text-white">Tecnologie trending</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'React', color: '#61dafb' },
                { name: 'TypeScript', color: '#3178c6' },
                { name: 'Next.js', color: '#000000' },
                { name: 'AWS', color: '#ff9900' },
                { name: 'Docker', color: '#2496ed' },
                { name: 'Kubernetes', color: '#326ce5' },
                { name: 'Python', color: '#3776ab' },
                { name: 'Go', color: '#00add8' },
              ].map((tech, i) => (
                <motion.span
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 shadow-sm hover:shadow-md transition-shadow cursor-default"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tech.color }} />
                  {tech.name}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </section>
      </PageTransition>

      {/* Job Detail Modal */}
      {selectedJob && <JobDetail job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </>
  );
}
