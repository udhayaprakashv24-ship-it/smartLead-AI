import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { FAQS } from '../data/instituteData';
import {
  EASE_OUT_EXPO,
  VIEWPORT_REVEAL,
  staggerContainer,
  fadeUpItem,
} from '../utils/motion';

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(FAQS[0]?.id ?? null);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT_REVEAL}
          transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
          className="text-center"
        >
          <p className="text-sm font-semibold tracking-wide text-[#2563EB]">
            Frequently Asked Questions
          </p>
          <h2 className="mt-2 text-balance font-display text-3xl font-bold tracking-tight text-[#101828] sm:text-4xl">
            Everything You Need to Know Before Enrolling
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-[#1E293B]/80">
            Clear answers on prerequisites, mentor-led cohort schedules, project reviews, and
            career placement support.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.05)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_REVEAL}
          className="mt-12 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          {FAQS.map((item) => {
            const isOpen = openId === item.id;
            const panelId = `${item.id}-panel`;
            const buttonId = `${item.id}-button`;

            return (
              <motion.div
                key={item.id}
                variants={fadeUpItem}
                className="px-6 py-5 transition-colors duration-150 hover:bg-[#F4F8FF]/35 sm:px-8"
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleItem(item.id)}
                    className="flex min-h-[44px] w-full items-center justify-between gap-4 text-left font-display text-base font-semibold text-[#101828] transition-colors hover:text-[#2563EB] sm:text-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 rounded"
                  >
                    <span>{item.question}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F4F8FF] text-[#2563EB]"
                      aria-hidden="true"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.24, ease: EASE_OUT_EXPO }}
                      className="overflow-hidden"
                    >
                      <p className="pt-3 pr-8 text-sm leading-relaxed text-[#1E293B]/85 sm:text-base">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
