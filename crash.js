(() => {
  const stage = document.getElementById('stage');
  if (!stage) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const section = document.getElementById('crash');
  const world = document.getElementById('world');
  const title = document.getElementById('crashTitle');
  const flash = document.getElementById('flash');
  const fx = document.getElementById('fx');
  const ctx = fx.getContext('2d');
  const BODY = 'M14 128 L14 98 Q16 88 30 86 L78 82 L118 50 Q128 42 142 42 L262 42 Q276 42 286 52 L322 84 L384 92 Q404 96 406 112 L406 128 Z';

  const wheel = (cx) => {
    const lugs = [0, 1, 2, 3, 4].map((i) => {
      const a = i * 72 * Math.PI / 180;
      return `<circle cx='${(cx + 9 * Math.cos(a)).toFixed(1)}' cy='${(132 + 9 * Math.sin(a)).toFixed(1)}' r='2.6' fill='#cbb99a' stroke='#1b1410' stroke-width='.6'/>`;
    }).join('');
    return `<circle cx='${cx}' cy='132' r='36' fill='#080605'/><g class='wheel'><circle cx='${cx}' cy='132' r='30' fill='#121212' stroke='#2c2c2c' stroke-width='3'/><path d='M${cx - 30} 132 H${cx - 24} M${cx + 24} 132 H${cx + 30} M${cx} 102 V108 M${cx} 156 V162' stroke='#3a3a3a' stroke-width='4'/><circle cx='${cx}' cy='132' r='17' fill='#6d5a48' stroke='#1b1410' stroke-width='2'/>${lugs}<circle cx='${cx}' cy='132' r='4' fill='#241a12'/></g>`;
  };

  const carSVG = (id, o) => {
    const bolts = [182, 202, 222, 242, 262, 282].map((x) => `<circle cx='${x}' cy='101' r='2' fill='#b9ab93'/><circle cx='${x}' cy='117' r='2' fill='#b9ab93'/>`).join('');
    return `<svg class='carsvg' viewBox='0 0 420 190' aria-hidden='true'><defs><linearGradient id='bg${id}' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${o.t}'/><stop offset='1' stop-color='${o.b}'/></linearGradient><linearGradient id='ch${id}' x1='0' y1='0' x2='1' y2='0'><stop offset='0' stop-color='#3a322a'/><stop offset='.45' stop-color='#d8cdbb'/><stop offset='1' stop-color='#2a2420'/></linearGradient><clipPath id='cp${id}'><path d='${BODY}'/></clipPath></defs>`
      + `<ellipse cx='210' cy='170' rx='200' ry='11' fill='rgba(0,0,0,.6)'/><ellipse cx='210' cy='166' rx='175' ry='9' fill='${o.glow}' opacity='.6' filter='url(#blur8)'/>`
      + `<g class='body'><path d='M120 46 V4 M140 44 V12' stroke='url(#ch${id})' stroke-width='9' fill='none'/><path d='M142 42 L152 20 H252 L264 42 M180 20 V42 M222 20 V42' stroke='#17110d' stroke-width='5' fill='none'/>`
      + `<path d='${BODY}' fill='url(#bg${id})'/><g clip-path='url(#cp${id})'><rect width='420' height='190' filter='url(#rustfx)' opacity='.85'/><rect width='420' height='190' filter='url(#scratch)' opacity='.7'/></g><path d='${BODY}' fill='none' stroke='#120c08' stroke-width='2.5'/>`
      + `<path d='M128 84 L150 54 L208 54 L208 84 Z' fill='#0b1214'/><path d='M218 84 L218 54 L262 54 L306 84 Z' fill='#0b1214'/><path d='M140 78 L158 60 M232 78 L246 60' stroke='rgba(120,220,230,.4)' stroke-width='3'/>`
      + `<path d='M212 56 V128 M64 100 H168' stroke='rgba(0,0,0,.55)' stroke-width='2' fill='none'/><rect x='172' y='92' width='122' height='34' fill='#2e2219' stroke='#120c08' stroke-width='2'/>${bolts}`
      + `<path d='M396 92 L404 68 L410 96 Z M366 88 L372 66 L380 90 Z' fill='#bdb2a0' stroke='#120c08' stroke-width='1.5'/><rect x='392' y='100' width='14' height='8' fill='#bff6ff'/><circle cx='406' cy='104' r='9' fill='#bff6ff' opacity='.35'/>`
      + `<g class='dmg' opacity='0'><path d='M406 96 L388 103 L399 111 L380 118 L395 124 L406 130 Z' fill='#0a0807'/><path d='M388 103 L368 99 M380 118 L360 123' stroke='#d9631e' stroke-width='2' fill='none'/></g></g>`
      + `<g class='wheels'>${wheel(95)}${wheel(335)}</g></svg>`;
  };

  const defs = [
    { id: 'A', t: '#9a5226', b: '#4a2410', glow: '#27d6e0' },
    { id: 'B', t: '#a89774', b: '#4d4232', glow: '#ff3fa4' },
    { id: 'C', t: '#4b545a', b: '#1b2023', glow: '#ff8a2a' }
  ];
  const cars = ['carA', 'carB', 'carC'].map((cid, i) => {
    const el = document.getElementById(cid);
    el.innerHTML = carSVG(defs[i].id, defs[i]);
    return { el, body: el.querySelector('.body'), dmg: el.querySelector('.dmg'), wheels: Array.from(el.querySelectorAll('.wheel')) };
  });
  const A = cars[0], B = cars[1], C = cars[2];

  const lerp = (a, b, t) => a + (b - a) * t;
  const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const place = (c, x, y, rot, k, wr) => {
    c.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg)`;
    c.body.style.transformOrigin = '406px 110px';
    c.body.style.transform = `scale(${(1 - 0.17 * k).toFixed(3)},${(1 + 0.05 * k).toFixed(3)}) skewY(${(-4 * k).toFixed(2)}deg)`;
    c.dmg.style.opacity = k.toFixed(2);
    c.wheels.forEach((w) => { w.style.transform = `rotate(${wr.toFixed(1)}deg)`; });
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
    const floor = fx.height * 0.8;
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

  const titles = ['Two rigs. One lane.', 'Metal meets metal.', 'Nobody leaves clean.'];
  let tIdx = 0;
  const setTitle = (i) => {
    if (i === tIdx) return;
    tIdx = i;
    title.classList.remove('in');
    setTimeout(() => { title.textContent = titles[tIdx]; title.classList.add('in'); }, 220);
  };

  let hit1 = false, hit2 = false;
  const render = (p) => {
    const W = stage.clientWidth, H = stage.clientHeight;
    const cw = A.el.offsetWidth, mid = W / 2, ov = cw * 0.07;
    const aI = mid - cw + ov, bI = mid - ov;
    const t = cl(p / 0.4), e = Math.pow(t, 2.2);
    const u = cl((p - 0.4) / 0.2), eo = 1 - Math.pow(1 - u, 3);
    const w = cl((p - 0.62) / 0.23), ew = w * w;
    const z = cl((p - 0.85) / 0.1), ez = 1 - Math.pow(1 - z, 3);
    const ax = lerp(-cw * 1.15, aI, e) - cw * 0.09 * eo - cw * 0.06 * ez;
    const bx = lerp(W + cw * 0.15, bI, e) + cw * 0.09 * eo - cw * 0.1 * ez;
    const cx = lerp(W + 40, bx + cw - cw * 0.06, ew);
    const su = Math.sin(u * Math.PI), sz = Math.sin(z * Math.PI);
    place(A, ax, -su * cw * 0.05, -2 * eo - 4 * su, cl(u * 3), ax * 0.8);
    place(B, bx, -su * cw * 0.07 - sz * cw * 0.04, 3 * eo + 5 * su + 2 * ez, cl(u * 3 + ez * 0.3), -bx * 0.8);
    place(C, cx, -sz * cw * 0.05, -3 * sz, cl(z * 3), -cx * 0.8);
    const s1 = p >= 0.4 && p < 0.5 ? 1 - (p - 0.4) / 0.1 : 0;
    const s2 = p >= 0.85 && p < 0.93 ? 1 - (p - 0.85) / 0.08 : 0;
    const amp = reduce ? 0 : Math.max(s1, s2);
    world.style.transform = amp ? `translate(${((Math.random() - 0.5) * 14 * amp).toFixed(1)}px,${((Math.random() - 0.5) * 10 * amp).toFixed(1)}px)` : '';
    setTitle(p < 0.38 ? 0 : p < 0.84 ? 1 : 2);
    const carH = cw * 190 / 420;
    const iy = H * 0.76 + 22 - carH * 0.5;
    if (p >= 0.4 && !hit1) { hit1 = true; burst(mid, iy); } else if (p < 0.38) hit1 = false;
    if (p >= 0.85 && !hit2) { hit2 = true; burst(bx + cw, iy); } else if (p < 0.83) hit2 = false;
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
