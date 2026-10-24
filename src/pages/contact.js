import { boot, $, $$ } from '../main.js';
import { innerIntro } from '../components/inner-intro.js';
import '../styles/pages.css';

const PHONE = '919967848824';
const EMAIL = 'thedesignersessence@gmail.com';

boot((ctx) => {
  innerIntro(ctx);

  const form = $('.c-form');
  const note = $('.f-note', form);

  // preselect a service from ?service=…
  const pre = new URLSearchParams(location.search).get('service');
  const map = { interiors: 'Interior Designing', architecture: 'Architecture', turnkey: 'Turnkey Project' };
  if (pre && map[pre]) {
    const r = $(`input[name="service"][value="${map[pre]}"]`, form);
    if (r) r.checked = true;
  }

  const fieldOf = (el) => el.closest('.f, .f-chips');

  const validate = () => {
    let ok = true;
    let first = null;
    ['name', 'phone', 'email'].forEach((n) => {
      const el = form.elements[n];
      const valid = el.checkValidity() && (n !== 'name' || el.value.trim().length > 1);
      fieldOf(el).classList.toggle('is-invalid', !valid);
      if (!valid) { ok = false; first ||= el; }
    });
    const svc = form.querySelector('input[name="service"]:checked');
    $('.f-chips', form).classList.toggle('is-invalid', !svc);
    if (!svc) { ok = false; first ||= $('input[name="service"]', form); }
    first?.focus();
    return ok;
  };

  $$('input, textarea', form).forEach((el) =>
    el.addEventListener('input', () => fieldOf(el)?.classList.remove('is-invalid'))
  );

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) {
      note.textContent = 'Please check the highlighted fields.';
      return;
    }
    const d = Object.fromEntries(new FormData(form));
    const lines = [
      `Hello The Designer's Essence, I'd like a quote.`,
      ``,
      `Name: ${d.name}`,
      `Phone: ${d.phone}`,
      d.email ? `Email: ${d.email}` : null,
      `Service: ${d.service}`,
      d.what ? `Project: ${d.what}` : null,
      d.when ? `Start: ${d.when}` : null,
      d.where ? `Location: ${d.where}` : null,
    ];
    const text = lines.filter((l) => l !== null).join('\n');
    const via = e.submitter?.dataset.via || 'whatsapp';
    if (via === 'email') {
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`Project enquiry — ${d.service}`)}&body=${encodeURIComponent(text)}`;
      note.textContent = 'Opening your email app…';
    } else {
      window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
      note.textContent = 'Opening WhatsApp with your details…';
    }
  });
});
