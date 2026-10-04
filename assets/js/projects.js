/* Projects: pinned scene, vertical scroll drives horizontal movement, screenshots pan inside browser frames */
import { $, $$, esc, state, pad, mq, app, clamp } from './core.js';

const sizes = new Map(); // src -> {w,h}

function measure(src) {
  if (!src) return Promise.resolve(null);
  if (sizes.has(src)) return Promise.resolve(sizes.get(src));
  return new Promise((resolve) => {
    const im = new Image();
    const done = (v) => { if (v) sizes.set(src, v); resolve(v); };
    im.onload = () => done({ w: im.naturalWidth, h: im.naturalHeight });
    im.onerror = () => done(null);
    setTimeout(() => done(null), 1800);
    im.src = src;
  });
}

function frame(src, alt, kind, portrait, first) {
  if (!src) return '';
  const sz = sizes.get(src);
  const dim = sz ? ` width="${sz.w}" height="${sz.h}"` : '';
  const img = `<img src="${esc(src)}" alt="${esc(alt)}"${dim} ${first ? 'loading="eager"' : 'loading="lazy"'} decoding="async">`;
  return portrait
    ? `<div class="frame phone ${kind}"><div class="view">${img}</div></div>`
    : `<div class="frame ${kind}"><div class="bar"><i></i><i></i><i></i></div><div class="view">${img}</div></div>`;
}

export async function render() {
  const list = state.projects;
  const track = $('#proj-track');
  $$('.proj', track).forEach((n) => n.remove());
  await Promise.all(list.flatMap((p) => [measure(p.images && p.images[0]), measure(p.images && p.images[1])]));

  track.insertAdjacentHTML('beforeend', list.map((p, i) => {
    const imgs = p.images || [];
    const sz = sizes.get(imgs[0]);
    const portrait = !!sz && sz.w / sz.h < 0.8;
    const type = p.badge || (p.meta || '').split(' - ')[0];
    return `
    <article class="proj" data-id="${esc(p.id)}">
      <div class="proj-copy">
        <span class="proj-idx">${pad(i + 1)} / ${pad(list.length)}</span>
        ${type ? `<span class="proj-type">${esc(type)}</span>` : ''}
        <h3>${esc(p.title)}</h3>
        ${p.tagline ? `<p class="proj-tag">${esc(p.tagline)}</p>` : ''}
        ${p.description ? `<p class="proj-desc">${esc(p.description)}</p>` : ''}
        <ul class="proj-tech">${(p.tags || []).slice(0, 6).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        <a class="btn btn-accent" href="#/case/${esc(p.id)}" data-case="${esc(p.id)}" data-cursor="VIEW" data-magnetic>Смотреть проект <span class="arr">→</span></a>
      </div>
      <div class="proj-visual" data-case="${esc(p.id)}" data-cursor="VIEW">
        ${imgs[1] ? frame(imgs[1], '', 'back', portrait, false) : ''}
        ${frame(imgs[0], `Скриншот проекта ${p.title}`, 'front', portrait, i < 2)}
      </div>
    </article>`;
  }).join('') || '');

  $('#projects').hidden = list.length === 0;
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-case]');
    if (!t || !app.openCase) return;
    e.preventDefault();
    app.openCase(t.dataset.case, e);
  });
}

export function animate() {
  const pin = $('#proj-pin'); const track = $('#proj-track'); const panels = $$('.proj', track);
  if (!panels.length) return;
  const mm = gsap.matchMedia();

  mm.add('(min-width:1024px) and (prefers-reduced-motion: no-preference)', () => {
    const maxX = () => Math.max(0, track.scrollWidth - innerWidth);
    const bar = $('#proj-bar'); const count = $('#proj-count');
    const total = panels.length;
    const tween = gsap.to(track, {
      x: () => -maxX(), ease: 'none',
      scrollTrigger: {
        trigger: pin, pin: true, scrub: 0.7, start: 'top top', end: () => '+=' + maxX(), invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (self) => {
          gsap.set(bar, { scaleX: self.progress });
          const x = -gsap.getProperty(track, 'x') + innerWidth * 0.5 - $('#proj-intro').offsetWidth;
          const idx = clamp(Math.floor(x / innerWidth) + 1, 0, total);
          count.textContent = `${pad(Math.max(idx, 1))} / ${pad(total)}`;
        },
      },
    });

    panels.forEach((p) => {
      const trig = { trigger: p, containerAnimation: tween, start: 'left 85%', end: 'right 15%', scrub: true, invalidateOnRefresh: true };
      const front = $('.frame.front', p); const back = $('.frame.back', p); const copy = $('.proj-copy', p);
      const img = front && $('img', front); const view = front && $('.view', front);
      if (img && view) {
        gsap.set(img, { scale: 1.1, transformOrigin: '50% 0%' });
        gsap.fromTo(img, { y: 0 }, { y: () => -Math.max(0, img.offsetHeight * 1.1 - view.clientHeight), ease: 'none', scrollTrigger: trig });
      }
      if (back) gsap.fromTo(back, { xPercent: 14, yPercent: 4 }, { xPercent: -10, yPercent: -3, ease: 'none', scrollTrigger: trig });
      if (front) gsap.fromTo(front, { xPercent: -3 }, { xPercent: 3, ease: 'none', scrollTrigger: trig });
      if (copy) gsap.fromTo(copy, { x: 70, opacity: 0.2 }, { x: 0, opacity: 1, ease: 'none', scrollTrigger: { ...trig, end: 'left 35%' } });
    });

    /* keyboard: focusing a link in an off-screen panel scrolls the pinned scene to it */
    panels.forEach((p) => p.addEventListener('focusin', () => {
      const st = tween.scrollTrigger; if (!st) return;
      const prog = clamp(p.offsetLeft / Math.max(1, maxX()), 0, 1);
      const y = st.start + prog * (st.end - st.start);
      app.lenis ? app.lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y);
    }));
  });

  mm.add('(max-width:1023px), (prefers-reduced-motion: reduce)', () => {
    if (mq.reduce.matches) return;
    panels.forEach((p) => {
      gsap.from($('.proj-visual', p), { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: p, start: 'top 85%', once: true } });
      gsap.from($('.proj-copy', p), { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: p, start: 'top 70%', once: true } });
    });
  });
}
