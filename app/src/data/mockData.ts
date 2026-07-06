import {
  Building2, Users, GraduationCap, Award, Briefcase, BookOpen,
  Search, FileCheck, ClipboardList, MessageSquare, BarChart3, Settings,
  Shield, Bell, Mail, Home, FolderOpen, CheckSquare, TrendingUp,
  UserCog, LogOut, HelpCircle, Star, Clock, MapPin,
  DollarSign, Calendar, Bookmark, Share2, Download, Eye, Edit, Trash2,
  Plus, Filter, MoreHorizontal, CheckCircle2, XCircle, AlertCircle,
  Send, Paperclip, Phone, Globe, Linkedin, Github, Twitter, Lock,
  Target, Rocket, Heart, ThumbsUp, MessageCircle, Flag, BookmarkCheck,
  Smile
} from 'lucide-react';

// User Roles
export type UserRole = 'public' | 'student' | 'company' | 'mentor' | 'admin';

// User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  lastActive: string;
}

// Internship Interface
export interface Internship {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  companyId: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  domain: string;
  location: string;
  locationType: 'Remote' | 'On-site' | 'Hybrid';
  type: 'Full-time' | 'Part-time' | 'Project-based';
  duration: string;
  startDate: string;
  deadline: string;
  stipend: string;
  stipendType: 'Paid' | 'Unpaid' | 'Academic Credit';
  benefits: string[];
  status: 'Active' | 'Closed' | 'Draft';
  applicants: number;
  views: number;
  postedDate: string;
  educationLevel: string;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  openings: number;
}

// Application Interface
export interface Application {
  id: string;
  internshipId: string;
  internshipTitle: string;
  company: string;
  companyLogo: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  status: 'Applied' | 'Under Review' | 'Shortlisted' | 'Accepted' | 'Rejected' | 'Withdrawn';
  appliedDate: string;
  lastUpdated: string;
  resumeUrl?: string;
  coverLetter?: string;
  answers?: Record<string, string>;
}

// Task Interface
export interface Task {
  id: string;
  title: string;
  description: string;
  internshipId: string;
  internshipTitle: string;
  assignedTo: string;
  assignedToName: string;
  assignedToAvatar: string;
  assignedBy: string;
  dueDate: string;
  assignedDate: string;
  status: 'Pending' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  priority: 'High' | 'Medium' | 'Low';
  attachments: Attachment[];
  submissions: Submission[];
  feedback?: string;
  grade?: number;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: string;
}

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  submittedDate: string;
  notes: string;
  attachments: Attachment[];
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  feedback?: string;
  grade?: number;
}

// Certificate Interface
export interface Certificate {
  id: string;
  title: string;
  recipientName: string;
  recipientId: string;
  recipientAvatar: string;
  company: string;
  companyLogo: string;
  internshipTitle: string;
  issueDate: string;
  credentialId: string;
  skills: string[];
  description: string;
  qrCode: string;
  blockchainHash: string;
  status: 'Active' | 'Revoked';
}

