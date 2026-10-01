import React, { useState, useEffect, useMemo } from 'react';
import {
  Wrench, CheckCircle2, XCircle, Clock, Star, ExternalLink,
  Search, ShieldAlert, Sparkles, AlertCircle, Trash2, Edit3, Eye, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getAllToolsAdmin,
  updateToolStatusAdmin,
  deleteToolAdmin,
  mapDbToolToToolItem,
} from '@/services/tools';
import { ToolPreviewDialog } from '@/components/tools/ToolPreviewDialog';
import { SubmitToolDialog } from '@/components/tools/SubmitToolDialog';
import type { DbTool, ToolSubmissionStatus } from '@/lib/database.types';
import type { ToolItem } from '@/data/tools';
import { toast } from 'sonner';

export default function AdminTools() {
  const [tools, setTools] = useState<DbTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [search, setSearch] = useState('');

  // Moderation state
  const [previewItem, setPreviewItem] = useState<ToolItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<DbTool | null>(null);
  const [moderatorNote, setModeratorNote] = useState('');
  const [targetStatus, setTargetStatus] = useState<ToolSubmissionStatus>('approved');
  const [actionLoading, setActionLoading] = useState(false);

  const loadAdminTools = async () => {
    setLoading(true);
    try {
      const data = await getAllToolsAdmin();
      setTools(data);
    } catch (err: any) {
      console.error('Failed to load admin tools:', err);
      toast.error(err.message || 'Failed to load tools moderation queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminTools();
  }, []);

  const counts = useMemo(() => {
    return {
      all: tools.length,
      pending: tools.filter((t) => t.status === 'pending').length,
      approved: tools.filter((t) => t.status === 'approved').length,
      rejected: tools.filter((t) => t.status === 'rejected').length,
    };
  }, [tools]);

  const filteredTools = useMemo(() => {
    return tools.filter((t) => {
      if (activeTab !== 'all' && t.status !== activeTab) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.tagline.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.author_name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tools, activeTab, search]);

  const handleOpenStatusAction = (tool: DbTool, status: ToolSubmissionStatus) => {
    setSelectedTool(tool);
    setTargetStatus(status);
    setModeratorNote(tool.moderator_note || '');
    setNoteModalOpen(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!selectedTool) return;
    setActionLoading(true);
    try {
      await updateToolStatusAdmin(selectedTool.id, targetStatus, moderatorNote);
      toast.success(`Tool marked as ${targetStatus}`);
      setNoteModalOpen(false);
      loadAdminTools();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeatured = async (tool: DbTool) => {
    try {
      await updateToolStatusAdmin(tool.id, tool.status, undefined, !tool.featured);
      toast.success(tool.featured ? 'Removed from featured' : 'Marked as featured flagship');
      loadAdminTools();
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle featured status');
    }
  };

  const handleDelete = async (toolId: string) => {
    if (!confirm('Are you sure you want to permanently delete this tool submission?')) return;
    try {
      await deleteToolAdmin(toolId);
      toast.success('Tool submission deleted');
      loadAdminTools();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete tool');
    }
  };

  const handlePreview = (tool: DbTool) => {
    setPreviewItem(mapDbToolToToolItem(tool));
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
              ToolHub Moderation Queue
            </h1>
            {counts.pending > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {counts.pending} Pending Review
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Review community submissions, verify security & installation URLs, and approve tools for the public directory.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search submissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 bg-muted/40 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
            />
          </div>
          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="gap-1.5 shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tool / Skill</span>
          </Button>

          <Button asChild variant="outline" size="sm" className="gap-1.5 shrink-0">
            <a href="/tools" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              <span>Public Directory</span>
            </a>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        {[
          { id: 'pending', label: 'Pending Review', count: counts.pending },
          { id: 'approved', label: 'Approved', count: counts.approved },
          { id: 'rejected', label: 'Rejected', count: counts.rejected },
          { id: 'all', label: 'All Submissions', count: counts.all },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-accent text-accent'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-muted">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Moderation List Table / Cards */}
      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          Loading moderation queue...
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="py-16 border border-dashed border-border rounded-2xl text-center space-y-2 bg-card/40">
          <CheckCircle2 className="w-10 h-10 text-muted-foreground mx-auto" />
          <h4 className="text-sm font-semibold text-foreground">No submissions found</h4>
          <p className="text-xs text-muted-foreground">
            {activeTab === 'pending'
              ? 'Great work! All community submissions have been reviewed.'
              : 'No items match the selected tab filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="p-4 sm:p-5 rounded-xl border border-border bg-card hover:border-accent/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px] font-mono capitalize">
                    {tool.item_type}
                  </Badge>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {tool.category}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    Source: {tool.source}
                  </span>
                  {tool.featured && (
                    <Badge className="bg-accent/10 text-accent border-accent/30 text-[10px]">
                      Featured Flagship
                    </Badge>
                  )}
                  {tool.status === 'approved' && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                      Approved
                    </Badge>
                  )}
                  {tool.status === 'rejected' && (
                    <Badge variant="destructive" className="text-[10px]">
                      Rejected
                    </Badge>
                  )}
                  {tool.status === 'pending' && (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px]">
                      Pending
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">
                    {tool.name}
                  </h3>
                  {tool.version && (
                    <span className="text-xs font-mono text-muted-foreground">
                      {tool.version}
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground line-clamp-1">
                  {tool.tagline}
                </p>

                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                  <span>Author: <strong className="text-foreground">{tool.author_name}</strong></span>
                  <span>•</span>
                  <span>Submitted: {new Date(tool.created_at).toLocaleDateString()}</span>
                  {tool.install_command && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-[11px] truncate max-w-xs bg-muted/60 px-1.5 py-0.5 rounded">
                        {tool.install_command}
                      </span>
                    </>
                  )}
                </div>

                {tool.moderator_note && (
                  <div className="mt-2 p-2 rounded bg-muted/30 border border-border/50 text-[11px] text-muted-foreground">
                    <strong>Note:</strong> {tool.moderator_note}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreview(tool)}
                  className="gap-1 text-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggleFeatured(tool)}
                  title={tool.featured ? 'Unfeature' : 'Feature as flagship'}
                  className={`p-2 ${tool.featured ? 'text-accent' : 'text-muted-foreground'}`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </Button>

                {tool.status !== 'approved' && (
                  <Button
                    size="sm"
                    onClick={() => handleOpenStatusAction(tool, 'approved')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </Button>
                )}

                {tool.status !== 'rejected' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenStatusAction(tool, 'rejected')}
                    className="text-red-600 hover:text-red-700 hover:bg-red-500/10 gap-1 text-xs"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(tool.id)}
                  className="text-muted-foreground hover:text-destructive p-2"
                  title="Delete submission"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Moderator Action Dialog */}
      {noteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-foreground capitalize">
              {targetStatus === 'approved' ? 'Approve Tool Submission' : 'Reject Tool Submission'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {targetStatus === 'approved'
                ? 'Approving this tool will make it immediately visible to all visitors on the public ToolHub page.'
                : 'Rejecting this tool will notify the submitter so they can address issues and resubmit.'}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Moderator Note / Feedback (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Verified GitHub repo, safe installation command, approved."
                value={moderatorNote}
                onChange={(e) => setModeratorNote(e.target.value)}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNoteModalOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmStatusUpdate}
                disabled={actionLoading}
                className={targetStatus === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
              >
                {actionLoading ? 'Saving...' : `Confirm ${targetStatus}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tool Preview Modal */}
      <ToolPreviewDialog
        tool={previewItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      {/* Admin Add Tool / Skill Dialog */}
      <SubmitToolDialog
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          loadAdminTools();
        }}
      />
    </div>
  );
}
