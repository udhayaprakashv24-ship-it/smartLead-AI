import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  GoogleGenAI,
  ThinkingLevel,
  Type,
  type Content,
  type FunctionDeclaration,
} from '@google/genai';
import { COURSES, FAQS } from './src/data/instituteData.ts';
import { validateEnquiryForm } from './src/utils/validation.ts';
import {
  formatLeadRef,
  inferLeadPriority,
  isValidWebhookUrl,
  matchKnownCourse,
  type AutomationSettings,
  type EnquiryNotification,
  type LeadPriority,
  type LeadRecord,
  type LeadSource,
  type LeadStatus,
  type SheetSyncStatus,
} from './src/utils/leads.ts';
import {
  formatLogLine,
  sanitizeLogMeta,
  sanitizeLogText,
  shouldIgnoreClientError,
  trimLogLines,
  type BackendLogEntry,
  type LogLevel,
} from './src/utils/logger.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(__dirname, '.data');
const STORE_PATH = path.resolve(DATA_DIR, 'smartlead-store.json');
const LOG_PATH = path.resolve(DATA_DIR, 'server.log');
const MAX_RING_LOGS = 250;
const MAX_LOG_FILE_BYTES = 512 * 1024;
const serverStartedAt = Date.now();
const recentLogs: BackendLogEntry[] = [];

function writeBackendLog(
  level: LogLevel,
  category: string,
  message: string,
  meta?: Record<string, unknown>
): void {
  const entry: BackendLogEntry = {
    timestamp: new Date().toISOString(),
    level,
    category,
    message: sanitizeLogText(message),
    meta: sanitizeLogMeta(meta),
  };

  recentLogs.unshift(entry);
  if (recentLogs.length > MAX_RING_LOGS) {
    recentLogs.length = MAX_RING_LOGS;
  }

  const line = formatLogLine(entry);
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(LOG_PATH) && fs.statSync(LOG_PATH).size > MAX_LOG_FILE_BYTES) {
      const existing = fs.readFileSync(LOG_PATH, 'utf-8');
      fs.writeFileSync(LOG_PATH, trimLogLines(existing, 800), 'utf-8');
    }
    fs.appendFileSync(LOG_PATH, `${line}\n`, 'utf-8');
  } catch (fsErr) {
    console.error('[LOGGER] Failed to write backend log file:', fsErr instanceof Error ? fsErr.message : String(fsErr));
  }
}

const logInfo = (category: string, message: string, meta?: Record<string, unknown>) =>
  writeBackendLog('info', category, message, meta);
const logWarn = (category: string, message: string, meta?: Record<string, unknown>) =>
  writeBackendLog('warn', category, message, meta);
const logError = (category: string, message: string, meta?: Record<string, unknown>) =>
  writeBackendLog('error', category, message, meta);

interface StoreState {
  nextSequence: number;
  leads: LeadRecord[];
  notifications: EnquiryNotification[];
  settings: AutomationSettings;
}

const VALID_COURSE_TITLES = COURSES.map((c) => c.title);

