import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Quote, GraduationCap } from 'lucide-react';
import { TESTIMONIALS, type TestimonialItem } from '../data/instituteData';
import { SkewedCarousel } from './SkewedCarousel';
import {
  EASE_OUT_EXPO,
  VIEWPORT_REVEAL,
  staggerContainer,
  fadeUpItem,
} from '../utils/motion';

interface TestimonialsSectionProps {
  onExploreCourse: (courseTitle: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function TestimonialsSection({ onExploreCourse }: TestimonialsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const markImageFailed = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const renderStoryCard = (
    story: TestimonialItem,
    { isActive }: { isActive: boolean; index: number }
  ) => (
    <article
      className={`rounded-2xl border bg-white p-6 transition-shadow duration-200 sm:p-8 ${
        isActive
          ? 'border-[#2563EB]/25 shadow-[0_24px_54px_-18px_rgba(16,24,40,0.14)]'
          : 'border-slate-200/80 shadow-sm'
      }`}
    >
      <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-12 sm:gap-8">
        {/* Student Portrait */}
        <div className="sm:col-span-4">
          <div className="relative mx-auto aspect-square max-w-[220px] overflow-hidden rounded-2xl border border-slate-200 bg-[#F4F8FF] sm:max-w-none">
            {!failedImages[story.id] ? (
              <img
                src={story.photoUrl}
                alt={`${story.name}, ${story.role} at ${story.company}`}
                referrerPolicy="no-referrer"
                onError={() => markImageFailed(story.id)}
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#101828] to-[#2563EB] text-white">
                <span className="font-display text-3xl font-bold">{getInitials(story.name)}</span>
                <span className="mt-1.5 text-xs text-slate-200">{story.course}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quote, Graduate Metadata & Course Outcome */}
        <div className="flex flex-col justify-between sm:col-span-8">
          <div>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold text-[#2563EB]">
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-[#06B6D4]" aria-hidden="true" />
                <span>{story.course}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-600">{story.cohort}</span>
            </div>

            <Quote className="mt-4 h-6 w-6 text-[#2563EB]/30" aria-hidden="true" />

            <blockquote className="mt-2.5 font-display text-lg font-semibold leading-snug text-[#101828] sm:text-xl">
              “{story.quote}”
            </blockquote>
          </div>

          <div className="mt-6 flex flex-col justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-end">
            <div>
              <p className="font-display text-base font-bold text-[#101828]">{story.name}</p>
              <p className="text-xs font-medium text-slate-600 sm:text-sm">
                {story.role} at {story.company}
              </p>
              <p className="mt-1 text-xs font-semibold text-[#2563EB]">
                Outcome: {story.outcome}
              </p>
            </div>

            {isActive && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onExploreCourse(story.course);
                }}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-[#101828] transition-colors hover:border-[#2563EB] hover:bg-[#F4F8FF] hover:text-[#2563EB] whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              >
                <span>View {story.course} Syllabus</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="overflow-hidden bg-white py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_REVEAL}
          transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
          className="max-w-2xl"
        >
          <p className="text-sm font-semibold tracking-wide text-[#2563EB]">
            Student Success Stories
          </p>
          <h2
            id="testimonials-heading"
            className="mt-2 text-balance font-display text-3xl font-bold tracking-tight text-[#101828] sm:text-4xl"
          >
            Graduates Building Real Careers Across Tech &amp; AI
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[#1E293B]/80">
            Explore how SmartLead AI alumni turned mentor code reviews and practical capstones into
            engineering, data science, and growth leadership roles.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_REVEAL}
          transition={{ duration: 0.45, delay: 0.08, ease: EASE_OUT_EXPO }}
          className="mt-8"
        >
          <SkewedCarousel
            items={TESTIMONIALS}
            getKey={(story) => story.id}
            activeIndex={activeIndex}
            onIndexChange={setActiveIndex}
            renderCard={renderStoryCard}
            ariaLabel="Student success stories skewed carousel"
          />
        </motion.div>

        {/* Direct Graduate Selector Strip */}
        <motion.div
          variants={staggerContainer(0.06)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_REVEAL}
          aria-label="Select a student story"
          className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {TESTIMONIALS.map((story, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <motion.button
                key={story.id}
                variants={fadeUpItem}
                whileHover={{ y: -2, transition: { duration: 0.16, ease: EASE_OUT_EXPO } }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-pressed={isSelected}
                className={`flex min-h-[64px] items-center gap-3 rounded-xl border p-3 text-left transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                  isSelected
                    ? 'border-[#2563EB] bg-[#F4F8FF]/80 shadow-[0_10px_24px_-12px_rgba(37,99,235,0.2)]'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-[#F4F8FF]/40'
                }`}
              >
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-[#F4F8FF]">
                  {!failedImages[story.id] ? (
                    <img
                      src={story.photoUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      onError={() => markImageFailed(story.id)}
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#101828] text-xs font-bold text-white">
                      {getInitials(story.name)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold text-[#101828]">
                    {story.name}
                  </p>
                  <p className="truncate text-xs text-slate-600">{story.course}</p>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
