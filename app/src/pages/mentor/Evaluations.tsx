import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckSquare, Star, Save, Send, ChevronDown, ChevronUp, User, Award, ThumbsUp, ThumbsDown, Loader2, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const skillCategories = [
  { skill: 'Technical Skills', category: 'Technical' },
  { skill: 'Problem Solving', category: 'Technical' },
  { skill: 'Communication', category: 'Soft Skills' },
  { skill: 'Teamwork', category: 'Soft Skills' },
  { skill: 'Time Management', category: 'Soft Skills' },
  { skill: 'Initiative', category: 'Soft Skills' },
];

export default function MentorEvaluations() {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const studentIdParam = searchParams.get('student_id') || searchParams.get('studentId');

  const [interns, setInterns] = useState<any[]>([]);
  const [loadingInterns, setLoadingInterns] = useState(true);
  const [selectedIntern, setSelectedIntern] = useState<any>(null);

  const [period, setPeriod] = useState<string>('Midterm');
  const [expandedSection, setExpandedSection] = useState<string | null>('skills');
  const [loadingEvaluation, setLoadingEvaluation] = useState(false);
  const [evaluationId, setEvaluationId] = useState<string | null>(null);
  const [evaluationStatus, setEvaluationStatus] = useState<'Draft' | 'Submitted'>('Draft');

  // Form Fields
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [skillComments, setSkillComments] = useState<Record<string, string>>({});
  const [overallRating, setOverallRating] = useState(0);
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [goalsAchieved, setGoalsAchieved] = useState('');
  const [recommendCertificate, setRecommendCertificate] = useState(false);
  const [wouldRehire, setWouldRehire] = useState(false);
  const [additionalComments, setAdditionalComments] = useState('');
  
  const [saving, setSaving] = useState(false);

  // Load interns list
  useEffect(() => {
    async function loadInterns() {
      if (!profile?.company_id) {
        setLoadingInterns(false);
        return;
      }
      try {
        const { data: apps, error } = await supabase
          .from('applications')
          .select(`
            id,
            status,
            internship:internships!internship_id (
              id,
              title,
              company_id
            ),
            student:profiles!student_id (
              id,
              full_name,
              avatar_url,
              university
            )
          `)
          .eq('status', 'Accepted');

        if (error) throw error;

        const companyApps = (apps || []).filter(
          (app: any) => app.internship?.company_id === profile.company_id
        );

        const list = companyApps.map((app: any) => ({
          id: app.student?.id,
          name: app.student?.full_name || 'Anonymous Student',
          avatar: app.student?.avatar_url,
          role: app.internship?.title || 'Intern',
          internshipId: app.internship?.id,
        })).filter((item: any) => item.id);

        setInterns(list);

        // Pre-select based on search param or first intern
        if (list.length > 0) {
          const match = list.find((i: any) => i.id === studentIdParam);
          setSelectedIntern(match || list[0]);
        }
      } catch (err: any) {
        console.error('Error fetching interns:', err);
        toast.error('Failed to load interns list');
      } finally {
        setLoadingInterns(false);
      }
    }
    loadInterns();
  }, [profile, studentIdParam]);

  // Load existing evaluation when selected intern or period changes
  useEffect(() => {
    async function loadEvaluation() {
      if (!profile || !selectedIntern) return;
      
      try {
        setLoadingEvaluation(true);
        const { data, error } = await supabase
          .from('evaluations')
          .select('*')
          .eq('intern_id', selectedIntern.id)
          .eq('mentor_id', profile.id)
          .eq('internship_id', selectedIntern.internshipId)
          .eq('period', period)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setEvaluationId(data.id);
          setEvaluationStatus(data.status || 'Draft');
          setOverallRating(Number(data.overall_rating) || 0);
          setStrengths(data.strengths || '');
          setImprovements(data.improvements || '');
          setGoalsAchieved(data.goals_achieved || '');
          setRecommendCertificate(data.recommend_certificate || false);
          setWouldRehire(data.would_rehire || false);
          setAdditionalComments(data.additional_comments || '');

          // Map skills assessment array to state
          const newRatings: Record<string, number> = {};
          const newComments: Record<string, string> = {};
          
          if (Array.isArray(data.skills_assessment)) {
            data.skills_assessment.forEach((item: any) => {
              if (item.skill) {
                newRatings[item.skill] = item.rating || 0;
                newComments[item.skill] = item.comments || '';
              }
            });
          }
          setRatings(newRatings);
          setSkillComments(newComments);
        } else {
          // Reset Form for new entry
          setEvaluationId(null);
          setEvaluationStatus('Draft');
          setRatings({});
          setSkillComments({});
          setOverallRating(0);
          setStrengths('');
          setImprovements('');
          setGoalsAchieved('');
          setRecommendCertificate(false);
          setWouldRehire(false);
          setAdditionalComments('');
        }
      } catch (err: any) {
        console.error('Error loading evaluation:', err);
        toast.error('Failed to load existing evaluation draft');
      } finally {
        setLoadingEvaluation(false);
      }
    }

    loadEvaluation();
  }, [selectedIntern, period, profile]);

  const handleSave = async (status: 'Draft' | 'Submitted') => {
    if (!profile || !selectedIntern) return;

    if (status === 'Submitted') {
      if (overallRating === 0) {
        toast.error('Please provide an overall rating before submitting.');
        return;
      }
      // Confirm details are filled
      const missingSkills = skillCategories.filter(cat => !ratings[cat.skill]);
      if (missingSkills.length > 0) {
        toast.error(`Please rate all skills before submitting: ${missingSkills.map(m => m.skill).join(', ')}`);
        return;
      }
    }

    try {
      setSaving(true);

      const skillsAssessment = skillCategories.map(cat => ({
        skill: cat.skill,
        category: cat.category,
        rating: ratings[cat.skill] || 0,
        comments: skillComments[cat.skill] || '',
      }));

      const payload = {
        intern_id: selectedIntern.id,
        mentor_id: profile.id,
        internship_id: selectedIntern.internshipId,
        period: period,
        skills_assessment: skillsAssessment,
        overall_rating: overallRating || null,
        strengths,
        improvements,
        goals_achieved: goalsAchieved,
        recommend_certificate: recommendCertificate,
        would_rehire: wouldRehire,
        additional_comments: additionalComments,
        status,
        submitted_at: status === 'Submitted' ? new Date().toISOString() : null,
      };

      const { data, error } = await supabase
        .from('evaluations')
        .upsert(payload, {
          onConflict: 'mentor_id,intern_id,internship_id,period'
        })
        .select()
        .single();

      if (error) throw error;

      setEvaluationId(data.id);
      setEvaluationStatus(data.status);
      toast.success(status === 'Submitted' ? 'Evaluation submitted successfully!' : 'Evaluation saved as draft!');
    } catch (err: any) {
      console.error('Error saving evaluation:', err);
      toast.error(err.message || 'Failed to save evaluation');
    } finally {
      setSaving(false);
    }
  };

  const isSubmitted = evaluationStatus === 'Submitted';

  const toggleSection = (section: string) => setExpandedSection(expandedSection === section ? null : section);

  if (loadingInterns) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (interns.length === 0) {
    return (
      <div className="text-center py-12 bg-card border border-border rounded-xl max-w-3xl">
        <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-lg">No Interns to Evaluate</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Once your company accepts application candidates, they will be listable here for evaluation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Performance Evaluation</h1>
          <p className="text-sm text-muted-foreground mt-1">Evaluate your intern&apos;s performance periodically</p>
        </div>
        {isSubmitted && (
          <span className="self-start sm:self-auto text-xs px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-full font-semibold flex items-center gap-1">
            ✓ Submitted Evaluation
          </span>
        )}
      </div>

      {/* Selector controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Intern Selector */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-4 md:col-span-2">
          <label className="text-sm font-medium mb-2 block">Select Intern</label>
          <div className="flex flex-wrap gap-2">
            {interns.map(intern => (
              <button 
                key={intern.id} 
                onClick={() => setSelectedIntern(intern)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl border-2 transition-all ${
                  selectedIntern?.id === intern.id ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
                }`}
              >
                <img 
                  src={intern.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(intern.name)}`} 
                  alt={intern.name} 
                  className="w-8 h-8 rounded-full object-cover border border-border" 
                />
                <div className="text-left">
                  <p className="text-xs font-semibold">{intern.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{intern.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Period Selector */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-4">
          <label className="text-sm font-medium mb-2 block">Evaluation Period</label>
          <div className="grid grid-cols-2 gap-2">
            {['Midterm', 'Final'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                  period === p 
                    ? 'bg-accent text-white border-accent' 
                    : 'bg-background hover:bg-muted border-border'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loadingEvaluation ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : (
        <>
          {/* Skills Assessment */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <button onClick={() => toggleSection('skills')} className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
              <h3 className="font-semibold text-foreground">Skills Assessment</h3>
              {expandedSection === 'skills' ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </button>
            {expandedSection === 'skills' && (
              <div className="px-5 pb-5 space-y-5">
                {skillCategories.map((item, i) => (
                  <div key={i} className="border-b border-border/50 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-medium">{item.skill}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            key={star} 
                            disabled={isSubmitted}
                            onClick={() => setRatings({ ...ratings, [item.skill]: star })}
                            className="p-0.5 transition-transform hover:scale-110 disabled:cursor-not-allowed"
                          >
                            <Star className={`w-5 h-5 ${
                              (ratings[item.skill] || 0) >= star 
                                ? 'text-yellow-500 fill-yellow-500' 
                                : 'text-muted-foreground/30 fill-transparent'
                            }`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea 
                      disabled={isSubmitted}
                      value={skillComments[item.skill] || ''}
                      onChange={(e) => setSkillComments({ ...skillComments, [item.skill]: e.target.value })}
                      placeholder={`Provide details or examples on ${item.skill.toLowerCase()}...`} 
                      rows={2}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none text-sm disabled:bg-muted/50 disabled:text-muted-foreground" 
                    />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Overall Performance */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <button onClick={() => toggleSection('overall')} className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
              <h3 className="font-semibold text-foreground">Overall Performance</h3>
              {expandedSection === 'overall' ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </button>
            {expandedSection === 'overall' && (
              <div className="px-5 pb-5 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Overall Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        disabled={isSubmitted}
                        onClick={() => setOverallRating(star)} 
                        className="p-1 transition-transform hover:scale-110 disabled:cursor-not-allowed"
                      >
                        <Star className={`w-8 h-8 ${
                          overallRating >= star 
                            ? 'text-yellow-500 fill-yellow-500' 
                            : 'text-muted-foreground/30 fill-transparent'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Strengths</label>
                  <textarea 
                    disabled={isSubmitted}
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    rows={3} 
                    placeholder="What did the intern excel at?"
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none disabled:bg-muted/50 disabled:text-muted-foreground" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Areas for Improvement</label>
                  <textarea 
                    disabled={isSubmitted}
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    rows={3} 
                    placeholder="What could the intern improve?"
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none disabled:bg-muted/50 disabled:text-muted-foreground" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Goals Achieved</label>
                  <textarea 
                    disabled={isSubmitted}
                    value={goalsAchieved}
                    onChange={(e) => setGoalsAchieved(e.target.value)}
                    rows={3} 
                    placeholder="What goals were achieved during the internship?"
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none disabled:bg-muted/50 disabled:text-muted-foreground" 
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Recommendation */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-foreground">Recommendation</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-3 p-3 bg-muted/40 border border-border/50 rounded-lg cursor-pointer flex-1">
                <input 
                  type="checkbox" 
                  disabled={isSubmitted}
                  checked={recommendCertificate}
                  onChange={(e) => setRecommendCertificate(e.target.checked)}
                  className="rounded border-border text-accent focus:ring-accent w-4 h-4 disabled:cursor-not-allowed" 
                />
                <div>
                  <p className="text-sm font-semibold">Recommend for Certificate</p>
                  <p className="text-xs text-muted-foreground">Issue a verified completion certificate</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-muted/40 border border-border/50 rounded-lg cursor-pointer flex-1">
                <input 
                  type="checkbox" 
                  disabled={isSubmitted}
                  checked={wouldRehire}
                  onChange={(e) => setWouldRehire(e.target.checked)}
                  className="rounded border-border text-accent focus:ring-accent w-4 h-4 disabled:cursor-not-allowed" 
                />
                <div>
                  <p className="text-sm font-semibold">Would Rehire</p>
                  <p className="text-xs text-muted-foreground">Recommend for full-time conversion or rehire</p>
                </div>
              </label>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Additional Comments</label>
              <textarea 
                disabled={isSubmitted}
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                rows={3} 
                placeholder="Any other feedback or administrative notes..."
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none disabled:bg-muted/50 disabled:text-muted-foreground" 
              />
            </div>
          </motion.div>

          {!isSubmitted && (
            <div className="flex gap-3">
              <button 
                disabled={saving}
                onClick={() => handleSave('Draft')}
                className="flex-1 flex items-center justify-center gap-2 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Draft
              </button>
              <button 
                disabled={saving}
                onClick={() => handleSave('Submitted')}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Evaluation
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
