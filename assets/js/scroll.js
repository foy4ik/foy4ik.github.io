/* Smooth scrolling (Lenis) wired into GSAP's ticker, plus text reveal helpers */
import { app, mq, $$, esc, motionOK } from './core.js';

export function initScroll() {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (motionOK()) {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    app.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener('load', refresh, { once: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
}

export const freeze = () => { app.lenis ? app.lenis.stop() : (document.documentElement.style.overflow = 'hidden'); };
export const unfreeze = () => { app.lenis ? app.lenis.start() : (document.documentElement.style.overflow = ''); };

/* Word-by-word masked reveal for headings, plain lift for small text blocks */
export function initReveals() {
  if (!motionOK()) return;
  $$('[data-split]').forEach((el) => {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split(/\s+/).map((w) => `<span class="w" aria-hidden="true"><span class="wi">${esc(w)}</span></span>`).join(' ');
    gsap.from($$('.wi', el), { yPercent: 115, duration: 1, ease: 'power4.out', stagger: 0.05, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  $$('[data-reveal]').forEach((el) => {
    gsap.from(el, { y: 26, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
}
