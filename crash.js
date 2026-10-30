(() => {
  const stage = document.getElementById('stage');
  const art = window.CAR_ART;
  if (!stage || !art) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const section = document.getElementById('scene');
  const world = document.getElementById('world');
  const title = document.getElementById('crashTitle');
  const heroInner = document.getElementById('heroInner');
  const cue = document.getElementById('cue');
  const flash = document.getElementById('flash');
  const fx = document.getElementById('fx');
  const ctx = fx.getContext('2d');

  const sprite = (key, o) => {
    const a = art[key], w = a.w, h = a.h;
    const dmg = `M${w} ${h * 0.3} L${w - 26} ${h * 0.42} L${w - 8} ${h * 0.52} L${w - 34} ${h * 0.62} L${w - 12} ${h * 0.74} L${w} ${h * 0.86}Z`;
    const cracks = `M${w - 26} ${h * 0.42} L${w - 54} ${h * 0.38} M${w - 34} ${h * 0.62} L${w - 60} ${h * 0.68}`;
    return `<svg class='carsvg' viewBox='0 0 ${w} ${h + 18}' aria-hidden='true'><defs><clipPath id='cp${key}'><path d='${a.s}'/></clipPath></defs>`
      + `<ellipse cx='${w / 2}' cy='${h + 2}' rx='${w * 0.46}' ry='8' fill='${o.glow}' opacity='.65' filter='url(#blur8)'/>`
      + `<g class='body'><path d='${a.s}' fill='#0a0807' fill-rule='evenodd'/><path d='${a.a}' fill='${o.a}' fill-rule='evenodd'/><path d='${a.b}' fill='${o.b}' fill-rule='evenodd'/><path d='${a.c}' fill='${o.c}' fill-rule='evenodd'/>`
      + `<g clip-path='url(#cp${key})'><rect width='${w}' height='${h}' filter='url(#rustfx)' opacity='.5'/><rect width='${w}' height='${h}' filter='url(#scratch)' opacity='.3'/></g>`
      + `<g class='dmg' opacity='0'><path d='${dmg}' fill='#0a0807'/><path d='${cracks}' stroke='#d9631e' stroke-width='2' fill='none'/></g></g></svg>`;
  };

  const defs = [
    { key: 'A', id: 'carA', a: '#3f3a35', b: '#8a7f72', c: '#d4c7ae', glow: '#27d6e0' },
    { key: 'D', id: 'carD', a: '#3a3430', b: '#7d6f60', c: '#c9b894', glow: '#ff3fa4' },
    { key: 'C', id: 'carC', a: '#34383a', b: '#6f7478', c: '#c4c6c0', glow: '#ff8a2a' }
  ];
  const cars = defs.map((o) => {
    const el = document.getElementById(o.id);
    el.innerHTML = sprite(o.key, o);
    const a = art[o.key];
    return { el, w: a.w, h: a.h, body: el.querySelector('.body'), dmg: el.querySelector('.dmg') };
  });
  const A = cars[0], D = cars[1], C = cars[2];

  const lerp = (a, b, t) => a + (b - a) * t;
  const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const place = (c, x, y, rot, k) => {
    c.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg)`;
    c.body.style.transformOrigin = `${c.w}px ${c.h * 0.6}px`;
    c.body.style.transform = `scale(${(1 - 0.15 * k).toFixed(3)},${(1 + 0.04 * k).toFixed(3)}) skewY(${(-3 * k).toFixed(2)}deg)`;
    c.dmg.style.opacity = k.toFixed(2);
  };

  const parts = [];
  const fit = () => { fx.width = stage.clientWidth; fx.height = stage.clientHeight; };
  fit();
  window.addEventListener('resize', fit);

  const burst = (x, y) => {
    if (reduce) return;
    flash.style.left = x + 'px';
    flash.style.top = y + 'px';
    flash.classList.remove('go');
    void flash.offsetWidth;
    flash.classList.add('go');
    for (let i = 0; i < 80; i++) {
      const a = -Math.PI * (0.03 + Math.random() * 0.94);
      const s = 2 + Math.random() * 9;
      parts.push({ k: 's', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, l: 0, max: 30 + Math.random() * 40, g: Math.random() > 0.8 ? [120, 230, 240] : [255, 140 + Math.random() * 100, Math.random() * 70] });
    }
    for (let i = 0; i < 16; i++) {
      const a = -Math.PI * (0.1 + Math.random() * 0.8);
      const s = 3 + Math.random() * 7;
      parts.push({ k: 'b', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, l: 0, max: 90 + Math.random() * 50, r: 2 + Math.random() * 3, rot: Math.random() * 6 });
    }
    for (let i = 0; i < 12; i++) {
      parts.push({ k: 'm', x: x + (Math.random() - 0.5) * 80, y: y + (Math.random() - 0.5) * 30, vx: (Math.random() - 0.5) * 0.8, vy: -0.4 - Math.random() * 0.8, l: 0, max: 110 + Math.random() * 60, r: 14 + Math.random() * 16 });
    }
  };

  const drawFx = () => {
    ctx.clearRect(0, 0, fx.width, fx.height);
    const floor = fx.height * 0.84;
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.l++;
      const al = 1 - p.l / p.max;
      if (al <= 0) { parts.splice(i, 1); continue; }
      if (p.k === 's') {
        p.vy += 0.28; p.x += p.vx; p.y += p.vy;
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(${p.g[0]},${p.g[1] | 0},${p.g[2] | 0},${al})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2); ctx.stroke();
      } else if (p.k === 'b') {
        p.vy += 0.35; p.x += p.vx; p.y += p.vy;
        if (p.y > floor) { p.y = floor; p.vy *= -0.3; p.vx *= 0.7; }
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = `rgba(150,128,102,${Math.min(1, al * 1.5)})`;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot + p.l * 0.2); ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2); ctx.restore();
      } else {
        p.x += p.vx; p.y += p.vy; p.r += 0.4;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = `rgba(70,62,56,${0.3 * al})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  };

  const titles = ['', 'Metal meets metal.', 'Nobody leaves clean.'];
  let tIdx = 0;
  const setTitle = (i) => {
    if (i === tIdx) return;
    tIdx = i;
    title.classList.remove('in');
    if (i === 0) return;
    setTimeout(() => { if (tIdx === i) { title.textContent = titles[i]; title.classList.add('in'); } }, 220);
  };

  let hit1 = false, hit2 = false;
  const render = (p) => {
    const W = stage.clientWidth, H = stage.clientHeight;
    const cwA = A.el.offsetWidth, cwD = D.el.offsetWidth, cwC = C.el.offsetWidth, mid = W / 2;
    const aI = mid - cwA + cwA * 0.07, dI = mid - cwD * 0.07;
    const a0 = -cwA * 1.15, d0 = W - cwD - W * 0.05;
    const t = cl(p / 0.35), e = Math.pow(t, 1.8);
    const u = cl((p - 0.35) / 0.18), eo = 1 - Math.pow(1 - u, 3);
    const w = cl((p - 0.58) / 0.22), ew = w * w;
    const z = cl((p - 0.8) / 0.12), ez = 1 - Math.pow(1 - z, 3);
    const ax = lerp(a0, aI, e) - cwA * 0.09 * eo - cwA * 0.06 * ez;
    const dx = lerp(d0, dI, e) + cwD * 0.09 * eo - cwD * 0.1 * ez;
    const cx = lerp(W + 40, dx + cwD - cwC * 0.05, ew);
    const su = Math.sin(u * Math.PI), sz = Math.sin(z * Math.PI);
    const now = performance.now();
    const moving = e > 0.02 && e < 0.98;
    const vib = (ph) => reduce ? 0 : Math.sin(now / 55 + ph) * (moving ? 1.6 : 0.6);
    place(A, ax, -su * cwA * 0.05 + vib(0), -2 * eo - 4 * su, cl(u * 3));
    place(D, dx, -su * cwD * 0.06 - sz * cwD * 0.03 + vib(2), 3 * eo + 4 * su + 2 * ez, cl(u * 3 + ez * 0.3));
    place(C, cx, -sz * cwC * 0.05 + vib(4), -3 * sz, cl(z * 3));
    const s1 = p >= 0.35 && p < 0.45 ? 1 - (p - 0.35) / 0.1 : 0;
    const s2 = p >= 0.8 && p < 0.88 ? 1 - (p - 0.8) / 0.08 : 0;
    const amp = reduce ? 0 : Math.max(s1, s2);
    world.style.transform = amp ? `translate(${((Math.random() - 0.5) * 14 * amp).toFixed(1)}px,${((Math.random() - 0.5) * 10 * amp).toFixed(1)}px)` : '';
    const f = cl((p - 0.02) / 0.14);
    heroInner.style.opacity = (1 - f).toFixed(3);
    heroInner.style.transform = `translateY(${(-f * 50).toFixed(1)}px)`;
    heroInner.style.pointerEvents = f > 0.6 ? 'none' : '';
    cue.style.opacity = (1 - cl(p / 0.04)).toFixed(3);
    setTitle(p < 0.33 ? 0 : p < 0.78 ? 1 : 2);
    const iy = H * 0.84 + 12 - A.el.offsetHeight * 0.5;
    if (p >= 0.35 && !hit1) { hit1 = true; burst(mid, iy); } else if (p < 0.33) hit1 = false;
    if (p >= 0.8 && !hit2) { hit2 = true; burst(dx + cwD, iy); } else if (p < 0.78) hit2 = false;
  };

  let cur = 0;
  const frame = () => {
    const r = section.getBoundingClientRect();
    if (r.bottom > -100 && r.top < innerHeight + 100) {
      const tgt = cl(-r.top / (r.height - innerHeight));
      cur = reduce ? tgt : cur + (tgt - cur) * 0.1;
      render(cur);
      drawFx();
    }
    requestAnimationFrame(frame);
  };
  frame();
})();
