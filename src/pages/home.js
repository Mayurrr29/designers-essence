import { boot, gsap, ScrollTrigger, SplitText, $, $$, fine } from '../main.js';
import { initTestimonials } from '../components/testimonials.js';
import '../styles/home.css';

boot(({ intro, motion }) => {
  /* ---------- hero intro (plays after the preloader / transition) ---------- */
  const title = $('.hero-title');
  if (motion) {
    const split = SplitText.create(title, { type: 'lines,chars', mask: 'lines' });
    intro
      .from('.nav-in > *', { y: -24, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out' }, 0.3)
      .fromTo('.hero-cover', { scaleY: 1 }, { scaleY: 0, duration: 1.6, ease: 'expo.inOut' }, 0)
      .from('.hero-arch-img', { scale: 1.4, duration: 2.2, ease: 'expo.out' }, 0.2)
      .from(split.chars, { yPercent: 115, rotation: 6, stagger: 0.022, duration: 1.3, ease: 'expo.out' }, 0.15)
      .fromTo('.hero-fade', { y: 28, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 1.1, ease: 'expo.out' }, 0.7)
      .from('.hero-chip', { y: 80, opacity: 0, duration: 1.4, ease: 'expo.out' }, 0.9)
      .from('.badge', { scale: 0, rotation: -120, duration: 1.4, ease: 'back.out(1.5)' }, 1.1);

    gsap.to('.badge-rot', { rotation: 360, duration: 22, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });

    // hero drifts as you leave it
    gsap.to('.hero-arch-img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-copy', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // pointer parallax on the hero visual
    if (fine) {
      const chip = $('.hero-chip');
      const badge = $('.badge');
      const cx = gsap.quickTo(chip, 'x', { duration: 1.2, ease: 'power3' });
      const cy = gsap.quickTo(chip, 'y', { duration: 1.2, ease: 'power3' });
      const bx = gsap.quickTo(badge, 'x', { duration: 1.4, ease: 'power3' });
      const by = gsap.quickTo(badge, 'y', { duration: 1.4, ease: 'power3' });
      $('.hero').addEventListener('mousemove', (e) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        cx(nx * -32); cy(ny * -24); bx(nx * 24); by(ny * 18);
      });
    }

    /* ---------- manifesto: words light up as you read ---------- */
    const mf = $('.mf');
    const words = SplitText.create(mf, { type: 'words' });
    gsap.fromTo(words.words, { opacity: 0.14 }, {
      opacity: 1,
      stagger: 0.1,
      ease: 'none',
      scrollTrigger: { trigger: mf, start: 'top 78%', end: 'bottom 45%', scrub: 0.6 },
    });

    /* ---------- immersive arch opens into the room ---------- */
    const imm = $('.imm');
    const mm = gsap.matchMedia();
    mm.add({ wide: '(min-width: 901px)', narrow: '(max-width: 900px)' }, (ctx) => {
      const start = ctx.conditions.wide
        ? 'inset(14% 34% 14% 34% round 400px 400px 0px 0px)'
        : 'inset(16% 14% 16% 14% round 300px 300px 0px 0px)';
      gsap.timeline({
        scrollTrigger: { trigger: imm, start: 'top top', end: '+=140%', scrub: 1, pin: true, anticipatePin: 1 },
      })
        .fromTo('.imm-media', { clipPath: start }, { clipPath: 'inset(0% 0% 0% 0% round 0px 0px 0px 0px)', ease: 'power2.inOut', duration: 1 })
        .fromTo('.imm-media img', { scale: 1.35 }, { scale: 1, ease: 'power2.inOut', duration: 1 }, 0)
        .to('.imm-shade', { opacity: 1, duration: 0.4 }, 0.6)
        .fromTo('.imm-copy', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.4 }, 0.7)
        .to({}, { duration: 0.3 });
    });

    /* ---------- featured work: pinned horizontal scroll on desktop ---------- */
    mm.add('(min-width: 1024px)', () => {
      const track = $('.hs-track');
      const dist = () => track.scrollWidth - window.innerWidth;
      const tween = gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: '.hs',
          start: 'top top',
          end: () => '+=' + dist(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
      gsap.fromTo('.hs-bar', { scaleX: 0 }, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: '.hs', start: 'top top', end: () => '+=' + dist(), scrub: true, invalidateOnRefresh: true },
      });
      // each image drifts inside its frame as it travels
      $$('.hs-media img').forEach((img) => {
        gsap.fromTo(img, { xPercent: -6, scale: 1.14 }, {
          xPercent: 6,
          ease: 'none',
          scrollTrigger: { trigger: img.parentNode, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
        });
      });
      // cards rise in as they enter
      $$('.hs-cap').forEach((cap) => {
        gsap.from(cap.children, {
          y: 40, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out',
          scrollTrigger: { trigger: cap, containerAnimation: tween, start: 'left 85%', once: true },
        });
      });
    });

    /* ---------- process line fills as you scroll ---------- */
    gsap.fromTo('.proc-fill', { scaleX: 0 }, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { trigger: '.proc', start: 'top 80%', end: 'bottom 60%', scrub: true },
    });

    /* ---------- footer wordmark rises ---------- */
    gsap.from('.wordmark', { yPercent: 50, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.wordmark', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  } else {
    // reduced motion: show final states
    gsap.set('.imm-media', { clipPath: 'inset(0% 0% 0% 0%)' });
    gsap.set(['.imm-shade', '.imm-copy'], { opacity: 1 });
  }

  initTestimonials();
});
