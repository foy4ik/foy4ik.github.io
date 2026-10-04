/* Custom cursor (fine pointers only) + magnetic buttons */
import { $, $$, mq, motionOK } from './core.js';

export function animate() {
  if (!mq.fine.matches || !motionOK()) return;
  const root = document.documentElement;
  const cur = $('#cursor'); const label = $('.cursor-label', cur);
  root.classList.add('has-cursor');
  const mx = gsap.quickTo(cur, 'x', { duration: 0.38, ease: 'power3' });
  const my = gsap.quickTo(cur, 'y', { duration: 0.38, ease: 'power3' });
  gsap.set(cur, { opacity: 0 });

  let seen = false;
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    if (!seen) { seen = true; gsap.set(cur, { x: e.clientX, y: e.clientY }); gsap.to(cur, { opacity: 1, duration: 0.3 }); }
    mx(e.clientX); my(e.clientY);
  }, { passive: true });
  document.addEventListener('mouseleave', () => gsap.to(cur, { opacity: 0, duration: 0.2 }));
  document.addEventListener('mouseenter', () => seen && gsap.to(cur, { opacity: 1, duration: 0.2 }));
  window.addEventListener('pointerdown', () => cur.classList.add('is-down'));
  window.addEventListener('pointerup', () => cur.classList.remove('is-down'));

  /* label / state from whatever is under the pointer */
  const state = () => cur.classList.remove('is-label', 'is-text', 'is-hover');
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cursor], a, button, input, textarea, [data-case]');
    state();
    if (!t) return;
    if (t.matches('input, textarea')) { cur.classList.add('is-text'); return; }
    let text = t.dataset.cursor;
    if (text === undefined && t.matches('a[target="_blank"]')) text = 'OPEN';
    if (text) { label.textContent = text; cur.classList.add('is-label'); }
    else cur.classList.add('is-hover');
  });

  /* magnetic pull toward the pointer */
  $$('[data-magnetic]').forEach((el) => {
    const qx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1,.6)' });
    const qy = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1,.6)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      qx((e.clientX - (r.left + r.width / 2)) * 0.28); qy((e.clientY - (r.top + r.height / 2)) * 0.35);
    });
    el.addEventListener('pointerleave', () => { qx(0); qy(0); });
  });
}
