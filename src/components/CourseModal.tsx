import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, CheckCircle2, Layers, Briefcase } from 'lucide-react';
import type { CourseItem } from '../data/instituteData';

interface CourseModalProps {
  course: CourseItem | null;
  onClose: () => void;
  onEnquireCourse: (courseTitle: string) => void;
}

export function CourseModal({ course, onClose, onEnquireCourse }: CourseModalProps) {
  useEffect(() => {
    if (!course) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [course, onClose]);

  return (
    <AnimatePresence>
      {course && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/70 p-4 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="course-modal-title"
        >
          <motion.div
            initial={{ scale: 0.97, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.97, y: 10 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <p className="text-xs font-semibold tracking-wide text-[#2563EB]">
                  {course.categoryLabel} · {course.duration} · {course.level}
                </p>
                <h3
                  id="course-modal-title"
                  className="mt-1.5 font-display text-2xl font-bold text-[#101828]"
                >
                  {course.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label={`Close ${course.title} syllabus`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-[#F4F8FF] hover:text-[#101828] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-5 text-base leading-relaxed text-[#1E293B]/90">
              {course.fullDescription}
            </p>

            {/* Core Tools & Capstone */}
            <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl bg-[#F4F8FF] p-4 sm:grid-cols-2">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[#101828]">
                  <Layers className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                  Core Stack & Tools
                </p>
                <p className="mt-1.5 text-sm text-[#1E293B]/85">{course.tools.join(' · ')}</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[#101828]">
                  <Briefcase className="h-4 w-4 text-[#06B6D4]" aria-hidden="true" />
                  Target Career Roles
                </p>
                <p className="mt-1.5 text-sm text-[#1E293B]/85">
                  {course.careerOutcomes.join(' · ')}
                </p>
              </div>
            </div>

            {/* 4-Module Syllabus */}
            <div className="mt-6">
              <h4 className="font-display text-base font-bold text-[#101828]">
                Curriculum Breakdown
              </h4>
              <div className="mt-3 space-y-3">
                {course.modules.map((mod, idx) => (
                  <div
                    key={mod.title}
                    className="rounded-xl border border-slate-200/90 bg-white p-4"
                  >
                    <p className="font-display text-sm font-bold text-[#101828]">
                      0{idx + 1}. {mod.title}
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {mod.topics.map((topic) => (
                        <li
                          key={topic}
                          className="flex items-start gap-2 text-sm text-slate-600"
                        >
                          <CheckCircle2
                            className="mt-0.5 h-4 w-4 shrink-0 text-[#06B6D4]"
                            aria-hidden="true"
                          />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Capstone & Footer CTA */}
            <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500">Final Capstone Project</p>
                <p className="text-sm font-semibold text-[#101828]">{course.capstoneProject}</p>
              </div>
              <button
                type="button"
                onClick={() => onEnquireCourse(course.title)}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
              >
                <span>Enquire About This Course</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
