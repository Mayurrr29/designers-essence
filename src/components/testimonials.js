import { gsap, $, $$ } from '../main.js';

export function initTestimonials(root = document) {
  const slides = $$('.tq-slide', root);
  if (slides.length < 2) return;
  const counter = $('[data-tq-i]', root);
  let i = 0;
  let timer;

  const show = (n) => {
    const prev = slides[i];
    i = (n + slides.length) % slides.length;
    const next = slides[i];
    if (prev === next) return;
    gsap.to(prev.children, {
      y: -30, opacity: 0, duration: 0.5, stagger: 0.05, ease: 'power2.in',
      onComplete: () => prev.classList.remove('is-active'),
    });
    next.classList.add('is-active');
    gsap.fromTo(next.children, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'expo.out', delay: 0.45 });
    if (counter) counter.textContent = String(i + 1).padStart(2, '0');
  };

  const restart = () => {
    clearInterval(timer);
    timer = setInterval(() => show(i + 1), 8000);
  };

  $$('[data-tq]', root).forEach((b) =>
    b.addEventListener('click', () => {
      show(i + parseInt(b.dataset.tq, 10));
      restart();
    })
  );
  restart();
}
