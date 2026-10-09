/**
 * ============================================================================
 * AHMED HAMDY — FLUTTER DEVELOPER & CREATIVE TECHNOLOGIST
 * Module: Transition Engine & History Navigation
 * File: js/transitions.js
 * ============================================================================
 * Features:
 *  - Geometric mask reveals and smooth anchor scrolling
 *  - Project modal expansion transition coordinating with TiltCards
 *  - History API (popstate) integration to allow back button closing modals
 *  - Brief accessible timing curves (250ms - 400ms)
 * ============================================================================
 */

(function (window, document) {
  'use strict';

  const Transitions = {
    reducedMotion: false,

    init() {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.bindAnchorScroll();
      this.bindHistoryNavigation();
    },

    // Smooth Anchor Scrolling with offset adjustment
    bindAnchorScroll() {
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const targetId = link.getAttribute('href');
        if (targetId === '#' || targetId === '') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();

          // Close mobile menu if open
          const navLinks = document.getElementById('nav-links');
          const navToggle = document.getElementById('mobile-nav-toggle');
          if (navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
          }

          // Compute top offset for fixed navbar
          const navHeight = 75;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: this.reducedMotion ? 'auto' : 'smooth'
          });

          // Update active link immediately
          document.querySelectorAll('.nav-link').forEach(nl => nl.classList.remove('active'));
          link.classList.add('active');

          // Update URL hash cleanly
          if (window.history && window.history.pushState) {
            window.history.pushState(null, '', targetId);
          }
        }
      });
    },

    // History API Navigation (Handling Back / Forward buttons)
    bindHistoryNavigation() {
      window.addEventListener('popstate', (e) => {
        // If back button clicked while modal is open, close it cleanly
        const modal = document.getElementById('project-detail-modal');
        if (modal && modal.classList.contains('active')) {
          if (window.TiltCards) {
            window.TiltCards.closeModal();
          } else {
            modal.classList.remove('active');
            document.body.style.overflow = '';
          }
        }
      });
    }
  };

  window.Transitions = Transitions;

})(window, document);
