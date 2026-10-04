/* Process: six stages, short terminal sequence. Decorative, fast, not a fake shell. */
import { $, $$, esc, sleep, motionOK, mq } from './core.js';

const STAGES = [
  { k: 'IDEA', d: 'Обсуждаем задачу', lines: [['cmd', 'brief --discuss'], ['ok', '✓ задача, срок и цена согласованы']] },
  { k: 'DESIGN', d: 'Структура и визуал', lines: [['cmd', 'design --preview'], ['ok', '✓ структура и макет готовы']] },
  { k: 'DEVELOPMENT', d: 'Пишу код', lines: [['cmd', 'npm run build'], ['out', 'Building...'], ['bar'], ['ok', '✓ BUILD SUCCESSFUL']] },
  { k: 'AI / AUTOMATION', d: 'Подключаю ИИ и автоматизацию', lines: [['cmd', 'automate --leads --notify'], ['ok', '✓ заявки и уведомления подключены']] },
  { k: 'DEPLOY', d: 'Выкладываю в сеть', lines: [['cmd', 'deploy --prod'], ['ok', '✓ DEPLOYED']] },
  { k: 'LIVE', d: 'Показываю в работе', lines: [['out', '● live   your-project.ru'], ['ok', '✓ готово к показу, оплата после демо']] },
];

let token = 0;

export function render() {
  $('#stages').innerHTML = STAGES.map((s, i) => `
    <button type="button" class="stage" role="listitem" data-i="${i}">
      <span class="no">0${i + 1}</span><b>${esc(s.k)}</b><small>${esc(s.d)}</small>
    </button>`).join('');
}

const body = () => $('#term-body');
function line(cls, html) { const el = document.createElement('span'); el.className = 'ln ' + cls; el.innerHTML = html; body().append(el); return el; }

async function typeCmd(text, my) {
  const el = line('', `<span class="p">$</span> <span class="t"></span><span class="cur"></span>`);
  const t = $('.t', el);
  for (const ch of text) { if (my !== token) return false; t.textContent += ch; await sleep(motionOK() ? 22 : 0); }
  $('.cur', el).remove();
  return true;
}

async function runStage(i, my, instant) {
  const s = STAGES[i];
  for (const [kind, text] of s.lines) {
    if (my !== token) return false;
    if (kind === 'cmd') { if (instant) line('', `<span class="p">$</span> ${esc(text)}`); else if (!(await typeCmd(text, my))) return false; }
    else if (kind === 'out') { line('m', esc(text)); if (!instant) await sleep(260); }
    else if (kind === 'ok') { line('g', esc(text)); if (!instant) await sleep(320); }
    else if (kind === 'bar') {
      const el = line('', '');
      if (instant) el.textContent = '████████████ 100%';
      else for (let n = 0; n <= 12; n++) { if (my !== token) return false; el.textContent = '█'.repeat(n) + '░'.repeat(12 - n) + ' ' + Math.round((n / 12) * 100) + '%'; await sleep(55); }
    }
  }
  return true;
}

function mark(i) {
  $$('.stage').forEach((b, n) => { b.classList.toggle('on', n === i); b.classList.toggle('done', n < i); });
}

async function playAll() {
  const my = ++token;
  body().innerHTML = '';
  const instant = !motionOK();
  for (let i = 0; i < STAGES.length; i++) {
    mark(i);
    if (!(await runStage(i, my, instant))) return;
    if (!instant) await sleep(180);
  }
}

async function playOne(i) {
  const my = ++token;
  body().innerHTML = '';
  mark(i);
  await runStage(i, my, !motionOK());
}

export function animate() {
  $$('.stage').forEach((b) => b.addEventListener('click', () => playOne(+b.dataset.i)));
  if (!motionOK()) { playAll(); return; }
  ScrollTrigger.create({ trigger: '#process', start: 'top 60%', once: true, onEnter: playAll });
}
