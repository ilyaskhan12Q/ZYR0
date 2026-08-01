import type { LucideIcon } from "lucide-react"
import { 
  Search, 
  FileCheck2, 
  UserCheck, 
  KanbanSquare, 
  Award, 
  Rocket, 
  CheckCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Building2,
  GraduationCap
} from "lucide-react"

export interface JourneyCardItem {
  id: string
  stepNumber: string
  title: string
  subtitle: string
  description: string
  badgeText: string
  badgeVariant: "cyan" | "emerald" | "amber" | "indigo" | "purple" | "blue"
  icon: LucideIcon
  tags: string[]
  stats?: { label: string; value: string }[]
  previewType: "filter_drops" | "profile_apply" | "selection_pipeline" | "workspace_sprint" | "verified_credential" | "career_launch"
  ctaText?: string
  ctaHref?: string
}

export const JOURNEY_CARDS: JourneyCardItem[] = [
  {
    id: "discover",
    stepNumber: "01",
    title: "Discover Internships",
    subtitle: "Explore Verified Drops Across Pakistan",
    description: "Browse structured internship opportunities filtered by domain, duration, stipend, and remote flexibility. Say goodbye to unverified social media postings.",
    badgeText: "Step 01 • Curated Listings",
    badgeVariant: "cyan",
    icon: Search,
    tags: ["Software Engineering", "AI & ML", "Product Design", "Cybersecurity", "Fintech"],
    stats: [
      { label: "Active Drops", value: "150+" },
      { label: "Partner Companies", value: "45+" }
    ],
    previewType: "filter_drops",
    ctaText: "Explore Opportunities",
    ctaHref: "/internships"
  },
  {
    id: "apply",
    stepNumber: "02",
    title: "Apply in Minutes",
    subtitle: "Unified Verified Student Profile",
    description: "Build a single, standardized profile showcasing your verified GitHub projects, skill rubrics, and academic credentials. Apply to multiple roles with one click.",
    badgeText: "Step 02 • One-Click Application",
    badgeVariant: "emerald",
    icon: FileCheck2,
    tags: ["Verified Skills", "GitHub Sync", "Resume Builder", "Instant Submission"],
    stats: [
      { label: "Avg. Apply Time", value: "< 2 mins" },
      { label: "Profile Verification", value: "Automated" }
    ],
    previewType: "profile_apply",
    ctaText: "Build Student Profile",
    ctaHref: "/register?role=student"
  },
  {
    id: "selected",
    stepNumber: "03",
    title: "Get Selected",
    subtitle: "Transparent Real-Time Pipeline",
    description: "Track your application status in real-time. Receive automated notifications as your application moves from review to technical screening and final selection.",
    badgeText: "Step 03 • Zero Uncertainty",
    badgeVariant: "indigo",
    icon: UserCheck,
    tags: ["Live Tracking", "Employer Feedback", "Automated Invites", "Shortlist Status"],
    stats: [
      { label: "Status Transparency", value: "100%" },
      { label: "Response Window", value: "48 Hours" }
    ],
    previewType: "selection_pipeline",
    ctaText: "View Hiring Dashboard",
    ctaHref: "/login"
  },
  {
    id: "projects",
    stepNumber: "04",
    title: "Work on Real Projects",
    subtitle: "Structured Mentorship Workspace",
    description: "Collaborate on real-world industry tasks with assigned company mentors. Submit milestones, receive rubric-based evaluations, and log progress inside ZYR0.",
    badgeText: "Step 04 • Hands-On Mentorship",
    badgeVariant: "amber",
    icon: KanbanSquare,
    tags: ["Sprint Kanban", "Mentor Reviews", "Code Submissions", "Milestone Tracking"],
    stats: [
      { label: "Milestone Completion", value: "Tracked" },
      { label: "Mentor Rating", value: "4.9/5.0" }
    ],
    previewType: "workspace_sprint",
    ctaText: "See Workspace Specs",
    ctaHref: "/about"
  },
  {
    id: "certificate",
    stepNumber: "05",
    title: "Receive Verified Certificate",
    subtitle: "Tamper-Proof Digital Credential",
    description: "Earn a cryptographically signed completion certificate with a unique verification ID and QR code. Instantly shareable on LinkedIn and embeddable on your resume.",
    badgeText: "Step 05 • Guaranteed Credibility",
    badgeVariant: "purple",
    icon: Award,
    tags: ["Cryptographic Hash", "QR Verification", "LinkedIn Badge", "PDF Export"],
    stats: [
      { label: "Verification SLA", value: "Instant" },
      { label: "Credential Type", value: "Tamper-Proof" }
    ],
    previewType: "verified_credential",
    ctaText: "Verify Sample Credential",
    ctaHref: "/verify"
  },
  {
    id: "career",
    stepNumber: "06",
    title: "Launch Your Career",
    subtitle: "Direct Transition into Full-Time Talent Pools",
    description: "Top-performing interns receive direct return offers and priority placement in employer hiring pools. Transform your internship into a permanent career launchpad.",
    badgeText: "Step 06 • Career Transition",
    badgeVariant: "blue",
    icon: Rocket,
    tags: ["Return Offers", "Direct Referrals", "Alumni Network", "Employer Spotlights"],
    stats: [
      { label: "Job Conversion", value: "78%" },
      { label: "Alumni Network", value: "Active" }
    ],
    previewType: "career_launch",
    ctaText: "Start Your Journey Free",
    ctaHref: "/register"
  }
]
