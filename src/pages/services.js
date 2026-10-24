import { boot } from '../main.js';
import { innerIntro, processLine } from '../components/inner-intro.js';
import '../styles/pages.css';

boot((ctx) => {
  innerIntro(ctx);
  processLine(ctx.motion);
});
