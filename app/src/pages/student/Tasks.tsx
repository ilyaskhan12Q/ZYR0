import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle2, Clock, AlertCircle, Circle, Calendar, Paperclip, ChevronRight, Filter } from 'lucide-react';
import { tasks } from '@/data/mockData';

const tabs = ['All', 'Pending', 'Submitted', 'Approved'];

const statusIcons: Record<string, React.ElementType> = {
  Pending: Circle,
  Submitted: Clock,
  'Under Review': AlertCircle,
  Approved: CheckCircle2,
  Rejected: AlertCircle,
};

const statusColors: Record<string, string> = {
  Pending: 'text-muted-foreground',
  Submitted: 'text-amber-500',
  'Under Review': 'text-amber-500',
  Approved: 'text-emerald-500',
  Rejected: 'text-red-500',
};

export default function StudentTasks() {
  const [activeTab, setActiveTab] = useState('All');

  const filtered = activeTab === 'All' ? tasks : tasks.filter(t => t.status === activeTab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">Tasks assigned across your active internships</p>
      </div>

      <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}>
            {tab}
            {tab !== 'All' && <span className="ml-1.5 text-xs text-muted-foreground">({tasks.filter(t => t.status === tab).length})</span>}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((task, i) => {
          const StatusIcon = statusIcons[task.status] || Circle;
          return (
            <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <StatusIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${statusColors[task.status]}`} />
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">{task.internshipTitle}</p>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{task.description}</p>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      {task.attachments.length > 0 && <span className="flex items-center gap-1"><Paperclip className="w-3.5 h-3.5" /> {task.attachments.length} files</span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                    task.priority === 'High' ? 'bg-red-100 text-red-700' :
                    task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>{task.priority}</span>
                  <Link to={`/student/tasks/${task.id}`} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </div>
              </div>

              {task.submissions.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Submitted on {new Date(task.submissions[0].submittedDate).toLocaleDateString()}
                    {task.submissions[0].grade && <span className="ml-2 text-emerald-600 font-medium">Grade: {task.submissions[0].grade}%</span>}
                  </p>
                  {task.submissions[0].feedback && (
                    <p className="mt-1 text-xs text-muted-foreground italic">&ldquo;{task.submissions[0].feedback}&rdquo;</p>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