function createInitialStore(): StoreState {
  const now = Date.now();
  const iso = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();

  const seedLeads: LeadRecord[] = [
    {
      id: 'lead-seed-1',
      refCode: 'SL-1001',
      name: 'Maya Krishnan',
      email: 'maya.krishnan@example.com',
      phone: '+1 (415) 555-0148',
      course: 'Artificial Intelligence',
      goals: 'Transitioning from backend Python into LLM & RAG engineering in the next cohort.',
      source: 'AI Chatbot',
      status: 'New',
      priority: 'High',
      notes: 'Asked about PyTorch & RAG evaluation capstone.',
      sheetSyncStatus: 'Pending Export',
      createdAt: iso(35),
      updatedAt: iso(35),
    },
    {
      id: 'lead-seed-2',
      refCode: 'SL-1002',
      name: 'Daniel Brooks',
      email: 'd.brooks@example.com',
      phone: '+1 (650) 555-0182',
      course: 'Full Stack Development',
      goals: 'Looking for weekend live cohort with PostgreSQL & React code reviews.',
      source: 'Contact Form',
      status: 'Scheduled',
      priority: 'High',
      notes: '1-on-1 curriculum call booked for Thursday 5:00 PM PT.',
      sheetSyncStatus: 'Exported',
      createdAt: iso(190),
      updatedAt: iso(120),
    },
    {
      id: 'lead-seed-3',
      refCode: 'SL-1003',
      name: 'Sofia Alvarez',
      email: 'sofia.alvarez@example.com',
      phone: '+1 (312) 555-0119',
      course: 'Data Science',
      goals: 'Marketing analyst wanting stronger SQL window functions and churn prediction.',
      source: 'AI Chatbot',
      status: 'Contacted',
      priority: 'Medium',
      notes: 'Sent syllabus PDF and scholarship info.',
      sheetSyncStatus: 'Pending Export',
      createdAt: iso(420),
      updatedAt: iso(310),
    },
    {
      id: 'lead-seed-4',
      refCode: 'SL-1004',
      name: 'Ethan Park',
      email: 'ethan.park@example.com',
      phone: '+1 (206) 555-0194',
      course: 'Python Programming',
      goals: 'Starting from scratch; wants structured foundation before AI track.',
      source: 'Contact Form',
      status: 'Enrolled',
      priority: 'Standard',
      notes: 'Confirmed seat in Upcoming Foundation Cohort.',
      sheetSyncStatus: 'Exported',
      createdAt: iso(1440),
      updatedAt: iso(900),
    },
  ];

  const seedNotifications: EnquiryNotification[] = [
    {
      id: 'notif-seed-1',
      leadId: 'lead-seed-1',
      leadRef: 'SL-1001',
      title: 'New AI Chatbot Lead: Maya Krishnan',
      summary: 'Artificial Intelligence · High-intent career transition',
      course: 'Artificial Intelligence',
      source: 'AI Chatbot',
      priority: 'High',
      channels: ['In-App Alert'],
      read: false,
      createdAt: iso(35),
    },
    {
      id: 'notif-seed-2',
      leadId: 'lead-seed-2',
      leadRef: 'SL-1002',
      title: 'New Form Enquiry: Daniel Brooks',
      summary: 'Full Stack Development · Weekend cohort request',
      course: 'Full Stack Development',
      source: 'Contact Form',
      priority: 'High',
      channels: ['In-App Alert'],
      read: true,
      createdAt: iso(190),
    },
  ];

  return {
    nextSequence: 5,
    leads: seedLeads,
    notifications: seedNotifications,
    settings: {
      sheetsWebhookUrl: '',
      autoForwardToSheets: false,
      toastAlertsEnabled: true,
      soundAlertsEnabled: false,
    },
  };
}

function readStore(): StoreState {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      const initial = createInitialStore();
      writeStore(initial);
      return initial;
    }
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<StoreState>;
    if (!Array.isArray(parsed.leads) || !Array.isArray(parsed.notifications)) {
      logWarn('STORE', 'Invalid store format detected; resetting store to initial seed data');
      const initial = createInitialStore();
      writeStore(initial);
      return initial;
    }
    return {
      nextSequence: typeof parsed.nextSequence === 'number' ? parsed.nextSequence : parsed.leads.length + 1,
      leads: parsed.leads,
      notifications: parsed.notifications,
      settings: parsed.settings ?? createInitialStore().settings,
    };
  } catch (err) {
    logError('STORE', 'Failed to read store file; restoring initial seed data', {
      error: err instanceof Error ? err.message : String(err),
    });
    const initial = createInitialStore();
    writeStore(initial);
    return initial;
  }
}

function writeStore(state: StoreState): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(state, null, 2), 'utf-8');
}

const sseClients = new Set<Response>();

