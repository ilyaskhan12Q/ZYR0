import React, { useState } from 'react';
import {
  School, Users, UserCheck, CreditCard,
  Calendar, Award, MessageSquare, ShieldCheck,
  CheckCircle2, AlertCircle, ArrowRight, BarChart3,
  Clock, FileText, Smartphone
} from 'lucide-react';

export default function SchoolPerspectiveSwitcher() {
  const [activeRole, setActiveRole] = useState<'admin' | 'teacher' | 'student' | 'parent'>('admin');

  return (
    <div className="rounded-3xl bg-neutral-900/80 border border-white/15 p-4 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/80">
      {/* Role Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
            <School className="w-4 h-4" />
            <span>Interactive Multi-Role Experience Tour</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-mono">
            Experience School OS from Every Perspective
          </h3>
        </div>

        {/* Role Toggle Pills */}
        <div className="flex flex-wrap bg-neutral-950 p-1.5 rounded-2xl border border-white/10 text-xs">
          {[
            { id: 'admin', label: 'Principal / Admin', icon: ShieldCheck },
            { id: 'teacher', label: 'Faculty / Teacher', icon: Users },
            { id: 'student', label: 'Student', icon: Award },
            { id: 'parent', label: 'Parent / Guardian', icon: Smartphone }
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeRole === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveRole(item.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all font-medium ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Role Interactive Mock Surface */}
      <div className="rounded-2xl bg-neutral-950 border border-white/10 p-4 sm:p-6 min-h-[380px]">
        {/* 1. ADMIN VIEW */}
        {activeRole === 'admin' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
              <div>
                <div className="text-xs text-neutral-400 font-mono">Institutional Control Panel</div>
                <div className="text-lg font-bold text-white font-mono">Apex International Academy</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono flex items-center gap-1.5 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Term 2 Live
                </span>
              </div>
            </div>

            {/* Admin Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-white/5">
                <div className="text-[11px] text-neutral-400">Total Enrolled</div>
                <div className="text-xl font-bold text-white font-mono mt-1">2,480</div>
                <div className="text-[10px] text-emerald-400 mt-0.5 font-mono">100% capacity</div>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-white/5">
                <div className="text-[11px] text-neutral-400">Today's Attendance</div>
                <div className="text-xl font-bold text-emerald-400 font-mono mt-1">97.4%</div>
                <div className="text-[10px] text-neutral-400 mt-0.5 font-mono">65 absent notified</div>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-white/5">
                <div className="text-[11px] text-neutral-400">Fee Recovery Rate</div>
                <div className="text-xl font-bold text-indigo-400 font-mono mt-1">92.8%</div>
                <div className="text-[10px] text-emerald-400 mt-0.5 font-mono">+$420K collected</div>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-white/5">
                <div className="text-[11px] text-neutral-400">Faculty on Duty</div>
                <div className="text-xl font-bold text-white font-mono mt-1">142 / 144</div>
                <div className="text-[10px] text-sky-400 mt-0.5 font-mono">2 substitutes assigned</div>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="p-4 rounded-xl bg-neutral-900/50 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span className="text-neutral-300">
                  Automated monthly fee invoices generated for 2,480 students. Ready for dispatch.
                </span>
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all font-mono"
              >
                Send Fee SMS & Email Alerts
              </button>
            </div>
          </div>
        )}

        {/* 2. TEACHER VIEW */}
        {activeRole === 'teacher' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <div className="text-xs text-neutral-400 font-mono">Faculty Portal</div>
                <div className="text-lg font-bold text-white font-mono">Dr. Ayesha Malik • Dept of Science</div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400 font-mono">
                Class 10-A Mentor
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mark Attendance card */}
              <div className="p-4 rounded-xl bg-neutral-900/80 border border-white/5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white font-mono">Period 3: Advanced Chemistry</span>
                  <span className="text-emerald-400 font-mono">Room 302</span>
                </div>
                <div className="space-y-1.5 text-xs text-neutral-300">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-black/40">
                    <span>Ahmed Raza (Roll #101)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-semibold">PRESENT</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-black/40">
                    <span>Fatima Noor (Roll #102)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-semibold">PRESENT</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-black/40">
                    <span>Bilal Tariq (Roll #103)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono font-semibold">LEAVE</span>
                  </div>
                </div>
              </div>

              {/* Grading queue */}
              <div className="p-4 rounded-xl bg-neutral-900/80 border border-white/5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white font-mono">Pending Exam Grading</span>
                  <span className="text-neutral-400 font-mono">Mid-Term 2026</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-black/40 flex justify-between items-center">
                    <div>
                      <div className="text-white font-semibold">Organic Chemistry Quiz</div>
                      <div className="text-[10px] text-neutral-400">32 / 34 submissions graded</div>
                    </div>
                    <span className="text-xs text-indigo-400 font-bold font-mono">94%</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 flex justify-between items-center">
                    <div>
                      <div className="text-white font-semibold">Lab Report #4: Titration</div>
                      <div className="text-[10px] text-neutral-400">34 / 34 completed</div>
                    </div>
                    <span className="text-xs text-emerald-400 font-bold font-mono">100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. STUDENT VIEW */}
        {activeRole === 'student' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <div className="text-xs text-neutral-400 font-mono">Student Space</div>
                <div className="text-lg font-bold text-white font-mono">Zainab Khan • Grade 11-Pre Med</div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                GPA: 3.92 / 4.0
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-white/5">
                <div className="text-[11px] text-neutral-400">Upcoming Class</div>
                <div className="text-base font-bold text-white font-mono mt-1">Physics Lab</div>
                <div className="text-[10px] text-sky-400 font-mono mt-0.5">11:30 AM • Lab 2</div>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-white/5">
                <div className="text-[11px] text-neutral-400">Attendance Streak</div>
                <div className="text-base font-bold text-emerald-400 font-mono mt-1">45 Days</div>
                <div className="text-[10px] text-neutral-400 font-mono mt-0.5">100% this term</div>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-white/5">
                <div className="text-[11px] text-neutral-400">Assignments</div>
                <div className="text-base font-bold text-indigo-400 font-mono mt-1">1 Due Tomorrow</div>
                <div className="text-[10px] text-neutral-400 font-mono mt-0.5">Bio Genetics Essay</div>
              </div>
            </div>
          </div>
        )}

        {/* 4. PARENT VIEW */}
        {activeRole === 'parent' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <div className="text-xs text-neutral-400 font-mono">Parent Portal</div>
                <div className="text-lg font-bold text-white font-mono">Tariq Mehmood (Father of Rayan Tariq, Gr 9)</div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                Verified Parent Access
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-neutral-900/80 border border-white/5 space-y-3">
                <div className="text-xs font-bold text-white font-mono">Real-Time Daily Tracker</div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/40">
                    <span className="text-neutral-300">Biometric Gate Check-In</span>
                    <span className="text-emerald-400 font-mono">07:54 AM (On Time)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/40">
                    <span className="text-neutral-300">Bus Location Status</span>
                    <span className="text-sky-400 font-mono">Route 14 • En Route</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/80 border border-white/5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white font-mono">Tuition & Fee Status</span>
                  <span className="text-emerald-400 font-mono">Paid (Aug 2026)</span>
                </div>
                <div className="p-3 bg-black/40 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <div className="text-neutral-400 text-[11px]">Invoice #INV-2026-088</div>
                    <div className="text-white font-bold font-mono">$350.00 (Receipt Available)</div>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[11px]"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
