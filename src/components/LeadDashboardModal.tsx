import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  Bell,
  FileSpreadsheet,
  Users,
  CheckCircle2,
  Trash2,
  Download,
  Copy,
  Check,
  ExternalLink,
  Send,
  AlertCircle,
  Bot,
  FileText,
  Sparkles,
} from 'lucide-react';
import { COURSES } from '../data/instituteData';
import {
  computeLeadMetrics,
  filterLeads,
  GOOGLE_APPS_SCRIPT_SNIPPET,
  isValidWebhookUrl,
  LEAD_STATUSES,
  leadsToCsv,
  leadsToTsv,
  type AutomationSettings,
  type EnquiryNotification,
  type LeadPriority,
  type LeadRecord,
  type LeadSource,
  type LeadStatus,
} from '../utils/leads';
import { EASE_OUT_EXPO } from '../utils/motion';

export type DashboardTab = 'leads' | 'notifications' | 'sheets';

interface LeadDashboardModalProps {
  isOpen: boolean;
  initialTab?: DashboardTab;
  leads: LeadRecord[];
  notifications: EnquiryNotification[];
  settings: AutomationSettings;
  onClose: () => void;
  onUpdateLead: (
    id: string,
    patch: Partial<Pick<LeadRecord, 'status' | 'priority' | 'notes' | 'sheetSyncStatus'>>
  ) => Promise<void>;
  onDeleteLead: (id: string) => Promise<void>;
  onMarkNotificationsRead: (id?: string) => Promise<void>;
  onMarkLeadsExported: (ids?: string[]) => Promise<void>;
  onSaveSettings: (next: AutomationSettings) => Promise<void>;
}

const STATUS_STYLES: Record<LeadStatus, string> = {
  New: 'bg-blue-50 text-[#2563EB] border-blue-200',
  Contacted: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  Scheduled: 'bg-amber-50 text-amber-800 border-amber-200',
  Enrolled: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Archived: 'bg-slate-100 text-slate-600 border-slate-200',
};

const PRIORITY_STYLES: Record<LeadPriority, string> = {
  High: 'text-red-700 bg-red-50 border-red-200',
  Medium: 'text-amber-700 bg-amber-50 border-amber-200',
  Standard: 'text-slate-600 bg-slate-100 border-slate-200',
};

function formatShortDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function LeadDashboardModal({
  isOpen,
  initialTab = 'leads',
  leads,
  notifications,
  settings,
  onClose,
  onUpdateLead,
  onDeleteLead,
  onMarkNotificationsRead,
  onMarkLeadsExported,
  onSaveSettings,
}: LeadDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'All'>('All');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'All'>('All');
  const [courseFilter, setCourseFilter] = useState<string>('All');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(leads[0]?.id ?? null);
  const [notesDraft, setNotesDraft] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [savingLeadId, setSavingLeadId] = useState<string | null>(null);

  // Google Sheets & Automation states
  const [copiedType, setCopiedType] = useState<'tsv' | 'script' | null>(null);
  const [showScriptGuide, setShowScriptGuide] = useState(false);
  const [webhookInput, setWebhookInput] = useState(settings.sheetsWebhookUrl);
  const [autoForwardInput, setAutoForwardInput] = useState(settings.autoForwardToSheets);
  const [toastAlertsInput, setToastAlertsInput] = useState(settings.toastAlertsEnabled);
  const [soundAlertsInput, setSoundAlertsInput] = useState(settings.soundAlertsEnabled);
  const [settingsFeedback, setSettingsFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [testingWebhook, setTestingWebhook] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    setWebhookInput(settings.sheetsWebhookUrl);
    setAutoForwardInput(settings.autoForwardToSheets);
    setToastAlertsInput(settings.toastAlertsEnabled);
    setSoundAlertsInput(settings.soundAlertsEnabled);
  }, [settings]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const metrics = useMemo(() => computeLeadMetrics(leads, notifications), [leads, notifications]);

  const filteredLeads = useMemo(
    () =>
      filterLeads(leads, {
        query: searchQuery,
        status: statusFilter,
        source: sourceFilter,
        course: courseFilter,
      }),
    [leads, searchQuery, statusFilter, sourceFilter, courseFilter]
  );

  const selectedLead = useMemo(() => {
    return (
      filteredLeads.find((l) => l.id === selectedLeadId) ??
      leads.find((l) => l.id === selectedLeadId) ??
      filteredLeads[0] ??
      null
    );
  }, [filteredLeads, leads, selectedLeadId]);

  useEffect(() => {
    if (selectedLead) {
      setNotesDraft(selectedLead.notes);
      setConfirmDeleteId(null);
    }
  }, [selectedLead?.id, selectedLead?.notes]);

  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    setSavingLeadId(selectedLead.id);
    try {
      await onUpdateLead(selectedLead.id, { notes: notesDraft });
    } finally {
      setSavingLeadId(null);
    }
  };

  const handleDownloadCsv = async () => {
    const targetLeads = filteredLeads.length > 0 ? filteredLeads : leads;
    const csv = leadsToCsv(targetLeads);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `smartlead-ai-enquiries-${dateStamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    await onMarkLeadsExported(targetLeads.map((l) => l.id));
  };

  const handleCopyTsv = async () => {
    const targetLeads = filteredLeads.length > 0 ? filteredLeads : leads;
    const tsv = leadsToTsv(targetLeads);
    await navigator.clipboard.writeText(tsv);
    setCopiedType('tsv');
    await onMarkLeadsExported(targetLeads.map((l) => l.id));
    window.setTimeout(() => setCopiedType(null), 2200);
  };

  const handleCopyScript = async () => {
    await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_SNIPPET);
    setCopiedType('script');
    window.setTimeout(() => setCopiedType(null), 2200);
  };

  const handleSaveAutomationSettings = async (overrideToast?: boolean, overrideSound?: boolean) => {
    setSettingsFeedback(null);
    const trimmedUrl = webhookInput.trim();
    if (trimmedUrl && !isValidWebhookUrl(trimmedUrl)) {
      setSettingsFeedback({
        type: 'error',
        text: 'Webhook URL must start with https:// or http://',
      });
      return;
    }
    try {
      await onSaveSettings({
        sheetsWebhookUrl: trimmedUrl,
        autoForwardToSheets: autoForwardInput && Boolean(trimmedUrl),
        toastAlertsEnabled: overrideToast ?? toastAlertsInput,
        soundAlertsEnabled: overrideSound ?? soundAlertsInput,
      });
      setSettingsFeedback({
        type: 'success',
        text: 'Automation & Google Sheets sync preferences saved.',
      });
    } catch (err) {
      setSettingsFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to save settings.',
      });
    }
  };

  const handleTestWebhook = async () => {
    setSettingsFeedback(null);
    if (!isValidWebhookUrl(webhookInput)) {
      setSettingsFeedback({
        type: 'error',
        text: 'Enter a valid Google Apps Script Web App URL before testing.',
      });
      return;
    }
    setTestingWebhook(true);
    try {
      const response = await fetch('/api/automation-settings/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetsWebhookUrl: webhookInput.trim() }),
      });
      const data = (await response.json()) as { detail?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Webhook test failed');
      }
      setSettingsFeedback({
        type: 'success',
        text: data.detail || 'Test row delivered to your Google Sheets webhook.',
      });
    } catch (err) {
      setSettingsFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Webhook test failed.',
      });
    } finally {
      setTestingWebhook(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/75 p-3 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-dashboard-title"
            initial={{ y: 18, scale: 0.985 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 12, scale: 0.985 }}
            transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
            onClick={(e) => e.stopPropagation()}
            className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            {/* Top Workspace Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-[#101828] px-5 py-4 text-white sm:px-7">
              <div>
                <p className="text-xs font-semibold tracking-wide text-[#06B6D4]">
                  SmartLead AI Admissions Workspace
                </p>
                <h2
                  id="lead-dashboard-title"
                  className="mt-0.5 font-display text-xl font-bold text-white sm:text-2xl"
                >
                  Lead Management &amp; Automation Dashboard
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleDownloadCsv()}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/20 cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4 text-[#06B6D4]" aria-hidden="true" />
                  <span>Export CSV for Google Sheets</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close Lead Management Dashboard"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-300 transition-colors hover:bg-white/15 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* KPI Summary Bar */}
            <div className="grid grid-cols-2 gap-3 border-b border-slate-200 bg-[#F4F8FF] px-5 py-3.5 sm:grid-cols-4 sm:px-7">
              <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-2.5">
                <p className="text-[11px] font-semibold text-slate-500">Total Enquiries</p>
                <p className="mt-0.5 font-mono text-2xl font-bold tabular-nums text-[#101828]">
                  {metrics.total}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-2.5">
                <p className="text-[11px] font-semibold text-slate-500">New Uncontacted</p>
                <p className="mt-0.5 font-mono text-2xl font-bold tabular-nums text-[#2563EB]">
                  {metrics.newCount}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-2.5">
                <p className="text-[11px] font-semibold text-slate-500">AI Chatbot Leads</p>
                <p className="mt-0.5 font-mono text-2xl font-bold tabular-nums text-[#06B6D4]">
                  {metrics.aiCaptured}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-2.5">
                <p className="text-[11px] font-semibold text-slate-500">Scheduled / Enrolled</p>
                <p className="mt-0.5 font-mono text-2xl font-bold tabular-nums text-emerald-600">
                  {metrics.scheduledOrEnrolled}
                </p>
              </div>
            </div>

            {/* Workspace Sub-Navigation Tabs */}
            <div
              role="tablist"
              aria-label="Dashboard Views"
              className="flex items-center gap-2 border-b border-slate-200 bg-white px-5 py-2.5 sm:px-7"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'leads'}
                onClick={() => setActiveTab('leads')}
                className={`inline-flex min-h-[38px] items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'leads'
                    ? 'bg-[#101828] text-white'
                    : 'text-[#1E293B] hover:bg-[#F4F8FF]'
                }`}
              >
                <Users className="h-4 w-4" aria-hidden="true" />
                <span>Lead Pipeline</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'notifications'}
                onClick={() => setActiveTab('notifications')}
                className={`inline-flex min-h-[38px] items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'notifications'
                    ? 'bg-[#101828] text-white'
                    : 'text-[#1E293B] hover:bg-[#F4F8FF]'
                }`}
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
                <span>Automated Notifications</span>
                {metrics.unreadAlerts > 0 && (
                  <span className="rounded-md bg-[#2563EB] px-1.5 py-0.5 font-mono text-[11px] font-bold tabular-nums text-white">
                    {metrics.unreadAlerts}
                  </span>
                )}
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'sheets'}
                onClick={() => setActiveTab('sheets')}
                className={`inline-flex min-h-[38px] items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'sheets'
                    ? 'bg-[#101828] text-white'
                    : 'text-[#1E293B] hover:bg-[#F4F8FF]'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
                <span>Google Sheets Sync</span>
                {metrics.pendingSheetSync > 0 && (
                  <span className="rounded-md bg-amber-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-amber-800">
                    {metrics.pendingSheetSync} pending
                  </span>
                )}
              </button>
            </div>

            {/* Active Workspace Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7">
              {activeTab === 'leads' && (
                <div className="space-y-5">
                  {/* Search & Filter Controls */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
                    <div className="relative lg:col-span-5">
                      <Search
                        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                        aria-hidden="true"
                      />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by student, ref ID, email, or notes..."
                        aria-label="Search leads"
                        className="min-h-[42px] w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm text-[#101828] placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25"
                      />
                    </div>

                    <select
                      aria-label="Filter by lead status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'All')}
                      className="min-h-[42px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[#101828] focus:border-[#2563EB] focus:outline-none lg:col-span-2"
                    >
                      <option value="All">All Statuses</option>
                      {LEAD_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <select
                      aria-label="Filter by lead source"
                      value={sourceFilter}
                      onChange={(e) => setSourceFilter(e.target.value as LeadSource | 'All')}
                      className="min-h-[42px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[#101828] focus:border-[#2563EB] focus:outline-none lg:col-span-2"
                    >
                      <option value="All">All Sources</option>
                      <option value="AI Chatbot">AI Chatbot</option>
                      <option value="Contact Form">Contact Form</option>
                    </select>

                    <select
                      aria-label="Filter by course interest"
                      value={courseFilter}
                      onChange={(e) => setCourseFilter(e.target.value)}
                      className="min-h-[42px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[#101828] focus:border-[#2563EB] focus:outline-none lg:col-span-3"
                    >
                      <option value="All">All Courses</option>
                      {COURSES.map((c) => (
                        <option key={c.id} value={c.title}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Master-Detail Lead Workspace */}
                  {filteredLeads.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-[#F4F8FF]/50 p-10 text-center">
                      <p className="font-display text-base font-bold text-[#101828]">
                        No matching enquiries found
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Try clearing filters or ask the SmartLead AI Advisor to capture a new
                        student enquiry.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                      {/* Lead List */}
                      <div className="space-y-2.5 lg:col-span-7">
                        {filteredLeads.map((lead) => {
                          const isSelected = selectedLead?.id === lead.id;
                          return (
                            <button
                              key={lead.id}
                              type="button"
                              onClick={() => setSelectedLeadId(lead.id)}
                              className={`w-full rounded-xl border p-4 text-left transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-[#2563EB] bg-[#F4F8FF]/70 shadow-xs'
                                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                              }`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-semibold text-[#2563EB]">
                                    {lead.refCode}
                                  </span>
                                  <span className="font-display text-base font-bold text-[#101828]">
                                    {lead.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[lead.status]}`}
                                  >
                                    {lead.status}
                                  </span>
                                  <span
                                    className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_STYLES[lead.priority]}`}
                                  >
                                    {lead.priority}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                                <span className="font-semibold text-[#101828]">{lead.course}</span>
                                <span aria-hidden="true">·</span>
                                <span className="inline-flex items-center gap-1">
                                  {lead.source === 'AI Chatbot' ? (
                                    <Bot className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
                                  ) : (
                                    <FileText className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                                  )}
                                  <span>{lead.source}</span>
                                </span>
                                <span aria-hidden="true">·</span>
                                <span>{formatShortDate(lead.createdAt)}</span>
                              </div>

                              <p className="mt-2 line-clamp-1 text-xs text-slate-600">
                                {lead.goals}
                              </p>
                            </button>
                          );
                        })}
                      </div>

                      {/* Lead Detail Inspector */}
                      {selectedLead && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-5">
                          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                            <div>
                              <p className="font-mono text-xs font-semibold text-[#2563EB]">
                                {selectedLead.refCode} · {selectedLead.source}
                              </p>
                              <h3 className="mt-1 font-display text-xl font-bold text-[#101828]">
                                {selectedLead.name}
                              </h3>
                              <p className="mt-0.5 text-sm text-slate-600">{selectedLead.email}</p>
                              <p className="font-mono text-xs text-slate-500">
                                {selectedLead.phone}
                              </p>
                            </div>
                            <span className="rounded-md bg-[#F4F8FF] px-2.5 py-1 text-xs font-semibold text-[#2563EB]">
                              {selectedLead.sheetSyncStatus}
                            </span>
                          </div>

                          <div className="mt-4 space-y-4">
                            <div>
                              <p className="text-xs font-semibold text-slate-500">
                                Course &amp; Learning Goals
                              </p>
                              <p className="mt-1 text-sm font-semibold text-[#101828]">
                                {selectedLead.course}
                              </p>
                              <p className="mt-1 rounded-xl bg-[#F4F8FF] p-3 text-xs leading-relaxed text-[#1E293B]">
                                {selectedLead.goals}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label
                                  htmlFor="inspector-status"
                                  className="block text-xs font-semibold text-slate-500"
                                >
                                  Pipeline Status
                                </label>
                                <select
                                  id="inspector-status"
                                  value={selectedLead.status}
                                  onChange={(e) =>
                                    void onUpdateLead(selectedLead.id, {
                                      status: e.target.value as LeadStatus,
                                    })
                                  }
                                  className="mt-1 min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium text-[#101828] focus:border-[#2563EB] focus:outline-none"
                                >
                                  {LEAD_STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label
                                  htmlFor="inspector-priority"
                                  className="block text-xs font-semibold text-slate-500"
                                >
                                  Lead Priority
                                </label>
                                <select
                                  id="inspector-priority"
                                  value={selectedLead.priority}
                                  onChange={(e) =>
                                    void onUpdateLead(selectedLead.id, {
                                      priority: e.target.value as LeadPriority,
                                    })
                                  }
                                  className="mt-1 min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium text-[#101828] focus:border-[#2563EB] focus:outline-none"
                                >
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Standard">Standard</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label
                                htmlFor="inspector-notes"
                                className="block text-xs font-semibold text-slate-500"
                              >
                                Counselor Follow-Up Notes
                              </label>
                              <textarea
                                id="inspector-notes"
                                rows={3}
                                value={notesDraft}
                                onChange={(e) => setNotesDraft(e.target.value)}
                                placeholder="Log call outcomes, scholarship eligibility, or next follow-up date..."
                                className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-[#101828] placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none"
                              />
                              <div className="mt-2 flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => void handleSaveNotes()}
                                  disabled={savingLeadId === selectedLead.id}
                                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#2563EB] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1D4ED8] cursor-pointer"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span>
                                    {savingLeadId === selectedLead.id ? 'Saving...' : 'Save Notes'}
                                  </span>
                                </button>

                                {confirmDeleteId === selectedLead.id ? (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => void onDeleteLead(selectedLead.id)}
                                      className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer"
                                    >
                                      Confirm Delete
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(selectedLead.id)}
                                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span>Delete</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-[#F4F8FF] p-5">
                    <div>
                      <h3 className="font-display text-base font-bold text-[#101828]">
                        Automated Enquiry Alert Rules
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-600">
                        Instant notifications trigger whenever the AI Chatbot or Contact Form
                        records a student enquiry.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#101828] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={toastAlertsInput}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setToastAlertsInput(checked);
                            void handleSaveAutomationSettings(checked, undefined);
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-[#2563EB]"
                        />
                        <span>Live Toast Banners</span>
                      </label>

                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#101828] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={soundAlertsInput}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSoundAlertsInput(checked);
                            void handleSaveAutomationSettings(undefined, checked);
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-[#2563EB]"
                        />
                        <span>Audio Chime Alert</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => void onMarkNotificationsRead()}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#101828] hover:border-[#2563EB] hover:text-[#2563EB] cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Mark All Read</span>
                      </button>
                    </div>
                  </div>

                  {notifications.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600">
                      No enquiry notifications recorded yet.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`flex flex-wrap items-center justify-between gap-4 p-4 sm:px-6 ${
                            !notif.read ? 'bg-[#F4F8FF]/65' : ''
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {!notif.read && (
                                <span className="h-2 w-2 rounded-full bg-[#2563EB]" aria-label="Unread" />
                              )}
                              <span className="font-mono text-xs font-semibold text-[#2563EB]">
                                {notif.leadRef}
                              </span>
                              <p className="font-display text-sm font-bold text-[#101828]">
                                {notif.title}
                              </p>
                              <span
                                className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_STYLES[notif.priority]}`}
                              >
                                {notif.priority}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">
                              {notif.summary} · Channels: {notif.channels.join(', ')} ·{' '}
                              {formatShortDate(notif.createdAt)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLeadId(notif.leadId);
                                setActiveTab('leads');
                                if (!notif.read) {
                                  void onMarkNotificationsRead(notif.id);
                                }
                              }}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#101828] hover:border-[#2563EB] hover:text-[#2563EB] cursor-pointer"
                            >
                              Inspect Lead
                            </button>
                            {!notif.read && (
                              <button
                                type="button"
                                onClick={() => void onMarkNotificationsRead(notif.id)}
                                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#2563EB] hover:bg-blue-50 cursor-pointer"
                              >
                                Mark Read
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'sheets' && (
                <div className="space-y-6">
                  {/* Direct Zero-Permission Google Sheets Export Cards */}
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                      <div className="flex items-center gap-2.5 text-[#2563EB]">
                        <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
                        <h3 className="font-display text-lg font-bold text-[#101828]">
                          Instant Google Sheets Export
                        </h3>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Export all student enquiries directly into Google Sheets with zero API keys
                        or permission prompts—either download a formatted CSV or copy rows to paste
                        straight into a new sheet.
                      </p>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => void handleDownloadCsv()}
                          className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] cursor-pointer"
                        >
                          <Download className="h-4 w-4" aria-hidden="true" />
                          <span>Download Google Sheets CSV</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleCopyTsv()}
                          className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-[#101828] hover:border-[#2563EB] hover:text-[#2563EB] cursor-pointer"
                        >
                          {copiedType === 'tsv' ? (
                            <>
                              <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                              <span>Copied for Google Sheets!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" aria-hidden="true" />
                              <span>Copy Rows (Paste into Sheet)</span>
                            </>
                          )}
                        </button>

                        <a
                          href="https://sheets.new"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[42px] items-center gap-1.5 rounded-lg border border-slate-200 bg-[#F4F8FF] px-3.5 py-2 text-xs font-semibold text-[#2563EB] hover:bg-blue-100/70"
                        >
                          <span>Open New Google Sheet</span>
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      </div>
                    </div>

                    {/* Optional Automated Apps Script Webhook Sync */}
                    <div className="rounded-2xl border border-slate-200 bg-[#F4F8FF]/60 p-6">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-[#101828]">
                          <Sparkles className="h-5 w-5 text-[#06B6D4]" aria-hidden="true" />
                          <h3 className="font-display text-lg font-bold">
                            Automated Google Apps Script Sync
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowScriptGuide((prev) => !prev)}
                          className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
                        >
                          {showScriptGuide ? 'Hide Script' : 'View Apps Script'}
                        </button>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                        Optional: Paste a Google Apps Script Web App URL from your sheet&apos;s{' '}
                        <strong>Extensions → Apps Script</strong> menu to auto-append new leads in
                        real time without OAuth setup.
                      </p>

                      <div className="mt-4 space-y-3">
                        <input
                          type="url"
                          value={webhookInput}
                          onChange={(e) => setWebhookInput(e.target.value)}
                          placeholder="https://script.google.com/macros/s/.../exec"
                          aria-label="Google Apps Script Web App URL"
                          className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-[#101828] placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none"
                        />

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#101828] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={autoForwardInput}
                              onChange={(e) => setAutoForwardInput(e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-[#2563EB]"
                            />
                            <span>Auto-sync new enquiries</span>
                          </label>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => void handleTestWebhook()}
                              disabled={testingWebhook || !webhookInput.trim()}
                              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#101828] hover:border-[#2563EB] disabled:opacity-50 cursor-pointer"
                            >
                              <Send className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>{testingWebhook ? 'Testing...' : 'Test'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleSaveAutomationSettings()}
                              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-[#101828] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1E293B] cursor-pointer"
                            >
                              <span>Save Sync</span>
                            </button>
                          </div>
                        </div>

                        {settingsFeedback && (
                          <div
                            role="status"
                            className={`flex items-center gap-2 rounded-lg p-2.5 text-xs font-medium ${
                              settingsFeedback.type === 'success'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {settingsFeedback.type === 'success' ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                            ) : (
                              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                            )}
                            <span>{settingsFeedback.text}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {showScriptGuide && (
                    <div className="rounded-2xl border border-slate-200 bg-[#101828] p-5 text-white">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-display text-sm font-bold">
                          Google Apps Script Receiver (Extensions → Apps Script → Deploy as Web App)
                        </p>
                        <button
                          type="button"
                          onClick={() => void handleCopyScript()}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 cursor-pointer"
                        >
                          {copiedType === 'script' ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-[#06B6D4]" aria-hidden="true" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Copy Script</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="mt-3 overflow-x-auto rounded-xl bg-black/30 p-3 font-mono text-xs leading-relaxed text-slate-200">
                        {GOOGLE_APPS_SCRIPT_SNIPPET}
                      </pre>
                    </div>
                  )}

                  {/* Sheet Column Preview Table */}
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
                      <h4 className="font-display text-sm font-bold text-[#101828]">
                        Google Sheets Row Preview ({leads.length} records)
                      </h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                        <thead className="bg-[#F4F8FF] font-semibold text-[#101828]">
                          <tr>
                            <th className="px-4 py-2.5">Lead Ref</th>
                            <th className="px-4 py-2.5">Student Name</th>
                            <th className="px-4 py-2.5">Email</th>
                            <th className="px-4 py-2.5">Course</th>
                            <th className="px-4 py-2.5">Source</th>
                            <th className="px-4 py-2.5">Status</th>
                            <th className="px-4 py-2.5">Sheet Sync</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-slate-50">
                              <td className="px-4 py-2.5 font-mono font-semibold text-[#2563EB]">
                                {lead.refCode}
                              </td>
                              <td className="px-4 py-2.5 font-medium text-[#101828]">
                                {lead.name}
                              </td>
                              <td className="px-4 py-2.5 text-slate-600">{lead.email}</td>
                              <td className="px-4 py-2.5 text-[#101828]">{lead.course}</td>
                              <td className="px-4 py-2.5 text-slate-600">{lead.source}</td>
                              <td className="px-4 py-2.5">{lead.status}</td>
                              <td className="px-4 py-2.5 font-medium text-[#2563EB]">
                                {lead.sheetSyncStatus}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
