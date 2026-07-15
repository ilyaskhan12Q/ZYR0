import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Globe, Users, Star, FolderOpen, Mail, Phone, Calendar, Award, ExternalLink, Loader2 } from 'lucide-react';
import { getCompanyById } from '@/services/companies';
import { getInternships } from '@/services/internships';
import { getAllCompanyApplications } from '@/services/applications';
import { supabase } from '@/lib/supabase';
import { SEO } from '@/components/SEO';
import { BASE_URL } from '@/config/seo';

export default function CompanyDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [companyInternships, setCompanyInternships] = useState<any[]>([]);
  const [stats, setStats] = useState({
    internships: 0,
    applicants: 0,
    activeInterns: 0,
    certificates: 0,
  });

  useEffect(() => {
    async function loadCompanyDetail() {
      if (!id) return;
      try {
        const [compRes, internshipsRes, appsRes] = await Promise.all([
          getCompanyById(id),
          getInternships({ company_id: id, status: 'Active' }),
          getAllCompanyApplications(id)
        ]);

        if (compRes.data) {
          setCompany(compRes.data);
        }

        if (internshipsRes.data) {
          setCompanyInternships(internshipsRes.data);
        }

        // Calculate statistics
        const allInternships = internshipsRes.data || [];
        const allApps = appsRes.data || [];
        
        const applicantsCount = allApps.length;
        const activeCount = allApps.filter((a: any) => a.status === 'Accepted').length;

        // Fetch issued certificates count
        const { count: certCount } = await supabase
          .from('certificates')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', id);

        setStats({
          internships: allInternships.length,
          applicants: applicantsCount,
          activeInterns: activeCount,
          certificates: certCount || 0,
        });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCompanyDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="pt-20 pb-16 px-4 text-center max-w-md mx-auto space-y-4">
        <h1 className="text-xl font-bold">Company Profile Not Found</h1>
        <p className="text-muted-foreground">The company you are looking for does not exist or has been deactivated.</p>
        <Link to="/companies" className="inline-flex items-center gap-2 text-sm text-accent hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Companies
        </Link>
      </div>
    );
  }

  const companyStructuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: company.name,
      description: company.description || `Learn about careers and internship opportunities at ${company.name} on Zyro.`,
      logo: company.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random`,
      url: company.website || `${BASE_URL}/companies/${id}`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Companies', item: `${BASE_URL}/companies` },
        { '@type': 'ListItem', position: 3, name: company.name, item: `${BASE_URL}/companies/${id}` },
      ],
    },
  ];

  return (
    <div className="pt-20 pb-16 px-4">
      <SEO
        title={`${company.name} — Careers, Internships & Company Profile`}
        description={company.description || `Learn more about ${company.name}, view their available internship programs, project categories, and contact information on Zyro.`}
        path={`/companies/${id}`}
        keywords={`${company.name}, ${company.name} internships, ${company.name} jobs, Zyro companies`}
        structuredData={companyStructuredData}
      />
      <div className="max-w-5xl mx-auto">
        <Link to="/companies" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Companies
        </Link>

        {/* Company Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary to-accent dark:from-slate-900 dark:to-accent/50" />
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-12 mb-4 gap-4">
              <img src={company.logo_url || `https://ui-avatars.com/api/?name=${company.name || 'Company'}`} alt={`${company.name} logo`} className="w-24 h-24 rounded-2xl border-4 border-card shadow-lg object-cover bg-background" />
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{company.name}</h1>
                <p className="text-sm text-muted-foreground">{company.industry} &middot; {company.size}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium">{company.rating || '5.0'}</span>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">{company.description || 'No description provided.'}</p>

            <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {company.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {company.location}</span>}
              {company.website && <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-accent">{company.website}</a></span>}
              {company.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {company.email}</span>}
              {company.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {company.phone}</span>}
              {company.founded && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Founded {company.founded}</span>}
            </div>

            {company.social_links && (
              <div className="mt-4 flex gap-3">
                {company.social_links.linkedin && (
                  <a href={company.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-lg hover:bg-accent/10 hover:text-accent transition-colors" title="LinkedIn">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {company.social_links.twitter && (
                  <a href={company.social_links.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-lg hover:bg-accent/10 hover:text-accent transition-colors" title="Twitter">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {company.social_links.github && (
                  <a href={company.social_links.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-lg hover:bg-accent/10 hover:text-accent transition-colors" title="GitHub">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Active Jobs', value: stats.internships, icon: FolderOpen },
            { label: 'Total Applicants', value: stats.applicants, icon: Users },
            { label: 'Active Interns', value: stats.activeInterns, icon: Users },
            { label: 'Certificates Issued', value: stats.certificates, icon: Award },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
              className="stat-card text-center bg-card border border-border rounded-xl p-4 shadow-sm">
              <stat.icon className="w-5 h-5 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Internships */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8">
          <h2 className="text-xl font-bold mb-4">Open Internships</h2>
          <div className="space-y-4">
            {companyInternships.length > 0 ? companyInternships.map((internship) => (
              <Link key={internship.id} to={`/internships/${internship.id}`}
                className="block bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{internship.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full">{internship.domain}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-full">{internship.stipend_type}</span>
                      <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">{internship.location_type}</span>
                    </div>
                    <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                      <span>{internship.duration}</span>
                      <span>{internship.stipend}</span>
                      <span>Deadline: {internship.deadline ? new Date(internship.deadline).toLocaleDateString() : 'Rolling'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )) : (
              <p className="text-muted-foreground text-center py-8">No open internships at the moment.</p>
            )}
          </div>
        </motion.div>

        {/* Team */}
        {company.team && company.team.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8">
            <h2 className="text-xl font-bold mb-4">Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {company.team.map((member: any) => (
                <div key={member.id} className="flex items-center gap-4 bg-card rounded-xl border border-border p-4">
                  <img src={member.avatar_url || `https://ui-avatars.com/api/?name=${member.name || 'Member'}`} alt={`${member.name} avatar`} className="w-12 h-12 rounded-full object-cover bg-background" />
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
