import { useRef, useState, useEffect, useCallback } from 'react';
import { MotionConfig, motion, AnimatePresence } from 'motion/react';
import { Bell, X, ArrowUpRight } from 'lucide-react';
import { COURSES, type CourseItem } from './data/instituteData';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CoursesSection } from './components/CoursesSection';
import { AboutSection } from './components/AboutSection';
import { AchievementsSection } from './components/AchievementsSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { WhyChooseUsSection } from './components/WhyChooseUsSection';
import { FaqSection } from './components/FaqSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { CourseModal } from './components/CourseModal';
import { AiChatbotWidget } from './components/AiChatbotWidget';
import { LeadDashboardModal, type DashboardTab } from './components/LeadDashboardModal';
import type {
  AutomationSettings,
  EnquiryNotification,
  LeadRecord,
} from './utils/leads';
import { EASE_OUT_EXPO } from './utils/motion';

function playSubtleChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // Ignore audio context restrictions before user gesture
  }
}

export default function App() {
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [enquiredCourseTitle, setEnquiredCourseTitle] = useState<string>(COURSES[0].title);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [notifications, setNotifications] = useState<EnquiryNotification[]>([]);
  const [settings, setSettings] = useState<AutomationSettings>({
    sheetsWebhookUrl: '',
    autoForwardToSheets: false,
    toastAlertsEnabled: true,
    soundAlertsEnabled: false,
  });

  const [chatOpen, setChatOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('leads');
  const [activeToast, setActiveToast] = useState<EnquiryNotification | null>(null);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const mergeIncomingLead = useCallback(
    (lead: LeadRecord, notification: EnquiryNotification | null) => {
      setLeads((prev) => {
        if (prev.some((l) => l.id === lead.id)) return prev;
        return [lead, ...prev];
      });
      if (notification) {
        let isNew = false;
        setNotifications((prev) => {
          if (prev.some((n) => n.id === notification.id)) return prev;
          isNew = true;
          return [notification, ...prev];
        });
        if (isNew || !notifications.some((n) => n.id === notification.id)) {
          if (settingsRef.current.toastAlertsEnabled) {
            setActiveToast(notification);
          }
          if (settingsRef.current.soundAlertsEnabled) {
            playSubtleChime();
          }
        }
      }
    },
    [notifications]
  );

  useEffect(() => {
    let active = true;
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data: { leads?: LeadRecord[]; notifications?: EnquiryNotification[]; settings?: AutomationSettings }) => {
        if (!active) return;
        if (Array.isArray(data.leads)) setLeads(data.leads);
        if (Array.isArray(data.notifications)) setNotifications(data.notifications);
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => {
        // Keep initial empty state if offline
      });

    const eventSource = new EventSource('/api/notifications/stream');
    eventSource.addEventListener('new_enquiry', (event) => {
      try {
        const parsed = JSON.parse((event as MessageEvent).data) as {
          lead?: LeadRecord;
          notification?: EnquiryNotification | null;
        };
        if (parsed.lead) {
          mergeIncomingLead(parsed.lead, parsed.notification ?? null);
        }
      } catch {
        // Ignore malformed SSE payload
      }
    });

    return () => {
      active = false;
      eventSource.close();
    };
  }, [mergeIncomingLead]);

  useEffect(() => {
    if (!activeToast) return;
    const timer = window.setTimeout(() => {
      setActiveToast(null);
    }, 6500);
    return () => window.clearTimeout(timer);
  }, [activeToast]);

  const scrollToSection = (selector: string, focusContactInput = false) => {
    const target = document.querySelector(selector);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      if (focusContactInput) {
        window.setTimeout(() => {
          nameInputRef.current?.focus({ preventScroll: true });
        }, 420);
      }
    }
  };

  const handleEnquireCourse = (courseTitle: string) => {
    setEnquiredCourseTitle(courseTitle);
    setSelectedCourse(null);
    scrollToSection('#contact', true);
  };

  const handleOpenCourseByTitle = (courseTitle: string) => {
    const match = COURSES.find((c) => c.title === courseTitle);
    if (match) {
      setSelectedCourse(match);
    } else {
      scrollToSection('#courses');
    }
  };

  const handleUpdateLead = async (
    id: string,
    patch: Partial<Pick<LeadRecord, 'status' | 'priority' | 'notes' | 'sheetSyncStatus'>>
  ) => {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const data = (await res.json()) as { lead: LeadRecord };
      setLeads((prev) => prev.map((l) => (l.id === id ? data.lead : l)));
    }
  };

  const handleDeleteLead = async (id: string) => {
    const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setNotifications((prev) => prev.filter((n) => n.leadId !== id));
    }
  };

  const handleMarkNotificationsRead = async (id?: string) => {
    const res = await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      const data = (await res.json()) as { notifications: EnquiryNotification[] };
      setNotifications(data.notifications);
    }
  };

  const handleMarkLeadsExported = async (ids?: string[]) => {
    const res = await fetch('/api/leads/mark-exported', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (res.ok) {
      const data = (await res.json()) as { leads: LeadRecord[] };
      setLeads(data.leads);
    }
  };

  const handleSaveSettings = async (next: AutomationSettings) => {
    const res = await fetch('/api/automation-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    });
    const data = (await res.json()) as { settings?: AutomationSettings; error?: string };
    if (!res.ok || !data.settings) {
      throw new Error(data.error || 'Failed to save automation settings');
    }
    setSettings(data.settings);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-white text-[#1E293B]">
        <Navbar
          onGetStarted={() => scrollToSection('#contact', true)}
          onOpenLeadDashboard={() => {
            setDashboardTab('leads');
            setDashboardOpen(true);
          }}
          unreadNotifications={unreadCount}
        />

        <main>
          <HeroSection
            onExploreCourses={() => scrollToSection('#courses')}
            onEnquireNow={() => scrollToSection('#contact', true)}
            onOpenAiAdvisor={() => setChatOpen(true)}
          />

          <CoursesSection onSelectCourse={(course) => setSelectedCourse(course)} />

          <AboutSection />

          <AchievementsSection />

          <TestimonialsSection onExploreCourse={handleOpenCourseByTitle} />

          <WhyChooseUsSection />

          <FaqSection />

          <ContactSection
            preselectedCourse={enquiredCourseTitle}
            nameInputRef={nameInputRef}
            onLeadCreated={mergeIncomingLead}
          />
        </main>

        <Footer />

        <CourseModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onEnquireCourse={handleEnquireCourse}
        />

        <AiChatbotWidget
          isOpen={chatOpen}
          onOpenChange={setChatOpen}
          onLeadCaptured={mergeIncomingLead}
          onOpenLeadDashboard={() => {
            setDashboardTab('leads');
            setDashboardOpen(true);
          }}
        />

        <LeadDashboardModal
          isOpen={dashboardOpen}
          initialTab={dashboardTab}
          leads={leads}
          notifications={notifications}
          settings={settings}
          onClose={() => setDashboardOpen(false)}
          onUpdateLead={handleUpdateLead}
          onDeleteLead={handleDeleteLead}
          onMarkNotificationsRead={handleMarkNotificationsRead}
          onMarkLeadsExported={handleMarkLeadsExported}
          onSaveSettings={handleSaveSettings}
        />

        {/* Automated Enquiry Notification Toast */}
        <AnimatePresence>
          {activeToast && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
              className="fixed top-20 right-5 z-40 w-[calc(100vw-2.5rem)] max-w-sm rounded-2xl border border-[#2563EB]/25 bg-white p-4 shadow-[0_20px_48px_-14px_rgba(16,24,40,0.22)]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white">
                  <Bell className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-semibold text-[#2563EB]">
                      {activeToast.leadRef} · Automated Alert
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveToast(null)}
                      aria-label="Dismiss notification"
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                  <p className="mt-0.5 truncate font-display text-sm font-bold text-[#101828]">
                    {activeToast.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600">{activeToast.summary}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveToast(null);
                      setDashboardTab('notifications');
                      setDashboardOpen(true);
                    }}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    <span>Open Lead Dashboard</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
