import { motion } from 'framer-motion';
import { Download, Calendar, Users, FolderOpen, FileCheck, Award, TrendingUp } from 'lucide-react';

const reports = [
  { title: 'Monthly User Growth', desc: 'New registrations, active users, churn rate', date: 'Jan 2025', type: 'Users', icon: Users },
  { title: 'Internship Performance', desc: 'Applications, acceptances, completion rates', date: 'Jan 2025', type: 'Internships', icon: FolderOpen },
  { title: 'Application Pipeline', desc: 'Funnel analysis, conversion rates', date: 'Q4 2024', type: 'Applications', icon: FileCheck },
  { title: 'Certificate Issuance', desc: 'Certificates issued, verification stats', date: '2024', type: 'Certificates', icon: Award },
  { title: 'Platform Engagement', desc: 'DAU, MAU, session duration', date: 'Jan 2025', type: 'Analytics', icon: TrendingUp },
  { title: 'Company Satisfaction', desc: 'NPS, feedback, retention', date: 'Q4 2024', type: 'Companies', icon: FolderOpen },
];

export default function AdminReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Generate and download platform reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reports.map((report, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <report.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">{report.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{report.desc}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{report.date}</span>
                    <span className="px-2 py-0.5 bg-muted rounded-full">{report.type}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                <Download className="w-4 h-4" /> PDF
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                <Download className="w-4 h-4" /> CSV
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
