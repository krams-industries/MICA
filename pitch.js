/* ComplyO Pitch — Scroll animations */

(function () {
  'use strict';

  // Intersection Observer for .reveal elements
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.reveal').forEach((el) => revealObs.observe(el));

  // Staggered reveal for children of .reveal-stagger
  const staggerObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const children = e.target.children;
          Array.from(children).forEach((child, i) => {
            setTimeout(() => child.classList.add('visible'), i * 120);
          });
          staggerObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.reveal-stagger').forEach((el) => staggerObs.observe(el));

  // Animate market bars on scroll
  const barObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const fills = e.target.querySelectorAll('.market-bar-fill');
          fills.forEach((fill) => {
            const w = fill.getAttribute('data-width');
            if (w) fill.style.width = w + '%';
          });
          barObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  const marketSection = document.querySelector('.market-visual');
  if (marketSection) barObs.observe(marketSection);
})();
