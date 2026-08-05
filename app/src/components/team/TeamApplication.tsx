import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Briefcase, CalendarClock, Check, CheckCircle2,
  ChevronDown, FileText, FileUp, Github, Globe, GraduationCap, Linkedin,
  Loader2, LogIn, Mail, PartyPopper, Send, Sparkles, User, UserCheck, X,
} from 'lucide-react';
import { Reveal, SectionHeading } from './SectionHeading';
import {
  APPLICATION_STEPS,
  ACADEMIC_YEARS,
  AVAILABILITY_OPTIONS,
  GENDER_OPTIONS,
  TEAM_ROLES,
  TEAM_SKILLS,
} from './team-data';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { submitTeamApplication } from '@/services/teamApplications';
import { SITE_CONFIG } from '@/config/site';

/* ────────────────────────────────────────────────────────────────
   Types & constants
   ──────────────────────────────────────────────────────────────── */

interface ApplicationData {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  university: string;
  degreeProgram: string;
  academicYear: string;
  github: string;
  linkedin: string;
  portfolio: string;
  resume: File | null;
  preferredRole: string;
  secondaryRole: string;
  skills: string[];
  projects: string;
  availability: string;
  motivation: string;
  agreement: boolean;
}

type Errors = Partial<Record<keyof ApplicationData, string>>;

const INITIAL_DATA: ApplicationData = {
  fullName: '',
  email: '',
  phone: '',
  gender: '',
  university: '',
  degreeProgram: '',
  academicYear: '',
  github: '',
  linkedin: '',
  portfolio: '',
  resume: null,
  preferredRole: '',
  secondaryRole: '',
  skills: [],
  projects: '',
  availability: '',
  motivation: '',
  agreement: false,
};

const INPUT_CLASSES =
  'w-full px-3.5 py-2.5 bg-background dark:bg-slate-950/50 border border-border dark:border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed';
const FIELD_LABEL = 'text-sm font-medium mb-1.5 block text-slate-900 dark:text-white';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s()-]{7,17}$/;
const MAX_RESUME_MB = 5;
const ALLOWED_RESUME_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const STEP_FIELDS: (keyof ApplicationData)[][] = [
  ['fullName', 'email', 'phone', 'gender', 'university', 'degreeProgram', 'academicYear'],
  ['github', 'resume'],
  ['preferredRole', 'skills'],
  ['availability', 'motivation', 'agreement'],
];

function validateStep(step: number, data: ApplicationData): Errors {
  const errors: Errors = {};
  const value = (field: keyof ApplicationData) => (data[field] as string | undefined)?.trim() ?? '';

  if (step === 0) {
    if (value('fullName').length < 2) errors.fullName = 'Please enter your full name.';
    if (!EMAIL_RE.test(value('email'))) errors.email = 'Please enter a valid email address.';
    if (!PHONE_RE.test(value('phone'))) errors.phone = 'Please enter a valid phone number (e.g. +92 300 1234567).';
    if (!data.gender) errors.gender = 'Please select your gender.';
    if (value('university').length < 2) errors.university = 'Please enter your university or institute.';
    if (value('degreeProgram').length < 2) errors.degreeProgram = 'Please enter your degree program.';
    if (!data.academicYear) errors.academicYear = 'Please select your academic year.';
  }

  if (step === 1) {
    if (value('github').length < 3) errors.github = 'Please provide your GitHub username or profile URL.';
    if (!data.resume) {
      errors.resume = 'Please attach your resume (PDF or DOC/DOCX).';
    } else {
      if (data.resume.size > MAX_RESUME_MB * 1024 * 1024) {
        errors.resume = `Resume must be under ${MAX_RESUME_MB} MB.`;
      }
      if (!ALLOWED_RESUME_TYPES.includes(data.resume.type)) {
        errors.resume = 'Resume must be a PDF or DOC/DOCX file.';
      }
    }
  }

  if (step === 2) {
    if (!data.preferredRole) errors.preferredRole = 'Please choose your preferred role.';
    if (data.skills.length === 0) errors.skills = 'Select at least one technical skill.';
  }

  if (step === 3) {
    if (!data.availability) errors.availability = 'Please select your weekly availability.';
    if (value('motivation').length < 30) {
      errors.motivation = 'Please write at least 30 characters about why you want to join.';
    }
    if (!data.agreement) errors.agreement = 'Please confirm the commitment statement.';
  }

  return errors;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ────────────────────────────────────────────────────────────────
   Field components
   ──────────────────────────────────────────────────────────────── */

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs text-rose-600 dark:text-rose-400" role="alert">
      {message}
    </p>
  );
}

