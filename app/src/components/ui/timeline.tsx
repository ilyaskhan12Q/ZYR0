// Built using Hyperiux Vault: https://vault.hyperiux.com
import {
  type CSSProperties,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/* Inline stand-in for @gsap/react's useGSAP. Mirrors its default
   `revertOnUpdate: false`: one gsap.context lives for the component's
   lifetime, the callback is re-added when dependencies change, and the
   context is reverted only on unmount. A callback may return its own
   cleanup, which runs before the next re-add and on unmount. */
function useGSAP(
  callback: () => void | (() => void),
  options?: {
    dependencies?: unknown[];
    scope?: { current: Element | null } | Element | null;
  },
) {
  const deps = options?.dependencies ?? [];
  const scope = options?.scope;
  const ctxRef = useRef<gsap.Context | null>(null);
  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  useLayoutEffect(() => {
    const el =
      scope && typeof scope === 'object' && 'current' in scope
        ? scope.current
        : (scope as Element | null);
    ctxRef.current = gsap.context(() => {}, el ?? undefined);
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = undefined;
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (!ctxRef.current) return;
    cleanupRef.current?.();
    const ret = ctxRef.current.add(callback);
    cleanupRef.current = typeof ret === 'function' ? ret : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

const monthOrder = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
} as const;

type Month = keyof typeof monthOrder;

type JourneyItem = {
  id: string;
  tag: string;
  headline: string;
  body: string;
  badge: string;
};

type SplitTextInstance = InstanceType<typeof SplitText>;

export type TimelineProps = {
  title?: string;
  periodLabel?: string;
  textColor?: string;
  mutedTextColor?: string;
  activeColor?: string;
  backgroundColor?: string;
  imageUrl?: string;
  imageAlt?: string;
  /** Reveal animation duration, in seconds. */
  duration?: number;
  /** Fallback reveal duration when `duration` is omitted, in seconds. */
  scrollDuration?: number;
};

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToReducedMotion(callback: () => void) {
  if (typeof window === 'undefined') return () => {};

  const mediaQueryList = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQueryList.addEventListener('change', callback);

  return () => mediaQueryList.removeEventListener('change', callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === 'undefined') return false;

  return window.matchMedia?.(REDUCED_MOTION_QUERY)?.matches ?? false;
}

function getServerReducedMotionSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot,
  );
}

// 4 Defensible Pillars - 2 top track, 2 bottom track
const topJourneyData: JourneyItem[] = [
  {
    id: 'code-sovereignty',
    tag: 'PORTABILITY & COMPILATION',
    headline: 'Clean ASTs. Zero proprietary runtime shims.',
    body: 'Applications scaffolded in ZYR0 compile directly into idiomatic React 19, TypeScript, and standard Tailwind CSS. There are no proprietary intermediary SDKs, hidden framework hooks, or forced container hosting. Export clean Git repositories or connect existing CI/CD pipelines in a single command.',
    badge: 'Standard Node.js / Vite Toolchain • 100% Self-Hostable Output',
  },
  {
    id: 'proof-of-work',
    tag: 'PROOF OF WORK',
    headline: 'Hands-on mentorship, real code reviews, proof of skill.',
    body: 'ZYR0 Work connects students and engineers with practical, paid industry opportunities. You work through structured project milestones, receive direct 1-on-1 code reviews from senior mentors, and graduate with verified portfolio proof that hiring teams actually take seriously.',
    badge: '1-on-1 Mentor Guidance • Thorough Code Reviews • Verified Outcomes',
  },
];

const bottomJourneyData: JourneyItem[] = [
  {
    id: 'auditable-intelligence',
    tag: 'EPISTEMIC RIGOR',
    headline: 'Verifiable citation graphs over ungrounded generation.',
    body: 'Autonomous agents in ZYR0 Research do not hallucinate inside an opaque black box. Every claim is resolved against authoritative web indices with verifiable source attribution, immutable provenance links, and step-by-step reasoning logs. What is generated can be independently audited down to the exact URL and timestamp.',
    badge: 'Cryptographic Trace Logs • Zero Untraced Assertions',
  },
  {
    id: 'data-portability',
    tag: 'GOVERNANCE & PRIVACY',
    headline: 'Tenant-isolated data models. Open schema exports.',
    body: 'Whether orchestrating institutional operations in School OS or training domain workflows, your data remains logically isolated in strict multi-tenant boundaries. Zero proprietary schema lock-in: extract your institutional records, telemetry, and relational models into open CSV, JSON, or standard relational formats at any point without administrative friction.',
    badge: 'Strict RBAC Enforcement • Zero Proprietary Formats',
  },
];

// In order of horizontal appearance along the track (alternating top and bottom)
const allJourneyItems: JourneyItem[] = [
  topJourneyData[0],
  bottomJourneyData[0],
  topJourneyData[1],
  bottomJourneyData[1],
];

export default function Timeline({
  title = 'Product Storyline',
  periodLabel = '2020-2026',
  textColor = 'var(--color-foreground, #000000)',
  mutedTextColor = 'var(--color-muted-foreground, #3f3f46)',
  activeColor = '#7B7BDC',
  backgroundColor = 'var(--color-background, #ffffff)',
  imageUrl = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
  imageAlt = 'Team collaborating in a bright studio',
  duration,
  scrollDuration = 1.2,
}: TimelineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wholeSliderRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const animationDuration = duration ?? scrollDuration;
  const normalizedDuration = Math.max(0.2, animationDuration);
  const sectionStyle: CSSProperties = {
    color: textColor,
    backgroundColor,
  };
  const activeStyle: CSSProperties = {
    backgroundColor: activeColor,
  };
  const mutedTextStyle: CSSProperties = {
    color: mutedTextColor,
  };

  useGSAP(
    () => {
      const section = sectionRef.current;

      if (!section) return;

      const isMobile = window.innerWidth < 600;
      const lastCardContainer = document.querySelector('.card-data-portability');
      let targetX = 0;

      if (lastCardContainer && wholeSliderRef.current) {
        const sliderRect = wholeSliderRef.current.getBoundingClientRect();
        const cardRect = lastCardContainer.getBoundingClientRect();
        // card center relative to slider start
        const cardCenterInSlider = (cardRect.left - sliderRect.left) + cardRect.width / 2;
        // target scroll: place card center at viewport center
        targetX = -(cardCenterInSlider - window.innerWidth / 2);
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '96% bottom',
          scrub: true,
          invalidateOnRefresh: true,
        },
        defaults: {
          ease: 'none',
        },
      });

      if (targetX !== 0) {
        tl.to(wholeSliderRef.current, { x: targetX });
      } else {
        tl.to(wholeSliderRef.current, { xPercent: isMobile ? -80 : -70 });
      }

      if (reducedMotion) {
        gsap.set('.journey-line', { width: '100%' });
        return;
      }

      gsap.to('.journey-line', {
        width: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: isMobile ? 'top 30%' : 'top 25%',
          end: '96% bottom',
          scrub: true,
        },
      });
    },
    { dependencies: [reducedMotion], scope: sectionRef },
  );

  useGSAP(
    () => {
      const section = sectionRef.current;

      if (!section) return;

      const items = allJourneyItems;

      if (reducedMotion) {
        items.forEach((item) => {
          gsap.set(`.jl-${item.id}`, { scaleY: 1 });
          gsap.set(`.jd-${item.id}`, { scale: 1 });
          gsap.set(`.title-${item.id}`, { opacity: 1, clearProps: 'transform' });
          gsap.set(`.description-${item.id}`, { opacity: 1, clearProps: 'transform' });
        });
        return;
      }

      items.forEach((item) => {
        const isTop = topJourneyData.some((topItem) => topItem.id === item.id);
        gsap.set(`.jl-${item.id}`, {
          scaleY: 0,
          transformOrigin: isTop ? 'bottom bottom' : 'top top',
        });
        gsap.set(`.jd-${item.id}`, { scale: 0 });
        gsap.set(`.title-${item.id}`, { opacity: 1 });
        gsap.set(`.description-${item.id}`, { opacity: 1 });
      });

      const titleSplits: Partial<Record<string, SplitTextInstance>> = {};
      const descriptionSplits: Partial<Record<string, SplitTextInstance>> = {};

      items.forEach((item) => {
        titleSplits[item.id] = new SplitText(`.title-${item.id}`, {
          type: 'chars, words, lines',
          mask: 'lines',
        });

        descriptionSplits[item.id] = new SplitText(`.description-${item.id}`, {
          type: 'chars, words, lines',
          mask: 'lines',
        });
      });

      const createItemTimeline = (item: JourneyItem, startPos: number, endPos: number) => {
        const lineSelector = `.jl-${item.id}`;
        const dotSelector = `.jd-${item.id}`;
        const titleLines = titleSplits[item.id]?.lines || [];
        const descriptionLines = descriptionSplits[item.id]?.lines || [];

        const isTop = topJourneyData.some((topItem) => topItem.id === item.id);

        if (!isTop) {
          gsap.set(lineSelector, { transformOrigin: 'top top' });
        }

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: `${startPos}% 30%`,
            end: `${endPos}% 50%`,
            scrub: true,
          },
        });

        timeline
          .to(lineSelector, {
            scaleY: 1,
            duration: normalizedDuration * 0.4,
          })
          .to(
            dotSelector,
            {
              scale: 1,
              duration: normalizedDuration * 0.4,
            },
            '<',
          )
          .fromTo(
            titleLines,
            { y: 100 },
            {
              y: 0,
              delay: -0.8 * normalizedDuration,
              duration: normalizedDuration,
              stagger: 0.02,
              ease: 'power2.out',
            },
          )
          .fromTo(
            descriptionLines,
            { y: 100 },
            {
              y: 0,
              duration: normalizedDuration,
              stagger: 0.02,
              ease: 'power2.out',
            },
            '<',
          );

        return timeline;
      };

      const positions: ReadonlyArray<readonly [number, number]> =
        window.innerWidth < 600
          ? [
              [8, 26],
              [24, 44],
              [42, 62],
              [60, 84],
            ]
          : [
              [5, 24],
              [22, 42],
              [40, 60],
              [58, 82],
            ];

      items.forEach((item, index) => {
        const [startPos, endPos] = positions[index];
        createItemTimeline(item, startPos, endPos);
      });

      const handleResize = () => {
        ScrollTrigger.refresh();
      };

      window.addEventListener('resize', handleResize);

      return () => {
        Object.values(titleSplits).forEach((split) => split?.revert?.());
        Object.values(descriptionSplits).forEach((split) => split?.revert?.());
        window.removeEventListener('resize', handleResize);
      };
    },
    { dependencies: [normalizedDuration, reducedMotion], scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="journey"
      className="h-[200vw] max-[600px]:h-[400vh] w-full relative"
      style={sectionStyle}
    >
      <div className="h-screen w-screen sticky top-0 pt-[10%] overflow-hidden max-[600px]:pt-[12vh]">
        <div
          ref={wholeSliderRef}
          className="mr-[2vw] flex h-[30vw] w-[250vw] items-center gap-[5vw] px-[5vw] max-[600px]:h-[76vh] max-[600px]:w-[620vw] max-[600px]:px-[7vw]"
        >
          <div className="h-full w-[30vw] overflow-hidden rounded-[1vw] max-[600px]:h-[65vw] max-[600px]:w-[85vw] max-[600px]:rounded-[5vw] bg-muted/20 relative">
            <img
              src={imageUrl}
              alt={imageAlt}
              draggable={false}
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="relative h-full w-full">
            <div className="w-full absolute left-0 top-[49%] -translate-y-1/2 flex items-center h-fit">
              <div
                className="h-[.8vw] max-[600px]:h-[2vw] max-[600px]:w-[2vw] w-[.8vw] rounded-full"
                style={activeStyle}
              ></div>
              <div
                className="h-px w-[0%] rounded-full journey-line"
                style={activeStyle}
              ></div>
              <div
                className="h-[.8vw] max-[600px]:h-[2vw] max-[600px]:w-[2vw] w-[.8vw] rounded-full"
                style={activeStyle}
              ></div>
            </div>

            <div className="flex h-1/2 w-full items-center justify-start gap-[.5vw]">
              <div className="h-full w-[20%] pt-[2vw] max-[600px]:h-fit max-[600px]:pt-[5vw]">
                <h2 className="w-[85%] text-[2.4vw] leading-[1.05] max-[600px]:text-[7vw] font-display font-semibold">
                  {title}
                </h2>
              </div>

              {/* Top row: Item 1 (Pillar 1) and Item 2 (Pillar 3) */}
              <div className="w-full flex h-full gap-x-[44vw] pr-[22vw] max-[600px]:gap-x-[85vw] max-[600px]:pr-[35vw]">
                {topJourneyData.map((item) => (
                  <div
                    key={`top-${item.id}`}
                    className="relative h-full w-[38vw] px-[3vw] max-[600px]:flex max-[600px]:w-[80vw] max-[600px]:flex-col max-[600px]:px-[7vw]"
                  >
                    <div className="w-full absolute left-0 bottom-0 top-0 h-full">
                      <div
                        className={`size-[1vw] max-[600px]:size-[2.5vw] translate-x-[-50%] relative aspect-square rounded-full jd-${item.id}`}
                        style={activeStyle}
                      ></div>
                      <div
                        className={`h-[94%] w-px origin-bottom rounded-full jl-${item.id}`}
                        style={activeStyle}
                      ></div>
                    </div>

                    <div className="mt-[-2vw] space-y-[0.6vw] max-[600px]:mt-[-3vw]">
                      <div className="flex items-center gap-2">
                        <span className="text-[0.72vw] max-[600px]:text-[2.4vw] tracking-[0.2em] uppercase font-mono font-semibold" style={{ color: activeColor }}>
                          {item.tag}
                        </span>
                      </div>
                      <h4
                        className={`title-${item.id} text-[1.6vw] leading-[1.15] max-[600px]:text-[5vw] font-display font-semibold`}
                      >
                        {item.headline}
                      </h4>
                      <p
                        className={`description-${item.id} w-[95%] text-[0.95vw] leading-[1.4] max-[600px]:w-[95%] max-[600px]:text-[3.6vw]`}
                        style={mutedTextStyle}
                      >
                        {item.body}
                      </p>
                      <div className="pt-[0.2vw]">
                        <span className="inline-block text-[0.68vw] max-[600px]:text-[2.4vw] font-mono px-2 py-0.5 rounded border border-white/10 bg-white/5 text-white/70">
                          {item.badge}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-1/2 flex items-center justify-start w-full">
              <div className="w-[34%] pt-[2vw] max-[600px]:pt-[5vw] max-[600px]:w-[30%] h-full">
                <p
                  className="text-[1.4vw] leading-none max-[600px]:text-[3.8vw] font-mono"
                  style={mutedTextStyle}
                >
                  {periodLabel}
                </p>
              </div>

              {/* Bottom row: Item 1 (Pillar 2) and Item 2 (Pillar 4) offset horizontally by 26vw with snug end padding */}
              <div className="w-full flex h-full gap-x-[44vw] ml-[26vw] pr-[22vw] max-[600px]:gap-x-[85vw] max-[600px]:ml-[45vw] max-[600px]:pr-[45vw]">
                {bottomJourneyData.map((item) => (
                  <div
                    key={`bottom-${item.id}`}
                    className={`relative h-full w-[38vw] px-[3vw] max-[600px]:w-[82vw] max-[600px]:px-[6vw] card-${item.id}`}
                  >
                    <div className="w-full absolute left-0 top-0 h-full">
                      <div
                        className={`size-[1vw] max-[600px]:size-[2.5vw] translate-x-[-50%] relative w-auto aspect-square rounded-full jd-${item.id}`}
                        style={activeStyle}
                      ></div>
                      <div
                        className={`h-[94%] origin-top w-px rounded-full max-[600px]:h-full jl-${item.id}`}
                        style={activeStyle}
                      ></div>
                    </div>

                    <div className="flex h-full w-full flex-col justify-start pt-[2.8vw] max-[600px]:pt-[3vh] space-y-[0.6vw] max-[600px]:space-y-[1.5vw]">
                      <div className="flex items-center gap-2">
                        <span className="text-[0.72vw] max-[600px]:text-[2.2vw] tracking-[0.2em] uppercase font-mono font-semibold" style={{ color: activeColor }}>
                          {item.tag}
                        </span>
                      </div>
                      <h4
                        className={`title-${item.id} text-[1.6vw] leading-[1.15] max-[600px]:text-[4.4vw] font-display font-semibold`}
                      >
                        {item.headline}
                      </h4>
                      <p
                        className={`description-${item.id} w-[95%] text-[0.95vw] leading-[1.4] max-[600px]:w-[95%] max-[600px]:text-[3.2vw] max-[600px]:leading-[1.35]`}
                        style={mutedTextStyle}
                      >
                        {item.body}
                      </p>
                      <div className="pt-[0.2vw]">
                        <span className="inline-block text-[0.68vw] max-[600px]:text-[2.2vw] font-mono px-2 py-0.5 rounded border border-white/10 bg-white/5 text-white/70">
                          {item.badge}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
