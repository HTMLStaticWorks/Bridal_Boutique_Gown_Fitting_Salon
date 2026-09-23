/* ATELIER — Bride Portal dashboard */

document.addEventListener('DOMContentLoaded', () => {
  const tabBtns = document.querySelectorAll('.dashboard-tab-btn');
  const tabContents = document.querySelectorAll('.dashboard-tab-content');

  /* ---------------------------------------------------------
     The rail: a fixed column on wide screens, a left drawer
     below 1440. main.js ignores the hamburger here because
     there is no .mobile-drawer on this page.
  --------------------------------------------------------- */
  const rail = document.getElementById('portalRail');
  const railOverlay = document.querySelector('.overlay');
  const hamburger = document.querySelector('.hamburger');
  const railClose = document.querySelector('.rail-close');

  const setRail = (open) => {
    if (!rail) return;
    rail.classList.toggle('open', open);
    railOverlay?.classList.toggle('show', open);
    document.body.classList.toggle('no-scroll', open);
    hamburger?.setAttribute('aria-expanded', String(open));
  };

  hamburger?.addEventListener('click', () => setRail(!rail.classList.contains('open')));
  railClose?.addEventListener('click', () => setRail(false));
  railOverlay?.addEventListener('click', () => setRail(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && rail?.classList.contains('open')) setRail(false);
  });

  // Returning to the wide layout should clear any drawer state.
  const wide = window.matchMedia('(min-width: 1440px)');
  const onWide = (e) => { if (e.matches) setRail(false); };
  wide.addEventListener ? wide.addEventListener('change', onWide) : wide.addListener(onWide);

  if (tabBtns.length && tabContents.length) {
    tabBtns.forEach(btn => {
      btn.setAttribute('aria-selected', btn.classList.contains('active') ? 'true' : 'false');

      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;

        tabBtns.forEach(b => {
          const on = b.dataset.target === targetId;
          b.classList.toggle('active', on);
          b.setAttribute('aria-selected', String(on));
        });
        tabContents.forEach(c => c.classList.toggle('active', c.id === targetId));

        // Picking a section from the drawer closes it.
        setRail(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  /* A quiet toast, rather than a browser alert. */
  const toast = (message) => {
    let el = document.querySelector('.atelier-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'atelier-toast';
      el.setAttribute('role', 'status');
      Object.assign(el.style, {
        position: 'fixed',
        left: '50%',
        bottom: '32px',
        transform: 'translateX(-50%) translateY(20px)',
        background: 'var(--primary-color)',
        color: 'var(--bg-color)',
        padding: '15px 28px',
        borderRadius: '2px',
        fontSize: '.8rem',
        letterSpacing: '.14em',
        textTransform: 'uppercase',
        boxShadow: 'var(--shadow-lg)',
        zIndex: '2000',
        opacity: '0',
        transition: 'opacity .4s ease, transform .4s cubic-bezier(.22,1,.36,1)',
        pointerEvents: 'none',
        maxWidth: 'calc(100vw - 48px)',
        textAlign: 'center'
      });
      document.body.appendChild(el);
    }

    el.textContent = message;
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateX(-50%) translateY(0)';
    });

    clearTimeout(el._timer);
    el._timer = setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3200);
  };

  document.querySelectorAll('.pay-installment-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toast('Opening secure checkout…');
    });
  });

  document.querySelectorAll('.dashboard-main form').forEach(form => {
    form.addEventListener('submit', e => e.preventDefault());
    form.querySelectorAll('.btn-primary').forEach(btn => {
      btn.addEventListener('click', () => toast('Your details have been saved'));
    });
  });
});
