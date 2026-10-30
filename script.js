(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = document.getElementById('nav');
  const hero = document.querySelector('.hero');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
    if (!reduce && hero) hero.style.setProperty('--py', window.scrollY);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const countUp = (el) => {
    const target = +el.dataset.count;
    if (reduce || target === 0) { el.textContent = target; return; }
    const start = performance.now();
    const dur = 1400;
    const tick = (t) => {
      const p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      const c = e.target.querySelector('[data-count]');
      if (c) countUp(c);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

  const cv = document.getElementById('stars');
  const ctx = cv.getContext('2d');
  let stars = [];
  const size = () => {
    cv.width = innerWidth;
    cv.height = innerHeight;
    stars = Array.from({ length: Math.round(innerWidth * innerHeight / 7000) }, () => ({
      x: Math.random() * cv.width,
      y: Math.random() * cv.height,
      r: Math.random() * 1.4 + 0.3,
      p: Math.random() * Math.PI * 2,
      c: Math.random() > 0.85 ? '79,209,217' : '239,227,208'
    }));
  };
  const draw = (t = 0) => {
    ctx.clearRect(0, 0, cv.width, cv.height);
    stars.forEach((s) => {
      const a = reduce ? 0.7 : 0.35 + 0.35 * Math.sin(t / 900 + s.p);
      ctx.fillStyle = 'rgba(' + s.c + ',' + a + ')';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 6.283);
      ctx.fill();
    });
    if (!reduce) requestAnimationFrame(draw);
  };
  size();
  draw();
  window.addEventListener('resize', () => { size(); if (reduce) draw(); });
})();
