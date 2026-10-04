/* Services: large physical cards (tilt, depth, magnetic CTA), dimming siblings, "Обсудить" prefill */
import { $, $$, esc, state, nb, pad, mq, motionOK, goToLead, projectById, app } from './core.js';

export function render() {
  const grid = $('#svc-grid');
  const list = state.services;
  grid.innerHTML = list.map((s, i) => {
    const inc = (Array.isArray(s.includes) ? s.includes : []).filter(Boolean);
    const linked = s.projectId && projectById(s.projectId);
    return `
    <article class="svc" data-id="${esc(s.id)}">
      <div class="svc-bgnum" data-depth="-1.2" aria-hidden="true">${pad(i + 1)}</div>
      <div class="svc-top" data-depth="0.6"><span class="svc-no">${pad(i + 1)} / ${pad(list.length)}</span>${s.emoji ? `<span class="svc-emoji" aria-hidden="true">${esc(s.emoji)}</span>` : ''}</div>
      <h3 data-depth="1.1">${esc(s.title)}</h3>
      ${s.audience ? `<p class="svc-for" data-depth="0.8"><b>Для кого</b>${esc(s.audience)}</p>` : ''}
      ${inc.length ? `<ul class="svc-inc" data-depth="0.5">${inc.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
      ${s.note ? `<p class="svc-note">${esc(s.note)}</p>` : ''}
      ${linked ? `<button type="button" class="svc-example" data-project="${esc(s.projectId)}">Пример работы →</button>` : ''}
      <div class="svc-foot">
        <div class="svc-price" data-depth="0.9">${esc(nb(s.price || ''))}${s.term ? `<small>${esc(nb(s.term))}</small>` : ''}</div>
        <button type="button" class="svc-go" data-magnetic data-title="${esc(s.title)}" aria-label="Обсудить: ${esc(s.title)}">Обсудить <i aria-hidden="true">→</i></button>
      </div>
    </article>`;
  }).join('');
  $('#services').hidden = list.length === 0;

  grid.addEventListener('click', (e) => {
    const ex = e.target.closest('.svc-example');
    if (ex) { app.openCase && app.openCase(ex.dataset.project, e); return; }
    const go = e.target.closest('.svc-go');
    if (go) goToLead('Интересует: ' + go.dataset.title + '. ');
  });
  $('#svc-custom-btn').addEventListener('click', () => goToLead(''));
}

export function animate() {
  const cards = $$('.svc');
  if (!cards.length || !motionOK()) return;

  /* arrival: cards tip up from below */
  cards.forEach((card) => {
    gsap.from(card, { y: 70, rotationX: -10, opacity: 0, duration: 1.1, ease: 'power3.out', transformOrigin: '50% 100%', clearProps: 'opacity', scrollTrigger: { trigger: card, start: 'top 92%', once: true } });
  });

  /* physical tilt with spring-like easing + inner parallax */
  if (!mq.fine.matches) return;
  cards.forEach((card) => {
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.8, ease: 'power3' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.8, ease: 'power3' });
    const sc = gsap.quickTo(card, 'scale', { duration: 0.6, ease: 'power3' });
    const deep = $$('[data-depth]', card).map((el) => ({
      d: +el.dataset.depth, x: gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3' }),
    }));
    let raf = 0;
    card.addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width; const py = (e.clientY - r.top) / r.height;
        ry((px - 0.5) * 9); rx(-(py - 0.5) * 7); sc(1.018);
        deep.forEach(({ d, x, y }) => { x((px - 0.5) * d * 12); y((py - 0.5) * d * 9); });
        card.style.setProperty('--mx', px * 100 + '%'); card.style.setProperty('--my', py * 100 + '%');
      });
    });
    card.addEventListener('pointerleave', () => { rx(0); ry(0); sc(1); deep.forEach(({ x, y }) => { x(0); y(0); }); });
  });
}
