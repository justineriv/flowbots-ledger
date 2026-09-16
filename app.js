/* FlowBots.ai — Runbook direction
   Behaviour only. No motion that moves layout; nothing hidden without JS. */
(function () {
  'use strict';

  /* ---- mobile nav ---- */
  var tog = document.querySelector('.nav-tog');
  var mnav = document.getElementById('mnav');
  if (tog && mnav) {
    tog.addEventListener('click', function () {
      var open = mnav.hasAttribute('data-open');
      if (open) { mnav.removeAttribute('data-open'); } else { mnav.setAttribute('data-open', ''); }
      tog.setAttribute('aria-expanded', open ? 'false' : 'true');
      tog.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
    });
    mnav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        mnav.removeAttribute('data-open');
        tog.setAttribute('aria-expanded', 'false');
        tog.setAttribute('aria-label', 'Open menu');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mnav.hasAttribute('data-open')) { tog.click(); tog.focus(); }
    });
  }

  /* ---- CTA event reporting.
         dataLayer and gtag are written and start reporting the moment a
         GA4 measurement ID or GTM container exists. Nothing receives them yet. ---- */
  function track(name, params) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, params || {}));
    if (typeof window.gtag === 'function') { window.gtag('event', name, params || {}); }
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-track]') : null;
    if (!el) return;
    var id = el.getAttribute('data-track');
    if (el.getAttribute('href') && el.getAttribute('href').indexOf('tel:') === 0) {
      track('phone_click', { placement: id });
    } else {
      track('cta_click', { placement: id, label: (el.textContent || '').trim() });
    }
  });

  document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
    if (a.hasAttribute('data-track')) return;
    a.addEventListener('click', function () { track('phone_click', { placement: 'inline' }); });
  });

  /* ---- assessment form.
         Validates, then says plainly that nothing was sent. There is no endpoint.
         Wiring this to a placeholder would be worse than a visibly disconnected form. ---- */
  var form = document.getElementById('af');
  var ok = document.getElementById('af-ok');
  if (form && ok) {
    var started = false;
    form.addEventListener('input', function () {
      if (!started) { started = true; track('form_start', { form: 'assessment' }); }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      form.querySelectorAll('[required]').forEach(function (f) {
        var wrap = f.closest('.fld');
        var val = f.value.trim();
        var good = val !== '' && (f.type !== 'email' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val));
        if (good) {
          wrap.removeAttribute('data-bad');
          f.removeAttribute('aria-invalid');
        } else {
          wrap.setAttribute('data-bad', '');
          f.setAttribute('aria-invalid', 'true');
          if (!bad) bad = f;
        }
      });
      if (bad) { bad.focus(); return; }

      track('form_submit', { form: 'assessment' });
      ok.hidden = false;
      ok.innerHTML = 'This is a design preview, so nothing was sent. ' +
        'To get your assessment now, call <a href="tel:+15047174837">(504) 717-4837</a> ' +
        'or <a href="https://www.flowbots.ai/book-call/">book a free discovery call</a>.';
      ok.focus && ok.focus();
      form.querySelectorAll('input,textarea,button').forEach(function (f) { f.disabled = true; });
    });
  }

  /* ---- sticky bar reveal + scroll depth.
         The bar is shown only once the hero's primary CTA has left the
         viewport. At the top of the page that CTA is on screen, so the bar has
         no job there and would cover the hero trust line. Body padding is
         identical in both states, so nothing shifts.

         The state must match the CTA's visibility at ALL times, and a scroll
         event is not the only way the page moves. A hash jump on load, an
         in-page anchor, and a back/forward restore each reposition the page
         without firing one. Binding the sync to scroll alone left the bar
         hidden for anyone who did not arrive at the top. ---- */
  var heroCta = document.querySelector('[data-track="cta-hero"]');
  var bar = document.querySelector('.sticky');
  var syncBar = function () {
    if (!heroCta || !bar) return;
    bar.classList.toggle('is-on', heroCta.getBoundingClientRect().bottom <= 0);
  };
  /* A hash jump repositions the page after the current frame, so read again
     once layout has settled rather than trusting the first measurement. */
  var syncBarSettled = function () {
    syncBar();
    window.requestAnimationFrame(syncBar);
  };

  /* ---- scroll depth ---- */
  var marks = [25, 50, 75, 100], hit = {};
  var onScroll = function () {
    syncBar();
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    if (max <= 0) return;
    var pct = (h.scrollTop / max) * 100;
    for (var i = 0; i < marks.length; i++) {
      if (pct >= marks[i] && !hit[marks[i]]) {
        hit[marks[i]] = 1;
        track('scroll_depth', { percent: marks[i] });
      }
    }
  };
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', syncBar, { passive: true });
  window.addEventListener('hashchange', syncBarSettled, { passive: true });
  window.addEventListener('pageshow', syncBarSettled, { passive: true });
  window.addEventListener('load', syncBarSettled);
  syncBarSettled();
})();
