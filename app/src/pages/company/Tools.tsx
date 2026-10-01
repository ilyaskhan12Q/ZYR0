import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench, Plus, ExternalLink, Clock, CheckCircle2, XCircle,
  AlertCircle, Sparkles, Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getMyToolSubmissions } from '@/services/tools';
import { SubmitToolDialog } from '@/components/tools/SubmitToolDialog';
import type { DbTool } from '@/lib/database.types';

export default function CompanyTools() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<DbTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  const loadSubmissions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getMyToolSubmissions(user.id);
      setSubmissions(data);
    } catch (err) {
      console.error('Failed to load company tool submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [user]);

  const renderStatusBadge = (status: DbTool['status']) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved & Live
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 font-medium">
            <XCircle className="w-3 h-3 mr-1" />
            Needs Revision
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium">
            <Clock className="w-3 h-3 mr-1" />
            Under Moderation
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
              Company Developer Tools & SDKs
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
              {submissions.length}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Publish your company SDKs, developer utilities, and AI agent skills to the ZYR0 ToolHub community.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/tools" target="_blank">
              <Compass className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Link>
          </Button>
          <Button size="sm" onClick={() => setSubmitDialogOpen(true)} className="gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Publish Tool / SDK</span>
          </Button>
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Loading company submissions...
        </div>
      ) : submissions.length === 0 ? (
        <div className="py-16 border border-dashed border-border rounded-2xl text-center space-y-4 bg-card/50">
          <div className="w-12 h-12 rounded-xl bg-muted/60 border border-border flex items-center justify-center mx-auto text-muted-foreground">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">No published tools yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Showcase your company's open-source packages, APIs, or AI tools to students and hiring candidates on ZYR0.
            </p>
          </div>
          <Button onClick={() => setSubmitDialogOpen(true)} className="gap-2 mt-2">
            <Plus className="w-4 h-4" />
            <span>Publish Your First Tool</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {submissions.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl border border-border bg-card flex flex-col justify-between space-y-4 hover:border-accent/40 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded bg-muted">
                    {item.category}
                  </span>
                  {renderStatusBadge(item.status)}
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {item.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {item.tagline}
                  </p>
                </div>

                {item.moderator_note && (
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs space-y-1">
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-accent" />
                      Moderator Feedback:
                    </span>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      {item.moderator_note}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                <span className="text-muted-foreground text-[11px] font-mono">
                  Submitted {new Date(item.created_at).toLocaleDateString()}
                </span>
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-foreground hover:text-accent transition-colors"
                >
                  <span>View Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Tool Dialog */}
      <SubmitToolDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        onSuccess={loadSubmissions}
      />
    </div>
  );
}