// Message Interface
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    online: boolean;
  }[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

// Notification Interface
export interface Notification {
  id: string;
  userId: string;
  type: 'application' | 'task' | 'message' | 'certificate' | 'system' | 'deadline';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Company Interface
export interface Company {
  id: string;
  name: string;
  logo: string;
  cover: string;
  industry: string;
  size: string;
  website: string;
  description: string;
  location: string;
  founded: string;
  email: string;
  phone: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  status: 'Active' | 'Pending' | 'Suspended';
  internshipsPosted: number;
  totalApplicants: number;
  activeInterns: number;
  joinDate: string;
  rating: number;
  reviews: number;
  team: TeamMember[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
}

// Evaluation Interface
export interface Evaluation {
  id: string;
  internId: string;
  internName: string;
  internAvatar: string;
  mentorId: string;
  mentorName: string;
  internshipId: string;
  internshipTitle: string;
  period: string;
  skillsAssessment: {
    skill: string;
    rating: number;
    comment: string;
  }[];
  overallRating: number;
  strengths: string;
  improvements: string;
  goalsAchieved: string;
  recommendCertificate: boolean;
  wouldRehire: boolean;
  additionalComments: string;
  status: 'Draft' | 'Submitted';
  submittedDate?: string;
}

// Activity Log
export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  target: string;
  targetType: string;
  timestamp: string;
  details?: string;
}

// Dashboard Stats
export interface DashboardStats {
  label: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: string;
}

// ============================================
// MOCK DATA
// ============================================

export const currentUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@student.edu',
  avatar: 'https://i.pravatar.cc/150?u=alex',
  role: 'student',
  status: 'active',
  joinDate: '2024-09-15',
  lastActive: '2025-01-20T10:30:00Z',
};

export const users: User[] = [
  currentUser,
  { id: '2', name: 'Sarah Chen', email: 'sarah@techflow.io', avatar: 'https://i.pravatar.cc/150?u=sarah', role: 'company', status: 'active', joinDate: '2024-08-20', lastActive: '2025-01-20T09:00:00Z' },
  { id: '3', name: 'Dr. Michael Rodriguez', email: 'michael@university.edu', avatar: 'https://i.pravatar.cc/150?u=michael', role: 'mentor', status: 'active', joinDate: '2024-07-10', lastActive: '2025-01-19T15:00:00Z' },
  { id: '4', name: 'Emily Watson', email: 'emily@student.edu', avatar: 'https://i.pravatar.cc/150?u=emily', role: 'student', status: 'active', joinDate: '2024-10-05', lastActive: '2025-01-20T08:00:00Z' },
  { id: '5', name: 'James Park', email: 'james@student.edu', avatar: 'https://i.pravatar.cc/150?u=james', role: 'student', status: 'active', joinDate: '2024-09-01', lastActive: '2025-01-19T20:00:00Z' },
  { id: '6', name: 'Lisa Wang', email: 'lisa@designco.com', avatar: 'https://i.pravatar.cc/150?u=lisa', role: 'company', status: 'active', joinDate: '2024-06-15', lastActive: '2025-01-20T11:00:00Z' },
  { id: '7', name: 'Prof. David Kim', email: 'david@university.edu', avatar: 'https://i.pravatar.cc/150?u=david', role: 'mentor', status: 'active', joinDate: '2024-05-20', lastActive: '2025-01-18T14:00:00Z' },
  { id: '8', name: 'Admin User', email: 'admin@zyro.com', avatar: 'https://i.pravatar.cc/150?u=admin', role: 'admin', status: 'active', joinDate: '2024-01-01', lastActive: '2025-01-20T12:00:00Z' },
];

export const companies: Company[] = [
  {
    id: '1',
    name: 'TechFlow Inc.',
    logo: 'https://ui-avatars.com/api/?name=TechFlow&background=3B82F6&color=fff',
    cover: 'linear-gradient(135deg, #1E3A5F, #3B82F6)',
    industry: 'Technology',
    size: '51-200 employees',
    website: 'https://techflow.io',
    description: 'TechFlow is a leading technology company specializing in cloud infrastructure and AI-powered solutions. We help businesses transform their digital operations with cutting-edge technology.',
    location: 'San Francisco, CA',
    founded: '2018',
    email: 'careers@techflow.io',
    phone: '+1 (555) 123-4567',
    socialLinks: { linkedin: 'https://linkedin.com/company/techflow', twitter: 'https://twitter.com/techflow' },
    status: 'Active',
    internshipsPosted: 12,
    totalApplicants: 345,
    activeInterns: 15,
    joinDate: '2024-06-15',
    rating: 4.8,
    reviews: 42,
    team: [
      { id: '1', name: 'Sarah Chen', role: 'HR Manager', avatar: 'https://i.pravatar.cc/150?u=sarah', email: 'sarah@techflow.io' },
      { id: '2', name: 'John Smith', role: 'Engineering Lead', avatar: 'https://i.pravatar.cc/150?u=john', email: 'john@techflow.io' },
    ],
  },
  {
    id: '2',
    name: 'DesignCo',
    logo: 'https://ui-avatars.com/api/?name=DesignCo&background=8B5CF6&color=fff',
    cover: 'linear-gradient(135deg, #5B21B6, #8B5CF6)',
    industry: 'Design',
    size: '11-50 employees',
    website: 'https://designco.com',
    description: 'DesignCo is a creative agency focused on user experience and interface design. We craft beautiful, intuitive digital experiences for startups and enterprises.',
    location: 'New York, NY',
    founded: '2020',
    email: 'hello@designco.com',
    phone: '+1 (555) 987-6543',
    socialLinks: { linkedin: 'https://linkedin.com/company/designco', twitter: 'https://twitter.com/designco' },
    status: 'Active',
    internshipsPosted: 8,
    totalApplicants: 189,
    activeInterns: 8,
    joinDate: '2024-08-01',
    rating: 4.6,
    reviews: 28,
    team: [
      { id: '1', name: 'Lisa Wang', role: 'Creative Director', avatar: 'https://i.pravatar.cc/150?u=lisa', email: 'lisa@designco.com' },
    ],
  },
  {
    id: '3',
    name: 'DataMinds',
    logo: 'https://ui-avatars.com/api/?name=DataMinds&background=10B981&color=fff',
    cover: 'linear-gradient(135deg, #065F46, #10B981)',
    industry: 'Data Science',
    size: '51-200 employees',
    website: 'https://dataminds.ai',
    description: 'DataMinds leverages machine learning and big data analytics to solve complex business problems. Join us to work on cutting-edge AI projects.',
    location: 'Boston, MA',
    founded: '2019',
    email: 'careers@dataminds.ai',
    phone: '+1 (555) 456-7890',
    socialLinks: { linkedin: 'https://linkedin.com/company/dataminds', github: 'https://github.com/dataminds' },
    status: 'Active',
    internshipsPosted: 6,
    totalApplicants: 267,
    activeInterns: 10,
    joinDate: '2024-07-20',
    rating: 4.9,
    reviews: 35,
    team: [
      { id: '1', name: 'Robert Lee', role: 'Data Science Lead', avatar: 'https://i.pravatar.cc/150?u=robert', email: 'robert@dataminds.ai' },
    ],
  },
  {
    id: '4',
    name: 'CloudNine Systems',
    logo: 'https://ui-avatars.com/api/?name=CloudNine&background=F59E0B&color=fff',
    cover: 'linear-gradient(135deg, #92400E, #F59E0B)',
    industry: 'Cloud Computing',
    size: '201-500 employees',
    website: 'https://cloudnine.io',
    description: 'CloudNine provides enterprise cloud solutions with a focus on security and scalability.',
    location: 'Seattle, WA',
    founded: '2016',
    email: 'jobs@cloudnine.io',
    phone: '+1 (555) 234-5678',
    socialLinks: { linkedin: 'https://linkedin.com/company/cloudnine' },
    status: 'Active',
    internshipsPosted: 10,
    totalApplicants: 412,
    activeInterns: 20,
    joinDate: '2024-05-10',
    rating: 4.7,
    reviews: 56,
    team: [],
  },
  {
    id: '5',
    name: 'GreenStart',
    logo: 'https://ui-avatars.com/api/?name=GreenStart&background=059669&color=fff',
    cover: 'linear-gradient(135deg, #064E3B, #059669)',
    industry: 'Sustainability',
    size: '11-50 employees',
    website: 'https://greenstart.org',
    description: 'GreenStart builds technology solutions for environmental sustainability and climate action.',
    location: 'Portland, OR',
    founded: '2021',
    email: 'team@greenstart.org',
    phone: '+1 (555) 345-6789',
    socialLinks: { linkedin: 'https://linkedin.com/company/greenstart', twitter: 'https://twitter.com/greenstart' },
    status: 'Active',
    internshipsPosted: 4,
    totalApplicants: 98,
    activeInterns: 5,
    joinDate: '2024-09-01',
    rating: 4.5,
    reviews: 18,
    team: [],
  },
  {
    id: '6',
    name: 'NexGen Finance',
    logo: 'https://ui-avatars.com/api/?name=NexGen+Fin&background=DC2626&color=fff',
    cover: 'linear-gradient(135deg, #991B1B, #DC2626)',
    industry: 'FinTech',
    size: '51-200 employees',
    website: 'https://nexgen.finance',
    description: 'NexGen Finance is revolutionizing personal finance with AI-driven investment platforms.',
    location: 'New York, NY',
    founded: '2020',
    email: 'careers@nexgen.finance',
    phone: '+1 (555) 567-8901',
    socialLinks: { linkedin: 'https://linkedin.com/company/nexgenfinance' },
    status: 'Active',
    internshipsPosted: 7,
    totalApplicants: 234,
    activeInterns: 12,
    joinDate: '2024-06-20',
    rating: 4.4,
    reviews: 31,
    team: [],
  },
];

export const internships: Internship[] = [
  {
    id: '1',
    title: 'Software Engineering Intern',
    company: 'TechFlow Inc.',
    companyLogo: companies[0].logo,
    companyId: '1',
    description: 'Join our engineering team to build scalable web applications using modern technologies. You will work on real production features, participate in code reviews, and learn best practices from experienced engineers.',
    responsibilities: [
      'Develop and maintain web application features',
      'Write clean, well-tested code',
      'Participate in agile ceremonies',
      'Collaborate with designers and product managers',
    ],
    requirements: [
      'Currently pursuing CS or related degree',
      'Proficiency in JavaScript/TypeScript',
      'Familiarity with React or similar frameworks',
      'Basic understanding of databases',
    ],
    skills: ['React', 'TypeScript', 'Node.js', 'Git', 'REST APIs'],
    domain: 'Engineering',
    location: 'San Francisco, CA',
    locationType: 'Hybrid',
    type: 'Full-time',
    duration: '3-6 months',
    startDate: '2025-02-01',
    deadline: '2025-01-30',
    stipend: '$3,500/month',
    stipendType: 'Paid',
    benefits: ['Certificate', 'LOR', 'Flexible Hours', 'Mentorship'],
    status: 'Active',
    applicants: 45,
    views: 320,
    postedDate: '2025-01-05',
    educationLevel: 'Bachelor\'s (Pursuing)',
    experienceLevel: 'Beginner',
    openings: 3,
  },
  {
    id: '2',
    title: 'UI/UX Design Intern',
    company: 'DesignCo',
    companyLogo: companies[1].logo,
    companyId: '2',
    description: 'Work with our design team to create beautiful, user-centered interfaces for web and mobile applications. You will be involved in the entire design process from research to prototyping.',
    responsibilities: [
      'Create wireframes and high-fidelity mockups',
      'Conduct user research and usability testing',
      'Collaborate with developers on implementation',
      'Maintain and evolve design systems',
    ],
    requirements: [
      'Design student or recent graduate',
      'Proficiency in Figma',
      'Portfolio showcasing UI/UX work',
      'Understanding of design principles',
    ],
    skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'Design Systems'],
    domain: 'Design',
    location: 'New York, NY',
    locationType: 'Remote',
    type: 'Full-time',
    duration: '3 months',
    startDate: '2025-02-15',
    deadline: '2025-02-10',
    stipend: '$3,000/month',
    stipendType: 'Paid',
    benefits: ['Certificate', 'LOR', 'Portfolio Review'],
    status: 'Active',
    applicants: 38,
    views: 280,
    postedDate: '2025-01-08',
    educationLevel: 'Bachelor\'s (Pursuing)',
    experienceLevel: 'Beginner',
    openings: 2,
  },
  {
    id: '3',
    title: 'Data Science Intern',
    company: 'DataMinds',
    companyLogo: companies[2].logo,
    companyId: '3',
    description: 'Apply machine learning techniques to real-world datasets. Work on predictive modeling, data visualization, and AI-powered analytics tools.',
    responsibilities: [
      'Build and evaluate machine learning models',
      'Clean and analyze large datasets',
      'Create data visualizations and dashboards',
      'Present findings to stakeholders',
    ],
    requirements: [
      'Strong Python programming skills',
      'Knowledge of ML libraries (scikit-learn, TensorFlow)',
      'Statistics and mathematics background',
      'Experience with SQL',
    ],
    skills: ['Python', 'Machine Learning', 'SQL', 'Pandas', 'TensorFlow'],
    domain: 'Data Science',
    location: 'Boston, MA',
    locationType: 'On-site',
    type: 'Full-time',
    duration: '6 months',
    startDate: '2025-03-01',
    deadline: '2025-02-20',
    stipend: '$4,000/month',
    stipendType: 'Paid',
    benefits: ['Certificate', 'LOR', 'Conference Budget'],
    status: 'Active',
    applicants: 52,
    views: 410,
    postedDate: '2025-01-10',
    educationLevel: 'Master\'s (Pursuing)',
    experienceLevel: 'Intermediate',
    openings: 2,
  },
  {
    id: '4',
    title: 'Marketing Intern',
    company: 'TechFlow Inc.',
    companyLogo: companies[0].logo,
    companyId: '1',
    description: 'Help drive growth through digital marketing campaigns, content creation, and social media management.',
    responsibilities: [
      'Create content for social media channels',
      'Analyze campaign performance metrics',
      'Assist with email marketing campaigns',
      'Conduct market research',
    ],
    requirements: [
      'Marketing or communications student',
      'Strong writing skills',
      'Familiarity with social media platforms',
      'Basic analytics knowledge',
    ],
    skills: ['Social Media', 'Content Writing', 'SEO', 'Analytics', 'Canva'],
    domain: 'Marketing',
    location: 'San Francisco, CA',
    locationType: 'Hybrid',
    type: 'Part-time',
    duration: '3 months',
    startDate: '2025-02-01',
    deadline: '2025-01-25',
    stipend: '$2,500/month',
    stipendType: 'Paid',
    benefits: ['Certificate', 'LOR'],
    status: 'Active',
    applicants: 28,
    views: 195,
    postedDate: '2025-01-12',
    educationLevel: 'Bachelor\'s (Pursuing)',
    experienceLevel: 'Beginner',
    openings: 2,
  },
  {
    id: '5',
    title: 'DevOps Engineering Intern',
    company: 'CloudNine Systems',
    companyLogo: companies[3].logo,
    companyId: '4',
    description: 'Learn cloud infrastructure, CI/CD pipelines, and containerization while working on production systems.',
    responsibilities: [
      'Maintain CI/CD pipelines',
      'Manage cloud infrastructure (AWS/GCP)',
      'Implement monitoring and alerting',
      'Automate deployment processes',
    ],
    requirements: [
      'CS or related degree (pursuing)',
      'Basic Linux knowledge',
      'Familiarity with cloud concepts',
      'Scripting experience (Bash/Python)',
    ],
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
    domain: 'Engineering',
    location: 'Seattle, WA',
    locationType: 'Hybrid',
    type: 'Full-time',
    duration: '6 months',
    startDate: '2025-03-01',
    deadline: '2025-02-15',
    stipend: '$4,200/month',
    stipendType: 'Paid',
    benefits: ['Certificate', 'LOR', 'Cloud Certifications'],
    status: 'Active',
    applicants: 34,
    views: 290,
    postedDate: '2025-01-15',
    educationLevel: 'Bachelor\'s (Pursuing)',
    experienceLevel: 'Intermediate',
    openings: 2,
  },
  {
    id: '6',
    title: 'Product Management Intern',
    company: 'NexGen Finance',
    companyLogo: companies[5].logo,
    companyId: '6',
    description: 'Work closely with product teams to define features, analyze user feedback, and drive product strategy.',
    responsibilities: [
      'Assist in product roadmap planning',
      'Conduct user interviews and surveys',
      'Analyze competitor products',
      'Write product requirement documents',
    ],
    requirements: [
      'Business or engineering background',
      'Strong analytical skills',
      'Excellent communication abilities',
      'Interest in fintech',
    ],
    skills: ['Product Strategy', 'User Research', 'Analytics', 'Agile', 'Figma'],
    domain: 'Business',
    location: 'New York, NY',
    locationType: 'On-site',
    type: 'Full-time',
    duration: '3-6 months',
    startDate: '2025-02-15',
    deadline: '2025-02-05',
    stipend: '$3,800/month',
    stipendType: 'Paid',
    benefits: ['Certificate', 'LOR', 'Stock Options'],
    status: 'Active',
    applicants: 41,
    views: 340,
    postedDate: '2025-01-14',
    educationLevel: 'Bachelor\'s (Pursuing)',
    experienceLevel: 'Intermediate',
    openings: 1,
  },
  {
    id: '7',
    title: 'Sustainability Research Intern',
    company: 'GreenStart',
    companyLogo: companies[4].logo,
    companyId: '5',
    description: 'Research and analyze environmental data to support sustainability initiatives and green technology development.',
    responsibilities: [
      'Collect and analyze environmental data',
      'Research sustainability best practices',
      'Create reports and presentations',
      'Support grant writing efforts',
    ],
    requirements: [
      'Environmental science or related field',
      'Strong research skills',
      'Data analysis experience',
      'Passion for sustainability',
    ],
    skills: ['Research', 'Data Analysis', 'R', 'GIS', 'Technical Writing'],
    domain: 'Research',
    location: 'Portland, OR',
    locationType: 'Hybrid',
    type: 'Part-time',
    duration: '3 months',
    startDate: '2025-02-01',
    deadline: '2025-01-28',
    stipend: '$2,200/month',
    stipendType: 'Paid',
    benefits: ['Certificate', 'LOR', 'Field Work'],
    status: 'Active',
    applicants: 19,
    views: 150,
    postedDate: '2025-01-16',
    educationLevel: 'Bachelor\'s (Pursuing)',
    experienceLevel: 'Beginner',
    openings: 3,
  },
  {
    id: '8',
    title: 'Frontend Developer Intern',
    company: 'DesignCo',
    companyLogo: companies[1].logo,
    companyId: '2',
    description: 'Build responsive, accessible web interfaces using modern frontend technologies. Work directly with designers to bring concepts to life.',
    responsibilities: [
      'Implement responsive UI components',
      'Optimize web performance',
      'Ensure cross-browser compatibility',
      'Write unit and integration tests',
    ],
    requirements: [
      'HTML, CSS, JavaScript proficiency',
      'Experience with React or Vue',
      'Understanding of responsive design',
      'Version control with Git',
    ],
    skills: ['React', 'CSS3', 'JavaScript', 'Tailwind', 'Jest'],
    domain: 'Engineering',
    location: 'New York, NY',
    locationType: 'Remote',
    type: 'Full-time',
    duration: '3-6 months',
    startDate: '2025-02-20',
    deadline: '2025-02-12',
    stipend: '$3,200/month',
    stipendType: 'Paid',
    benefits: ['Certificate', 'LOR', 'Flexible Hours'],
    status: 'Active',
    applicants: 36,
    views: 275,
    postedDate: '2025-01-18',
    educationLevel: 'Bachelor\'s (Pursuing)',
    experienceLevel: 'Beginner',
    openings: 2,
  },
  {
    id: '9',
    title: 'Machine Learning Engineer Intern',
    company: 'DataMinds',
    companyLogo: companies[2].logo,
    companyId: '3',
    description: 'Build and deploy ML models for production systems. Work on NLP, computer vision, or recommendation systems.',
    responsibilities: [
      'Develop ML models for production',
      'Optimize model performance',
      'Build data pipelines',
      'Deploy models to cloud infrastructure',
    ],
    requirements: [
      'Strong Python and ML background',
      'Experience with deep learning frameworks',
      'Understanding of MLOps',
      'Cloud platform experience',
    ],
    skills: ['Python', 'PyTorch', 'AWS', 'Docker', 'MLOps'],
    domain: 'Data Science',
    location: 'Boston, MA',
    locationType: 'Hybrid',
    type: 'Full-time',
    duration: '6 months',
    startDate: '2025-03-15',
    deadline: '2025-03-01',
    stipend: '$4,500/month',
    stipendType: 'Paid',
    benefits: ['Certificate', 'LOR', 'GPU Access', 'Conference Budget'],
    status: 'Active',
    applicants: 29,
    views: 380,
    postedDate: '2025-01-12',
    educationLevel: 'Master\'s (Pursuing)',
    experienceLevel: 'Advanced',
    openings: 1,
  },
  {
    id: '10',
    title: 'Business Development Intern',
    company: 'CloudNine Systems',
    companyLogo: companies[3].logo,
    companyId: '4',
    description: 'Support business growth through market analysis, partnership development, and sales strategy.',
    responsibilities: [
      'Research potential markets and clients',
      'Assist in proposal development',
      'Track sales metrics and pipelines',
      'Support partnership negotiations',
    ],
    requirements: [
      'Business or marketing background',
      'Strong communication skills',
      'Analytical mindset',
      'Proficiency in CRM tools',
    ],
    skills: ['Sales', 'CRM', 'Market Research', 'Excel', 'Communication'],
    domain: 'Business',
    location: 'Seattle, WA',
    locationType: 'On-site',
    type: 'Full-time',
    duration: '3 months',
    startDate: '2025-02-10',
    deadline: '2025-01-30',
    stipend: '$3,000/month',
    stipendType: 'Paid',
    benefits: ['Certificate', 'LOR', 'Commission'],
    status: 'Active',
    applicants: 22,
    views: 180,
    postedDate: '2025-01-17',
    educationLevel: 'Bachelor\'s (Pursuing)',
    experienceLevel: 'Beginner',
    openings: 2,
  },
];

