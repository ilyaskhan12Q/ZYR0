import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronRight, FileText, Calendar, Clock,
  Users, CheckCircle2, AlertTriangle, Edit3, Trash2, Plus,
  Search, ExternalLink, Download, ArrowUpRight, Check, Sparkles
} from 'lucide-react';

export interface MasterDeliverableGroup {
  id: string; // composite key: internship_id + title
  title: string;
  internship_id: string;
  internship_title: string;
  description?: string;
  priority: string;
  difficulty?: string;
  estimated_duration?: string;
  due_date?: string;
  attachments?: any[];
  objectives?: string[];
  acceptance_criteria?: string[];
  assignedTasks: any[];
  stats: {
    total: number;
    pending: number;
    submitted: number;
    approved: number;
    rejected: number;
    overdue: number;
  };
}

interface MasterDeliverablesListProps {
  tasks: any[];
  internships: any[];
  interns: any[];
  onEditDeliverable: (deliverable: MasterDeliverableGroup) => void;
  onExtendDeliverable: (deliverable: MasterDeliverableGroup) => void;
  onAssignMore: (deliverable: MasterDeliverableGroup) => void;
  onDeleteDeliverable: (deliverable: MasterDeliverableGroup) => void;
  onReviewTask: (task: any) => void;
  onExtendSingleTask: (task: any) => void;
  onCreateNewTask: () => void;
}

