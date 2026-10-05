/* Entry point: render everything from data first, then wire up motion. */
import { app } from './core.js';
import { initScroll, initReveals } from './scroll.js';
import * as nav from './nav.js';
import * as hero from './hero.js';
import * as services from './services.js';
import * as templates from './templates.js';
import * as projects from './projects.js';
import * as about from './about.js';
import * as process from './process.js';
import * as reviews from './reviews.js';
import * as contact from './contact.js';
import * as cursor from './cursor.js';
import * as egg from './egg.js';
import * as caseView from './case.js';

async function boot() {
  /* static content from data (works without any animation library) */
  nav.render(); hero.render(); services.render(); templates.render(); about.render(); process.render(); reviews.render(); contact.render(); caseView.render();
  await projects.render();

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') { console.warn('GSAP missing: showing the static page'); return; }

  initScroll();
  hero.animate(); services.animate(); templates.animate(); projects.animate(); about.animate(); process.animate(); reviews.animate(); contact.animate();
  nav.animate(); cursor.animate(); egg.animate(); initReveals(); caseView.animate();
  ScrollTrigger.refresh();

  const start = /^#([a-z-]+)$/.exec(location.hash);
  if (start && start[1] !== 'hero') setTimeout(() => { const el = document.getElementById(start[1]); el && !el.hidden && app.lenis ? app.lenis.scrollTo(el, { immediate: true }) : el && el.scrollIntoView(); }, 500);
}

boot();
