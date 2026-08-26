import {
  Briefcase, FlaskConical, Users, Shield, CheckCircle, Globe,
  BarChart3, Bell, Search, FileText, Award, Zap, TrendingUp,
  Clock, MessageSquare, Lock, Star, ArrowRight
} from 'lucide-react';

export const navLinks = [
  { label: 'Internships', href: '/internships' },
  { label: 'Research', href: '/research' },
  { label: 'About', href: '/about' },
  { label: 'Help', href: '/help' },
];

export const navCta = { label: 'Get started free', href: '/register' };
export const navSignIn = { label: 'Sign in', href: '/login' };

export const hero = {
  tag: 'A ZYR0 Product',
  heading: 'Find internships that matter.',
  subtitle: 'Connect with verified companies, track your applications, and launch your career — all in one place.',
  cta: { label: 'Get started free', href: '/register' },
  secondaryCta: { label: 'Browse internships', href: '/internships' },
  trustText: 'Free for students. No credit card required.',
};

export const clientLogos = [
  'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta',
  'Netflix', 'Spotify', 'Stripe', 'Shopify', 'Slack',
  'Notion', 'Figma', 'Vercel', 'Linear',
];

export const features = [
  { title: 'Browse Internships', description: 'Explore verified internship opportunities from top companies across industries.', icon: Briefcase },
  { title: 'Track Applications', description: 'Monitor your application status in real-time with a visual pipeline.', icon: BarChart3 },
  { title: 'Company Profiles', description: 'Research companies, read reviews, and understand their culture before applying.', icon: Users },
  { title: 'Certificate Verification', description: 'Employers can verify your internship certificate with a unique code.', icon: Shield },
  { title: 'Mentor Connect', description: 'Get guidance from experienced professionals in your field of interest.', icon: MessageSquare },
  { title: 'Smart Matching', description: 'Our algorithm matches you with internships based on your skills and interests.', icon: Zap },
  { title: 'Real-time Notifications', description: 'Get instant updates on application status, new opportunities, and messages.', icon: Bell },
  { title: 'Secure Platform', description: 'Your data is encrypted and protected with industry-standard security.', icon: Lock },
];

export const benefits = [
  {
    title: 'For Students',
    description: 'Find verified internships, track applications, and build your career with structured programs and mentorship.',
    items: ['Browse 500+ verified internships', 'Track application status in real-time', 'Connect with industry mentors', 'Earn verified certificates'],
  },
  {
    title: 'For Companies',
    description: 'Post internships, review applicants, and manage your internship program with powerful tools.',
    items: ['Post unlimited internships', 'AI-powered applicant matching', 'Structured evaluation system', 'Team collaboration tools'],
  },
  {
    title: 'For Mentors',
    description: 'Guide the next generation of professionals and track their progress through structured programs.',
    items: ['Monitor mentee progress', 'Provide structured feedback', 'Build your professional profile', 'Connect with top talent'],
  },
  {
    title: 'Verified Listings',
    description: 'Every company and internship on ZYR0 is verified for authenticity and quality.',
    items: ['100% verified companies', 'Authentic internship listings', 'Quality assurance process', 'Regular platform audits'],
  },
  {
    title: 'Career Tracking',
    description: 'Visualize your career journey from first application to landing your dream role.',
    items: ['Application pipeline view', 'Progress analytics', 'Skill gap analysis', 'Career milestone tracking'],
  },
  {
    title: 'Structured Programs',
    description: 'Internships with clear goals, mentorship, and evaluation — not just coffee runs.',
    items: ['Defined learning objectives', 'Regular check-ins', 'Performance evaluations', 'Certificate upon completion'],
  },
];

export const stats = [
  { number: '500+', label: 'Verified Internships' },
  { number: '120+', label: 'Partner Companies' },
  { number: '10K+', label: 'Students Registered' },
  { number: '95%', label: 'Satisfaction Rate' },
];

