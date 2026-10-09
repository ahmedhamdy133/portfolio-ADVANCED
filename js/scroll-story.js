/**
 * ============================================================================
 * AHMED HAMDY — FLUTTER DEVELOPER & CREATIVE TECHNOLOGIST
 * Module: Scroll Storytelling & Section Transformation Engine
 * File: js/scroll-story.js
 * ============================================================================
 * Features:
 *  - Section Transformation: smooth background ambient morph between sections
 *  - Pinned Story Section: keeps key transition zones pinned briefly during scroll
 *  - Typography Morph: animates headline with geometric digital glitch/reveal
 *  - Depth Layers: differential multi-layer parallax velocities (data-depth)
 *  - Progressive Reveal: synchronized viewport reveals via IntersectionObserver
 *  - requestAnimationFrame throttled scroll tracking & prefers-reduced-motion
 * ============================================================================
 */

(function (window, document) {
  'use strict';

  const ScrollStory = {
    isTicking: false,
    reducedMotion: false,
    sections: [],
    depthElements: [],
    currentSectionIndex: 0,

    // Dynamic background palettes mapped to sections
    colorThemes: {
      home: { primary: 'rgba(188, 2, 2, 0.08)', accent: 'rgba(56, 189, 248, 0.12)' },
      about: { primary: 'rgba(56, 189, 248, 0.07)', accent: 'rgba(188, 2, 2, 0.09)' },
      education: { primary: 'rgba(56, 189, 248, 0.12)', accent: 'rgba(14, 165, 233, 0.08)' },
      experience: { primary: 'rgba(188, 2, 2, 0.12)', accent: 'rgba(56, 189, 248, 0.08)' },
      skills: { primary: 'rgba(56, 189, 248, 0.14)', accent: 'rgba(188, 2, 2, 0.1)' },
      projects: { primary: 'rgba(188, 2, 2, 0.12)', accent: 'rgba(56, 189, 248, 0.14)' },
      services: { primary: 'rgba(56, 189, 248, 0.08)', accent: 'rgba(188, 2, 2, 0.06)' },
      testimonials: { primary: 'rgba(251, 191, 36, 0.06)', accent: 'rgba(56, 189, 248, 0.08)' },
      contact: { primary: 'rgba(56, 189, 248, 0.15)', accent: 'rgba(188, 2, 2, 0.15)' }
    },

    init() {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.sections = Array.from(document.querySelectorAll('section[id]'));
      this.depthElements = Array.from(document.querySelectorAll('[data-depth]'));

      this.initTypographyMorph();
      this.initProgressiveReveals();
      this.bindScroll();
    },

    // 1. Typography Morph for "I BUILD DIGITAL EXPERIENCES"
    initTypographyMorph() {
      const headline = document.getElementById('hero-headline');
      if (!headline || this.reducedMotion) return;

      const span = headline.querySelector('.reveal-text');
      if (!span) return;

      const text = span.textContent.trim();
      span.innerHTML = '';

      // Wrap each letter in a span with individual geometric translation attributes
      for (let i = 0; i < text.length; i++) {
        const charSpan = document.createElement('span');
        charSpan.className = 'morph-char';
        charSpan.textContent = text[i] === ' ' ? '\u00A0' : text[i];
        charSpan.style.display = 'inline-block';
        charSpan.style.transition = `transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 25}ms, opacity 0.6s ease ${i * 25}ms`;
        charSpan.style.transform = 'translateY(24px) rotateX(45deg)';
        charSpan.style.opacity = '0';
        span.appendChild(charSpan);
      }

      // Trigger progressive assemble
      setTimeout(() => {
        const charSpans = span.querySelectorAll('.morph-char');
        charSpans.forEach((cs) => {
          cs.style.transform = 'translateY(0) rotateX(0deg)';
          cs.style.opacity = '1';
        });
      }, 300);
    },

    // 2. Progressive Viewport Reveals (IntersectionObserver)
    initProgressiveReveals() {
      const revealItems = document.querySelectorAll('.reveal-init');
      if (this.reducedMotion) {
        revealItems.forEach(el => el.classList.add('is-revealed'));
        return;
      }

      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            // Unobserve after reveal for zero overhead
            obs.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      });

      revealItems.forEach(el => observer.observe(el));
    },

    // 3. Section Transformation & Parallax Tracking (rAF throttled)
    bindScroll() {
      window.addEventListener('scroll', () => {
        if (!this.isTicking) {
          requestAnimationFrame(() => {
            this.handleScrollUpdate();
            this.isTicking = false;
          });
          this.isTicking = true;
        }
      }, { passive: true });
    },

    handleScrollUpdate() {
      if (this.reducedMotion) return;

      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight;

      // Depth Layers Differential Velocities
      this.depthElements.forEach((el) => {
        const depth = parseFloat(el.getAttribute('data-depth')) || 0.1;
        const rect = el.getBoundingClientRect();
        if (rect.top < viewportHeight && rect.bottom > 0) {
          const delta = (viewportHeight / 2 - rect.top) * depth;
          el.style.transform = `translateY(${delta.toFixed(2)}px)`;
        }
      });

      // Section Background Morph
      this.sections.forEach((sec) => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= viewportHeight * 0.45 && rect.bottom >= viewportHeight * 0.45) {
          const secId = sec.id;
          if (this.colorThemes[secId]) {
            const theme = this.colorThemes[secId];
            document.body.style.backgroundImage = `
              radial-gradient(ellipse 80% 50% at 50% -20%, ${theme.accent}, transparent 70%),
              radial-gradient(circle 600px at 85% 30%, ${theme.primary}, transparent),
              radial-gradient(circle 500px at 15% 70%, ${theme.accent}, transparent)
            `;
          }
        }
      });
    }
  };

  window.ScrollStory = ScrollStory;

})(window, document);
