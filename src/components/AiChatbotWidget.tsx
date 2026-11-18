import { useState, useRef, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowUpRight,
} from 'lucide-react';
import { BrandLogo, BrandMark } from './BrandLogo';
import type { EnquiryNotification, LeadRecord } from '../utils/leads';
import { EASE_OUT_EXPO } from '../utils/motion';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  capturedLead?: LeadRecord | null;
}

interface AiChatbotWidgetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadCaptured: (lead: LeadRecord, notification: EnquiryNotification | null) => void;
  onOpenLeadDashboard: () => void;
}

const QUICK_PROMPTS = [
  'Which course fits a beginner?',
  'Compare Artificial Intelligence vs Data Science',
  'How do live cohorts & placement support work?',
  'I want to enroll in Full Stack Development',
];

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  role: 'assistant',
  text: 'Hi! I am the SmartLead AI Advisor. Ask me anything about our 6 career tracks, prerequisites, weekly mentor reviews, or share your name, email, and preferred course so I can register your enquiry automatically.',
};

function renderFormattedText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-inherit">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export function AiChatbotWidget({
  isOpen,
  onOpenChange,
  onLeadCaptured,
  onOpenLeadDashboard,
}: AiChatbotWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);
  const scrollEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      window.setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, messages.length, isLoading]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onOpenChange]);

  const sendMessageText = async (rawText: string, options?: { isRetry?: boolean }) => {
    const trimmed = rawText.trim();
    if (!trimmed || isLoading) return;

    let nextHistory = messages;
    if (!options?.isRetry) {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: trimmed,
      };
      nextHistory = [...messages, userMsg];
      setMessages(nextHistory);
      setInput('');
    }

    setError(null);
    setLastFailedPrompt(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextHistory
            .filter((m) => m.id !== 'welcome-msg')
            .map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = (await response.json()) as {
        reply?: string;
        capturedLead?: LeadRecord | null;
        notification?: EnquiryNotification | null;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || 'Unable to get a response from the AI Advisor.');
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'I am here to help with SmartLead AI courses and admissions.',
        capturedLead: data.capturedLead ?? null,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (data.capturedLead) {
        onLeadCaptured(data.capturedLead, data.notification ?? null);
      }
    } catch (err) {
      setLastFailedPrompt(trimmed);
      setError(
        err instanceof Error ? err.message : 'Network error communicating with SmartLead AI Advisor.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void sendMessageText(input);
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
    setError(null);
    setLastFailedPrompt(null);
    setInput('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.section
            role="dialog"
            aria-label="SmartLead AI Student Advisor Chatbot"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
            className="flex h-[540px] max-h-[calc(100vh-6rem)] w-[calc(100vw-2.5rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-16px_rgba(16,24,40,0.28)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 bg-[#101828] px-4 py-3 text-white">
              <div className="flex flex-col items-start gap-1">
                <BrandLogo variant="dark" />
                <h2 className="pl-1 text-[11px] font-medium text-slate-300">
                  AI Advisor · Course Q&amp;A &amp; Auto Enquiry
                </h2>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleReset}
                  title="New conversation"
                  aria-label="Start new AI chat conversation"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  aria-label="Close AI Advisor chat"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Message Feed */}
            <div className="flex-1 space-y-3.5 overflow-y-auto bg-[#F4F8FF]/45 p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'rounded-br-sm bg-[#2563EB] text-white'
                        : 'rounded-bl-sm border border-slate-200/80 bg-white text-[#1E293B] shadow-xs'
                    }`}
                  >
                    {renderFormattedText(msg.text)}
                  </div>

                  {msg.capturedLead && (
                    <div className="mt-2 w-full max-w-[92%] rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 text-xs text-emerald-950">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-800">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                          <span>Enquiry Captured ({msg.capturedLead.refCode})</span>
                        </span>
                        <button
                          type="button"
                          onClick={onOpenLeadDashboard}
                          className="inline-flex items-center gap-1 font-semibold text-[#2563EB] hover:underline cursor-pointer"
                        >
                          <span>View Lead</span>
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="mt-1 text-emerald-900">
                        {msg.capturedLead.name} · {msg.capturedLead.course}
                      </p>
                      <p className="mt-0.5 text-[11px] text-emerald-800/85">
                        Saved to Lead Dashboard &amp; counselor alert triggered.
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {/* Starter Quick Prompts when only welcome message is shown */}
              {messages.length === 1 && !isLoading && (
                <div className="pt-1">
                  <p className="mb-2 text-[11px] font-semibold tracking-wide text-slate-500">
                    Popular Student Questions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => void sendMessageText(prompt)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left text-xs font-medium text-[#101828] transition-colors hover:border-[#2563EB] hover:bg-[#F4F8FF] hover:text-[#2563EB] cursor-pointer"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex items-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-sm border border-slate-200/80 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-600 shadow-xs">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#2563EB]" aria-hidden="true" />
                    <span>SmartLead AI is thinking...</span>
                  </div>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="font-semibold">AI Advisor Unavailable</p>
                    <p className="mt-0.5 leading-relaxed">{error}</p>
                    {lastFailedPrompt && (
                      <button
                        type="button"
                        onClick={() => void sendMessageText(lastFailedPrompt, { isRetry: true })}
                        className="mt-2 inline-flex items-center gap-1 rounded-md border border-red-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-red-700 transition-colors hover:bg-red-100 cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" aria-hidden="true" />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div ref={scrollEndRef} />
            </div>

            {/* Composer */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 border-t border-slate-200 bg-white p-3"
            >
              <label htmlFor="ai-chatbot-input" className="sr-only">
                Ask a question about SmartLead AI courses
              </label>
              <input
                ref={inputRef}
                id="ai-chatbot-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about courses, fees, or enroll..."
                disabled={isLoading}
                className="min-h-[42px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[#101828] placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 disabled:bg-slate-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send message to AI Advisor"
                className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-slate-300 cursor-pointer"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <motion.button
        type="button"
        onClick={() => onOpenChange(!isOpen)}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Minimize SmartLead AI Advisor' : 'Open SmartLead AI Advisor Chatbot'}
        className="inline-flex min-h-[48px] items-center gap-2.5 rounded-full bg-[#101828] py-2 pr-5 pl-2 text-sm font-semibold text-white shadow-[0_14px_32px_-8px_rgba(16,24,40,0.42)] ring-1 ring-white/15 transition-colors hover:bg-[#1E293B] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2563EB] text-white ring-1 ring-white/20">
          {isOpen ? (
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <BrandMark size={18} />
          )}
        </span>
        <span>{isOpen ? 'Close AI Advisor' : 'Ask AI Advisor'}</span>
      </motion.button>
    </div>
  );
}
