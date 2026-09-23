/*
  ATELIER — main.js
  Navigation, theme, reveals, and the two interactive modules
  (Silhouette Finder on index, Styling Studio on home2).
*/

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     Mobile drawer
  --------------------------------------------------------- */
  const hamburger = document.querySelector('.hamburger');
  const drawerClose = document.querySelector('.drawer-close');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.overlay');

  if (hamburger && mobileDrawer && overlay) {
    const setDrawer = (open) => {
      mobileDrawer.classList.toggle('open', open);
      overlay.classList.toggle('show', open);
      document.body.classList.toggle('no-scroll', open);
      hamburger.setAttribute('aria-expanded', String(open));
    };

    hamburger.addEventListener('click', () => setDrawer(!mobileDrawer.classList.contains('open')));
    if (drawerClose) drawerClose.addEventListener('click', () => setDrawer(false));
    overlay.addEventListener('click', () => setDrawer(false));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) setDrawer(false);
    });
    mobileDrawer.querySelectorAll('.drawer-link').forEach(link => {
      link.addEventListener('click', () => setDrawer(false));
    });
  }

  /* ---------------------------------------------------------
     Theme (persisted, with icon swap)
  --------------------------------------------------------- */
  const themeToggles = document.querySelectorAll('.theme-toggle');

  const paintThemeIcons = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeToggles.forEach(btn => {
      const icon = btn.querySelector('i');
      if (icon) icon.className = isDark ? 'ph-light ph-sun' : 'ph-light ph-moon';
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    });
  };

  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  paintThemeIcons();

  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      if (next === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      localStorage.setItem('theme', next);
      paintThemeIcons();
    });
  });

  /* ---------------------------------------------------------
     RTL toggle (persisted)
  --------------------------------------------------------- */
  const rtlToggles = document.querySelectorAll('.rtl-toggle');
  if (localStorage.getItem('rtl') === 'rtl') document.documentElement.setAttribute('dir', 'rtl');

  rtlToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl';
      document.documentElement.setAttribute('dir', next);
      localStorage.setItem('rtl', next);
    });
  });

  /* ---------------------------------------------------------
     Scroll state: condensed header + progress hairline
  --------------------------------------------------------- */
  const progress = document.querySelector('.scroll-progress');
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    document.body.classList.toggle('scrolled', y > 40);

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = max > 0 ? `${(y / max) * 100}%` : '0%';
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     Scroll reveal
  --------------------------------------------------------- */
  const revealables = document.querySelectorAll('[data-reveal]');
  if (revealables.length) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

      revealables.forEach(el => io.observe(el));
    } else {
      revealables.forEach(el => el.classList.add('is-visible'));
    }
  }

  /* ---------------------------------------------------------
     Count-up stats
  --------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const duration = 1600;
        const start = performance.now();

        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString();
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        countIO.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => countIO.observe(el));
  }

  /* ---------------------------------------------------------
     Password reveal
  --------------------------------------------------------- */
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;

      const reveal = input.type === 'password';
      input.type = reveal ? 'text' : 'password';
      btn.innerHTML = `<i class="ph-light ph-eye${reveal ? '-slash' : ''}"></i>`;
      btn.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
      btn.setAttribute('aria-pressed', String(reveal));
      input.focus();
    });
  });

  /* ---------------------------------------------------------
     Generic form validation
  --------------------------------------------------------- */
  document.querySelectorAll('form.needs-validation').forEach(form => {
    form.addEventListener('submit', (e) => {
      let isValid = true;

      form.querySelectorAll('[required]').forEach(field => {
        const empty = field.type === 'checkbox' ? !field.checked : !field.value.trim();
        field.classList.toggle('error', empty);
        if (empty) isValid = false;
      });

      // The terms checkbox sits inside its own label, so colour the label.
      const terms = form.querySelector('#terms');
      if (terms) {
        const label = terms.closest('label') || terms.nextElementSibling;
        if (label) label.style.color = terms.checked ? '' : '#C0392B';
        if (!terms.checked) isValid = false;
      }

      const formError = form.querySelector('.form-error-msg');
      if (!isValid) {
        e.preventDefault();
        if (formError) formError.style.display = 'block';
        const firstBad = form.querySelector('.error');
        if (firstBad) firstBad.focus();
      } else if (formError) {
        formError.style.display = 'none';
      }
    });

    form.querySelectorAll('.form-control').forEach(field => {
      field.addEventListener('input', () => field.classList.remove('error'));
    });
  });

  /* =========================================================
     INTERACTIVE 1 — Silhouette Finder (index.html)
     A three-question styling quiz that scores each gown
     archetype and reveals the closest match.
     ========================================================= */
  const finder = document.querySelector('[data-finder]');

  if (finder) {
    const MATCHES = {
      classic: {
        name: 'The Genevieve',
        line: 'A-Line · Silk Mikado',
        tag: 'Your silhouette',
        copy: 'Architectural calm with a softly draped bodice — the gown for a bride who wants to be remembered, not the dress. It photographs beautifully in daylight and moves without effort.',
        meta: { Silhouette: 'A-Line', Fabric: 'Silk Mikado', Train: 'Chapel', From: '$2,400' },
        img: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?q=80&w=1974&auto=format&fit=crop'
      },
      romantic: {
        name: 'The Amelie',
        line: 'Ball Gown · Chantilly Lace',
        tag: 'Your silhouette',
        copy: 'Layered tulle, hand-set lace and a sweeping cathedral train. Made for candlelight, a long aisle, and a first look that stops the room.',
        meta: { Silhouette: 'Ball Gown', Fabric: 'Chantilly Lace', Train: 'Cathedral', From: '$3,100' },
        img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2000&auto=format&fit=crop'
      },
      modern: {
        name: 'The Celine',
        line: 'Mermaid · Crepe',
        tag: 'Your silhouette',
        copy: 'A single clean line from shoulder to floor. Weightless crepe, no embellishment, nothing to hide behind — quietly the most confident gown in the salon.',
        meta: { Silhouette: 'Mermaid', Fabric: 'Crepe', Train: 'Sweep', From: '$2,800' },
        img: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2000&auto=format&fit=crop'
      },
      ethereal: {
        name: 'The Juliette',
        line: 'Sheath · Silk Georgette',
        tag: 'Your silhouette',
        copy: 'Barely-there georgette that catches every breath of air. Designed for gardens, terraces and long golden evenings far from a ballroom.',
        meta: { Silhouette: 'Sheath', Fabric: 'Georgette', Train: 'Brush', From: '$1,900' },
        img: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?q=80&w=2070&auto=format&fit=crop'
      }
    };

    const steps = Array.from(finder.querySelectorAll('.finder-step'));
    const result = finder.querySelector('.finder-result');
    const dots = Array.from(finder.querySelectorAll('.finder-progress .dot'));
    const counter = finder.querySelector('.finder-step-count');
    const backBtn = finder.querySelector('.finder-back:not([data-finder-restart])');
    const restart = finder.querySelector('[data-finder-restart]');
    const hint = finder.querySelector('.finder-hint');
    const visuals = Array.from(finder.querySelectorAll('.fv-img'));
    const capTag = finder.querySelector('[data-fv-tag]');
    const capTitle = finder.querySelector('[data-fv-title]');

    let index = 0;
    const answers = [];

    const showVisual = (key) => {
      visuals.forEach(v => v.classList.toggle('is-active', v.dataset.key === key));
    };

    const paintChrome = () => {
      dots.forEach((d, i) => d.classList.toggle('done', i <= index - 1 || (index >= steps.length)));
      if (counter) {
        counter.textContent = index >= steps.length
          ? 'Your match'
          : `Question ${index + 1} of ${steps.length}`;
      }
      const done = index >= steps.length;
      if (backBtn) backBtn.classList.toggle('is-hidden', index === 0 || done);
      if (restart) restart.classList.toggle('is-hidden', !done);
      if (hint) hint.textContent = done ? 'Your selections travel with you' : 'Takes about 20 seconds';
    };

    const render = () => {
      steps.forEach((s, i) => s.classList.toggle('is-active', i === index && index < steps.length));
      if (result) result.classList.toggle('is-active', index >= steps.length);
      paintChrome();

      if (index < steps.length) {
        const preview = steps[index].dataset.visual;
        if (preview) showVisual(preview);
        const cur = steps[index];
        if (capTag) capTag.textContent = cur.dataset.capTag || 'The Atelier';
        if (capTitle) capTitle.textContent = cur.dataset.capTitle || '';
      }
    };

    const computeMatch = () => {
      const tally = {};
      answers.forEach(key => { tally[key] = (tally[key] || 0) + 1; });
      // Highest score wins; the final answer breaks ties, since it
      // reflects the mood the bride landed on last.
      return Object.keys(tally).reduce((best, key) => {
        if (tally[key] > tally[best]) return key;
        if (tally[key] === tally[best] && key === answers[answers.length - 1]) return key;
        return best;
      }, answers[answers.length - 1]);
    };

    const reveal = () => {
      const key = computeMatch();
      const match = MATCHES[key] || MATCHES.classic;

      finder.querySelector('[data-result-tag]').textContent = match.tag;
      finder.querySelector('[data-result-name]').textContent = match.name;
      finder.querySelector('[data-result-copy]').textContent = match.copy;

      const metaWrap = finder.querySelector('[data-result-meta]');
      metaWrap.innerHTML = Object.entries(match.meta)
        .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
        .join('');

      const bookLink = finder.querySelector('[data-result-book]');
      if (bookLink) bookLink.href = `appointments.html?gown=${encodeURIComponent(match.name)}`;

      showVisual(key);
      if (capTag) capTag.textContent = match.line;
      if (capTitle) capTitle.textContent = match.name;
    };

    finder.querySelectorAll('.finder-option').forEach(option => {
      option.addEventListener('click', () => {
        const stepEl = option.closest('.finder-step');
        stepEl.querySelectorAll('.finder-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');

        answers[index] = option.dataset.value;
        index += 1;

        if (index >= steps.length) reveal();
        render();
      });

      option.addEventListener('mouseenter', () => {
        if (index < steps.length && option.dataset.value) showVisual(option.dataset.value);
      });
    });

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (index === 0) return;
        index -= 1;
        answers.length = index;
        render();
      });
    }

    if (restart) {
      restart.addEventListener('click', () => {
        index = 0;
        answers.length = 0;
        finder.querySelectorAll('.finder-option').forEach(o => o.classList.remove('selected'));
        render();
      });
    }

    render();
  }

  /* =========================================================
     INTERACTIVE 2 — Styling Studio (home2.html)
     Live gown configurator: silhouette, fabric, train, veil.
     Updates the visual, the running estimate and the summary.
     ========================================================= */
  const studio = document.querySelector('[data-studio]');

  if (studio) {
    const SILHOUETTES = {
      classic:  { label: 'A-Line',    price: 2400, img: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?q=80&w=1974&auto=format&fit=crop', gown: 'The Genevieve' },
      romantic: { label: 'Ball Gown', price: 3100, img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2000&auto=format&fit=crop', gown: 'The Amelie' },
      modern:   { label: 'Mermaid',   price: 2800, img: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2000&auto=format&fit=crop', gown: 'The Celine' },
      sheath:   { label: 'Sheath',    price: 1900, img: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?q=80&w=2070&auto=format&fit=crop', gown: 'The Juliette' }
    };

    const FABRICS = {
      mikado:    { label: 'Silk Mikado',     price: 0 },
      lace:      { label: 'Chantilly Lace',  price: 620 },
      crepe:     { label: 'Crepe',           price: 180 },
      georgette: { label: 'Silk Georgette',  price: 340 }
    };

    const TRAINS = {
      brush:     { label: 'Brush',     price: 0 },
      chapel:    { label: 'Chapel',    price: 240 },
      cathedral: { label: 'Cathedral', price: 680 }
    };

    const TONES = {
      ivory:     { label: 'Ivory',     tint: 'rgba(255,253,248,0)' },
      champagne: { label: 'Champagne', tint: 'rgba(224,197,150,0.30)' },
      blush:     { label: 'Blush',     tint: 'rgba(233,196,193,0.32)' },
      pearl:     { label: 'Pearl Grey', tint: 'rgba(206,203,199,0.32)' }
    };

    const VEIL_PRICE = 450;

    const DEFAULTS = { silhouette: 'classic', fabric: 'mikado', train: 'chapel', tone: 'ivory', veil: true };
    const state = { ...DEFAULTS };

    const layers = Array.from(studio.querySelectorAll('.studio-layer'));
    const veilEl = studio.querySelector('.studio-veil');
    const tintEl = studio.querySelector('.studio-tint');
    const veilSwitch = studio.querySelector('[data-studio-veil]');
    const money = (n) => '$' + n.toLocaleString('en-US');

    const total = () =>
      SILHOUETTES[state.silhouette].price +
      FABRICS[state.fabric].price +
      TRAINS[state.train].price +
      (state.veil ? VEIL_PRICE : 0);

    const setText = (selector, value) => {
      const el = studio.querySelector(selector);
      if (el) el.textContent = value;
    };

    const render = () => {
      // Visual
      layers.forEach(l => l.classList.toggle('is-active', l.dataset.key === state.silhouette));
      if (tintEl) {
        tintEl.style.backgroundColor = TONES[state.tone].tint;
        tintEl.style.opacity = state.tone === 'ivory' ? '0' : '1';
      }
      if (veilEl) veilEl.classList.toggle('is-on', state.veil);

      // Selected states
      studio.querySelectorAll('[data-opt]').forEach(btn => {
        btn.classList.toggle('selected', state[btn.dataset.opt] === btn.dataset.value);
        btn.setAttribute('aria-pressed', String(state[btn.dataset.opt] === btn.dataset.value));
      });
      if (veilSwitch) veilSwitch.setAttribute('aria-pressed', String(state.veil));

      // Labels
      setText('[data-cur-silhouette]', SILHOUETTES[state.silhouette].label);
      setText('[data-cur-fabric]', FABRICS[state.fabric].label);
      setText('[data-cur-train]', TRAINS[state.train].label);
      setText('[data-cur-tone]', TONES[state.tone].label);

      // Stage caption
      setText('[data-studio-gown]', SILHOUETTES[state.silhouette].gown);
      setText('[data-studio-line]',
        `${SILHOUETTES[state.silhouette].label} · ${FABRICS[state.fabric].label} · ${TONES[state.tone].label}`);

      // Summary
      setText('[data-sum-base]', `${SILHOUETTES[state.silhouette].label} — ${money(SILHOUETTES[state.silhouette].price)}`);
      setText('[data-sum-fabric]', FABRICS[state.fabric].price
        ? `${FABRICS[state.fabric].label} — +${money(FABRICS[state.fabric].price)}`
        : `${FABRICS[state.fabric].label} — included`);
      setText('[data-sum-train]', TRAINS[state.train].price
        ? `${TRAINS[state.train].label} — +${money(TRAINS[state.train].price)}`
        : `${TRAINS[state.train].label} — included`);
      setText('[data-sum-veil]', state.veil ? `Cathedral veil — +${money(VEIL_PRICE)}` : 'Not included');

      const t = total();
      setText('[data-studio-total]', money(t));
      setText('[data-studio-price]', money(t));

      const book = studio.querySelector('[data-studio-book]');
      if (book) {
        const params = new URLSearchParams({
          gown: SILHOUETTES[state.silhouette].gown,
          fabric: FABRICS[state.fabric].label,
          train: TRAINS[state.train].label,
          tone: TONES[state.tone].label,
          veil: state.veil ? 'yes' : 'no'
        });
        book.href = `appointments.html?${params.toString()}`;
      }
    };

    studio.querySelectorAll('[data-opt]').forEach(btn => {
      btn.addEventListener('click', () => {
        state[btn.dataset.opt] = btn.dataset.value;
        render();
      });
    });

    if (veilSwitch) {
      veilSwitch.addEventListener('click', () => {
        state.veil = !state.veil;
        render();
      });
    }

    const reset = studio.querySelector('[data-studio-reset]');
    if (reset) {
      reset.addEventListener('click', () => {
        Object.assign(state, DEFAULTS);
        render();
      });
    }

    render();
  }

  /* ---------------------------------------------------------
     Featured testimonial rotator
  --------------------------------------------------------- */
  const tf = document.querySelector('[data-testimonials]');

  if (tf) {
    const slides = Array.from(tf.querySelectorAll('.tf-slide'));
    const images = Array.from(tf.querySelectorAll('.tf-img'));
    const dots = Array.from(tf.querySelectorAll('.tf-dot'));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let current = 0;
    let timer = null;

    const show = (n) => {
      current = (n + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
      images.forEach((s, i) => s.classList.toggle('is-active', i === current));
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === current);
        d.setAttribute('aria-selected', String(i === current));
      });
    };

    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const start = () => {
      stop();
      if (!reduced && slides.length > 1) timer = setInterval(() => show(current + 1), 7000);
    };
    const goto = (n) => { show(n); start(); };

    dots.forEach((dot, i) => dot.addEventListener('click', () => goto(i)));
    tf.querySelector('[data-tf-prev]')?.addEventListener('click', () => goto(current - 1));
    tf.querySelector('[data-tf-next]')?.addEventListener('click', () => goto(current + 1));

    // Don't advance out from under someone who is reading or tabbing through.
    tf.addEventListener('mouseenter', stop);
    tf.addEventListener('mouseleave', start);
    tf.addEventListener('focusin', stop);
    tf.addEventListener('focusout', start);

    // Pause while the section is off screen.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach(entry => (entry.isIntersecting ? start() : stop()));
      }, { threshold: 0.25 }).observe(tf);
    }

    show(0);
    start();
  }

  /* ---------------------------------------------------------
     Appointments: prefill from ?gown= / studio selections
  --------------------------------------------------------- */
  const notes = document.querySelector('#notes');
  if (notes && window.location.search) {
    const q = new URLSearchParams(window.location.search);
    const gown = q.get('gown');
    if (gown) {
      const bits = [`I'd love to see ${gown}.`];
      if (q.get('fabric')) bits.push(`Fabric: ${q.get('fabric')}.`);
      if (q.get('train')) bits.push(`Train: ${q.get('train')}.`);
      if (q.get('tone')) bits.push(`Tone: ${q.get('tone')}.`);
      if (q.get('veil') === 'yes') bits.push('Please include a veil in the fitting.');
      notes.value = bits.join(' ');
    }
  }
});
