/* ==========================================================
   Muhammad Farhan – Portfolio  |  script.js  (vanilla JS)
   1 Preloader · 2 Navbar · 3 Scroll reveal · 4 Counters
   5 Active nav link · 6 Back to top · 7 Contact form
   ========================================================== */
(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. PRELOADER ------------------------------------------ */
  const preloader = $('#preloader');
  const hidePreloader = () => preloader && preloader.classList.add('hide');
  window.addEventListener('load', () => setTimeout(hidePreloader, 350));
  setTimeout(hidePreloader, 3000); // safety net if a CDN is slow

  /* 2. NAVBAR: sticky style + close mobile menu on click --- */
  const nav = $('#mainNav');
  const navMenu = $('#navMenu');
  const onScrollNav = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  onScrollNav();

  $$('#navMenu a').forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('show') && window.bootstrap) {
        bootstrap.Collapse.getOrCreateInstance(navMenu).hide();
      }
    });
  });

  /* 3. SCROLL REVEAL -------------------------------------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = (i % 3) * 80 + 'ms'; // light stagger
      io.observe(el);
    });
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* 4. ANIMATED COUNTERS ----------------------------------- */
  // Resolve each counter's target value from verified data only.
  function resolveTarget(el) {
    if (el.dataset.since) {
      // Years since a start date given as YYYY-MM (Aug 2024 per resume).
      const [y, m] = el.dataset.since.split('-').map(Number);
      const now = new Date();
      const months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
      return Math.max(1, Math.floor(months / 12));
    }
    if (el.dataset.auto === 'tech') {
      // Count distinct technologies listed in the Skills section.
      const names = $$('#skillGroups .skill-list li').map(li => li.textContent.trim().toLowerCase());
      return new Set(names).size;
    }
    return parseInt(el.dataset.count, 10) || 0;
  }

  function animateCounter(el) {
    const target = resolveTarget(el);
    const sup = el.parentElement.querySelector('sup');
    if (target === 0) { // placeholder: show a dash instead of an invented/zero figure
      el.textContent = '—';
      if (sup) sup.style.display = 'none';
      return;
    }
    if (reduceMotion) { el.textContent = target; return; }
    const duration = 1600;
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))); // ease-out
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const counters = $$('.counter');
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { animateCounter(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(c => cio.observe(c));
  } else {
    counters.forEach(animateCounter);
  }

  /* 5. ACTIVE NAV LINK (scroll spy) ------------------------ */
  const navLinks = $$('.navbar .nav-link');
  const sections = navLinks
    .map(a => $(a.getAttribute('href')))
    .filter(Boolean);

  function setActive() {
    const marker = window.scrollY + window.innerHeight * 0.35;
    let current = sections[0];
    sections.forEach(sec => { if (sec.offsetTop <= marker) current = sec; });
    // Sub-sections map to their parent nav item
    const extra = { stats: 'about', education: 'experience', strengths: 'skills' };
    Object.keys(extra).forEach(id => {
      const s = document.getElementById(id);
      if (s && s.offsetTop <= marker && s.offsetTop > current.offsetTop) current = document.getElementById(extra[id]);
    });
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current.id));
  }

  /* 6. BACK TO TOP ----------------------------------------- */
  const toTop = $('#backToTop');
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScrollNav();
      setActive();
      toTop.classList.toggle('show', window.scrollY > 600);
      ticking = false;
    });
  }, { passive: true });
  setActive();

  /* 7. CONTACT FORM ----------------------------------------
     No backend is connected, so nothing is "delivered" by this page.
     Option A (default): after validation, opens the visitor's email app
                         with the message pre-filled (mailto).
     Option B: set FORM_ENDPOINT to a form service URL (e.g. Formspree)
               and the form will POST there and report the real result.   */
  const FORM_ENDPOINT = '';                       // e.g. 'https://formspree.io/f/xxxxxxx'
  const RECIPIENT = 'mohdfarhan170820054@gmail.com';

  const form = $('#contactForm');
  const alertBox = $('#formAlert');

  function showAlert(type, html) {
    alertBox.className = type === 'ok' ? 'ok' : 'err';
    alertBox.innerHTML = html;
    alertBox.classList.remove('d-none');
  }

  // Live feedback once a field has been touched
  $$('.form-control', form).forEach(field => {
    field.addEventListener('blur', () => field.classList.add('touched'));
    field.addEventListener('input', () => {
      if (field.classList.contains('touched') || field.classList.contains('is-invalid')) {
        field.classList.toggle('is-invalid', !field.checkValidity());
        field.classList.toggle('is-valid', field.checkValidity() && field.value.trim() !== '');
      }
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    alertBox.classList.add('d-none');

    let valid = true;
    $$('.form-control', form).forEach(f => {
      f.value = f.value.trim();
      const ok = f.checkValidity();
      f.classList.toggle('is-invalid', !ok);
      f.classList.toggle('is-valid', ok && f.value !== '');
      if (!ok) valid = false;
    });
    if (!valid) {
      showAlert('err', '<i class="bi bi-exclamation-triangle me-2"></i>Please fix the highlighted fields and try again.');
      const firstBad = $('.is-invalid', form);
      if (firstBad) firstBad.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());

    if (FORM_ENDPOINT) {
      const btn = $('button[type="submit"]', form);
      btn.disabled = true;
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Request failed');
        showAlert('ok', '<i class="bi bi-check-circle me-2"></i>Thanks! Your message has been sent.');
        form.reset();
        $$('.form-control', form).forEach(f => f.classList.remove('is-valid', 'touched'));
      } catch (err) {
        showAlert('err', '<i class="bi bi-x-circle me-2"></i>Sorry, the message could not be sent. Please email <a href="mailto:' + RECIPIENT + '">' + RECIPIENT + '</a> directly.');
      } finally {
        btn.disabled = false;
      }
      return;
    }

    // Default: mailto fallback (honest – the visitor still has to press Send in their email app)
    const body = 'Name: ' + data.name + '\nEmail: ' + data.email + '\nPhone: ' + (data.phone || '-') + '\n\n' + data.message;
    window.location.href = 'mailto:' + RECIPIENT + '?subject=' + encodeURIComponent(data.subject) + '&body=' + encodeURIComponent(body);
    showAlert('ok', '<i class="bi bi-envelope-check me-2"></i>Your email app should now open with the message ready. Press <strong>Send</strong> there to deliver it. If nothing opens, write to <a href="mailto:' + RECIPIENT + '">' + RECIPIENT + '</a>.');
  });
})();
