import type { CourseCategory, CourseItem } from '../data/instituteData';

export interface EnquiryFormValues {
  name: string;
  email: string;
  phone: string;
  course: string;
  message: string;
}

export type EnquiryFormErrors = Partial<Record<keyof EnquiryFormValues, string>>;

export interface ValidationResult {
  isValid: boolean;
  errors: EnquiryFormErrors;
  sanitized: EnquiryFormValues;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function sanitizeEnquiryValues(values: EnquiryFormValues): EnquiryFormValues {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    course: values.course.trim(),
    message: values.message.trim(),
  };
}

export function isValidPhoneNumber(phone: string): boolean {
  const digitsOnly = phone.replace(/[\s().-]/g, '');
  const normalized = digitsOnly.startsWith('+') ? digitsOnly.slice(1) : digitsOnly;
  return /^\d{7,15}$/.test(normalized);
}

export function validateEnquiryForm(
  values: EnquiryFormValues,
  availableCourses: readonly string[]
): ValidationResult {
  const sanitized = sanitizeEnquiryValues(values);
  const errors: EnquiryFormErrors = {};

  if (sanitized.name.length < 2) {
    errors.name = 'Please enter your full name (at least 2 characters).';
  }

  if (!sanitized.email) {
    errors.email = 'Please enter your email address.';
  } else if (!EMAIL_PATTERN.test(sanitized.email)) {
    errors.email = 'Please enter a valid email address (e.g. name@example.com).';
  }

  if (!sanitized.phone) {
    errors.phone = 'Please enter your phone number.';
  } else if (!isValidPhoneNumber(sanitized.phone)) {
    errors.phone = 'Please enter a valid phone number (7 to 15 digits).';
  }

  if (!sanitized.course || !availableCourses.includes(sanitized.course)) {
    errors.course = 'Please select a course from the list.';
  }

  if (sanitized.message.length < 10) {
    errors.message = 'Please share a brief message about your learning goals (at least 10 characters).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized,
  };
}

export function filterCoursesByCategory(
  courses: readonly CourseItem[],
  category: CourseCategory
): CourseItem[] {
  if (category === 'all') {
    return [...courses];
  }
  return courses.filter((course) => course.category === category);
}

export function stepCarouselIndex(current: number, delta: number, total: number): number {
  if (total <= 0) return 0;
  return ((current + delta) % total + total) % total;
}
