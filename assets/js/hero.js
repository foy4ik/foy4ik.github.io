/* Hero: copy from profile data, interactive digital object, hero -> services scene */
import { $, $$, esc, state, mq, motionOK } from './core.js';

export function render() {
  const p = state.profile;
  const lines = String(p.heroTitle || 'Создаю сайты,\nкоторые хочется\nоткрыть ещё раз.').split(/\n/).map((s) => s.trim()).filter(Boolean);
  $('#hero-title').innerHTML = lines
    .map((l, i) => `<span class="ln"><span>${i === lines.length - 1 ? `<em>${esc(l)}</em>` : esc(l)}</span></span>`)
    .join('');
  $('#hero-status').textContent = p.available || 'Открыт для заказов';
  $('#hero-lead').textContent = p.tagline || '';
  const badges = [p.heroChip, p.heroChip2, p.location ? '📍 ' + p.location : ''].filter(Boolean);
  $('#hero-badges').innerHTML = badges.map((b) => `<span>${esc(b)}</span>`).join('');

  /* the browser window in the hero shows a real project */
  const first = state.projects.find((x) => x.images && x.images.length);
  if (first) {
    const img = $('#ho-img');
    if (img.getAttribute('src') !== first.images[0]) img.src = first.images[0];
    try {
      const u = new URL(first.link);
      $('#ho-url').textContent = u.host + (u.pathname !== '/' ? u.pathname.replace(/\/$/, '') : '');
    } catch (e) { $('#ho-url').textContent = first.title.toLowerCase(); }
  }
}

export function animate() {
  const hero = $('#hero');
  const stage = $('#hero-stage');
  const object = $('#hero-object');
  const tilt = $('#ho-tilt');
  const layers = $$('.ho-layer', tilt);

  /* stop the idle float when the hero is not visible */
  new IntersectionObserver(([e]) => hero.classList.toggle('paused', !e.isIntersecting), { threshold: 0 }).observe(hero);

  if (!motionOK()) return;

  /* intro */
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.from('#hero-pill', { y: 16, opacity: 0, duration: 0.8 }, 0.1)
    .from('#hero-title .ln > span', { yPercent: 112, duration: 1.2, stagger: 0.12 }, 0.2)
    .from('#hero-lead, #hero-badges, .hero-cta', { y: 22, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.7)
    .from(object, { scale: 0.92, y: 40, opacity: 0, duration: 1.4 }, 0.35)
    .from(layers.slice(1), { scale: 0.7, opacity: 0, duration: 1, stagger: 0.1, ease: 'back.out(1.6)' }, 0.9);

  /* cursor reaction: tilt, depth, glow */
  if (mq.fine.matches && mq.wide.matches) {
    const rx = gsap.quickTo(tilt, 'rotationX', { duration: 0.9, ease: 'power3' });
    const ry = gsap.quickTo(tilt, 'rotationY', { duration: 0.9, ease: 'power3' });
    const lx = layers.map((l) => gsap.quickTo(l, 'x', { duration: 1.1, ease: 'power3' }));
    const ly = layers.map((l) => gsap.quickTo(l, 'y', { duration: 1.1, ease: 'power3' }));
    let raf = 0;
    hero.addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = hero.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
        ry(nx * 9); rx(-ny * 7);
        layers.forEach((l, i) => { const d = +l.dataset.depth || 0; lx[i](nx * d * 14); ly[i](ny * d * 10); });
        const o = object.getBoundingClientRect();
        object.style.setProperty('--mx', ((e.clientX - o.left) / o.width) * 100 + '%');
        object.style.setProperty('--my', ((e.clientY - o.top) / o.height) * 100 + '%');
      });
    });
    hero.addEventListener('pointerleave', () => { rx(0); ry(0); lx.forEach((f) => f(0)); ly.forEach((f) => f(0)); });
  }

  /* HERO -> SERVICES as one scene: the hero recedes while services slide over it.
     Built after the intro so both never fight over the same properties. */
  const buildScene = () => {
    const services = $('#services');
    if (mq.wide.matches && services) {
      const scene = gsap.timeline({
        scrollTrigger: {
          trigger: services, start: 'top bottom', end: 'top 12%', scrub: true,
          onLeave: () => { hero.style.visibility = 'hidden'; },
          onEnterBack: () => { hero.style.visibility = 'visible'; },
        },
      });
      scene
        .to(stage, { scale: 0.92, yPercent: -2.5, transformOrigin: '50% 40%', ease: 'none' }, 0)
        .to('#hero-copy', { y: -80, opacity: 0.2, ease: 'none' }, 0)
        .to(object, { scale: 0.74, y: 70, ease: 'none' }, 0)
        .to(layers.slice(1), {
          yPercent: (i) => 60 + i * 30, xPercent: (i) => (i % 2 ? -30 : 30), scale: 0.7, opacity: 0, ease: 'none', stagger: 0.04,
        }, 0)
        .to('#hero-dim', { opacity: 0.8, ease: 'none' }, 0);
    } else {
      gsap.to('#hero-copy', { y: -30, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    }
  };
  if (tl.progress() < 1) tl.eventCallback('onComplete', buildScene); else buildScene();
}
