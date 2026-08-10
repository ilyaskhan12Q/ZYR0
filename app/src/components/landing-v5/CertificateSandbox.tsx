import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, m } from 'framer-motion';
import { ScanLine, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Reveal, usePrefersReducedMotion } from './motion';

const QR_PATTERN = [
  1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1,
  1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0,
  1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0,
  1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1,
];

export function CertificateSandbox() {
  const reduced = usePrefersReducedMotion();
  const [certId, setCertId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [verified, setVerified] = useState(false);

  const runVerification = (e: FormEvent) => {
    e.preventDefault();
    if (scanning) return;
    setVerified(false);
    if (reduced) {
      setVerified(true);
      return;
    }
    setScanning(true);
    window.setTimeout(() => {
      setScanning(false);
      setVerified(true);
    }, 1300);
  };

  return (
    <section className="py-20 lg:py-28 relative content-visibility-auto">
      <div className="absolute inset-0 v5-dotted-grid pointer-events-none opacity-70" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl mb-14">
          <span className="v5-eyebrow text-[#34d399]">Verification Sandbox</span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Don&apos;t trust the PDF.{' '}
            <span className="font-accent text-[#34d399]">Verify the signature.</span>
          </h2>
          <p className="mt-4 text-[#a2a2c3] leading-relaxed">
            Every ZYR0 credential resolves to a signed record. Try the flow employers use — right
            here, no account required.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-[7fr_5fr] gap-8 items-start">
          {/* Certificate mock */}
          <Reveal delay={0.1}>
            <div className="v5-card rounded-2xl p-6 sm:p-10 relative overflow-hidden">
              {/* Inner double hairline */}
              <div className="absolute inset-3 rounded-xl border border-white/[0.06] pointer-events-none" />

              <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-8">
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <img src="/zyro-logo.webp" alt="ZYR0 logo" className="w-10 h-10 object-contain" />
                    <div>
                      <div className="font-display font-bold text-white text-lg leading-none">ZYR0</div>
                      <div className="v5-mono text-[9px] tracking-[0.25em] text-white/40 uppercase mt-1">
                        Certificate of Internship
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="v5-mono text-[10px] tracking-[0.2em] text-white/40 uppercase">
                      Awarded to
                    </div>
                    <div className="font-accent text-3xl sm:text-4xl text-white mt-1">Ayesha Rahman</div>
                    <div className="mt-2 text-sm text-white/60">
                      Frontend Engineering Internship · 6 weeks · rubric 98/100
                    </div>
                  </div>
                  <div className="v5-mono text-[11px] text-white/40 space-y-1">
                    <div>ID: ZYR0-2026-8891</div>
                    <div>sha256: 9f2c…a7bd…e41a</div>
                  </div>
                </div>

                {/* QR + laser */}
                <div className="relative self-start">
                  <div className="grid grid-cols-11 gap-[2px] p-3 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                    {QR_PATTERN.map((v, i) => (
                      <span
                        key={i}
                        className={`w-[8px] h-[8px] rounded-[1px] ${v ? 'bg-white/90' : 'bg-transparent'}`}
                      />
                    ))}
                  </div>
                  {scanning && (
                    <m.span
                      initial={{ top: '4%' }}
                      animate={{ top: '92%' }}
                      transition={{ duration: 1.2, ease: 'linear' }}
                      className="absolute left-0 right-0 h-[2px] v5-laser"
                    />
                  )}
                </div>
              </div>

              {/* VERIFIED stamp */}
              <AnimatePresence>
                {verified && (
                  <m.div
                    initial={{ scale: 1.6, opacity: 0, rotate: -16 }}
                    animate={{ scale: 1, opacity: 1, rotate: -8 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', damping: 14, stiffness: 300 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className="border-4 border-[#10b981] text-[#10b981] v5-mono font-bold tracking-[0.3em] text-3xl sm:text-4xl px-8 py-3 rounded-lg bg-[#10b981]/10 shadow-[0_0_40px_rgba(16,185,129,0.25)]">
                      VERIFIED
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>

          {/* Verification panel */}
          <Reveal delay={0.18}>
            <div className="v5-card rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-5">
                <ScanLine className="w-4 h-4 text-[#38bdf8]" />
                <span className="v5-eyebrow text-white/60">Employer Lookup</span>
              </div>
              <form onSubmit={runVerification} className="space-y-4">
                <div>
                  <label htmlFor="v5-cert-id" className="v5-mono text-[11px] text-white/45 block mb-2">
                    Enter ID (e.g., ZYR0-2026-8891)
                  </label>
                  <Input
                    id="v5-cert-id"
                    value={certId}
                    onChange={(e) => {
                      setCertId(e.target.value);
                      setVerified(false);
                    }}
                    placeholder="ZYR0-2026-8891"
                    className="v5-mono bg-black/30 border-white/[0.1] text-white placeholder:text-white/25 focus-visible:ring-[#0284c7]"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={scanning}
                  className="w-full h-11 rounded-md bg-[#0284c7] hover:bg-[#38bdf8] text-white font-semibold text-sm transition-colors"
                >
                  {scanning ? 'Scanning signature…' : 'Run Verification'}
                </Button>
              </form>

              <div className="mt-6 pt-5 border-t border-white/[0.08] flex items-start gap-2.5 text-[12px] text-white/50 leading-relaxed">
                <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-[#34d399]" />
                <span>
                  This is a simulated lookup. To check a real credential, use the{' '}
                  <Link
                    to="/verify"
                    className="text-[#38bdf8] hover:text-white inline-flex items-center gap-0.5 transition-colors"
                  >
                    public verification portal
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                  .
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
