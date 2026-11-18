import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, MessageSquare, GraduationCap, Bot } from 'lucide-react';

interface HeroSectionProps {
  onExploreCourses: () => void;
  onEnquireNow: () => void;
  onOpenAiAdvisor?: () => void;
}

const HERO_IMAGE_PATH = '/src/assets/images/hero_smartlead_3d_1794986645146.jpg';

const TRUST_HIGHLIGHTS = [
  { metric: '6 Career Tracks', detail: 'AI, Data Science, Python, Web, Full Stack & Growth' },
  { metric: 'Live Cohort Labs', detail: 'Small-group coaching with practicing engineers' },
  { metric: 'Portfolio Capstones', detail: 'Production-deployed builds reviewed 1-on-1' },
  { metric: 'Career Placement', detail: 'Mock technical interviews & hiring referrals' },
];

export function HeroSection({
  onExploreCourses,
  onEnquireNow,
  onOpenAiAdvisor,
}: HeroSectionProps) {
  const [imageError, setImageError] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 32]);

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative overflow-hidden bg-white pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24"
    >
      {/* Subtle animated ambient gradient canvas */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 24, 0],
            y: [0, -16, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 right-[-8%] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-[#2563EB]/10 via-[#06B6D4]/10 to-transparent blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-28 left-[-6%] h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-[#F4F8FF] via-[#2563EB]/8 to-transparent blur-3xl"
        />
        {/* Subtle floating geometric shapes in background canvas */}
        <motion.div
          animate={{ y: [0, -14, 0], rotate: [0, 6, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-24 left-[44%] hidden h-14 w-14 rounded-2xl border border-[#2563EB]/15 bg-[#F4F8FF]/60 lg:block"
        />
        <motion.div
          animate={{ y: [0, 12, 0], x: [0, -8, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          className="absolute bottom-36 right-[6%] hidden h-9 w-9 rounded-full border border-[#06B6D4]/25 bg-[#06B6D4]/5 lg:block"
        />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(16, 24, 40, 0.08) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Editorial Value Proposition */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center lg:col-span-6"
          >
            <p className="mb-4 text-sm font-semibold tracking-wide text-[#2563EB]">
              SmartLead AI Coaching Institute
            </p>

            <h1 className="text-balance font-display text-[clamp(2.25rem,4vw,3.75rem)] font-extrabold leading-[1.08] tracking-tight text-[#101828]">
              Build Your Future With Smarter Learning.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#1E293B]/85 sm:text-lg">
              Master high-demand engineering, data, and AI disciplines through live mentor-led
              cohorts, production-grade projects, and structured career preparation built for modern
              technical roles.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <motion.button
                type="button"
                onClick={onExploreCourses}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.16 }}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.45)] transition-colors hover:bg-[#1D4ED8] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 cursor-pointer"
              >
                <span>Explore Courses</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </motion.button>

              <motion.button
                type="button"
                onClick={onEnquireNow}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.16 }}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#101828] transition-colors hover:border-[#2563EB] hover:bg-[#F4F8FF] hover:text-[#2563EB] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 text-[#06B6D4]" aria-hidden="true" />
                <span>Enquire Now</span>
              </motion.button>

              {onOpenAiAdvisor && (
                <motion.button
                  type="button"
                  onClick={onOpenAiAdvisor}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-[#2563EB]/25 bg-[#F4F8FF] px-4 py-3 text-sm font-semibold text-[#2563EB] transition-colors hover:bg-[#E8F0FF] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 cursor-pointer"
                >
                  <Bot className="h-4 w-4" aria-hidden="true" />
                  <span>Ask AI Advisor</span>
                </motion.button>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-600 sm:text-sm">
              <span>Live Interactive Cohorts</span>
              <span aria-hidden="true">·</span>
              <span>1-on-1 Mentor Reviews</span>
              <span aria-hidden="true">·</span>
              <span>Verified Capstone Credentials</span>
            </div>
          </motion.div>

          {/* Right Column: 3D Educational Illustration */}
          <div className="relative flex items-center lg:col-span-6">
            <motion.div
              style={{ y: imageY }}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-[#F4F8FF] shadow-[0_24px_48px_-16px_rgba(16,24,40,0.12)]"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative aspect-[4/3] w-full"
              >
                {!imageError ? (
                  <img
                    src={HERO_IMAGE_PATH}
                    alt="3D architectural learning workspace illustrating AI neural modules, code workstations, and digital textbooks"
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#F4F8FF] via-white to-[#E0ECFF] p-8 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#101828] text-[#06B6D4]">
                      <GraduationCap className="h-8 w-8" />
                    </div>
                    <p className="font-display text-lg font-bold text-[#101828]">
                      SmartLead AI Learning Studio
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Applied AI · Engineering · Career Mentorship
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Full-Width Outcome Strip Below the Hero Split */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 grid grid-cols-1 gap-6 border-t border-slate-200 pt-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {TRUST_HIGHLIGHTS.map((item, idx) => (
            <motion.div
              key={item.metric}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.36, delay: 0.18 + idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -2 }}
              className="space-y-1 rounded-xl p-2 -m-2 transition-colors hover:bg-[#F4F8FF]/70"
            >
              <p className="font-display text-base font-bold text-[#101828]">{item.metric}</p>
              <p className="text-sm leading-snug text-slate-600">{item.detail}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