export const applications: Application[] = [
  {
    id: '1',
    internshipId: '1',
    internshipTitle: 'Software Engineering Intern',
    company: 'TechFlow Inc.',
    companyLogo: companies[0].logo,
    studentId: '1',
    studentName: 'Alex Johnson',
    studentAvatar: 'https://i.pravatar.cc/150?u=alex',
    status: 'Under Review',
    appliedDate: '2025-01-10',
    lastUpdated: '2025-01-15',
    coverLetter: 'I am excited to apply for this position...',
  },
  {
    id: '2',
    internshipId: '2',
    internshipTitle: 'UI/UX Design Intern',
    company: 'DesignCo',
    companyLogo: companies[1].logo,
    studentId: '1',
    studentName: 'Alex Johnson',
    studentAvatar: 'https://i.pravatar.cc/150?u=alex',
    status: 'Applied',
    appliedDate: '2025-01-14',
    lastUpdated: '2025-01-14',
  },
  {
    id: '3',
    internshipId: '5',
    internshipTitle: 'DevOps Engineering Intern',
    company: 'CloudNine Systems',
    companyLogo: companies[3].logo,
    studentId: '1',
    studentName: 'Alex Johnson',
    studentAvatar: 'https://i.pravatar.cc/150?u=alex',
    status: 'Shortlisted',
    appliedDate: '2025-01-08',
    lastUpdated: '2025-01-18',
  },
  {
    id: '4',
    internshipId: '7',
    internshipTitle: 'Sustainability Research Intern',
    company: 'GreenStart',
    companyLogo: companies[4].logo,
    studentId: '1',
    studentName: 'Alex Johnson',
    studentAvatar: 'https://i.pravatar.cc/150?u=alex',
    status: 'Accepted',
    appliedDate: '2025-01-05',
    lastUpdated: '2025-01-19',
  },
];

