/* Shared helpers, state and media queries */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const mq = {
  reduce: matchMedia('(prefers-reduced-motion: reduce)'),
  fine: matchMedia('(hover:hover) and (pointer:fine)'),
  desktop: matchMedia('(min-width:1024px)'),
  wide: matchMedia('(min-width:960px)'),
  phone: matchMedia('(max-width:767px)'),
};
export const motionOK = () => !mq.reduce.matches;

/* Data lives in the page as JSON; the admin page rewrites exactly this block. */
function loadState() {
  const empty = { profile: {}, projects: [], services: [], reviews: [], templates: {} };
  try {
    const d = JSON.parse(document.getElementById('state-data').textContent);
    d.profile = d.profile || {};
    d.projects = Array.isArray(d.projects) ? d.projects.filter((p) => p && p.title) : [];
    d.services = Array.isArray(d.services) ? d.services.filter((s) => s && s.title) : [];
    d.reviews = Array.isArray(d.reviews) ? d.reviews.filter((r) => r && r.text) : [];
    d.templates = d.templates && typeof d.templates === 'object' && !Array.isArray(d.templates) ? d.templates : {};
    return d;
  } catch (e) {
    console.warn('state-data is not valid JSON', e);
    return empty;
  }
}
export const state = loadState();
export const app = { lenis: null, openCase: null };

export const projectById = (id) => state.projects.find((p) => p.id === id);
export const nb = (v) => String(v ?? '').replace(/(\d) (?=\d)/g, '$1 ').replace(/ (?=₽)/g, ' ');
export const pad = (n) => String(n).padStart(2, '0');
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Smooth scroll that works with and without Lenis */
export function scrollToEl(target, offset = 0) {
  const el = typeof target === 'string' ? $(target) : target;
  if (!el) return;
  if (app.lenis) app.lenis.scrollTo(el, { offset, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else {
    const y = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: y, behavior: mq.reduce.matches ? 'auto' : 'smooth' });
  }
}

/* "Обсудить": prefill the idea field, scroll to it, put the caret at the end */
export function goToLead(prefill) {
  const ta = $('#lead-message');
  if (!ta) return;
  if (prefill) {
    const cur = ta.value.trim();
    ta.value = !cur || cur.startsWith('Интересует:') ? prefill : ta.value.replace(/\s+$/, '') + '\n' + prefill;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }
  scrollToEl('#idea', -130);
  setTimeout(() => {
    const target = prefill ? ta : $('#lead-message');
    target.focus({ preventScroll: true });
    target.setSelectionRange(target.value.length, target.value.length);
  }, mq.reduce.matches ? 0 : 900);
}
