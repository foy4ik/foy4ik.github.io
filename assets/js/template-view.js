/* Template page markup (shown inside the shared full-screen case overlay) */
import { esc, pad } from './core.js';
import { TEMPLATES } from './templates-data.js';
import { tplIcon, priceText, termText } from './tpl-ui.js';

const img = (s, extra = '') => `<img src="${esc(s.src)}" alt="${esc(s.alt)}" width="${s.w}" height="${s.h}" decoding="async"${extra}>`;

/* first screen of the page: real screenshots when the template has them, a typographic stage otherwise */
function stage(t) {
  const shots = t.shots || [];
  if (t.shotKind === 'phone' && shots.length) {
    const [a, b, c] = [shots[0], shots[1] || shots[0], shots[2] || shots[1] || shots[0]];
    return `<div class="tpl-stage tpl-phones-stage" aria-hidden="false">
      <div class="phone ps-l" data-par="-0.5"><div class="pv" data-pan>${img(b)}</div></div>
      <div class="phone ps-c" data-par="0.35"><div class="pv" data-pan>${img(a)}</div></div>
      <div class="phone ps-r" data-par="-0.8"><div class="pv" data-pan>${img(c)}</div></div>
    </div>`;
  }
  if (t.shotKind === 'browser' && shots.length) {
    return `<div class="tpl-stage tpl-browser-stage"><div class="tb"><div class="bar"><i></i><i></i><i></i></div><div class="tbv" data-pan>${img(shots[0])}</div></div></div>`;
  }
  return `<div class="tpl-stage tpl-type-stage">
    <span class="tts-no" aria-hidden="true">${pad(TEMPLATES.indexOf(t) + 1)}</span>
    <div class="tts-ic" data-par="0.3">${tplIcon(t.icon)}</div>
    <ul class="tts-chips">${t.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
  </div>`;
}

function screens(t, no) {
  const shots = t.shots || [];
  if (t.shotKind === 'phone' && shots.length) {
    return `<section class="case-block"><p class="eyebrow">${no} / Экраны</p><h3 class="t">Интерфейс</h3>
      <div class="tpl-phones" style="margin-top:30px">${shots.map((s) => `<figure class="phone-fig"><div class="phone"><div class="pv" data-pan>${img(s, ' loading="lazy"')}</div></div><figcaption>${esc(s.alt)}</figcaption></figure>`).join('')}</div>
      <p class="tpl-note">Скриншоты демо-версии шаблона</p></section>`;
  }
  if (t.shotKind === 'browser' && shots.length) {
    return `<section class="case-block"><p class="eyebrow">${no} / Экраны</p><h3 class="t">Интерфейс</h3>
      <div class="tpl-browsers" style="margin-top:30px">${shots.slice(1).map((s) => `<figure class="tb-fig"><div class="tb"><div class="bar"><i></i><i></i><i></i></div><div class="tbv" data-pan>${img(s, ' loading="lazy"')}</div></div><figcaption>${esc(s.alt)}</figcaption></figure>`).join('')}</div>
      <p class="tpl-note">Скриншоты демо-версии шаблона</p></section>`;
  }
  return `<section class="case-block"><p class="eyebrow">${no} / Демо</p><h3 class="t">Что можно будет посмотреть</h3>
    <ul class="case-tech" style="margin-top:30px">${t.screensList.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
    ${t.demo ? '' : '<p class="tpl-note">Демо-версия появится после запуска на сервере</p>'}</section>`;
}

export function build(t, list) {
  const index = list.indexOf(t);
  const next = list[(index + 1) % list.length];
  let n = 1;
  const no = () => pad(++n);
  const links = [
    t.demo ? `<a class="btn btn-accent" href="${esc(t.demo)}" target="_blank" rel="noopener">Открыть демо <span class="arr">↗</span></a>` : '',
    `<button type="button" class="btn ${t.demo ? 'btn-ghost' : 'btn-accent'}" data-lead="1" data-prefill="${esc('Интересует: шаблон «' + t.name + '». ')}">Заказать установку <span class="arr">→</span></button>`,
  ].join('');
  return `
  <article class="tpl-view">
    <header class="case-hero">
      <p class="eyebrow">01 / Overview</p>
      <h2 id="case-title">${esc(t.name)}</h2>
      <p class="case-tag">${esc(t.tagline)}</p>
      <div class="case-meta">${t.badge ? `<span class="proj-type">${esc(t.badge)}</span>` : ''}<span class="mono" style="font-size:12px;color:var(--muted)">${esc(t.meta)}</span></div>
      ${stage(t)}
    </header>
    <section class="case-block"><div class="case-cols">
      <div><p class="eyebrow">${no()} / Обзор</p><h3 class="t">О проекте</h3></div>
      <div class="case-text">${t.overview.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    </div></section>
    <section class="case-block"><p class="eyebrow">${no()} / Функциональность</p><h3 class="t">Что внутри</h3><ol class="feats" style="margin-top:30px">${t.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ol></section>
    <section class="case-block"><p class="eyebrow">${no()} / Стек</p><h3 class="t">Из чего собрано</h3><ul class="case-tech" style="margin-top:30px">${t.stack.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></section>
    <section class="case-block"><p class="eyebrow">${no()} / Запуск</p><h3 class="t">Что нужно от вас</h3><ul class="needs" style="margin-top:30px">${t.needs.map((s) => `<li${/^Важно:/.test(s) ? ' class="warn"' : ''}>${esc(s)}</li>`).join('')}</ul></section>
    ${screens(t, no())}
    <footer class="case-end">
      <div class="tpl-price-row"><b>${esc(priceText(t))}</b><span>${esc(termText(t))}</span>${t.price ? '' : '<small>Стоимость и срок называю до старта работы</small>'}</div>
      <div class="case-links">${links}</div>
      ${list.length > 1 ? `<a class="case-next" href="#/tpl/${esc(next.id)}" data-next="${esc(next.id)}" data-kind="tpl"><small>Следующий шаблон</small><b>${esc(next.name)}</b></a>` : ''}
    </footer>
  </article>`;
}
