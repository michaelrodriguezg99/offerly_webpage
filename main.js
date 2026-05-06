/* =============================================================================
   OFFERLY. — MAIN.JS
   Cinematic hero background · GSAP animations · Scroll reveals · Form
   ============================================================================= */

(function () {
  'use strict';

  /* =========================================================================
     01. CINEMATIC HERO BACKGROUND
     Warm, editorial depth: layered radial blobs drift autonomously and
     respond to mouse position with per-layer parallax — all raw canvas API.
     ========================================================================= */

  (function initHeroCanvas() {
    var canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var W, H;

    /* ---- Mouse state ---- */
    var mouseNX   = 0.5;   // normalized 0–1, target
    var mouseNY   = 0.5;
    var lerpNX    = 0.5;   // smoothed current
    var lerpNY    = 0.5;
    var LERP      = 0.045; // lower = smoother / more cinematic lag

    /* ---- Blob definitions ----
       Each blob is a large soft radial gradient circle.
       parallax: how strongly it responds to mouse (higher = more movement).
       The spread of parallax values creates the depth illusion.
       Colors stay within the brand warm palette so nothing clashes with
       the --bg (#FAFAF8) background.
    */
    var BLOBS = [
      /* Large atmospheric anchor — barely moves */
      { nx: 0.18, ny: 0.42, r: 480, parallax: 10, dx:  0.000055, dy:  0.000040, c: [200, 193, 183], a: 0.52 },
      /* Mid-right warm mass */
      { nx: 0.78, ny: 0.55, r: 560, parallax: 22, dx: -0.000040, dy:  0.000060, c: [218, 211, 200], a: 0.45 },
      /* Top-center light wash */
      { nx: 0.50, ny: 0.12, r: 340, parallax: 35, dx:  0.000070, dy:  0.000030, c: [195, 188, 177], a: 0.38 },
      /* Bottom-left subtle tint */
      { nx: 0.28, ny: 0.82, r: 400, parallax: 18, dx: -0.000035, dy: -0.000050, c: [210, 203, 192], a: 0.35 },
      /* Small accent — most reactive to mouse */
      { nx: 0.62, ny: 0.30, r: 240, parallax: 48, dx:  0.000090, dy: -0.000060, c: [190, 183, 172], a: 0.32 },
    ];

    /* ---- Motes: tiny floating dust particles ----
       Very low opacity, each carries a different parallax factor
       so they appear to float at different depths.
    */
    var motes = [];
    var MOTE_COUNT = 28;

    function buildMotes() {
      motes = [];
      for (var i = 0; i < MOTE_COUNT; i++) {
        motes.push({
          nx:       Math.random(),
          ny:       Math.random(),
          r:        Math.random() * 3.0 + 1.5,
          parallax: Math.random() * 55 + 8,
          dx:       (Math.random() - 0.5) * 0.000120,
          dy:       (Math.random() - 0.5) * 0.000120,
          a:        Math.random() * 0.18 + 0.10,
        });
      }
    }

    function resize() {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W;
      canvas.height = H;
    }

    /* ---- Draw one frame ---- */
    function draw() {
      ctx.clearRect(0, 0, W, H);

      /* Smooth lerp toward mouse */
      lerpNX += (mouseNX - lerpNX) * LERP;
      lerpNY += (mouseNY - lerpNY) * LERP;

      /* Offset from centre (0.5) — in pixels */
      var ox = (lerpNX - 0.5);
      var oy = (lerpNY - 0.5);

      /* ---- Blobs ---- */
      BLOBS.forEach(function (b) {
        /* Slow autonomous drift (bounces at soft boundary) */
        b.nx += b.dx;
        b.ny += b.dy;
        if (b.nx < -0.05 || b.nx > 1.05) b.dx *= -1;
        if (b.ny < -0.05 || b.ny > 1.05) b.dy *= -1;

        /* Canvas position = natural position + parallax offset */
        var cx = b.nx * W + ox * b.parallax;
        var cy = b.ny * H + oy * b.parallax;

        var grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, b.r);
        grd.addColorStop(0,   'rgba(' + b.c[0] + ',' + b.c[1] + ',' + b.c[2] + ',' + b.a + ')');
        grd.addColorStop(0.5, 'rgba(' + b.c[0] + ',' + b.c[1] + ',' + b.c[2] + ',' + (b.a * 0.35) + ')');
        grd.addColorStop(1,   'rgba(' + b.c[0] + ',' + b.c[1] + ',' + b.c[2] + ', 0)');

        ctx.beginPath();
        ctx.arc(cx, cy, b.r, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      });

      /* ---- Motes ---- */
      motes.forEach(function (m) {
        m.nx += m.dx;
        m.ny += m.dy;
        if (m.nx < 0 || m.nx > 1) m.dx *= -1;
        if (m.ny < 0 || m.ny > 1) m.dy *= -1;

        var cx = m.nx * W + ox * m.parallax;
        var cy = m.ny * H + oy * m.parallax;

        ctx.beginPath();
        ctx.arc(cx, cy, m.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(26, 26, 26, ' + m.a + ')';
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    /* ---- Mouse tracking on the hero section ---- */
    var heroSection = canvas.parentElement;
    heroSection.addEventListener('mousemove', function (e) {
      var rect = heroSection.getBoundingClientRect();
      mouseNX = (e.clientX - rect.left) / rect.width;
      mouseNY = (e.clientY - rect.top)  / rect.height;
    });

    /* Reset when mouse leaves so it drifts back to centre */
    heroSection.addEventListener('mouseleave', function () {
      mouseNX = 0.5;
      mouseNY = 0.5;
    });

    /* ---- Init & resize handling ---- */
    resize();
    buildMotes();
    draw();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
      }, 150);
    });
  })();


  /* =========================================================================
     02. PAGE ENTRANCE FADE-IN
     ========================================================================= */

  function initPageEntrance() {
    if (typeof gsap === 'undefined') return;
    gsap.from(document.body, {
      opacity: 0,
      duration: 0.55,
      ease: 'power1.out',
      clearProps: 'opacity',
    });
  }


  /* =========================================================================
     03. PAGE TRANSITIONS — fade out on internal link click
     ========================================================================= */

  function initPageTransitions() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;

      var href = link.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#')) return;
      if (href.startsWith('http://') || href.startsWith('https://')) return;
      if (href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (link.hasAttribute('target')) return;

      e.preventDefault();
      var destination = href;

      if (typeof gsap !== 'undefined') {
        gsap.to(document.body, {
          opacity: 0,
          duration: 0.28,
          ease: 'power1.in',
          onComplete: function () { window.location.href = destination; },
        });
      } else {
        document.body.style.transition = 'opacity 0.3s';
        document.body.style.opacity = '0';
        setTimeout(function () { window.location.href = destination; }, 300);
      }
    });
  }


  /* =========================================================================
     04. NAVBAR — scroll class + active link + mobile menu
     ========================================================================= */

  function initNavbar() {
    var nav = document.getElementById('navbar');
    if (!nav) return;

    /* Scroll-triggered border + blur */
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
    nav.classList.toggle('scrolled', window.scrollY > 60);

    /* Active nav link */
    var currentFile = window.location.pathname.split('/').pop() || 'index.html';
    nav.querySelectorAll('.nav-links a').forEach(function (link) {
      if (link.getAttribute('href').split('/').pop() === currentFile) {
        link.classList.add('active');
      }
    });

    /* Mobile hamburger */
    var toggle   = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');
    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('nav-open');
      toggle.classList.toggle('active', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('nav-open');
        toggle.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('click', function (e) {
      if (
        navLinks.classList.contains('nav-open') &&
        !navLinks.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        navLinks.classList.remove('nav-open');
        toggle.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }


  /* =========================================================================
     05. HERO HEADLINE — staggered word reveal (GSAP)
     ========================================================================= */

  function initHeroHeadline() {
    if (typeof gsap === 'undefined') return;

    var lines    = document.querySelectorAll('.hero-headline .hero-line');
    if (!lines.length) return;

    var allWords = [];
    lines.forEach(function (line) {
      var words = line.textContent.trim().split(/\s+/);
      line.innerHTML = words
        .map(function (w) { return '<span class="word" style="display:inline-block;">' + w + '</span>'; })
        .join(' ');
      allWords = allWords.concat(Array.from(line.querySelectorAll('.word')));
    });

    var sub  = document.querySelector('.hero-sub');
    var ctas = document.querySelector('.hero-ctas');

    gsap.from(allWords, {
      opacity: 0,
      y: 44,
      duration: 0.9,
      stagger: 0.11,
      ease: 'power3.out',
      delay: 0.2,
    });

    if (sub) {
      gsap.from(sub, {
        opacity: 0, y: 20, duration: 0.8, ease: 'power2.out',
        delay: 0.2 + allWords.length * 0.11 * 0.55,
      });
    }
    if (ctas) {
      gsap.from(ctas, {
        opacity: 0, y: 20, duration: 0.8, ease: 'power2.out',
        delay: 0.2 + allWords.length * 0.11 * 0.55 + 0.14,
      });
    }
  }


  /* =========================================================================
     06. SCROLL ANIMATIONS — headings, cards, timeline (GSAP ScrollTrigger)
     ========================================================================= */

  function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      document.querySelectorAll('.anim-heading, .anim-card').forEach(function (el) {
        el.style.opacity = '1';
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    /* Section headings */
    document.querySelectorAll('.anim-heading').forEach(function (el) {
      gsap.from(el, {
        opacity: 0, y: 32, duration: 0.85, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 87%', toggleActions: 'play none none none' },
      });
    });

    /* Card grids — staggered */
    document.querySelectorAll('.cards-grid, .steps-preview-grid, .stats-grid, .cs-grid, .trust-grid').forEach(function (grid) {
      var cards = grid.querySelectorAll('.anim-card');
      if (!cards.length) return;
      gsap.from(cards, {
        opacity: 0, y: 36, duration: 0.75, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: grid, start: 'top 82%', toggleActions: 'play none none none' },
      });
    });

    /* Team grid */
    var teamGrid = document.querySelector('.team-grid');
    if (teamGrid) {
      gsap.from(teamGrid.querySelectorAll('.team-card'), {
        opacity: 0, y: 36, duration: 0.75, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: teamGrid, start: 'top 82%', toggleActions: 'play none none none' },
      });
    }

    /* Full-page timeline steps (how-it-works page) */
    document.querySelectorAll('.timeline-step').forEach(function (step, i) {
      var numEl     = step.querySelector('.tl-number');
      var contentEl = step.querySelector('.tl-content-col');
      var isEven    = i % 2 === 1;

      if (numEl) {
        gsap.from(numEl, {
          opacity: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: step, start: 'top 80%', toggleActions: 'play none none none' },
        });
      }
      if (contentEl) {
        gsap.from(contentEl, {
          opacity: 0, x: isEven ? -28 : 28, duration: 0.85, delay: 0.2, ease: 'power2.out',
          scrollTrigger: { trigger: step, start: 'top 80%', toggleActions: 'play none none none' },
        });
      }
    });

    /* Inner-page hero */
    var pageHeroInner = document.querySelector('.page-hero-inner');
    if (pageHeroInner) {
      gsap.from(
        [pageHeroInner.querySelector('.page-label'),
         pageHeroInner.querySelector('.page-heading'),
         pageHeroInner.querySelector('.page-sub')].filter(Boolean),
        { opacity: 0, y: 28, duration: 0.8, stagger: 0.12, ease: 'power2.out', delay: 0.25 }
      );
    }

    /* About mission columns */
    var missionQuote = document.querySelector('.mission-quote');
    var missionText  = document.querySelector('.mission-text-col');
    if (missionQuote) {
      gsap.from(missionQuote, {
        opacity: 0, x: -24, duration: 0.85, ease: 'power2.out',
        scrollTrigger: { trigger: missionQuote, start: 'top 82%', toggleActions: 'play none none none' },
      });
    }
    if (missionText) {
      gsap.from(missionText.querySelectorAll('p'), {
        opacity: 0, y: 20, duration: 0.7, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: missionText, start: 'top 82%', toggleActions: 'play none none none' },
      });
    }

    /* Platform pills */
    var pills = document.querySelectorAll('.pill');
    if (pills.length) {
      gsap.from(pills, {
        opacity: 0, y: 16, duration: 0.6, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: pills[0], start: 'top 85%', toggleActions: 'play none none none' },
      });
    }

    /* Revenue diagram */
    var revDiagram = document.querySelector('.rev-diagram');
    if (revDiagram) {
      gsap.from(revDiagram, {
        opacity: 0, scale: 0.96, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: revDiagram, start: 'top 80%', toggleActions: 'play none none none' },
      });
    }

    /* Contact form card */
    var formCard = document.querySelector('.form-card');
    if (formCard) {
      gsap.from(formCard, {
        opacity: 0, y: 28, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: formCard, start: 'top 85%', toggleActions: 'play none none none' },
      });
    }
  }


  /* =========================================================================
     07. ANIMATED COUNTERS (case-studies page)
     ========================================================================= */

  function initCounters() {
    var counterEls = document.querySelectorAll('.stat-number[data-target]');
    if (!counterEls.length) return;

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      counterEls.forEach(function (el) {
        var target = parseFloat(el.getAttribute('data-target')) || 0;
        var prefix = el.getAttribute('data-prefix') || '';
        var suffix = el.getAttribute('data-suffix') || '';

        if (target === 0) { el.textContent = prefix + '0' + suffix; return; }

        var obj = { val: 0 };
        ScrollTrigger.create({
          trigger: el, start: 'top 80%', once: true,
          onEnter: function () {
            gsap.to(obj, {
              val: target, duration: 2.2, ease: 'power2.out',
              onUpdate:  function () { el.textContent = prefix + Math.round(obj.val) + suffix; },
              onComplete: function () { el.textContent = prefix + target + suffix; },
            });
          },
        });
      });
    } else {
      counterEls.forEach(function (el) {
        el.textContent = (el.getAttribute('data-prefix') || '') +
                         (el.getAttribute('data-target') || '0') +
                         (el.getAttribute('data-suffix') || '');
      });
    }
  }


  /* =========================================================================
     08. CONTACT FORM — submit → success state
     ========================================================================= */

  function initContactForm() {
    var form        = document.getElementById('contactForm');
    var formWrapper = document.getElementById('formWrapper');
    var successEl   = document.getElementById('formSuccess');
    if (!form || !formWrapper || !successEl) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      if (typeof gsap !== 'undefined') {
        gsap.to(formWrapper, {
          opacity: 0, y: -16, duration: 0.4, ease: 'power2.in',
          onComplete: function () {
            formWrapper.style.display = 'none';
            successEl.style.display = 'block';
            requestAnimationFrame(function () {
              successEl.classList.add('visible');
              gsap.from('.success-inner > *', {
                opacity: 0, y: 20, duration: 0.6, stagger: 0.1, ease: 'power2.out',
              });
            });
          },
        });
      } else {
        formWrapper.style.display = 'none';
        successEl.style.display  = 'block';
        setTimeout(function () { successEl.classList.add('visible'); }, 20);
      }
    });
  }


  /* =========================================================================
     09. MARQUEE — pause on hover
     ========================================================================= */

  function initMarquee() {
    var strip = document.querySelector('.marquee-strip');
    var track = document.querySelector('.marquee-track');
    if (!strip || !track) return;
    strip.addEventListener('mouseenter', function () { track.style.animationPlayState = 'paused'; });
    strip.addEventListener('mouseleave', function () { track.style.animationPlayState = 'running'; });
  }


  /* =========================================================================
     BOOT
     ========================================================================= */

  document.addEventListener('DOMContentLoaded', function () {
    initPageEntrance();
    initPageTransitions();
    initNavbar();
    initHeroHeadline();
    initScrollAnimations();
    initCounters();
    initContactForm();
    initMarquee();
  });

})();
