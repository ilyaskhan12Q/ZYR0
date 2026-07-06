import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, ClipboardList, CheckCircle2, Clock, Circle, Calendar, Paperclip, ChevronRight, User } from 'lucide-react';
import { tasks } from '@/data/mockData';

const tabs = ['All', 'Pending', 'Submitted', 'Approved'];

export default function CompanyTasks() {
  const [activeTab, setActiveTab] = useState('All');
  const filtered = activeTab === 'All' ? tasks : tasks.filter(t => t.status === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Task Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage tasks for your interns</p>
        </div>
        <Link to="/company/tasks/new" className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90">
          <Plus className="w-4 h-4" /> Create Task
        </Link>
      </div>

      <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            {tab} {tab !== 'All' && <span className="text-xs text-muted-foreground">({tasks.filter(t => t.status === tab).length})</span>}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((task, i) => (
          <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {task.status === 'Approved' ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" /> :
                 task.status === 'Submitted' ? <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" /> :
                 <Circle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />}
                <div>
                  <h3 className="font-semibold">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">{task.internshipTitle}</p>
                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {task.assignedToName}</span>
                    {task.attachments.length > 0 && <span className="flex items-center gap-1"><Paperclip className="w-3.5 h-3.5" /> {task.attachments.length} files</span>}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                  task.priority === 'High' ? 'bg-red-100 text-red-700' : task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                }`}>{task.priority}</span>
                <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                  task.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : task.status === 'Submitted' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                }`}>{task.status}</span>
              </div>
            </div>

            {task.submissions.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    Submitted by <span className="font-medium">{task.submissions[0].studentName}</span> on {new Date(task.submissions[0].submittedDate).toLocaleDateString()}
                    {task.submissions[0].grade && <span className="ml-2 text-emerald-600 font-medium">Grade: {task.submissions[0].grade}%</span>}
                  </p>
                  <button className="px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent/90">
                    Review
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
