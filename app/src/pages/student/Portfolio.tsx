import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Award, Code, Star, Share2, MapPin, GraduationCap, Calendar, Quote, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyCertificates } from '@/services/certificates';
import { getMyTasks } from '@/services/tasks';
import { getMyApplications } from '@/services/applications';
import { supabase } from '@/lib/supabase';

export default function StudentPortfolio() {
  const { profile } = useAuth();
  const [shareModal, setShareModal] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPortfolioData() {
      if (!profile) return;
      try {
        const [certsRes, tasksRes, appsRes, evalsRes] = await Promise.all([
          getMyCertificates(),
          getMyTasks(),
          getMyApplications(),
          supabase
            .from('evaluations')
            .select(`
              id, period, overall_rating, strengths, additional_comments,
              mentor:profiles!mentor_id (full_name, avatar_url, title),
              internship:internships!internship_id (
                id, title,
                company:companies!company_id (name)
              )
            `)
            .eq('intern_id', profile.id)
            .eq('status', 'Submitted'),
        ]);

        if (certsRes.data) setCertificates(certsRes.data);
        if (tasksRes.data) setTasks(tasksRes.data);
        if (appsRes.data) setApplications(appsRes.data);
        if (evalsRes.data) setTestimonials(evalsRes.data);
      } catch (err) {
        console.error('Error loading portfolio data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPortfolioData();
  }, [profile]);

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // Filter accepted applications as real internship experiences
  const experiences = applications.filter((app) => app.status === 'Accepted');

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
            <img src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name || 'User'}`} alt="" className="w-24 h-24 rounded-2xl border-4 border-card shadow-lg object-cover" />
            <div className="flex-1">
              <h2 className="text-xl font-bold">{profile.full_name || 'Anonymous User'}</h2>
              <p className="text-sm text-muted-foreground">{profile.title || 'Student / Intern'}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {profile.university && <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4" /> {profile.university}</span>}
            {profile.graduation_year && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Expected Graduation: {profile.graduation_year}</span>}
            {profile.portfolio_url && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.portfolio_url}</span>}
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
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {profile.bio || 'No bio provided yet. Update your profile settings to add your professional description.'}
            </p>
          </motion.div>

          {/* Experience */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-semibold mb-4">Experience</h3>
            {experiences.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active or completed internships recorded.</p>
            ) : (
              <div className="space-y-6">
                {experiences.map((exp) => {
                  const company = Array.isArray(exp.internship?.company) ? exp.internship.company[0] : exp.internship?.company;
                  return (
                    <div key={exp.id} className="flex gap-4">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-medium">{exp.internship?.title || 'Internship Position'}</h4>
                        <p className="text-sm text-muted-foreground">{company?.name || 'Company Name'} &middot; Applied on {new Date(exp.applied_at).toLocaleDateString()}</p>
                        {exp.cover_letter && <p className="text-sm text-muted-foreground mt-1 bg-muted p-3 rounded-lg border border-border">Cover Letter: {exp.cover_letter}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Skills */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-semibold mb-4">Skills</h3>
            {(!profile.skills || profile.skills.length === 0) ? (
              <p className="text-sm text-muted-foreground">No skills added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, i) => (
                  <span key={i} className="px-3.5 py-1.5 bg-accent/10 text-accent font-medium text-xs rounded-full">{skill}</span>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Certificates */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border shadow-sm p-5">
            <h3 className="font-semibold mb-3">Certificates</h3>
            {certificates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No certificates earned yet.</p>
            ) : (
              <div className="space-y-3">
                {certificates.map((cert) => {
                  const company = Array.isArray(cert.company) ? cert.company[0] : cert.company;
                  return (
                    <div key={cert.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
                      <Award className="w-5 h-5 text-accent flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{cert.title}</p>
                        <p className="text-xs text-muted-foreground">{company?.name || 'Company'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Testimonials */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border shadow-sm p-5">
            <h3 className="font-semibold mb-3">Supervisor Testimonials</h3>
            {testimonials.length === 0 ? (
              <p className="text-sm text-muted-foreground">No supervisor evaluations submitted yet.</p>
            ) : (
              <div className="space-y-4">
                {testimonials.map((t) => (
                  <div key={t.id} className="p-3 bg-muted rounded-lg border border-border">
                    <Quote className="w-4 h-4 text-accent/40 mb-2" />
                    <p className="text-sm italic text-muted-foreground">&ldquo;{t.additional_comments || t.strengths}&rdquo;</p>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                      <img src={t.mentor?.avatar_url || `https://ui-avatars.com/api/?name=${t.mentor?.full_name || 'Mentor'}`} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="text-xs font-medium">{t.mentor?.full_name}</p>
                        <p className="text-[10px] text-muted-foreground">{t.mentor?.title || 'Supervisor'}, {t.internship?.company?.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-card rounded-xl border border-border shadow-sm p-5">
            <h3 className="font-semibold mb-3">Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Internships', value: experiences.length.toString(), icon: Briefcase },
                { label: 'Certificates', value: certificates.length.toString(), icon: Award },
                { label: 'Tasks Done', value: tasks.filter(t => t.status === 'Approved').length.toString(), icon: Code },
                { label: 'Skills', value: (profile.skills || []).length.toString(), icon: Star },
              ].map((s, i) => (
                <div key={i} className="text-center p-3 bg-muted rounded-lg border border-border">
                  <s.icon className="w-4 h-4 text-accent mx-auto mb-1" />
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Share Portfolio Modal */}
      {shareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border w-full max-w-md rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Share Portfolio</h3>
            <p className="text-sm text-muted-foreground mb-4">Copy the link below to share your verified student portfolio.</p>
            <input type="text" readOnly value={`${window.location.origin}/verify/portfolio/${profile.id}`} className="w-full p-2.5 bg-muted border border-border rounded-lg text-sm mb-4 focus:outline-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShareModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">Close</button>
              <button onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/verify/portfolio/${profile.id}`);
                alert('Copied to clipboard!');
              }} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">Copy Link</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
