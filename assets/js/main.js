// Saha Pack — micro-interactions
(() => {
  const root = document.documentElement;
  root.classList.remove('no-js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Where quote requests go until a form backend is connected.
  const CONTACT_EMAIL = 'sales@yourbrand.com';

  // Page-load intro (hero headline, image settle, floating card)
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('is-loaded')));

  // Header: solid on scroll, tucks away when scrolling down
  const header = document.querySelector('.site-header');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    const menuOpen = document.body.classList.contains('menu-open');
    header.classList.toggle('is-hidden', !menuOpen && y > 400 && y > lastY + 4);
    if (y < lastY - 4) header.classList.remove('is-hidden');
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const toggle = document.querySelector('.menu-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', String(open));
      header.classList.remove('is-hidden');
    });
    document.querySelectorAll('.mobile-menu a').forEach((a, i) => {
      a.style.setProperty('--i', i);
      a.addEventListener('click', () => {
        document.body.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Scroll reveal, staggered within groups
  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    group.querySelectorAll('[data-reveal]').forEach((el, i) => el.style.setProperty('--i', i % 8));
  });
  const revealTargets = document.querySelectorAll('[data-reveal], [data-observe]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  // Gentle parallax on marked photos
  const parallax = [...document.querySelectorAll('.photo--parallax img')];
  if (parallax.length && !reduceMotion) {
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      parallax.forEach((img) => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const progress = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.transform = `translateY(${(-progress * 24).toFixed(1)}px)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  // Quote form: validation, loading and success states
  const form = document.querySelector('[data-quote-form]');
  if (form) {
    const btn = form.querySelector('button[type="submit"]');
    const label = btn.querySelector('.btn__label');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let firstInvalid = null;
      form.querySelectorAll('[required]').forEach((input) => {
        const field = input.closest('.field');
        const ok = input.checkValidity();
        field.classList.toggle('is-invalid', !ok);
        if (!ok && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) { firstInvalid.focus(); return; }

      const data = new FormData(form);
      const body = [...data.entries()].map(([k, v]) => `${k}: ${v}`).join('\n');
      btn.classList.add('is-loading');
      btn.disabled = true;
      label.textContent = 'Sending';
      setTimeout(() => {
        btn.classList.remove('is-loading');
        btn.classList.add('is-done');
        label.textContent = 'Opening your email';
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Packaging quote request')}&body=${encodeURIComponent(body)}`;
        setTimeout(() => {
          btn.classList.remove('is-done');
          btn.disabled = false;
          label.textContent = 'Send request';
        }, 3200);
      }, 700);
    });
    form.addEventListener('input', (e) => {
      const field = e.target.closest('.field');
      if (field && e.target.checkValidity()) field.classList.remove('is-invalid');
    });
  }

  // Products page: category filter + search
  const filters = document.querySelector('[data-filters]');
  const grid = document.querySelector('[data-product-grid]');
  if (filters && grid) {
    const chips = [...filters.querySelectorAll('.chip')];
    const pill = filters.querySelector('.filters__pill');
    const cards = [...grid.querySelectorAll('.card')];
    const search = document.querySelector('[data-search]');
    const countEl = document.querySelector('[data-count]');
    const empty = document.querySelector('[data-empty]');
    let active = 'all';

    const movePill = () => {
      const chip = chips.find((c) => c.dataset.filter === active);
      if (!chip || !pill) return;
      pill.style.width = `${chip.offsetWidth}px`;
      pill.style.height = `${chip.offsetHeight}px`;
      pill.style.transform = `translate(${chip.offsetLeft}px, ${chip.offsetTop}px)`;
    };

    const apply = () => {
      const q = (search?.value || '').trim().toLowerCase();
      const show = [];
      const hide = [];
      cards.forEach((card) => {
        const matchCat = active === 'all' || card.dataset.cat === active;
        const matchText = !q || card.dataset.name.includes(q) || card.dataset.cat.includes(q);
        (matchCat && matchText ? show : hide).push(card);
      });
      hide.forEach((c) => c.classList.add('is-hiding'));
      setTimeout(() => {
        hide.forEach((c) => { c.hidden = true; });
        show.forEach((c, i) => {
          const wasHidden = c.hidden;
          c.hidden = false;
          if (wasHidden || c.classList.contains('is-hiding')) {
            c.classList.add('is-hiding');
            setTimeout(() => c.classList.remove('is-hiding'), 20 + Math.min(i, 10) * 25);
          }
        });
        countEl.textContent = show.length;
        empty.classList.toggle('is-shown', show.length === 0);
      }, reduceMotion ? 0 : 180);
    };

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        active = chip.dataset.filter;
        chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
        movePill();
        apply();
      });
    });
    search?.addEventListener('input', apply);
    window.addEventListener('resize', movePill);
    document.fonts?.ready.then(movePill);
    movePill();
  }

  // Footer year
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
