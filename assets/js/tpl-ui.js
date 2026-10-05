/* Templates: icons and small formatting helpers shared by the tiles and the full view */
import { esc, nb } from './core.js';

const PATHS = {
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h3"/>',
  quiz: '<rect x="5" y="3.5" width="14" height="17" rx="3"/><path d="m8.5 9 1.2 1.2L12 8M8.5 14.5l1.2 1.2L12 13.5M14.5 9.5H16M14.5 15H16"/>',
  bag: '<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="3"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5M12 14.5v2"/>',
  send: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z"/>',
  headset: '<path d="M4.5 14v-2a7.5 7.5 0 0 1 15 0v2"/><rect x="3.5" y="13" width="4" height="6" rx="2"/><rect x="16.5" y="13" width="4" height="6" rx="2"/><path d="M18.5 19c0 1.4-1.6 2-4 2h-2"/>',
  clock: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><circle cx="12" cy="15" r="2.6"/><path d="M12 13.8v1.3l.9.6"/>',
  coffee: '<path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9Z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H15.5M8.5 3.5c0 1 .8 1.2.8 2.2M12 3.5c0 1 .8 1.2.8 2.2"/>',
  page: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M3.5 9h17M7.5 13h6M7.5 16h9"/>',
  folder: '<path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-10Z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5.5 5.5"/>',
  bolt: '<path d="M13 3 5 13.5h6L10 21l9-11.5h-6.2L13 3Z"/>',
};

export const tplIcon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name] || PATHS.page}</svg>`;

const plural = (n, a, b, c) => { const m = n % 100; const d = n % 10; return m > 10 && m < 20 ? c : d === 1 ? a : d > 1 && d < 5 ? b : c; };

/* price / term come from templates-data.js; empty means "not announced yet", never a made-up number */
export const priceText = (t) => (t.price ? nb(`от ${Number(t.price).toLocaleString('ru-RU').replace(/ /g, ' ')} ₽`) : 'Цена - по запросу');
export const termText = (t) => (t.days ? `установка от ${t.days} ${plural(t.days, 'дня', 'дней', 'дней')}` : 'исходники или установка под ключ');

/* "TELEGRAM-БОТ · ПАРСЕР" -> short chip on the tile */
export const kindOf = (t) => (t.badge || '').split(' · ')[0];

export const chip = (s) => `<li>${esc(s)}</li>`;
