import './styles/main.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };

const html = document.documentElement;
const mq = (q) => window.matchMedia && window.matchMedia(q).matches;

export const motion = html.classList.contains('js-motion');
export const fine = mq('(hover: hover) and (pointer: fine)');
export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

let lenis = null;
export const getLenis = () => lenis;

/* ------------------------------------------------------------------ */
/* smooth scroll                                                       */
/* ------------------------------------------------------------------ */
function initLenis() {
  if (!motion) return;
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, touchMultiplier: 1.4 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function scrollToTarget(target, offset = 0) {
  if (lenis) lenis.scrollTo(target, { offset, duration: 1.6 });
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' });
  else (typeof target === 'string' ? $(target) : target)?.scrollIntoView({ behavior: 'smooth' });
}

/* ------------------------------------------------------------------ */
/* header + menu                                                       */
/* ------------------------------------------------------------------ */
function initNav() {
  const nav = $('.nav');
  if (!nav) return;
  const page = document.body.dataset.page;
  $$('[data-nav]').forEach((a) => {
    if (a.dataset.nav === page) a.setAttribute('aria-current', 'page');
  });
  if (document.body.dataset.navTheme) nav.dataset.theme = document.body.dataset.navTheme;

  let last = 0;
  const onScroll = (y) => {
    nav.classList.toggle('is-scrolled', y > 40);
    if (y > last && y > 420) nav.classList.add('is-hidden');
    else if (y < last - 2) nav.classList.remove('is-hidden');
    last = y;
  };
  if (lenis) lenis.on('scroll', (e) => onScroll(e.scroll));
  else window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
  onScroll(window.scrollY);

  const menu = $('#menu');
  const openBtn = $('.menu-btn');
  const closeBtn = $('.menu-close');
  if (!menu || !openBtn) return;
  let tl;
  const open = () => {
    menu.classList.add('is-open');
    openBtn.setAttribute('aria-expanded', 'true');
    lenis?.stop();
    tl?.kill();
    tl = gsap.timeline();
    tl.fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut' })
      .from($$('.menu-link', menu), { yPercent: 110, duration: 1, stagger: 0.06, ease: 'expo.out' }, 0.4)
      .from($$('.menu-side > *', menu), { y: 30, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'expo.out' }, 0.5);
    closeBtn.focus({ preventScroll: true });
  };
  const close = () => {
    tl?.kill();
    tl = gsap.timeline({
      onComplete: () => {
        menu.classList.remove('is-open');
        gsap.set(menu, { clearProps: 'clipPath' });
      },
    });
    tl.to(menu, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.7, ease: 'expo.inOut' });
    openBtn.setAttribute('aria-expanded', 'false');
    lenis?.start();
    openBtn.focus({ preventScroll: true });
  };
  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) close();
  });
}

/* ------------------------------------------------------------------ */
/* page transitions                                                    */
/* ------------------------------------------------------------------ */
function initTransitions() {
  const pt = $('.pt');
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname) {
      e.preventDefault();
      if (url.hash) scrollToTarget(url.hash, -80);
      else scrollToTarget(0);
      return;
    }
    if (!motion || !pt) return;
    e.preventDefault();
    gsap.set(pt, { transformOrigin: 'bottom center' });
    gsap.timeline({ onComplete: () => { window.location.href = url.href; } })
      .to(pt, { scaleY: 1, duration: 0.85, ease: 'expo.inOut' })
      .fromTo('.pt-mono', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' }, 0.45);
  });
  window.addEventListener('pageshow', (e) => {
    if (e.persisted && pt) {
      gsap.set(pt, { scaleY: 0 });
      html.classList.remove('is-transition', 'is-first');
    }
  });
}

