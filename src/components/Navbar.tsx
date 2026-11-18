import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight, Bell } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  onGetStarted: () => void;
  onOpenLeadDashboard: () => void;
  unreadNotifications?: number;
}

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Courses', href: '#courses' },
  { label: 'About Us', href: '#about' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

export function Navbar({
  onGetStarted,
  onOpenLeadDashboard,
  unreadNotifications = 0,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 18);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_4px_20px_-6px_rgba(16,24,40,0.08)]'
          : 'bg-white/85 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('#home');
          }}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 rounded-lg"
          aria-label="SmartLead AI Home"
        >
          <BrandLogo variant="light" />
        </a>

        {/* Zone 2: Primary Nav Links */}
        <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(item.href);
              }}
              className="group relative py-1 text-sm font-medium text-[#1E293B] transition-colors duration-150 hover:text-[#2563EB] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 rounded"
            >
              {item.label}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-[#2563EB] transition-transform duration-200 ease-out group-hover:scale-x-100"
              />
            </a>
          ))}
        </nav>

        {/* Zone 3: Lead Dashboard + Primary Action + Mobile Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenLeadDashboard}
            aria-label={`Open Lead Management Dashboard${unreadNotifications > 0 ? ` (${unreadNotifications} unread alerts)` : ''}`}
            className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#101828] transition-colors hover:border-[#2563EB] hover:bg-[#F4F8FF] hover:text-[#2563EB] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 cursor-pointer"
          >
            <Bell className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
            <span>Lead Dashboard</span>
            {unreadNotifications > 0 && (
              <span className="rounded-md bg-[#2563EB] px-1.5 py-0.5 font-mono text-[11px] font-bold leading-none tabular-nums text-white">
                {unreadNotifications}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onGetStarted}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:bg-[#1D4ED8] active:scale-[0.98] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-[#101828] transition-colors hover:bg-[#F4F8FF] md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            id="mobile-nav-drawer"
            aria-label="Mobile Navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-slate-200 bg-white px-4 pb-6 pt-3 shadow-lg md:hidden"
          >
            <div className="flex flex-col space-y-1">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(item.href);
                  }}
                  className="flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium text-[#1E293B] transition-colors hover:bg-[#F4F8FF] hover:text-[#2563EB]"
                >
                  {item.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLeadDashboard();
                  }}
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-[#101828] transition-colors hover:border-[#2563EB] hover:text-[#2563EB]"
                >
                  <Bell className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                  <span>Lead Dashboard</span>
                  {unreadNotifications > 0 && (
                    <span className="rounded-md bg-[#2563EB] px-1.5 py-0.5 font-mono text-[11px] font-bold tabular-nums text-white">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onGetStarted();
                  }}
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
