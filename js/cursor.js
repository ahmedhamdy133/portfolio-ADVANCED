/**
 * ============================================================================
 * AHMED HAMDY — FLUTTER DEVELOPER & CREATIVE TECHNOLOGIST
 * Module: Cursor Intelligence
 * File: js/cursor.js
 * ============================================================================
 * Features:
 *  - Adaptive Cursor: inner dot + smooth trailing ring that morphs on interactive elements
 *  - Signal Trail: short glowing cyan dots that fade out progressively
 *  - Magnetic CTA: buttons gravitate smoothly toward pointer on close approach
 *  - Contextual Hover: passes relative mouse coordinates to cards for dynamic lighting
 *  - Smart Interaction: disabled on touch devices; pointer-events: none (never blocks clicks)
 *  - requestAnimationFrame throttled lerp interpolation
 * ============================================================================
 */

(function (window, document) {
  'use strict';

  const CursorIntelligence = {
    cursorDot: null,
    cursorFollower: null,
    trailContainer: null,
    isTouch: false,
    reducedMotion: false,

    // Coordinates & Lerp
    mouse: { x: -100, y: -100 },
    follower: { x: -100, y: -100, vx: 0, vy: 0 },
    lastTrailTime: 0,
    magneticElements: [],

    init() {
      // Check touch & reduced-motion
      this.isTouch = window.matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window);
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (this.isTouch || this.reducedMotion) {
        return; // Smart interaction: gracefully disable on touch or reduced motion
      }

      this.cursorDot = document.getElementById('custom-cursor');
      this.cursorFollower = document.getElementById('custom-cursor-follower');
      this.trailContainer = document.getElementById('cursor-trail-container');

      if (!this.cursorDot || !this.cursorFollower) return;

      this.magneticElements = Array.from(document.querySelectorAll('.magnetic-target, .btn, .logo-link, .nav-link, .tag'));

      this.bindEvents();
      this.startLoop();
    },

    bindEvents() {
      // Mouse Movement
      window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;

        // Immediately position inner dot for 0 latency
        this.cursorDot.style.transform = `translate3d(${this.mouse.x}px, ${this.mouse.y}px, 0) translate(-50%, -50%)`;

        // Signal Trail: spawn small cyan light dots
        const now = performance.now();
        if (now - this.lastTrailTime > 45) { // every 45ms
          this.spawnTrailDot(this.mouse.x, this.mouse.y);
          this.lastTrailTime = now;
        }

        // Contextual card lighting
        this.updateContextualHover(e);
      }, { passive: true });

      // Interactive Elements Hover
      const interactiveTargets = document.querySelectorAll('a, button, input, textarea, .tilt-card, .service-card, .timeline-card');
      interactiveTargets.forEach((el) => {
        el.addEventListener('mouseenter', () => {
          this.cursorDot.classList.add('cursor-hover');
          this.cursorFollower.classList.add('cursor-hover');
        });

        el.addEventListener('mouseleave', () => {
          this.cursorDot.classList.remove('cursor-hover');
          this.cursorFollower.classList.remove('cursor-hover');
        });
      });

      // Window blur / exit
      document.addEventListener('mouseleave', () => {
        this.cursorDot.style.opacity = '0';
        this.cursorFollower.style.opacity = '0';
      });

      document.addEventListener('mouseenter', () => {
        this.cursorDot.style.opacity = '1';
        this.cursorFollower.style.opacity = '1';
      });
    },

    spawnTrailDot(x, y) {
      if (!this.trailContainer) return;
      const dot = document.createElement('div');
      dot.className = 'cursor-trail-dot';
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      this.trailContainer.appendChild(dot);

      setTimeout(() => {
        dot.style.opacity = '0';
        dot.style.transform = 'translate(-50%, -50%) scale(0.2)';
      }, 20);

      setTimeout(() => {
        if (dot.parentNode) dot.parentNode.removeChild(dot);
      }, 360);
    },

    updateContextualHover(e) {
      const cards = document.querySelectorAll('.tilt-card, .service-card, .education-card, .timeline-card');
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          card.style.setProperty('--mouse-x', `${mouseX}px`);
          card.style.setProperty('--mouse-y', `${mouseY}px`);
        }
      });
    },

    startLoop() {
      const render = () => {
        // Follower smooth lerp
        const ease = 0.18;
        this.follower.x += (this.mouse.x - this.follower.x) * ease;
        this.follower.y += (this.mouse.y - this.follower.y) * ease;

        this.cursorFollower.style.transform = `translate3d(${this.follower.x}px, ${this.follower.y}px, 0) translate(-50%, -50%)`;

        // Magnetic CTA calculations
        this.magneticElements.forEach((btn) => {
          const rect = btn.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const dist = Math.hypot(this.mouse.x - centerX, this.mouse.y - centerY);
          const magneticRadius = Math.max(rect.width, rect.height) * 0.9 + 25;

          if (dist < magneticRadius) {
            const pull = (1 - dist / magneticRadius) * 0.35;
            const moveX = (this.mouse.x - centerX) * pull;
            const moveY = (this.mouse.y - centerY) * pull;
            btn.style.transform = `translate3d(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px, 0)`;
          } else if (btn.style.transform && btn.style.transform !== '') {
            btn.style.transform = '';
          }
        });

        requestAnimationFrame(render);
      };

      requestAnimationFrame(render);
    }
  };

  window.CursorIntelligence = CursorIntelligence;

})(window, document);
