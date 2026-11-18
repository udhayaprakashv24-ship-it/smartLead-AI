export type LeadStatus = 'New' | 'Contacted' | 'Scheduled' | 'Enrolled' | 'Archived';
export type LeadSource = 'AI Chatbot' | 'Contact Form';
export type LeadPriority = 'High' | 'Medium' | 'Standard';
export type SheetSyncStatus = 'Pending Export' | 'Exported' | 'Webhook Sent' | 'Webhook Failed';

export interface LeadRecord {
  id: string;
  refCode: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  goals: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  notes: string;
  sheetSyncStatus: SheetSyncStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryNotification {
  id: string;
  leadId: string;
  leadRef: string;
  title: string;
  summary: string;
  course: string;
  source: LeadSource;
  priority: LeadPriority;
  channels: string[];
  read: boolean;
  createdAt: string;
}

export interface AutomationSettings {
  sheetsWebhookUrl: string;
  autoForwardToSheets: boolean;
  toastAlertsEnabled: boolean;
  soundAlertsEnabled: boolean;
}

export interface LeadFilterCriteria {
  query?: string;
  status?: LeadStatus | 'All';
  source?: LeadSource | 'All';
  course?: string | 'All';
}

export interface LeadMetrics {
  total: number;
  newCount: number;
  aiCaptured: number;
  scheduledOrEnrolled: number;
  pendingSheetSync: number;
  unreadAlerts: number;
}

export const LEAD_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Scheduled',
  'Enrolled',
  'Archived',
];

export const GOOGLE_APPS_SCRIPT_SNIPPET = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Lead Ref", "Submitted At", "Student Name", "Email",
      "Phone", "Course", "Source", "Status", "Priority", "Goals"
    ]);
  }
  sheet.appendRow([
    data.refCode, data.createdAt, data.name, data.email,
    data.phone, data.course, data.source, data.status, data.priority, data.goals
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export function formatLeadRef(sequenceNumber: number): string {
  const safeNum = Math.max(1, Math.floor(sequenceNumber));
  return `SL-${1000 + safeNum}`;
}

export function inferLeadPriority(goals: string, course: string, explicit?: string): LeadPriority {
  if (explicit === 'High' || explicit === 'Medium' || explicit === 'Standard') {
    return explicit;
  }
  const combined = `${goals} ${course}`.toLowerCase();
  if (
    combined.includes('immediate') ||
    combined.includes('urgent') ||
    combined.includes('switch') ||
    combined.includes('career') ||
    combined.includes('enroll') ||
    combined.includes('cohort') ||
    combined.includes('scholarship')
  ) {
    return 'High';
  }
  if (goals.trim().length >= 30) {
    return 'Medium';
  }
  return 'Standard';
}

export function matchKnownCourse(input: string, validCourses: string[]): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return validCourses[0] ?? 'Artificial Intelligence';
  }
  const exact = validCourses.find((c) => c.toLowerCase() === trimmed.toLowerCase());
  if (exact) return exact;

  const lower = trimmed.toLowerCase();
  const partial = validCourses.find(
    (c) => c.toLowerCase().includes(lower) || lower.includes(c.toLowerCase())
  );
  if (partial) return partial;

  if (lower.includes('ai') || lower.includes('machine learning') || lower.includes('llm')) {
    return validCourses.find((c) => c === 'Artificial Intelligence') ?? validCourses[0];
  }
  if (lower.includes('data') || lower.includes('analytics') || lower.includes('sql')) {
    return validCourses.find((c) => c === 'Data Science') ?? validCourses[0];
  }
  if (lower.includes('full stack') || lower.includes('fullstack') || lower.includes('backend')) {
    return validCourses.find((c) => c === 'Full Stack Development') ?? validCourses[0];
  }
  if (lower.includes('web') || lower.includes('react') || lower.includes('frontend')) {
    return validCourses.find((c) => c === 'Web Development') ?? validCourses[0];
  }
  if (lower.includes('python')) {
    return validCourses.find((c) => c === 'Python Programming') ?? validCourses[0];
  }
  if (lower.includes('market') || lower.includes('seo') || lower.includes('growth')) {
    return validCourses.find((c) => c === 'Digital Marketing') ?? validCourses[0];
  }

  return validCourses[0] ?? 'Artificial Intelligence';
}

export function filterLeads(leads: LeadRecord[], criteria: LeadFilterCriteria): LeadRecord[] {
  const q = (criteria.query ?? '').trim().toLowerCase();
  return leads.filter((lead) => {
    if (criteria.status && criteria.status !== 'All' && lead.status !== criteria.status) {
      return false;
    }
    if (criteria.source && criteria.source !== 'All' && lead.source !== criteria.source) {
      return false;
    }
    if (criteria.course && criteria.course !== 'All' && lead.course !== criteria.course) {
      return false;
    }
    if (!q) return true;
    const haystack = `${lead.refCode} ${lead.name} ${lead.email} ${lead.phone} ${lead.course} ${lead.goals} ${lead.notes}`.toLowerCase();
    return haystack.includes(q);
  });
}

export function computeLeadMetrics(
  leads: LeadRecord[],
  notifications: EnquiryNotification[]
): LeadMetrics {
  return {
    total: leads.length,
    newCount: leads.filter((l) => l.status === 'New').length,
    aiCaptured: leads.filter((l) => l.source === 'AI Chatbot').length,
    scheduledOrEnrolled: leads.filter(
      (l) => l.status === 'Scheduled' || l.status === 'Enrolled'
    ).length,
    pendingSheetSync: leads.filter(
      (l) => l.sheetSyncStatus === 'Pending Export' || l.sheetSyncStatus === 'Webhook Failed'
    ).length,
    unreadAlerts: notifications.filter((n) => !n.read).length,
  };
}

function escapeCsvCell(value: string): string {
  const safe = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (/[",\n]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

const SHEET_HEADERS = [
  'Lead Ref',
  'Submitted At',
  'Student Name',
  'Email',
  'Phone',
  'Course Interest',
  'Source',
  'Status',
  'Priority',
  'Goals / Notes',
  'Sheet Sync',
];

function leadToRow(lead: LeadRecord): string[] {
  const combinedNotes = [lead.goals, lead.notes ? `Counselor: ${lead.notes}` : '']
    .filter(Boolean)
    .join(' | ');
  return [
    lead.refCode,
    lead.createdAt,
    lead.name,
    lead.email,
    lead.phone,
    lead.course,
    lead.source,
    lead.status,
    lead.priority,
    combinedNotes,
    lead.sheetSyncStatus,
  ];
}

export function leadsToCsv(leads: LeadRecord[]): string {
  const rows = [SHEET_HEADERS, ...leads.map(leadToRow)];
  return rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n');
}

export function leadsToTsv(leads: LeadRecord[]): string {
  const sanitizeTsv = (val: string) => val.replace(/[\t\r\n]+/g, ' ').trim();
  const rows = [SHEET_HEADERS, ...leads.map(leadToRow)];
  return rows.map((row) => row.map(sanitizeTsv).join('\t')).join('\n');
}

export function isValidWebhookUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