export const tasks: Task[] = [
  {
    id: '1',
    title: 'Build a REST API Endpoint',
    description: 'Create a RESTful API endpoint for user authentication using Node.js and Express. Include input validation, error handling, and JWT token generation.',
    internshipId: '1',
    internshipTitle: 'Software Engineering Intern',
    assignedTo: '1',
    assignedToName: 'Alex Johnson',
    assignedToAvatar: 'https://i.pravatar.cc/150?u=alex',
    assignedBy: 'Dr. Michael Rodriguez',
    dueDate: '2025-01-25',
    assignedDate: '2025-01-15',
    status: 'Pending',
    priority: 'High',
    attachments: [
      { id: '1', name: 'API_Specs.pdf', url: '#', type: 'pdf', size: '2.4 MB' },
      { id: '2', name: 'Starter_Code.zip', url: '#', type: 'zip', size: '1.1 MB' },
    ],
    submissions: [],
  },
  {
    id: '2',
    title: 'Design System Documentation',
    description: 'Document the component library including usage guidelines, props tables, and code examples for each component.',
    internshipId: '2',
    internshipTitle: 'UI/UX Design Intern',
    assignedTo: '1',
    assignedToName: 'Alex Johnson',
    assignedToAvatar: 'https://i.pravatar.cc/150?u=alex',
    assignedBy: 'Lisa Wang',
    dueDate: '2025-01-22',
    assignedDate: '2025-01-12',
    status: 'Submitted',
    priority: 'Medium',
    attachments: [],
    submissions: [
      {
        id: '1',
        studentId: '1',
        studentName: 'Alex Johnson',
        submittedDate: '2025-01-20',
        notes: 'Completed the documentation for all 24 components.',
        attachments: [
          { id: '3', name: 'Design_System_Docs.pdf', url: '#', type: 'pdf', size: '5.2 MB' },
        ],
        status: 'Under Review',
      },
    ],
  },
  {
    id: '3',
    title: 'Data Cleaning Script',
    description: 'Write a Python script to clean and preprocess the customer dataset. Handle missing values, outliers, and normalize numerical features.',
    internshipId: '3',
    internshipTitle: 'Data Science Intern',
    assignedTo: '1',
    assignedToName: 'Alex Johnson',
    assignedToAvatar: 'https://i.pravatar.cc/150?u=alex',
    assignedBy: 'Prof. David Kim',
    dueDate: '2025-01-28',
    assignedDate: '2025-01-14',
    status: 'Pending',
    priority: 'High',
    attachments: [
      { id: '4', name: 'customer_dataset.csv', url: '#', type: 'csv', size: '15.6 MB' },
    ],
    submissions: [],
  },
  {
    id: '4',
    title: 'Write Sustainability Report',
    description: 'Compile research findings into a comprehensive sustainability report for the quarterly board meeting.',
    internshipId: '7',
    internshipTitle: 'Sustainability Research Intern',
    assignedTo: '1',
    assignedToName: 'Alex Johnson',
    assignedToAvatar: 'https://i.pravatar.cc/150?u=alex',
    assignedBy: 'Dr. Michael Rodriguez',
    dueDate: '2025-01-30',
    assignedDate: '2025-01-16',
    status: 'Pending',
    priority: 'Medium',
    attachments: [],
    submissions: [],
  },
  {
    id: '5',
    title: 'Unit Tests for Auth Module',
    description: 'Write comprehensive unit tests for the authentication module achieving at least 90% code coverage.',
    internshipId: '1',
    internshipTitle: 'Software Engineering Intern',
    assignedTo: '1',
    assignedToName: 'Alex Johnson',
    assignedToAvatar: 'https://i.pravatar.cc/150?u=alex',
    assignedBy: 'Dr. Michael Rodriguez',
    dueDate: '2025-02-01',
    assignedDate: '2025-01-17',
    status: 'Approved',
    priority: 'Low',
    attachments: [],
    submissions: [
      {
        id: '2',
        studentId: '1',
        studentName: 'Alex Johnson',
        submittedDate: '2025-01-19',
        notes: 'Achieved 94% code coverage.',
        attachments: [
          { id: '5', name: 'test_coverage_report.html', url: '#', type: 'html', size: '156 KB' },
        ],
        status: 'Approved',
        feedback: 'Excellent work! The tests are well-structured and cover all edge cases.',
        grade: 95,
      },
    ],
  },
];

