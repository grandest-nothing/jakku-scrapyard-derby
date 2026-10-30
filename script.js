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

  const pickFonts = () => {
    if (!document.fonts) return;
    const list = [];
    document.fonts.forEach((f) => list.push(f));
    const clean = (s) => s.replace(/["']/g, '');
    const vint = list.filter((f) => /vintage/i.test(f.family));
    const sten = list.filter((f) => /stencil/i.test(f.family));
    const vf = vint.find((f) => f.weight === '400' || f.weight === 'normal') || vint[0];
    const sf = sten.find((f) => f.weight === '900') || sten[sten.length - 1];
    const root = document.documentElement.style;
    if (vf) {
      root.setProperty('--body', `'${clean(vf.family)}',Georgia,serif`);
      root.setProperty('--body-w', vf.weight === 'normal' ? '400' : vf.weight);
    }
    if (sf) {
      root.setProperty('--title', `'${clean(sf.family)}',Impact,'Arial Black',sans-serif`);
      root.setProperty('--title-w', sf.weight === 'normal' ? '400' : sf.weight);
    }
  };
  pickFonts();
  let tries = 0;
  const timer = setInterval(() => { pickFonts(); if (++tries > 12) clearInterval(timer); }, 400);
  if (document.fonts) {
    document.fonts.ready.then(pickFonts);
    document.fonts.addEventListener('loadingdone', pickFonts);
  }

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

  const deb = document.getElementById('debris');
  if (deb) {
    const nut = (s) => `<svg viewBox='-20 -20 40 40' width='${s}' height='${s}'><polygon points='0,-18 15.6,-9 15.6,9 0,18 -15.6,9 -15.6,-9' fill='url(#nutg)' stroke='#1a0f08' stroke-width='1.5'/><circle r='7.5' fill='#0a0807' stroke='#7a3a16' stroke-width='1.5'/><circle cx='-8' cy='-7' r='3' fill='#c2561a' opacity='.55'/><path d='M-13 7 L5 -13' stroke='#e8d5b5' opacity='.5' stroke-width='.8'/></svg>`;
    const bolt = (s) => `<svg viewBox='0 0 64 24' width='${s * 1.7}' height='${s * 0.64}'><polygon points='0,3 10,0 14,3 14,21 10,24 0,21' fill='url(#nutg)' stroke='#1a0f08' stroke-width='1.2'/><rect x='14' y='7' width='46' height='10' fill='url(#metalg)' stroke='#1a0f08' stroke-width='1'/><path d='M22 7 V17 M28 7 V17 M34 7 V17 M40 7 V17 M46 7 V17 M52 7 V17' stroke='#1a0f08' stroke-opacity='.6'/><circle cx='5' cy='12' r='3' fill='#b04a14' opacity='.5'/></svg>`;
    const plate = (s) => `<svg viewBox='0 0 160 50' width='${s * 3}' height='${s * 0.94}'><path d='M2 12 L58 2 L112 16 L156 6 L150 34 L112 46 L56 30 L6 44 Z' fill='url(#metalg)' stroke='#1a0f08' stroke-width='2'/><path d='M58 2 L56 30 M112 16 L112 46' stroke='#1a0f08' stroke-opacity='.55' stroke-width='2'/><circle cx='22' cy='28' r='3.5' fill='#0a0807'/><circle cx='84' cy='24' r='3.5' fill='#0a0807'/><circle cx='132' cy='24' r='3.5' fill='#0a0807'/><ellipse cx='96' cy='34' rx='14' ry='5' fill='#c2561a' opacity='.45'/><path d='M10 36 L50 14' stroke='#ecd9b8' stroke-opacity='.4' stroke-width='1'/></svg>`;
    const makers = [nut, nut, bolt, bolt, plate];
    const items = [];
    const count = innerWidth < 700 ? 18 : 30;
    for (let i = 0; i < count; i++) {
      const depth = 0.25 + Math.random() * 0.75;
      const s = 14 + depth * 46;
      const el = document.createElement('div');
      el.className = 'deb';
      el.innerHTML = makers[Math.floor(Math.random() * makers.length)](s);
      el.style.left = (Math.random() * 96) + '%';
      el.style.opacity = (0.28 + depth * 0.42).toFixed(2);
      if (depth < 0.5) el.style.filter = 'blur(1.5px)';
      deb.appendChild(el);
      items.push({ el, y0: Math.random() * (innerHeight + 300), sp: 0.05 + depth * 0.2, r0: Math.random() * 360, rs: (Math.random() - 0.5) * 0.05 });
    }
    let cur = window.scrollY;
    const tick = () => {
      cur += (window.scrollY - cur) * 0.05;
      const span = innerHeight + 300;
      items.forEach((it) => {
        const y = (((it.y0 - cur * it.sp) % span) + span) % span - 150;
        it.el.style.transform = `translate3d(0,${y.toFixed(1)}px,0) rotate(${(it.r0 + cur * it.rs).toFixed(1)}deg)`;
      });
      if (!reduce) requestAnimationFrame(tick);
    };
    tick();
  }
})();
