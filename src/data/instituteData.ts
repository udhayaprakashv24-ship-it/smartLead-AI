export type CourseCategory = 'all' | 'ai-data' | 'engineering' | 'growth';

export interface CourseModule {
  title: string;
  topics: string[];
}

export interface CourseItem {
  id: string;
  title: string;
  category: Exclude<CourseCategory, 'all'>;
  categoryLabel: string;
  duration: string;
  format: string;
  level: string;
  shortDescription: string;
  fullDescription: string;
  tools: string[];
  capstoneProject: string;
  careerOutcomes: string[];
  modules: CourseModule[];
  iconName: 'brain' | 'barChart' | 'globe' | 'terminal' | 'layers' | 'megaphone';
}

export interface StatItem {
  id: string;
  value: number;
  suffix: string;
  label: string;
  context: string;
  iconName: 'briefcase' | 'users' | 'trendingUp' | 'folderGit';
}

export interface PillarItem {
  index: string;
  title: string;
  description: string;
  highlight: string;
  iconName: 'users' | 'folderGit' | 'cpu' | 'compass' | 'award';
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  course: string;
  cohort: string;
  outcome: string;
  photoUrl: string;
  quote: string;
}

export const COURSE_CATEGORIES: { id: CourseCategory; label: string }[] = [
  { id: 'all', label: 'All Courses' },
  { id: 'ai-data', label: 'AI & Data' },
  { id: 'engineering', label: 'Software Engineering' },
  { id: 'growth', label: 'Digital Growth' },
];

