// TypeScript types auto-generated from Supabase schema
// Run `npx supabase gen types typescript --project-id YOUR_PROJECT_ID` to regenerate
// For now these match our migrations exactly

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'student' | 'company' | 'mentor' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'pending';
export type CompanyStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type InternshipStatus = 'Active' | 'Closed' | 'Draft';
export type ApplicationStatus = 'Applied' | 'Under Review' | 'Shortlisted' | 'Accepted' | 'Rejected' | 'Withdrawn';
export type TaskStatus = 'Pending' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type CertificateStatus = 'Active' | 'Revoked';
export type OfferLetterStatus = 'Pending' | 'Sent' | 'Accepted' | 'Rejected' | 'Revoked' | 'Expired';
export type NotificationType = 'application' | 'task' | 'message' | 'certificate' | 'offer_letter' | 'system' | 'deadline';
export type EvaluationStatus = 'Draft' | 'Submitted';
export type LocationType = 'Remote' | 'On-site' | 'Hybrid';
export type InternshipType = 'Full-time' | 'Part-time' | 'Project-based';
export type StipendType = 'Paid' | 'Unpaid' | 'Academic Credit';
export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  status: UserStatus;
  university: string | null;
  graduation_year: number | null;
  bio: string | null;
  skills: string[];
  portfolio_url: string | null;
  resume_url: string | null;
  company_id: string | null;
  title: string | null;
  department: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  cover_gradient: string | null;
  industry: string | null;
  size: string | null;
  website: string | null;
  description: string | null;
  location: string | null;
  founded: string | null;
  email: string | null;
  phone: string | null;
  social_links: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  status: CompanyStatus;
  rating: number;
  review_count: number;
  owner_id: string | null;
  verified_at: string | null;
  verified_by: string | null;
  verification_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyTeamMember {
  id: string;
  company_id: string;
  user_id: string | null;
  name: string;
  role: string;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
}

export interface Internship {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  domain: string | null;
  location: string | null;
  location_type: LocationType | null;
  type: InternshipType | null;
  duration: string | null;
  start_date: string | null;
  deadline: string | null;
  stipend: string | null;
  stipend_type: StipendType | null;
  benefits: string[];
  status: InternshipStatus;
  education_level: string | null;
  experience_level: ExperienceLevel | null;
  openings: number;
  applicant_count: number;
  view_count: number;
  posted_date: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  company?: Company;
}

export interface Application {
  id: string;
  internship_id: string;
  student_id: string;
  status: ApplicationStatus;
  cover_letter: string | null;
  resume_url: string | null;
  answers: Record<string, string>;
  applied_at: string;
  updated_at: string;
  // Joined
  internship?: Internship;
  student?: Profile;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: string;
}

export interface Task {
  id: string;
  internship_id: string | null;
  title: string;
  description: string | null;
  assigned_to: string;
  assigned_by: string;
  due_date: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  attachments: TaskAttachment[];
  feedback: string | null;
  grade: number | null;
  objectives?: string[];
  acceptance_criteria?: string[];
  difficulty?: ExperienceLevel;
  estimated_duration?: string;
  created_at: string;
  updated_at: string;
  // Joined
  internship?: Internship;
  assignee?: Profile;
  assigner?: Profile;
  submissions?: TaskSubmission[];
}

export interface TaskSubmission {
  id: string;
  task_id: string;
  student_id: string;
  notes: string | null;
  attachments: TaskAttachment[];
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  feedback: string | null;
  grade: number | null;
  github_url?: string;
  live_demo_url?: string;
  submitted_at: string;
  student?: Profile;
}

export interface Certificate {
  id: string;
  title: string;
  recipient_id: string;
  company_id: string;
  internship_id: string | null;
  issue_date: string;
  credential_id: string;
  skills: string[];
  description: string | null;
  blockchain_hash: string | null;
  status: CertificateStatus;
  issued_by: string | null;
  created_at: string;
  // Joined
  recipient?: Profile;
  company?: Company;
  internship?: Internship;
}

export interface OfferLetter {
  id: string;
  internship_id: string;
  application_id: string;
  student_id: string;
  company_id: string;
  status: OfferLetterStatus;
  pdf_url: string | null;
  issued_at: string | null;
  expires_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  revoked_at: string | null;
  revoke_reason: string | null;
  email_sent: boolean;
  email_sent_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  student?: Profile;
  company?: Company;
  internship?: Internship;
  application?: Application;
}

export interface Conversation {
  id: string;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  participants?: Profile[];
  messages?: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachments: TaskAttachment[];
  read_by: string[];
  created_at: string;
  sender?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface SkillAssessment {
  skill: string;
  rating: number;
  comment: string;
}

export interface Evaluation {
  id: string;
  intern_id: string;
  mentor_id: string;
  internship_id: string | null;
  period: string | null;
  skills_assessment: SkillAssessment[];
  overall_rating: number | null;
  strengths: string | null;
  improvements: string | null;
  goals_achieved: string | null;
  recommend_certificate: boolean;
  would_rehire: boolean;
  additional_comments: string | null;
  status: EvaluationStatus;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  intern?: Profile;
  mentor?: Profile;
  internship?: Internship;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  target: string | null;
  target_type: string | null;
  details: string | null;
  ip_address: string | null;
  created_at: string;
  user?: Profile;
}

export interface WorkspaceEvent {
  id: string;
  internship_id: string;
  student_id: string;
  actor_id: string | null;
  event_type: 'offer_accepted' | 'task_assigned' | 'task_submitted' | 'task_approved' | 'task_rejected' | 'certificate_issued';
  title: string;
  description: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

// Supabase Database type (for createClient<Database>)
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      companies: { Row: Company; Insert: Partial<Company>; Update: Partial<Company> };
      company_team_members: { Row: CompanyTeamMember; Insert: Partial<CompanyTeamMember>; Update: Partial<CompanyTeamMember> };
      internships: { Row: Internship; Insert: Partial<Internship>; Update: Partial<Internship> };
      applications: { Row: Application; Insert: Partial<Application>; Update: Partial<Application> };
      tasks: { Row: Task; Insert: Partial<Task>; Update: Partial<Task> };
      task_submissions: { Row: TaskSubmission; Insert: Partial<TaskSubmission>; Update: Partial<TaskSubmission> };
      certificates: { Row: Certificate; Insert: Partial<Certificate>; Update: Partial<Certificate> };
      offer_letters: { Row: OfferLetter; Insert: Partial<OfferLetter>; Update: Partial<OfferLetter> };
      conversations: { Row: Conversation; Insert: Partial<Conversation>; Update: Partial<Conversation> };
      messages: { Row: Message; Insert: Partial<Message>; Update: Partial<Message> };
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> };
      evaluations: { Row: Evaluation; Insert: Partial<Evaluation>; Update: Partial<Evaluation> };
      activity_logs: { Row: ActivityLog; Insert: Partial<ActivityLog>; Update: Partial<ActivityLog> };
      workspace_events: { Row: WorkspaceEvent; Insert: Partial<WorkspaceEvent>; Update: Partial<WorkspaceEvent> };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      [_ in never]: never
    };
    Enums: {
      [_ in never]: never
    };
    CompositeTypes: {
      [_ in never]: never
    };
  };
}
