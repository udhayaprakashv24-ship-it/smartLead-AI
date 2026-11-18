import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Users, CheckCircle2 } from 'lucide-react';

const STUDIO_IMAGE_PATH = '/src/assets/images/about_coaching_studio_1794986646030.jpg';

const ABOUT_PILLARS = [
  'Small mentor-led study cohorts capped at 12 learners per mentor',
  'Weekly architectural code reviews instead of passive video lectures',
  'Structured mock interviews and GitHub portfolio coaching included',
];

export function AboutSection() {
  const [imageError, setImageError] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const photoParallax = useTransform(scrollYProgress, [0, 1], [18, -18]);

  return (
    <section id="about" ref={sectionRef} className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Split: Studio Photo + Institute Story */}
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[#F4F8FF] lg:col-span-6"
          >
            <motion.div style={{ y: photoParallax }} className="h-full min-h-[290px]">
              {!imageError ? (
                <img
                  src={STUDIO_IMAGE_PATH}
                  alt="SmartLead AI engineering mentor collaborating with learners around architectural blueprints and laptops"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="h-full w-full object-cover scale-105"
                />
              ) : (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center bg-gradient-to-br from-[#F4F8FF] to-[#E2EEFF] p-8 text-center">
                  <Users className="h-10 w-10 text-[#2563EB]" />
                  <p className="mt-3 font-display text-lg font-bold text-[#101828]">
                    Mentor-Guided Cohort Workshops
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Collaborative architecture sessions &amp; live debugging
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center lg:col-span-6"
          >
            <p className="text-sm font-semibold tracking-wide text-[#2563EB]">
              About SmartLead AI
            </p>
            <h2 className="mt-2 text-balance font-display text-3xl font-bold tracking-tight text-[#101828] sm:text-4xl">
              Practical Technical Coaching Built Around Career Outcomes
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#1E293B]/85">
              SmartLead AI was founded to close the gap between academic theory and production
              engineering. Instead of watching pre-recorded slides alone, students build real
              software, AI pipelines, and growth campaigns side-by-side with experienced industry
              practitioners.
            </p>
            <p className="mt-3 text-base leading-relaxed text-[#1E293B]/85">
              From your first line of Python to your final capstone defense, every step focuses on
              clarity, code craftsmanship, and measurable readiness for technical hiring teams.
            </p>

            <ul className="mt-6 space-y-3">
              {ABOUT_PILLARS.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm font-medium text-[#101828]">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#06B6D4]"
                    aria-hidden="true"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
