import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, FolderGit2, Cpu, Compass, Award } from 'lucide-react';
import { WHY_CHOOSE_US_PILLARS } from '../data/instituteData';
import {
  EASE_OUT_EXPO,
  VIEWPORT_REVEAL,
  staggerContainer,
  fadeUpItem,
  cardHoverLift,
} from '../utils/motion';

const AI_VISUAL_PATH = '/src/assets/images/course_ai_neural_1794986645930.jpg';
const STACK_VISUAL_PATH = '/src/assets/images/course_fullstack_code_1794986646028.jpg';

const PILLAR_ICONS = {
  users: Users,
  folderGit: FolderGit2,
  cpu: Cpu,
  compass: Compass,
  award: Award,
};

export function WhyChooseUsSection() {
  const [aiImgErr, setAiImgErr] = useState(false);
  const [stackImgErr, setStackImgErr] = useState(false);

  return (
    <section id="why-us" className="bg-[#F4F8FF] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_REVEAL}
          transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
          className="max-w-2xl"
        >
          <p className="text-sm font-semibold tracking-wide text-[#2563EB]">
            Why Choose SmartLead AI
          </p>
          <h2 className="mt-2 text-balance font-display text-3xl font-bold tracking-tight text-[#101828] sm:text-4xl">
            Structured Coaching Designed for Depth, Not Shortcuts
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[#1E293B]/80">
            Five core standards guide every cohort so learners build lasting technical fluency and
            verifiable career momentum.
          </p>
        </motion.div>

        {/* Asymmetric Editorial Bento Grid */}
        <motion.div
          variants={staggerContainer(0.07)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_REVEAL}
          className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12"
        >
          {/* Left Visual Showcase Card + First 2 Pillars */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-7">
            {WHY_CHOOSE_US_PILLARS.slice(0, 2).map((pillar) => {
              const Icon = PILLAR_ICONS[pillar.iconName];
              return (
                <motion.div
                  key={pillar.index}
                  variants={fadeUpItem}
                  whileHover={cardHoverLift}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-7 transition-shadow duration-200 hover:border-[#2563EB]/30 hover:shadow-[0_14px_30px_-14px_rgba(16,24,40,0.12)]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-[#2563EB]">
                        {pillar.index}.
                      </span>
                      <Icon
                        className="h-5 w-5 text-[#06B6D4] transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="mt-4 font-display text-xl font-bold text-[#101828]">
                      {pillar.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-[#1E293B]/80">
                      {pillar.description}
                    </p>
                  </div>
                  <p className="mt-5 border-t border-slate-100 pt-4 text-xs font-semibold text-[#101828]">
                    {pillar.highlight}
                  </p>
                </motion.div>
              );
            })}

            {/* Wide Visual Track Anchor */}
            <motion.div
              variants={fadeUpItem}
              whileHover={cardHoverLift}
              className="group grid grid-cols-1 overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition-shadow duration-200 hover:border-[#2563EB]/30 hover:shadow-[0_14px_30px_-14px_rgba(16,24,40,0.12)] sm:col-span-2 sm:grid-cols-12"
            >
              <div className="flex flex-col justify-center p-7 sm:col-span-7">
                <span className="font-mono text-xs font-semibold text-[#2563EB]">
                  {WHY_CHOOSE_US_PILLARS[2].index}.
                </span>
                <h3 className="mt-3 font-display text-xl font-bold text-[#101828]">
                  {WHY_CHOOSE_US_PILLARS[2].title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#1E293B]/80">
                  {WHY_CHOOSE_US_PILLARS[2].description}
                </p>
                <p className="mt-4 text-xs font-semibold text-[#101828]">
                  {WHY_CHOOSE_US_PILLARS[2].highlight}
                </p>
              </div>
              <div className="relative min-h-[190px] overflow-hidden bg-[#F4F8FF] sm:col-span-5">
                {!aiImgErr ? (
                  <img
                    src={AI_VISUAL_PATH}
                    alt="3D geometric neural crystal representing modern AI and data science architecture"
                    referrerPolicy="no-referrer"
                    onError={() => setAiImgErr(true)}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#2563EB]/10 to-[#06B6D4]/15 p-6">
                    <Cpu className="h-10 w-10 text-[#2563EB]" />
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Remaining 2 Pillars + Architecture Visual */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            {WHY_CHOOSE_US_PILLARS.slice(3).map((pillar) => {
              const Icon = PILLAR_ICONS[pillar.iconName];
              return (
                <motion.div
                  key={pillar.index}
                  variants={fadeUpItem}
                  whileHover={cardHoverLift}
                  className="group rounded-2xl border border-slate-200/90 bg-white p-7 transition-shadow duration-200 hover:border-[#2563EB]/30 hover:shadow-[0_14px_30px_-14px_rgba(16,24,40,0.12)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#2563EB]">
                      {pillar.index}.
                    </span>
                    <Icon
                      className="h-5 w-5 text-[#06B6D4] transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-3 font-display text-xl font-bold text-[#101828]">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#1E293B]/80">
                    {pillar.description}
                  </p>
                  <p className="mt-4 border-t border-slate-100 pt-3.5 text-xs font-semibold text-[#101828]">
                    {pillar.highlight}
                  </p>
                </motion.div>
              );
            })}

            <motion.div
              variants={fadeUpItem}
              whileHover={cardHoverLift}
              className="group relative aspect-[16/9] overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition-shadow duration-200 hover:shadow-[0_14px_30px_-14px_rgba(16,24,40,0.12)]"
            >
              {!stackImgErr ? (
                <img
                  src={STACK_VISUAL_PATH}
                  alt="3D layered engineering blocks illustrating full stack system design"
                  referrerPolicy="no-referrer"
                  onError={() => setStackImgErr(true)}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#101828] to-[#2563EB] p-6 text-white">
                  <p className="font-display text-sm font-semibold">
                    Full Stack &amp; Cloud System Architecture
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
