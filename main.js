/* ============================================
   OFFERLY. — MAIN.JS
   All animations, interactions, and effects
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Scroll Progress Indicator ── */
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollIndicator.style.width = (scrollTop / docHeight * 100) + '%';
    }, { passive: true });
  }

  /* ── Navigation: Transparent → Frosted Glass ── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* ── Mobile Nav Toggle ── */
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.nav-mobile');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });
  }

  /* ── Set Active Nav Link ── */
  const navLinks = document.querySelectorAll('.nav-links a, .nav-mobile a');
  navLinks.forEach(link => {
    if (link.href === window.location.href ||
        link.href.includes(window.location.pathname.split('/').pop())) {
      link.classList.add('active');
    }
  });

  /* ── Hero Headline Word-by-Word Reveal ── */
  const headline = document.querySelector('.hero-headline');
  if (headline) {
    const originalText = headline.textContent.trim();
    headline.textContent = '';

    const words = originalText.split(' ');
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'word';
      const inner = document.createElement('span');
      inner.className = 'word-inner';
      inner.textContent = word;
      span.appendChild(inner);
      headline.appendChild(span);
      if (i < words.length - 1) {
        headline.appendChild(document.createTextNode(' '));
      }
    });

    // Animate after short delay
    setTimeout(() => {
      const wordInners = headline.querySelectorAll('.word-inner');
      wordInners.forEach((el, i) => {
        setTimeout(() => {
          el.style.transition = `transform 0.65s cubic-bezier(0.16,1,0.3,1), opacity 0.65s cubic-bezier(0.16,1,0.3,1)`;
          el.style.transform = 'translateY(0)';
          el.style.opacity = '1';
        }, 120 + i * 80);
      });
    }, 200);
  }

  /* ── SVG Draw-On Animation (Hero) ── */
  const svgPaths = document.querySelectorAll('.hero-art svg path, .hero-art svg line, .hero-art svg circle, .hero-art svg polyline, .hero-art svg rect');
  svgPaths.forEach((path, i) => {
    const length = path.getTotalLength ? path.getTotalLength() : 200;
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    path.style.transition = `stroke-dashoffset 1.5s cubic-bezier(0.16,1,0.3,1) ${0.4 + i * 0.12}s`;
    setTimeout(() => {
      path.style.strokeDashoffset = '0';
    }, 100);
  });

  /* ── Generic Scroll Reveal ── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal, .problem-item, .deliverable-item, .value-item, .team-card, .step-item, .tier-card, .cs-card, .stat-item').forEach((el, i) => {
    // Stagger children in groups
    if (el.classList.contains('reveal') || el.classList.contains('problem-item') || el.classList.contains('tier-card') || el.classList.contains('cs-card')) {
      el.style.transitionDelay = (i % 3) * 0.12 + 's';
    }
    revealObserver.observe(el);
  });

  /* ── Stat Counters ── */
  const stats = document.querySelectorAll('.stat-number[data-target]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const duration = 1800;
    const startTime = performance.now();
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = el.dataset.decimals || 0;

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = eased * target;
      el.textContent = prefix + current.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  /* ── Step Items: Alternate L/R Reveal ── */
  const stepItems = document.querySelectorAll('.step-item');
  stepItems.forEach((item, i) => {
    item.classList.add(i % 2 === 0 ? 'from-left' : 'from-right');
  });

  /* ── Testimonial Carousel ── */
  const track = document.querySelector('.carousel-track');
  const wrapper = document.querySelector('.carousel-track-wrapper');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  const dots = document.querySelectorAll('.carousel-dot');

  if (track && wrapper) {
    let currentIndex = 0;
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;
    let autoInterval;
    const cards = track.querySelectorAll('.quote-card');
    const total = cards.length;

    function getCardWidth() {
      if (!cards[0]) return 408;
      return cards[0].offsetWidth + 28;
    }

    function goTo(index) {
      currentIndex = ((index % total) + total) % total;
      const offset = currentIndex * getCardWidth();
      track.style.transform = `translateX(-${offset}px)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(currentIndex + 1); resetAuto(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(currentIndex - 1); resetAuto(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); resetAuto(); }));

    // Drag
    wrapper.addEventListener('mousedown', e => {
      isDragging = true;
      startX = e.pageX;
      wrapper.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const diff = e.pageX - startX;
      if (Math.abs(diff) > 50) {
        diff < 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1);
        isDragging = false;
        resetAuto();
      }
    });
    window.addEventListener('mouseup', () => {
      isDragging = false;
      wrapper.style.cursor = 'grab';
    });

    // Touch
    let touchStartX = 0;
    wrapper.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    wrapper.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { diff > 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1); resetAuto(); }
    });

    // Auto-advance
    function startAuto() {
      autoInterval = setInterval(() => goTo(currentIndex + 1), 5000);
    }
    function resetAuto() {
      clearInterval(autoInterval);
      startAuto();
    }
    wrapper.addEventListener('mouseenter', () => clearInterval(autoInterval));
    wrapper.addEventListener('mouseleave', startAuto);

    goTo(0);
    startAuto();
  }

  /* ── Case Study Accordion ── */
  const csCards = document.querySelectorAll('.cs-card');
  csCards.forEach(card => {
    const header = card.querySelector('.cs-card-header');
    const body = card.querySelector('.cs-body');
    if (!header || !body) return;

    header.addEventListener('click', () => {
      const isOpen = card.classList.contains('open');
      csCards.forEach(c => { c.classList.remove('open'); c.querySelector('.cs-body')?.classList.remove('open'); });
      if (!isOpen) { card.classList.add('open'); body.classList.add('open'); }
    });
  });

  /* ── Apply Form ── */
  const applyForm = document.querySelector('.apply-form');
  if (applyForm) {
    applyForm.addEventListener('submit', e => {
      e.preventDefault();
      const formEl = applyForm;
      const success = document.querySelector('.form-success');
      formEl.style.opacity = '0';
      formEl.style.transform = 'translateY(-16px)';
      formEl.style.transition = 'opacity 0.4s, transform 0.4s';
      setTimeout(() => {
        formEl.style.display = 'none';
        if (success) { success.classList.add('show'); }
      }, 400);
    });
  }

  /* ── Smooth External Links (same-site) ── */
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
    // Just let them navigate normally
  });

});
