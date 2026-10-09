/**
 * ============================================================================
 * AHMED HAMDY — FLUTTER DEVELOPER & CREATIVE TECHNOLOGIST
 * Module: Skills Constellation Interactive Graph
 * File: js/skills-graph.js
 * ============================================================================
 * Features:
 *  - Canvas 2D interactive node-network with glowing connecting vectors
 *  - Pulsing line energy waves on entering viewport
 *  - Node selection shows detailed architectural usage notes
 *  - Cross-highlighting: selected tech highlights related projects (Todo & News)
 *  - Mobile & Reduced-Motion fallback: seamlessly works with accessible card list
 *  - Visibility & IntersectionObserver auto-pausing
 * ============================================================================
 */

(function (window, document) {
  'use strict';

  const SkillsGraph = {
    canvas: null,
    ctx: null,
    container: null,
    infoOverlay: null,
    titleEl: null,
    noteEl: null,
    animFrameId: null,
    isVisible: false,
    reducedMotion: false,
    width: 0,
    height: 0,
    selectedNode: null,
    hoveredNode: null,
    mouse: { x: -1000, y: -1000 },

    // Core Skill Node Definitions
    nodes: [
      { id: 'flutter', label: 'Flutter', category: 'Core', xRatio: 0.5, yRatio: 0.45, radius: 24, color: '#38BDF8', related: ['todo', 'news'], note: 'Enterprise-grade cross-platform mobile apps with reactive state, custom render objects, and 60fps architectures.' },
      { id: 'dart', label: 'Dart', category: 'Core', xRatio: 0.32, yRatio: 0.32, radius: 20, color: '#0284C7', related: ['todo', 'news'], note: 'Advanced language patterns: async streams, isolates for heavy computation, null-safety, and OOP abstractions.' },
      { id: 'firebase', label: 'Firebase', category: 'Cloud', xRatio: 0.68, yRatio: 0.32, radius: 18, color: '#F59E0B', related: ['todo', 'news'], note: 'Realtime Cloud Firestore, Firebase Auth, Push Notifications (FCM), Cloud Storage, and Crashlytics.' },
      { id: 'rest_apis', label: 'REST APIs', category: 'Backend', xRatio: 0.76, yRatio: 0.55, radius: 17, color: '#38BDF8', related: ['news'], note: 'Dio HTTP client architecture, JSON serialization, interceptors, error handling, and robust offline caching.' },
      { id: 'git', label: 'Git', category: 'DevOps', xRatio: 0.22, yRatio: 0.58, radius: 16, color: '#BC0202', related: ['todo', 'news'], note: 'Version control workflows, branch protection, CI/CD automated pipeline builds with GitHub Actions.' },
      { id: 'html', label: 'HTML5', category: 'Web', xRatio: 0.16, yRatio: 0.76, radius: 15, color: '#EA580C', related: [], note: 'Semantic structure, web accessibility standards (ARIA), and SEO best practices.' },
      { id: 'css', label: 'CSS3', category: 'Web', xRatio: 0.28, yRatio: 0.82, radius: 15, color: '#38BDF8', related: [], note: 'Modern responsive layouts, Flexbox, Grid, custom properties, and GPU-accelerated keyframe transitions.' },
      { id: 'javascript', label: 'JavaScript', category: 'Web', xRatio: 0.42, yRatio: 0.78, radius: 16, color: '#FACC15', related: [], note: 'ES6+ standards, DOM manipulation, asynchronous programming, WebGL, and custom canvas render engines.' },
      { id: 'ui_ux', label: 'UI/UX', category: 'Design', xRatio: 0.58, yRatio: 0.78, radius: 17, color: '#EC4899', related: ['todo', 'news'], note: 'User journey mapping, intuitive mobile interaction design, ergonomics, and accessibility.' },
      { id: 'figma', label: 'Figma', category: 'Design', xRatio: 0.72, yRatio: 0.82, radius: 16, color: '#A855F7', related: ['todo', 'news'], note: 'Pixel-perfect component design systems, prototyping, typography scales, and developer handoffs.' },
      { id: 'photoshop', label: 'Photoshop', category: 'Graphics', xRatio: 0.84, yRatio: 0.76, radius: 15, color: '#3B82F6', related: [], note: 'Raster asset optimization, mobile splash screens, iconography, and high-fidelity graphics creation.' }
    ],

    // Connected edges
    edges: [
      ['flutter', 'dart'],
      ['flutter', 'firebase'],
      ['flutter', 'rest_apis'],
      ['flutter', 'git'],
      ['flutter', 'ui_ux'],
      ['dart', 'git'],
      ['firebase', 'rest_apis'],
      ['ui_ux', 'figma'],
      ['figma', 'photoshop'],
      ['html', 'css'],
      ['css', 'javascript'],
      ['javascript', 'flutter'],
      ['ui_ux', 'javascript']
    ],

    init() {
      this.container = document.getElementById('skills-graph-wrapper');
      this.canvas = document.getElementById('skills-graph-canvas');
      this.infoOverlay = document.getElementById('skills-info-overlay');
      this.titleEl = document.getElementById('skill-detail-title');
      this.noteEl = document.getElementById('skill-detail-note');

      if (!this.canvas || !this.container) return;

      this.ctx = this.canvas.getContext('2d');
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      this.resize();
      this.bindEvents();
      this.bindAccessibleList();

      // Default select Flutter node
      const flutterNode = this.nodes.find(n => n.id === 'flutter');
      if (flutterNode) this.selectNode(flutterNode, false);

      this.startLoop();
    },

    resize() {
      const rect = this.container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = rect.width;
      this.height = rect.height;

      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.ctx.scale(dpr, dpr);

      // Recalculate absolute coordinates
      this.nodes.forEach((n) => {
        n.currentX = n.xRatio * this.width;
        n.currentY = n.yRatio * this.height;
        n.baseX = n.currentX;
        n.baseY = n.currentY;
      });
    },

    bindEvents() {
      window.addEventListener('resize', () => this.resize(), { passive: true });

      // Canvas pointer tracking
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;

        this.hoveredNode = this.getNodeAt(this.mouse.x, this.mouse.y);
        this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'default';
      });

      this.canvas.addEventListener('mouseleave', () => {
        this.mouse.x = -1000;
        this.mouse.y = -1000;
        this.hoveredNode = null;
      });

      this.canvas.addEventListener('click', () => {
        if (this.hoveredNode) {
          this.selectNode(this.hoveredNode, true);
        }
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

      observer.observe(this.container);
    },

    bindAccessibleList() {
      const buttons = document.querySelectorAll('.skill-tag-card');
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const skillName = btn.getAttribute('data-skill');
          const node = this.nodes.find(n => n.label.toLowerCase() === skillName.toLowerCase());
          if (node) {
            this.selectNode(node, true);
          } else {
            // Fallback for direct data
            this.updateOverlay(
              btn.getAttribute('data-skill'),
              btn.getAttribute('data-note')
            );
            this.highlightRelatedProjects(btn.getAttribute('data-related'));
          }
        });
      });
    },

    getNodeAt(x, y) {
      return this.nodes.find((n) => {
        const dx = x - n.currentX;
        const dy = y - n.currentY;
        return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
      });
    },

    selectNode(node, shouldScrollInfo) {
      this.selectedNode = node;
      this.updateOverlay(node.label, node.note);
      this.highlightRelatedProjects(node.related.join(','));

      // Highlight corresponding DOM button
      const buttons = document.querySelectorAll('.skill-tag-card');
      buttons.forEach((b) => {
        if (b.getAttribute('data-skill').toLowerCase() === node.label.toLowerCase()) {
          b.style.borderColor = 'var(--color-accent)';
          b.style.boxShadow = '0 0 15px rgba(56, 189, 248, 0.4)';
        } else {
          b.style.borderColor = '';
          b.style.boxShadow = '';
        }
      });
    },

    updateOverlay(title, note) {
      if (!this.infoOverlay || !this.titleEl || !this.noteEl) return;
      this.titleEl.textContent = title;
      this.noteEl.textContent = note;
      this.infoOverlay.classList.add('active');
    },

    highlightRelatedProjects(relatedString) {
      const relatedIds = relatedString ? relatedString.split(',').map(s => s.trim().toLowerCase()) : [];
      const projectCards = document.querySelectorAll('.tilt-card');

      projectCards.forEach((card) => {
        const pid = card.getAttribute('data-project-id');
        if (relatedIds.includes(pid)) {
          card.style.borderColor = 'var(--color-accent)';
          card.style.boxShadow = '0 0 35px rgba(56, 189, 248, 0.5)';
        } else {
          card.style.borderColor = '';
          card.style.boxShadow = '';
        }
      });
    },

    startLoop() {
      const render = () => {
        if (!this.isVisible) {
          this.animFrameId = null;
          return;
        }

        this.ctx.clearRect(0, 0, this.width, this.height);
        const time = performance.now() * 0.002;

        // 1. Draw Edges with energy pulse
        this.edges.forEach(([idA, idB]) => {
          const a = this.nodes.find(n => n.id === idA);
          const b = this.nodes.find(n => n.id === idB);
          if (!a || !b) return;

          const isConnectedToSelected = (this.selectedNode && (this.selectedNode.id === a.id || this.selectedNode.id === b.id));

          this.ctx.beginPath();
          this.ctx.moveTo(a.currentX, a.currentY);
          this.ctx.lineTo(b.currentX, b.currentY);

          if (isConnectedToSelected) {
            this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
            this.ctx.lineWidth = 2.2;
          } else {
            const alpha = 0.12 + Math.sin(time + a.currentX * 0.01) * 0.06;
            this.ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0.08, alpha)})`;
            this.ctx.lineWidth = 1;
          }
          this.ctx.stroke();

          // Traveling energy pulse dot
          if (!this.reducedMotion && isConnectedToSelected) {
            const pulseT = (time * 0.8) % 1;
            const px = a.currentX + (b.currentX - a.currentX) * pulseT;
            const py = a.currentY + (b.currentY - a.currentY) * pulseT;
            this.ctx.fillStyle = '#38BDF8';
            this.ctx.beginPath();
            this.ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            this.ctx.fill();
          }
        });

        // 2. Draw Nodes
        this.nodes.forEach((n) => {
          // Floating oscillation
          if (!this.reducedMotion) {
            n.currentY = n.baseY + Math.sin(time + n.currentX * 0.05) * 4;
          }

          const isSelected = this.selectedNode && this.selectedNode.id === n.id;
          const isHovered = this.hoveredNode && this.hoveredNode.id === n.id;

          // Outer halo
          if (isSelected || isHovered) {
            this.ctx.beginPath();
            this.ctx.arc(n.currentX, n.currentY, n.radius + 8, 0, Math.PI * 2);
            this.ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.1)';
            this.ctx.fill();
          }

          // Node body
          this.ctx.beginPath();
          this.ctx.arc(n.currentX, n.currentY, n.radius, 0, Math.PI * 2);
          this.ctx.fillStyle = isSelected ? '#38BDF8' : 'rgba(18, 18, 26, 0.95)';
          this.ctx.fill();
          this.ctx.strokeStyle = isSelected ? '#FFFFFF' : n.color;
          this.ctx.lineWidth = isSelected ? 2.5 : 1.8;
          this.ctx.stroke();

          // Node text label
          this.ctx.font = '600 12px "Space Grotesk", sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillStyle = isSelected ? '#0A0A0F' : '#F8FAFC';
          this.ctx.fillText(n.label, n.currentX, n.currentY);
        });

        this.animFrameId = requestAnimationFrame(render);
      };

      this.animFrameId = requestAnimationFrame(render);
    }
  };

  window.SkillsGraph = SkillsGraph;

})(window, document);