export const pricing = [
  {
    name: 'Student',
    price: '$0',
    period: 'forever',
    description: 'Free for students',
    popular: false,
    features: [
      { text: 'Browse all internships', included: true },
      { text: 'Track applications', included: true },
      { text: 'Company profiles', included: true },
      { text: 'Certificate verification', included: true },
      { text: 'Mentor access', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    name: 'Company',
    price: '$29',
    period: '/month',
    description: 'For companies hiring interns',
    popular: true,
    features: [
      { text: 'Post unlimited internships', included: true },
      { text: 'Applicant tracking', included: true },
      { text: 'AI-powered matching', included: true },
      { text: 'Team collaboration', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: 'Priority support', included: true },
    ],
  },
  {
    name: 'Mentor',
    price: '$9',
    period: '/month',
    description: 'For professional mentors',
    popular: false,
    features: [
      { text: 'Mentor dashboard', included: true },
      { text: 'Track mentee progress', included: true },
      { text: 'Structured feedback tools', included: true },
      { text: 'Professional profile', included: true },
      { text: 'Priority matching', included: true },
      { text: 'Priority support', included: false },
    ],
  },
];

export const tools = [
  'Sort internships by category, location, and duration',
  'Filter by company rating and stipend range',
  'Save favorite internships for later',
  'Apply with one-click using your profile',
  'Track multiple applications simultaneously',
  'Receive email notifications for new matches',
  'Download verified completion certificates',
  'Share your profile with potential employers',
  'Access internship resources and guides',
  'Connect with peers in your field',
  'Get personalized recommendations',
  'Export your career portfolio as PDF',
];

export const blogPosts = [
  {
    tag: 'Career Tips',
    date: 'Mar 15, 2026',
    title: 'How to Write a Standout Internship Application',
    excerpt: 'Tips and tricks to make your application shine in a competitive market.',
  },
  {
    tag: 'Platform',
    date: 'Mar 10, 2026',
    title: 'Introducing Smart Matching: Find Your Perfect Internship',
    excerpt: 'Our new algorithm matches you with internships based on skills and interests.',
  },
  {
    tag: 'Guides',
    date: 'Mar 5, 2026',
    title: 'The Complete Guide to Remote Internships in 2026',
    excerpt: 'Everything you need to know about landing and succeeding in a remote internship.',
  },
  {
    tag: 'Success Stories',
    date: 'Feb 28, 2026',
    title: 'From Intern to Full-Time: Real Stories from ZYR0 Students',
    excerpt: 'How our students turned internships into career opportunities.',
  },
];

export const teamMembers = [
  { name: 'Ilyas Khan', role: 'Founder & CEO', image: '/zyro-logo.webp' },
  { name: 'Sarah Chen', role: 'Head of Product', image: '/zyro-logo.webp' },
  { name: 'Marcus Johnson', role: 'Lead Engineer', image: '/zyro-logo.webp' },
  { name: 'Priya Patel', role: 'Design Lead', image: '/zyro-logo.webp' },
  { name: 'Alex Rivera', role: 'Head of Growth', image: '/zyro-logo.webp' },
  { name: 'Emma Wilson', role: 'Community Manager', image: '/zyro-logo.webp' },
];

export const globalStats = [
  { number: '15+', label: 'Countries' },
  { number: '120+', label: 'Partner Companies' },
  { number: '95%', label: 'Satisfaction Rate' },
];

export const testimonials = [
  { quote: 'ZYR0 made finding my dream internship so much easier. The application tracking feature is a game-changer.', name: 'Aisha Rahman', role: 'CS Student, NUST' },
  { quote: 'We\'ve hired 12 interns through ZYR0 this semester alone. The quality of candidates is outstanding.', name: 'Omar Farooq', role: 'HR Director, TechCorp' },
  { quote: 'The mentorship program connected me with industry experts who helped shape my career path.', name: 'Zara Khan', role: 'Business Student, LUMS' },
  { quote: 'Finally, a platform that takes internships seriously. Structured programs, real mentorship, verified certificates.', name: 'David Park', role: 'Career Services, FAST' },
  { quote: 'As a mentor, I can track my mentees\' progress and provide meaningful feedback. The tools are excellent.', name: 'Fatima Ali', role: 'Senior Engineer, dax' },
];

export const faqItems = [
  { question: 'What is ZYR0?', answer: 'ZYR0 is a platform connecting students with verified internship opportunities, mentors, and companies. We provide tools for career tracking, application management, and professional growth.' },
  { question: 'Is ZYR0 free for students?', answer: 'Yes, ZYR0 is completely free for students. You can browse internships, track applications, and access all core features without any cost.' },
  { question: 'How are companies verified?', answer: 'Every company on ZYR0 goes through a verification process including business registration checks, review of their internship program, and ongoing quality monitoring.' },
  { question: 'Can I apply to multiple internships?', answer: 'Yes, you can apply to as many internships as you want. Our application tracker helps you manage all your applications in one place.' },
  { question: 'How does the mentor program work?', answer: 'Mentors are experienced professionals who provide guidance to students. You can request a mentor based on your field of interest and get personalized career advice.' },
  { question: 'What certificates do I receive?', answer: 'Upon completing an internship, you receive a verified digital certificate with a unique verification code that employers can check on our platform.' },
  { question: 'How do I contact support?', answer: 'You can reach our support team through the contact page, email us at support@zyroo.org, or use the live chat feature on our platform.' },
  { question: 'Can companies post internships for free?', answer: 'Companies can post their first internship for free. Our paid plans start at $29/month for unlimited postings and advanced features.' },
  { question: 'Is my data secure?', answer: 'Yes, we use industry-standard encryption and security measures to protect your personal information. We never share your data with third parties without consent.' },
  { question: 'How do I get started?', answer: 'Simply click "Get started free" to create your account. You can complete your profile in minutes and start browsing internships right away.' },
];

export const footerNav = {
  quickLinks: [
    { label: 'Internships', href: '/internships' },
    { label: 'Research Agent', href: '/research' },
    { label: 'About', href: '/about' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
  ],
  pages: [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: 'Help Center', href: '/help' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
  social: [
    { label: 'LinkedIn', href: '#', icon: 'linkedin' },
    { label: 'X', href: '#', icon: 'twitter' },
    { label: 'GitHub', href: '#', icon: 'github' },
  ],
};
