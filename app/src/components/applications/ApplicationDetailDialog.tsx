import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { FileText, GraduationCap, Mail, MapPin, BookOpen, ExternalLink } from 'lucide-react';
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
  const student = toStudent(application);
  const internship = toInternship(application);
  const resumeUrl = application?.resume_url || student?.resume_url;
  const skills = student?.skills || [];

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
              alt="" className="w-12 h-12 rounded-full object-cover" />
            <div className="space-y-1">
              <span className={cn('px-2.5 py-0.5 text-xs rounded-full font-medium', applicationStatusClass(application?.status))}>
                {application?.status}
              </span>
              <p className="text-xs text-muted-foreground">
                {internship?.title || 'Unknown internship'}
                {internship?.company?.name ? ` · ${internship.company.name}` : ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailItem label="University" value={student?.university} />
            <DetailItem label="Graduation Year" value={student?.graduation_year} />
            <DetailItem label="Portfolio" value={student?.portfolio_url} />
            <DetailItem label="Applied" value={formatDate(application?.applied_at)} />
          </div>

          {student?.bio && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">About</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{student.bio}</p>
            </div>
          )}

          {skills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s: string) => (
                  <span key={s} className="px-2.5 py-1 text-xs rounded-md bg-muted text-foreground">{s}</span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {student?.portfolio_url && (
              <a href={student.portfolio_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted/50 transition-colors">
                <GraduationCap className="w-3.5 h-3.5" /> Portfolio
              </a>
            )}
            {resumeUrl ? (
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted/50 transition-colors">
                <FileText className="w-3.5 h-3.5" /> Resume
              </a>
            ) : (
              <span className="px-3 py-1.5 rounded-lg border border-dashed border-border text-xs text-muted-foreground">No resume attached</span>
            )}
            {internship && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" /> {internship.location || 'Remote'}
              </span>
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