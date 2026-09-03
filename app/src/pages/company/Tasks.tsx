import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Loader2,
  FilterX,
  User,
  Package,
  Users,
} from 'lucide-react';
import { getCompanyTasks, deleteMasterDeliverable } from '@/services/tasks';
import { getMyCompany } from '@/services/companies';
import { getAllCompanyApplications } from '@/services/applications';
import { getInternships } from '@/services/internships';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

import { TaskStatsHeader } from '@/components/company/tasks/TaskStatsHeader';
import { TaskFilterBar } from '@/components/company/tasks/TaskFilterBar';
import { TaskCardGrid } from '@/components/company/tasks/TaskCardGrid';
import { TaskTable } from '@/components/company/tasks/TaskTable';
import { TaskCreateEditModal } from '@/components/company/tasks/TaskCreateEditModal';
import { TaskReviewDrawer } from '@/components/company/tasks/TaskReviewDrawer';
import { TaskBulkActionBar } from '@/components/company/tasks/TaskBulkActionBar';
import { TaskExtendDeadlineModal } from '@/components/company/tasks/TaskExtendDeadlineModal';
import {
  MasterDeliverablesList,
  type MasterDeliverableGroup,
} from '@/components/company/tasks/MasterDeliverablesList';

export default function CompanyTasks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [interns, setInterns] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);

  // Nested Workspace Tab State ('deliverables' | 'submissions')
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'deliverables' | 'submissions'>('deliverables');

  // Multi-Selection State for Submissions & Bulk Actions
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [tasksToExtend, setTasksToExtend] = useState<any[]>([]);

  // Filtering & View State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedInternship, setSelectedInternship] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal & Drawer State
  const [showCreateEditModal, setShowCreateEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [reviewingTask, setReviewingTask] = useState<any | null>(null);

  const studentIdParam = searchParams.get('studentId') || searchParams.get('student_id');

  const loadData = async (useCache = true) => {
    try {
      const { data: co } = await getMyCompany();
      if (co) {
        setCompany(co);
        const settled = await Promise.race([
          Promise.allSettled([
            getCompanyTasks(co.id, useCache),
            getAllCompanyApplications(co.id),
            getInternships({ company_id: co.id, status: 'Active' }),
          ]),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Company tasks timeout')), 10000)
          ),
        ]);

        const [tasksRes, appsRes, internshipsRes] = settled;

        if (tasksRes.status === 'fulfilled' && tasksRes.value.data) {
          setTasks(tasksRes.value.data);
        }
        if (appsRes.status === 'fulfilled' && appsRes.value.data) {
          const activeInterns = appsRes.value.data.filter((app: any) => app.status === 'Accepted');
          setInterns(activeInterns);
        }
        if (internshipsRes.status === 'fulfilled' && internshipsRes.value.data) {
          setInternships(internshipsRes.value.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Supabase Realtime live sync for tasks
  useEffect(() => {
    if (!company?.id) return;
    const channel = supabase
      .channel(`company-tasks-rt-${company.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          loadData(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [company?.id]);

  // Filtered & Sorted Tasks Computation for Submissions Tab
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        // Status filter: handle 'Overdue' properly (non-approved + past due_date)
        if (selectedStatus === 'Overdue') {
          if (t.status === 'Approved' || !t.due_date) return false;
          const due = new Date(t.due_date);
          due.setHours(23, 59, 59, 999);
          if (due.getTime() >= Date.now()) return false;
        } else if (selectedStatus !== 'All' && t.status !== selectedStatus) {
          return false;
        }

        // Internship filter
        if (selectedInternship && t.internship_id !== selectedInternship) return false;

        // Priority filter
        if (selectedPriority && t.priority !== selectedPriority) return false;

        // Student Param filter
        if (studentIdParam && t.assigned_to !== studentIdParam) return false;

        // Search Query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const titleMatch = t.title?.toLowerCase().includes(q);
          const descMatch = t.description?.toLowerCase().includes(q);
          const internMatch = t.assignee?.full_name?.toLowerCase().includes(q);
          const projectMatch = t.internship?.title?.toLowerCase().includes(q);
          if (!titleMatch && !descMatch && !internMatch && !projectMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }
        if (sortBy === 'priority') {
          const pMap: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
          return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
        }
        if (sortBy === 'title') {
          return (a.title || '').localeCompare(b.title || '');
        }
        if (sortBy === 'status') {
          return (a.status || '').localeCompare(b.status || '');
        }
        return 0;
      });
  }, [tasks, selectedStatus, selectedInternship, selectedPriority, studentIdParam, searchQuery, sortBy]);

  const taskCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: tasks.length,
      Pending: 0,
      Submitted: 0,
      Approved: 0,
      Rejected: 0,
      Overdue: 0,
    };
    tasks.forEach((t) => {
      if (counts[t.status] !== undefined) {
        counts[t.status]++;
      }
      if (t.status !== 'Approved' && t.due_date) {
        const due = new Date(t.due_date);
        due.setHours(23, 59, 59, 999);
        if (due.getTime() < Date.now()) {
          counts.Overdue++;
        }
      }
    });
    return counts;
  }, [tasks]);

  // Unique Master Deliverables count
  const uniqueDeliverablesCount = useMemo(() => {
    const set = new Set(tasks.map((t) => `${t.internship_id}:::${t.title}`));
    return set.size;
  }, [tasks]);

  // Overdue tasks total
  const overdueCount = useMemo(() => {
    return tasks.filter((t) => {
      if (t.status === 'Approved' || !t.due_date) return false;
      const due = new Date(t.due_date);
      due.setHours(23, 59, 59, 999);
      return due.getTime() < Date.now();
    }).length;
  }, [tasks]);

  const handleOpenCreate = () => {
    setEditingTask(null);
    setShowCreateEditModal(true);
  };

  const handleOpenEdit = (task: any) => {
    setEditingTask(task);
    setShowCreateEditModal(true);
  };

  const handleOpenReview = (task: any) => {
    setReviewingTask(task);
  };

  // Master Deliverable Handlers
  const handleEditDeliverable = (deliverable: MasterDeliverableGroup) => {
    const baseTask = deliverable.assignedTasks[0] || {};
    setEditingTask({
      ...baseTask,
      isMasterEdit: true,
      originalTitle: deliverable.title,
      internship_id: deliverable.internship_id,
      title: deliverable.title,
      description: deliverable.description,
      priority: deliverable.priority,
      difficulty: deliverable.difficulty,
      estimated_duration: deliverable.estimated_duration,
      due_date: deliverable.due_date,
      attachments: deliverable.attachments,
      objectives: deliverable.objectives,
      acceptance_criteria: deliverable.acceptance_criteria,
    });
    setShowCreateEditModal(true);
  };

  const handleExtendDeliverable = (deliverable: MasterDeliverableGroup) => {
    // Select in-progress/unapproved tasks for this deliverable
    const activeTasks = deliverable.assignedTasks.filter((t) => t.status !== 'Approved');
    setTasksToExtend(activeTasks.length > 0 ? activeTasks : deliverable.assignedTasks);
    setExtendModalOpen(true);
  };

  const handleAssignMore = (deliverable: MasterDeliverableGroup) => {
    setEditingTask({
      title: deliverable.title,
      description: deliverable.description,
      internship_id: deliverable.internship_id,
      priority: deliverable.priority,
      difficulty: deliverable.difficulty,
      estimated_duration: deliverable.estimated_duration,
      due_date: deliverable.due_date,
      attachments: deliverable.attachments,
      objectives: deliverable.objectives,
      acceptance_criteria: deliverable.acceptance_criteria,
      assigned_to: '',
      isMasterEdit: false,
    });
    setShowCreateEditModal(true);
  };

  const handleDeleteDeliverable = async (deliverable: MasterDeliverableGroup) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete deliverable "${deliverable.title}"?\n\nThis will remove this task from all unsubmitted interns. If any interns have already submitted work, their submissions will be preserved.`
    );
    if (!confirmed) return;

    // Optimistically remove unsubmitted matching tasks immediately from state
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.filter(
        (t) =>
          !(
            t.internship_id === deliverable.internship_id &&
            t.title === deliverable.title &&
            (t.status === 'Pending' || t.status === 'Rejected')
          )
      )
    );

    try {
      const res = await deleteMasterDeliverable(deliverable.internship_id, deliverable.title);
      if (res.error) {
        setTasks(previousTasks);
        toast.error(`Failed to delete deliverable: ${res.error.message || res.error}`);
      } else {
        toast.success(
          `Deliverable deleted. Removed from ${res.deleted} intern(s).${
            res.skipped > 0 ? ` ${res.skipped} submitted task(s) preserved.` : ''
          }`
        );
        loadData(false);
      }
    } catch (err: any) {
      setTasks(previousTasks);
      toast.error(`Error deleting deliverable: ${err.message || err}`);
    }
  };

  // Deadline Extension Handlers
  const handleOpenSingleExtend = (task: any) => {
    setTasksToExtend([task]);
    setExtendModalOpen(true);
  };

  const handleOpenBulkExtend = () => {
    const selected = tasks.filter((t) => selectedTaskIds.includes(t.id));
    if (selected.length === 0) return;
    setTasksToExtend(selected);
    setExtendModalOpen(true);
  };

  // Selection Management
  const handleToggleSelectTask = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSelectAllOnPage = () => {
    const allPageIds = filteredTasks.map((t) => t.id);
    const areAllSelected = allPageIds.length > 0 && allPageIds.every((id) => selectedTaskIds.includes(id));
    if (areAllSelected) {
      setSelectedTaskIds((prev) => prev.filter((id) => !allPageIds.includes(id)));
    } else {
      setSelectedTaskIds((prev) => Array.from(new Set([...prev, ...allPageIds])));
    }
  };

  const handleSelectAllOverdue = () => {
    const overdueIds = tasks
      .filter((t) => {
        if (t.status === 'Approved' || !t.due_date) return false;
        const due = new Date(t.due_date);
        due.setHours(23, 59, 59, 999);
        return due.getTime() < Date.now();
      })
      .map((t) => t.id);
    setSelectedTaskIds(overdueIds);
  };

  const handleClearSelection = () => {
    setSelectedTaskIds([]);
  };

  const hasActiveFilters = Boolean(
    searchQuery || selectedStatus !== 'All' || selectedInternship || selectedPriority || studentIdParam
  );

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All');
    setSelectedInternship('');
    setSelectedPriority('');
    setSortBy('dueDate');
    if (studentIdParam) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('studentId');
      nextParams.delete('student_id');
      setSearchParams(nextParams);
    }
  };

  const filteredStudentName = studentIdParam
    ? tasks.find((t) => t.assigned_to === studentIdParam)?.assignee?.full_name || 'Selected Intern'
    : '';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading task management workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Workspace Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Company Task Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize master deliverables, track intern submissions, and manage deadlines
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-all shadow-md shadow-accent/20 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Create New Task
        </button>
      </div>

      {/* Metric Cards Header */}
      <TaskStatsHeader
        tasks={tasks}
        activeTab={selectedStatus}
        onSelectTab={(tab) => {
          setSelectedStatus(tab);
          setActiveWorkspaceTab('submissions');
        }}
      />

      {/* Nested Workspace Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          type="button"
          onClick={() => setActiveWorkspaceTab('deliverables')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeWorkspaceTab === 'deliverables'
              ? 'bg-accent text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Master Deliverables</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              activeWorkspaceTab === 'deliverables'
                ? 'bg-white/20 text-white'
                : 'bg-muted text-foreground'
            }`}
          >
            {uniqueDeliverablesCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveWorkspaceTab('submissions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeWorkspaceTab === 'submissions'
              ? 'bg-accent text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Intern Submissions</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              activeWorkspaceTab === 'submissions'
                ? 'bg-white/20 text-white'
                : 'bg-muted text-foreground'
            }`}
          >
            {tasks.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Master Deliverables Expandable Drawer View */}
      {activeWorkspaceTab === 'deliverables' && (
        <MasterDeliverablesList
          tasks={tasks}
          internships={internships}
          interns={interns}
          onEditDeliverable={handleEditDeliverable}
          onExtendDeliverable={handleExtendDeliverable}
          onAssignMore={handleAssignMore}
          onDeleteDeliverable={handleDeleteDeliverable}
          onReviewTask={handleOpenReview}
          onExtendSingleTask={handleOpenSingleExtend}
          onCreateNewTask={handleOpenCreate}
        />
      )}

      {/* Tab 2: Intern Submissions (Cards / Table with Bulk Actions) */}
      {activeWorkspaceTab === 'submissions' && (
        <div className="space-y-6">
          {/* Selected Student Banner (if query param active) */}
          {studentIdParam && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 bg-accent/10 border border-accent/20 rounded-2xl text-sm shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-medium block">
                    Filter active by intern:
                  </span>
                  <strong className="text-foreground text-sm font-bold">
                    {filteredStudentName}
                  </strong>
                </div>
              </div>

              <button
                onClick={() => {
                  const nextParams = new URLSearchParams(searchParams);
                  nextParams.delete('studentId');
                  nextParams.delete('student_id');
                  setSearchParams(nextParams);
                }}
                className="flex items-center gap-1 text-xs px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent rounded-xl font-semibold transition-colors"
              >
                <FilterX className="w-3.5 h-3.5" /> Clear Filter
              </button>
            </motion.div>
          )}

          {/* Filter Bar & Controls */}
          <TaskFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeTab={selectedStatus}
            onTabChange={setSelectedStatus}
            selectedInternshipId={selectedInternship}
            onInternshipChange={setSelectedInternship}
            selectedPriority={selectedPriority}
            onPriorityChange={setSelectedPriority}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            setViewMode={setViewMode}
            internships={internships}
            taskCounts={taskCounts}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Task List / Grid Display */}
          {viewMode === 'grid' ? (
            <TaskCardGrid
              tasks={filteredTasks}
              selectedTaskIds={selectedTaskIds}
              onToggleSelectTask={handleToggleSelectTask}
              onExtendDeadline={handleOpenSingleExtend}
              onEditTask={handleOpenEdit}
              onReviewTask={handleOpenReview}
            />
          ) : (
            <TaskTable
              tasks={filteredTasks}
              selectedTaskIds={selectedTaskIds}
              onToggleSelectTask={handleToggleSelectTask}
              onSelectAllOnPage={handleSelectAllOnPage}
              onExtendDeadline={handleOpenSingleExtend}
              onEditTask={handleOpenEdit}
              onReviewTask={handleOpenReview}
            />
          )}

          {/* Floating Bulk Action Bar */}
          <TaskBulkActionBar
            selectedCount={selectedTaskIds.length}
            totalOverdueCount={overdueCount}
            onOpenExtend={handleOpenBulkExtend}
            onSelectAllOverdue={handleSelectAllOverdue}
            onClearSelection={handleClearSelection}
          />
        </div>
      )}

      {/* Create / Edit Task Modal */}
      {showCreateEditModal && (
        <TaskCreateEditModal
          isOpen={showCreateEditModal}
          taskToEdit={editingTask}
          internships={internships}
          interns={interns}
          existingTasks={tasks}
          onClose={() => setShowCreateEditModal(false)}
          onSuccess={() => loadData(false)}
        />
      )}

      {/* Extend Deadline Modal */}
      {extendModalOpen && (
        <TaskExtendDeadlineModal
          isOpen={extendModalOpen}
          onClose={() => {
            setExtendModalOpen(false);
            setTasksToExtend([]);
          }}
          tasksToExtend={tasksToExtend}
          onSuccess={() => {
            loadData(false);
            handleClearSelection();
          }}
        />
      )}

      {/* Review Submission Split Drawer */}
      {reviewingTask && (
        <TaskReviewDrawer
          task={reviewingTask}
          onClose={() => setReviewingTask(null)}
          onSuccess={() => loadData(false)}
        />
      )}
    </div>
  );
}
