/* About: bio from profile data + a stack that demonstrates technologies instead of listing them */
import { $, $$, esc, state, motionOK } from './core.js';

const L = (arr) => `<div class="lines">${arr.map((t, i) => `<span class="ln" style="animation-delay:${(i * 0.32).toFixed(2)}s">${t}</span>`).join('')}</div>`;

/* [matcher, label, html]. Illustrations only: no figures or claims. */
const PREVIEWS = [
  [/^claude|^ai$|^ии/i, 'AI / Claude Code', L(['<span class="m">&gt; опишите задачу своими словами</span>', '<span class="k">claude</span> пишет код под моим руководством', '<span class="g">✓ каждую функцию проверяю сам</span>', '<span class="g">✓ готово к показу</span>'])],
  [/react/i, 'UI-компонент', '<div class="card-mini"><span>Уведомления</span><span class="tgl"></span></div><div class="card-mini"><span>Тёмная тема</span><span class="tgl" style="animation-delay:-1.2s"></span></div><span class="demo-btn">Сохранить</span>'],
  [/next/i, 'app/ router', L(['app/', '&nbsp;&nbsp;layout.tsx', '&nbsp;&nbsp;page.tsx', '&nbsp;&nbsp;[slug]/page.tsx', '<span class="g">✓ ready</span>'])],
  [/typescript/i, 'type check', L(['<span class="k">const</span> price: <span class="g">number</span> = <span class="e">"2500"</span>;', '<span class="e">Type \'string\' is not assignable to \'number\'</span>', '<span class="k">const</span> price: <span class="g">number</span> = 2500;', '<span class="g">✓ no errors</span>'])],
  [/tailwind/i, 'utility classes', '<div><span class="cls">px-6</span><span class="cls">py-3</span><span class="cls">rounded-full</span><span class="cls">bg-violet-400</span></div><span class="demo-btn">Кнопка</span>'],
  [/node|api/i, 'request / response', L(['<span class="m">→</span> GET /api/status', '<span class="g">←</span> 200 OK', '<span class="m">  { "ok": true }</span>'])],
  [/python/i, 'script', L(['<span class="m">$</span> python run.py', 'читаю файлы...', 'считаю...', '<span class="g">✓ результат сохранён</span>'])],
  [/postgres|sqlite|prisma|sql/i, 'database', L(['<span class="k">INSERT INTO</span> orders (item, status)', '<span class="k">VALUES</span> (<span class="g">\'order\'</span>, <span class="g">\'new\'</span>);', '<span class="g">✓ 1 row inserted</span>'])],
  [/telegram/i, 'telegram bot', '<div class="row-gap"><div class="bub me ln" style="animation-delay:0s">/start</div><div class="bub ln" style="animation-delay:.45s">Привет! Чем помочь?</div><div class="ho-times ln" style="animation-delay:.9s"><span>Заказать</span><span>Вопрос</span><span>Цены</span></div></div>'],
  [/rust|tauri/i, 'desktop window', '<div class="win"><aside><i></i><i></i><i></i></aside><main><i style="width:90%"></i><i style="width:70%"></i><i style="width:80%"></i></main></div>'],
  [/vercel|github|actions|deploy/i, 'deploy', L(['<span class="g">✓</span> build', '<span class="g">✓</span> tests', '<span class="g">✓</span> deployed'])],
];

function usedIn(tech) {
  const stop = ['api', 'bot', 'css', 'code', 'the', 'actions'];
  const toks = tech.toLowerCase().split(/[^a-z0-9.#а-я]+/).filter((t) => t.length >= 3 && !stop.includes(t));
  if (!toks.length) return [];
  return state.projects
    .filter((p) => (p.tags || []).some((tag) => toks.some((t) => tag.toLowerCase().includes(t))))
    .map((p) => p.title);
}

function pluralProjects(n) {
  const a = n % 10; const b = n % 100;
  const w = a === 1 && b !== 11 ? 'проект' : [2, 3, 4].includes(a) && ![12, 13, 14].includes(b) ? 'проекта' : 'проектов';
  return `${n} ${w} в портфолио`;
}

export function render() {
  const p = state.profile;
  $('#about-bio').innerHTML = String(p.bio || '').split(/\n\s*\n/).filter(Boolean).map((t) => `<p>${esc(t.trim())}</p>`).join('');
  $('#about-steps').innerHTML = (p.steps || []).map((s) => `<li>${esc(s)}</li>`).join('');
  $('#about-steps').hidden = !(p.steps || []).length;
  $('#about-risk').textContent = p.riskLine || '';
  $('#about-risk').hidden = !p.riskLine;
  $('#stat-projects').textContent = pluralProjects(state.projects.length);

  $('#stack-head').textContent = p.stackTitle || 'Любой';
  $('#stack-note').textContent = p.stackText || '';
  $('#stack-limits').textContent = (p.limits || []).length ? 'Нюансы: ' + p.limits.join('; ') + '.' : '';

  const techs = ['Claude Code', ...Object.values(p.skills || {}).flat().filter(Boolean)];
  $('#stack-chips').innerHTML = techs.map((t, i) => `<button type="button" role="listitem" class="chip${i === 0 ? ' ai on' : ''}" data-tech="${esc(t)}" aria-pressed="${i === 0}">${esc(t)}</button>`).join('');
  show(techs[0]);
  const chips = $$('.chip', $('#stack-chips'));
  const select = (chip) => { chips.forEach((c) => { c.classList.toggle('on', c === chip); c.setAttribute('aria-pressed', String(c === chip)); }); show(chip.dataset.tech); };
  chips.forEach((c) => {
    c.addEventListener('click', () => select(c));
    c.addEventListener('focus', () => select(c));
    c.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') select(c); });
  });
}

function show(tech) {
  const hit = PREVIEWS.find(([re]) => re.test(tech));
  const used = usedIn(tech);
  const body = hit ? hit[2] : `<div class="stack-head" style="margin:0">${esc(tech)}</div>`;
  $('#stack-pv').innerHTML = `<div class="pv-title"><span>${esc(hit ? hit[1] : 'технология')}</span><span>${esc(tech)}</span></div>${body}${used.length ? `<p class="pv-used">В проектах: <b>${esc(used.join(', '))}</b></p>` : ''}`;
}

export function animate() {
  if (!motionOK()) return;
  gsap.from('#stack-chips .chip', { y: 18, opacity: 0, scale: 0.9, duration: 0.7, ease: 'back.out(1.7)', stagger: 0.04, scrollTrigger: { trigger: '#stack-chips', start: 'top 88%', once: true } });
}
