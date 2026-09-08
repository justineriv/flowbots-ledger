/* FlowBots design preview — behaviour only.
   Motion state comes from html.motion-on, set by the head script before first
   paint. Nothing here decides whether the page is readable. */
(function(){
'use strict';
var doc = document, root = doc.documentElement;
var motion = root.classList.contains('motion-on');

/* ---- mobile nav ------------------------------------------------------- */
var tog = doc.querySelector('.nav-tog'), mnav = doc.getElementById('mnav');
if (tog && mnav) {
  tog.addEventListener('click', function () {
    var open = tog.getAttribute('aria-expanded') === 'true';
    tog.setAttribute('aria-expanded', String(!open));
    mnav.hidden = open;
    mnav.style.display = open ? '' : 'block';
  });
  mnav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      tog.setAttribute('aria-expanded', 'false');
      mnav.hidden = true; mnav.style.display = '';
    }
  });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && tog.getAttribute('aria-expanded') === 'true') {
      tog.setAttribute('aria-expanded', 'false');
      mnav.hidden = true; mnav.style.display = ''; tog.focus();
    }
  });
}

/* ---- scroll reveal ----------------------------------------------------
   JS arms the hidden state, so if this script never runs the content is
   simply visible. A CSS-only hide has shipped invisible content before. */
var targets = [].slice.call(doc.querySelectorAll('.reveal'));
if (motion && targets.length && 'IntersectionObserver' in window) {
  targets.forEach(function (el) { el.classList.add('armed'); });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -18% 0px', threshold: 0 });

  targets.forEach(function (el) { io.observe(el); });

  /* Failsafe. If the observer never fires — a frozen clock, a scroll timeline
     that does not resolve, a container that never scrolls — everything is
     shown rather than left hidden. Disarm is unconditional. */
  var failsafe = setTimeout(function () {
    targets.forEach(function (el) { el.classList.remove('armed'); el.classList.add('in'); });
  }, 2600);
  window.addEventListener('pagehide', function () { clearTimeout(failsafe); });
}

/* ---- count-ups --------------------------------------------------------- */
var nums = [].slice.call(doc.querySelectorAll('[data-count]'));
if (motion && nums.length && 'IntersectionObserver' in window) {
  var nio = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target, to = parseFloat(el.getAttribute('data-count'));
      var pre = el.getAttribute('data-pre') || '', suf = el.getAttribute('data-suf') || '';
      var dec = (String(to).split('.')[1] || '').length, t0 = 0;
      (function step(ts) {
        if (!t0) t0 = ts;
        var k = Math.min(1, (ts - t0) / 900);
        var v = to * (1 - Math.pow(1 - k, 3));
        el.textContent = pre + v.toFixed(dec) + suf;
        if (k < 1) requestAnimationFrame(step);
      })(performance.now());
      nio.unobserve(el);
    });
  }, { threshold: .4 });
  nums.forEach(function (el) { nio.observe(el); });
}

/* ---- form -------------------------------------------------------------
   The endpoint does not exist yet. Rather than post into the void or fake a
   success, the form validates for real and then says plainly that nothing
   was sent, and gives a route that does work. */
var form = doc.querySelector('form');
if (form) {
  var msg = form.querySelector('.fmsg');

  function fail(field, text) {
    var row = field.closest('.fr');
    row.classList.add('err');
    if (!row.querySelector('.fr-err')) {
      var s = doc.createElement('span');
      s.className = 'fr-err'; s.textContent = text;
      field.insertAdjacentElement('afterend', s);
    }
    field.setAttribute('aria-invalid', 'true');
  }
  function clear(field) {
    var row = field.closest('.fr');
    row.classList.remove('err');
    var e = row.querySelector('.fr-err'); if (e) e.remove();
    field.removeAttribute('aria-invalid');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true, first = null;
    [].slice.call(form.querySelectorAll('input[required]')).forEach(function (f) {
      clear(f);
      var v = f.value.trim();
      if (!v) { fail(f, 'This field is required.'); ok = false; first = first || f; return; }
      if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        fail(f, 'Enter an email address like name@company.com'); ok = false; first = first || f;
      }
      if (f.type === 'tel' && v.replace(/\D/g, '').length < 10) {
        fail(f, 'Enter a 10-digit phone number.'); ok = false; first = first || f;
      }
    });
    if (!ok) { if (first) first.focus(); return; }

    msg.hidden = false;
    msg.innerHTML = '<b>Design preview — nothing was sent.</b>' +
      'This form is not connected to an endpoint yet, so no one has been contacted. ' +
      'To reach FlowBots now, call <a href="tel:+15047174837">(504) 717-4837</a> or ' +
      '<a href="https://www.flowbots.ai/book-call/">book a call</a>.';
    msg.scrollIntoView({ block: 'nearest', behavior: motion ? 'smooth' : 'auto' });
  });

  form.addEventListener('input', function (e) {
    if (e.target.matches('input,textarea') && e.target.closest('.fr.err')) clear(e.target);
  });
}

/* ---- conversion events -------------------------------------------------
   These pushes go into window.dataLayer and stop there. Nothing consumes them
   yet: a GTM container snippet (or gtag.js) has to be installed in the page
   and configured to read these event names before anything reaches GA4.
   Named and shaped so that wiring is a tag install, not a rewrite. */
window.dataLayer = window.dataLayer || [];
doc.addEventListener('click', function (e) {
  var a = e.target.closest('[data-track]');
  if (!a) return;
  window.dataLayer.push({
    event: 'cta_click',
    cta_id: a.getAttribute('data-track'),
    cta_text: (a.textContent || '').trim(),
    cta_href: a.getAttribute('href')
  });
}, true);
})();
