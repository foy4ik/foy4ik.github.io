/* Project case: immersive full-screen view with its own route (#/case/<id>) */
import { $, $$, esc, state, pad, app, projectById, goToLead, motionOK, nb } from './core.js';
import { freeze, unfreeze } from './scroll.js';
import { TEMPLATES, templateById } from './templates-data.js';
import { build as buildTemplate } from './template-view.js';

const caseEl = () => $('#case');
const scroller = () => $('#case-scroll');
let ctx = null;
let lastFocus = null;
let currentKey = null; // 'case/<id>' or 'tpl/<id>'
let pushes = 0;       // history entries added while the case view is open
let deepStart = false; // opened straight from a #/case/... link
const background = () => ['#main', '#nav', '.foot', '#mobile-menu'].map((s) => $(s)).filter(Boolean);

function build(p, index) {
  const list = state.projects;
  const next = list[(index + 1) % list.length];
  const imgs = p.images || [];
  const lead = p.video
    ? `<video src="${esc(p.video)}" controls playsinline preload="metadata"${imgs[0] ? ` poster="${esc(imgs[0])}"` : ''}></video>`
    : imgs[0] ? `<img src="${esc(imgs[0])}" alt="${esc('Скриншот проекта ' + p.title)}" decoding="async">` : '';
  const rest = p.video ? imgs : imgs.slice(1);
  let n = 1;
  const no = () => pad(++n);
  const type = p.badge || (p.meta || '').split(' - ')[0];
  const paragraphs = (p.fullDescription && p.fullDescription.length ? p.fullDescription : [p.description]).filter(Boolean);
  const links = [
    p.link ? `<a class="btn btn-accent" href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.linkLabel || 'Демо')} <span class="arr">↗</span></a>` : '',
    p.repo ? `<a class="btn btn-ghost" href="${esc(p.repo)}" target="_blank" rel="noopener">Код на GitHub <span class="arr">↗</span></a>` : '',
    p.download ? `<a class="btn btn-ghost" href="${esc(p.download)}" target="_blank" rel="noopener">Скачать приложение</a>` : '',
  ].join('');
  return `
  <article>
    <header class="case-hero">
      <p class="eyebrow">01 / Overview</p>
      <h2 id="case-title">${esc(p.title)}</h2>
      ${p.tagline ? `<p class="case-tag">${esc(p.tagline)}</p>` : ''}
      <div class="case-meta">${type ? `<span class="proj-type">${esc(type)}</span>` : ''}${p.meta ? `<span class="mono" style="font-size:12px;color:var(--muted)">${esc(p.meta)}</span>` : ''}</div>
      ${lead ? `<div class="case-stage">${lead}</div>` : ''}
    </header>
    <section class="case-block"><div class="case-cols">
      <div><p class="eyebrow">${no()} / Обзор</p><h3 class="t">О проекте</h3></div>
      <div class="case-text">${paragraphs.map((t) => `<p>${esc(t)}</p>`).join('')}</div>
    </div></section>
    ${(p.features || []).length ? `<section class="case-block"><p class="eyebrow">${no()} / Функциональность</p><h3 class="t">Что внутри</h3><ol class="feats" style="margin-top:30px">${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ol></section>` : ''}
    ${(p.tags || []).length ? `<section class="case-block"><p class="eyebrow">${no()} / Технологии</p><h3 class="t">Из чего собрано</h3><ul class="case-tech" style="margin-top:30px">${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></section>` : ''}
    ${rest.length ? `<section class="case-block"><p class="eyebrow">${no()} / Экраны</p><h3 class="t">Интерфейс</h3><div class="shots" style="margin-top:30px">${rest.map((s, i) => `<figure class="shot"><img src="${esc(s)}" alt="${esc(p.title + ', экран ' + (i + 2))}" loading="lazy" decoding="async"></figure>`).join('')}</div></section>` : ''}
    <footer class="case-end">
      <div class="case-links">${links}<button type="button" class="btn btn-ghost" data-lead="${esc(p.title)}">Обсудить такой проект</button></div>
      ${list.length > 1 ? `<a class="case-next" href="#/case/${esc(next.id)}" data-next="${esc(next.id)}" data-kind="case"><small>Следующий проект</small><b>${esc(next.title)}</b></a>` : ''}
    </footer>
  </article>`;
}

/* Reveal blocks as they enter the view. IntersectionObserver instead of ScrollTrigger: the content is swapped
   while the overlay stays open ("next"), and a jump of scrollTop must never leave blocks stuck at opacity 0. */
let io = null;
const stopReveals = () => { if (io) { io.disconnect(); io = null; } };
function revealOnScroll(sc) {
  stopReveals();
  const nodes = $$('.feats li, .case-tech li, .shot, .case-text, .case-next, .needs li, .phone-fig, .tb-fig, .chat-fig, .tpl-price-row, .case-links', sc);
  gsap.set(nodes, { y: 46, opacity: 0 });
  io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      gsap.to(e.target, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', clearProps: 'opacity,transform' });
    });
  }, { root: sc, rootMargin: '0px 0px -6% 0px', threshold: 0.01 });
  nodes.forEach((n) => io.observe(n));
}

