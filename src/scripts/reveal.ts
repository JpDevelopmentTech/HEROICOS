import { animate, inView, stagger } from 'motion';

/**
 * Scroll-reveal animations powered by `motion` (motion.dev).
 *
 * Usage (attributes on any element):
 *   data-reveal                -> fade + slide up (default)
 *   data-reveal="fade"         -> fade only
 *   data-reveal="up|down|left|right"
 *   data-reveal="scale"        -> fade + subtle zoom in
 *   data-reveal-delay="0.15"   -> delay in seconds
 *   data-reveal-duration="0.8" -> duration in seconds
 *
 * On a container:
 *   data-reveal-group          -> descendant [data-reveal] elements are revealed
 *                                 together with a stagger when the group enters
 *   data-reveal-stagger="0.08" -> stagger step in seconds (default 0.08)
 *
 * Respects `prefers-reduced-motion`: elements are simply shown, no motion.
 */

type Offset = { x?: number; y?: number; scale?: number };

const OFFSETS: Record<string, Offset> = {
  '': { y: 24 },
  up: { y: 24 },
  down: { y: -24 },
  left: { x: 24 },
  right: { x: -24 },
  fade: {},
  scale: { scale: 0.92 },
};

// Custom ease — a soft "out expo"-ish curve.
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

function offsetFor(el: HTMLElement): Offset {
  const variant = el.dataset.reveal || '';
  return OFFSETS[variant] ?? OFFSETS[''];
}

function hide(el: HTMLElement) {
  const { x = 0, y = 0, scale = 1 } = offsetFor(el);
  el.style.opacity = '0';
  el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  el.style.willChange = 'opacity, transform';
}

function show(el: HTMLElement, opts: { duration?: number; delay?: number } = {}) {
  return animate(
    el,
    { opacity: 1, x: 0, y: 0, scale: 1 },
    { duration: opts.duration ?? 0.7, delay: opts.delay ?? 0, ease: EASE }
  ).then(() => {
    el.style.willChange = '';
  });
}

export function initReveal() {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const solo = Array.from(
    document.querySelectorAll<HTMLElement>('[data-reveal]')
  ).filter((el) => !el.closest('[data-reveal-group]'));

  const groups = Array.from(
    document.querySelectorAll<HTMLElement>('[data-reveal-group]')
  );

  if (prefersReducedMotion) return;

  solo.forEach((el) => {
    hide(el);
    const delay = parseFloat(el.dataset.revealDelay || '0');
    const duration = parseFloat(el.dataset.revealDuration || '0.7');
    inView(
      el,
      () => {
        show(el, { delay, duration });
      },
      { margin: '0px 0px -12% 0px' }
    );
  });

  groups.forEach((group) => {
    const children = Array.from(
      group.querySelectorAll<HTMLElement>('[data-reveal]')
    ).filter((child) => child.closest('[data-reveal-group]') === group);

    const step = parseFloat(group.dataset.revealStagger || '0.08');

    children.forEach(hide);

    inView(
      group,
      () => {
        animate(
          children,
          { opacity: 1, x: 0, y: 0, scale: 1 },
          { duration: 0.7, delay: stagger(step), ease: EASE }
        ).then(() => children.forEach((el) => (el.style.willChange = '')));
      },
      { margin: '0px 0px -12% 0px' }
    );
  });
}
