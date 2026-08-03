import { useReducedMotion, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site';
import { WhatsAppIcon } from '@/components/icons/BrandIcons';

function scrollToApply() {
  document.getElementById('team-apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function FinalCtaSection() {
  const reduce = useReducedMotion();
  return (
    <section className="py-14 lg:py-20 px-4 bg-transparent content-visibility-auto">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-10 md:p-16 text-center relative overflow-hidden shadow-2xl shadow-blue-600/20 text-white"
        >
          {/* Ambient lighting */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-sky-400/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-violet-400/25 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/30">
              Founding Development Team
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight max-w-2xl mx-auto">
              Your first real engineering role{' '}
              <span className="font-accent text-sky-100">starts here.</span>
            </h2>
            <p className="text-white/90 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Eleven roles, one founding team, and a platform that thousands of students will use.
              If you are ready to build something that matters, we are ready to review your
              application.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={scrollToApply}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold bg-white text-slate-900 hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Apply Now
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href={SITE_CONFIG.social.whatsappChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold bg-slate-900/40 hover:bg-slate-900/60 border border-white/30 backdrop-blur-sm transition-all"
              >
                <WhatsAppIcon className="w-4 h-4 fill-current" />
                Ask a Question
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