function animateIn(first, evt) {
  const el = caseEl();
  if (!motionOK()) return;
  if (first) {
    const x = evt && evt.clientX ? evt.clientX : innerWidth / 2;
    const y = evt && evt.clientY ? evt.clientY : innerHeight / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    gsap.fromTo(el, { clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${r}px at ${x}px ${y}px)`, duration: 0.9, ease: 'power3.inOut', clearProps: 'clipPath' });
  }
  gsap.from('.case-hero > *', { y: 44, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', delay: first ? 0.35 : 0.05 });
  ctx = gsap.context(() => {
    const sc = scroller();
    revealOnScroll(sc);
    /* template pages: screenshots pan inside their frames while scrolling, hero objects drift at different speeds */
    $$('[data-pan]', sc).forEach((view) => {
      const im = $('img', view);
      if (!im) return;
      gsap.fromTo(im, { y: 0 }, {
        y: () => -Math.max(0, im.offsetHeight - view.clientHeight), ease: 'none',
        scrollTrigger: view.closest('.case-hero')
          ? { scroller: sc, start: 0, end: () => '+=' + innerHeight, scrub: 0.6, invalidateOnRefresh: true } /* first screen: starts at the top of the shot */
          : { scroller: sc, trigger: view, start: 'top 92%', end: 'bottom 8%', scrub: 0.6, invalidateOnRefresh: true },
      });
    });
    $$('[data-par]', sc).forEach((el) => {
      gsap.to(el, { y: () => +el.dataset.par * -140, ease: 'none', scrollTrigger: { scroller: sc, trigger: '.case-hero', start: 'top top', end: 'bottom top', scrub: 0.8 } });
    });
    const stg = $$('.tpl-stage .phone, .tts-ic, .tts-chips', sc);
    if (stg.length) gsap.from(stg, { y: 90, opacity: 0, duration: 1.1, stagger: 0.09, ease: 'power3.out', delay: first ? 0.55 : 0.2 });
  }, sc());
}
const sc = () => scroller();

export function open(id, evt, push = true, kind = 'case') {
  const tpl = kind === 'tpl';
  const p = tpl ? templateById(id) : projectById(id);
  if (!p) return;
  const list = tpl ? TEMPLATES : state.projects;
  const key = kind + '/' + id;
  const el = caseEl();
  const first = !el.classList.contains('open');
  if (ctx) { ctx.revert(); ctx = null; }
  stopReveals();
  scroller().innerHTML = tpl ? buildTemplate(p, list) : build(p, list.indexOf(p));
  scroller().scrollTop = 0;
  $('#case-count').textContent = `${pad(list.indexOf(p) + 1)} / ${pad(list.length)}`;
  $('#case-back').textContent = tpl ? '← Все шаблоны' : '← Все проекты';
  $('#case-close').setAttribute('aria-label', tpl ? 'Закрыть шаблон' : 'Закрыть проект');
  if (push && currentKey !== key) {
    if (deepStart) history.replaceState({ view: key, n: 0 }, '', '#/' + key);
    else { pushes += 1; history.pushState({ view: key, n: pushes }, '', '#/' + key); }
  }
  currentKey = key;
  document.title = tpl ? `${p.name} - шаблон - ${state.profile.name || 'foy4ik'}` : `${p.title} - ${state.profile.name || 'foy4ik'}`;
  if (first) {
    lastFocus = document.activeElement;
    freeze();
    background().forEach((n) => { n.inert = true; });
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'false');
  }
  animateIn(first, evt);
  setTimeout(() => $('#case-close').focus({ preventScroll: true }), first ? 400 : 0);
}

function finishClose() {
  const el = caseEl();
  el.classList.remove('open');
  el.setAttribute('aria-hidden', 'true');
  background().forEach((n) => { n.inert = false; });
  unfreeze();
  scroller().innerHTML = '';
  gsap.set(el, { clearProps: 'opacity,transform,clipPath' });
  document.title = `${state.profile.name || 'foy4ik'} - сайты, Telegram-боты и приложения под ключ`;
  if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
}

export function close() {
  const el = caseEl();
  if (!el.classList.contains('open')) return;
  if (ctx) { ctx.revert(); ctx = null; }
  stopReveals();
  currentKey = null; pushes = 0; deepStart = false;
  if (!motionOK()) { finishClose(); return; }
  /* finish once, whichever comes first: the tween or a safety timer (background tabs pause rAF) */
  let done = false;
  const fin = () => { if (done) return; done = true; finishClose(); };
  gsap.to(el, { opacity: 0, yPercent: 3, duration: 0.45, ease: 'power2.in', onComplete: fin });
  setTimeout(fin, 800);
}

function closeViaHistory() {
  if (pushes > 0) { const n = pushes; pushes = 0; history.go(-n); }
  else { const home = currentKey && currentKey.startsWith('tpl/') ? '#templates' : '#projects'; close(); history.replaceState(null, '', location.pathname + location.search + home); }
}

function fromHash() {
  const m = /^#\/(case|tpl)\/([\w-]+)$/.exec(location.hash);
  return m ? { kind: m[1], id: m[2] } : null;
}
const exists = (v) => v && (v.kind === 'tpl' ? templateById(v.id) : projectById(v.id));

export function render() {
  app.openCase = (id, evt) => open(id, evt, true, 'case');
  app.openTemplate = (id, evt) => open(id, evt, true, 'tpl');
  const el = caseEl();
  el.addEventListener('click', (e) => {
    if (e.target.closest('#case-back') || e.target.closest('#case-close')) { closeViaHistory(); return; }
    const lead = e.target.closest('[data-lead]');
    if (lead) { closeViaHistory(); const text = lead.dataset.prefill || ('Интересует: проект как ' + lead.dataset.lead + '. '); setTimeout(() => goToLead(text), 650); return; }
    const nx = e.target.closest('[data-next]');
    if (nx) { e.preventDefault(); open(nx.dataset.next, e, true, nx.dataset.kind || 'case'); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && el.classList.contains('open')) closeViaHistory(); });
  window.addEventListener('popstate', () => { const v = fromHash(); if (exists(v)) { pushes = (history.state && history.state.n) || 0; open(v.id, null, false, v.kind); } else close(); });
}

export function animate() {
  const v = fromHash();
  if (exists(v)) { deepStart = true; setTimeout(() => open(v.id, null, false, v.kind), 400); }
}
