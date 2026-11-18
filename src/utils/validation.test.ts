import test from 'node:test';
import assert from 'node:assert/strict';
import { COURSES } from '../data/instituteData';
import {
  filterCoursesByCategory,
  isValidPhoneNumber,
  stepCarouselIndex,
  validateEnquiryForm,
} from './validation';

const courseTitles = COURSES.map((c) => c.title);

test('validateEnquiryForm accepts valid student enquiry', () => {
  const result = validateEnquiryForm(
    {
      name: '  Aarav Patel  ',
      email: 'aarav.patel@example.com',
      phone: '+1 (415) 555-0192',
      course: 'Artificial Intelligence',
      message: 'Looking for weekend cohort details and prerequisites.',
    },
    courseTitles
  );

  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, {});
  assert.equal(result.sanitized.name, 'Aarav Patel');
});

test('validateEnquiryForm rejects empty or malformed fields with descriptive errors', () => {
  const result = validateEnquiryForm(
    {
      name: 'A',
      email: 'invalid-email',
      phone: '123',
      course: '',
      message: 'Hi',
    },
    courseTitles
  );

  assert.equal(result.isValid, false);
  assert.ok(result.errors.name);
  assert.ok(result.errors.email);
  assert.ok(result.errors.phone);
  assert.ok(result.errors.course);
  assert.ok(result.errors.message);
});

test('validateEnquiryForm rejects unlisted course selections', () => {
  const result = validateEnquiryForm(
    {
      name: 'Elena Rostova',
      email: 'elena@example.org',
      phone: '4155550148',
      course: 'Nonexistent Course',
      message: 'Interested in upcoming admissions timeline.',
    },
    courseTitles
  );

  assert.equal(result.isValid, false);
  assert.ok(result.errors.course);
});

test('isValidPhoneNumber handles international and formatted phone strings', () => {
  assert.equal(isValidPhoneNumber('+44 20 7946 0958'), true);
  assert.equal(isValidPhoneNumber('415-890-4320'), true);
  assert.equal(isValidPhoneNumber('abc-123'), false);
  assert.equal(isValidPhoneNumber('12345'), false);
});

test('filterCoursesByCategory returns accurate subsets', () => {
  const all = filterCoursesByCategory(COURSES, 'all');
  assert.equal(all.length, 6);

  const aiData = filterCoursesByCategory(COURSES, 'ai-data');
  assert.equal(aiData.length, 2);
  assert.ok(aiData.every((c) => c.category === 'ai-data'));

  const engineering = filterCoursesByCategory(COURSES, 'engineering');
  assert.equal(engineering.length, 3);

  const growth = filterCoursesByCategory(COURSES, 'growth');
  assert.equal(growth.length, 1);
  assert.equal(growth[0].title, 'Digital Marketing');
});

test('stepCarouselIndex wraps cleanly forward and backward', () => {
  assert.equal(stepCarouselIndex(0, 1, 4), 1);
  assert.equal(stepCarouselIndex(3, 1, 4), 0);
  assert.equal(stepCarouselIndex(0, -1, 4), 3);
  assert.equal(stepCarouselIndex(2, -1, 4), 1);
  assert.equal(stepCarouselIndex(0, 1, 0), 0);
});
