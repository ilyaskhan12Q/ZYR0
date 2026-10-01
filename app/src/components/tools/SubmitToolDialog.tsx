import React, { useState } from 'react';
import {
  Sparkles, Terminal, Code2, Layers, CheckCircle2, AlertCircle,
  Loader2, Lock, ShieldCheck, ArrowRight, UserCheck
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
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface SubmitToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
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

  // Admin controls
  const isAdmin = profile?.role === 'admin';
  const [adminStatus, setAdminStatus] = useState<'approved' | 'pending'>('approved');
  const [adminFeatured, setAdminFeatured] = useState(false);
  const [adminBadge, setAdminBadge] = useState('');

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
    setSubmittedSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please sign in to submit a tool or skill');
      return;
    }

    if (!name.trim() || !tagline.trim() || !description.trim() || !sourceUrl.trim()) {
      toast.error('Please fill in all required fields (Name, Tagline, Description, Source URL)');
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

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) {
        setTimeout(resetForm, 200);
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border/80 p-6 sm:p-8">
        <DialogHeader className="text-left space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono uppercase tracking-wider bg-accent/10 text-accent border border-accent/20 w-fit">
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
            <div className="p-6 rounded-2xl border border-blue-500/25 bg-blue-500/5 dark:bg-blue-500/10 text-center relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-3.5 shadow-xs">
                <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25 mb-2">
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
                  <UserCheck className="w-4 h-4 text-blue-500 shrink-0" />
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
              <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">
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
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            {/* Item Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                    className={`p-3 rounded-xl border text-left transition-all ${
                      itemType === type.id
                        ? 'border-accent bg-accent/5 ring-1 ring-accent text-foreground'
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
                <label className="text-xs font-semibold text-foreground">
                  Tool / Skill Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ripgrep or Claude Coder"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
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
              <label className="text-xs font-semibold text-foreground">
                One-Sentence Tagline *
              </label>
              <input
                type="text"
                required
                placeholder="A blazingly fast utility for..."
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Detailed Description *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Explain what problem this tool solves, how it works, and why developers should use it..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
              />
            </div>

            {/* Source & URLs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Source Platform *
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3.5 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                >
                  <option value="GitHub">GitHub</option>
                  <option value="Hugging Face">Hugging Face</option>
                  <option value="Web">Official Website</option>
                  <option value="GitLab">GitLab</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Repository or Primary URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/org/repo"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent text-foreground font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Documentation URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://docs.example.com"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent text-foreground font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Version / Release (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. v1.2.0"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full px-3.5 py-2 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent text-foreground font-mono"
                />
              </div>
            </div>

            {/* Install command / Skill prompt */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>{itemType === 'skill' ? 'Skill Invocation / Execution Command' : 'Quick Install Command'}</span>
                <span className="text-[11px] font-normal text-muted-foreground">Optional</span>
              </label>
              <div className="relative">
                <Terminal className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={itemType === 'skill' ? '/skill run --input ...' : 'npm install @example/tool or pip install ...'}
                  value={installCommand}
                  onChange={(e) => setInstallCommand(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-muted/40 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                />
              </div>
            </div>

            {/* Tags & Capabilities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="LLM, Agent, Rust, CLI"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3.5 py-2 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Author / Organization Name
                </label>
                <input
                  type="text"
                  placeholder="Author or Maintainer"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Key Capabilities (1 per line)</span>
                <span className="text-[11px] font-normal text-muted-foreground">Optional</span>
              </label>
              <textarea
                rows={2}
                placeholder="Feature 1&#10;Feature 2"
                value={capabilitiesInput}
                onChange={(e) => setCapabilitiesInput(e.target.value)}
                className="w-full px-3.5 py-2 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
              />
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
                        className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition-all ${
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
                        className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition-all ${
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
                    <label className="text-xs font-semibold text-foreground">
                      Custom Badge (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Official, Staff Pick, Verified"
                      value={adminBadge}
                      onChange={(e) => setAdminBadge(e.target.value)}
                      className="w-full px-3 py-2 bg-card border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                    />
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
                className="gap-2"
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
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
