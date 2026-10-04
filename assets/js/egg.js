/* Easter egg: "Built with curiosity + code." reveals the technical layer (what is really under the hood) */
import { $ } from './core.js';

export function animate() {
  const btn = $('#egg'); const card = $('#xray-card');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const on = !document.documentElement.classList.contains('xray');
    document.documentElement.classList.toggle('xray', on);
    card.classList.toggle('open', on);
    btn.setAttribute('aria-expanded', String(on));
  });
}
