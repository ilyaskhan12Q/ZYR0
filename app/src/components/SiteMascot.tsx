import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { createAvatar, type AvatarController } from '@bible-strong/avatar-react';
import { usePrefersReducedMotion } from '@/lib/dotmatrix-hooks';
import avatarJson from '@/avatar.avatar.json';

/** Landing pages only. Add a path here to put the mascot somewhere else. */
const LANDING_PATHS = new Set([
  '/',
  '/studio',
  '/school',
  '/edu',
  '/research',
  '/internships',
  '/blog',
]);

/** Primary call-to-action on each landing page. */
const CTA_SELECTOR = '[data-mascot]';

// Every animation in the definition is playbackMode "loop", so none of them ever
// ends on its own — each reaction has to be timed back to idle by hand.
const WAKING_MS = 2000;
const REACTION_MS = { excited: 2500, celebrate: 3500, confused: 3000, laughing: 3000 };
const DROWSY_AFTER_MS = 30_000;
const SLEEPING_AFTER_MS = 45_000;

const ACTIVITY_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];

// createAvatar validates eagerly and throws, so a bad definition must not take
// the whole app down at boot — degrade to no mascot instead.
const Mascot = (() => {
  try {
    return createAvatar(avatarJson);
  } catch (error) {
    console.error('[SiteMascot] avatar definition rejected:', error);
    return null;
  }
})();

const normalize = (pathname: string) =>
  pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

const insideCta = (target: EventTarget | null) =>
  target instanceof Element && target.closest(CTA_SELECTOR) !== null;

export function SiteMascot() {
  const { pathname } = useLocation();
  const reducedMotion = usePrefersReducedMotion();
  const avatar = useRef<AvatarController>(null);
  const reactionTimer = useRef<number | undefined>(undefined);
  const lastActivity = useRef(Date.now());

  const visible = Mascot !== null && LANDING_PATHS.has(normalize(pathname));

  const activeAnimation = () => avatar.current?.getState().activeAnimation;

  const setAnimation = useCallback(
    (next: string) => {
      if (reducedMotion) return;
      const instance = avatar.current;
      if (!instance) return;
      const state = instance.getState();
      if (state.activeAnimation === next && state.status === 'playing') return;
      instance.play(next);
    },
    [reducedMotion]
  );

  /** Play a reaction, then fall back to idle once its window has elapsed. */
  const reactFor = useCallback(
    (key: keyof typeof REACTION_MS) => {
      setAnimation(key);
      window.clearTimeout(reactionTimer.current);
      reactionTimer.current = window.setTimeout(() => setAnimation('idle'), REACTION_MS[key]);
    },
    [setAnimation]
  );

  // Page opens: waking, then idle. The 2s timeout is the real path because
  // waking loops; onAnimationEnd covers the same switch if it is ever set to once.
  useEffect(() => {
    if (!visible) return;
    if (reducedMotion) {
      avatar.current?.stop();
      return;
    }
    setAnimation('waking');
    const timer = window.setTimeout(() => setAnimation('idle'), WAKING_MS);
    return () => window.clearTimeout(timer);
  }, [visible, pathname, reducedMotion, setAnimation]);

  // Idle detection: 30s -> drowsy, 45s -> sleeping, any movement -> idle.
  useEffect(() => {
    if (!visible) return;

    const onActivity = () => {
      lastActivity.current = Date.now();
      const current = activeAnimation();
      if (current === 'drowsy' || current === 'sleeping') setAnimation('idle');
    };

    const tick = window.setInterval(() => {
      if (reducedMotion) return;
      const elapsed = Date.now() - lastActivity.current;
      const current = activeAnimation();
      if (elapsed >= SLEEPING_AFTER_MS) setAnimation('sleeping');
      else if (elapsed >= DROWSY_AFTER_MS) setAnimation('drowsy');
      else if (current === 'drowsy' || current === 'sleeping') setAnimation('idle');
    }, 1000);

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, onActivity, { passive: true }));
    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, onActivity));
      window.clearInterval(tick);
    };
  }, [visible, reducedMotion, setAnimation]);

  // Hover over the primary CTA on desktop, tap on touch-first devices.
  useEffect(() => {
    if (!visible) return;

    const onOver = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && insideCta(event.target)) reactFor('excited');
    };
    const onOut = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !insideCta(event.target)) return;
      if (event.relatedTarget instanceof Element && insideCta(event.relatedTarget)) return;
      setAnimation('idle');
    };
    const onTap = (event: MouseEvent) => {
      if (insideCta(event.target)) reactFor('excited');
    };

    window.addEventListener('pointerover', onOver);
    window.addEventListener('pointerout', onOut);
    // capture phase so the reaction lands before a Link navigates away
    window.addEventListener('click', onTap, true);

    return () => {
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerout', onOut);
      window.removeEventListener('click', onTap, true);
      window.clearTimeout(reactionTimer.current);
    };
  }, [visible, reactFor, setAnimation]);

  // Signup forms report their outcome through sonner. Only a toast that follows
  // a submit counts, so unrelated load errors elsewhere do not move the mascot.
  useEffect(() => {
    if (!visible) return;

    let submittedAt = 0;
    const onSubmit = () => {
      submittedAt = Date.now();
    };
    document.addEventListener('submit', onSubmit, true);

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          const toast = node.matches('[data-sonner-toast]')
            ? node
            : node.querySelector('[data-sonner-toast]');
          if (!toast || Date.now() - submittedAt > 5000) continue;
          submittedAt = 0;
          const type = toast.getAttribute('data-type');
          if (type === 'success') reactFor('celebrate');
          else if (type === 'error') reactFor('confused');
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('submit', onSubmit, true);
      observer.disconnect();
      window.clearTimeout(reactionTimer.current);
    };
  }, [visible, reactFor]);

  // Stop burning frames while the tab is in the background.
  useEffect(() => {
    if (!visible) return;
    const onVisibility = () => {
      if (document.hidden) {
        avatar.current?.pause();
        return;
      }
      const state = avatar.current?.getState();
      if (state?.status === 'paused' && state.activeAnimation) setAnimation(state.activeAnimation);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [visible, setAnimation]);

  useEffect(() => () => window.clearTimeout(reactionTimer.current), []);

  if (!Mascot || !visible) return null;

  return (
    <div
      aria-hidden="true"
      onClick={() => reactFor('laughing')}
      className="pointer-events-none fixed bottom-24 right-6 z-30 select-none"
    >
      <Mascot
        ref={avatar}
        defaultAnimation="idle"
        autoplay={false}
        size={120}
        className="pointer-events-auto cursor-pointer"
        onAnimationEnd={(animation) => {
          if (animation === 'waking') setAnimation('idle');
        }}
        onError={(error) => console.error('[SiteMascot]', error)}
      />
    </div>
  );
}

export default SiteMascot;
