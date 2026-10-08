/* ============================================================================
   HIDDEN WORLD, progressive enhancement only.
   With JS off every section is still visible and readable; only the header
   tint, mobile menu toggle, star field, scroll reveal and lightbox are absent.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');                       // enables .reveal start state

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------- 1. HEADER + MENU
     Transparent over the hero, solid once the page scrolls. Below 860px the
     nav collapses behind a toggle button.                                    */
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  function onScroll() { header.classList.toggle('is-solid', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 861px)').addEventListener('change', function (e) {
    if (e.matches) setMenu(false);
  });

  /* --------------------------------------------------------------- 2. STARS
     Sparse static dots, ~1 in 5 fluorescent, weighted toward the top.       */
  var starLayers = Array.prototype.slice.call(document.querySelectorAll('[data-stars]'));

  function buildStars(layer) {
    var rect = layer.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    var density = parseFloat(layer.getAttribute('data-density')) || 1;
    var count = Math.round(Math.min(140, Math.max(20, (rect.width * rect.height) / 12000 * density)));
    var frag = document.createDocumentFragment();

    for (var i = 0; i < count; i++) {
      var dot = document.createElement('span');
      var roll = Math.random();
      dot.className = 'star ' + (roll < 0.2 ? 'star--glow' : (roll < 0.6 ? 'star--white' : ''));
      var size = (0.8 + Math.random() * 1.3).toFixed(2);
      dot.style.left = (Math.random() * 100).toFixed(3) + '%';
      dot.style.top = (Math.pow(Math.random(), 2) * 100).toFixed(3) + '%';
      dot.style.width = dot.style.height = size + 'px';
      dot.style.opacity = (0.12 + Math.random() * 0.3).toFixed(2);
      frag.appendChild(dot);
    }
    layer.textContent = '';
    layer.appendChild(frag);
  }

  function buildAllStars() { starLayers.forEach(buildStars); }
  buildAllStars();

  var lastWidth = window.innerWidth, resizeTimer;
  window.addEventListener('resize', function () {
    if (Math.abs(window.innerWidth - lastWidth) < 80) return;
    lastWidth = window.innerWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildAllStars, 250);
  });

  /* ------------------------------------------------------- 3. SCROLL REVEAL */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  function showAll() { revealEls.forEach(function (el) { el.classList.add('is-visible'); }); }

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    revealEls.forEach(function (el) { observer.observe(el); });
  }
  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener('change', function (e) { if (e.matches) showAll(); });
  }

  /* ------------------------------------------------------------ 4. LIGHTBOX
     Each gallery photo is a <button data-full="…">. Opens the largest copy in
     a native <dialog>; Esc, the close button or a click outside the photo
     closes it, and arrow keys / buttons step through the gallery.            */
  var shots = Array.prototype.slice.call(document.querySelectorAll('.shot__media'));
  if (shots.length && window.HTMLDialogElement) {
    var box = document.createElement('dialog');
    box.className = 'lightbox';
    box.setAttribute('aria-label', 'Enlarged photo');
    box.innerHTML =
      '<button class="lightbox__btn lightbox__close" type="button" aria-label="Close">&times;</button>' +
      '<button class="lightbox__btn lightbox__prev" type="button" aria-label="Previous photo">&#8249;</button>' +
      '<button class="lightbox__btn lightbox__next" type="button" aria-label="Next photo">&#8250;</button>' +
      '<figure class="lightbox__fig"><img class="lightbox__img" alt=""><figcaption class="lightbox__cap"></figcaption></figure>';
    document.body.appendChild(box);

    var bigImg = box.querySelector('.lightbox__img');
    var bigCap = box.querySelector('.lightbox__cap');
    var current = 0;

    var show = function (i) {
      current = (i + shots.length) % shots.length;
      var shot = shots[current];
      var img = shot.querySelector('img');
      var cap = shot.parentNode.querySelector('figcaption');
      bigImg.src = shot.getAttribute('data-full') || img.currentSrc || img.src;
      bigImg.alt = img.alt;
      bigCap.textContent = cap ? cap.textContent : '';
    };

    shots.forEach(function (shot, i) {
      shot.addEventListener('click', function () { show(i); box.showModal(); });
    });

    box.querySelector('.lightbox__close').addEventListener('click', function () { box.close(); });
    box.querySelector('.lightbox__prev').addEventListener('click', function () { show(current - 1); });
    box.querySelector('.lightbox__next').addEventListener('click', function () { show(current + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) box.close(); });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
    box.addEventListener('close', function () { shots[current].focus({ preventScroll: true }); });
  }
})();
