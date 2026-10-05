/* Floating navigation: compact-on-scroll, sliding indicator, mobile menu, anchors, section counter */
import { $, $$, app, mq, scrollToEl, state, pad, motionOK } from './core.js';
import { freeze, unfreeze } from './scroll.js';

const ORDER = ['hero', 'services', 'templates', 'projects', 'about', 'process', 'reviews', 'contact'];

export function render() {
  const p = state.profile;
  const m = /\(([^)]+)\)/.exec(p.name || '');
  $('#brand-name').textContent = (m ? m[1] : p.name || 'foy4ik').toUpperCase();
  const hasReviews = state.reviews.length > 0;
  $('#nav-reviews').hidden = !hasReviews;
  $('#mm-reviews').hidden = !hasReviews;
  $('#reviews').hidden = !hasReviews;
  $('#services').hidden = state.services.length === 0;
  $('#foot-name').textContent = '© ' + new Date().getFullYear() + ' ' + (p.name || 'foy4ik');
  document.title = `${p.name || 'foy4ik'} - сайты, Telegram-боты и приложения под ключ`;
}

export function animate() {
  const nav = $('#nav');
  const ul = $('#nav-links');
  const navMain = ul.parentElement;
  navMain.style.position = 'relative';
  const ind = document.createElement('span');
  ind.className = 'nav-ind';
  ind.setAttribute('aria-hidden', 'true');
  navMain.prepend(ind);

  /* anchors: Lenis-aware smooth scroll */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href === '#' || href.startsWith('#/')) return;
    const target = href === '#hero' ? 0 : $(href);
    if (target === null || target === undefined) return;
    e.preventDefault();
    closeMenu();
    if (target === 0) { app.lenis ? app.lenis.scrollTo(0, { duration: 1.4 }) : window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else scrollToEl(target, href === '#projects' ? 0 : -10);
    history.replaceState(null, '', href);
  });

  /* compact on scroll */
  ScrollTrigger.create({ start: 80, end: 'max', onToggle: (s) => nav.classList.toggle('scrolled', s.isActive) });

  /* active section + sliding indicator */
  const links = Object.fromEntries($$('a[data-sec]', ul).map((a) => [a.dataset.sec, a]));
  let current = null;
  const place = (a) => {
    if (!a) { gsap.to(ind, { opacity: 0, duration: 0.3 }); return; }
    const nr = navMain.getBoundingClientRect(); const r = a.getBoundingClientRect();
    gsap.to(ind, { x: r.left - nr.left, width: r.width, opacity: 1, duration: motionOK() ? 0.55 : 0, ease: 'power3.out' });
  };
  const setActive = (id) => {
    const key = id === 'process' ? 'about' : id;
    if (key === current) return;
    current = key;
    Object.values(links).forEach((a) => a.classList.remove('active'));
    const a = links[key];
    if (a) a.classList.add('active');
    place(a);
  };
  const visible = ORDER.filter((id) => { const el = document.getElementById(id); return el && !el.hidden; });
  const cornerNo = $('#corner-no');
  visible.forEach((id, i) => {
    ScrollTrigger.create({
      trigger: '#' + id, start: 'top 55%', end: 'bottom 55%',
      onToggle: (s) => { if (s.isActive) { setActive(id); cornerNo.textContent = pad(i + 1); } },
    });
  });
  ScrollTrigger.create({ trigger: '#hero', start: 'top top', end: 'bottom 55%', onToggle: (s) => { if (s.isActive) { setActive('hero'); cornerNo.textContent = '01'; } } });
  window.addEventListener('resize', () => { const a = links[current]; if (a) place(a); });

  /* mobile menu */
  const burger = $('#burger'); const menu = $('#mobile-menu');
  function openMenu() { burger.setAttribute('aria-expanded', 'true'); menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false'); freeze(); }
  function closeMenu() { if (!menu.classList.contains('open')) return; burger.setAttribute('aria-expanded', 'false'); menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true'); unfreeze(); }
  burger.addEventListener('click', () => (menu.classList.contains('open') ? closeMenu() : openMenu()));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  mq.wide.addEventListener('change', closeMenu);
}
