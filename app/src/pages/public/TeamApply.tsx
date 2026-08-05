import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { BackgroundLayer } from '@/components/landing/BackgroundLayer';
import { TeamApplication } from '@/components/team/TeamApplication';

export default function TeamApply() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preferredRole = searchParams.get('apply') || '';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-slate-100 overflow-x-clip bg-slate-100 dark:bg-slate-950">
      <BackgroundLayer />

      <div className="relative z-10">
        <SEO
          title="Apply to the Founding Team — ZYR0"
          description="Apply to join the ZYR0 founding development team. Pick your role, tell us about yourself, and start building a real product with us."
          path="/careers/apply"
          keywords="ZYR0 careers, founding team application, student jobs, engineering internships"
        />

        <section className="py-14 lg:py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <button
              type="button"
              onClick={() => navigate('/careers')}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 transition-colors mb-10"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Careers
            </button>

            <TeamApplication preferredRole={preferredRole} />
          </div>
        </section>
      </div>
    </div>
  );
}
