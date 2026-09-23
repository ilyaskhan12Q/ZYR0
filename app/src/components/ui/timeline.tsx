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
  year: string;
  month: Month;
  content: string;
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

// ponytail: journey data hardcoded in-component; hoist to props/data module when a second timeline appears
const topJourneyData: JourneyItem[] = [
  {
    id: '2020-march',
    year: '2020',
    month: 'March',
    content: 'Signal research consolidates scattered ideas into one ecosystem thesis',
  },
  {
    id: '2021-july',
    year: '2021',
    month: 'July',
    content: 'Founding release ships ZYR0 Studio with the first live customer journeys',
  },
  {
    id: '2023-april',
    year: '2023',
    month: 'April',
    content: 'School OS connects institutions, fee billing, and verifiable credentials',
  },
  {
    id: '2026-may',
    year: '2026',
    month: 'May',
    content: 'Open skills marketplace opens the network to community builders',
  },
];

const bottomJourneyData: JourneyItem[] = [
  {
    id: '2020-november',
    year: '2020',
    month: 'November',
    content: 'Prototype sprint validates multi-tenant architecture with real operators',
  },
  {
    id: '2022-october',
    year: '2022',
    month: 'October',
    content: 'Cryptographic verification layer signs every credential and milestone',
  },
  {
    id: '2025-september',
    year: '2025',
    month: 'September',
    content: 'Research Agent ships autonomous literature synthesis to production',
  },
];

const allJourneyItems: JourneyItem[] = [...topJourneyData, ...bottomJourneyData].sort(
  (a, b) => {
    const yearDiff = Number(a.year) - Number(b.year);
    if (yearDiff !== 0) return yearDiff;
    return monthOrder[a.month] - monthOrder[b.month];
  },
);

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
      const slidePercent = isMobile ? -57 : -65;
      const lineWidth = isMobile ? '65%' : '98%';
      const lineStart = isMobile ? 'top 30%' : 'top 25%';
      const slideEnd = isMobile ? '82% 50%' : '92% bottom';
      const lineEnd = isMobile ? '80% 50%' : '92% bottom';

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: slideEnd,
          scrub: true,
        },
        defaults: {
          ease: 'none',
        },
      });

      tl.fromTo(wholeSliderRef.current, { xPercent: 0 }, { xPercent: slidePercent });

      if (reducedMotion) {
        gsap.set('.journey-line', { width: lineWidth });
        return;
      }

      gsap.to('.journey-line', {
        width: lineWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: lineStart,
          end: lineEnd,
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
        gsap.set(`.jl-${item.id}`, {
          scaleY: 0,
          transformOrigin: 'bottom bottom',
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
              [22, 32],
              [28, 38],
              [36, 46],
              [45, 55],
              [52, 62],
              [60, 70],
              [69, 79],
            ]
          : [
              [6, 26],
              [16, 36],
              [26, 46],
              [35, 55],
              [45, 65],
              [55, 75],
              [65, 85],
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
      <div className="h-screen w-screen sticky top-0 pt-[10%] overflow-hidden max-[600px]:pt-[24vh]">
        <div
          ref={wholeSliderRef}
          className="mr-[2vw] flex h-[30vw] w-[240vw] items-center gap-[5vw] px-[5vw] max-[600px]:h-[60vh] max-[600px]:w-[800vw] max-[600px]:px-[7vw]"
        >
          <div className="h-full w-[30vw] overflow-hidden rounded-[1vw] max-[600px]:h-[65vw] max-[600px]:w-[85vw] max-[600px]:rounded-[5vw]">
            <img
              src={imageUrl}
              alt={imageAlt}
              draggable={false}
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
                <h2 className="w-[65%]  text-[3vw] leading-[0.95] max-[600px]:text-[8.5vw] font-display">
                  {title}
                </h2>
              </div>

              <div className="w-full flex h-full gap-x-[15vw] max-[600px]:gap-x-[40vw]">
                {topJourneyData.map((item) => (
                  <div
                    key={`top-${item.id}`}
                    className="relative h-full w-[30vw] px-[3vw] max-[600px]:flex max-[600px]:w-[70vw] max-[600px]:flex-col max-[600px]:px-[7vw]"
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

                    <div className="mt-[-1vw] space-y-[1vw] max-[600px]:mt-[-2vw]">
                      <h4
                        className={`title-${item.id}  text-[2.5vw] leading-none max-[600px]:text-[6.4vw] font-display`}
                      >
                        {item.year} {item.month}
                      </h4>
                      <p
                        className={`description-${item.id} w-[90%] text-[1.5vw] leading-[1.15] max-[600px]:w-[90%] max-[600px]:text-[4.8vw]`}
                        style={mutedTextStyle}
                      >
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-1/2 flex items-center justify-start w-full">
              <div className="w-[34%] pt-[2vw] max-[600px]:pt-[5vw] max-[600px]:w-[30%] h-full">
                <p
                  className=" text-[1.65vw] leading-none max-[600px]:text-[4.2vw] font-mono"
                  style={mutedTextStyle}
                >
                  {periodLabel}
                </p>
              </div>

              <div className="w-full flex h-full gap-x-[20vw] ml-[7vw] max-[600px]:gap-x-[40vw] max-[600px]:ml-[7vw]">
                {bottomJourneyData.map((item) => (
                  <div
                    key={`bottom-${item.id}`}
                    className="relative h-full w-[25vw] px-[3vw] max-[600px]:w-[70vw] max-[600px]:px-[7vw]"
                  >
                    <div className="w-full absolute left-0 bottom-[-1%] h-full">
                      <div
                        className={`h-[94%] origin-top w-px rounded-full max-[600px]:h-full jl-${item.id}`}
                        style={activeStyle}
                      ></div>
                      <div
                        className={`size-[1vw] max-[600px]:size-[2.5vw] translate-x-[-50%] relative w-auto aspect-square rounded-full jd-${item.id}`}
                        style={activeStyle}
                      ></div>
                    </div>

                    <div className="flex h-full w-full flex-col justify-end space-y-[1vw]">
                      <h4
                        className={`title-${item.id}  text-[2.5vw] leading-none max-[600px]:text-[6.4vw] font-display`}
                      >
                        {item.year} {item.month}
                      </h4>
                      <p
                        className={`description-${item.id} w-[90%] text-[1.5vw] leading-[1.15] max-[600px]:w-[90%] max-[600px]:text-[4.8vw]`}
                        style={mutedTextStyle}
                      >
                        {item.content}
                      </p>
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