export const certificates: Certificate[] = [
  {
    id: '1',
    title: 'Software Engineering Internship Certificate',
    recipientName: 'Alex Johnson',
    recipientId: '1',
    recipientAvatar: 'https://i.pravatar.cc/150?u=alex',
    company: 'TechFlow Inc.',
    companyLogo: companies[0].logo,
    internshipTitle: 'Software Engineering Intern',
    issueDate: '2024-12-15',
    credentialId: 'ZYRO-SE-2024-001234',
    skills: ['React', 'Node.js', 'TypeScript', 'Git', 'REST APIs'],
    description: 'Successfully completed a 6-month software engineering internship, demonstrating proficiency in full-stack development.',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ZYRO-SE-2024-001234',
    blockchainHash: '0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9',
    status: 'Active',
  },
  {
    id: '2',
    title: 'Data Science Internship Certificate',
    recipientName: 'Alex Johnson',
    recipientId: '1',
    recipientAvatar: 'https://i.pravatar.cc/150?u=alex',
    company: 'DataMinds',
    companyLogo: companies[2].logo,
    internshipTitle: 'Data Science Intern',
    issueDate: '2024-08-30',
    credentialId: 'ZYRO-DS-2024-005678',
    skills: ['Python', 'Machine Learning', 'SQL', 'Pandas', 'TensorFlow'],
    description: 'Completed a 3-month data science internship with outstanding performance in predictive modeling.',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ZYRO-DS-2024-005678',
    blockchainHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
    status: 'Active',
  },
];

