import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = import.meta.dirname;

// Tiny HTML partials: <!-- @include header --> pulls in partials/header.html
const partials = () => ({
  name: 'html-partials',
  transformIndexHtml: {
    order: 'pre',
    handler(html) {
      return html.replace(/<!--\s*@include\s+([\w-]+)\s*-->/g, (_, name) =>
        readFileSync(resolve(root, 'partials', `${name}.html`), 'utf8')
      );
    },
  },
});

export default defineConfig({
  plugins: [partials()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(root, 'index.html'),
        about: resolve(root, 'about/index.html'),
        services: resolve(root, 'services/index.html'),
        projects: resolve(root, 'projects/index.html'),
        contact: resolve(root, 'contact/index.html'),
        notFound: resolve(root, '404.html'),
      },
    },
  },
});
