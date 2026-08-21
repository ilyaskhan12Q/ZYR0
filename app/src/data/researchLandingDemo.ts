export const RESEARCH_QUESTIONS = [
  'How does generative AI affect university education?',
  'What are the most effective climate policy frameworks for developing nations?',
  'How do transformer architectures compare for low-resource NLP tasks?',
];

export const PIPELINE_STAGES = [
  { id: 'question', label: 'Question' },
  { id: 'understand', label: 'Understand' },
  { id: 'plan', label: 'Research Plan' },
  { id: 'areas', label: 'Research Areas' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'verify', label: 'Verification' },
  { id: 'synthesis', label: 'Synthesis' },
  { id: 'report', label: 'Report' },
];

export const RESEARCH_AREAS = [
  {
    id: 'foundations',
    label: 'Foundations',
    description: 'Core concepts, definitions, and baseline knowledge',
  },
  {
    id: 'technical',
    label: 'Technical Architecture',
    description: 'Mechanisms, methods, and implementation details',
  },
  {
    id: 'benchmarks',
    label: 'Benchmarks',
    description: 'Empirical data, performance metrics, and comparisons',
  },
  {
    id: 'constraints',
    label: 'Constraints',
    description: 'Limitations, economics, ethics, and future outlook',
  },
];

export const DEMO_SOURCES = [
  { id: 1, title: 'Impact of AI on Higher Education: A Systematic Review', authors: 'Chen, L., Martinez, A.', year: 2024, source: 'OpenAlex', verified: true },
  { id: 2, title: 'Generative AI in the Classroom: Opportunities and Challenges', authors: 'Williams, R., Patel, S.', year: 2024, source: 'arXiv', verified: true },
  { id: 3, title: 'University Faculty Perspectives on AI Integration', authors: 'Kim, J., Thompson, D.', year: 2023, source: 'Semantic Scholar', verified: true },
  { id: 4, title: 'Assessment Integrity in the Age of Generative AI', authors: 'Brown, M., Davis, K.', year: 2024, source: 'OpenAlex', verified: true },
  { id: 5, title: 'AI Literacy Frameworks for Undergraduate Programs', authors: 'Garcia, F., Lee, H.', year: 2024, source: 'arXiv', verified: true },
  { id: 6, title: 'Student Learning Outcomes with AI-Assisted Instruction', authors: 'Johnson, P., Anderson, T.', year: 2023, source: 'Semantic Scholar', verified: true },
];

export const DEMO_REPORT = {
  title: 'Generative AI & University Education',
  sourceCount: 18,
  findings: [
    { id: '01', title: 'Faculty adoption remains uneven', summary: 'While 67% of institutions have AI policies, only 23% provide structured training for faculty integration.' },
    { id: '02', title: 'Assessment methods are shifting', summary: 'Process-based assessment and oral examinations are replacing traditional take-home assignments in 41% of surveyed departments.' },
    { id: '03', title: 'Student AI literacy varies significantly', summary: 'First-generation students report 40% lower confidence in AI tool usage compared to peers with prior technical exposure.' },
  ],
  sources: [
    { key: '[1]', title: 'Chen & Martinez (2024) — OpenAlex' },
    { key: '[2]', title: 'Williams & Patel (2024) — arXiv' },
    { key: '[3]', title: 'Kim & Thompson (2023) — Semantic Scholar' },
  ],
};

export const FEATURES = [
  {
    title: 'Deep Research',
    description: 'Multi-stage research pipeline that decomposes your question into targeted research areas, searches across academic and web sources, and synthesizes findings into a structured report.',
    icon: 'search',
  },
  {
    title: 'Parallel Research',
    description: 'Four research dimensions run simultaneously — Foundations, Technical, Benchmarks, and Constraints — maximizing coverage while minimizing wait time.',
    icon: 'parallel',
  },
  {
    title: 'Evidence Collection',
    description: 'Sources gathered from OpenAlex, arXiv, Semantic Scholar, and Jina Web Search. Each candidate is captured with title, authors, year, and snippet.',
    icon: 'evidence',
  },
  {
    title: 'Source Verification',
    description: 'Every cited source is verified with a live HTTP check. Only sources that resolve are included in the final citation ledger. Dead links are automatically dropped.',
    icon: 'verify',
  },
  {
    title: 'Structured Reports',
    description: 'Research reports with executive summary, key findings, section-by-section analysis, and a numbered citation ledger — ready for academic or professional use.',
    icon: 'report',
  },
  {
    title: 'Research History',
    description: 'All your research sessions are saved. Revisit, follow up, or regenerate reports from any previous session.',
    icon: 'history',
  },
];

export const AUDIENCES = [
  {
    title: 'Students',
    description: 'Literature reviews, thesis research, understanding complex topics. Get verified sources and structured reports instead of scanning hundreds of search results.',
    list: ['Literature reviews', 'Thesis research', 'Topic exploration', 'Source verification'],
  },
  {
    title: 'Researchers',
    description: 'Rapid landscape surveys, cross-domain exploration, finding connections between fields. Start with a question and get a citation-backed overview in minutes.',
    list: ['Landscape surveys', 'Cross-domain exploration', 'Gap identification', 'Citation tracking'],
  },
  {
    title: 'Developers',
    description: 'Technical research, API documentation synthesis, understanding frameworks and architectures. Deep-dive into any technology with verified references.',
    list: ['Technical research', 'API synthesis', 'Framework comparison', 'Architecture analysis'],
  },
];

export const PRICING_PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    description: 'Explore the research agent with basic capabilities.',
    features: ['Quick research mode', 'Basic source verification', '5 research sessions/day', 'Standard report format'],
    cta: 'Get started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$X',
    period: '/mo',
    description: 'Full research capabilities for serious work.',
    features: ['All research depths', 'Full source verification', 'Unlimited sessions', 'Export reports (Markdown)', 'Research history'],
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    name: 'Advanced',
    price: '$X',
    period: '/mo',
    description: 'For teams and institutions.',
    features: ['Everything in Pro', 'Custom source domains', 'API access', 'Priority processing', 'Team collaboration', 'Dedicated support'],
    cta: 'Contact sales',
    highlighted: false,
  },
];
