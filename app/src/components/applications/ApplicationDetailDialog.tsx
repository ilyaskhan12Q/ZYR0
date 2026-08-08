import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { FileText, GraduationCap, Mail, MapPin, BookOpen, ExternalLink, Phone, Globe, Github, Linkedin, Briefcase } from 'lucide-react';
import { applicationStatusClass } from '@/components/applications/status';
import { cn } from '@/lib/utils';

function toStudent(app: any) {
  return Array.isArray(app?.student) ? app.student[0] : app?.student;
}

function toInternship(app: any) {
  return Array.isArray(app?.internship) ? app.internship[0] : app?.internship;
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function DetailItem({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">{label}</p>
      <p className="text-sm font-medium break-words">{value || '—'}</p>
    </div>
  );
}

export default function ApplicationDetailDialog({
  application,
  open,
  onOpenChange,
}: {
  application: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [fetchedProfile, setFetchedProfile] = useState<any>(null);

  const rawStudent = toStudent(application);
  const studentId = application?.student_id || rawStudent?.id;

  useEffect(() => {
    if (open && studentId) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setFetchedProfile(data);
          }
        });
    } else {
      setFetchedProfile(null);
    }
  }, [open, studentId]);

  const student = fetchedProfile ? { ...rawStudent, ...fetchedProfile } : rawStudent;
  const internship = toInternship(application);
  const resumeUrl = application?.resume_url || student?.resume_url;
  const meta = student?.raw_user_meta_data || {};

  const skills: string[] = Array.isArray(student?.skills) && student.skills.length > 0
    ? student.skills
    : Array.isArray(meta.skills)
    ? meta.skills
    : typeof meta.skills === 'string'
    ? meta.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const university = student?.university || meta.university || meta.school;
  const graduationYear = student?.graduation_year || meta.graduation_year;
  const phone = student?.phone || meta.phone || meta.phone_number;
  const location = student?.location || meta.location || meta.address;
  const degree = student?.degree || meta.degree || meta.program;
  const major = student?.major || meta.major || meta.specialization;
  const academicYear = student?.academic_year || meta.academic_year || meta.academic_status;
  const roleInterest = student?.role_interest || meta.role_interest;
  const linkedin = student?.linkedin || meta.linkedin || meta.linkedin_url;
  const github = student?.github || meta.github || meta.github_url;
  const portfolioUrl = student?.portfolio_url || student?.website || meta.portfolio_url || meta.website;

  const answers: Record<string, string> = application?.answers && typeof application.answers === 'object'
    ? (application.answers as Record<string, string>)
    : {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{student?.full_name || 'Applicant'}</DialogTitle>
          <DialogDescription>
            {student?.email || 'No email'} · Applied {formatDate(application?.applied_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 text-sm">
          <div className="flex items-center gap-3">
            <img
              src={student?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student?.full_name || 'A')}`}
              alt="" className="w-12 h-12 rounded-full object-cover border border-border" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={cn('px-2.5 py-0.5 text-xs rounded-full font-medium', applicationStatusClass(application?.status))}>
                  {application?.status}
                </span>
                {roleInterest && (
                  <span className="px-2 py-0.5 text-xs rounded-md bg-accent/10 text-accent font-medium flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> {roleInterest}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {internship?.title || 'Unknown internship'}
                {internship?.company?.name ? ` · ${internship.company.name}` : ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border">
            <DetailItem label="University" value={university} />
            <DetailItem label="Degree / Program" value={degree} />
            <DetailItem label="Major / Specialization" value={major} />
            <DetailItem label="Academic Status" value={academicYear} />
            <DetailItem label="Graduation Year" value={graduationYear} />
            <DetailItem label="Phone Number" value={phone} />
            <DetailItem label="Location" value={location} />
            <DetailItem label="Applied On" value={formatDate(application?.applied_at)} />
          </div>

          {student?.bio && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">About Applicant</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground bg-card p-3 rounded-lg border border-border">{student.bio}</p>
            </div>
          )}

          {skills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Skills & Expertise</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s: string) => (
                  <span key={s} className="px-2.5 py-1 text-xs rounded-md bg-accent/10 text-accent font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {portfolioUrl && (
              <a href={portfolioUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">
                <Globe className="w-3.5 h-3.5 text-accent" /> Portfolio
              </a>
            )}
            {github && (
              <a href={github.startsWith('http') ? github : `https://${github}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">
                <Github className="w-3.5 h-3.5 text-foreground" /> GitHub
              </a>
            )}
            {linkedin && (
              <a href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">
                <Linkedin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> LinkedIn
              </a>
            )}
            {resumeUrl ? (
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-accent text-white transition-colors">
                <FileText className="w-3.5 h-3.5" /> Resume / CV
              </a>
            ) : (
              <span className="px-3 py-1.5 rounded-lg border border-dashed border-border text-xs text-muted-foreground">No resume attached</span>
            )}
          </div>

          {application?.cover_letter && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Cover Letter</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{application.cover_letter}</p>
            </div>
          )}

          {Object.keys(answers).length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Application Answers</p>
              {Object.entries(answers).map(([q, a]) => (
                <div key={q}>
                  <p className="text-sm font-medium">{q}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a}</p>
                </div>
              ))}
            </div>
          )}

          {internship && (
            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Internship</p>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium">{internship.title}</p>
                {internship?.company?.name && (
                  <span className="text-sm text-muted-foreground">
                    <ExternalLink className="w-3 h-3 inline mr-1" />
                    {internship.company.name}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}