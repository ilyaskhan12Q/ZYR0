import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Star, Save, Send, ChevronDown, ChevronUp, User, Award, ThumbsUp, ThumbsDown } from 'lucide-react';

const skillCategories = [
  { skill: 'Technical Skills', category: 'Technical' },
  { skill: 'Problem Solving', category: 'Technical' },
  { skill: 'Communication', category: 'Soft Skills' },
  { skill: 'Teamwork', category: 'Soft Skills' },
  { skill: 'Time Management', category: 'Soft Skills' },
  { skill: 'Initiative', category: 'Soft Skills' },
];

const interns = [
  { id: '1', name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=alex', role: 'Software Engineering Intern' },
  { id: '2', name: 'Emily Watson', avatar: 'https://i.pravatar.cc/150?u=emily', role: 'UI/UX Design Intern' },
];

export default function MentorEvaluations() {
  const [selectedIntern, setSelectedIntern] = useState(interns[0]);
  const [expandedSection, setExpandedSection] = useState<string | null>('skills');
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [overallRating, setOverallRating] = useState(0);

  const toggleSection = (section: string) => setExpandedSection(expandedSection === section ? null : section);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Performance Evaluation</h1>
        <p className="text-sm text-muted-foreground mt-1">Evaluate your intern&apos;s performance</p>
      </div>

      {/* Intern Selector */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border shadow-sm p-4">
        <label className="text-sm font-medium mb-2 block">Select Intern</label>
        <div className="flex gap-3">
          {interns.map(intern => (
            <button key={intern.id} onClick={() => setSelectedIntern(intern)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                selectedIntern.id === intern.id ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
              }`}>
              <img src={intern.avatar} alt="" className="w-10 h-10 rounded-full" />
              <div className="text-left">
                <p className="text-sm font-medium">{intern.name}</p>
                <p className="text-xs text-muted-foreground">{intern.role}</p>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Skills Assessment */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <button onClick={() => toggleSection('skills')} className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
          <h3 className="font-semibold">Skills Assessment</h3>
          {expandedSection === 'skills' ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </button>
        {expandedSection === 'skills' && (
          <div className="px-5 pb-5 space-y-4">
            {skillCategories.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium">{item.skill}</p>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setRatings({ ...ratings, [item.skill]: star })}
                        className="p-0.5 transition-transform hover:scale-110">
                        <Star className={`w-5 h-5 ${(ratings[item.skill] || 0) >= star ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea placeholder={`Comments on ${item.skill.toLowerCase()}...`} rows={2}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none text-sm" />
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Overall Performance */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <button onClick={() => toggleSection('overall')} className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
          <h3 className="font-semibold">Overall Performance</h3>
          {expandedSection === 'overall' ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </button>
        {expandedSection === 'overall' && (
          <div className="px-5 pb-5 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Overall Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setOverallRating(star)} className="p-1 transition-transform hover:scale-110">
                    <Star className={`w-8 h-8 ${overallRating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Strengths</label>
              <textarea rows={3} placeholder="What did the intern excel at?"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Areas for Improvement</label>
              <textarea rows={3} placeholder="What could the intern improve?"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Goals Achieved</label>
              <textarea rows={3} placeholder="What goals were achieved during the internship?"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none" />
            </div>
          </div>
        )}
      </motion.div>

      {/* Recommendation */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
        <h3 className="font-semibold">Recommendation</h3>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 p-3 bg-muted rounded-lg cursor-pointer flex-1">
            <input type="checkbox" className="rounded" />
            <div>
              <p className="text-sm font-medium">Recommend for Certificate</p>
              <p className="text-xs text-muted-foreground">Issue a verified certificate</p>
            </div>
          </label>
          <label className="flex items-center gap-2 p-3 bg-muted rounded-lg cursor-pointer flex-1">
            <input type="checkbox" className="rounded" />
            <div>
              <p className="text-sm font-medium">Would Rehire</p>
              <p className="text-xs text-muted-foreground">Recommend for future roles</p>
            </div>
          </label>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Additional Comments</label>
          <textarea rows={3} placeholder="Any other feedback..."
            className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none" />
        </div>
      </motion.div>

      <div className="flex gap-3">
        <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors">
          <Save className="w-4 h-4" /> Save Draft
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors">
          <Send className="w-4 h-4" /> Submit Evaluation
        </button>
      </div>
    </div>
  );
}
