import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle2, Clock, Circle, Star, MessageSquare, ThumbsUp, ThumbsDown, User, Calendar } from 'lucide-react';
import { tasks } from '@/data/mockData';

const tabs = ['To Review', 'Reviewed'];

export default function MentorTasks() {
  const [activeTab, setActiveTab] = useState('To Review');
  const toReview = tasks.filter(t => t.status === 'Submitted');
  const reviewed = tasks.filter(t => t.status === 'Approved' || t.status === 'Rejected');
  const filtered = activeTab === 'To Review' ? toReview : reviewed;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tasks to Review</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and provide feedback on intern submissions</p>
      </div>

      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            {tab} <span className="text-xs text-muted-foreground">({(tab === 'To Review' ? toReview : reviewed).length})</span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((task, i) => (
          <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{task.title}</h3>
                <p className="text-sm text-muted-foreground">{task.internshipTitle}</p>
              </div>
              <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                task.priority === 'High' ? 'bg-red-100 text-red-700' : task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
              }`}>{task.priority}</span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <img src={task.assignedToAvatar} alt="" className="w-7 h-7 rounded-full" />
              <span className="text-sm">{task.assignedToName}</span>
              <span className="text-xs text-muted-foreground"><Calendar className="w-3 h-3 inline mr-1" />Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{task.description}</p>

            {task.submissions.length > 0 && (
              <div className="bg-muted rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Submission</p>
                  <span className="text-xs text-muted-foreground">{new Date(task.submissions[0].submittedDate).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-muted-foreground">{task.submissions[0].notes}</p>
                {task.submissions[0].attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {task.submissions[0].attachments.map(a => (
                      <span key={a.id} className="px-3 py-1.5 bg-card border border-border rounded-lg text-xs flex items-center gap-1.5">
                        {a.name} <span className="text-muted-foreground">({a.size})</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'To Review' ? (
              <div className="space-y-4">
                <textarea placeholder="Provide feedback..." rows={3}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none text-sm" />
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Grade (0-100)</label>
                    <input type="number" min="0" max="100" placeholder="85"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm" />
                  </div>
                  <div className="flex items-end gap-2">
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600">
                      <ThumbsUp className="w-4 h-4" /> Approve
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">
                      <ThumbsDown className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              task.submissions[0]?.feedback && (
                <div className="bg-emerald-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">Reviewed</span>
                    {task.submissions[0].grade && <span className="text-sm text-emerald-600">Grade: {task.submissions[0].grade}%</span>}
                  </div>
                  <p className="text-sm text-emerald-700 italic">&ldquo;{task.submissions[0].feedback}&rdquo;</p>
                </div>
              )
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
