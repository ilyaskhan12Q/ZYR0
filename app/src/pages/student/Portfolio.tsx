import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Award, Code, Users, MessageSquare, Star, Share2, ExternalLink, MapPin, GraduationCap, Calendar, ThumbsUp, Quote } from 'lucide-react';
import { certificates, tasks, internships } from '@/data/mockData';

const experiences = [
  { role: 'Software Engineering Intern', company: 'TechFlow Inc.', duration: 'Jun 2024 - Dec 2024', description: 'Built REST APIs and frontend components using React and Node.js.', skills: ['React', 'Node.js', 'TypeScript'] },
  { role: 'Data Science Intern', company: 'DataMinds', duration: 'Jan 2024 - Apr 2024', description: 'Developed ML models for customer segmentation and predictive analytics.', skills: ['Python', 'Machine Learning', 'SQL'] },
];

const testimonials = [
  { name: 'Dr. Michael Rodriguez', role: 'Senior Engineer, TechFlow', text: 'Alex demonstrated exceptional technical skills and a strong work ethic. One of the best interns we have had.', avatar: 'https://i.pravatar.cc/150?u=michael' },
];

const allSkills = [
  { name: 'JavaScript', level: 90 },
  { name: 'React', level: 85 },
  { name: 'Node.js', level: 80 },
  { name: 'TypeScript', level: 82 },
  { name: 'Python', level: 70 },
  { name: 'SQL', level: 75 },
  { name: 'Git', level: 88 },
  { name: 'Figma', level: 60 },
];

export default function StudentPortfolio() {
  const [shareModal, setShareModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-1">Your professional profile and verified experience</p>
        </div>
        <button onClick={() => setShareModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
          <Share2 className="w-4 h-4" /> Share Portfolio
        </button>
      </div>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary to-accent" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-12 mb-4 gap-4">
            <img src="https://i.pravatar.cc/150?u=alex" alt="" className="w-24 h-24 rounded-2xl border-4 border-card shadow-lg" />
            <div className="flex-1">
              <h2 className="text-xl font-bold">Alex Johnson</h2>
              <p className="text-sm text-muted-foreground">Computer Science Student | Full-Stack Developer</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> San Francisco, CA</span>
            <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4" /> Stanford University</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Expected Graduation: June 2025</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-semibold mb-3">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Passionate computer science student with hands-on experience in full-stack development and data science.
              Completed internships at TechFlow Inc. and DataMinds, building production-ready applications and ML models.
              Seeking opportunities to apply my skills in innovative tech companies.
            </p>
          </motion.div>

          {/* Experience */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-semibold mb-4">Experience</h3>
            <div className="space-y-6">
              {experiences.map((exp, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-medium">{exp.role}</h4>
                    <p className="text-sm text-muted-foreground">{exp.company} &middot; {exp.duration}</p>
                    <p className="text-sm text-muted-foreground mt-1">{exp.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {exp.skills.map((s, j) => (
                        <span key={j} className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-semibold mb-4">Skills</h3>
            <div className="space-y-3">
              {allSkills.map((skill, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{skill.name}</span>
                    <span className="text-xs text-muted-foreground">{skill.level}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div className="h-full bg-accent rounded-full" initial={{ width: 0 }} animate={{ width: `${skill.level}%` }} transition={{ duration: 0.6, delay: i * 0.05 }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Certificates */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border shadow-sm p-5">
            <h3 className="font-semibold mb-3">Certificates</h3>
            <div className="space-y-3">
              {certificates.map((cert) => (
                <div key={cert.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Award className="w-5 h-5 text-accent flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{cert.title}</p>
                    <p className="text-xs text-muted-foreground">{cert.company}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Testimonials */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border shadow-sm p-5">
            <h3 className="font-semibold mb-3">Testimonials</h3>
            <div className="space-y-4">
              {testimonials.map((t, i) => (
                <div key={i} className="p-3 bg-muted rounded-lg">
                  <Quote className="w-4 h-4 text-accent/40 mb-2" />
                  <p className="text-sm italic text-muted-foreground">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-2 mt-3">
                    <img src={t.avatar} alt="" className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="text-xs font-medium">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-card rounded-xl border border-border shadow-sm p-5">
            <h3 className="font-semibold mb-3">Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Internships', value: '2', icon: Briefcase },
                { label: 'Certificates', value: '2', icon: Award },
                { label: 'Tasks Done', value: tasks.filter(t => t.status === 'Approved').length.toString(), icon: Code },
                { label: 'Skills', value: allSkills.length.toString(), icon: Star },
              ].map((s, i) => (
                <div key={i} className="text-center p-3 bg-muted rounded-lg">
                  <s.icon className="w-4 h-4 text-accent mx-auto mb-1" />
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
