/* ---------------- مقدمة: نطح الباب (3D) ---------------- */
function buildIntro() {
  const g = gl, I = g.intro = new T.Group(); I.visible = false; g.scene.add(I);
  const brick = mkTex(mkCanvas(256, 256, (c, w, h) => { c.fillStyle = '#b8966c'; c.fillRect(0, 0, w, h); const bh = h / 8, bw = w / 2; for (let y = 0, i = 0; y < 8; y++, i++) for (let x = -1; x < 3; x++) { const xx = x * bw + (i % 2) * bw / 2; c.fillStyle = `hsl(32,${28 + (x * 7 + y * 5) % 10}%,${58 + (x * 13 + y * 7) % 9}%)`; c.fillRect(xx + 2, y * bh + 2, bw - 4, bh - 4); } }), true);
  brick.repeat.set(0.5, 0.5);
  const D = 4.2, DH = 4.3, shp = new T.Shape(); shp.moveTo(-10, 0); shp.lineTo(10, 0); shp.lineTo(10, 14); shp.lineTo(-10, 14); shp.closePath();
  const hole = new T.Path(); hole.moveTo(-D / 2, 0); hole.lineTo(-D / 2, DH); hole.lineTo(D / 2, DH); hole.lineTo(D / 2, 0); hole.closePath(); shp.holes.push(hole);
  const wallG = new T.ExtrudeGeometry(shp, { depth: 0.6, bevelEnabled: false }); wallG.translate(0, 0, -0.3);
  const wall = new T.Mesh(wallG, lam(0xffffff, { map: brick })); I.add(wall);
  const stone = lam(0x6a5340);
  for (const sd of [-1, 1]) { const p = box(0.6, DH + 0.5, 0.9, stone); p.position.set(sd * (D / 2 + 0.3), (DH + 0.5) / 2, 0); I.add(p); }
  const lin = box(D + 1.2, 0.55, 0.9, stone); lin.position.set(0, DH + 0.27, 0); I.add(lin);
  // اللافتة
  const sign = g.introSign = new T.Group(); sign.position.set(0, DH + 1.25, -0.55); I.add(sign);
  const st = mkTex(mkCanvas(512, 112, (c, w, h) => { c.translate(w, 0); c.scale(-1, 1); c.fillStyle = '#6b4a2b'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2e1d0e'; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8); c.font = '900 50px Cairo,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 8; c.strokeStyle = '#2a0707'; { const tx = _t('مدبح الجزار بسيوني'), f = Math.min(1, w * 0.9 / c.measureText(tx).width); c.save(); c.translate(w / 2, h / 2 + 3); c.scale(f, f); c.strokeText(tx, 0, 0); c.fillStyle = '#d3271d'; c.fillText(tx, 0, 0); c.restore(); } c.fillStyle = '#b01c14'; for (const x of [0.2, 0.43, 0.66, 0.84]) { c.beginPath(); c.ellipse(w * x, h - 2, 4, 8 + (x > 0.5 ? 5 : 0), 0, 0, 6.3); c.fill(); } }));
  const bd = new T.Mesh(new T.BoxGeometry(5.6, 1.2, 0.2), [lam(0x4a3320), lam(0x4a3320), lam(0x4a3320), lam(0x4a3320), lam(0x4a3320), lam(0xffffff, { map: st })]); sign.add(bd);
  for (const sd of [-1, 1]) { const ch = box(0.05, 0.9, 0.05, lam(0x3a2a1a)); ch.position.set(sd * 2.2, 1.0, 0); sign.add(ch); }
  // الدرفتان
  const wood = mkTex(mkCanvas(128, 256, (c, w, h) => { for (let i = 0; i < 5; i++) { c.fillStyle = `hsl(30,52%,${30 + (i * 7) % 9}%)`; c.fillRect(i * w / 5, 0, w / 5 - 1.5, h); } c.fillStyle = '#2b2b30'; c.fillRect(0, h * 0.2, w, 10); c.fillRect(0, h * 0.78, w, 10); }));
  const lm = lam(0xffffff, { map: wood });
  g.leaf = [];
  for (const sd of [-1, 1]) { const hg = new T.Group(); hg.position.set(sd * D / 2, 0, 0); const m = box(D / 2, DH, 0.16, lm); m.position.set(-sd * D / 4, DH / 2, 0); hg.add(m); const kn = new T.Mesh(new T.TorusGeometry(0.12, 0.03, 6, 12), lam(0x1f1f24)); kn.position.set(-sd * (D / 2 - 0.3), DH * 0.5, 0.1); hg.add(kn); I.add(hg); g.leaf.push([hg, sd]); }
  // الأرضية داخل المدبح
  const fl = mkTex(mkCanvas(256, 256, (c, w, h) => { c.fillStyle = '#5a4430'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 3; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(0, i * h / 4); c.lineTo(w, i * h / 4); c.moveTo(i * w / 4, 0); c.lineTo(i * w / 4, h); c.stroke(); } }), true); fl.repeat.set(8, 6);
  const floor = new T.Mesh(new T.PlaneGeometry(26, 20), lam(0xffffff, { map: fl })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0.16, -10.1); I.add(floor);
  // حطام
  g.deb = []; const dm = lam(0x8a5a2b);
  for (let i = 0; i < 16; i++) { const m = box(0.25 + (i % 3) * 0.12, 0.08, 0.5, dm); m.visible = false; I.add(m); g.deb.push(m); }
}
function introZW() { const s = clamp(0.33 * W / (2.1 * LW), 0.3, 0.7); return F * (1 / s - 1); }
function updateIntro(r, t) {
  const g = gl, I = g.intro, zw = introZW(), post = t - IMPACT, hit = post > 0;
  I.position.z = zw; I.visible = true;
  const th = hit ? easeOut(post / 0.8) * 1.45 + Math.sin(post * 9) * 0.04 * Math.exp(-post * 3) : (t > 1.82 ? Math.sin((t - 1.82) * 40) * 0.015 : 0);
  for (const [hg, sd] of g.leaf) hg.rotation.y = sd * th;   // تُفتح للداخل (+z)
  g.introSign.rotation.z = hit ? Math.sin(post * 14) * 0.09 * Math.exp(-post * 2.2) : Math.sin(t * 2) * 0.012;
  for (let i = 0; i < g.deb.length; i++) { const m = g.deb[i]; m.visible = hit && post < 1.6; if (!m.visible) continue; const a = (i * 2.399) % 6.28, v = 3 + (i * 53) % 5; m.position.set(Math.cos(a) * v * post * 0.8, 2 + Math.sin(a) * 0.8 + v * 0.5 * post - 5 * post * post, Math.sin(a * 1.7) * v * post * 0.7 + 0.2); m.rotation.set(post * (4 + i), post * (3 + i % 4), post * 2); }
  // الخروف
  let z, py = 0;
  if (t < 1.0) z = 0; else if (t < 1.7) z = -1.6 * easeOut((t - 1.0) / 0.7);
  else if (t < IMPACT) { const e = (t - 1.7) / (IMPACT - 1.7); z = lerp(-1.6, zw - 0.45, e * e); } else z = lerp(zw - 0.45, zw + 6, easeOut(post / 1.5));
  if (t >= 1.88 && t < IMPACT + 0.25) py = Math.sin(Math.PI * (t - 1.88) / (IMPACT + 0.25 - 1.88)) * 1.1;
  r.introZ = z; r.py = py; r.grounded = py <= 0.01; r.px = 0; r.t = t; r.ph = t * (t > 1.7 ? 16 : (t > 1.0 ? 9 : 3)); r.sliding = 0; r.ls = 0; r.inv = 0; r.fly = 0; r.close = 0; r.units = 0;
  r.shake = hit && post < 0.5 ? (0.5 - post) * 1.6 : 0;
  return z;
}
function drawIntro3D(c, t, r) {
  c.setTransform(DPR, 0, 0, DPR, 0, 0); c.clearRect(0, 0, W, H);
  const z = updateIntro(r, t); gl.el.style.display = ''; gl3Render(r);
  const post = t - IMPACT, hit = post > 0, p = toScreen(0, 0, z), u = U * F / (F + z), sx = p[0], gyS = p[1], UK = u;
  if (t > 0.3 && t < 1.6) speech(c, _t('ماااع! لازم أهرب 😰'), sx + UK * 0.5, gyS - UK * 1.5, Math.max(13, W * 0.04), 0);
  if (t > 1.75 && t < IMPACT) speech(c, _t('هااااا!! 💪'), sx + UK * 0.5, gyS - UK * 1.4, Math.max(14, W * 0.045), 0);
  cutText(c, _t('هروب! 🐑💨'), H * 0.84, Math.min(W * 0.17, H * 0.1), t, IMPACT + 0.2, '#ffe14d');
  if (hit && post < 0.12) { c.fillStyle = `rgba(255,255,255,${0.7 * (1 - post / 0.12)})`; c.fillRect(0, 0, W, H); }
  const bar = H * 0.07 * easeOut(t / 0.4); c.fillStyle = '#000'; c.fillRect(0, 0, W, bar); c.fillRect(0, H - bar, W, bar);
  if (t > 0.8 && t < INTRO_LEN - 0.6) { c.save(); c.globalAlpha = 0.7; c.fillStyle = '#fff'; c.font = `800 ${Math.max(11, W * 0.032)}px Cairo,sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(_t('اضغط للتخطي ⏭'), W / 2, H - bar * 0.5); c.restore(); }
  if (t > INTRO_LEN - 0.5) { c.fillStyle = `rgba(255,248,225,${clamp((t - (INTRO_LEN - 0.5)) / 0.5, 0, 1)})`; c.fillRect(0, 0, W, H); }
}