function enter() {
  return new Promise((resolve) => {
    if (!motion) return resolve();
    try { sessionStorage.setItem('de-seen', '1'); } catch (e) { /* private mode */ }
    const pt = $('.pt');
    const pre = $('.pre');

    if (html.classList.contains('is-first') && pre) {
      const num = $('.pre-num');
      const c = { v: 0 };
      gsap.timeline({ onComplete: () => { html.classList.remove('is-first'); gsap.set(pre, { clearProps: 'all' }); } })
        .from('.pre-word span', { yPercent: 110, stagger: 0.03, duration: 0.9, ease: 'expo.out' })
        .to('.pre-bar', { scaleX: 1, duration: 1.5, ease: 'power2.inOut' }, 0)
        .to(c, { v: 100, duration: 1.5, ease: 'power2.inOut', onUpdate: () => { num.textContent = String(Math.round(c.v)).padStart(3, '0'); } }, 0)
        .to('.pre-word span', { yPercent: -110, stagger: 0.02, duration: 0.6, ease: 'expo.in' }, '+=0.15')
        .to('.pre-bar, .pre-num', { opacity: 0, duration: 0.4 }, '<')
        .to(pre, { yPercent: -100, duration: 1.2, ease: 'expo.inOut' }, '-=0.15')
        .add(resolve, '-=0.8');
    } else if (html.classList.contains('is-transition') && pt) {
      gsap.set(pt, { scaleY: 1, transformOrigin: 'top center' });
      gsap.set('.pt-mono', { opacity: 1 });
      html.classList.remove('is-transition');
      gsap.timeline()
        .to('.pt-mono', { opacity: 0, duration: 0.3 })
        .to(pt, { scaleY: 0, duration: 1, ease: 'expo.inOut' }, 0.1)
        .add(resolve, 0.45);
    } else {
      resolve();
    }
  });
}

/* ------------------------------------------------------------------ */
/* cursor + magnetic + hover previews                                  */
/* ------------------------------------------------------------------ */
function initCursor() {
  if (!fine) return;
  const dot = $('.cur-dot');
  const ring = $('.cur-ring');
  const label = $('.cur-label');
  if (!dot) return;
  html.classList.add('has-cursor');
  gsap.set([dot, ring, label], { xPercent: -50, yPercent: -50 });
  const qd = [gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' }), gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' })];
  const qr = [gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'power3' }), gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'power3' })];
  const ql = [gsap.quickTo(label, 'x', { duration: 0.55, ease: 'power3' }), gsap.quickTo(label, 'y', { duration: 0.55, ease: 'power3' })];
  let shown = false;
  window.addEventListener('mousemove', (e) => {
    if (!shown) { shown = true; gsap.to([dot, ring], { opacity: 1, duration: 0.4 }); }
    qd[0](e.clientX); qd[1](e.clientY); qr[0](e.clientX); qr[1](e.clientY); ql[0](e.clientX); ql[1](e.clientY);
  });
  document.addEventListener('mouseleave', () => { shown = false; gsap.to([dot, ring, label], { opacity: 0, duration: 0.3 }); });

  document.addEventListener('mouseover', (e) => {
    const t = e.target.closest('[data-cursor], a, button, input, select, textarea, label');
    if (!t || t.contains(e.relatedTarget)) return;
    if (t.dataset.cursor) {
      label.textContent = t.dataset.cursor;
      ring.classList.add('is-solid');
      gsap.to(ring, { scale: 2.4, duration: 0.6, ease: 'expo.out' });
      gsap.to(dot, { opacity: 0, duration: 0.2 });
      gsap.to(label, { opacity: 1, duration: 0.3, delay: 0.1 });
    } else {
      gsap.to(ring, { scale: 1.7, duration: 0.5, ease: 'expo.out' });
    }
  });
  document.addEventListener('mouseout', (e) => {
    const t = e.target.closest('[data-cursor], a, button, input, select, textarea, label');
    if (!t || t.contains(e.relatedTarget)) return;
    ring.classList.remove('is-solid');
    gsap.to(ring, { scale: 1, duration: 0.6, ease: 'expo.out' });
    gsap.to(dot, { opacity: 1, duration: 0.2 });
    gsap.to(label, { opacity: 0, duration: 0.2 });
  });
}

function initMagnetic() {
  if (!fine) return;
  $$('[data-magnetic]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'elastic.out(1, 0.4)' });
    const y = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.3);
      y((e.clientY - r.top - r.height / 2) * 0.3);
    });
    el.addEventListener('mouseleave', () => { x(0); y(0); });
  });
}

function initHoverFloats() {
  if (!fine) return;
  $$('[data-float-group]').forEach((group) => {
    const fl = $('.hover-float', group);
    if (!fl) return;
    document.body.appendChild(fl);
    const imgs = $$('img', fl);
    gsap.set(fl, { xPercent: -50, yPercent: -50, scale: 0.6, rotation: -6 });
    const fx = gsap.quickTo(fl, 'x', { duration: 0.7, ease: 'power3' });
    const fy = gsap.quickTo(fl, 'y', { duration: 0.7, ease: 'power3' });
    $$('[data-float-item]', group).forEach((row, i) => {
      row.addEventListener('mouseenter', (e) => {
        fx(e.clientX); fy(e.clientY);
        imgs.forEach((im, j) => gsap.to(im, { opacity: j === i ? 1 : 0, duration: 0.45 }));
        gsap.to(fl, { scale: 1, rotation: 0, opacity: 1, duration: 0.7, ease: 'expo.out' });
      });
      row.addEventListener('mouseleave', () => gsap.to(fl, { scale: 0.6, rotation: -6, opacity: 0, duration: 0.5, ease: 'expo.out' }));
      row.addEventListener('mousemove', (e) => { fx(e.clientX); fy(e.clientY); });
    });
  });
}

