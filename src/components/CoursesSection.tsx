import { useState } from 'react';
import { motion } from 'motion/react';
import {
  BrainCircuit,
  BarChart3,
  Globe,
  Terminal,
  Layers,
  Megaphone,
  ArrowRight,
} from 'lucide-react';
import {
  COURSES,
  COURSE_CATEGORIES,
  type CourseCategory,
  type CourseItem,
} from '../data/instituteData';
import { filterCoursesByCategory } from '../utils/validation';
import { staggerContainer, fadeUpItem, cardHoverLift, VIEWPORT_REVEAL, EASE_OUT_EXPO } from '../utils/motion';

interface CoursesSectionProps {
  onSelectCourse: (course: CourseItem) => void;
}

const ICON_MAP = {
  brain: BrainCircuit,
  barChart: BarChart3,
  globe: Globe,
  terminal: Terminal,
  layers: Layers,
  megaphone: Megaphone,
};

export function CoursesSection({ onSelectCourse }: CoursesSectionProps) {
  const [activeCategory, setActiveCategory] = useState<CourseCategory>('all');
  const visibleCourses = filterCoursesByCategory(COURSES, activeCategory);

  return (
    <section id="courses" className="bg-[#F4F8FF] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_REVEAL}
          transition={{ duration: 0.42, ease: EASE_OUT_EXPO }}
          className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"
        >
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-wide text-[#2563EB]">
              Career-Focused Programs
            </p>
            <h2 className="mt-2 text-balance font-display text-3xl font-bold tracking-tight text-[#101828] sm:text-4xl">
              Specialized Courses Built for Real Engineering &amp; AI Roles
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#1E293B]/80">
              Six structured cohorts pairing live architectural instruction with practical capstone
              builds and direct mentor code reviews.
            </p>
          </div>

          {/* Interactive Track Filter Segmented Control */}
          <div
            role="tablist"
            aria-label="Filter courses by discipline"
            className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-slate-200/80 bg-white p-1.5 self-start lg:self-auto"
          >
            {COURSE_CATEGORIES.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`min-h-[38px] rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                    isActive
                      ? 'bg-[#101828] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-[#F4F8FF] hover:text-[#101828]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Staggered Course Grid */}
        <motion.div
          key={activeCategory}
          variants={staggerContainer(0.06, 0.04)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_REVEAL}
          data-testid="courses-grid"
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {visibleCourses.map((course) => {
            const IconComponent = ICON_MAP[course.iconName];
            return (
              <motion.article
                key={course.id}
                variants={fadeUpItem}
                whileHover={cardHoverLift}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-7 transition-shadow duration-200 hover:border-[#2563EB]/35 hover:shadow-[0_18px_40px_-14px_rgba(37,99,235,0.14)]"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F4F8FF] text-[#2563EB] transition-all duration-200 group-hover:scale-105 group-hover:bg-[#2563EB] group-hover:text-white">
                      <IconComponent className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="text-xs font-medium text-slate-500">
                      {course.duration} · {course.level}
                    </p>
                  </div>

                  <h3 className="mt-5 font-display text-xl font-bold text-[#101828] transition-colors group-hover:text-[#2563EB]">
                    {course.title}
                  </h3>

                  <p className="mt-2.5 text-sm leading-relaxed text-[#1E293B]/80">
                    {course.shortDescription}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <p className="text-xs font-medium text-slate-500">
                    {course.tools.slice(0, 4).join(' · ')}
                  </p>

                  <button
                    type="button"
                    onClick={() => onSelectCourse(course)}
                    aria-label={`Learn more about ${course.title}`}
                    className="mt-4 inline-flex min-h-[40px] items-center gap-1.5 text-sm font-semibold text-[#2563EB] transition-colors hover:text-[#101828] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 rounded"
                  >
                    <span>Learn More</span>
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
