import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, DollarSign, Clock, Bookmark, Share2, CheckCircle2, Building2, ExternalLink } from 'lucide-react';
import { internships, companies } from '@/data/mockData';

export default function InternshipDetail() {
  const { id } = useParams();
  const internship = internships.find(i => i.id === id) || internships[0];
  const company = companies.find(c => c.id === internship.companyId);

  const tabs = [
    { label: 'Overview', content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">About This Role</h3>
          <p className="text-muted-foreground leading-relaxed">{internship.description}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Responsibilities</h3>
          <ul className="space-y-2">
            {internship.responsibilities.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">What You Will Learn</h3>
          <div className="flex flex-wrap gap-2">
            {internship.skills.map((s, i) => (
              <span key={i} className="px-3 py-1.5 bg-accent/10 text-accent text-sm rounded-lg font-medium">{s}</span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Benefits</h3>
          <div className="flex flex-wrap gap-2">
            {internship.benefits.map((b, i) => (
              <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm rounded-lg">{b}</span>
            ))}
          </div>
        </div>
      </div>
    )},
    { label: 'Requirements', content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {internship.skills.map((s, i) => (
              <span key={i} className="px-3 py-1.5 bg-accent/10 text-accent text-sm rounded-lg font-medium">{s}</span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Education & Experience</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              {internship.educationLevel}
            </li>
            <li className="flex items-start gap-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              Experience Level: {internship.experienceLevel}
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Requirements</h3>
          <ul className="space-y-2">
            {internship.requirements.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )},
    { label: 'About Company', content: company ? (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <img src={company.logo} alt="" className="w-16 h-16 rounded-xl" />
          <div>
            <h3 className="text-lg font-semibold">{company.name}</h3>
            <p className="text-sm text-muted-foreground">{company.industry}</p>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed">{company.description}</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Company Size</p>
            <p className="text-sm font-medium mt-1">{company.size}</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Founded</p>
            <p className="text-sm font-medium mt-1">{company.founded}</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="text-sm font-medium mt-1">{company.location}</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Website</p>
            <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent mt-1 inline-flex items-center gap-1">
              Visit <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    ) : <p className="text-muted-foreground">Company information not available.</p>},
  ];

  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <Link to="/internships" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Internships
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            {/* Header */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img src={internship.companyLogo} alt="" className="w-14 h-14 rounded-xl" />
                  <div>
                    <Link to={`/companies/${internship.companyId}`} className="text-sm text-accent hover:underline flex items-center gap-1">
                      {internship.company} <Building2 className="w-3 h-3" />
                    </Link>
                    <h1 className="text-2xl font-bold mt-1">{internship.title}</h1>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-2.5 py-1 bg-accent/10 text-accent text-xs rounded-full font-medium">{internship.type}</span>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">{internship.stipendType}</span>
                <span className="px-2.5 py-1 bg-muted text-muted-foreground text-xs rounded-full">{internship.locationType}</span>
                <span className="px-2.5 py-1 bg-muted text-muted-foreground text-xs rounded-full">{internship.domain}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {internship.location}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {internship.duration}</span>
                <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> {internship.stipend}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Deadline: {new Date(internship.deadline).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-6 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="flex border-b border-border overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.label}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab.label === tab.label
                        ? 'border-accent text-accent'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="p-6">
                <motion.div
                  key={activeTab.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab.content}
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
            {/* Apply Card */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm sticky top-24">
              <div className="text-center mb-5">
                <p className="text-sm text-muted-foreground">Application Deadline</p>
                <p className="text-lg font-semibold">{new Date(internship.deadline).toLocaleDateString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.ceil((new Date(internship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                </p>
              </div>
              <Link
                to={`/student/applications`}
                className="w-full flex items-center justify-center gap-2 bg-accent text-white py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors"
              >
                Apply Now
              </Link>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                  <Bookmark className="w-4 h-4" /> Save
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>

              <div className="mt-6 pt-5 border-t border-border">
                <h4 className="text-sm font-semibold mb-3">Job Details</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="font-medium">{internship.experienceLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Openings</span>
                    <span className="font-medium">{internship.openings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Applicants</span>
                    <span className="font-medium">{internship.applicants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date</span>
                    <span className="font-medium">{new Date(internship.startDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Snapshot */}
            {company && (
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h4 className="text-sm font-semibold mb-3">Company</h4>
                <div className="flex items-center gap-3 mb-4">
                  <img src={company.logo} alt="" className="w-10 h-10 rounded-lg" />
                  <div>
                    <p className="text-sm font-medium">{company.name}</p>
                    <p className="text-xs text-muted-foreground">{company.industry}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">{company.size}</p>
                  <p className="text-muted-foreground">{company.location}</p>
                </div>
                <Link to={`/companies/${company.id}`} className="mt-4 inline-flex items-center gap-1 text-sm text-accent hover:underline">
                  View Company <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
