import React, { useState } from 'react';
import {
  Sparkles, Terminal, CheckCircle2,
  Loader2, Lock, ShieldCheck, ArrowRight, UserCheck, ChevronDown, ImageIcon, AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { submitTool, type SubmitToolInput } from '@/services/tools';
import { coverGradient } from '@/data/tools';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface SubmitToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type FieldErrors = Partial<Record<'name' | 'tagline' | 'description' | 'sourceUrl' | 'imageUrl', string>>;

const inputCls =
  'w-full px-3.5 py-2 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--zyro-accent)] text-foreground';
const inputErrorCls = 'border-red-500/70 focus:ring-red-500';

function FieldError({ msg }: { msg?: string }) {
  return msg ? (
    <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {msg}
    </p>
  ) : null;
}

export function SubmitToolDialog({ open, onOpenChange, onSuccess }: SubmitToolDialogProps) {
  const { user, profile } = useAuth();

  const [itemType, setItemType] = useState<'tool' | 'skill' | 'tool_skill'>('tool');
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'AI & Agents' | 'Developer Tools' | 'Research & Docs' | 'Productivity'>('AI & Agents');
  const [source, setSource] = useState('GitHub');
  const [sourceUrl, setSourceUrl] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [installCommand, setInstallCommand] = useState('');
  const [installInstructions, setInstallInstructions] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [capabilitiesInput, setCapabilitiesInput] = useState('');
  const [version, setVersion] = useState('');
  const [authorName, setAuthorName] = useState(profile?.full_name || '');
  const [authorUrl, setAuthorUrl] = useState(profile?.github || profile?.portfolio_url || '');

  // Collapsible optional section
  const [showOptional, setShowOptional] = useState(false);
  // Image preview state: idle | loading | ok | error
  const [imgState, setImgState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [errors, setErrors] = useState<FieldErrors>({});

  // Admin controls (unchanged permissions)
  const isAdmin = profile?.role === 'admin';
  const [adminStatus, setAdminStatus] = useState<'approved' | 'pending'>('approved');
  const [adminFeatured, setAdminFeatured] = useState(false);
  const [adminBadge, setAdminBadge] = useState('');
  const [adminCoverColor, setAdminCoverColor] = useState('#7B7BDC');

  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const resetForm = () => {
    setName('');
    setTagline('');
    setDescription('');
    setItemType('tool');
    setCategory('AI & Agents');
    setSource('GitHub');
    setSourceUrl('');
    setDocUrl('');
    setImageUrl('');
    setInstallCommand('');
    setInstallInstructions('');
    setTagsInput('');
    setCapabilitiesInput('');
    setVersion('');
    setAdminStatus('approved');
    setAdminFeatured(false);
    setAdminBadge('');
    setAdminCoverColor('#7B7BDC');
    setSubmittedSuccess(false);
    setErrors({});
    setShowOptional(false);
    setImgState('idle');
  };

  const validate = (): FieldErrors => {
    const errs: FieldErrors = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!tagline.trim()) errs.tagline = 'Tagline is required';
    if (!description.trim()) errs.description = 'Description is required';
    if (!sourceUrl.trim()) errs.sourceUrl = 'Source URL is required';
    if (imageUrl.trim() && !/^https?:\/\/.+/i.test(imageUrl.trim())) {
      errs.imageUrl = 'Must be a valid http(s) URL';
    }
    return errs;
  };

  const clearError = (field: keyof FieldErrors) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handleImageUrlChange = (val: string) => {
    setImageUrl(val);
    clearError('imageUrl');
    if (!val.trim()) {
      setImgState('idle');
    } else {
      setImgState('loading');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please sign in to submit a tool or skill');
      return;
    }

    const errs = validate();
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    setSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const capabilities = capabilitiesInput
        .split('\n')
        .map((c) => c.trim())
        .filter(Boolean);

      const input: SubmitToolInput = {
        name,
        tagline,
        description,
        item_type: itemType,
        category,
        tags: tags.length > 0 ? tags : ['Developer'],
        source,
        source_url: sourceUrl,
        documentation_url: docUrl || undefined,
        image_url: imageUrl || undefined,
        capabilities: capabilities.length > 0 ? capabilities : ['Fast workflow execution'],
        install_command: installCommand || undefined,
        install_instructions: installInstructions || undefined,
        version: version || undefined,
        author_name: authorName || profile?.full_name || 'Community Builder',
        author_url: authorUrl || undefined,
        ...(isAdmin
          ? {
              status: adminStatus,
              featured: adminFeatured,
              badge: adminBadge || undefined,
              cover_color: adminCoverColor.trim() || undefined,
            }
          : {}),
      };

      await submitTool(input, user.id);
      setSubmittedSuccess(true);
      if (isAdmin && adminStatus === 'approved') {
        toast.success('Tool has been created and published live directly!');
      } else {
        toast.success('Your submission has been received and queued for moderation!');
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Submission error:', err);
      toast.error(err.message || 'Failed to submit tool');
    } finally {
      setSubmitting(false);
    }
  };

  // Derive preview data from form state
  const previewTags = tagsInput.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean);
  const previewCaps = capabilitiesInput.split('\n').map((c) => c.trim()).filter(Boolean);
  const previewInitials = (name.trim() || '?')
    .split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) {
        setTimeout(resetForm, 200);
      }
    }}>
      <DialogContent className="sm:max-w-5xl max-h-[92vh] overflow-y-auto bg-card border-border/80 p-6 sm:p-8">
        <DialogHeader className="text-left space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono uppercase tracking-wider bg-[var(--zyro-accent-muted)] text-[var(--zyro-accent)] border border-[var(--zyro-accent)]/20 w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Registry</span>
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground font-sans">
            Submit a Tool or Agent Skill
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Share an open-source tool, Hugging Face model interface, or agent skill with developers and researchers across ZYR0.
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="py-6 sm:py-8 space-y-6">
            {/* Visual Attention Shield */}
            <div className="p-6 rounded-2xl border border-[var(--zyro-accent)]/25 bg-[var(--zyro-accent-muted)] text-center relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-[var(--zyro-accent)]/10 border border-[var(--zyro-accent)]/30 flex items-center justify-center mx-auto mb-3.5 shadow-xs">
                <Lock className="w-6 h-6 text-[var(--zyro-accent)]" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-[var(--zyro-accent)]/15 text-[var(--zyro-accent)] border border-[var(--zyro-accent)]/25 mb-2">
                <span>Authentication Required</span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground font-sans">
                Sign in to Submit Your Tool
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mt-1 leading-relaxed">
                You must have an active Student or Company account on ZYR0 to publish packages, verify ownership, and track moderation updates.
              </p>

              {/* Value Reasons Pill List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pt-4 border-t border-border/60 text-left text-xs">
                <div className="flex items-center gap-2 text-foreground/90">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Verified developer profile credit</span>
                </div>
                <div className="flex items-center gap-2 text-foreground/90">
                  <UserCheck className="w-4 h-4 text-[var(--zyro-accent)] shrink-0" />
                  <span>Real-time moderation tracking</span>
                </div>
              </div>
            </div>

            {/* Direct Primary & Secondary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link to="/register?redirect=%2Ftools">
                  <span>Create Free Account</span>
                </Link>
              </Button>
              <Button asChild className="gap-2 bg-[var(--zyro-accent)] hover:bg-[var(--zyro-sapphire)] text-white font-medium shadow-sm">
                <Link to="/login?redirect=%2Ftools">
                  <span>Sign In to Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        ) : submittedSuccess ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
            <h3 className="text-xl font-bold text-foreground">
              {isAdmin && adminStatus === 'approved' ? 'Tool Published Live!' : 'Submission Queued!'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              {isAdmin && adminStatus === 'approved'
                ? 'Your tool or skill is now live in the ToolHub catalog. Developers and researchers can discover, inspect, and install it immediately.'
                : 'Thank you for contributing! Your tool is now in the verification queue. Once approved by ZYR0 moderators, it will automatically appear live in the ToolHub catalog.'}
            </p>
            <div className="flex justify-center gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  onOpenChange(false);
                }}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  resetForm();
                }}
              >
                Submit Another
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="pt-2">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
              {/* ============ LEFT: FORM ============ */}
              <div className="space-y-5 min-w-0">
                {/* Essentials */}
                <div className="space-y-5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-1.5">
                    Essentials
                  </h4>

                  {/* Item Type Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Item Classification *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'tool', label: 'Developer Tool', desc: 'CLI, library, package, UI kit' },
                        { id: 'skill', label: 'Agent Skill', desc: 'Automated skill or prompt protocol' },
                        { id: 'tool_skill', label: 'Tool + Skill', desc: 'Hybrid tool with agent capabilities' },
                      ].map((type) => (
                        <button
                          type="button"
                          key={type.id}
                          onClick={() => setItemType(type.id as any)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            itemType === type.id
                              ? 'border-[var(--zyro-accent)] bg-[var(--zyro-accent-muted)] ring-1 ring-[var(--zyro-accent)] text-foreground'
                              : 'border-border/70 bg-card hover:bg-muted/40 text-muted-foreground'
                          }`}
                        >
                          <div className="text-xs font-bold font-sans text-foreground">{type.label}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{type.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name & Tagline */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="st-name" className="text-xs font-semibold text-foreground">
                        Tool / Skill Name *
                      </label>
                      <input
                        id="st-name"
                        type="text"
                        placeholder="e.g. Ripgrep or Claude Coder"
                        value={name}
                        onChange={(e) => { setName(e.target.value); clearError('name'); }}
                        className={`${inputCls} ${errors.name ? inputErrorCls : ''}`}
                      />
                      <FieldError msg={errors.name} />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="st-category" className="text-xs font-semibold text-foreground">
                        Category *
                      </label>
                      <select
                        id="st-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className={`${inputCls} bg-card cursor-pointer`}
                      >
                        <option value="AI & Agents">AI & Agents</option>
                        <option value="Developer Tools">Developer Tools</option>
                        <option value="Research & Docs">Research & Docs</option>
                        <option value="Productivity">Productivity</option>
                      </select>
                    </div>
                  </div>

                  {/* Tagline */}
                  <div className="space-y-1.5">
                    <label htmlFor="st-tagline" className="text-xs font-semibold text-foreground">
                      One-Sentence Tagline *
                    </label>
                    <input
                      id="st-tagline"
                      type="text"
                      placeholder="A blazingly fast utility for..."
                      value={tagline}
                      onChange={(e) => { setTagline(e.target.value); clearError('tagline'); }}
                      className={`${inputCls} ${errors.tagline ? inputErrorCls : ''}`}
                    />
                    <FieldError msg={errors.tagline} />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label htmlFor="st-desc" className="text-xs font-semibold text-foreground">
                      Detailed Description *
                    </label>
                    <textarea
                      id="st-desc"
                      rows={3}
                      placeholder="Explain what problem this tool solves, how it works, and why developers should use it..."
                      value={description}
                      onChange={(e) => { setDescription(e.target.value); clearError('description'); }}
                      className={`${inputCls} ${errors.description ? inputErrorCls : ''}`}
                    />
                    <FieldError msg={errors.description} />
                  </div>

                  {/* Source & URL */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="st-source" className="text-xs font-semibold text-foreground">
                        Source Platform *
                      </label>
                      <select
                        id="st-source"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className={`${inputCls} bg-card cursor-pointer`}
                      >
                        <option value="GitHub">GitHub</option>
                        <option value="Hugging Face">Hugging Face</option>
                        <option value="Web">Official Website</option>
                        <option value="GitLab">GitLab</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="st-url" className="text-xs font-semibold text-foreground">
                        Repository or Primary URL *
                      </label>
                      <input
                        id="st-url"
                        type="url"
                        placeholder="https://github.com/org/repo"
                        value={sourceUrl}
                        onChange={(e) => { setSourceUrl(e.target.value); clearError('sourceUrl'); }}
                        className={`${inputCls} font-mono ${errors.sourceUrl ? inputErrorCls : ''}`}
                      />
                      <FieldError msg={errors.sourceUrl} />
                    </div>
                  </div>
                </div>

                {/* Optional details (collapsible) */}
                <div className="border border-border/70 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowOptional((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    aria-expanded={showOptional}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Add more details
                      <span className="ml-2 font-normal text-muted-foreground normal-case tracking-normal">
                        Optional — image, install, tags & capabilities
                      </span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showOptional ? 'rotate-180' : ''}`} />
                  </button>

                  {showOptional && (
                    <div className="p-4 space-y-5 border-t border-border/60">
                      {/* Image URL with live thumbnail */}
                      <div className="space-y-1.5">
                        <label htmlFor="st-image" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-[var(--zyro-accent)]" />
                          Cover Image URL
                          <span className="text-[11px] font-normal text-muted-foreground">Optional — shown on cards & preview</span>
                        </label>
                        <input
                          id="st-image"
                          type="url"
                          placeholder="https://example.com/preview.png"
                          value={imageUrl}
                          onChange={(e) => handleImageUrlChange(e.target.value)}
                          className={`${inputCls} font-mono ${errors.imageUrl ? inputErrorCls : ''}`}
                        />
                        <FieldError msg={errors.imageUrl} />
                        {imageUrl.trim() && (
                          <div className="mt-2 relative w-full max-w-xs aspect-video rounded-lg overflow-hidden border border-border/70 bg-muted/40">
                            {imgState !== 'ok' && imgState !== 'error' && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                              </div>
                            )}
                            <img
                              src={imageUrl}
                              alt="Cover image preview"
                              onLoad={() => setImgState('ok')}
                              onError={() => setImgState('error')}
                              className={`w-full h-full object-cover ${imgState === 'ok' ? '' : 'opacity-0'}`}
                            />
                            {imgState === 'error' && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-muted/60 text-[11px] text-amber-600 dark:text-amber-400">
                                <AlertCircle className="w-4 h-4" />
                                <span>Image failed to load</span>
                              </div>
                            )}
                            {imgState === 'ok' && (
                              <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
                                Preview OK
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="st-doc" className="text-xs font-semibold text-foreground">
                            Documentation URL
                          </label>
                          <input
                            id="st-doc"
                            type="url"
                            placeholder="https://docs.example.com"
                            value={docUrl}
                            onChange={(e) => setDocUrl(e.target.value)}
                            className={`${inputCls} font-mono`}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="st-version" className="text-xs font-semibold text-foreground">
                            Version / Release
                          </label>
                          <input
                            id="st-version"
                            type="text"
                            placeholder="e.g. v1.2.0"
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}
                            className={`${inputCls} font-mono`}
                          />
                        </div>
                      </div>

                      {/* Install command / Skill prompt */}
                      <div className="space-y-1.5">
                        <label htmlFor="st-install" className="text-xs font-semibold text-foreground flex items-center justify-between">
                          <span>{itemType === 'skill' ? 'Skill Invocation / Execution Command' : 'Quick Install Command'}</span>
                        </label>
                        <div className="relative">
                          <Terminal className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input
                            id="st-install"
                            type="text"
                            placeholder={itemType === 'skill' ? '/skill run --input ...' : 'npm install @example/tool or pip install ...'}
                            value={installCommand}
                            onChange={(e) => setInstallCommand(e.target.value)}
                            className={`${inputCls} pl-9 font-mono`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="st-install-notes" className="text-xs font-semibold text-foreground">
                          Install Notes
                          <span className="ml-2 text-[11px] font-normal text-muted-foreground">Extra prose shown near the command</span>
                        </label>
                        <textarea
                          id="st-install-notes"
                          rows={2}
                          placeholder="Requires Node 20+ and a GitHub token..."
                          value={installInstructions}
                          onChange={(e) => setInstallInstructions(e.target.value)}
                          className={inputCls}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="st-tags" className="text-xs font-semibold text-foreground">
                            Tags (comma separated)
                          </label>
                          <input
                            id="st-tags"
                            type="text"
                            placeholder="LLM, Agent, Rust, CLI"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            className={inputCls}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="st-author" className="text-xs font-semibold text-foreground">
                            Author / Organization Name
                          </label>
                          <input
                            id="st-author"
                            type="text"
                            placeholder="Author or Maintainer"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            className={inputCls}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="st-author-url" className="text-xs font-semibold text-foreground">
                          Author Profile URL
                        </label>
                        <input
                          id="st-author-url"
                          type="url"
                          placeholder="https://github.com/username"
                          value={authorUrl}
                          onChange={(e) => setAuthorUrl(e.target.value)}
                          className={`${inputCls} font-mono`}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="st-caps" className="text-xs font-semibold text-foreground">
                          Key Capabilities (1 per line)
                        </label>
                        <textarea
                          id="st-caps"
                          rows={3}
                          placeholder="Feature 1&#10;Feature 2"
                          value={capabilitiesInput}
                          onChange={(e) => setCapabilitiesInput(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin Publishing Controls (Only visible to Administrators) */}
                {isAdmin && (
                  <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Administrator Publishing Powers
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Publication Mode */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          Publication Status
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setAdminStatus('approved')}
                            className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                              adminStatus === 'approved'
                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                                : 'border-border/70 bg-card text-muted-foreground hover:bg-muted/40'
                            }`}
                          >
                            Publish Live
                          </button>
                          <button
                            type="button"
                            onClick={() => setAdminStatus('pending')}
                            className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                              adminStatus === 'pending'
                                ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                                : 'border-border/70 bg-card text-muted-foreground hover:bg-muted/40'
                            }`}
                          >
                            Save as Pending
                          </button>
                        </div>
                      </div>

                      {/* Custom Badge */}
                      <div className="space-y-1.5">
                        <label htmlFor="st-badge" className="text-xs font-semibold text-foreground">
                          Custom Badge (Optional)
                        </label>
                        <input
                          id="st-badge"
                          type="text"
                          placeholder="e.g. Official, Staff Pick, Verified"
                          value={adminBadge}
                          onChange={(e) => setAdminBadge(e.target.value)}
                          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                        />
                      </div>
                    </div>

                    {/* Card Hero Color */}
                    <div className="space-y-1.5">
                      <label htmlFor="st-cover-color" className="text-xs font-semibold text-foreground">
                        Card Hero Color
                        <span className="ml-2 text-[11px] font-normal text-muted-foreground">Gradient shown when no cover image is set</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="st-cover-color"
                          type="color"
                          value={adminCoverColor}
                          onChange={(e) => setAdminCoverColor(e.target.value)}
                          className="w-10 h-9 p-1 rounded-lg border border-border bg-card cursor-pointer"
                        />
                        <input
                          type="text"
                          value={adminCoverColor}
                          onChange={(e) => setAdminCoverColor(e.target.value)}
                          placeholder="#7B7BDC"
                          className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                        />
                        <button
                          type="button"
                          onClick={() => setAdminCoverColor('#7B7BDC')}
                          className="px-2.5 py-2 rounded-lg text-[11px] font-medium border border-border/70 bg-card text-muted-foreground hover:bg-muted/40 cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    {/* Featured Switch */}
                    <label className="flex items-center gap-3 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adminFeatured}
                        onChange={(e) => setAdminFeatured(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500"
                      />
                      <div className="text-xs">
                        <span className="font-semibold text-foreground">Featured Flagship Tool</span>
                        <span className="text-muted-foreground ml-1.5">
                          (Pin to the top curated showcase section on /tools)
                        </span>
                      </div>
                    </label>
                  </div>
                )}

                {/* Modal Actions */}
                <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="gap-2 bg-[var(--zyro-accent)] hover:bg-[var(--zyro-sapphire)] text-white"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Submit for Review</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* ============ RIGHT: LIVE PREVIEW ============ */}
              <div className="lg:sticky lg:top-0 self-start w-full">
                <div className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-border/60 bg-muted/30">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Live Preview — Directory Card
                    </span>
                  </div>

                  {/* Media area — mirrors ToolCard hero */}
                  <div className="relative w-full aspect-video bg-[var(--zyro-twilight)] border-b border-border/40 overflow-hidden">
                    {!(imageUrl.trim() && imgState === 'ok') && (
                      <>
                        <div className="absolute inset-0" style={{ background: coverGradient(isAdmin ? adminCoverColor : undefined) }} aria-hidden="true" />
                        <div
                          className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:18px_18px]"
                          aria-hidden="true"
                        />
                        <div className="absolute top-2 right-3 w-16 h-16 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-4xl font-serif text-white/15 select-none">{previewInitials}</span>
                        </div>
                      </>
                    )}
                    {imageUrl.trim() && imgState === 'ok' && (
                      <>
                        <img
                          src={imageUrl}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" aria-hidden="true" />
                      </>
                    )}
                    <div className="absolute inset-0 p-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/15 text-white backdrop-blur-sm capitalize border border-white/25">
                          {itemType === 'tool_skill' ? 'Tool + Skill' : itemType}
                        </span>
                      </div>
                      <div>
                        <span className={`text-base font-bold tracking-tight block line-clamp-1 ${imageUrl.trim() && imgState === 'ok' ? 'text-white drop-shadow-md' : 'text-white'}`}>
                          {name.trim() || 'Your tool name'}
                        </span>
                        <span className={`text-[10px] font-mono uppercase tracking-wider block ${imageUrl.trim() && imgState === 'ok' ? 'text-white/85' : 'text-white/75'}`}>
                          {category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {tagline.trim() || 'Your one-sentence tagline will show here.'}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {(previewTags.length > 0 ? previewTags.slice(0, 4) : ['tag']).map((t, i) => (
                        <span
                          key={`${t}-${i}`}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
                      <span className="text-muted-foreground">
                        {previewCaps.length > 0
                          ? `${previewCaps.length} capabilities`
                          : 'Capabilities optional'}
                      </span>
                      <span className="text-[var(--zyro-accent)] font-medium">View Details →</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                  Updates live as you type. Submissions enter the <strong className="text-foreground">moderation queue</strong> and appear on /tools after admin approval.
                </p>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
