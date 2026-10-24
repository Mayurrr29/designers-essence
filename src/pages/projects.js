import { Flip } from 'gsap/Flip';
import { boot, gsap, ScrollTrigger, $, $$, getLenis } from '../main.js';
import { innerIntro } from '../components/inner-intro.js';
import { gallery, categories } from '../data/gallery.js';
import '../styles/pages.css';

gsap.registerPlugin(Flip);

boot((ctx) => {
  innerIntro(ctx);
  const { motion } = ctx;

  /* ---------- render gallery ---------- */
  const grid = $('[data-gallery]');
  grid.innerHTML = gallery
    .map(
      (g, i) => `<button class="m-item" type="button" data-i="${i}" data-cat="${g.cat}" data-cursor="View" aria-label="View ${g.label.toLowerCase()} image ${i + 1}">
        <img src="/images/work/${g.file}-sm.webp" width="${g.w}" height="${g.h}" alt="${g.label} designed by The Designer's Essence" loading="lazy" decoding="async">
        <span class="m-tag">${g.label}</span>
      </button>`
    )
    .join('');
  const items = $$('.m-item', grid);
  $('[data-count]').textContent = gallery.length;

  /* ---------- filters ---------- */
  const counts = gallery.reduce((a, g) => ((a[g.cat] = (a[g.cat] || 0) + 1), a), {});
  const filterBar = $('.filters');
  const filters = [['all', 'All', gallery.length], ...Object.entries(categories).map(([k, v]) => [k, v, counts[k] || 0])];
  filterBar.innerHTML = filters
    .map(([k, v, n]) => `<button class="filter" type="button" data-filter="${k}" aria-pressed="${k === 'all'}">${v}<sup>${n}</sup></button>`)
    .join('');

  let active = 'all';
  filterBar.addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (!b || b.dataset.filter === active) return;
    active = b.dataset.filter;
    $$('.filter', filterBar).forEach((f) => f.setAttribute('aria-pressed', String(f === b)));
    const state = motion ? Flip.getState(items) : null;
    items.forEach((it) => { it.hidden = !(active === 'all' || it.dataset.cat === active); });
    if (state) {
      Flip.from(state, {
        duration: 0.9,
        ease: 'expo.inOut',
        stagger: 0.012,
        absolute: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out' }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.5 }),
        onComplete: () => ScrollTrigger.refresh(),
      });
    } else {
      ScrollTrigger.refresh();
    }
  });

  if (motion) {
    gsap.set(items, { opacity: 0, y: 60 });
    ScrollTrigger.batch(items, {
      start: 'top 94%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out', overwrite: true }),
    });
  }

  /* ---------- lightbox ---------- */
  const lb = $('.lb');
  const img = $('.lb-img', lb);
  const cat = $('.lb-cat', lb);
  const count = $('.lb-i', lb);
  let list = gallery;
  let cur = 0;
  let lastFocus = null;

  const render = (dir = 0) => {
    const g = list[cur];
    const set = () => {
      img.src = `/images/work/${g.file}.webp`;
      img.alt = `${g.label} designed by The Designer's Essence`;
      cat.textContent = g.label;
      count.textContent = `${String(cur + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;
    };
    if (!motion || dir === 0) { set(); return; }
    gsap.to(img, {
      x: -60 * dir, opacity: 0, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        set();
        gsap.fromTo(img, { x: 60 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'expo.out' });
      },
    });
  };

  const open = (arr, i) => {
    list = arr;
    cur = i;
    lastFocus = document.activeElement;
    render();
    lb.hidden = false;
    getLenis()?.stop();
    document.body.style.overflow = 'hidden';
    if (motion) {
      gsap.fromTo(lb, { opacity: 0 }, { opacity: 1, duration: 0.5 });
      gsap.fromTo(img, { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: 'expo.out', delay: 0.1 });
    }
    $('.lb-close', lb).focus();
  };
  const close = () => {
    const done = () => {
      lb.hidden = true;
      getLenis()?.start();
      document.body.style.overflow = '';
      lastFocus?.focus({ preventScroll: true });
    };
    if (motion) gsap.to(lb, { opacity: 0, duration: 0.4, onComplete: done });
    else done();
  };
  const step = (d) => {
    cur = (cur + d + list.length) % list.length;
    render(d);
  };

  grid.addEventListener('click', (e) => {
    const b = e.target.closest('.m-item');
    if (!b) return;
    const visible = items.filter((it) => !it.hidden);
    const arr = visible.map((it) => gallery[+it.dataset.i]);
    open(arr, visible.indexOf(b));
  });
  $$('[data-open]').forEach((el) => {
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', 'View image full screen');
    const go = () => {
      const i = gallery.findIndex((g) => g.file === el.dataset.open);
      open(gallery, Math.max(0, i));
    };
    el.addEventListener('click', go);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });

  $('.lb-close', lb).addEventListener('click', close);
  $('.lb-prev', lb).addEventListener('click', () => step(-1));
  $('.lb-next', lb).addEventListener('click', () => step(1));
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.classList.contains('lb-fig')) close(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'Tab') {
      const f = $$('button', lb);
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
  // swipe on touch
  let sx = null;
  lb.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    sx = null;
  });
});
