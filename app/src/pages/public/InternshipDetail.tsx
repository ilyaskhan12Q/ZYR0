import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, DollarSign, Clock, Share2, CheckCircle2, Building2, ExternalLink, Loader2 } from 'lucide-react';
import { getInternshipById } from '@/services/internships';
import { applyToInternship, hasApplied } from '@/services/applications';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import { BASE_URL } from '@/config/seo';
import { SaveButton } from '@/components/SaveButton';

export default function InternshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, profileCompleted } = useAuth();

  const [internship, setInternship] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<any>(null);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTabLabel, setActiveTabLabel] = useState('Overview');
  const [now, setNow] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setNow(Date.now());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    async function load() {
      if (!id) return;
      
      const { data, error: loadErr } = await getInternshipById(id);
      if (loadErr) {
        setError("Failed to load internship");
      } else {
        setInternship(data);
      }

      if (user) {
        const applied = await hasApplied(id);
        setApplicationStatus(applied);
      }

      setLoading(false);
    }
    load();
  }, [id, user]);

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Must be a student to apply
    if (profile?.role !== 'student') {
      alert("Only student accounts can apply for internships.");
      return;
    }

    if (!profileCompleted) {
      toast.error("Please complete your profile before using this feature.");
      return;
    }

    try {
      setApplying(true);
      await applyToInternship({ internship_id: id! });
      
      // Refresh status
      const applied = await hasApplied(id!);
      setApplicationStatus(applied);
    } catch (err: any) {
      alert(err.message || "Failed to submit application.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="text-center">
          <h2 className="text-xl font-bold">Internship not found</h2>
          <Link to="/internships" className="text-accent hover:underline mt-4 inline-block">Browse all internships</Link>
        </div>
      </div>
    );
  }

  const company = Array.isArray(internship.company) ? internship.company[0] : internship.company;

  const tabs = [
    { label: 'Overview', content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">About This Role</h3>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{internship.description}</p>
        </div>
        
        {internship.responsibilities && internship.responsibilities.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Responsibilities</h3>
            <ul className="space-y-2">
              {internship.responsibilities.map((r: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {internship.skills && internship.skills.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">What You Will Learn</h3>
            <div className="flex flex-wrap gap-2">
              {internship.skills.map((s: string, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-accent/10 text-accent text-sm rounded-lg font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}

        {internship.benefits && internship.benefits.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Benefits</h3>
            <div className="flex flex-wrap gap-2">
              {internship.benefits.map((b: string, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-sm rounded-lg">{b}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    )},
    { label: 'Requirements', content: (
      <div className="space-y-6">
        {internship.skills && internship.skills.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {internship.skills.map((s: string, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-accent/10 text-accent text-sm rounded-lg font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold mb-3">Education & Experience</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              {internship.education_level || 'Any degree'}
            </li>
            <li className="flex items-start gap-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              Experience Level: {internship.experience_level || 'Beginner'}
            </li>
          </ul>
        </div>
        
        {internship.requirements && internship.requirements.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Requirements</h3>
            <ul className="space-y-2">
              {internship.requirements.map((r: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )},
    { label: 'About Company', content: company ? (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <img src={company.logo_url || `https://ui-avatars.com/api/?name=${company.name}`} alt={`${company.name} logo`} className="w-16 h-16 rounded-xl object-cover" />
          <div>
            <h3 className="text-lg font-semibold">{company.name}</h3>
            <p className="text-sm text-muted-foreground">{company.industry}</p>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed">{company.description}</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Company Size</p>
            <p className="text-sm font-medium mt-1">{company.size || 'Unknown'}</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Founded</p>
            <p className="text-sm font-medium mt-1">{company.founded || 'N/A'}</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="text-sm font-medium mt-1">{company.location || 'Remote'}</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Website</p>
            {company.website ? (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent mt-1 inline-flex items-center gap-1">
                Visit <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <p className="text-sm font-medium mt-1">N/A</p>
            )}
          </div>
        </div>
      </div>
    ) : <p className="text-muted-foreground">Company information not available.</p>},
  ];

  const currentTab = tabs.find((t) => t.label === activeTabLabel) || tabs[0];

  const jobStructuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: internship.title,
      description: internship.description,
      datePosted: internship.posted_date || internship.created_at,
      validThrough: internship.deadline || undefined,
      employmentType: 'INTERN',
      hiringOrganization: {
        '@type': 'Organization',
        name: company?.name || 'Zyro Partner',
        sameAs: company?.website || undefined,
        logo: company?.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(company?.name || 'Company')}`,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: internship.location || 'Remote',
          addressCountry: 'US',
        },
      },
      baseSalary: internship.stipend ? {
        '@type': 'MonetaryAmount',
        currency: 'USD',
        value: {
          '@type': 'QuantitativeValue',
          value: internship.stipend,
          unitText: 'MONTH',
        },
      } : undefined,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Internships', item: `${BASE_URL}/internships` },
        { '@type': 'ListItem', position: 3, name: internship.title, item: `${BASE_URL}/internships/${id}` },
      ],
    },
  ];

  return (
    <div className="pt-20 pb-16 px-4">
      <SEO
        title={`${internship.title} Internship at ${company?.name || 'Zyro Partner'}`}
        description={`${internship.title} internship opportunity. Domain: ${internship.domain}. Duration: ${internship.duration}. Location: ${internship.location_type}. Learn more and apply on Zyro.`}
        path={`/internships/${id}`}
        keywords={`${internship.title}, ${company?.name || 'Zyro Partner'} internship, ${internship.domain} internship, Zyro jobs`}
        structuredData={jobStructuredData}
      />
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
                  <img src={company?.logo_url || `https://ui-avatars.com/api/?name=${company?.name || 'Company'}`} alt={`${company?.name || 'Company'} logo`} className="w-14 h-14 rounded-xl object-cover" />
                  <div>
                    {company && (
                      <Link to={`/companies/${company.id}`} className="text-sm text-accent hover:underline flex items-center gap-1">
                        {company.name} <Building2 className="w-3 h-3" />
                      </Link>
                    )}
                    <h1 className="text-2xl font-bold mt-1">{internship.title}</h1>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-2.5 py-1 bg-accent/10 text-accent text-xs rounded-full font-medium">{internship.type}</span>
                <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-full font-medium">{internship.stipend_type}</span>
                <span className="px-2.5 py-1 bg-muted text-muted-foreground text-xs rounded-full">{internship.location_type}</span>
                <span className="px-2.5 py-1 bg-muted text-muted-foreground text-xs rounded-full">{internship.domain}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {internship.location || 'Remote'}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {internship.duration || 'Not specified'}</span>
                <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> {internship.stipend || 'Unpaid'}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Deadline: {internship.deadline ? new Date(internship.deadline).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-6 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="flex border-b border-border overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.label}
                    onClick={() => setActiveTabLabel(tab.label)}
                    className={`px-6 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTabLabel === tab.label
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
                  key={currentTab.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {currentTab.content}
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
                <p className="text-lg font-semibold">{internship.deadline ? new Date(internship.deadline).toLocaleDateString() : 'Rolling'}</p>
                {internship.deadline && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.max(0, Math.ceil((new Date(internship.deadline).getTime() - now) / (1000 * 60 * 60 * 24)))} days remaining
                  </p>
                )}
              </div>
              
              {applicationStatus ? (
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 py-3 rounded-lg font-medium transition-colors cursor-not-allowed"
                >
                  <CheckCircle2 className="w-5 h-5" /> Applied ({applicationStatus.status})
                </button>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={applying || (internship.deadline && new Date(internship.deadline).getTime() < now)}
                  className="w-full flex items-center justify-center gap-2 bg-accent text-white py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                  ) : internship.deadline && new Date(internship.deadline).getTime() < now ? (
                    'Deadline Passed'
                  ) : (
                    'Apply Now'
                  )}
                </button>
              )}
              
              <div className="mt-3 flex gap-2">
                <div className="flex-1 flex items-center justify-center py-2.5 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                  <SaveButton internshipId={internship.id} />
                </div>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: internship.title, url: window.location.href }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Link copied!');
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg text-sm hover:bg-muted transition-colors"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>

              <div className="mt-6 pt-5 border-t border-border">
                <h4 className="text-sm font-semibold mb-3">Job Details</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="font-medium">{internship.experience_level || 'Beginner'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Openings</span>
                    <span className="font-medium">{internship.openings || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Applicants</span>
                    <span className="font-medium">{internship.applicant_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Posted</span>
                    <span className="font-medium">{new Date(internship.posted_date || internship.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Snapshot */}
            {company && (
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h4 className="text-sm font-semibold mb-3">Company</h4>
                <div className="flex items-center gap-3 mb-4">
                  <img src={company.logo_url || `https://ui-avatars.com/api/?name=${company.name}`} alt={`${company.name} logo`} className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm font-medium">{company.name}</p>
                    <p className="text-xs text-muted-foreground">{company.industry}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">{company.size || 'Unknown size'}</p>
                  <p className="text-muted-foreground">{company.location || 'Unknown location'}</p>
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