function broadcastNotificationEvent(eventName: string, payload: unknown): void {
  const data = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(data);
    } catch (err) {
      sseClients.delete(res);
      logWarn('SSE', 'Removed disconnected SSE client during broadcast', {
        eventName,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

async function dispatchSheetsWebhook(
  webhookUrl: string,
  lead: LeadRecord
): Promise<{ ok: boolean; detail: string }> {
  if (!isValidWebhookUrl(webhookUrl)) {
    logWarn('WEBHOOK', 'Skipped Google Sheets webhook due to invalid URL', { refCode: lead.refCode });
    return { ok: false, detail: 'Invalid webhook URL' };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) {
      logWarn('WEBHOOK', 'Google Sheets webhook returned non-OK status', {
        refCode: lead.refCode,
        status: response.status,
      });
      return { ok: false, detail: `HTTP ${response.status}` };
    }
    logInfo('WEBHOOK', 'Delivered lead to Google Sheets webhook', { refCode: lead.refCode });
    return { ok: true, detail: 'Delivered to Google Sheets webhook' };
  } catch (err) {
    clearTimeout(timer);
    const detail = err instanceof Error ? err.message : 'Webhook request failed';
    logError('WEBHOOK', 'Google Sheets webhook request failed', {
      refCode: lead.refCode,
      detail,
    });
    return {
      ok: false,
      detail,
    };
  }
}

async function createAndPersistLead(params: {
  name: string;
  email: string;
  phone: string;
  course: string;
  goals: string;
  source: LeadSource;
  priority?: LeadPriority;
}): Promise<{ lead: LeadRecord; notification: EnquiryNotification }> {
  const store = readStore();
  const seq = store.nextSequence;
  const nowIso = new Date().toISOString();
  const resolvedCourse = matchKnownCourse(params.course, VALID_COURSE_TITLES);
  const resolvedPriority = inferLeadPriority(params.goals, resolvedCourse, params.priority);

  const leadId = `lead-${Date.now()}-${seq}`;
  const refCode = formatLeadRef(seq);

  let sheetSyncStatus: SheetSyncStatus = 'Pending Export';
  const channels = ['In-App Alert'];

  const lead: LeadRecord = {
    id: leadId,
    refCode,
    name: params.name.trim(),
    email: params.email.trim(),
    phone: params.phone.trim() || 'Not provided',
    course: resolvedCourse,
    goals: params.goals.trim() || `Interested in ${resolvedCourse}`,
    source: params.source,
    status: 'New',
    priority: resolvedPriority,
    notes: '',
    sheetSyncStatus,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  if (store.settings.autoForwardToSheets && isValidWebhookUrl(store.settings.sheetsWebhookUrl)) {
    const webhookRes = await dispatchSheetsWebhook(store.settings.sheetsWebhookUrl, lead);
    lead.sheetSyncStatus = webhookRes.ok ? 'Webhook Sent' : 'Webhook Failed';
    channels.push(webhookRes.ok ? 'Google Sheets Webhook' : 'Google Sheets Webhook (Failed)');
  }

  const notification: EnquiryNotification = {
    id: `notif-${Date.now()}-${seq}`,
    leadId: lead.id,
    leadRef: lead.refCode,
    title:
      params.source === 'AI Chatbot'
        ? `New AI Chatbot Lead: ${lead.name}`
        : `New Form Enquiry: ${lead.name}`,
    summary: `${lead.course} · ${lead.priority} priority`,
    course: lead.course,
    source: lead.source,
    priority: lead.priority,
    channels,
    read: false,
    createdAt: nowIso,
  };

  store.nextSequence = seq + 1;
  store.leads.unshift(lead);
  store.notifications.unshift(notification);
  writeStore(store);

  logInfo('LEAD', 'Created and persisted new lead', {
    refCode: lead.refCode,
    source: lead.source,
    course: lead.course,
    priority: lead.priority,
    sheetSyncStatus: lead.sheetSyncStatus,
  });

  broadcastNotificationEvent('new_enquiry', { lead, notification });
  return { lead, notification };
}

function buildSystemInstruction(): string {
  const courseCatalog = COURSES.map(
    (c) =>
      `- ${c.title} (${c.categoryLabel}, ${c.duration}, ${c.level}, ${c.format}): ${c.shortDescription} Tools: ${c.tools.join(', ')}. Capstone: ${c.capstoneProject}. Roles: ${c.careerOutcomes.join(', ')}.`
  ).join('\n');

  const faqSummary = FAQS.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');

  return `You are the SmartLead AI Academic & Admissions Advisor on the SmartLead AI coaching institute website.

Your job:
1. Answer student questions clearly, accurately, and concisely using SmartLead AI's real curriculum, cohort structure, mentorship model (1:12 mentor-to-learner ratio, live evening/weekend sessions, HD recordings within 2 hours, weekly architectural code reviews, capstone evaluation & mock interviews), and admissions info (San Francisco & Live Online, admissions@smartleadai.edu, +1 (415) 890-4320).
2. Recommend the best matching course(s) based on the student's current background and career goals.
3. AUTOMATIC ENQUIRY COLLECTION: Whenever a student wants to enroll, book a curriculum consultation, request a syllabus follow-up, or shares their contact details (name, email, phone, preferred track, goals):
   - You MUST have at least their full name, a valid email address, and their target course before calling \`collect_course_enquiry\`.
   - If any of name, email, or preferred course is missing, politely ask for just the missing detail(s) (and optional phone number) in 1-2 short sentences.
   - As soon as you have their name, email, and course interest, immediately call the \`collect_course_enquiry\` tool with their extracted details so an advisor is notified and their enquiry is saved to the Lead Management Dashboard.
   - Never fabricate contact details that the student did not state.

SmartLead AI Course Catalog:
${courseCatalog}

Frequently Asked Questions:
${faqSummary}

Keep answers concise, encouraging, well-structured (short paragraphs or bullet points), and free of jargon or hype.`;
}

const collectCourseEnquiryTool: FunctionDeclaration = {
  name: 'collect_course_enquiry',
  description:
    'Save a prospective student course enquiry to the SmartLead AI Lead Management Dashboard and notify admissions counselors once the student has provided their name, email, and course of interest.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: 'The full name of the prospective student.',
      },
      email: {
        type: Type.STRING,
        description: 'A valid email address provided by the student.',
      },
      phone: {
        type: Type.STRING,
        description: 'Phone number provided by the student, or empty string if omitted.',
      },
      course: {
        type: Type.STRING,
        description:
          'Closest matching SmartLead AI course: Artificial Intelligence, Data Science, Web Development, Python Programming, Full Stack Development, or Digital Marketing.',
      },
      goals: {
        type: Type.STRING,
        description: 'Brief summary of the student background, questions, or career goals.',
      },
      priority: {
        type: Type.STRING,
        description: 'Lead urgency: High, Medium, or Standard.',
      },
    },
    required: ['name', 'email', 'course', 'goals'],
  },
};

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured on the server. Set GEMINI_API_KEY in your runtime Secrets or local .env file.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function parseGeminiError(err: unknown): { status: number; message: string; retryable: boolean } {
  const rawOriginal = err instanceof Error ? err.message : String(err ?? 'Unknown error');
  const rawMessage = sanitizeLogText(rawOriginal);
  let status = 500;
  let cleanMessage = rawMessage;

  const statusObj = err as { status?: unknown; code?: unknown } | null;
  if (typeof statusObj?.status === 'number') {
    status = statusObj.status;
  } else if (typeof statusObj?.code === 'number') {
    status = statusObj.code;
  }

  const jsonStart = rawMessage.indexOf('{');
  if (jsonStart !== -1) {
    try {
      const parsed = JSON.parse(rawMessage.slice(jsonStart)) as {
        error?: { code?: number; message?: string; status?: string };
      };
      if (parsed?.error) {
        if (typeof parsed.error.code === 'number') {
          status = parsed.error.code;
        }
        if (typeof parsed.error.message === 'string' && parsed.error.message.trim()) {
          cleanMessage = parsed.error.message.trim();
        }
      }
    } catch {
      // Keep original rawMessage if JSON slice is malformed
    }
  }

  const lower = `${rawMessage} ${cleanMessage}`.toLowerCase();
  const retryable =
    status === 429 ||
    status === 503 ||
    lower.includes('high demand') ||
    lower.includes('unavailable') ||
    lower.includes('resource_exhausted') ||
    lower.includes('rate limit') ||
    lower.includes('fetch failed') ||
    lower.includes('etimedout') ||
    lower.includes('econnreset');

  if (status === 503 || lower.includes('high demand') || lower.includes('unavailable')) {
    return {
      status: 503,
      message:
        'The AI Advisor is experiencing temporary high demand. Please retry in a moment or use the Enquiry Form below.',
      retryable: true,
    };
  }

  if (status === 429 || lower.includes('rate limit') || lower.includes('resource_exhausted')) {
    return {
      status: 429,
      message:
        'The AI Advisor is temporarily rate-limited. Please wait a few seconds and retry.',
      retryable: true,
    };
  }

  return {
    status: status >= 400 && status < 600 ? status : 500,
    message: cleanMessage || 'Unable to reach the AI Advisor right now.',
    retryable,
  };
}

