/**
 * ============================================================================
 * AHMED HAMDY — FLUTTER DEVELOPER & CREATIVE TECHNOLOGIST
 * Module: Hero 3D Digital Core
 * File: js/hero3d.js
 * ============================================================================
 * Primary: Three.js WebGL / CSS3D with glowing geometric core & orbital rings
 * Fallback: Pure HTML5 2D Canvas engine if Three.js fails or is unavailable
 * Features:
 *  - Cinematic Entrance: light particles gather inward to forge the core
 *  - Depth Parallax: layers shift at differential speeds on mouse move
 *  - Floating Code Fragments: deterministic orbiting Flutter/Dart badges
 *  - Interactive Response: pointer proximity activates energy lighting
 *  - Visibility API & IntersectionObserver pausing for 60fps resource conservation
 *  - Prefers-reduced-motion compliance
 * ============================================================================
 */

(function (window, document) {
  'use strict';

  const Hero3D = {
    container: null,
    scene: null,
    camera: null,
    renderer: null,
    coreMesh: null,
    innerCore: null,
    rings: [],
    codeFragments: [],
    lightGatherParticles: null,
    ambientLight: null,
    pointLight: null,
    animFrameId: null,
    isVisible: true,
    isTabActive: true,
    isFormed: false,
    formationProgress: 0,
    reducedMotion: false,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    fallbackActive: false,

    // Orbiting code fragments data
    snippets: [
      'Widget build(BuildContext ctx)',
      'setState(() { _active = true; })',
      'BlocProvider<AppBloc>()',
      'Future<void> fetchUserData()',
      'StreamBuilder<AuthState>',
      'Hive.openBox("local_db")',
      'Dio().get("/api/v1/feed")',
      'Navigator.pushNamed(ctx, "/home")'
    ],

    init() {
      this.container = document.getElementById('hero-3d-container');
      if (!this.container) return;

      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Check if Three.js is loaded
      if (typeof THREE !== 'undefined') {
        try {
          this.initThree();
        } catch (e) {
          console.warn('[Hero3D] WebGL/Three initialization fallback triggered:', e);
          this.initCanvasFallback();
        }
      } else {
        this.initCanvasFallback();
      }

      this.bindEvents();
    },

    initThree() {
      const width = this.container.clientWidth || window.innerWidth;
      const height = this.container.clientHeight || window.innerHeight;

      // 1. Scene & Camera
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
      this.camera.position.z = 85;

      // 2. WebGL Renderer
      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setClearColor(0x000000, 0);
      this.container.appendChild(this.renderer.domElement);

      // 3. Lighting Setup
      this.ambientLight = new THREE.AmbientLight(0x0f172a, 1.2);
      this.scene.add(this.ambientLight);

      this.pointLight = new THREE.PointLight(0x38bdf8, 2.5, 300);
      this.pointLight.position.set(0, 0, 40);
      this.scene.add(this.pointLight);

      const crimsonLight = new THREE.PointLight(0xbc0202, 3, 250);
      crimsonLight.position.set(-30, 20, 20);
      this.scene.add(crimsonLight);

      // 4. Digital Core Polyhedron (Icosahedron with wireframe & inner pulsing core)
      const coreGeo = new THREE.IcosahedronGeometry(18, 1);
      const coreMat = new THREE.MeshPhongMaterial({
        color: 0x0a0a14,
        emissive: 0x0c4a6e,
        wireframe: true,
        transparent: true,
        opacity: 0.85,
        wireframeLinewidth: 1.5
      });
      this.coreMesh = new THREE.Mesh(coreGeo, coreMat);
      this.scene.add(this.coreMesh);

      // Inner glowing nucleus
      const innerGeo = new THREE.OctahedronGeometry(8, 0);
      const innerMat = new THREE.MeshStandardMaterial({
        color: 0xbc0202,
        emissive: 0xbc0202,
        emissiveIntensity: 0.9,
        roughness: 0.2,
        metalness: 0.8
      });
      this.innerCore = new THREE.Mesh(innerGeo, innerMat);
      this.scene.add(this.innerCore);

      // 5. Orbital Energy Rings
      const ringGeos = [
        new THREE.RingGeometry(26, 26.6, 64),
        new THREE.RingGeometry(34, 34.5, 64),
        new THREE.RingGeometry(42, 42.4, 64)
      ];

      const ringColors = [0x38bdf8, 0xbc0202, 0x38bdf8];

      ringGeos.forEach((geo, idx) => {
        const mat = new THREE.MeshBasicMaterial({
          color: ringColors[idx],
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.45 - idx * 0.1
        });
        const ringMesh = new THREE.Mesh(geo, mat);
        ringMesh.rotation.x = (Math.PI / 4) * (idx + 1);
        ringMesh.rotation.y = (Math.PI / 6) * idx;
        this.rings.push(ringMesh);
        this.scene.add(ringMesh);
      });

      // 6. Cinematic Entrance: Light Gathering Inward Particles
      this.setupLightGatherParticles();

      // 7. Floating Code Fragments (Sprites with HTML Canvas Textures)
      this.setupCodeFragments();

      // Start loop
      this.renderThree();
    },

    setupLightGatherParticles() {
      const particleCount = this.reducedMotion ? 50 : 350;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const origins = new Float32Array(particleCount * 3);
      const targets = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        // Far away origins
        origins[i3] = (Math.random() - 0.5) * 350;
        origins[i3 + 1] = (Math.random() - 0.5) * 350;
        origins[i3 + 2] = (Math.random() - 0.5) * 200 + 50;

        // Spherical surface targets on core
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 18 + Math.random() * 4;

        targets[i3] = r * Math.sin(phi) * Math.cos(theta);
        targets[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        targets[i3 + 2] = r * Math.cos(phi);

        // Start at origins
        positions[i3] = origins[i3];
        positions[i3 + 1] = origins[i3 + 1];
        positions[i3 + 2] = origins[i3 + 2];
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.userData = { origins, targets };

      const material = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 1.8,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
      });

      this.lightGatherParticles = new THREE.Points(geometry, material);
      this.scene.add(this.lightGatherParticles);
    },

    setupCodeFragments() {
      this.snippets.forEach((text, i) => {
        const canvas = document.createElement('canvas');
        canvas.width = 360;
        canvas.height = 70;
        const ctx = canvas.getContext('2d');

        // Draw styled code badge
        ctx.fillStyle = 'rgba(10, 10, 18, 0.85)';
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.6)' : 'rgba(188, 2, 2, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(4, 4, 352, 62, 10);
        } else {
          ctx.rect(4, 4, 352, 62);
        }
        ctx.fill();
        ctx.stroke();

        ctx.font = '500 20px "JetBrains Mono", monospace';
        ctx.fillStyle = i % 2 === 0 ? '#38BDF8' : '#F87171';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 18, 35);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        const spriteMat = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          opacity: 0.82
        });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(22, 4.2, 1);

        const angle = (i / this.snippets.length) * Math.PI * 2;
        const radius = 32 + (i % 3) * 6;
        const heightY = ((i % 4) - 1.5) * 8;

        sprite.userData = {
          baseAngle: angle,
          radius: radius,
          heightY: heightY,
          speed: 0.003 + (i % 3) * 0.0015
        };

        sprite.position.set(
          Math.cos(angle) * radius,
          heightY,
          Math.sin(angle) * radius
        );

        this.codeFragments.push(sprite);
        this.scene.add(sprite);
      });
    },

    renderThree() {
      if (!this.isVisible || !this.isTabActive) {
        // Paused when offscreen or tab inactive
        return;
      }

      // Smooth mouse lerp
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

      const time = performance.now() * 0.001;

      // 1. Cinematic Entrance Formation
      if (!this.isFormed) {
        this.formationProgress += this.reducedMotion ? 0.06 : 0.015;
        const progress = Math.min(this.formationProgress, 1);

        if (this.lightGatherParticles) {
          const pos = this.lightGatherParticles.geometry.attributes.position.array;
          const { origins, targets } = this.lightGatherParticles.userData;
          for (let i = 0; i < pos.length; i += 3) {
            pos[i] = origins[i] + (targets[i] - origins[i]) * progress;
            pos[i + 1] = origins[i + 1] + (targets[i + 1] - origins[i + 1]) * progress;
            pos[i + 2] = origins[i + 2] + (targets[i + 2] - origins[i + 2]) * progress;
          }
          this.lightGatherParticles.geometry.attributes.position.needsUpdate = true;
        }

        // Scale core into view
        const scale = Math.max(0.001, progress);
        this.coreMesh.scale.set(scale, scale, scale);
        this.innerCore.scale.set(scale, scale, scale);

        if (progress >= 1) {
          this.isFormed = true;
          // Trigger headline mask reveal on document
          const headline = document.getElementById('hero-headline');
          if (headline) {
            headline.classList.add('animate-text-reveal');
          }
        }
      }

      // 2. Core & Nucleus Rotations with Parallax
      if (!this.reducedMotion) {
        this.coreMesh.rotation.x = time * 0.2 + this.mouse.y * 0.35;
        this.coreMesh.rotation.y = time * 0.25 + this.mouse.x * 0.35;

        this.innerCore.rotation.x = -time * 0.3 + this.mouse.y * 0.2;
        this.innerCore.rotation.y = time * 0.4 + this.mouse.x * 0.2;

        // Rings Rotation
        this.rings.forEach((ring, idx) => {
          ring.rotation.z += 0.005 * (idx + 1);
          ring.rotation.x += 0.002 * (idx + 1);
        });

        // Floating Code Fragments deterministic orbits
        this.codeFragments.forEach((sprite) => {
          sprite.userData.baseAngle += sprite.userData.speed;
          const angle = sprite.userData.baseAngle;
          const r = sprite.userData.radius;
          sprite.position.x = Math.cos(angle) * r;
          sprite.position.z = Math.sin(angle) * r;
          sprite.position.y = sprite.userData.heightY + Math.sin(angle * 2) * 2;
        });

        // Camera Depth Parallax
        this.camera.position.x = this.mouse.x * 12;
        this.camera.position.y = -this.mouse.y * 10;
        this.camera.lookAt(0, 0, 0);
      }

      // 3. Pointer Proximity Response (Dynamic Lighting)
      if (this.pointLight) {
        const proximity = Math.sqrt(this.mouse.x * this.mouse.x + this.mouse.y * this.mouse.y);
        this.pointLight.intensity = 2.5 + (1 - Math.min(proximity, 1)) * 2.0;
      }

      this.renderer.render(this.scene, this.camera);
      this.animFrameId = requestAnimationFrame(() => this.renderThree());
    },

    // --- High Quality 2D Canvas Fallback ---
    initCanvasFallback() {
      this.fallbackActive = true;
      const canvas = document.getElementById('hero-fallback-canvas');
      if (!canvas) return;

      canvas.style.display = 'block';
      const ctx = canvas.getContext('2d');
      let width = 0;
      let height = 0;

      const resize = () => {
        width = canvas.width = this.container.clientWidth || window.innerWidth;
        height = canvas.height = this.container.clientHeight || window.innerHeight;
      };
      resize();
      window.addEventListener('resize', resize);

      const numParticles = 40;
      const particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          angle: (i / numParticles) * Math.PI * 2,
          radius: 80 + (i % 4) * 35,
          speed: 0.008 + (i % 3) * 0.004,
          text: this.snippets[i % this.snippets.length],
          size: 3
        });
      }

      const drawFallback = () => {
        if (!this.isVisible || !this.isTabActive) return;

        ctx.clearRect(0, 0, width, height);
        const cx = width * 0.65;
        const cy = height * 0.5;

        // Glowing Core
        const gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, 140);
        gradient.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
        gradient.addColorStop(0.5, 'rgba(188, 2, 2, 0.25)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, 140, 0, Math.PI * 2);
        ctx.fill();

        // Central Polyhedron Ring
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 45, 0, Math.PI * 2);
        ctx.stroke();

        // Orbiting Nodes & Snippets
        particles.forEach((p) => {
          if (!this.reducedMotion) p.angle += p.speed;
          const px = cx + Math.cos(p.angle) * p.radius;
          const py = cy + Math.sin(p.angle) * (p.radius * 0.55);

          // Connection line
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(px, py);
          ctx.stroke();

          // Particle
          ctx.fillStyle = '#38BDF8';
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Snippet text on selected particles
          if (p.radius > 120) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.font = '12px "JetBrains Mono", monospace';
            ctx.fillText(p.text, px + 8, py + 4);
          }
        });

        this.animFrameId = requestAnimationFrame(drawFallback);
      };

      drawFallback();
    },

    bindEvents() {
      // 1. Mouse Move with Throttled Normalization
      let mouseThrottleTimeout = null;
      window.addEventListener('mousemove', (e) => {
        if (mouseThrottleTimeout) return;
        mouseThrottleTimeout = setTimeout(() => {
          mouseThrottleTimeout = null;
        }, 16); // ~60fps throttle

        const normX = (e.clientX / window.innerWidth) * 2 - 1;
        const normY = -(e.clientY / window.innerHeight) * 2 + 1;
        this.mouse.targetX = normX;
        this.mouse.targetY = normY;
      }, { passive: true });

      // 2. Resize Handler
      window.addEventListener('resize', () => {
        if (this.renderer && this.camera && this.container) {
          const w = this.container.clientWidth;
          const h = this.container.clientHeight;
          this.camera.aspect = w / h;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(w, h);
        }
      }, { passive: true });

      // 3. Tab Visibility API Pausing
      document.addEventListener('visibilitychange', () => {
        this.isTabActive = !document.hidden;
        if (this.isTabActive && this.isVisible) {
          if (this.renderer) this.renderThree();
        }
      });

      // 4. IntersectionObserver Pausing when Hero is out of viewport
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          this.isVisible = entry.isIntersecting;
          if (this.isVisible && this.isTabActive) {
            if (this.renderer) this.renderThree();
          }
        });
      }, { threshold: 0.05 });

      observer.observe(this.container);
    },

    // Teardown path
    destroy() {
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
      }
      if (this.renderer && this.renderer.domElement) {
        this.renderer.dispose();
        if (this.renderer.domElement.parentNode) {
          this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
      }
    }
  };

  // Expose globally
  window.Hero3D = Hero3D;

})(window, document);
