// ZANTARA Logo Interactive Effects

(function() {
  'use strict';

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', initLogoInteractions);

  function initLogoInteractions() {
    // Magnetic logo effect
    initMagneticEffect();

    // 3D logo tilt effect
    init3DEffect();

    // Parallax scrolling
    initParallaxEffect();

    // Click animations
    initClickEffects();

    // Glitch effect on hover
    initGlitchEffect();
  }

  // Magnetic effect - logo follows cursor
  function initMagneticEffect() {
    const magneticLogos = document.querySelectorAll('.logo-magnetic');

    magneticLogos.forEach(logo => {
      let bounds = logo.getBoundingClientRect();

      // Update bounds on resize
      window.addEventListener('resize', () => {
        bounds = logo.getBoundingClientRect();
      });

      document.addEventListener('mousemove', (e) => {
        const distance = calculateDistance(
          e.clientX,
          e.clientY,
          bounds.left + bounds.width / 2,
          bounds.top + bounds.height / 2
        );

        if (distance < 200) {
          const angle = calculateAngle(
            e.clientX,
            e.clientY,
            bounds.left + bounds.width / 2,
            bounds.top + bounds.height / 2
          );

          const force = (200 - distance) / 200;
          const pushX = Math.cos(angle) * force * 20;
          const pushY = Math.sin(angle) * force * 20;

          logo.style.transform = `translate(${pushX}px, ${pushY}px) scale(${1 + force * 0.1})`;
        } else {
          logo.style.transform = '';
        }
      });
    });
  }

  // 3D tilt effect on mouse move
  function init3DEffect() {
    const logo3D = document.querySelector('.logo-3d');
    if (!logo3D) return;

    logo3D.addEventListener('mousemove', (e) => {
      const rect = logo3D.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 5;
      const rotateY = (centerX - x) / 5;

      logo3D.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(1.1)
      `;
    });

    logo3D.addEventListener('mouseleave', () => {
      logo3D.style.transform = '';
    });
  }

  // Parallax scrolling effect
  function initParallaxEffect() {
    const parallaxLogo = document.querySelector('.parallax-logo');
    if (!parallaxLogo) return;

    let ticking = false;

    function updateParallax() {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;

      parallaxLogo.style.transform = `translateY(${rate}px)`;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    });
  }

  // Click effects
  function initClickEffects() {
    const clickableLogos = document.querySelectorAll('.logo-3d, .logo-breakout img, .parallax-logo img');

    clickableLogos.forEach(logo => {
      logo.addEventListener('click', function(e) {
        // Create ripple effect
        createRipple(e, this);

        // Bounce animation
        this.style.animation = 'none';
        setTimeout(() => {
          this.style.animation = '';
        }, 10);

        // Create particle explosion
        createParticles(e.clientX, e.clientY);
      });
    });
  }

  // Glitch effect
  function initGlitchEffect() {
    const glitchLogos = document.querySelectorAll('.logo-glitch');

    glitchLogos.forEach(logo => {
      logo.addEventListener('mouseenter', () => {
        logo.classList.add('glitching');
        setTimeout(() => {
          logo.classList.remove('glitching');
        }, 300);
      });
    });
  }

  // Helper functions
  function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  function calculateAngle(x1, y1, x2, y2) {
    return Math.atan2(y1 - y2, x1 - x2);
  }

  function createRipple(e, element) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';

    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    // Add custom styles
    ripple.style.cssText += `
      position: absolute;
      border-radius: 50%;
      background: rgba(139, 92, 246, 0.5);
      transform: scale(0);
      animation: rippleAnimation 0.6s ease-out;
      pointer-events: none;
      z-index: 10000;
    `;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  function createParticles(x, y) {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'logo-particle';

      const size = Math.random() * 8 + 4;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = Math.random() * 50 + 50;

      particle.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        z-index: 10000;
        box-shadow: 0 0 10px ${color};
      `;

      document.body.appendChild(particle);

      // Animate particle
      const animation = particle.animate([
        {
          transform: 'translate(0, 0) scale(1)',
          opacity: 1
        },
        {
          transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px) scale(0)`,
          opacity: 0
        }
      ], {
        duration: 1000,
        easing: 'cubic-bezier(0, 0.5, 1, 1)'
      });

      animation.onfinish = () => particle.remove();
    }
  }

  // Add ripple animation to CSS if not exists
  if (!document.querySelector('#logo-interactions-styles')) {
    const style = document.createElement('style');
    style.id = 'logo-interactions-styles';
    style.textContent = `
      @keyframes rippleAnimation {
        to {
          transform: scale(2);
          opacity: 0;
        }
      }

      .glitching {
        animation: glitchIntense 0.3s linear !important;
      }

      @keyframes glitchIntense {
        0%, 100% {
          transform: translate(0);
          filter: hue-rotate(0deg);
        }
        20% {
          transform: translate(-2px, 2px);
          filter: hue-rotate(90deg);
        }
        40% {
          transform: translate(-2px, -2px);
          filter: hue-rotate(180deg);
        }
        60% {
          transform: translate(2px, 2px);
          filter: hue-rotate(270deg);
        }
        80% {
          transform: translate(2px, -2px);
          filter: hue-rotate(360deg);
        }
      }
    `;
    document.head.appendChild(style);
  }
})();