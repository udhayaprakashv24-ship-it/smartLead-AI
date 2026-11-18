import { useState, useEffect, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { COURSES } from '../data/instituteData';
import {
  validateEnquiryForm,
  type EnquiryFormErrors,
  type EnquiryFormValues,
} from '../utils/validation';
import type { EnquiryNotification, LeadRecord } from '../utils/leads';

interface ContactSectionProps {
  preselectedCourse: string;
  nameInputRef: React.RefObject<HTMLInputElement | null>;
  onLeadCreated?: (lead: LeadRecord, notification: EnquiryNotification | null) => void;
}

const AVAILABLE_COURSE_TITLES = COURSES.map((c) => c.title);

export function ContactSection({
  preselectedCourse,
  nameInputRef,
  onLeadCreated,
}: ContactSectionProps) {
  const [values, setValues] = useState<EnquiryFormValues>({
    name: '',
    email: '',
    phone: '',
    course: preselectedCourse || COURSES[0].title,
    message: '',
  });
  const [errors, setErrors] = useState<EnquiryFormErrors>({});
  const [submittedRecord, setSubmittedRecord] = useState<EnquiryFormValues | null>(null);
  const [submittedRefCode, setSubmittedRefCode] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedCourse && AVAILABLE_COURSE_TITLES.includes(preselectedCourse)) {
      setValues((prev) => ({ ...prev, course: preselectedCourse }));
      setSubmittedRecord(null);
      setSubmittedRefCode(null);
      setSubmitError(null);
      setErrors((prev) => ({ ...prev, course: undefined }));
    }
  }, [preselectedCourse]);

  const handleFieldChange = (field: keyof EnquiryFormValues, nextValue: string) => {
    setValues((prev) => ({ ...prev, [field]: nextValue }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateEnquiryForm(values, AVAILABLE_COURSE_TITLES);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.sanitized),
      });

      const data = (await response.json()) as {
        lead?: LeadRecord;
        notification?: EnquiryNotification | null;
        error?: string;
      };

      if (!response.ok || !data.lead) {
        throw new Error(data.error || 'Unable to submit enquiry right now.');
      }

      setSubmittedRecord(validation.sanitized);
      setSubmittedRefCode(data.lead.refCode);
      setValues({
        name: '',
        email: '',
        phone: '',
        course: validation.sanitized.course,
        message: '',
      });
      onLeadCreated?.(data.lead, data.notification ?? null);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Unable to save enquiry. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="bg-[#F4F8FF] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Admissions Details */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-between lg:col-span-5"
          >
            <div>
              <p className="text-sm font-semibold tracking-wide text-[#2563EB]">
                Admissions &amp; Enquiries
              </p>
              <h2 className="mt-2 text-balance font-display text-3xl font-bold tracking-tight text-[#101828] sm:text-4xl">
                Speak With a SmartLead AI Program Advisor
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#1E293B]/85">
                Share your background and preferred track. Our admissions mentors will send you a
                detailed syllabus guide, upcoming cohort dates, and schedule a personalized roadmap
                call within one business day.
              </p>

              <div className="mt-8 space-y-5">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#2563EB] border border-slate-200">
                    <Mail className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Admissions Email</p>
                    <a
                      href="mailto:admissions@smartleadai.edu"
                      className="text-sm font-semibold text-[#101828] hover:text-[#2563EB]"
                    >
                      admissions@smartleadai.edu
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#2563EB] border border-slate-200">
                    <Phone className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Counselor Line</p>
                    <a
                      href="tel:+14158904320"
                      className="font-mono text-sm font-semibold text-[#101828] hover:text-[#2563EB]"
                    >
                      +1 (415) 890-4320
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#2563EB] border border-slate-200">
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Learning Campus &amp; Online</p>
                    <p className="text-sm font-semibold text-[#101828]">
                      450 Innovation Way, Suite 300, San Francisco, CA
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-xl border border-slate-200/80 bg-white p-5">
              <p className="font-display text-sm font-bold text-[#101828]">
                Next Cohort Intake Schedule
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Weekday Evening &amp; Weekend Live Tracks · Admissions open with scholarship
                counseling available.
              </p>
            </div>
          </motion.div>

          {/* Right Column: Validated Enquiry Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_16px_36px_-18px_rgba(16,24,40,0.1)] sm:p-9 lg:col-span-7"
          >
            {submittedRecord ? (
              <div
                role="status"
                aria-live="polite"
                className="flex flex-col items-start justify-center py-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-2xl font-bold text-[#101828]">
                  Enquiry Received — Thank You, {submittedRecord.name}
                </h3>
                {submittedRefCode && (
                  <p className="mt-1 font-mono text-xs font-semibold text-[#2563EB]">
                    Reference ID: {submittedRefCode} · Added to Lead Dashboard
                  </p>
                )}
                <p className="mt-2 text-base leading-relaxed text-[#1E293B]/85">
                  We have registered your interest in{' '}
                  <strong className="font-semibold text-[#101828]">
                    {submittedRecord.course}
                  </strong>
                  . An advisor will reach out to{' '}
                  <span className="font-medium text-[#2563EB]">{submittedRecord.email}</span> and{' '}
                  <span className="font-mono text-sm">{submittedRecord.phone}</span> with the full
                  cohort curriculum and schedule.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSubmittedRecord(null);
                    setSubmittedRefCode(null);
                  }}
                  className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-[#101828] transition-colors hover:border-[#2563EB] hover:text-[#2563EB] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                >
                  Send Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="enquiry-name"
                      className="block text-sm font-semibold text-[#101828]"
                    >
                      Student Name
                    </label>
                    <input
                      ref={nameInputRef}
                      id="enquiry-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. Jordan Rivera"
                      value={values.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'enquiry-name-error' : undefined}
                      className={`mt-1.5 block min-h-[44px] w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#101828] placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                        errors.name
                          ? 'border-red-500 focus:ring-red-500/30'
                          : 'border-slate-300 focus:border-[#2563EB] focus:ring-[#2563EB]/25'
                      }`}
                    />
                    {errors.name && (
                      <p
                        id="enquiry-name-error"
                        role="alert"
                        className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600"
                      >
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="enquiry-email"
                      className="block text-sm font-semibold text-[#101828]"
                    >
                      Email Address
                    </label>
                    <input
                      id="enquiry-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={values.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'enquiry-email-error' : undefined}
                      className={`mt-1.5 block min-h-[44px] w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#101828] placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                        errors.email
                          ? 'border-red-500 focus:ring-red-500/30'
                          : 'border-slate-300 focus:border-[#2563EB] focus:ring-[#2563EB]/25'
                      }`}
                    />
                    {errors.email && (
                      <p
                        id="enquiry-email-error"
                        role="alert"
                        className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600"
                      >
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="enquiry-phone"
                      className="block text-sm font-semibold text-[#101828]"
                    >
                      Phone Number
                    </label>
                    <input
                      id="enquiry-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+1 (415) 555-0192"
                      value={values.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'enquiry-phone-error' : undefined}
                      className={`mt-1.5 block min-h-[44px] w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#101828] placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                        errors.phone
                          ? 'border-red-500 focus:ring-red-500/30'
                          : 'border-slate-300 focus:border-[#2563EB] focus:ring-[#2563EB]/25'
                      }`}
                    />
                    {errors.phone && (
                      <p
                        id="enquiry-phone-error"
                        role="alert"
                        className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600"
                      >
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="enquiry-course"
                      className="block text-sm font-semibold text-[#101828]"
                    >
                      Course Selection
                    </label>
                    <select
                      id="enquiry-course"
                      name="course"
                      value={values.course}
                      onChange={(e) => handleFieldChange('course', e.target.value)}
                      aria-invalid={Boolean(errors.course)}
                      aria-describedby={errors.course ? 'enquiry-course-error' : undefined}
                      className={`mt-1.5 block min-h-[44px] w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-[#101828] focus:outline-none focus:ring-2 ${
                        errors.course
                          ? 'border-red-500 focus:ring-red-500/30'
                          : 'border-slate-300 focus:border-[#2563EB] focus:ring-[#2563EB]/25'
                      }`}
                    >
                      {COURSES.map((course) => (
                        <option key={course.id} value={course.title}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                    {errors.course && (
                      <p
                        id="enquiry-course-error"
                        role="alert"
                        className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600"
                      >
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{errors.course}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="enquiry-message"
                    className="block text-sm font-semibold text-[#101828]"
                  >
                    Message &amp; Learning Goals
                  </label>
                  <textarea
                    id="enquiry-message"
                    name="message"
                    rows={4}
                    placeholder="Tell us about your current experience level and what career role you are targeting..."
                    value={values.message}
                    onChange={(e) => handleFieldChange('message', e.target.value)}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'enquiry-message-error' : undefined}
                    className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#101828] placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                      errors.message
                        ? 'border-red-500 focus:ring-red-500/30'
                        : 'border-slate-300 focus:border-[#2563EB] focus:ring-[#2563EB]/25'
                    }`}
                  />
                  {errors.message && (
                    <p
                      id="enquiry-message-error"
                      role="alert"
                      className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600"
                    >
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{errors.message}</span>
                    </p>
                  )}
                </div>

                {submitError && (
                  <div
                    role="alert"
                    className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{submitError}</span>
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
                >
                  <span>{isSubmitting ? 'Submitting Enquiry...' : 'Submit Enquiry'}</span>
                  <Send className="h-4 w-4" aria-hidden="true" />
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
