import { Linkedin, Github, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

const QUICK_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Courses', href: '#courses' },
  { label: 'About Us', href: '#about' },
  { label: 'Why Choose Us', href: '#why-us' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

const PROGRAM_LINKS = [
  'Artificial Intelligence',
  'Data Science',
  'Web Development',
  'Python Programming',
  'Full Stack Development',
  'Digital Marketing',
];

const SOCIAL_LINKS = [
  { label: 'SmartLead AI on LinkedIn', href: '#contact', Icon: Linkedin },
  { label: 'SmartLead AI on GitHub', href: '#contact', Icon: Github },
  { label: 'SmartLead AI on X', href: '#contact', Icon: Twitter },
  { label: 'SmartLead AI on YouTube', href: '#contact', Icon: Youtube },
];

export function Footer() {
  const scrollToSection = (href: string) => {
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#101828] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand & Mission */}
          <div className="lg:col-span-4">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#home');
              }}
              aria-label="Back to SmartLead AI top"
            >
              <BrandLogo variant="dark" />
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Mentor-led coaching in Artificial Intelligence, Data Science, Software Engineering,
              and Digital Growth designed to build lasting technical careers.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(href);
                  }}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-[#06B6D4] hover:text-[#06B6D4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06B6D4]"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="font-display text-sm font-semibold text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {QUICK_LINKS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(item.href);
                    }}
                    className="text-slate-400 transition-colors hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div className="lg:col-span-3">
            <h3 className="font-display text-sm font-semibold text-white">Programs</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {PROGRAM_LINKS.map((title) => (
                <li key={title}>
                  <a
                    href="#courses"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('#courses');
                    }}
                    className="text-slate-400 transition-colors hover:text-white"
                  >
                    {title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-3">
            <h3 className="font-display text-sm font-semibold text-white">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#06B6D4]" aria-hidden="true" />
                <a href="mailto:admissions@smartleadai.edu" className="hover:text-white">
                  admissions@smartleadai.edu
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#06B6D4]" aria-hidden="true" />
                <a href="tel:+14158904320" className="font-mono hover:text-white">
                  +1 (415) 890-4320
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#06B6D4]" aria-hidden="true" />
                <span>450 Innovation Way, Suite 300, San Francisco, CA 94107</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-slate-400 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} SmartLead AI Institute. All rights reserved.</p>
          <p>Career-Focused Technology Coaching · San Francisco &amp; Live Online</p>
        </div>
      </div>
    </footer>
  );
}
