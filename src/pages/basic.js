import { boot } from '../main.js';
import { innerIntro } from '../components/inner-intro.js';
import '../styles/pages.css';

boot((ctx) => innerIntro(ctx));