export function MasterDeliverablesList({
  tasks,
  internships,
  interns,
  onEditDeliverable,
  onExtendDeliverable,
  onAssignMore,
  onDeleteDeliverable,
  onReviewTask,
  onExtendSingleTask,
  onCreateNewTask,
}: MasterDeliverablesListProps) {
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [expandedDeliverableId, setExpandedDeliverableId] = useState<string | null>(null);

  // Group all task rows into unique Master Deliverables by (internship_id, title)
  const deliverables = useMemo(() => {
    const map = new Map<string, MasterDeliverableGroup>();

    tasks.forEach((t) => {
      const key = `${t.internship_id || 'unassigned'}:::${t.title || 'Untitled Task'}`;
      let group = map.get(key);

      if (!group) {
        group = {
          id: key,
          title: t.title || 'Untitled Task',
          internship_id: t.internship_id || '',
          internship_title: t.internship?.title || 'Unassigned Project',
          description: t.description,
          priority: t.priority || 'Medium',
          difficulty: t.difficulty,
          estimated_duration: t.estimated_duration,
          due_date: t.due_date,
          attachments: t.attachments || [],
          objectives: t.objectives || [],
          acceptance_criteria: t.acceptance_criteria || [],
          assignedTasks: [],
          stats: {
            total: 0,
            pending: 0,
            submitted: 0,
            approved: 0,
            rejected: 0,
            overdue: 0,
          },
        };
        map.set(key, group);
      }

      group.assignedTasks.push(t);
      group.stats.total++;

      if (t.status === 'Pending') group.stats.pending++;
      else if (t.status === 'Submitted') group.stats.submitted++;
      else if (t.status === 'Approved') group.stats.approved++;
      else if (t.status === 'Rejected') group.stats.rejected++;

      if (t.status !== 'Approved' && t.due_date) {
        const due = new Date(t.due_date);
        due.setHours(23, 59, 59, 999);
        if (due.getTime() < Date.now()) {
          group.stats.overdue++;
        }
      }
    });

    return Array.from(map.values());
  }, [tasks]);

  const filteredDeliverables = useMemo(() => {
    return deliverables.filter((d) => {
      if (selectedProject && d.internship_id !== selectedProject) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = d.title.toLowerCase().includes(q);
        const matchDesc = d.description?.toLowerCase().includes(q);
        const matchProject = d.internship_title.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchProject;
      }
      return true;
    });
  }, [deliverables, selectedProject, search]);

  const toggleExpand = (id: string) => {
    setExpandedDeliverableId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deliverables, projects, descriptions..."
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 text-foreground"
            />
          </div>

          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3.5 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer text-foreground"
          >
            <option value="">All Internship Projects</option>
            {internships.map((i) => (
              <option key={i.id} value={i.id}>
                {i.title}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-muted-foreground font-medium self-end sm:self-center">
          Showing <strong className="text-foreground">{filteredDeliverables.length}</strong> Deliverable{filteredDeliverables.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Deliverables Expandable Drawer List */}
      {filteredDeliverables.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-muted/10 space-y-3">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-semibold text-foreground">No Deliverables Found</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {search || selectedProject
              ? 'No deliverables match your search query or selected project.'
              : 'You have not uploaded any task deliverables yet. Create your first task to see it organized here.'}
          </p>
          <button
            onClick={onCreateNewTask}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-xs font-semibold hover:bg-accent/90 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Create First Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDeliverables.map((deliverable) => {
            const isExpanded = expandedDeliverableId === deliverable.id;
            const hasOverdue = deliverable.stats.overdue > 0;
            const completionRate =
              deliverable.stats.total > 0
                ? Math.round((deliverable.stats.approved / deliverable.stats.total) * 100)
                : 0;

            return (
              <div
                key={deliverable.id}
                className={`border rounded-2xl bg-card transition-all duration-200 shadow-sm overflow-hidden ${
                  isExpanded ? 'border-accent/40 ring-1 ring-accent/20' : 'border-border hover:border-border/80'
                }`}
              >
                {/* Accordion Row Header */}
                <div
                  onClick={() => toggleExpand(deliverable.id)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none hover:bg-muted/15 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="mt-0.5 text-muted-foreground">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-accent" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-foreground tracking-tight">
                          {deliverable.title}
                        </h3>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent">
                          {deliverable.internship_title}
                        </span>
                        {deliverable.difficulty && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                            {deliverable.difficulty}
                          </span>
                        )}
                        {deliverable.attachments && deliverable.attachments.length > 0 && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            PDF Brief
                          </span>
                        )}
                      </div>

                      {deliverable.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-2xl">
                          {deliverable.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Status Summary */}
                  <div className="flex items-center gap-3 pl-8 md:pl-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-bold text-foreground">
                        {deliverable.stats.total} Intern{deliverable.stats.total !== 1 ? 's' : ''} Assigned
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center justify-end gap-2 mt-0.5">
                        <span className="text-emerald-600 font-medium">
                          {deliverable.stats.approved} approved
                        </span>
                        <span>•</span>
                        <span className="text-amber-600 font-medium">
                          {deliverable.stats.submitted} in review
                        </span>
                        {hasOverdue && (
                          <>
                            <span>•</span>
                            <span className="text-red-500 font-bold flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" />
                              {deliverable.stats.overdue} overdue
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onExtendDeliverable(deliverable);
                        }}
                        className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        title="Extend Deadline for all in-progress interns"
                      >
                        <Clock className="w-4 h-4 text-accent" />
                        <span className="hidden lg:inline">Extend</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditDeliverable(deliverable);
                        }}
                        className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        title="Edit master deliverable details"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span className="hidden lg:inline">Edit</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Slide-Down Detail Drawer */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-border bg-muted/10 p-5 space-y-6"
                    >
                      {/* Master Deliverable Details & Actions Bar */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Description & Requirements */}
                        <div className="lg:col-span-2 space-y-4">
                          {deliverable.description && (
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                Deliverable Brief
                              </h4>
                              <p className="text-sm text-foreground whitespace-pre-line leading-relaxed bg-card p-3 rounded-xl border border-border">
                                {deliverable.description}
                              </p>
                            </div>
                          )}

                          {deliverable.objectives && deliverable.objectives.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                Core Objectives
                              </h4>
                              <div className="space-y-1">
                                {deliverable.objectives.map((obj, i) => (
                                  <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                                    <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                                    <span>{obj}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {deliverable.attachments && deliverable.attachments.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                Task Brief Attachment
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {deliverable.attachments.map((att: any) => (
                                  <a
                                    key={att.id || att.url}
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border text-xs font-medium text-foreground hover:border-accent/40 hover:text-accent transition-colors"
                                  >
                                    <FileText className="w-4 h-4 text-accent" />
                                    <span className="truncate max-w-[200px]">{att.name || 'Task Document'}</span>
                                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Master Quick Actions Panel */}
                        <div className="space-y-3 bg-card p-4 rounded-xl border border-border h-fit">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Deliverable Management
                          </h4>

                          <div className="space-y-2 pt-1">
                            <button
                              type="button"
                              onClick={() => onEditDeliverable(deliverable)}
                              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                <Edit3 className="w-3.5 h-3.5 text-accent" /> Edit Deliverable Brief
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onExtendDeliverable(deliverable)}
                              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-accent" /> Extend Deadline for All
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onAssignMore(deliverable)}
                              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                <Plus className="w-3.5 h-3.5 text-emerald-500" /> Assign More Interns
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onDeleteDeliverable(deliverable)}
                              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-red-500/20 hover:bg-red-500/10 text-xs font-semibold text-red-500 transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                <Trash2 className="w-3.5 h-3.5" /> Delete Deliverable
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Assigned Interns Sub-List */}
                      <div className="space-y-2 pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-accent" />
                            Assigned Interns ({deliverable.assignedTasks.length})
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {deliverable.assignedTasks.map((task: any) => {
                            const isTaskOverdue =
                              task.status !== 'Approved' &&
                              task.due_date &&
                              new Date(task.due_date).setHours(23, 59, 59, 999) < Date.now();

                            return (
                              <div
                                key={task.id}
                                className="p-3 bg-card rounded-xl border border-border flex items-center justify-between gap-2 shadow-xs"
                              >
                                <div className="space-y-1 min-w-0">
                                  <div className="font-semibold text-xs text-foreground truncate">
                                    {task.assignee?.full_name || 'Assigned Intern'}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                        task.status === 'Approved'
                                          ? 'bg-emerald-500/15 text-emerald-600'
                                          : task.status === 'Submitted'
                                          ? 'bg-amber-500/15 text-amber-600'
                                          : isTaskOverdue
                                          ? 'bg-red-500/15 text-red-500'
                                          : 'bg-muted text-muted-foreground'
                                      }`}
                                    >
                                      {isTaskOverdue ? 'Overdue' : task.status}
                                    </span>
                                    <span>• Due: {task.due_date ? task.due_date.split('T')[0] : 'None'}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => onExtendSingleTask(task)}
                                    className="p-1.5 text-muted-foreground hover:text-accent rounded-lg hover:bg-muted transition-colors"
                                    title="Extend this intern's deadline"
                                  >
                                    <Clock className="w-3.5 h-3.5" />
                                  </button>
                                  {task.status === 'Submitted' && (
                                    <button
                                      type="button"
                                      onClick={() => onReviewTask(task)}
                                      className="px-2 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-lg text-[10px] font-bold hover:bg-amber-500/20 transition-colors"
                                    >
                                      Review
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
