import { gsap, SplitText, $ } from '../main.js';

// Shared hero intro for inner pages: masked character reveal, fades, image wipe.
export function innerIntro({ intro, motion }) {
  if (!motion) return;
  const title = $('.p-title');
  if (title) {
    const split = SplitText.create(title, { type: 'lines,chars', mask: 'lines' });
    intro.from(split.chars, { yPercent: 115, rotation: 6, stagger: 0.018, duration: 1.3, ease: 'expo.out' }, 0.1);
  }
  intro.from('.nav-in > *', { y: -24, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out' }, 0.2);
  intro.fromTo('.p-fade', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 1.1, ease: 'expo.out' }, 0.45);

  const img = $('.p-hero-img');
  if (img) {
    intro.fromTo(img, { clipPath: 'inset(18% 8% 0% 8%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.8, ease: 'expo.inOut' }, 0.3);
    intro.from($('img', img), { scale: 1.3, duration: 2.2, ease: 'expo.out' }, 0.4);
  }

  gsap.from('.wordmark', {
    yPercent: 50, opacity: 0, ease: 'none',
    scrollTrigger: { trigger: '.wordmark', start: 'top bottom', end: 'bottom bottom', scrub: true },
  });
}

export function processLine(motion) {
  if (!motion || !$('.proc-fill')) return;
  gsap.fromTo('.proc-fill', { scaleX: 0 }, {
    scaleX: 1, ease: 'none',
    scrollTrigger: { trigger: '.proc', start: 'top 80%', end: 'bottom 60%', scrub: true },
  });
}
