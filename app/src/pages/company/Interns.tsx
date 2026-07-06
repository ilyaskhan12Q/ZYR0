import { motion } from 'framer-motion';
import { Star, ClipboardList, MessageSquare } from 'lucide-react';

const interns = [
  { id: '1', name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=alex', role: 'Software Engineering Intern', progress: 85, tasksCompleted: 12, totalTasks: 14, rating: 4.8, status: 'On Track' },
  { id: '2', name: 'Emily Watson', avatar: 'https://i.pravatar.cc/150?u=emily', role: 'UI/UX Design Intern', progress: 72, tasksCompleted: 8, totalTasks: 11, rating: 4.5, status: 'On Track' },
  { id: '3', name: 'James Park', avatar: 'https://i.pravatar.cc/150?u=james', role: 'Data Science Intern', progress: 90, tasksCompleted: 9, totalTasks: 10, rating: 4.9, status: 'Exceeding' },
  { id: '4', name: 'Maria Garcia', avatar: 'https://i.pravatar.cc/150?u=maria', role: 'Marketing Intern', progress: 60, tasksCompleted: 6, totalTasks: 10, rating: 4.2, status: 'Needs Attention' },
];

export default function CompanyInterns() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Interns</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage and track your active interns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {interns.map((intern, i) => (
          <motion.div key={intern.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img src={intern.avatar} alt="" className="w-12 h-12 rounded-full" />
                <div>
                  <h3 className="font-semibold">{intern.name}</h3>
                  <p className="text-sm text-muted-foreground">{intern.role}</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                intern.status === 'On Track' ? 'bg-emerald-100 text-emerald-700' :
                intern.status === 'Exceeding' ? 'bg-blue-100 text-blue-700' :
                'bg-amber-100 text-amber-700'
              }`}>{intern.status}</span>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium">{intern.progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div className="h-full bg-accent rounded-full" initial={{ width: 0 }} animate={{ width: `${intern.progress}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="text-center p-2 bg-muted rounded-lg">
                <p className="text-sm font-medium">{intern.tasksCompleted}/{intern.totalTasks}</p>
                <p className="text-[10px] text-muted-foreground">Tasks</p>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <p className="text-sm font-medium">{intern.rating}</p>
                <p className="text-[10px] text-muted-foreground">Rating</p>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <p className="text-sm font-medium">{Math.ceil((100 - intern.progress) / 10)}w</p>
                <p className="text-[10px] text-muted-foreground">Remaining</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                <ClipboardList className="w-3.5 h-3.5" /> Tasks
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                <Star className="w-3.5 h-3.5" /> Evaluate
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                <MessageSquare className="w-3.5 h-3.5" /> Message
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