export const conversations: Conversation[] = [
  {
    id: '1',
    participants: [
      { id: '1', name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=alex', role: 'Student', online: true },
      { id: '3', name: 'Dr. Michael Rodriguez', avatar: 'https://i.pravatar.cc/150?u=michael', role: 'Mentor', online: true },
    ],
    lastMessage: 'Great work on the API endpoint! A few suggestions...',
    lastMessageTime: '2025-01-20T10:00:00Z',
    unreadCount: 2,
    messages: [
      {
        id: '1',
        conversationId: '1',
        senderId: '3',
        senderName: 'Dr. Michael Rodriguez',
        senderAvatar: 'https://i.pravatar.cc/150?u=michael',
        content: 'Hi Alex! I have reviewed your API submission. Overall excellent work!',
        timestamp: '2025-01-20T09:30:00Z',
        read: true,
      },
      {
        id: '2',
        conversationId: '1',
        senderId: '1',
        senderName: 'Alex Johnson',
        senderAvatar: 'https://i.pravatar.cc/150?u=alex',
        content: 'Thank you, Dr. Rodriguez! I appreciate the feedback.',
        timestamp: '2025-01-20T09:45:00Z',
        read: true,
      },
      {
        id: '3',
        conversationId: '1',
        senderId: '3',
        senderName: 'Dr. Michael Rodriguez',
        senderAvatar: 'https://i.pravatar.cc/150?u=michael',
        content: 'Great work on the API endpoint! A few suggestions for improvement...',
        timestamp: '2025-01-20T10:00:00Z',
        read: false,
      },
    ],
  },
  {
    id: '2',
    participants: [
      { id: '1', name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=alex', role: 'Student', online: false },
      { id: '2', name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?u=sarah', role: 'Company HR', online: true },
    ],
    lastMessage: 'Your application has been shortlisted for the next round.',
    lastMessageTime: '2025-01-19T14:30:00Z',
    unreadCount: 1,
    messages: [
      {
        id: '4',
        conversationId: '2',
        senderId: '2',
        senderName: 'Sarah Chen',
        senderAvatar: 'https://i.pravatar.cc/150?u=sarah',
        content: 'Hello Alex, congratulations!',
        timestamp: '2025-01-19T14:00:00Z',
        read: true,
      },
      {
        id: '5',
        conversationId: '2',
        senderId: '2',
        senderName: 'Sarah Chen',
        senderAvatar: 'https://i.pravatar.cc/150?u=sarah',
        content: 'Your application has been shortlisted for the next round.',
        timestamp: '2025-01-19T14:30:00Z',
        read: false,
      },
    ],
  },
];

export const notifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    type: 'application',
    title: 'Application Status Updated',
    message: 'Your application for DevOps Engineering Intern has been shortlisted.',
    read: false,
    createdAt: '2025-01-20T09:00:00Z',
    actionUrl: '/student/applications/3',
  },
  {
    id: '2',
    userId: '1',
    type: 'task',
    title: 'New Task Assigned',
    message: 'Dr. Rodriguez assigned you a new task: "Build a REST API Endpoint"',
    read: false,
    createdAt: '2025-01-20T08:30:00Z',
    actionUrl: '/student/tasks/1',
  },
  {
    id: '3',
    userId: '1',
    type: 'message',
    title: 'New Message',
    message: 'Dr. Rodriguez sent you a message about your API submission.',
    read: false,
    createdAt: '2025-01-20T10:00:00Z',
    actionUrl: '/student/messages/1',
  },
  {
    id: '4',
    userId: '1',
    type: 'deadline',
    title: 'Deadline Approaching',
    message: 'Task "Design System Documentation" is due in 2 days.',
    read: true,
    createdAt: '2025-01-19T16:00:00Z',
    actionUrl: '/student/tasks/2',
  },
  {
    id: '5',
    userId: '1',
    type: 'certificate',
    title: 'Certificate Issued',
    message: 'Your Software Engineering Internship Certificate has been issued!',
    read: true,
    createdAt: '2025-01-15T12:00:00Z',
    actionUrl: '/student/certificates/1',
  },
];

export const evaluations: Evaluation[] = [
  {
    id: '1',
    internId: '1',
    internName: 'Alex Johnson',
    internAvatar: 'https://i.pravatar.cc/150?u=alex',
    mentorId: '3',
    mentorName: 'Dr. Michael Rodriguez',
    internshipId: '1',
    internshipTitle: 'Software Engineering Intern',
    period: 'Q4 2024',
    skillsAssessment: [
      { skill: 'JavaScript/TypeScript', rating: 5, comment: 'Excellent understanding of language features and patterns' },
      { skill: 'React Development', rating: 4, comment: 'Strong component design skills' },
      { skill: 'Backend Development', rating: 4, comment: 'Good API design, needs more optimization work' },
      { skill: 'Problem Solving', rating: 5, comment: 'Exceptional analytical abilities' },
      { skill: 'Communication', rating: 4, comment: 'Clear and concise in standups' },
      { skill: 'Teamwork', rating: 5, comment: 'Great collaborator, helps others' },
    ],
    overallRating: 4.5,
    strengths: 'Strong technical foundation, quick learner, excellent problem solver',
    improvements: 'Could improve on code documentation and testing practices',
    goalsAchieved: 'All primary goals achieved. Exceeded expectations on API development.',
    recommendCertificate: true,
    wouldRehire: true,
    additionalComments: 'One of the strongest interns we have had. Highly recommended for full-time roles.',
    status: 'Submitted',
    submittedDate: '2024-12-20',
  },
];

export const activities: Activity[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Alex Johnson',
    userAvatar: 'https://i.pravatar.cc/150?u=alex',
    action: 'submitted task',
    target: 'Design System Documentation',
    targetType: 'task',
    timestamp: '2025-01-20T10:30:00Z',
  },
  {
    id: '2',
    userId: '4',
    userName: 'Emily Watson',
    userAvatar: 'https://i.pravatar.cc/150?u=emily',
    action: 'applied to',
    target: 'UI/UX Design Intern',
    targetType: 'internship',
    timestamp: '2025-01-20T09:15:00Z',
  },
  {
    id: '3',
    userId: '2',
    userName: 'Sarah Chen',
    userAvatar: 'https://i.pravatar.cc/150?u=sarah',
    action: 'posted',
    target: 'Mobile Developer Intern',
    targetType: 'internship',
    timestamp: '2025-01-20T08:00:00Z',
  },
  {
    id: '4',
    userId: '3',
    userName: 'Dr. Michael Rodriguez',
    userAvatar: 'https://i.pravatar.cc/150?u=michael',
    action: 'approved',
    target: 'Unit Tests for Auth Module',
    targetType: 'task',
    timestamp: '2025-01-19T16:00:00Z',
  },
  {
    id: '5',
    userId: '1',
    userName: 'Alex Johnson',
    userAvatar: 'https://i.pravatar.cc/150?u=alex',
    action: 'received certificate',
    target: 'Software Engineering Internship',
    targetType: 'certificate',
    timestamp: '2025-01-15T12:00:00Z',
  },
];