function TextField({
  id, label, value, onChange, placeholder, type = 'text', error, optional = false, required = true,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  optional?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className={FIELD_LABEL}>
        {label} {optional ? <span className="text-muted-foreground font-normal">(optional)</span> : required && <span className="text-rose-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(INPUT_CLASSES, error && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400/20')}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function SelectField({
  id, label, value, onChange, options, placeholder, error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className={FIELD_LABEL}>
        {label} <span className="text-rose-500">*</span>
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(INPUT_CLASSES, 'appearance-none pr-10', error && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400/20')}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Main component
   ──────────────────────────────────────────────────────────────── */

export function TeamApplication({ preferredRole }: { preferredRole: string }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ApplicationData>(INITIAL_DATA);
  const [errors, setErrors] = useState<Errors>({});
  const [visited, setVisited] = useState<boolean[]>([true, false, false, false, false]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  /* Sync a role picked from the Open Roles section */
  useEffect(() => {
    if (preferredRole && !data.preferredRole) {
      setData((d) => ({ ...d, preferredRole }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferredRole]);

  const set = <K extends keyof ApplicationData>(key: K, value: ApplicationData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const goNext = () => {
    const stepErrors = validateStep(step, data);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    const next = Math.min(step + 1, APPLICATION_STEPS.length - 1);
    setStep(next);
    setVisited((v) => v.map((was, i) => was || i <= next));
  };

  const goBack = () => {
    if (step === 0) return;
    setErrors({});
    setStep((s) => s - 1);
  };

  const jumpTo = (target: number) => {
    if (!visited[target]) return;
    if (target < step) {
      setErrors({});
      setStep(target);
    }
  };

  const handleSubmit = async () => {
    const stepErrors = validateStep(3, data);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      setStep(3);
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    try {
      const { error } = await submitTeamApplication(data);
      if (error) throw error;
      setSubmitted(true);
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      console.error('Failed to submit team application:', err);
      setSubmitError(
        'Something went wrong while submitting. Please try again in a moment — your answers are still here.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const totalSteps = APPLICATION_STEPS.length;
  const progress = Math.round(((step + 1) / totalSteps) * 100);
  const selectedRoleTitle = TEAM_ROLES.find((r) => r.id === data.preferredRole)?.title ?? data.preferredRole;

  return (
    <section className="py-14 lg:py-20 px-4 bg-transparent content-visibility-auto" id="team-apply">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Application"
          title={user ? 'Start your application' : 'Sign in to apply'}
          accent={user ? 'in under ten minutes' : 'to the founding team'}
          description={
            user
              ? 'Four short steps, one review. No long forms, no gatekeeping — just honest questions so we can find the right seat for you.'
              : 'Applications for the founding team are linked to your ZYR0 account. Create a free account or sign in to start — it takes under two minutes.'
          }
          icon={Send}
        />

        <div ref={formRef} id="team-apply-form" className="max-w-3xl mx-auto scroll-mt-24">
          <Reveal>
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
              {!user ? (
                <SignInGate />
              ) : submitted ? (
                <SuccessScreen onRestart={() => { setSubmitted(false); setStep(0); setData(INITIAL_DATA); setVisited([true, false, false, false, false]); }} />
              ) : (
                <div className="p-6 sm:p-10">
                  {/* Progress header */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Step {step + 1} of {totalSteps} — {APPLICATION_STEPS[step].label}
                      </p>
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-sky-400">
                        {progress}%
                      </span>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden"
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Step tabs */}
                    <ol className="mt-5 flex flex-wrap gap-2" aria-label="Application steps">
                      {APPLICATION_STEPS.map((s, i) => {
                        const active = i === step;
                        const done = i < step;
                        return (
                          <li key={s.id}>
                            <button
                              type="button"
                              onClick={() => jumpTo(i)}
                              disabled={!visited[i] || i === step}
                              aria-current={active ? 'step' : undefined}
                              className={cn(
                                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200',
                                active
                                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-600/25'
                                  : done
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                                    : 'bg-white/60 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-white/10 cursor-not-allowed'
                              )}
                            >
                              {done ? <Check className="w-3 h-3" /> : <span className="font-mono">{i + 1}</span>}
                              {s.label}
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  </div>

                  {/* Step content */}
                  <div key={step} className="animate-fade-in">
                    {step === 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="sm:col-span-2">
                          <TextField
                            id="app-fullName" label="Full Name" placeholder="e.g. Ayesha Khan"
                            value={data.fullName} onChange={(v) => set('fullName', v)} error={errors.fullName}
                          />
                        </div>
                        <TextField
                          id="app-email" label="Email Address" type="email" placeholder="you@example.com"
                          value={data.email} onChange={(v) => set('email', v)} error={errors.email}
                        />
                        <TextField
                          id="app-phone" label="Phone Number" type="tel" placeholder="+92 300 1234567"
                          value={data.phone} onChange={(v) => set('phone', v)} error={errors.phone}
                        />
                        <SelectField
                          id="app-gender" label="Gender"
                          value={data.gender} onChange={(v) => set('gender', v)}
                          options={GENDER_OPTIONS} placeholder="Select" error={errors.gender}
                        />
                        <TextField
                          id="app-university" label="University / Institute" placeholder="e.g. NUST"
                          value={data.university} onChange={(v) => set('university', v)} error={errors.university}
                        />
                        <TextField
                          id="app-degree" label="Degree Program" placeholder="e.g. BS Computer Science"
                          value={data.degreeProgram} onChange={(v) => set('degreeProgram', v)} error={errors.degreeProgram}
                        />
                        <SelectField
                          id="app-year" label="Academic Year"
                          value={data.academicYear} onChange={(v) => set('academicYear', v)}
                          options={ACADEMIC_YEARS} placeholder="Select your year" error={errors.academicYear}
                        />
                      </div>
                    )}

                    {step === 1 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="sm:col-span-2">
                          <TextField
                            id="app-github" label="GitHub Profile" placeholder="username or https://github.com/..."
                            value={data.github} onChange={(v) => set('github', v)} error={errors.github}
                          />
                        </div>
                        <TextField
                          id="app-linkedin" label="LinkedIn" placeholder="username or profile URL" optional
                          value={data.linkedin} onChange={(v) => set('linkedin', v)} error={errors.linkedin}
                        />
                        <TextField
                          id="app-portfolio" label="Portfolio / Website" placeholder="https://..." optional
                          value={data.portfolio} onChange={(v) => set('portfolio', v)} error={errors.portfolio}
                        />
                        <div className="sm:col-span-2">
                          <label htmlFor="app-resume" className={FIELD_LABEL}>
                            Resume <span className="text-rose-500">*</span>
                          </label>
                          {data.resume ? (
                            <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{data.resume.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{formatBytes(data.resume.size)}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => set('resume', null)}
                                className="p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                                aria-label="Remove resume"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <label
                              htmlFor="app-resume"
                              className={cn(
                                'flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors',
                                errors.resume
                                  ? 'border-rose-400/60 bg-rose-500/5 hover:border-rose-400'
                                  : 'border-slate-300 dark:border-white/15 hover:border-blue-400/60 hover:bg-blue-500/5'
                              )}
                            >
                              <FileUp className="w-6 h-6 text-blue-600 dark:text-sky-400" />
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Click to upload your resume
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                PDF or Word · max {MAX_RESUME_MB} MB
                              </span>
                              <input
                                id="app-resume"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="sr-only"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] ?? null;
                                  set('resume', file);
                                  e.target.value = '';
                                }}
                              />
                            </label>
                          )}
                          <FieldError id="app-resume-error" message={errors.resume} />
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div>
                            <label htmlFor="app-preferredRole" className={FIELD_LABEL}>
                              Preferred Role <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <select
                                id="app-preferredRole"
                                value={data.preferredRole}
                                onChange={(e) => set('preferredRole', e.target.value)}
                                aria-invalid={!!errors.preferredRole}
                                aria-describedby={errors.preferredRole ? 'app-preferredRole-error' : undefined}
                                className={cn(INPUT_CLASSES, 'appearance-none pr-10', errors.preferredRole && 'border-rose-400')}
                              >
                                <option value="">Select a role</option>
                                {TEAM_ROLES.map((role) => (
                                  <option key={role.id} value={role.id}>
                                    {role.title} — {role.department}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                            <FieldError id="app-preferredRole-error" message={errors.preferredRole} />
                          </div>
                          <div>
                            <label htmlFor="app-secondaryRole" className={FIELD_LABEL}>
                              Secondary Role <span className="text-muted-foreground font-normal">(optional)</span>
                            </label>
                            <div className="relative">
                              <select
                                id="app-secondaryRole"
                                value={data.secondaryRole}
                                onChange={(e) => set('secondaryRole', e.target.value)}
                                className={cn(INPUT_CLASSES, 'appearance-none pr-10')}
                              >
                                <option value="">None</option>
                                {TEAM_ROLES.filter((r) => r.id !== data.preferredRole).map((role) => (
                                  <option key={role.id} value={role.id}>
                                    {role.title} — {role.department}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className={FIELD_LABEL}>
                            Technical Skills <span className="text-rose-500">*</span>
                            <span className="text-muted-foreground font-normal"> · select all that apply</span>
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {TEAM_SKILLS.map((skill) => {
                              const active = data.skills.includes(skill);
                              return (
                                <button
                                  key={skill}
                                  type="button"
                                  aria-pressed={active}
                                  onClick={() =>
                                    set(
                                      'skills',
                                      active ? data.skills.filter((s) => s !== skill) : [...data.skills, skill]
                                    )
                                  }
                                  className={cn(
                                    'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200',
                                    active
                                      ? 'bg-blue-600 text-white border-transparent shadow-lg shadow-blue-600/25'
                                      : 'bg-white/70 dark:bg-slate-950/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-blue-400/50'
                                  )}
                                >
                                  {active && <Check className="w-3 h-3 inline mr-1" />}
                                  {skill}
                                </button>
                              );
                            })}
                          </div>
                          <FieldError id="app-skills-error" message={errors.skills} />
                        </div>

                        <div>
                          <label htmlFor="app-projects" className={FIELD_LABEL}>
                            Relevant Projects{' '}
                            <span className="text-muted-foreground font-normal">(optional)</span>
                          </label>
                          <textarea
                            id="app-projects"
                            rows={4}
                            placeholder="Briefly describe 1–3 projects you are proud of — what you built, your role, and the tech used."
                            value={data.projects}
                            onChange={(e) => set('projects', e.target.value)}
                            className={cn(INPUT_CLASSES, 'resize-none')}
                          />
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-6">
                        <SelectField
                          id="app-availability" label="Weekly Availability"
                          value={data.availability} onChange={(v) => set('availability', v)}
                          options={AVAILABILITY_OPTIONS} placeholder="How many hours can you commit?"
                          error={errors.availability}
                        />
                        <div>
                          <label htmlFor="app-motivation" className={FIELD_LABEL}>
                            Why do you want to join? <span className="text-rose-500">*</span>
                          </label>
                          <textarea
                            id="app-motivation"
                            rows={5}
                            placeholder="Tell us what you want to build, learn, and contribute — and why this team."
                            value={data.motivation}
                            onChange={(e) => set('motivation', e.target.value)}
                            aria-invalid={!!errors.motivation}
                            aria-describedby={errors.motivation ? 'app-motivation-error' : undefined}
                            className={cn(
                              INPUT_CLASSES,
                              'resize-none',
                              errors.motivation && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400/20'
                            )}
                          />
                          <FieldError id="app-motivation-error" message={errors.motivation} />
                        </div>
                        <div>
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={data.agreement}
                              onChange={(e) => set('agreement', e.target.checked)}
                              className="mt-0.5 w-4 h-4 rounded border-border accent-blue-600"
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                              I confirm I can commit the selected hours weekly and will communicate
                              early if my schedule changes.
                            </span>
                          </label>
                          <FieldError id="app-agreement-error" message={errors.agreement} />
                        </div>
                      </div>
                    )}

                    {step === 4 && (
                      <ReviewStep data={data} />
                    )}
                  </div>

                  {/* Navigation */}
                  {submitError && (
                    <div role="alert" className="mt-8 p-4 rounded-xl border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 text-sm text-red-700 dark:text-red-300 flex items-start gap-3">
                      <X className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{submitError}</span>
                    </div>
                  )}
                  <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={goBack}
                      disabled={step === 0}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    {step < totalSteps - 1 ? (
                      <button
                        type="button"
                        onClick={goNext}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 text-white font-display font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 text-sm"
                      >
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white font-display font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-600/25 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 text-sm disabled:opacity-70 disabled:cursor-wait"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting…
                          </>
                        ) : (
                          <>
                            Submit Application
                            <Send className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────
   Review step
   ──────────────────────────────────────────────────────────────── */

function ReviewRow({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Check }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="w-4 h-4 text-blue-600 dark:text-sky-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-900 dark:text-white break-words">{value || '—'}</p>
      </div>
    </div>
  );
}

function ReviewStep({ data }: { data: ApplicationData }) {
  const preferred = TEAM_ROLES.find((r) => r.id === data.preferredRole);
  const secondary = TEAM_ROLES.find((r) => r.id === data.secondaryRole);

  const sections: { title: string; rows: { label: string; value: string; icon: typeof Check }[] }[] = [
    {
      title: 'Personal',
      rows: [
        { label: 'Full Name', value: data.fullName, icon: User },
        { label: 'Email', value: data.email, icon: Mail },
        { label: 'Phone', value: data.phone, icon: Mail },
        { label: 'Gender', value: data.gender, icon: User },
        { label: 'University', value: data.university, icon: GraduationCap },
        { label: 'Degree Program', value: data.degreeProgram, icon: GraduationCap },
        { label: 'Academic Year', value: data.academicYear, icon: CalendarClock },
      ],
    },
    {
      title: 'Links & Resume',
      rows: [
        { label: 'GitHub', value: data.github, icon: Github },
        { label: 'LinkedIn', value: data.linkedin, icon: Linkedin },
        { label: 'Portfolio', value: data.portfolio, icon: Globe },
        { label: 'Resume', value: data.resume ? `${data.resume.name} (${formatBytes(data.resume.size)})` : '—', icon: FileText },
      ],
    },
    {
      title: 'Role & Skills',
      rows: [
        { label: 'Preferred Role', value: preferred ? `${preferred.title} · ${preferred.department}` : '—', icon: Briefcase },
        { label: 'Secondary Role', value: secondary ? `${secondary.title} · ${secondary.department}` : 'None', icon: Briefcase },
        { label: 'Technical Skills', value: data.skills.length > 0 ? data.skills.join(', ') : '—', icon: Sparkles },
        { label: 'Relevant Projects', value: data.projects || '—', icon: FileText },
      ],
    },
    {
      title: 'Commitment',
      rows: [
        { label: 'Weekly Availability', value: data.availability, icon: CalendarClock },
        { label: 'Motivation', value: data.motivation, icon: Send },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Review everything below. Use <strong className="text-slate-900 dark:text-white">Back</strong> to
          correct anything before submitting.
        </p>
      </div>
      {sections.map((section) => (
        <div key={section.title} className="rounded-xl border border-slate-200 dark:border-white/10 p-5">
          <h4 className="font-label text-[10px] tracking-[0.2em] text-blue-600 dark:text-sky-400 mb-3">
            {section.title}
          </h4>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {section.rows.map((row) => (
              <ReviewRow key={row.label} {...row} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Success screen
   ──────────────────────────────────────────────────────────────── */

function SuccessScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="p-8 sm:p-12 text-center">
      <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
        <PartyPopper className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h3 className="mt-6 font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
        Application received
      </h3>
      <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
        Thank you for applying to the founding development team. Our team reviews every
        application personally — you will hear back by email within{' '}
        <strong className="text-slate-900 dark:text-white">5–7 days</strong>.
      </p>

      <div className="mt-8 max-w-md mx-auto text-left space-y-3">
        {[
          'Your profile and GitHub will be reviewed for skill fit.',
          'If shortlisted, we will invite you to a friendly technical discussion.',
          'Selected candidates receive a supported trial contribution.',
        ].map((step) => (
          <div key={step} className="flex items-start gap-3">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{step}</p>
          </div>
        ))}
      </div>

      <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/student/team-applications"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 shadow-lg shadow-blue-600/25 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200"
        >
          Track your application
          <ArrowRight className="w-4 h-4" />
        </Link>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
        >
          Submit another application
        </button>
      </div>
    </div>
  );
}

function SignInGate() {
  const location = useLocation();
  const apply = new URLSearchParams(location.search).get('apply');
  const redirect = apply
    ? `/register/student?redirect=${encodeURIComponent('/careers/apply')}&apply=${encodeURIComponent(apply)}`
    : '/register/student?redirect=' + encodeURIComponent('/careers/apply');
  const loginTo = apply
    ? `/login?redirect=${encodeURIComponent('/careers/apply')}&apply=${encodeURIComponent(apply)}`
    : '/login?redirect=' + encodeURIComponent('/careers/apply');

  return (
    <div className="p-8 sm:p-12 text-center">
      <div className="w-20 h-20 mx-auto rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
        <UserCheck className="w-9 h-9 text-blue-600 dark:text-sky-400" />
      </div>
      <h3 className="mt-6 font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
        Sign in to apply
      </h3>
      <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
        Applications for the founding development team are linked to your ZYR0 account.
        Create a free account or sign in to start your application — it takes under
        two minutes.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to={redirect}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 text-white font-display font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 text-sm"
        >
          Create an account
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to={loginTo}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Sign in
        </Link>
      </div>
      <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
        Trouble signing in or applying?{' '}
        <a
          href={SITE_CONFIG.social.whatsappSupportGroup}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          Join our WhatsApp support group
        </a>{' '}
        and we will help you out.
      </p>
    </div>
  );
}
