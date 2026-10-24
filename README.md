# The Designer's Essence — website redesign

A redesigned, multi-page website for [The Designer's Essence](https://www.thedesignersessence.com), a luxury interior design and architecture studio in Ahmedabad.

**Pages:** Home · About · Services · Projects · Contact (+ 404)

## Stack

- [Vite](https://vitejs.dev) multi-page build (plain HTML, CSS and JavaScript)
- [GSAP](https://gsap.com) with ScrollTrigger, SplitText and Flip for all motion
- [Lenis](https://lenis.darkroom.engineering) for smooth scrolling
- Fonts: Bodoni Moda + Manrope (Google Fonts)

## Highlights

- First-visit preloader, then curtain page transitions between pages
- Masked character reveals on every headline, scroll-scrubbed word fill
- Pinned "arch opens into the room" scene and a pinned horizontal project reel on the home page
- Custom cursor, magnetic buttons, hover image previews on service lists
- Filterable project gallery (76 photos) with animated re-layout and a full-screen lightbox (keyboard + swipe)
- Enquiry form that validates and sends the details via WhatsApp or email — no backend needed
- Fully responsive, respects `prefers-reduced-motion`, keyboard accessible

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
npm run preview
```

## Deploy on Vercel

Import the repo in Vercel — it detects Vite automatically (build: `npm run build`, output: `dist`). `vercel.json` enables clean URLs and long-term caching for images.

## Structure

```
index.html, about/, services/, projects/, contact/, 404.html   pages
partials/            shared head, header and footer (inlined at build time)
src/main.js          shared motion system: smooth scroll, transitions, cursor, reveals
src/pages/*.js       page-specific code
src/data/gallery.js  project gallery list
src/styles/          design system + page styles
public/images/       studio photography (webp) and team portraits
```

Photography and copy belong to The Designer's Essence.
