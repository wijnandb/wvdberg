/* ============================================
   W.G.J. van den Berg — Main JS
   Sticky header, smooth scroll, lightbox, form
   ============================================ */

(function () {
  'use strict';

  // --- Sticky Header ---
  const header = document.getElementById('header');
  const scrollThreshold = 60;

  function updateHeader() {
    if (window.scrollY > scrollThreshold) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  // --- Mobile Menu Toggle ---
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');

  menuToggle.addEventListener('click', function () {
    menuToggle.classList.toggle('active');
    nav.classList.toggle('open');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile menu on nav link click
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      menuToggle.classList.remove('active');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // --- Smooth Scroll for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Lightbox ---
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = lightbox.querySelector('.lightbox-img');
  var lightboxCaption = lightbox.querySelector('.lightbox-caption');
  var galleryItems = document.querySelectorAll('.gallery-item');
  var currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    var item = galleryItems[index];
    var img = item.querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = item.dataset.caption || '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  function nextPhoto() {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    openLightbox(currentIndex);
  }

  function prevPhoto() {
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    openLightbox(currentIndex);
  }

  galleryItems.forEach(function (item, index) {
    item.addEventListener('click', function () {
      openLightbox(index);
    });
  });

  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-next').addEventListener('click', nextPhoto);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', prevPhoto);

  // Close on background click
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextPhoto();
    if (e.key === 'ArrowLeft') prevPhoto();
  });

  // --- Contact Form ---
  var form = document.getElementById('contactForm');
  var formStatus = document.getElementById('formStatus');

  // Record page load time for spam detection
  form.dataset.ts = String(Date.now());

  function showError(fieldName, message) {
    var input = form.querySelector('[name="' + fieldName + '"]');
    var errorEl = form.querySelector('[data-for="' + fieldName + '"]');
    if (input) input.classList.add('error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  }

  function clearErrors() {
    form.querySelectorAll('.error').forEach(function (el) {
      el.classList.remove('error');
    });
    form.querySelectorAll('.form-error').forEach(function (el) {
      el.classList.remove('visible');
      el.textContent = '';
    });
    formStatus.className = 'form-status';
    formStatus.textContent = '';
  }

  function validateForm() {
    var valid = true;
    clearErrors();

    var naam = form.querySelector('[name="naam"]').value.trim();
    var telefoon = form.querySelector('[name="telefoon"]').value.trim();
    var email = form.querySelector('[name="email"]').value.trim();
    var bericht = form.querySelector('[name="bericht"]').value.trim();

    if (!naam) {
      showError('naam', 'Vul uw naam in');
      valid = false;
    }

    if (!telefoon) {
      showError('telefoon', 'Vul uw telefoonnummer in');
      valid = false;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('email', 'Vul een geldig e-mailadres in');
      valid = false;
    }

    if (!bericht) {
      showError('bericht', 'Beschrijf kort uw klus');
      valid = false;
    }

    return valid;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateForm()) return;

    var submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Versturen...';

    var data = {
      naam: form.querySelector('[name="naam"]').value.trim(),
      telefoon: form.querySelector('[name="telefoon"]').value.trim(),
      email: form.querySelector('[name="email"]').value.trim(),
      bericht: form.querySelector('[name="bericht"]').value.trim(),
      _gotcha: form.querySelector('[name="website"]').value,
      _ts: form.dataset.ts || ''
    };

    // Formbridge public submission endpoint
    var FORMBRIDGE_URL = 'https://forms.bollenstreekdigitaal.nl/api/v1/s/f_bc20d12e8833';
    fetch(FORMBRIDGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        return res.json().then(function (json) {
          return { ok: res.ok, data: json };
        });
      })
      .then(function (result) {
        if (result.ok) {
          formStatus.className = 'form-status success';
          formStatus.textContent = 'Bedankt! Uw aanvraag is verzonden. Ik neem zo snel mogelijk contact met u op.';
          form.reset();
        } else {
          formStatus.className = 'form-status error';
          formStatus.textContent = result.data.message || 'Er is iets misgegaan. Probeer het later opnieuw of bel direct.';
        }
      })
      .catch(function () {
        formStatus.className = 'form-status error';
        formStatus.textContent = 'Er is iets misgegaan. Probeer het later opnieuw of bel direct.';
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Verstuur aanvraag';
      });
  });

  // Clear field errors on input
  form.addEventListener('input', function (e) {
    var name = e.target.name;
    if (name) {
      e.target.classList.remove('error');
      var errorEl = form.querySelector('[data-for="' + name + '"]');
      if (errorEl) {
        errorEl.classList.remove('visible');
        errorEl.textContent = '';
      }
    }
  });

  // --- FAQ Accordion ---
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var isOpen = item.classList.contains('open');

      // Close all other items
      document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // Toggle clicked item
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // --- Mobile Sticky CTA ---
  var mobileCta = document.getElementById('mobileCta');
  if (mobileCta) {
    var heroSection = document.getElementById('hero');
    function updateMobileCta() {
      if (window.innerWidth >= 1024) return;
      var heroBottom = heroSection.getBoundingClientRect().bottom;
      if (heroBottom < 0) {
        mobileCta.classList.add('visible');
      } else {
        mobileCta.classList.remove('visible');
      }
    }
    window.addEventListener('scroll', updateMobileCta, { passive: true });
    updateMobileCta();
  }

})();
