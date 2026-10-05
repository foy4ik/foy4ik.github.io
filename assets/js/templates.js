/* Templates section: compact tiles, tilt + dimming siblings, click opens the full-screen template view */
import { $, $$, esc, pad, mq, motionOK, goToLead, app } from './core.js';
import { TEMPLATES } from './templates-data.js';
import { tplIcon, priceText, termText, kindOf } from './tpl-ui.js';

export function render() {
  const grid = $('#tpl-grid');
  const total = TEMPLATES.length;
  $('#templates').hidden = total === 0;
  grid.innerHTML = TEMPLATES.map((t, i) => `
    <a class="tpl" href="#/tpl/${esc(t.id)}" data-tpl="${esc(t.id)}" data-cursor="OPEN">
      <span class="tpl-bgnum" aria-hidden="true">${pad(i + 1)}</span>
      <span class="tpl-top" data-depth="0.6"><span class="tpl-no">${pad(i + 1)} / ${pad(total)}</span><span class="tpl-ic">${tplIcon(t.icon)}</span></span>
      <h3 data-depth="1">${esc(t.title)}</h3>
      <p class="tpl-for" data-depth="0.7">${esc(t.audience)}</p>
      <span class="tpl-foot" data-depth="0.8">
        <span class="tpl-kind">${esc(kindOf(t))}</span>
        <span class="tpl-price">${esc(priceText(t))}</span>
        <i class="tpl-go" aria-hidden="true">→</i>
      </span>
    </a>`).join('');

  grid.addEventListener('click', (e) => {
    const a = e.target.closest('.tpl');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
    e.preventDefault();
    app.openTemplate && app.openTemplate(a.dataset.tpl, e);
  });
  $('#tpl-custom-btn').addEventListener('click', () => goToLead('Интересует: решение под мою задачу. '));
}

export function animate() {
  const tiles = $$('.tpl');
  if (!tiles.length || !motionOK()) return;

  /* arrival: tiles rise in a soft wave */
  gsap.from(tiles, {
    y: 50, rotationX: -8, duration: 0.95, ease: 'power3.out', transformOrigin: '50% 100%', clearProps: 'opacity,transform',
    opacity: 0, stagger: { each: 0.06, from: 'start' },
    scrollTrigger: { trigger: '#tpl-grid', start: 'top 88%', once: true },
  });

  if (!mq.fine.matches) return;
  tiles.forEach((tile) => {
    const rx = gsap.quickTo(tile, 'rotationX', { duration: 0.8, ease: 'power3' });
    const ry = gsap.quickTo(tile, 'rotationY', { duration: 0.8, ease: 'power3' });
    const deep = $$('[data-depth]', tile).map((el) => ({ d: +el.dataset.depth, x: gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3' }) }));
    let raf = 0;
    tile.addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = tile.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width; const py = (e.clientY - r.top) / r.height;
        ry((px - 0.5) * 8); rx(-(py - 0.5) * 6);
        deep.forEach(({ d, x, y }) => { x((px - 0.5) * d * 8); y((py - 0.5) * d * 6); });
        tile.style.setProperty('--mx', px * 100 + '%'); tile.style.setProperty('--my', py * 100 + '%');
      });
    });
    tile.addEventListener('pointerleave', () => { rx(0); ry(0); deep.forEach(({ x, y }) => { x(0); y(0); }); });
  });
}
