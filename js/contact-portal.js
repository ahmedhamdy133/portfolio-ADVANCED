/**
 * ============================================================================
 * AHMED HAMDY — FLUTTER DEVELOPER & CREATIVE TECHNOLOGIST
 * Module: Contact Portal Engine & Converging Canvas
 * File: js/contact-portal.js
 * ============================================================================
 * Features:
 *  - Interactive Canvas with ambient particles and energy lines converging toward CTA buttons
 *  - Staggered link reveal & glowing buttons
 *  - Real actions: WhatsApp link, mailto: Gmail, and Copy-to-Clipboard with tooltip
 *  - Interactive message form validation and simulated instant transmission dispatch
 *  - IntersectionObserver & Visibility API auto-pause
 * ============================================================================
 */

(function (window, document) {
  'use strict';

  const ContactPortal = {
    canvas: null,
    ctx: null,
    section: null,
    animFrameId: null,
    isVisible: false,
    reducedMotion: false,
    width: 0,
    height: 0,
    particles: [],
    mouse: { x: -1000, y: -1000 },

    init() {
      this.section = document.getElementById('contact');
      this.canvas = document.getElementById('contact-portal-canvas');
      if (!this.canvas || !this.section) return;

      this.ctx = this.canvas.getContext('2d');
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      this.resize();
      this.initParticles();
      this.bindEvents();
      this.bindCopyEmail();
      this.bindForm();

      this.startLoop();
    },

    resize() {
      const rect = this.section.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = rect.width;
      this.height = rect.height;

      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.ctx.scale(dpr, dpr);
    },

    initParticles() {
      const count = this.reducedMotion ? 20 : 55;
      this.particles = [];
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2 + 1,
          alpha: Math.random() * 0.5 + 0.2,
          isPrimary: i % 3 === 0 // Crimson vs Sky Cyan
        });
      }
    },

    bindEvents() {
      window.addEventListener('resize', () => {
        this.resize();
        this.initParticles();
      }, { passive: true });

      // Subtle mouse influence
      this.section.addEventListener('mousemove', (e) => {
        const rect = this.section.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
      }, { passive: true });

      this.section.addEventListener('mouseleave', () => {
        this.mouse.x = -1000;
        this.mouse.y = -1000;
      });

      // Viewport IntersectionObserver
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          this.isVisible = entry.isIntersecting;
          if (this.isVisible && !this.animFrameId) {
            this.startLoop();
          }
        });
      }, { threshold: 0.1 });

      observer.observe(this.section);
    },

    bindCopyEmail() {
      const copyBtn = document.getElementById('copy-email-btn');
      const copyTextEl = document.getElementById('copy-btn-text');
      const email = 'ahmedhamdy.dev@gmail.com';

      if (!copyBtn) return;

      copyBtn.addEventListener('click', async () => {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(email);
          } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = email;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
          }

          copyTextEl.textContent = '✓ Copied!';
          copyBtn.style.backgroundColor = '#22C55E';
          copyBtn.style.color = '#FFFFFF';

          setTimeout(() => {
            copyTextEl.textContent = 'Copy Email';
            copyBtn.style.backgroundColor = '';
            copyBtn.style.color = '';
          }, 2400);
        } catch (err) {
          console.error('[ContactPortal] Failed to copy email: ', err);
        }
      });
    },

    bindForm() {
      const form = document.getElementById('contact-form');
      const feedback = document.getElementById('form-feedback');
      const submitBtn = document.getElementById('contact-submit-btn');

      if (!form) return;

      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('contact-name');
        const emailInput = document.getElementById('contact-email');
        const msgInput = document.getElementById('contact-message');

        if (!nameInput.value.trim() || !emailInput.value.trim() || !msgInput.value.trim()) {
          feedback.textContent = 'Please complete all required fields.';
          feedback.className = 'form-feedback';
          feedback.style.display = 'block';
          feedback.style.background = 'rgba(239, 68, 68, 0.15)';
          feedback.style.color = '#EF4444';
          feedback.style.borderColor = 'rgba(239, 68, 68, 0.3)';
          return;
        }

        // Email basic validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
          feedback.textContent = 'Please enter a valid email address.';
          feedback.className = 'form-feedback';
          feedback.style.display = 'block';
          feedback.style.background = 'rgba(239, 68, 68, 0.15)';
          feedback.style.color = '#EF4444';
          feedback.style.borderColor = 'rgba(239, 68, 68, 0.3)';
          return;
        }

        // Simulate sending transmission
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Transmitting...</span>';

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <span>Message Sent!</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          `;

          feedback.textContent = 'Thank you, Ahmed Hamdy will get back to you shortly!';
          feedback.className = 'form-feedback success';

          form.reset();

          setTimeout(() => {
            submitBtn.innerHTML = `
              <span>Transmit Message</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            `;
          }, 4000);
        }, 800);
      });
    },

    startLoop() {
      const render = () => {
        if (!this.isVisible) {
          this.animFrameId = null;
          return;
        }

        this.ctx.clearRect(0, 0, this.width, this.height);

        // Find primary buttons target to converge lines toward
        const primaryCta = document.getElementById('contact-whatsapp-link');
        let targetX = this.width * 0.35;
        let targetY = this.height * 0.55;

        if (primaryCta) {
          const rect = primaryCta.getBoundingClientRect();
          const secRect = this.section.getBoundingClientRect();
          targetX = rect.left - secRect.left + rect.width / 2;
          targetY = rect.top - secRect.top + rect.height / 2;
        }

        // Render particles and converging lines
        this.particles.forEach((p) => {
          if (!this.reducedMotion) {
            p.x += p.vx;
            p.y += p.vy;

            // Bounce on boundary
            if (p.x < 0 || p.x > this.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.height) p.vy *= -1;
          }

          // Draw particle
          this.ctx.fillStyle = p.isPrimary ? 'rgba(188, 2, 2, 0.7)' : 'rgba(56, 189, 248, 0.7)';
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          this.ctx.fill();

          // Subtle converging light line toward target CTA
          const dx = targetX - p.x;
          const dy = targetY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 320 && !this.reducedMotion) {
            const alpha = (1 - dist / 320) * 0.15;
            this.ctx.strokeStyle = p.isPrimary
              ? `rgba(188, 2, 2, ${alpha})`
              : `rgba(56, 189, 248, ${alpha})`;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(targetX, targetY);
            this.ctx.stroke();
          }
        });

        this.animFrameId = requestAnimationFrame(render);
      };

      this.animFrameId = requestAnimationFrame(render);
    }
  };

  window.ContactPortal = ContactPortal;

})(window, document);