async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: Parameters<GoogleGenAI['models']['generateContent']>[0],
  maxAttempts = 3
) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      lastError = err;
      const parsed = parseGeminiError(err);
      if (!parsed.retryable || attempt === maxAttempts) {
        throw err;
      }
      const delayMs = 700 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 200);
      logWarn('GEMINI', 'Retrying transient Gemini API failure', {
        attempt,
        maxAttempts,
        status: parsed.status,
        delayMs,
      });
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  app.use(express.json({ limit: '1mb' }));

  app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/notifications/stream') {
      next();
      return;
    }
    const start = Date.now();
    res.on('finish', () => {
      const durationMs = Date.now() - start;
      const meta = {
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs,
      };
      if (res.statusCode >= 500) {
        logError('API', `${req.method} ${req.originalUrl} -> ${res.statusCode}`, meta);
      } else if (res.statusCode >= 400) {
        logWarn('API', `${req.method} ${req.originalUrl} -> ${res.statusCode}`, meta);
      } else if (req.path !== '/logs/client-error') {
        logInfo('API', `${req.method} ${req.originalUrl} -> ${res.statusCode}`, meta);
      }
    });
    next();
  });

  app.get('/api/health', (_req: Request, res: Response) => {
    const key = process.env.GEMINI_API_KEY?.trim();
    res.json({
      ok: true,
      aiConfigured: Boolean(key && key !== 'MY_GEMINI_API_KEY'),
      uptimeSeconds: Math.floor((Date.now() - serverStartedAt) / 1000),
      recentLogCount: recentLogs.length,
    });
  });

  app.get('/api/logs', (req: Request, res: Response) => {
    const levelFilter = typeof req.query.level === 'string' ? req.query.level.toLowerCase() : '';
    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(1, Math.floor(requestedLimit)), MAX_RING_LOGS)
      : 50;

    const filtered =
      levelFilter === 'info' || levelFilter === 'warn' || levelFilter === 'error'
        ? recentLogs.filter((entry) => entry.level === levelFilter)
        : recentLogs;

    res.json({
      logs: filtered.slice(0, limit),
      totalBuffered: recentLogs.length,
    });
  });

  app.post('/api/logs/client-error', (req: Request, res: Response) => {
    const body = req.body ?? {};
    const message = String(body.message ?? '').trim();
    const errorType = String(body.type ?? 'runtime').trim();
    const source = typeof body.source === 'string' ? body.source : undefined;
    const stack = typeof body.stack === 'string' ? body.stack.slice(0, 600) : undefined;

    if (!message || shouldIgnoreClientError(message)) {
      res.status(204).end();
      return;
    }

    logError('CLIENT_ERROR', message, {
      type: errorType,
      ...(source ? { source } : {}),
      ...(stack ? { stack } : {}),
    });
    res.status(202).json({ logged: true });
  });

  app.get('/api/leads', (_req: Request, res: Response) => {
    const store = readStore();
    res.json({
      leads: store.leads,
      notifications: store.notifications,
      settings: store.settings,
    });
  });

  app.post('/api/enquiries', async (req: Request, res: Response) => {
    try {
      const body = req.body ?? {};
      const validation = validateEnquiryForm(
        {
          name: String(body.name ?? ''),
          email: String(body.email ?? ''),
          phone: String(body.phone ?? ''),
          course: String(body.course ?? ''),
          message: String(body.message ?? ''),
        },
        VALID_COURSE_TITLES
      );

      if (!validation.isValid) {
        logWarn('ENQUIRY', 'Rejected invalid enquiry submission', {
          fields: Object.keys(validation.errors),
        });
        res.status(400).json({ error: 'Validation failed', errors: validation.errors });
        return;
      }

      const result = await createAndPersistLead({
        name: validation.sanitized.name,
        email: validation.sanitized.email,
        phone: validation.sanitized.phone,
        course: validation.sanitized.course,
        goals: validation.sanitized.message,
        source: 'Contact Form',
      });

      res.status(201).json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to record enquiry';
      logError('ENQUIRY', 'Failed to record enquiry', { error: message });
      res.status(500).json({ error: message });
    }
  });

  app.patch('/api/leads/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const store = readStore();
    const index = store.leads.findIndex((l) => l.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    const current = store.leads[index];
    const body = req.body ?? {};
    const nextStatus: LeadStatus =
      body.status && ['New', 'Contacted', 'Scheduled', 'Enrolled', 'Archived'].includes(body.status)
        ? body.status
        : current.status;
    const nextPriority: LeadPriority =
      body.priority && ['High', 'Medium', 'Standard'].includes(body.priority)
        ? body.priority
        : current.priority;
    const nextSheetSync: SheetSyncStatus =
      body.sheetSyncStatus &&
      ['Pending Export', 'Exported', 'Webhook Sent', 'Webhook Failed'].includes(body.sheetSyncStatus)
        ? body.sheetSyncStatus
        : current.sheetSyncStatus;

    const updated: LeadRecord = {
      ...current,
      status: nextStatus,
      priority: nextPriority,
      notes: typeof body.notes === 'string' ? body.notes.slice(0, 1000) : current.notes,
      sheetSyncStatus: nextSheetSync,
      updatedAt: new Date().toISOString(),
    };

    store.leads[index] = updated;
    writeStore(store);
    logInfo('LEAD', 'Updated lead record', {
      refCode: updated.refCode,
      status: updated.status,
      priority: updated.priority,
      sheetSyncStatus: updated.sheetSyncStatus,
    });
    res.json({ lead: updated });
  });

  app.delete('/api/leads/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const store = readStore();
    const target = store.leads.find((l) => l.id === id);
    if (!target) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }
    store.leads = store.leads.filter((l) => l.id !== id);
    store.notifications = store.notifications.filter((n) => n.leadId !== id);
    writeStore(store);
    logInfo('LEAD', 'Deleted lead record', { id, refCode: target.refCode });
    res.json({ deletedId: id });
  });

  app.post('/api/leads/mark-exported', (req: Request, res: Response) => {
    const store = readStore();
    const ids: string[] | undefined = Array.isArray(req.body?.ids) ? req.body.ids : undefined;
    const nowIso = new Date().toISOString();
    store.leads = store.leads.map((lead) => {
      const shouldUpdate = ids ? ids.includes(lead.id) : lead.sheetSyncStatus === 'Pending Export';
      if (shouldUpdate && lead.sheetSyncStatus !== 'Webhook Sent') {
        return { ...lead, sheetSyncStatus: 'Exported', updatedAt: nowIso };
      }
      return lead;
    });
    writeStore(store);
    res.json({ leads: store.leads });
  });

  app.post('/api/notifications/mark-read', (req: Request, res: Response) => {
    const store = readStore();
    const notificationId = typeof req.body?.id === 'string' ? req.body.id : null;
    store.notifications = store.notifications.map((n) =>
      !notificationId || n.id === notificationId ? { ...n, read: true } : n
    );
    writeStore(store);
    res.json({ notifications: store.notifications });
  });

  app.put('/api/automation-settings', (req: Request, res: Response) => {
    const store = readStore();
    const body = req.body ?? {};
    const url = typeof body.sheetsWebhookUrl === 'string' ? body.sheetsWebhookUrl.trim() : '';
    if (url && !isValidWebhookUrl(url)) {
      res.status(400).json({ error: 'Webhook URL must start with https:// or http://' });
      return;
    }

    store.settings = {
      sheetsWebhookUrl: url,
      autoForwardToSheets: Boolean(body.autoForwardToSheets) && Boolean(url),
      toastAlertsEnabled:
        typeof body.toastAlertsEnabled === 'boolean'
          ? body.toastAlertsEnabled
          : store.settings.toastAlertsEnabled,
      soundAlertsEnabled:
        typeof body.soundAlertsEnabled === 'boolean'
          ? body.soundAlertsEnabled
          : store.settings.soundAlertsEnabled,
    };
    writeStore(store);
    logInfo('SETTINGS', 'Updated automation settings', {
      autoForwardToSheets: store.settings.autoForwardToSheets,
      toastAlertsEnabled: store.settings.toastAlertsEnabled,
      soundAlertsEnabled: store.settings.soundAlertsEnabled,
      hasWebhookUrl: Boolean(store.settings.sheetsWebhookUrl),
    });
    res.json({ settings: store.settings });
  });

  app.post('/api/automation-settings/test-webhook', async (req: Request, res: Response) => {
    const url = typeof req.body?.sheetsWebhookUrl === 'string' ? req.body.sheetsWebhookUrl.trim() : '';
    if (!isValidWebhookUrl(url)) {
      res.status(400).json({ error: 'Provide a valid https:// Google Apps Script webhook URL.' });
      return;
    }

    const testLead: LeadRecord = {
      id: 'lead-test',
      refCode: 'SL-TEST',
      name: 'SmartLead Test Student',
      email: 'test@smartleadai.edu',
      phone: '+1 (415) 555-0100',
      course: 'Artificial Intelligence',
      goals: 'Google Sheets webhook connectivity verification',
      source: 'AI Chatbot',
      status: 'New',
      priority: 'Standard',
      notes: 'Test ping',
      sheetSyncStatus: 'Webhook Sent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await dispatchSheetsWebhook(url, testLead);
    if (!result.ok) {
      res.status(502).json({ error: result.detail });
      return;
    }
    res.json({ ok: true, detail: result.detail });
  });

  app.get('/api/notifications/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    res.write(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);
    sseClients.add(res);
    logInfo('SSE', 'Notification stream client connected', { activeClients: sseClients.size });

    const heartbeat = setInterval(() => {
      try {
        res.write(': keep-alive\n\n');
      } catch {
        clearInterval(heartbeat);
        sseClients.delete(res);
      }
    }, 25_000);

    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
      logInfo('SSE', 'Notification stream client disconnected', { activeClients: sseClients.size });
    });
  });

  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const rawMessages: unknown[] = Array.isArray(req.body?.messages) ? req.body.messages : [];
      const sanitizedMessages = rawMessages
        .filter(
          (m): m is { role: 'user' | 'assistant'; text: string } =>
            Boolean(m) &&
            typeof m === 'object' &&
            ((m as { role?: unknown }).role === 'user' ||
              (m as { role?: unknown }).role === 'assistant') &&
            typeof (m as { text?: unknown }).text === 'string' &&
            (m as { text: string }).text.trim().length > 0
        )
        .slice(-16);

      if (sanitizedMessages.length === 0) {
        res.status(400).json({ error: 'Please enter a message to ask the SmartLead AI Advisor.' });
        return;
      }

      const ai = getGeminiClient();
      const contents: Content[] = sanitizedMessages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text }],
      }));

      const config = {
        systemInstruction: buildSystemInstruction(),
        tools: [{ functionDeclarations: [collectCourseEnquiryTool] }],
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      };

      const firstResponse = await generateContentWithRetry(ai, {
        model: 'gemini-4-hydrogen',
        contents,
        config,
      });

      const functionCalls = firstResponse.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        const enquiryCall = functionCalls.find((fc) => fc.name === 'collect_course_enquiry');
        const previousContent = firstResponse.candidates?.[0]?.content;

        if (enquiryCall && previousContent) {
          const args = (enquiryCall.args ?? {}) as Record<string, unknown>;
          const name = String(args.name ?? '').trim();
          const email = String(args.email ?? '').trim();
          const phone = String(args.phone ?? '').trim();
          const course = String(args.course ?? '').trim();
          const goals = String(args.goals ?? '').trim();
          const rawPriority = String(args.priority ?? '').trim();
          const priority =
            rawPriority === 'High' || rawPriority === 'Medium' || rawPriority === 'Standard'
              ? rawPriority
              : undefined;

          const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
          let toolResponsePayload: Record<string, unknown>;
          let capturedLead: LeadRecord | null = null;
          let notification: EnquiryNotification | null = null;

          if (name.length < 2 || !emailOk) {
            toolResponsePayload = {
              saved: false,
              reason:
                'Missing or invalid student name or email address. Ask the student for their full name and a valid email address.',
            };
          } else {
            const saved = await createAndPersistLead({
              name,
              email,
              phone,
              course,
              goals,
              source: 'AI Chatbot',
              priority,
            });
            capturedLead = saved.lead;
            notification = saved.notification;
            toolResponsePayload = {
              saved: true,
              refCode: saved.lead.refCode,
              course: saved.lead.course,
              status: saved.lead.status,
              sheetSyncStatus: saved.lead.sheetSyncStatus,
            };
          }

          const followUpResponse = await generateContentWithRetry(ai, {
            model: 'gemini-4-hydrogen',
            contents: [
              ...contents,
              previousContent,
              {
                role: 'user',
                parts: [
                  {
                    functionResponse: {
                      id: enquiryCall.id,
                      name: 'collect_course_enquiry',
                      response: toolResponsePayload,
                    },
                  },
                ],
              },
            ],
            config,
          });

          const replyText =
            followUpResponse.text?.trim() ||
            (capturedLead
              ? `Thank you, ${capturedLead.name}! Your enquiry (${capturedLead.refCode}) for ${capturedLead.course} has been saved and our admissions team has been notified.`
              : 'Could you share your full name and a valid email address so I can register your enquiry?');

          res.json({
            reply: replyText,
            capturedLead,
            notification,
          });
          return;
        }
      }

      const replyText =
        firstResponse.text?.trim() ||
        'I can help you compare SmartLead AI programs, prerequisites, schedules, and placement support. What would you like to know?';

      res.json({
        reply: replyText,
        capturedLead: null,
        notification: null,
      });
    } catch (err) {
      const parsed = parseGeminiError(err);
      logError('CHAT', 'Gemini request failed', {
        status: parsed.status,
        retryable: parsed.retryable,
        message: parsed.message,
      });
      res.status(parsed.status).json({ error: parsed.message });
    }
  });

  app.use('/api/*', (req: Request, res: Response) => {
    logWarn('API', 'Unmatched API endpoint requested', {
      method: req.method,
      path: req.originalUrl,
    });
    res.status(404).json({ error: 'API endpoint not found' });
  });

  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    const isJsonSyntaxError =
      err instanceof SyntaxError &&
      'status' in err &&
      (err as { status?: number }).status === 400;

    const status = isJsonSyntaxError
      ? 400
      : typeof (err as { status?: unknown })?.status === 'number'
        ? (err as { status: number }).status
        : 500;
    const rawMsg = isJsonSyntaxError
      ? 'Invalid JSON request payload'
      : err instanceof Error
        ? err.message
        : 'Unexpected backend error';
    const message = sanitizeLogText(rawMsg);
    logError('BACKEND_ERROR', `${req.method} ${req.originalUrl}`, {
      status,
      message,
      ...(err instanceof Error && err.stack ? { stack: err.stack.slice(0, 500) } : {}),
    });
    if (!res.headersSent) {
      res.status(status >= 400 && status < 600 ? status : 500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  httpServer.on('error', (err) => {
    logError('SERVER', 'HTTP server error', { error: err.message });
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    const key = process.env.GEMINI_API_KEY?.trim();
    logInfo('SERVER', `SmartLead AI server listening on http://0.0.0.0:${PORT}`, {
      port: PORT,
      env: process.env.NODE_ENV || 'development',
      aiConfigured: Boolean(key && key !== 'MY_GEMINI_API_KEY'),
      logFile: '.data/server.log',
    });
  });
}

process.on('unhandledRejection', (reason) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  logError('PROCESS', 'Unhandled promise rejection', { error: msg });
});

process.on('uncaughtException', (err) => {
  logError('PROCESS', 'Uncaught exception', {
    error: err.message,
    stack: err.stack?.slice(0, 500),
  });
});

startServer().catch((err) => {
  logError('SERVER', 'Failed to start SmartLead AI server', {
    error: err instanceof Error ? err.message : String(err),
  });
  process.exit(1);
});
