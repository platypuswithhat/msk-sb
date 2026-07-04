function initSite() {

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader.classList.add('hidden'), 300);
  });
  // fallback in case load event already fired
  setTimeout(() => preloader && preloader.classList.add('hidden'), 1500);

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById('header');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
    toggleToTop();
    highlightNav();
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    nav.classList.toggle('open');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  });
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('active');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ---------- Active nav link on scroll ---------- */
  const sections = ['home', 'services', 'about', 'process', 'projects', 'contacts']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const navLinks = Array.from(document.querySelectorAll('.nav__link'));

  function highlightNav() {
    const scrollPos = window.scrollY + 140;
    let currentId = sections[0] ? sections[0].id : null;
    sections.forEach(sec => {
      if (scrollPos >= sec.offsetTop) currentId = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active-link', link.getAttribute('href') === `#${currentId}`);
    });
  }

  /* ---------- Back to top ---------- */
  const toTopBtn = document.getElementById('toTop');
  function toggleToTop() {
    toTopBtn.classList.toggle('show', window.scrollY > 500);
  }
  toTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  onScroll();

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealEls.forEach(el => el.classList.add('in-view'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ---------- Counter animation ---------- */
  const counters = document.querySelectorAll('.counter');
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  };
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => counterObserver.observe(el));

  /* ---------- Project filters ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      projectCards.forEach(card => {
        const match = filter === 'all' || card.dataset.cat === filter;
        card.classList.toggle('hide', !match);
      });
    });
  });

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  const setError = (fieldWrapper, message) => {
    fieldWrapper.classList.add('has-error');
    const msg = fieldWrapper.querySelector('.error-msg');
    if (msg) msg.textContent = message;
  };
  const clearError = (fieldWrapper) => {
    fieldWrapper.classList.remove('has-error');
    const msg = fieldWrapper.querySelector('.error-msg');
    if (msg) msg.textContent = '';
  };

  const phoneRegex = /^[\d\s()+\-]{10,20}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const nameGroup = document.getElementById('name').closest('.form-group');
    const nameVal = document.getElementById('name').value.trim();
    if (nameVal.length < 2) {
      setError(nameGroup, 'Пожалуйста, укажите ваше имя');
      valid = false;
    } else clearError(nameGroup);

    const phoneGroup = document.getElementById('phone').closest('.form-group');
    const phoneVal = document.getElementById('phone').value.trim();
    if (!phoneRegex.test(phoneVal)) {
      setError(phoneGroup, 'Укажите корректный номер телефона');
      valid = false;
    } else clearError(phoneGroup);

    const emailGroup = document.getElementById('email').closest('.form-group');
    const emailVal = document.getElementById('email').value.trim();
    if (emailVal.length > 0 && !emailRegex.test(emailVal)) {
      setError(emailGroup, 'Укажите корректный email');
      valid = false;
    } else clearError(emailGroup);

    const agreeWrapper = document.getElementById('agree').closest('.checkbox');
    if (!document.getElementById('agree').checked) {
      setError(agreeWrapper, 'Необходимо согласие на обработку данных');
      valid = false;
    } else clearError(agreeWrapper);

    if (!valid) return;

    form.classList.add('submitted');
    formSuccess.classList.add('show');
    form.reset();
  });

  /* ---------- Phone input mask (simple RU format) ---------- */
  const phoneInput = document.getElementById('phone');
  phoneInput.addEventListener('input', () => {
    let digits = phoneInput.value.replace(/\D/g, '');
    if (digits.startsWith('7') || digits.startsWith('8')) digits = digits.slice(1);
    digits = digits.slice(0, 10);
    let formatted = '+7';
    if (digits.length > 0) formatted += ' (' + digits.slice(0, 3);
    if (digits.length >= 3) formatted += ')';
    if (digits.length >= 4) formatted += ' ' + digits.slice(3, 6);
    if (digits.length >= 7) formatted += '-' + digits.slice(6, 8);
    if (digits.length >= 9) formatted += '-' + digits.slice(8, 10);
    phoneInput.value = digits.length ? formatted : '';
  });

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSite);
} else {
  initSite();
}
