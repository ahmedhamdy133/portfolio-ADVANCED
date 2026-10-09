/**
 * ============================================================================
 * AHMED HAMDY — FLUTTER DEVELOPER & CREATIVE TECHNOLOGIST
 * Master Application Orchestrator
 * File: js/main.js
 * ============================================================================
 * Coordinates:
 *  1. Lightweight Preloader with progress bar and terminal status
 *  2. Fixed Glass Navbar scroll detection & ScrollSpy active links
 *  3. Mobile navigation drawer with ARIA keyboard accessibility
 *  4. Testimonials carousel slider (autoplay, hover pause, dots, touch swipe)
 *  5. Subsystem lifecycle initialization (Hero3D, Cursor, ScrollStory, Skills,
 *     TiltCards, Transitions, ContactPortal)
 * ============================================================================
 */

(function (window, document) {
  'use strict';

  const App = {
    init() {
      this.initPreloader();
      this.initNavbar();
      this.initTestimonialsSlider();
      this.initModules();
    },

    // 1. Lightweight Preloader
    initPreloader() {
      const preloader = document.getElementById('preloader');
      const progressBar = document.getElementById('preloader-progress-bar');
      const statusText = document.getElementById('preloader-status');

      if (!preloader || !progressBar) return;

      let progress = 10;
      const statusMessages = [
        'INITIALIZING CORE...',
        'COMPILING DART RUNTIME...',
        'RENDERING 3D ASSETS...',
        'ESTABLISHING CONSTELLATION...',
        'PORTFOLIO READY'
      ];

      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 22) + 12;
        if (progress > 100) progress = 100;

        progressBar.style.width = `${progress}%`;
        const msgIdx = Math.min(Math.floor((progress / 100) * statusMessages.length), statusMessages.length - 1);
        if (statusText) statusText.textContent = statusMessages[msgIdx];

        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            preloader.classList.add('fade-out');
            setTimeout(() => {
              preloader.style.display = 'none';
            }, 550);
          }, 250);
        }
      }, 70);

      // Safety timeout in case of slow assets
      window.addEventListener('load', () => {
        setTimeout(() => {
          if (preloader && !preloader.classList.contains('fade-out')) {
            progressBar.style.width = '100%';
            preloader.classList.add('fade-out');
            setTimeout(() => { preloader.style.display = 'none'; }, 550);
          }
        }, 800);
      });
    },

    // 2. Fixed Glass Navbar & ScrollSpy
    initNavbar() {
      const navbar = document.getElementById('navbar');
      const navLinks = document.querySelectorAll('.nav-link');
      const sections = document.querySelectorAll('section[id]');
      const mobileToggle = document.getElementById('mobile-nav-toggle');
      const navMenu = document.getElementById('nav-links');

      // Scroll effect
      let lastScrollY = window.pageYOffset;
      window.addEventListener('scroll', () => {
        const currentScrollY = window.pageYOffset;
        if (navbar) {
          if (currentScrollY > 40) {
            navbar.classList.add('scrolled');
          } else {
            navbar.classList.remove('scrolled');
          }
        }

        // ScrollSpy Active Link Update
        let currentSectionId = '';
        sections.forEach((section) => {
          const sectionTop = section.offsetTop - 120;
          const sectionHeight = section.offsetHeight;
          if (currentScrollY >= sectionTop && currentScrollY < sectionTop + sectionHeight) {
            currentSectionId = section.getAttribute('id');
          }
        });

        if (currentSectionId) {
          navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
              link.classList.add('active');
            }
          });
        }

        lastScrollY = currentScrollY;
      }, { passive: true });

      // Mobile Hamburger Navigation
      if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
          const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
          mobileToggle.setAttribute('aria-expanded', !isExpanded);
          navMenu.classList.toggle('active');
        });

        // Close on link click
        navLinks.forEach((link) => {
          link.addEventListener('click', () => {
            mobileToggle.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
          });
        });

        // Close on Escape key
        window.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            mobileToggle.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
            mobileToggle.focus();
          }
        });
      }
    },

    // 3. What People Say (Testimonials Slider)
    initTestimonialsSlider() {
      const slider = document.getElementById('testimonials-slider');
      const track = document.getElementById('testimonials-track');
      const prevBtn = document.getElementById('testimonial-prev-btn');
      const nextBtn = document.getElementById('testimonial-next-btn');
      const dotsContainer = document.getElementById('testimonial-dots');

      if (!slider || !track) return;

      const slides = track.querySelectorAll('.testimonial-slide');
      const totalSlides = slides.length;
      let currentIndex = 0;
      let autoplayTimer = null;
      let isPaused = false;

      // Build dot indicators
      if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
          const dot = document.createElement('button');
          dot.className = `testimonial-dot ${i === 0 ? 'active' : ''}`;
          dot.setAttribute('role', 'tab');
          dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
          dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
          dot.addEventListener('click', () => goToSlide(i));
          dotsContainer.appendChild(dot);
        }
      }

      const updateSlideState = () => {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        if (dotsContainer) {
          const dots = dotsContainer.querySelectorAll('.testimonial-dot');
          dots.forEach((dot, idx) => {
            const isActive = idx === currentIndex;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
          });
        }
      };

      const goToSlide = (index) => {
        currentIndex = (index + totalSlides) % totalSlides;
        updateSlideState();
      };

      const nextSlide = () => goToSlide(currentIndex + 1);
      const prevSlide = () => goToSlide(currentIndex - 1);

      if (prevBtn) prevBtn.addEventListener('click', prevSlide);
      if (nextBtn) nextBtn.addEventListener('click', nextSlide);

      // Autoplay cycle
      const startAutoplay = () => {
        stopAutoplay();
        autoplayTimer = setInterval(() => {
          if (!isPaused) nextSlide();
        }, 5000);
      };

      const stopAutoplay = () => {
        if (autoplayTimer) clearInterval(autoplayTimer);
      };

      // Hover and Focus pause
      slider.addEventListener('mouseenter', () => { isPaused = true; });
      slider.addEventListener('mouseleave', () => { isPaused = false; });
      slider.addEventListener('focusin', () => { isPaused = true; });
      slider.addEventListener('focusout', () => { isPaused = false; });

      // Keyboard left/right arrows
      slider.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          prevSlide();
        } else if (e.key === 'ArrowRight') {
          nextSlide();
        }
      });

      // Touch swipe gestures
      let touchStartX = 0;
      let touchEndX = 0;

      slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) {
          nextSlide(); // swipe left
        } else if (touchEndX - touchStartX > 50) {
          prevSlide(); // swipe right
        }
      }, { passive: true });

      startAutoplay();
    },

    // 4. Initialize Interactive Systems
    initModules() {
      const safeInit = (moduleName, obj) => {
        if (obj && typeof obj.init === 'function') {
          try {
            obj.init();
          } catch (err) {
            console.warn(`[App] Error initializing ${moduleName}:`, err);
          }
        }
      };

      safeInit('Hero3D', window.Hero3D);
      safeInit('CursorIntelligence', window.CursorIntelligence);
      safeInit('ScrollStory', window.ScrollStory);
      safeInit('SkillsGraph', window.SkillsGraph);
      safeInit('TiltCards', window.TiltCards);
      safeInit('Transitions', window.Transitions);
      safeInit('ContactPortal', window.ContactPortal);
    }
  };

  // Launch on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }

})(window, document);
