(() => {
  const rep = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join('');
  const dim = { A: { w: 680, h: 290 }, D: { w: 700, h: 330 }, C: { w: 680, h: 300 } };

  const defs = (k, o, w, h, seed) => `
<linearGradient id='pt${k}' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${o.top}'/><stop offset='.6' stop-color='${o.mid}'/><stop offset='1' stop-color='${o.bot}'/></linearGradient>
<linearGradient id='st${k}' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#9a9186'/><stop offset='.45' stop-color='#4d4740'/><stop offset='1' stop-color='#1c1814'/></linearGradient>
<linearGradient id='ch${k}' x1='0' y1='0' x2='1' y2='0'><stop offset='0' stop-color='#2b2520'/><stop offset='.4' stop-color='#d9d0c0'/><stop offset='.6' stop-color='#8d857a'/><stop offset='1' stop-color='#1d1914'/></linearGradient>
<linearGradient id='gl${k}' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#1d3138'/><stop offset='.45' stop-color='#0a1114'/><stop offset='.55' stop-color='#2a4750'/><stop offset='1' stop-color='#0a1114'/></linearGradient>
<radialGradient id='rb${k}' cx='45%' cy='40%' r='65%'><stop offset='0' stop-color='#34302b'/><stop offset='.7' stop-color='#171310'/><stop offset='1' stop-color='#050403'/></radialGradient>
<radialGradient id='rm${k}' cx='40%' cy='35%' r='70%'><stop offset='0' stop-color='#cfc6b4'/><stop offset='.5' stop-color='#6d655a'/><stop offset='1' stop-color='#1f1b17'/></radialGradient>
<linearGradient id='lg${k}' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#fff' stop-opacity='.38'/><stop offset='.5' stop-color='#fff' stop-opacity='0'/><stop offset='1' stop-color='#000' stop-opacity='.5'/></linearGradient>
<filter id='bp${k}' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='.05 .08' numOctaves='4' seed='${seed}' result='n'/><feDiffuseLighting in='n' surfaceScale='3.2' diffuseConstant='1.15' lighting-color='#fff'><feDistantLight azimuth='235' elevation='50'/></feDiffuseLighting></filter>
<filter id='ru${k}' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='.016 .03' numOctaves='3' seed='${seed + 4}'/><feColorMatrix type='matrix' values='0 0 0 0 .75 0 0 0 0 .3 0 0 0 0 .07 14 0 0 0 -7.2'/></filter>
<filter id='cp${k}' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='.3' numOctaves='2' seed='${seed + 9}'/><feColorMatrix type='matrix' values='0 0 0 0 .86 0 0 0 0 .78 0 0 0 0 .62 34 0 0 0 -19.6'/></filter>
<filter id='bl${k}'><feGaussianBlur stdDeviation='3'/></filter>`;

  const tire = (cx, cy, R, k) => {
    const n = 26;
    const treads = rep(n, (i) => {
      const a = i * 2 * Math.PI / n, b = a + Math.PI / n * 0.62;
      const r1 = R * 0.9, r2 = R;
      const p = (r, t) => `${(cx + r * Math.cos(t)).toFixed(1)} ${(cy + r * Math.sin(t)).toFixed(1)}`;
      return `<path d='M${p(r1, a)} L${p(r2, a + 0.02)} L${p(r2, b - 0.02)} L${p(r1, b)}Z' fill='#0a0807' stroke='#2a2520' stroke-width='.8'/>`;
    });
    const rimR = R * 0.5;
    const bolts = rep(8, (i) => { const t = i * Math.PI / 4; return `<circle cx='${(cx + rimR * 0.72 * Math.cos(t)).toFixed(1)}' cy='${(cy + rimR * 0.72 * Math.sin(t)).toFixed(1)}' r='${(R * 0.04).toFixed(1)}' fill='#d8cfbd' stroke='#1b1511' stroke-width='.8'/>`; });
    return `<g class='wheel'><circle cx='${cx}' cy='${cy}' r='${R}' fill='url(#rb${k})' stroke='#050403' stroke-width='2'/>${treads}<circle cx='${cx}' cy='${cy}' r='${R * 0.88}' fill='none' stroke='#2e2923' stroke-width='1.5'/><circle cx='${cx}' cy='${cy}' r='${R * 0.74}' fill='none' stroke='#0a0807' stroke-width='5'/><circle cx='${cx}' cy='${cy}' r='${rimR}' fill='url(#rm${k})' stroke='#14100d' stroke-width='2'/><circle cx='${cx}' cy='${cy}' r='${rimR * 0.78}' fill='#17130f' opacity='.55'/>${bolts}<circle cx='${cx}' cy='${cy}' r='${R * 0.1}' fill='url(#rm${k})' stroke='#14100d' stroke-width='1.5'/></g>`;
  };

  const holes = (pts) => pts.map(([x, y]) => `<circle cx='${x}' cy='${y}' r='3.2' fill='#050403' stroke='#c9bda4' stroke-width='1' stroke-opacity='.6'/>`).join('');
  const rivets = (x0, x1, y, step) => rep(Math.floor((x1 - x0) / step) + 1, (i) => `<circle cx='${x0 + i * step}' cy='${y}' r='1.9' fill='#cdbfa5' stroke='#1b1511' stroke-width='.7'/>`);
  const spring = (x, y0, y1, k) => {
    const n = 7, dy = (y1 - y0) / n;
    return `<path d='M${x} ${y0}${rep(n, (i) => ` L${x + (i % 2 ? -7 : 7)} ${(y0 + dy * (i + 0.5)).toFixed(1)} L${x} ${(y0 + dy * (i + 1)).toFixed(1)}`)}' fill='none' stroke='#c2a878' stroke-width='3' stroke-linejoin='round'/><rect x='${x - 4}' y='${y0 - 4}' width='8' height='${y1 - y0 + 8}' fill='none' stroke='#1c1814' stroke-width='1.2' opacity='.6'/>`;
  };
  const pipe = (x1, y1, x2, y2, wd, k) => `<path d='M${x1} ${y1} L${x2} ${y2}' stroke='#14100d' stroke-width='${wd + 3}' stroke-linecap='round'/><path d='M${x1} ${y1} L${x2} ${y2}' stroke='url(#ch${k})' stroke-width='${wd}' stroke-linecap='round'/>`;

  const wrap = (key, o, parts) => {
    const { w, h } = dim[key], k = key, seed = o.seed;
    return `<svg class='carsvg' viewBox='0 0 ${w} ${h + 16}' aria-hidden='true'><defs>${defs(k, o, w, h, seed)}<clipPath id='cl${k}'>${parts.clip}</clipPath></defs>`
      + `<rect x='${w * 0.08}' y='${h + 1}' width='${w * 0.84}' height='7' rx='3.5' fill='${o.glow}' opacity='.55' filter='url(#bl${k})'/><rect x='${w * 0.1}' y='${h + 3}' width='${w * 0.8}' height='2.4' rx='1.2' fill='${o.glow}' opacity='.95'/>`
      + `<ellipse cx='${w / 2}' cy='${h - 2}' rx='${w * 0.46}' ry='7' fill='#000' opacity='.55'/>`
      + `<g class='body'>${parts.back}${parts.body}`
      + `<g clip-path='url(#cl${k})'><rect width='${w}' height='${h}' filter='url(#bp${k})' opacity='.5' style='mix-blend-mode:multiply'/><rect width='${w}' height='${h}' filter='url(#ru${k})' opacity='.62' style='mix-blend-mode:multiply'/><rect width='${w}' height='${h}' filter='url(#cp${k})' opacity='.4'/><rect width='${w}' height='${h}' fill='url(#lg${k})'/></g>`
      + `${parts.detail}${parts.front}`
      + `<g class='dmg' opacity='0'><path d='M${w} ${h * 0.3} L${w - 28} ${h * 0.4} L${w - 8} ${h * 0.5} L${w - 38} ${h * 0.6} L${w - 14} ${h * 0.72} L${w} ${h * 0.84}Z' fill='#090706'/><path d='M${w - 28} ${h * 0.4} L${w - 58} ${h * 0.36} M${w - 38} ${h * 0.6} L${w - 66} ${h * 0.66}' stroke='#d9631e' stroke-width='2.2' fill='none'/></g></g>${parts.wheels}</svg>`;
  };

  const carA = (o) => {
    const k = 'A';
    const body = 'M100 160 L98 132 Q99 122 112 120 L196 112 L246 84 Q254 78 268 78 L352 78 Q368 79 378 92 L400 116 L514 124 Q556 127 582 138 L604 150 Q614 156 612 170 L608 184 L566 190 L330 196 L236 198 L116 192 Q98 188 100 160Z';
    const back = `<path d='M120 196 L204 220 L282 196 L360 220 L440 196 L478 216 M150 206 L478 216' stroke='#14100d' stroke-width='5' fill='none' stroke-linejoin='round'/>`
      + spring(452, 176, 214, k) + spring(500, 176, 214, k)
      + `<path d='M70 92 L190 86 L192 95 L72 101Z' fill='url(#st${k})' stroke='#0a0807' stroke-width='1.5'/><path d='M128 108 L130 96 M170 106 L172 92' stroke='#14100d' stroke-width='4'/>`;
    const bodyM = `<path d='${body}' fill='url(#pt${k})' stroke='#0a0807' stroke-width='2.4' stroke-linejoin='round'/>`;
    const detail = `<path d='M226 106 L252 86 L300 86 L300 110Z M308 86 L350 86 Q362 87 370 98 L388 112 L308 112Z' fill='url(#gl${k})' stroke='#0a0807' stroke-width='2'/>`
      + `<path d='M262 84 L262 112 M300 86 L300 112 M338 86 L338 112' stroke='#15100c' stroke-width='3'/><path d='M244 118 L268 80 L360 80 L396 118' fill='none' stroke='#15100c' stroke-width='4' stroke-linejoin='round' opacity='.7'/>`
      + `<path d='M304 114 L300 192 M236 124 L232 196' stroke='#0a0807' stroke-width='2' opacity='.8'/><rect x='312' y='128' width='24' height='5' rx='2' fill='#2a231d' stroke='#0a0807'/>`
      + `<path d='M250 150 L282 140 M256 164 L300 152 M330 166 L372 160' stroke='#e4d6b8' stroke-width='1.6' opacity='.5'/>`
      + `<rect x='408' y='92' width='76' height='32' rx='3' fill='url(#st${k})' stroke='#0a0807' stroke-width='2'/><path d='M418 92 L432 60 L478 54 L488 64 L484 92Z' fill='#4f7285' stroke='#0a0807' stroke-width='2'/><path d='M424 88 L436 64 L474 59' stroke='#b9d6e4' stroke-width='2' fill='none' opacity='.6'/><ellipse cx='488' cy='70' rx='4' ry='13' fill='#050403'/><circle cx='444' cy='108' r='9' fill='url(#ch${k})' stroke='#0a0807' stroke-width='1.5'/><circle cx='468' cy='108' r='9' fill='url(#ch${k})' stroke='#0a0807' stroke-width='1.5'/>`
      + rep(3, (i) => pipe(130 + i * 15, 124, 112 + i * 15, 158, 9, k)) + rep(3, (i) => `<ellipse cx='${111 + i * 15}' cy='160' rx='7' ry='4' fill='#050403' stroke='#8a7f6d' stroke-width='1'/>`)
      + `<rect x='118' y='186' width='450' height='12' fill='#0b0907' opacity='.85'/>` + rivets(250, 560, 183, 18) + holes([[164, 150], [176, 146], [292, 172], [330, 176], [470, 140], [518, 146]]);
    const arches = `<circle cx='150' cy='206' r='72' fill='#080605'/><circle cx='478' cy='216' r='62' fill='#080605'/>`;
    const wheels = arches + tire(150, 206, 64, k) + tire(478, 216, 54, k);
    const front = `<path d='M566 190 L626 190 L626 198 L566 198Z' fill='url(#st${k})' stroke='#0a0807' stroke-width='1.5'/><rect x='584' y='158' width='26' height='24' fill='#0c0a08' stroke='#2a241e'/><path d='M588 162 V180 M594 162 V180 M600 162 V180 M606 162 V180' stroke='#6d655a' stroke-width='1.4'/>`
      + `<circle cx='596' cy='148' r='10' fill='url(#ch${k})' stroke='#0a0807' stroke-width='1.8'/><circle cx='596' cy='148' r='6' fill='#cffaff'/><ellipse cx='640' cy='150' rx='40' ry='14' fill='#bff6ff' opacity='.12'/>`
      + `<ellipse cx='592' cy='182' rx='13' ry='7' fill='#7c5f3a' stroke='#1b1511' stroke-width='1.5'/><path d='M582 180 Q592 186 602 180 M584 184 Q592 190 600 184' stroke='#3a2a18' fill='none'/>`
      + `<rect x='606' y='160' width='36' height='7' fill='url(#st${k})' stroke='#0a0807' stroke-width='1.5'/><path d='M640 150 L678 163.5 L640 177 L648 163.5Z' fill='#c4421c' stroke='#0a0807' stroke-width='1.8'/><path d='M650 156 L662 163.5 L650 171' fill='none' stroke='#ffb27a' stroke-width='1.4' opacity='.8'/>`;
    return wrap('A', o, { clip: `<path d='${body}'/>`, back, body: bodyM, detail, wheels, front });
  };

  const carD = (o) => {
    const k = 'D';
    const body = 'M70 126 L284 126 L292 100 Q300 74 330 72 L430 72 Q444 72 452 84 L474 114 L586 120 Q606 122 612 136 L616 186 L560 192 L84 192 Q70 190 70 176Z';
    const back = `<rect x='150' y='188' width='390' height='14' fill='#14100d'/><path d='M160 234 L520 234' stroke='#1c1814' stroke-width='8'/>` + spring(120, 160, 224, k) + spring(196, 160, 224, k) + spring(484, 160, 224, k) + spring(556, 160, 224, k)
      + `<rect x='296' y='24' width='10' height='88' fill='url(#ch${k})' stroke='#0a0807' stroke-width='1.5'/><rect x='312' y='34' width='10' height='78' fill='url(#ch${k})' stroke='#0a0807' stroke-width='1.5'/><ellipse cx='301' cy='24' rx='8' ry='3.5' fill='#050403'/><ellipse cx='317' cy='34' rx='8' ry='3.5' fill='#050403'/>`;
    const bodyM = `<path d='${body}' fill='url(#pt${k})' stroke='#0a0807' stroke-width='2.4' stroke-linejoin='round'/>`;
    const spikes = rep(10, (i) => `<path d='M${80 + i * 21} 126 L${88 + i * 21} 108 L${96 + i * 21} 126Z' fill='url(#st${k})' stroke='#0a0807' stroke-width='1.3'/>`);
    const detail = spikes + `<path d='M326 80 L428 80 Q438 80 444 90 L458 112 L322 112Z' fill='url(#gl${k})' stroke='#0a0807' stroke-width='2'/><path d='M384 80 V112' stroke='#15100c' stroke-width='4'/>`
      + `<rect x='338' y='56' width='84' height='11' rx='2' fill='#15110d' stroke='#0a0807' stroke-width='1.5'/>` + rep(4, (i) => `<circle cx='${352 + i * 20}' cy='61.5' r='4.2' fill='#ffe6a8'/>`)
      + `<path d='M230 126 V98 M214 98 L274 98 L274 90 L214 90Z' stroke='#0a0807' stroke-width='2' fill='url(#st${k})'/><rect x='214' y='84' width='62' height='12' rx='2' fill='#2a251f' stroke='#0a0807' stroke-width='1.6'/><rect x='276' y='87' width='40' height='5' fill='#14100d'/><rect x='202' y='100' width='22' height='16' fill='#4a4333' stroke='#0a0807' stroke-width='1.4'/>`
      + `<path d='M290 128 L286 188 M470 118 L474 190' stroke='#0a0807' stroke-width='2.2' opacity='.8'/>` + rivets(90, 560, 182, 20) + rivets(100, 270, 140, 24)
      + `<path d='M110 150 L168 140 M300 160 L360 150 M430 166 L480 158' stroke='#e4d6b8' stroke-width='1.8' opacity='.45'/>` + holes([[120, 160], [134, 154], [350, 142], [420, 160], [520, 150]]);
    const arches = `<circle cx='160' cy='234' r='88' fill='#080605'/><circle cx='520' cy='234' r='88' fill='#080605'/>`;
    const wheels = arches + tire(160, 234, 78, k) + tire(520, 234, 78, k);
    const front = `<rect x='598' y='128' width='20' height='44' fill='#0c0a08' stroke='#2a241e'/><path d='M602 132 V170 M608 132 V170 M614 132 V170' stroke='#6d655a' stroke-width='1.4'/><circle cx='594' cy='140' r='9' fill='url(#ch${k})' stroke='#0a0807' stroke-width='1.8'/><circle cx='594' cy='140' r='5.5' fill='#ffe6a8'/>`
      + `<path d='M606 176 L650 190 M606 150 L650 128' stroke='url(#st${k})' stroke-width='7'/><path d='M624 102 L692 66 L702 252 L640 266 L628 200Z' fill='url(#st${k})' stroke='#0a0807' stroke-width='3' stroke-linejoin='round'/>`
      + rep(4, (i) => `<path d='M${640 + i * 14} ${108 - i * 6} L${654 + i * 14} ${100 - i * 6} L${648 + i * 14} ${246 - i * 4} L${634 + i * 14} ${252 - i * 4}Z' fill='#d9631e' opacity='${i % 2 ? 0 : 0.75}'/>`)
      + `<path d='M628 200 L640 266 M624 102 L636 118 M692 66 L700 120' stroke='#e4d6b8' stroke-width='1.6' opacity='.5'/>` + holes([[664, 130], [668, 170], [670, 210]]) + `<path d='M626 112 L694 76' stroke='#ffd9a8' stroke-width='2' opacity='.5'/>`;
    return wrap('D', o, { clip: `<path d='${body}'/>`, back, body: bodyM, detail, wheels, front });
  };

  const carC = (o) => {
    const k = 'C';
    const body = 'M70 200 L70 118 Q72 108 84 108 L330 108 L342 84 Q348 70 366 70 L450 70 Q462 70 468 82 L496 130 L532 136 Q546 138 548 152 L548 200Z';
    const sawPts = (cx, cy, R) => rep(30, (i) => { const a = i * 2 * Math.PI / 30, b = a + Math.PI / 30, c = a + Math.PI * 2 / 60 * 1.4; const f = (r, t) => `${(cx + r * Math.cos(t)).toFixed(1)} ${(cy + r * Math.sin(t)).toFixed(1)}`; return `${i ? 'L' : 'M'}${f(R * 0.82, a)} L${f(R, c)} L${f(R * 0.82, b)} `; }) + 'Z';
    const wheelsTr = rep(6, (i) => `<g class='wheel'><circle cx='${126 + i * 66}' cy='240' r='25' fill='url(#st${k})' stroke='#050403' stroke-width='2.4'/><circle cx='${126 + i * 66}' cy='240' r='15' fill='url(#rm${k})' stroke='#0a0807' stroke-width='1.5'/><circle cx='${126 + i * 66}' cy='240' r='5' fill='#17130f'/>` + rep(6, (j) => `<circle cx='${(126 + i * 66 + 10 * Math.cos(j * Math.PI / 3)).toFixed(1)}' cy='${(240 + 10 * Math.sin(j * Math.PI / 3)).toFixed(1)}' r='1.6' fill='#d8cfbd'/>`) + `</g>`);
    const back = `<rect x='70' y='198' width='470' height='84' rx='40' fill='#0a0807' stroke='#2a2520' stroke-width='3'/><path d='M96 202 H514 M96 278 H514' stroke='#3d352c' stroke-width='7' stroke-dasharray='9 6'/><path d='M96 196 H514' stroke='#0a0807' stroke-width='4'/>`
      + rep(2, (i) => `<rect x='${156 + i * 40}' y='38' width='9' height='72' fill='url(#ch${k})' stroke='#0a0807' stroke-width='1.4'/>`) + `<path d='M100 108 L96 38 M236 108 L244 30' stroke='#14100d' stroke-width='2.4'/><circle cx='96' cy='36' r='3.4' fill='#c2561a'/><circle cx='244' cy='28' r='3.4' fill='#c2561a'/>`;
    const bodyM = `<path d='${body}' fill='url(#pt${k})' stroke='#0a0807' stroke-width='2.4' stroke-linejoin='round'/>`;
    const detail = `<path d='M120 110 V198 M170 110 V198 M220 110 V198 M270 110 V198 M320 110 V198' stroke='#0a0807' stroke-width='2' opacity='.7'/><path d='M72 150 H546' stroke='#0a0807' stroke-width='2' opacity='.6'/>` + rivets(78, 330, 116, 14) + rivets(78, 330, 192, 14) + rivets(335, 540, 192, 14)
      + `<circle cx='200' cy='130' r='11' fill='url(#st${k})' stroke='#0a0807' stroke-width='2'/><rect x='364' y='84' width='90' height='24' fill='url(#gl${k})' stroke='#0a0807' stroke-width='2.4'/><path d='M364 96 H454' stroke='#15100c' stroke-width='3'/><path d='M352 118 H500 M352 140 H500' stroke='#0a0807' stroke-width='2' opacity='.6'/>`
      + `<path d='M90 170 L150 160 M240 176 L300 166 M380 164 L440 156' stroke='#e4d6b8' stroke-width='1.8' opacity='.45'/>` + holes([[110, 134], [124, 128], [260, 170], [420, 150], [500, 160]]);
    const wheels = wheelsTr + `<circle cx='92' cy='240' r='30' fill='url(#st${k})' stroke='#050403' stroke-width='2.4'/><circle cx='92' cy='240' r='10' fill='#17130f'/><g class='wheel'><circle cx='516' cy='240' r='34' fill='url(#st${k})' stroke='#050403' stroke-width='2.4'/><circle cx='516' cy='240' r='12' fill='url(#rm${k})' stroke='#0a0807'/></g>`;
    const front = `<path d='M548 150 L600 168 L548 188Z' fill='url(#st${k})' stroke='#0a0807' stroke-width='2.4'/><g><path d='${sawPts(604, 170, 66)}' fill='url(#st${k})' stroke='#2a1408' stroke-width='2' stroke-linejoin='round'/><circle cx='604' cy='170' r='50' fill='none' stroke='#0a0807' stroke-width='2.4'/><circle cx='604' cy='170' r='36' fill='none' stroke='#0a0807' stroke-width='2' opacity='.7'/><circle cx='604' cy='170' r='15' fill='url(#rm${k})' stroke='#0a0807' stroke-width='2'/>${rep(8, (i) => `<circle cx='${(604 + 26 * Math.cos(i * Math.PI / 4)).toFixed(1)}' cy='${(170 + 26 * Math.sin(i * Math.PI / 4)).toFixed(1)}' r='3' fill='#d8cfbd' stroke='#0a0807' stroke-width='1'/>`)}<path d='${sawPts(604, 170, 66)}' fill='#c2561a' opacity='.28'/></g>`
      + `<circle cx='530' cy='146' r='7' fill='#ffe6a8' stroke='#0a0807' stroke-width='1.6'/><ellipse cx='560' cy='148' rx='28' ry='10' fill='#ffe6a8' opacity='.12'/>`;
    return wrap('C', o, { clip: `<path d='${body}'/>`, back, body: bodyM, detail, wheels, front });
  };

  window.CODE_CARS = { dim, make: { A: carA, D: carD, C: carC } };
})();