export const COURSES: CourseItem[] = [
  {
    id: 'artificial-intelligence',
    title: 'Artificial Intelligence',
    category: 'ai-data',
    categoryLabel: 'AI & Data',
    duration: '16 Weeks',
    format: 'Live Cohort · Weekend Labs',
    level: 'Intermediate',
    shortDescription:
      'Design, fine-tune, and deploy production machine learning systems, neural networks, and LLM-powered workflows.',
    fullDescription:
      'Master modern AI engineering from mathematical foundations and transformer architectures to retrieval-augmented generation and production model deployment with weekly mentor code reviews.',
    tools: ['Python', 'PyTorch', 'Transformers', 'Vector DBs', 'FastAPI'],
    capstoneProject: 'End-to-End Domain RAG Assistant & Evaluation Suite',
    careerOutcomes: ['AI Engineer', 'ML Applications Developer', 'Applied AI Specialist'],
    iconName: 'brain',
    modules: [
      {
        title: 'Foundations of Machine & Deep Learning',
        topics: ['Gradient optimization & loss landscapes', 'Neural architectures with PyTorch', 'Model evaluation & bias auditing'],
      },
      {
        title: 'Large Language Models & Prompt Systems',
        topics: ['Transformer attention mechanics', 'Structured outputs & tool calling', 'Parameter-efficient fine-tuning (LoRA)'],
      },
      {
        title: 'Retrieval-Augmented Generation & Agents',
        topics: ['Semantic chunking & hybrid indexing', 'Vector database retrieval pipelines', 'Multi-step reasoning & guardrails'],
      },
      {
        title: 'Production Deployment & MLOps',
        topics: ['Containerized inference APIs', 'Latency & token-cost profiling', 'Automated regression benchmarks'],
      },
    ],
  },
  {
    id: 'data-science',
    title: 'Data Science',
    category: 'ai-data',
    categoryLabel: 'AI & Data',
    duration: '14 Weeks',
    format: 'Live Cohort · Guided Labs',
    level: 'Beginner Friendly',
    shortDescription:
      'Transform raw business datasets into predictive models, interactive executive dashboards, and clear strategic decisions.',
    fullDescription:
      'Build strong analytical fluency in SQL, statistical inference, exploratory visualization, and predictive modeling using real industry datasets across finance, retail, and SaaS.',
    tools: ['Python', 'Pandas', 'SQL', 'Scikit-Learn', 'Tableau'],
    capstoneProject: 'Customer Churn Forecasting & Revenue Sensitivity Model',
    careerOutcomes: ['Data Scientist', 'Product Data Analyst', 'BI Analytics Lead'],
    iconName: 'barChart',
    modules: [
      {
        title: 'Data Wrangling & Relational SQL',
        topics: ['Complex joins, CTEs, and window functions', 'Cleaning messy real-world records', 'Automated ETL scripts in Python'],
      },
      {
        title: 'Applied Statistics & Experimentation',
        topics: ['Probability distributions & hypothesis testing', 'A/B test design and power analysis', 'Confidence intervals & causal pitfalls'],
      },
      {
        title: 'Predictive Modeling & Feature Craft',
        topics: ['Regression, tree ensembles, and clustering', 'Cross-validation & hyperparameter tuning', 'Feature importance & explainability'],
      },
      {
        title: 'Decision Storytelling & Dashboards',
        topics: ['Executive KPI hierarchy', 'Interactive Tableau/BI reporting', 'Presenting model ROI to stakeholders'],
      },
    ],
  },
  {
    id: 'web-development',
    title: 'Web Development',
    category: 'engineering',
    categoryLabel: 'Software Engineering',
    duration: '12 Weeks',
    format: 'Live Cohort · Studio Critique',
    level: 'Beginner Friendly',
    shortDescription:
      'Craft responsive, accessible, and fast modern web interfaces using semantic HTML, Tailwind CSS, TypeScript, and React.',
    fullDescription:
      'Go beyond static templates to architect responsive component systems, accessible interactive workflows, state management, and polished web animations ready for production.',
    tools: ['HTML5', 'Tailwind CSS', 'TypeScript', 'React', 'Vite'],
    capstoneProject: 'Multi-View SaaS Client Portal with Real-Time Filtering',
    careerOutcomes: ['Frontend Developer', 'UI Engineer', 'React Web Specialist'],
    iconName: 'globe',
    modules: [
      {
        title: 'Semantic Architecture & Modern CSS',
        topics: ['Accessible landmark structure & ARIA', 'CSS Grid, Flexbox, and fluid typography', 'Design systems with Tailwind CSS'],
      },
      {
        title: 'Modern JavaScript & TypeScript',
        topics: ['Asynchronous fetch workflows & error boundaries', 'Strict TypeScript interfaces and generics', 'DOM performance & event delegation'],
      },
      {
        title: 'Component Engineering with React',
        topics: ['Reusable component patterns & custom hooks', 'Form validation & client-side routing', 'State normalization and memoization'],
      },
      {
        title: 'Motion, Performance & Deployment',
        topics: ['Reduced-motion compliant UI transitions', 'Core Web Vitals optimization', 'CI/CD preview deployments'],
      },
    ],
  },
  {
    id: 'python-programming',
    title: 'Python Programming',
    category: 'engineering',
    categoryLabel: 'Software Engineering',
    duration: '10 Weeks',
    format: 'Live Cohort · Daily Practice',
    level: 'Foundation',
    shortDescription:
      'Build rock-solid programming logic, object-oriented architecture, and automation scripts with clean, idiomatic Python.',
    fullDescription:
      'Designed for aspiring developers and career switchers, this intensive program builds fluency in Python syntax, data structures, API integration, testing, and workflow automation.',
    tools: ['Python 3.12', 'Pytest', 'REST APIs', 'SQLite', 'Git'],
    capstoneProject: 'Automated Financial Report CLI & Web Data Aggregator',
    careerOutcomes: ['Python Developer', 'Automation Engineer', 'Backend Associate'],
    iconName: 'terminal',
    modules: [
      {
        title: 'Core Syntax & Algorithmic Thinking',
        topics: ['Control flow, functions, and comprehensions', 'Lists, dictionaries, sets, and complexity', 'File I/O and structured logging'],
      },
      {
        title: 'Object-Oriented Design & Modules',
        topics: ['Classes, inheritance, and dataclasses', 'Virtual environments and dependency hygiene', 'Clean error handling patterns'],
      },
      {
        title: 'APIs, Databases & Automation',
        topics: ['Consuming RESTful APIs securely', 'Relational persistence with SQLite', 'Scheduling and CSV/JSON pipelines'],
      },
      {
        title: 'Automated Testing & Code Quality',
        topics: ['Unit testing with Pytest', 'Type hints with mypy', 'Git branching and pull request reviews'],
      },
    ],
  },
  {
    id: 'full-stack-development',
    title: 'Full Stack Development',
    category: 'engineering',
    categoryLabel: 'Software Engineering',
    duration: '20 Weeks',
    format: 'Live Cohort · Code Reviews',
    level: 'Career Track',
    shortDescription:
      'Architect complete web platforms from PostgreSQL schemas and Node.js APIs to polished React frontends and cloud deployment.',
    fullDescription:
      'Train as an end-to-end product engineer capable of designing secure authentication, normalized databases, scalable REST APIs, and responsive client applications.',
    tools: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
    capstoneProject: 'Multi-Tenant Learning & Billing SaaS Platform',
    careerOutcomes: ['Full Stack Engineer', 'Software Developer', 'Product Engineer'],
    iconName: 'layers',
    modules: [
      {
        title: 'Frontend Systems & State Architecture',
        topics: ['React component architecture & TypeScript', 'Optimistic UI & form validation', 'Accessible modals, tables, and routing'],
      },
      {
        title: 'Backend APIs with Node.js & Express',
        topics: ['RESTful routing & middleware chains', 'Input sanitization & rate limiting', 'Role-based JWT & session security'],
      },
      {
        title: 'Relational Databases & Caching',
        topics: ['PostgreSQL schema design & migrations', 'Query indexing and transaction safety', 'Redis caching strategies'],
      },
      {
        title: 'Testing, Containers & Cloud Launch',
        topics: ['Integration test suites', 'Docker multi-stage builds', 'Production monitoring & zero-downtime deploys'],
      },
    ],
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing',
    category: 'growth',
    categoryLabel: 'Digital Growth',
    duration: '12 Weeks',
    format: 'Live Cohort · Live Audits',
    level: 'Career Track',
    shortDescription:
      'Master performance acquisition, technical SEO, conversion analytics, and AI-assisted campaign strategy with measurable ROI.',
    fullDescription:
      'Learn how modern growth teams acquire, convert, and retain customers using search intent research, paid media attribution, landing page optimization, and GA4 analytics.',
    tools: ['GA4', 'Google Ads', 'Search Console', 'HubSpot', 'Ahrefs'],
    capstoneProject: 'Full-Funnel Product Launch & Paid Acquisition Audit',
    careerOutcomes: ['Growth Marketer', 'Performance Marketing Lead', 'SEO Strategist'],
    iconName: 'megaphone',
    modules: [
      {
        title: 'Technical SEO & Content Architecture',
        topics: ['Search intent mapping & topic clusters', 'On-page schema & Core Web Vitals', 'Editorial calendars that convert'],
      },
      {
        title: 'Paid Acquisition & Funnel Economics',
        topics: ['Search & social campaign structuring', 'CAC, LTV, and ROAS unit modeling', 'Ad creative testing frameworks'],
      },
      {
        title: 'Conversion Rate Optimization & CRM',
        topics: ['High-converting landing page wireframes', 'Email lifecycle automation sequences', 'Lead scoring and attribution'],
      },
      {
        title: 'Analytics & AI Marketing Workflows',
        topics: ['GA4 event funnels & UTM governance', 'Automated campaign reporting dashboards', 'AI-assisted market & audience research'],
      },
    ],
  },
];

