import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Globe, Users, Star, FolderOpen, Mail, Phone, Calendar, Award, ExternalLink } from 'lucide-react';
import { companies, internships } from '@/data/mockData';

export default function CompanyDetail() {
  const { id } = useParams();
  const company = companies.find(c => c.id === id) || companies[0];
  const companyInternships = internships.filter(i => i.companyId === company.id);

  return (
    <div className="pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <Link to="/companies" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Companies
        </Link>

        {/* Company Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary to-accent" />
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-12 mb-4 gap-4">
              <img src={company.logo} alt="" className="w-24 h-24 rounded-2xl border-4 border-card shadow-lg" />
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{company.name}</h1>
                <p className="text-sm text-muted-foreground">{company.industry} &middot; {company.size}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium">{company.rating}</span>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">{company.description}</p>

            <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {company.location}</span>
              <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> {company.website}</span>
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {company.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {company.phone}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Founded {company.founded}</span>
            </div>

            <div className="mt-4 flex gap-3">
              {company.socialLinks.linkedin && (
                <a href={company.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-lg hover:bg-accent/10 hover:text-accent transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {company.socialLinks.twitter && (
                <a href={company.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-lg hover:bg-accent/10 hover:text-accent transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Internships', value: company.internshipsPosted, icon: FolderOpen },
            { label: 'Applicants', value: company.totalApplicants, icon: Users },
            { label: 'Active Interns', value: company.activeInterns, icon: Users },
            { label: 'Certificates', value: 12, icon: Award },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
              className="stat-card text-center">
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
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">{internship.stipendType}</span>
                      <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">{internship.locationType}</span>
                    </div>
                    <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                      <span>{internship.duration}</span>
                      <span>{internship.stipend}</span>
                      <span>Deadline: {new Date(internship.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{internship.applicants} applicants</span>
                </div>
              </Link>
            )) : (
              <p className="text-muted-foreground text-center py-8">No open internships at the moment.</p>
            )}
          </div>
        </motion.div>

        {/* Team */}
        {company.team.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8">
            <h2 className="text-xl font-bold mb-4">Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {company.team.map((member) => (
                <div key={member.id} className="flex items-center gap-4 bg-card rounded-xl border border-border p-4">
                  <img src={member.avatar} alt="" className="w-12 h-12 rounded-full" />
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
