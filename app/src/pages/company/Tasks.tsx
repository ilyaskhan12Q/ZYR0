import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Loader2,
  FilterX,
  User,
} from 'lucide-react';
import { getTasksAssignedByMe } from '@/services/tasks';
import { getMyCompany } from '@/services/companies';
import { getAllCompanyApplications } from '@/services/applications';
import { getInternships } from '@/services/internships';

import { TaskStatsHeader } from '@/components/company/tasks/TaskStatsHeader';
import { TaskFilterBar } from '@/components/company/tasks/TaskFilterBar';
import { TaskCardGrid } from '@/components/company/tasks/TaskCardGrid';
import { TaskTable } from '@/components/company/tasks/TaskTable';
import { TaskCreateEditModal } from '@/components/company/tasks/TaskCreateEditModal';
import { TaskReviewDrawer } from '@/components/company/tasks/TaskReviewDrawer';

export default function CompanyTasks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [interns, setInterns] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);

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

  const loadData = async () => {
    try {
      const { data: co } = await getMyCompany();
      if (co) {
        setCompany(co);
        const [tasksRes, appsRes, internshipsRes] = await Promise.all([
          getTasksAssignedByMe(),
          getAllCompanyApplications(co.id),
          getInternships({ company_id: co.id, status: 'Active' }),
        ]);

        if (tasksRes.data) {
          setTasks(tasksRes.data);
        }
        if (appsRes.data) {
          const activeInterns = appsRes.data.filter((app: any) => app.status === 'Accepted');
          setInterns(activeInterns);
        }
        if (internshipsRes.data) {
          setInternships(internshipsRes.data);
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

  // Filtered & Sorted Tasks Computation
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        // Status filter
        if (selectedStatus !== 'All' && t.status !== selectedStatus) return false;

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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Workspace Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Company Task Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Assign, monitor, and review intern deliverables with precision
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
      <TaskStatsHeader tasks={tasks} activeTab={selectedStatus} onSelectTab={setSelectedStatus} />

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
              <span className="text-xs text-muted-foreground font-medium block">Filter active by intern:</span>
              <strong className="text-foreground text-sm font-bold">{filteredStudentName}</strong>
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
          onEditTask={handleOpenEdit}
          onReviewTask={handleOpenReview}
        />
      ) : (
        <TaskTable
          tasks={filteredTasks}
          onEditTask={handleOpenEdit}
          onReviewTask={handleOpenReview}
        />
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
          onSuccess={loadData}
        />
      )}

      {/* Review Submission Split Drawer */}
      {reviewingTask && (
        <TaskReviewDrawer
          task={reviewingTask}
          onClose={() => setReviewingTask(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
