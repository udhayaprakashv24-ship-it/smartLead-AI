import { motion } from 'motion/react';
import { Briefcase, Users, TrendingUp, FolderGit2 } from 'lucide-react';
import { ACHIEVEMENT_STATS } from '../data/instituteData';
import { AnimatedCounter } from './AnimatedCounter';
import {
  EASE_OUT_EXPO,
  VIEWPORT_REVEAL,
  staggerContainer,
  fadeUpItem,
  cardHoverLift,
} from '../utils/motion';

const STAT_ICONS = {
  briefcase: Briefcase,
  users: Users,
  trendingUp: TrendingUp,
  folderGit: FolderGit2,
};

export function AchievementsSection() {
  return (
    <section
      id="achievements"
      aria-labelledby="achievements-heading"
      className="relative overflow-hidden bg-[#101828] py-16 text-white sm:py-20"
    >
      {/* Subtle ambient light accents */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-[#2563EB]/20 blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-[#06B6D4]/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_REVEAL}
          transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
          className="flex flex-col justify-between gap-4 border-b border-white/10 pb-8 md:flex-row md:items-end"
        >
          <div>
            <p className="text-sm font-semibold tracking-wide text-[#06B6D4]">
              Verified Cohort Outcomes
            </p>
            <h2
              id="achievements-heading"
              className="mt-2 text-balance font-display text-2xl font-bold tracking-tight text-white sm:text-3xl"
            >
              Measurable Career Impact Across Every Track
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-slate-300">
            Audited placement metrics and live mentorship benchmarks from our recent engineering,
            data, and AI cohorts.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.07)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_REVEAL}
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {ACHIEVEMENT_STATS.map((stat) => {
            const Icon = STAT_ICONS[stat.iconName];
            return (
              <motion.div
                key={stat.id}
                variants={fadeUpItem}
                whileHover={cardHoverLift}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors duration-200 hover:border-[#06B6D4]/40 hover:bg-white/[0.07]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#06B6D4] transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>

                <p className="mt-5 font-mono text-4xl font-semibold tracking-tight text-white">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>

                <p className="mt-2 font-display text-base font-bold text-white">
                  {stat.label}
                </p>

                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  {stat.context}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
