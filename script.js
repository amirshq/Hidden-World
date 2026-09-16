/* ============================================================================
   HIDDEN WORLD — progressive enhancement only.
   Nothing here is required to read the page: with JS off, every section is
   visible, only the star field and scroll-reveal are absent.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');                       // enables .reveal start state

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------------------ 1. STARS
     Small absolutely-positioned dots: mostly white/--ice, ~1 in 5 in --glow,
     varied size + low opacity, concentrated near the top of each section.
     Static — no twinkle, the page reads as a document, not a screensaver.     */
  var starLayers = Array.prototype.slice.call(document.querySelectorAll('[data-stars]'));

  function buildStars(layer) {
    var rect = layer.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    var density = parseFloat(layer.getAttribute('data-density')) || 1;
    // ~1 star per 11000px² of section area, clamped to a sane range.
    var count = Math.round(Math.min(150, Math.max(20, (rect.width * rect.height) / 11000 * density)));

    var frag = document.createDocumentFragment();

    for (var i = 0; i < count; i++) {
      var dot = document.createElement('span');
      var roll = Math.random();

      // 1 in 5 fluorescent, the rest white / ice
      dot.className = 'star ' + (roll < 0.2 ? 'star--glow' : (roll < 0.6 ? 'star--white' : ''));

      // Top-weighted vertical distribution: pow() pushes most dots upward.
      var y = Math.pow(Math.random(), 2.2) * 100;
      var size = (0.8 + Math.random() * 1.4).toFixed(2);      // 0.8 – 2.2 px
      var opacity = (0.14 + Math.random() * 0.34).toFixed(2); // stays subtle

      dot.style.left = (Math.random() * 100).toFixed(3) + '%';
      dot.style.top = y.toFixed(3) + '%';
      dot.style.width = size + 'px';
      dot.style.height = size + 'px';
      dot.style.opacity = opacity;

      frag.appendChild(dot);
    }

    layer.textContent = '';
    layer.appendChild(frag);
  }

  function buildAllStars() { starLayers.forEach(buildStars); }
  buildAllStars();

  // Rebuild on meaningful width changes only (avoids mobile URL-bar thrash).
  var lastWidth = window.innerWidth, resizeTimer;
  window.addEventListener('resize', function () {
    if (Math.abs(window.innerWidth - lastWidth) < 80) return;
    lastWidth = window.innerWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildAllStars, 250);
  });

  /* --------------------------------------------------------- 2. SCROLL REVEAL */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  function showAll() { revealEls.forEach(function (el) { el.classList.add('is-visible'); }); }

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);            // reveal once, then stop watching
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

    revealEls.forEach(function (el) { observer.observe(el); });
  }

  // If the motion preference flips mid-session, make sure nothing stays hidden.
  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener('change', function (e) {
      if (e.matches) showAll();
    });
  }

  /* ------------------------------------------------------- 3. SMOOTH ANCHORS */
  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!link) return;

    var id = link.getAttribute('href');
    if (!id || id === '#') return;

    var target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });

    // Keep keyboard focus in sync with the new position.
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });

    if (history.replaceState) history.replaceState(null, '', id);
  });

  /* ------------------------------------------------- 4. STICKY NAV BACKGROUND */
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 24); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------ 5. MISSING-IMAGE FALLBACK
     If an asset is absent, keep the layout intact: the wrapper already draws a
     navy box with the accent ring, so we just flag it and hide the broken img. */
  Array.prototype.forEach.call(document.images, function (img) {
    var flag = function () {
      var box = img.closest('.frame__media, .portrait');
      if (box) box.classList.add('is-missing');
      img.setAttribute('aria-hidden', 'true');
    };
    if (img.complete && img.naturalWidth === 0) flag();
    img.addEventListener('error', flag);
  });
})();
