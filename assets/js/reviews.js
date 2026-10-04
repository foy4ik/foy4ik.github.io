/* Reviews: only real ones (from data). Draggable stack with inertia on desktop, scroll-snap carousel on phones. */
import { $, $$, esc, state, mq, pad, motionOK, clamp } from './core.js';

let cards = []; let order = []; let busy = false; let live = false;

export function render() {
  const list = state.reviews;
  $('#reviews').hidden = list.length === 0;
  if (!list.length) return;
  $('#rev-stack').innerHTML = list.map((r) => `
    <article class="rev">
      <span class="q" aria-hidden="true">“</span>
      <p class="t">${esc(r.text)}</p>
      <p class="who"><b>${esc(r.author || '')}</b>${r.role ? ', ' + esc(r.role) : ''}${r.link ? ` · <a href="${esc(r.link)}" target="_blank" rel="noopener" style="color:var(--accent)">источник</a>` : ''}</p>
    </article>`).join('');
  cards = $$('.rev', $('#rev-stack'));
  order = cards.map((_, i) => i);
  $('#rev-ctl').hidden = list.length < 2;
}

const w = () => $('#rev-stack').offsetWidth;
function counter() { $('#rev-no').textContent = `${pad(order[0] + 1)} / ${pad(cards.length)}`; }

function layout(animated = true) {
  order.forEach((idx, k) => {
    const c = cards[idx];
    gsap.to(c, {
      x: 0, y: k * 18, scale: 1 - k * 0.045, rotation: k === 0 ? 0 : (k % 2 ? 1 : -1) * (1.5 + k * 0.6), opacity: k > 3 ? 0 : 1, '--shade': Math.min(k * 0.2, 0.6),
      zIndex: cards.length - k, duration: animated ? 0.7 : 0, ease: 'power3.out', overwrite: 'auto',
    });
  });
  counter();
}

function next(dir = 1) {
  if (busy || cards.length < 2) return;
  busy = true;
  const top = cards[order[0]];
  gsap.to(top, {
    x: dir * (w() + 200), rotation: dir * 16, opacity: 0, duration: 0.55, ease: 'power2.in',
    onComplete: () => { order.push(order.shift()); gsap.set(top, { x: 0, rotation: 0 }); layout(); busy = false; },
  });
}
function prev() {
  if (busy || cards.length < 2) return;
  busy = true;
  order.unshift(order.pop());
  const top = cards[order[0]];
  gsap.set(top, { x: -(w() + 200), rotation: -16, opacity: 0, zIndex: cards.length + 1 });
  layout();
  gsap.to(top, { x: 0, rotation: 0, opacity: 1, duration: 0.7, ease: 'power3.out', onComplete: () => { busy = false; } });
}

function enable() {
  if (live || !cards.length) return;
  live = true;
  layout(false);
  const stack = $('#rev-stack');
  stack.tabIndex = 0;
  stack.setAttribute('aria-label', 'Отзывы, листайте стрелками');
  let sx = 0; let last = 0; let lastT = 0; let vx = 0; let drag = false; let el = null;

  stack.addEventListener('pointerdown', (e) => {
    if (busy || cards.length < 2 || e.button > 0) return;
    el = cards[order[0]]; if (!e.target.closest('.rev') || e.target.closest('a')) return;
    drag = true; sx = last = e.clientX; lastT = performance.now(); vx = 0;
    stack.setPointerCapture(e.pointerId);
    gsap.killTweensOf(el);
  });
  stack.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - sx; const now = performance.now();
    vx = (e.clientX - last) / Math.max(1, now - lastT); last = e.clientX; lastT = now;
    gsap.set(el, { x: dx, rotation: dx * 0.05 });
  });
  const release = () => {
    if (!drag) return; drag = false;
    const dx = gsap.getProperty(el, 'x');
    if (Math.abs(dx) > 110 || Math.abs(vx) > 0.7) {
      busy = true;
      const dir = dx > 0 ? 1 : -1;
      gsap.to(el, { x: dir * (w() + 240), rotation: dir * 18, opacity: 0, duration: clamp(0.5 - Math.abs(vx) * 0.12, 0.28, 0.5), ease: 'power2.out',
        onComplete: () => { order.push(order.shift()); gsap.set(el, { x: 0, rotation: 0 }); layout(); busy = false; } });
    } else {
      gsap.to(el, { x: 0, rotation: 0, duration: 0.9, ease: 'elastic.out(1,.55)' });
    }
  };
  stack.addEventListener('pointerup', release);
  stack.addEventListener('pointercancel', release);
  stack.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); next(-1); } if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); } });
  $('#rev-next').addEventListener('click', () => next(-1));
  $('#rev-prev').addEventListener('click', prev);
}

function disable() {
  if (!live) return;
  live = false;
  gsap.set(cards, { clearProps: 'all' });
}

export function animate() {
  if (!cards.length) return;
  const sync = () => { (mq.phone.matches || !motionOK()) ? disable() : enable(); };
  sync();
  mq.phone.addEventListener('change', sync);
  if (motionOK() && !mq.phone.matches) {
    gsap.from(cards, { y: 80, opacity: 0, rotation: (i) => (i % 2 ? 6 : -6), duration: 1, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: '#rev-stack', start: 'top 85%', once: true } });
  }
}
