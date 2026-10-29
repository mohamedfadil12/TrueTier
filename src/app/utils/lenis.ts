import Lenis from 'lenis';

let lenisInstance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenisInstance;
}

export function setLenis(lenis: Lenis | null): void {
  lenisInstance = lenis;
}

export function scrollToTarget(
  target: number | string | HTMLElement,
  options?: { offset?: number; duration?: number; immediate?: boolean }
): void {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, {
      offset: options?.offset ?? -20,
      duration: options?.duration ?? 1.2,
      immediate: options?.immediate ?? false,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  } else {
    // Native fallback
    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth' });
    } else if (typeof target === 'string') {
      const el = document.querySelector(target);
      el?.scrollIntoView({ behavior: 'smooth' });
    } else {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