/* ------------------------------------------------------------------ */
/* scroll reveals                                                      */
/* ------------------------------------------------------------------ */
export function splitLines(el, opts = {}) {
  return SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line', ...opts });
}

function initReveals() {
  if (!motion) return;

  // headings: masked line reveal (hero headings are handled by each page's intro)
  $$('[data-split]:not([data-split="intro"])').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 115,
          rotation: 2,
          transformOrigin: '0% 100%',
          duration: 1.3,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }),
    });
  });

  // fade-up blocks
  $$('[data-rv]').forEach((el) => {
    gsap.fromTo(
      el,
      { y: 56, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.3,
        delay: parseFloat(el.dataset.rv) || 0,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      }
    );
  });

  // image reveal: curtain wipe + settle
  $$('[data-reveal]').forEach((el) => {
    const img = $('img', el);
    const from = el.dataset.reveal === 'left' ? 'inset(0% 100% 0% 0%)' : 'inset(100% 0% 0% 0%)';
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    tl.fromTo(el, { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' });
    if (img && !el.classList.contains('is-parallax')) tl.from(img, { scale: 1.3, duration: 2, ease: 'expo.out' }, 0.2);
  });

  // parallax images
  $$('.media.is-parallax').forEach((el) => {
    const img = $('img', el);
    if (!img) return;
    gsap.fromTo(img, { yPercent: -8 }, {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // generic speed parallax
  $$('[data-speed]').forEach((el) => {
    const s = parseFloat(el.dataset.speed) || 0;
    gsap.to(el, {
      y: () => s * 100,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    });
  });

  // drawn rules
  $$('[data-draw]').forEach((el) => {
    gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });

  // line icons draw themselves
  $$('[data-draw-svg]').forEach((svg) => {
    const paths = $$('path, circle, line, rect, polyline', svg);
    const tl = gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 90%', once: true } });
    paths.forEach((p) => {
      const L = p.getTotalLength ? p.getTotalLength() : 0;
      if (!L) return;
      gsap.set(p, { strokeDasharray: L, strokeDashoffset: L });
      tl.to(p, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0);
    });
  });

  // staggered groups
  $$('[data-stagger]').forEach((group) => {
    gsap.fromTo(
      group.children,
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, stagger: 0.09, ease: 'expo.out', scrollTrigger: { trigger: group, start: 'top 88%', once: true } }
    );
  });
}

/* ------------------------------------------------------------------ */
/* marquees                                                            */
/* ------------------------------------------------------------------ */
function initMarquees() {
  $$('.mq').forEach((m) => {
    const track = $('.mq-track', m);
    if (!track) return;
    const loop = gsap.to(track, { xPercent: -50, ease: 'none', duration: 38, repeat: -1 });
    if (!motion) { loop.pause(); return; }
    let dir = 1;
    ScrollTrigger.create({
      trigger: m,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const v = Math.min(Math.abs(self.getVelocity()) / 160, 7);
        dir = self.direction;
        gsap.to(loop, { timeScale: (1 + v) * dir, duration: 0.2, overwrite: true });
        gsap.to(loop, { timeScale: dir, duration: 1.6, delay: 0.25 });
      },
    });
  });
}

/* ------------------------------------------------------------------ */
/* misc                                                                */
/* ------------------------------------------------------------------ */
function initMisc() {
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  $$('[data-to-top]').forEach((b) => b.addEventListener('click', () => scrollToTarget(0)));
}

const fontsReady = () =>
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 2000))]);

/* ------------------------------------------------------------------ */
/* boot: shared setup, then the page's own code, then the intro         */
/* ------------------------------------------------------------------ */
export async function boot(pageInit) {
  initLenis();
  initNav();
  initTransitions();
  initCursor();
  const entering = enter();
  await fontsReady();

  const intro = gsap.timeline({ paused: true });
  if (pageInit) await pageInit({ intro, motion });

  initReveals();
  initMarquees();
  initMagnetic();
  initHoverFloats();
  initMisc();

  await entering;
  if (motion) intro.play();
  else intro.progress(1);
  ScrollTrigger.refresh();
}
