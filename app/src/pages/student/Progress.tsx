import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle2, Clock, Target, Award, BookOpen, Code, Users, MessageSquare, Lightbulb, Star } from 'lucide-react';
import { tasks, internships, certificates } from '@/data/mockData';

const skills = [
  { name: 'JavaScript', category: 'Technical', level: 85 },
  { name: 'React', category: 'Technical', level: 80 },
  { name: 'Node.js', category: 'Technical', level: 70 },
  { name: 'Communication', category: 'Soft Skills', level: 90 },
  { name: 'Problem Solving', category: 'Soft Skills', level: 85 },
  { name: 'Git', category: 'Tools', level: 75 },
  { name: 'Figma', category: 'Tools', level: 65 },
  { name: 'Python', category: 'Technical', level: 60 },
];

const categoryIcons: Record<string, React.ElementType> = {
  Technical: Code,
  'Soft Skills': Users,
  Tools: BookOpen,
};

const categoryColors: Record<string, string> = {
  Technical: 'bg-blue-100 text-blue-700',
  'Soft Skills': 'bg-purple-100 text-purple-700',
  Tools: 'bg-amber-100 text-amber-700',
};

export default function StudentProgress() {
  const completedTasks = tasks.filter(t => t.status === 'Approved').length;
  const totalTasks = tasks.length;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Progress</h1>

      {/* Overall Progress */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-40 h-40 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
              <motion.circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--accent))" strokeWidth="10"
                strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 50}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - completionRate / 100) }}
                transition={{ duration: 1, ease: 'easeOut' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{completionRate}%</span>
              <span className="text-xs text-muted-foreground">Complete</span>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Tasks Done', value: `${completedTasks}/${totalTasks}`, icon: CheckCircle2, color: 'text-emerald-500' },
              { label: 'Internships', value: '2 Active', icon: Target, color: 'text-blue-500' },
              { label: 'Certificates', value: certificates.length.toString(), icon: Award, color: 'text-purple-500' },
              { label: 'Skills', value: skills.length.toString(), icon: Star, color: 'text-amber-500' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 bg-muted rounded-xl">
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress by Internship */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold mb-4">Internship Progress</h3>
          <div className="space-y-5">
            {internships.slice(0, 3).map((internship, i) => {
              const internTasks = tasks.filter(t => t.internshipId === internship.id);
              const completed = internTasks.filter(t => t.status === 'Approved').length;
              const pct = internTasks.length > 0 ? Math.round((completed / internTasks.length) * 100) : 0;
              return (
                <div key={internship.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <img src={internship.companyLogo} alt="" className="w-6 h-6 rounded" />
                      <span className="text-sm font-medium">{internship.title}</span>
                    </div>
                    <span className="text-sm font-bold">{pct}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div className="h-full bg-accent rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{completed}/{internTasks.length} tasks completed</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold mb-4">Skills Gained</h3>
          <div className="space-y-3">
            {skills.map((skill, i) => {
              const CatIcon = categoryIcons[skill.category] || Star;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <CatIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{skill.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[skill.category]}`}>{skill.category}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div className="h-full bg-accent rounded-full" initial={{ width: 0 }} animate={{ width: `${skill.level}%` }} transition={{ duration: 0.6, delay: i * 0.05 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Timeline */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-card rounded-xl border border-border shadow-sm p-6">
        <h3 className="font-semibold mb-4">Activity Timeline</h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          {[
            { icon: CheckCircle2, title: 'Completed Task: Unit Tests for Auth Module', date: 'Jan 19, 2025', color: 'text-emerald-500 bg-emerald-100' },
            { icon: Award, title: 'Received Feedback on API Endpoint', date: 'Jan 18, 2025', color: 'text-purple-500 bg-purple-100' },
            { icon: Target, title: 'Submitted Task: Design System Documentation', date: 'Jan 15, 2025', color: 'text-blue-500 bg-blue-100' },
            { icon: MessageSquare, title: 'New Message from Dr. Rodriguez', date: 'Jan 14, 2025', color: 'text-amber-500 bg-amber-100' },
          ].map((item, i) => (
            <div key={i} className="relative flex items-start gap-4 mb-6 last:mb-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.color.split(' ')[1]}`}>
                <item.icon className={`w-4 h-4 ${item.color.split(' ')[0]}`} />
              </div>
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