export const studentStats = [
  { label: 'Active Applications', value: 4, change: 1, changeType: 'increase' as const, icon: 'FileCheck' },
  { label: 'Pending Tasks', value: 3, change: -1, changeType: 'decrease' as const, icon: 'ClipboardList' },
  { label: 'Completed Internships', value: 2, change: 0, changeType: 'increase' as const, icon: 'Briefcase' },
  { label: 'Certificates', value: 2, change: 1, changeType: 'increase' as const, icon: 'Award' },
];

export const companyStats = [
  { label: 'Active Internships', value: 5, change: 2, changeType: 'increase' as const, icon: 'FolderOpen' },
  { label: 'Total Applicants', value: 127, change: 15, changeType: 'increase' as const, icon: 'Users' },
  { label: 'Active Interns', value: 8, change: 3, changeType: 'increase' as const, icon: 'GraduationCap' },
  { label: 'Certificates Issued', value: 12, change: 2, changeType: 'increase' as const, icon: 'Award' },
];

export const mentorStats = [
  { label: 'Active Interns', value: 5, change: 1, changeType: 'increase' as const, icon: 'Users' },
  { label: 'Pending Reviews', value: 3, change: -2, changeType: 'decrease' as const, icon: 'ClipboardList' },
  { label: 'Reviews This Week', value: 8, change: 3, changeType: 'increase' as const, icon: 'CheckSquare' },
  { label: 'Avg. Rating', value: 4.5, change: 0.2, changeType: 'increase' as const, icon: 'Star' },
];