export const ACHIEVEMENT_STATS: StatItem[] = [
  {
    id: 'students-placed',
    value: 1000,
    suffix: '+',
    label: 'Students Placed',
    context: 'Across partner engineering, data & AI teams',
    iconName: 'briefcase',
  },
  {
    id: 'expert-mentors',
    value: 50,
    suffix: '+',
    label: 'Expert Mentors',
    context: 'Practicing tech leads with 1:12 cohort ratio',
    iconName: 'users',
  },
  {
    id: 'placement-rate',
    value: 95,
    suffix: '%',
    label: 'Placement Rate',
    context: 'Within 6 months of capstone defense',
    iconName: 'trendingUp',
  },
  {
    id: 'projects',
    value: 120,
    suffix: '+',
    label: 'Production Projects',
    context: 'Reviewed in live architecture critiques',
    iconName: 'folderGit',
  },
];

export const WHY_CHOOSE_US_PILLARS: PillarItem[] = [
  {
    index: '01',
    title: 'Expert Mentors',
    description:
      'Learn directly from practicing principal engineers, applied AI leads, and growth directors who review your code and decisions every week.',
    highlight: '1:12 live mentor-to-learner ratio',
    iconName: 'users',
  },
  {
    index: '02',
    title: 'Practical Projects',
    description:
      'Every module culminates in a real, deployable build—from RAG pipelines and churn predictors to full-stack SaaS portals—not toy exercises.',
    highlight: '6+ portfolio-grade builds per track',
    iconName: 'folderGit',
  },
  {
    index: '03',
    title: 'Industry-Relevant Skills',
    description:
      'Our curriculum is updated quarterly with hiring partners so you graduate fluent in current frameworks, cloud tooling, and AI workflows.',
    highlight: 'Quarterly syllabus audits',
    iconName: 'cpu',
  },
  {
    index: '04',
    title: 'Career Guidance',
    description:
      'Dedicated mock technical interviews, portfolio storytelling workshops, GitHub hygiene audits, and direct referrals to hiring teams.',
    highlight: 'Ongoing placement coaching',
    iconName: 'compass',
  },
  {
    index: '05',
    title: 'Certification Support',
    description:
      'Earn an industry-verified SmartLead AI capstone credential plus structured preparation for AWS, TensorFlow, and Google Analytics exams.',
    highlight: 'Verified capstone credentials',
    iconName: 'award',
  },
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 't1',
    name: 'Priya Nair',
    role: 'Applied AI Engineer',
    company: 'Veridian Cloud Systems',
    course: 'Artificial Intelligence',
    cohort: 'Cohort 16 · 16 Weeks',
    outcome: 'Transitioned from QA Analyst to Applied AI Engineer in 4 months',
    photoUrl: '/src/assets/images/student_priya_nair_1794987297803.jpg',
    quote:
      'Before SmartLead AI, I had only run isolated notebook tutorials. Weekly mentor code reviews helped me ship a production RAG evaluation pipeline and transition from QA into an AI engineering role in four months.',
  },
  {
    id: 't2',
    name: 'Marcus Chen',
    role: 'Full Stack Developer',
    company: 'Northbridge FinTech',
    course: 'Full Stack Development',
    cohort: 'Cohort 15 · 20 Weeks',
    outcome: 'Shipped 3 production PostgreSQL & React apps and landed a senior-track offer',
    photoUrl: '/src/assets/images/student_marcus_chen_1794987298486.jpg',
    quote:
      'The capstone defense felt just like a real engineering design review. Having deployed PostgreSQL and React apps on GitHub gave hiring managers concrete proof of my skills during technical interviews.',
  },
  {
    id: 't3',
    name: 'Elena Morales',
    role: 'Product Data Analyst',
    company: 'Kestrel Commerce',
    course: 'Data Science',
    cohort: 'Cohort 17 · 14 Weeks',
    outcome: 'Built an executive churn forecasting model and stepped into product analytics',
    photoUrl: '/src/assets/images/student_elena_morales_1794987298427.jpg',
    quote:
      'Learning SQL window functions alongside real experimentation case studies changed how I approach data. My capstone churn dashboard became the centerpiece of every final-round interview I took.',
  },
  {
    id: 't4',
    name: 'David Okafor',
    role: 'Growth Marketing Lead',
    company: 'Harborline SaaS',
    course: 'Digital Marketing',
    cohort: 'Cohort 18 · 12 Weeks',
    outcome: 'Increased qualified inbound pipeline by 135% using attribution & SEO audits',
    photoUrl: '/src/assets/images/student_david_okafor_1794987299077.jpg',
    quote:
      'Most marketing courses stay theoretical. At SmartLead AI, mentors audited live GA4 funnels and paid acquisition budgets with us every week, giving me practical confidence from day one.',
  },
];

