import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import Header from '@/components/nav/Header';
import PlatformFooter from '@/components/nav/PlatformFooter';
import SchoolPerspectiveSwitcher from '@/components/products/edu/SchoolPerspectiveSwitcher';
import { submitProductLead } from '@/services/leadService';
import { toast } from 'sonner';
import {
  School, Users, Shield, CreditCard,
  Calendar, CheckCircle2, ArrowRight, Sparkles,
  BarChart3, Clock, MessageSquare, Phone,
  Building, Check
} from 'lucide-react';

export default function SchoolOSLanding() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institutionName: '',
    role: 'Principal / Administrator',
    estimatedUsers: '500-1500 students',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ROI Calculator state
  const [studentCount, setStudentCount] = useState(800);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.email.includes('@')) {
      toast.error('Please provide a valid official institution email.');
      return;
    }
    setIsSubmitting(true);
    const res = await submitProductLead({
      email: formData.email,
      name: formData.name,
      institutionName: formData.institutionName,
      role: formData.role,
      estimatedUsers: formData.estimatedUsers,
      notes: formData.notes,
      product: 'school_os'
    });
    setIsSubmitting(false);
    if (res.success) {
      setSubmitted(true);
      toast.success(res.message);
    }
  };

  const eduModules = [
    {
      title: 'Biometric & RFID Attendance',
      description: 'Zero manual roll calls. Real-time gate integration triggers automatic SMS alerts to parents when students arrive.',
      icon: Clock,
      color: 'text-indigo-400'
    },
    {
      title: 'Automated Fee Collection',
      description: 'Generate itemized recurring invoices, process digital fee payments, send automated WhatsApp reminders, and eliminate bad debt.',
      icon: CreditCard,
      color: 'text-emerald-400'
    },
    {
      title: 'AI Timetable & Substitutions',
      description: 'Generate clash-free master schedules for hundreds of teachers in seconds, with instant 1-click substitute teacher allocation.',
      icon: Calendar,
      color: 'text-sky-400'
    },
    {
      title: 'Examination & Grading Engine',
      description: 'Dynamic grading scales (GPA, Percentage, Letter grades) with instant printable A4 report cards and performance telemetry.',
      icon: BarChart3,
      color: 'text-purple-400'
    },
    {
      title: 'Multi-Role Portal Hierarchy',
      description: 'Isolated, role-based interfaces for Trustees, Principals, Teachers, Students, and Parents with end-to-end Row-Level Security.',
      icon: Users,
      color: 'text-amber-400'
    },
    {
      title: 'Multi-Campus Administration',
      description: 'Manage multiple school branches from a unified central headquarters dashboard with consolidated financial auditing.',
      icon: Building,
      color: 'text-rose-400'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500 selection:text-white font-sans antialiased overflow-x-hidden">
      <SEO
        title="ZYR0 Edu (School OS) — Enterprise School Management System"
        description="The modern, all-in-one operating system for K-12 schools, colleges, and educational institutions. Attendance, fee invoicing, exams, and timetables."
        path="/school"
      />
      <Header />

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6 font-mono">
            <School className="w-3.5 h-3.5" />
            ZYR0 Edu • Institutional SaaS
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight font-mono mb-6 leading-tight">
            The Modern Operating System for <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Schools, Colleges & Academies.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Eliminate administrative paperwork. Unify admissions, biometric attendance, automated fee recovery, examination grading, and parent communications under one intelligent platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#book-demo"
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <span>Book Institutional Walkthrough</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#perspective-tour"
              className="w-full sm:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white font-semibold text-sm rounded-xl border border-white/15 transition-all"
            >
              Take Interactive Tour
            </a>
          </div>
        </div>

        {/* Interactive Perspective Switcher */}
        <div id="perspective-tour" className="mb-24 scroll-mt-28">
          <SchoolPerspectiveSwitcher />
        </div>

        {/* Modules Grid */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-mono mb-3">
              Comprehensive Institutional Modules
            </h2>
            <p className="text-sm text-neutral-400">
              Engineered to replace 5+ disparate software tools with a single unified platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eduModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.title}
                  className="p-6 rounded-3xl bg-neutral-900/60 border border-white/10 hover:border-indigo-500/30 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 ${mod.color} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-mono mb-2">{mod.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{mod.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive ROI Calculator */}
        <div className="mb-24 rounded-3xl bg-neutral-900/70 border border-white/15 p-6 sm:p-10 backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                Institutional Efficiency Estimator
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white font-mono">
                Calculate Time & Revenue Saved
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                See how much admin overhead your school eliminates by switching to ZYR0 School OS.
              </p>

              <div className="pt-4">
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-neutral-400">Total Student Body:</span>
                  <span className="text-white font-bold">{studentCount} Students</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="50"
                  value={studentCount}
                  onChange={(e) => setStudentCount(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-center">
                <div className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono">
                  {Math.round(studentCount * 0.45)} hrs
                </div>
                <div className="text-xs text-neutral-400 mt-1">Admin hours saved / month</div>
              </div>
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-center">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  +18.5%
                </div>
                <div className="text-xs text-neutral-400 mt-1">Fee collection speedup</div>
              </div>
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-center">
                <div className="text-2xl sm:text-3xl font-black text-sky-400 font-mono">
                  100%
                </div>
                <div className="text-xs text-neutral-400 mt-1">Paperless report cards</div>
              </div>
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-center">
                <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">
                  0 hrs
                </div>
                <div className="text-xs text-neutral-400 mt-1">Manual attendance logging</div>
              </div>
            </div>
          </div>
        </div>

        {/* Book a Demo Form Section */}
        <div id="book-demo" className="rounded-3xl bg-neutral-900/90 border border-indigo-500/30 p-6 sm:p-12 scroll-mt-28">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mb-2">
              Book an Institutional Walkthrough
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400">
              Schedule a personalized 30-minute demonstration tailored to your school or university requirements.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleFormSubmit} className="max-w-xl mx-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Prof. Muhammad Ahmed"
                    className="w-full bg-neutral-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="principal@academy.edu"
                    className="w-full bg-neutral-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">Institution Name</label>
                  <input
                    type="text"
                    required
                    value={formData.institutionName}
                    onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                    placeholder="Beaconhouse / LGS / NUST"
                    className="w-full bg-neutral-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">Approx. Student Body</label>
                  <select
                    value={formData.estimatedUsers}
                    onChange={(e) => setFormData({ ...formData, estimatedUsers: e.target.value })}
                    className="w-full bg-neutral-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
                  >
                    <option value="100-500 students">100 - 500 students</option>
                    <option value="500-1500 students">500 - 1,500 students</option>
                    <option value="1500-5000 students">1,500 - 5,000 students</option>
                    <option value="5000+ students">5,000+ students (Multi-Campus)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Specific Requirements / Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Currently using manual registers and seeking biometric integration..."
                  className="w-full bg-neutral-950 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-400 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs font-mono tracking-wider uppercase transition-all shadow-lg shadow-indigo-600/30 active:scale-98 flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Submitting...' : 'Request Walkthrough & Quote'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="max-w-md mx-auto p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-lg font-bold text-white font-mono">Walkthrough Request Confirmed</h4>
              <p className="text-xs text-neutral-300">
                Thank you! Our institutional specialist will contact you at <span className="text-emerald-400">{formData.email}</span> within 24 hours.
              </p>
            </div>
          )}
        </div>
      </main>

      <PlatformFooter />
    </div>
  );
}
