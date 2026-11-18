import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatLeadRef,
  inferLeadPriority,
  matchKnownCourse,
  filterLeads,
  computeLeadMetrics,
  leadsToCsv,
  leadsToTsv,
  isValidWebhookUrl,
  type LeadRecord,
  type EnquiryNotification,
} from './leads';

const SAMPLE_COURSES = [
  'Artificial Intelligence',
  'Data Science',
  'Web Development',
  'Python Programming',
  'Full Stack Development',
  'Digital Marketing',
];

const SAMPLE_LEADS: LeadRecord[] = [
  {
    id: 'lead-1',
    refCode: 'SL-1001',
    name: 'Avery Patel',
    email: 'avery@example.com',
    phone: '+1 415 555 0101',
    course: 'Artificial Intelligence',
    goals: 'Looking to switch into an Applied AI engineering role urgently.',
    source: 'AI Chatbot',
    status: 'New',
    priority: 'High',
    notes: '',
    sheetSyncStatus: 'Pending Export',
    createdAt: '2026-11-17T10:00:00.000Z',
    updatedAt: '2026-11-17T10:00:00.000Z',
  },
  {
    id: 'lead-2',
    refCode: 'SL-1002',
    name: 'Liam Gomez',
    email: 'liam@example.com',
    phone: '+1 415 555 0102',
    course: 'Full Stack Development',
    goals: 'Interested in weekend cohort.',
    source: 'Contact Form',
    status: 'Scheduled',
    priority: 'Medium',
    notes: 'Call booked for Thursday, 4 PM',
    sheetSyncStatus: 'Exported',
    createdAt: '2026-11-17T11:00:00.000Z',
    updatedAt: '2026-11-17T12:00:00.000Z',
  },
];

const SAMPLE_NOTIFICATIONS: EnquiryNotification[] = [
  {
    id: 'notif-1',
    leadId: 'lead-1',
    leadRef: 'SL-1001',
    title: 'New AI Chatbot Lead: Avery Patel',
    summary: 'Interested in Artificial Intelligence',
    course: 'Artificial Intelligence',
    source: 'AI Chatbot',
    priority: 'High',
    channels: ['In-App Alert'],
    read: false,
    createdAt: '2026-11-17T10:00:00.000Z',
  },
];

test('formatLeadRef generates sequential SmartLead reference codes', () => {
  assert.equal(formatLeadRef(1), 'SL-1001');
  assert.equal(formatLeadRef(42), 'SL-1042');
});

test('matchKnownCourse resolves exact, partial, and keyword inputs', () => {
  assert.equal(matchKnownCourse('Data Science', SAMPLE_COURSES), 'Data Science');
  assert.equal(matchKnownCourse('LLM and AI engineering', SAMPLE_COURSES), 'Artificial Intelligence');
  assert.equal(matchKnownCourse('SEO & growth marketing', SAMPLE_COURSES), 'Digital Marketing');
  assert.equal(matchKnownCourse('React frontend', SAMPLE_COURSES), 'Web Development');
});

test('inferLeadPriority detects high-intent keywords', () => {
  assert.equal(
    inferLeadPriority('Looking to switch careers into AI cohort immediately', 'Artificial Intelligence'),
    'High'
  );
  assert.equal(inferLeadPriority('Just exploring options', 'Web Development'), 'Standard');
});

test('filterLeads filters by query, status, source, and course', () => {
  assert.equal(filterLeads(SAMPLE_LEADS, { status: 'New' }).length, 1);
  assert.equal(filterLeads(SAMPLE_LEADS, { source: 'Contact Form' })[0].id, 'lead-2');
  assert.equal(filterLeads(SAMPLE_LEADS, { query: 'Avery' }).length, 1);
  assert.equal(filterLeads(SAMPLE_LEADS, { query: 'Thursday' }).length, 1);
});

test('computeLeadMetrics returns accurate pipeline totals', () => {
  const metrics = computeLeadMetrics(SAMPLE_LEADS, SAMPLE_NOTIFICATIONS);
  assert.deepEqual(metrics, {
    total: 2,
    newCount: 1,
    aiCaptured: 1,
    scheduledOrEnrolled: 1,
    pendingSheetSync: 1,
    unreadAlerts: 1,
  });
});

test('leadsToCsv and leadsToTsv escape commas, quotes, and tabs safely', () => {
  const csv = leadsToCsv(SAMPLE_LEADS);
  assert.ok(csv.includes('"Interested in weekend cohort. | Counselor: Call booked for Thursday, 4 PM"'));
  assert.ok(csv.startsWith('Lead Ref,Submitted At,Student Name'));

  const tsv = leadsToTsv(SAMPLE_LEADS);
  assert.ok(tsv.includes('SL-1001\t2026-11-17T10:00:00.000Z\tAvery Patel'));
});

test('isValidWebhookUrl validates http/https URLs strictly', () => {
  assert.equal(isValidWebhookUrl('https://script.google.com/macros/s/abc/exec'), true);
  assert.equal(isValidWebhookUrl('not-a-url'), false);
  assert.equal(isValidWebhookUrl('javascript:alert(1)'), false);
});