export const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Do I need prior coding experience to enroll at SmartLead AI?',
    answer:
      'Not for our foundational tracks. Python Programming, Web Development, Data Science, and Digital Marketing start from first principles with guided pre-cohort onboarding. For Artificial Intelligence and Full Stack Development, we offer a quick readiness check and a 2-week bridge prep module if you are brushing up on basics.',
  },
  {
    id: 'faq-2',
    question: 'How are live classes, mentorship, and project reviews structured?',
    answer:
      'Cohorts combine interactive live evening or weekend sessions with hands-on lab hours. Each learner is paired with a small study pod led by an industry mentor who conducts weekly line-by-line code reviews, architectural feedback, and Q&A debugging sessions.',
  },
  {
    id: 'faq-3',
    question: 'What kind of career guidance and placement support is included?',
    answer:
      'Career coaching begins midway through your cohort. You receive structured resume and LinkedIn rewrites, GitHub portfolio audits, mock system-design and behavioral interviews with senior hiring managers, and introductions to our network of partner engineering and analytics teams.',
  },
  {
    id: 'faq-4',
    question: 'Are the classes recorded if I miss a live session due to work?',
    answer:
      'Yes. Every live workshop, architecture walkthrough, and mentor Q&A is recorded in HD and published within two hours of the session alongside downloadable slides, starter repositories, and lab notes.',
  },
  {
    id: 'faq-5',
    question: 'What certification do I receive upon completing a program?',
    answer:
      'Graduates who pass their capstone project evaluation earn a verifiable SmartLead AI Certificate of Specialization with a public project portfolio link. Several tracks also include dedicated prep workshops for industry exams such as Google Analytics 4 and cloud practitioner certifications.',
  },
  {
    id: 'faq-6',
    question: 'How can I get help choosing the right course for my goals?',
    answer:
      'Submit an enquiry using the contact form below with your background and career goal. An academic advisor will schedule a 20-minute 1-on-1 curriculum consultation to walk through syllabi, cohort dates, and tuition options.',
  },
];