export const adminStats = [
  { label: 'Total Users', value: 1250, change: 45, changeType: 'increase' as const, icon: 'Users' },
  { label: 'Active Internships', value: 68, change: 12, changeType: 'increase' as const, icon: 'FolderOpen' },
  { label: 'Applications This Month', value: 342, change: 28, changeType: 'increase' as const, icon: 'FileCheck' },
  { label: 'Certificates Issued', value: 189, change: 15, changeType: 'increase' as const, icon: 'Award' },
  { label: 'Pending Verifications', value: 5, change: -3, changeType: 'decrease' as const, icon: 'Shield' },
  { label: 'Platform Uptime', value: 99.9, change: 0, changeType: 'increase' as const, icon: 'Zap' },
];

export const navIcons: Record<string, React.ElementType> = {
  Home, FolderOpen, FileCheck, ClipboardList, CheckSquare, Award, Briefcase,
  BookOpen, BarChart3, Users, UserCog, Settings, Shield, Bell, Mail,
  MessageSquare, TrendingUp, LogOut, HelpCircle, Search, Bookmark, Star,
  Clock, MapPin, DollarSign, Calendar, Share2, Download, Eye, Edit, Trash2,
  Plus, Filter, MoreHorizontal, CheckCircle2, XCircle, AlertCircle, Send,
  Paperclip, Smile, Phone, Globe, Linkedin, Github, Twitter, Lock, Target, Rocket, Heart,
  ThumbsUp, MessageCircle, Flag, BookmarkCheck, Building2, GraduationCap,
};
