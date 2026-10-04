/* Contacts: one big field, keyword tags while typing, "IDEA RECEIVED" state, real contact links */
import { $, $$, esc, state, motionOK, sleep } from './core.js';

const ENDPOINT = 'https://formspree.io/f/myeyrbob';
const L = '(?<![a-zа-яё0-9])'; const R = '(?![a-zа-яё0-9])';
/* simple keyword rules, no AI involved */
const RULES = [
  ['WEBSITE', new RegExp(`сайт|лендинг|landing|website|страниц|интернет-магазин|каталог|вёрстк|верстк`, 'i')],
  ['BOT', new RegExp(`бот|${L}bot${R}|telegram|телеграм|${L}max${R}|${L}vk${R}|${L}вк${R}|мини-?апп`, 'i')],
  ['AI', new RegExp(`${L}ии${R}|${L}ai${R}|нейро|gpt|claude|агент|искусственн`, 'i')],
  ['WEB APP', new RegExp(`веб-?приложен|web ?app|кабинет|saas|дашборд|админ|сервис`, 'i')],
  ['DESIGN', new RegExp(`дизайн|design|макет|figma|${L}ui${R}|${L}ux${R}`, 'i')],
  ['AUTOMATION', new RegExp(`автоматиз|рутин|скрипт|интеграц|${L}crm${R}|таблиц|excel|уведомлен`, 'i')],
  ['PARSER', new RegExp(`парс|parser|скрап|мониторинг|выгрузк`, 'i')],
  ['MOTION', new RegExp(`анимац|motion|эффект|интерактив`, 'i')],
  ['MOBILE', new RegExp(`мобильн|${L}ios${R}|android|андроид`, 'i')],
  ['DESKTOP', new RegExp(`десктоп|desktop|windows|программ`, 'i')],
];

function handleOf(url, fallback) {
  try { const u = new URL(url); return u.pathname.split('/').filter(Boolean).pop() || fallback; } catch (e) { return fallback; }
}

export function render() {
  const p = state.profile;
  const items = [
    p.telegram && ['Telegram', '@' + handleOf(p.telegram, 'foy4ik'), p.telegram],
    p.email && ['Email', p.email, 'mailto:' + p.email],
    p.kwork && ['Kwork', handleOf(p.kwork, 'profile'), p.kwork],
    p.github && ['GitHub', handleOf(p.github, 'foy4ik'), p.github],
  ].filter(Boolean);
  $('#contacts').innerHTML = items.map(([k, t, href]) => `<a class="cl" href="${esc(href)}"${href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}><small>${k}</small><b>${esc(t)}</b></a>`).join('');
}

export function animate() {
  const form = $('#idea-form'); const ta = $('#lead-message'); const fields = $('#idea-fields');
  const tagsBox = $('#idea-tags'); const tagsInput = $('#idea-tags-input'); const err = $('#idea-error');
  let shown = [];

  const grow = () => { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 340) + 'px'; ta.style.overflowY = ta.scrollHeight > 340 ? 'auto' : 'hidden'; };
  const detect = () => {
    const v = ta.value;
    const found = RULES.filter(([, re]) => re.test(v)).map(([k]) => k);
    tagsInput.value = found.join(', ');
    shown.filter((k) => !found.includes(k)).forEach((k) => {
      const el = tagsBox.querySelector(`[data-k="${k}"]`);
      if (el) { motionOK() ? gsap.to(el, { scale: 0.6, opacity: 0, duration: 0.25, onComplete: () => el.remove() }) : el.remove(); }
    });
    found.filter((k) => !shown.includes(k)).forEach((k) => {
      const el = document.createElement('span'); el.className = 'tag'; el.dataset.k = k; el.textContent = k;
      tagsBox.append(el);
      if (motionOK()) gsap.from(el, { scale: 0.4, y: 14, opacity: 0, rotation: () => gsap.utils.random(-8, 8), duration: 0.7, ease: 'back.out(2.2)' });
    });
    shown = found;
  };
  ta.addEventListener('input', () => {
    grow(); detect();
    const has = ta.value.trim().length > 0;
    if (has && fields.hidden) { fields.hidden = false; if (motionOK()) gsap.from(fields, { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out' }); }
    err.hidden = true;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#lead-name').value.trim(); const contact = $('#lead-contact').value.trim();
    if (!ta.value.trim()) { err.textContent = 'Опишите идею в поле выше.'; err.hidden = false; ta.focus(); return; }
    if (!name || !contact) { err.textContent = 'Укажите имя и как с вами связаться.'; err.hidden = false; (name ? $('#lead-contact') : $('#lead-name')).focus(); return; }
    err.hidden = true;
    const btn = $('#idea-submit'); btn.disabled = true;
    form.action = ENDPOINT; form.method = 'POST';
    form.submit(); // goes to a hidden iframe: the page does not reload
    await sleep(900);
    $('#idea').classList.add('is-sent');
    const sent = $('#idea-sent');
    if (motionOK()) {
      gsap.from(sent, { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' });
      gsap.from('#contacts .cl', { y: 24, opacity: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out', delay: 0.2 });
    }
    form.reset(); shown = []; tagsBox.innerHTML = ''; fields.hidden = true; btn.disabled = false; grow();
  });
}
