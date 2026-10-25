/* ---------------- الإطار ---------------- */
function gl3Render(r) {
  const g = gl, now = performance.now(), dt = clamp((now - (g.lastT || now)) / 1000, 0, 0.05); g.lastT = now;
  const env = envAt(r.units * 0.5), stg = r.stage && (G.state === 'cut' || G.state === 'final') ? r.stage : null;
  if (!stg) { if (r.stage) r.stage = null; if (r.faceY) r.faceY = 0; if (g.kit.visible) g.kit.visible = false; if (g.rope.visible) g.rope.visible = false; if (g.sh.root.scale.x !== 1) g.sh.root.scale.setScalar(1); if (g.bu.M.scale.x !== 0.104) g.bu.M.scale.setScalar(0.104); }
  updateSky(r, env);
  if (stg) { g.amb.intensity *= stg === 'final' ? 0.55 : 0.6; g.sun.intensity *= 0.5; g.fill.intensity *= 0.5; }
  const off = scrollOff(r.units, g.roadZc, g.roadL); g.roadTex.offset.y = off; g.swTex.offset.y = off;
  const inIntro = G.state === 'intro'; if (g.intro) g.intro.visible = inIntro;
  syncBuildings(r); syncGarlands(r); if (inIntro) { const zw = introZW(); g.gar.forEach(q => { q.visible = q.position.z >= zw; }); } else g.gar.forEach(q => { q.visible = true; });
  if (stg) { const so = r.obs, sp = r.pk; r.obs = []; r.pk = []; syncObstacles(r); syncPickups(r); r.obs = so; r.pk = sp; stageUpdate(r, r.stageT); } else { syncObstacles(r); syncPickups(r); }
  updateSheep(r, dt); if (!stg) updateButcher(r); if (inIntro) g.bu.root.visible = false;
  const sh = r.shake > 0 ? r.shake : 0, cp = stg ? [0, 1.9, F - 2.5] : [0, g.camY, F];
  g.cam.position.set(cp[0] + rnd(-1, 1) * sh * 0.07, cp[1] + rnd(-1, 1) * sh * 0.07, cp[2]);
  g.rd.render(g.sc, g.cam);
}
function bubble(c, bt, bx, by, u) {
  const pul = 1 + Math.sin(run.t * 12) * 0.06; c.save(); c.translate(bx, by); c.scale(pul, pul); c.font = `900 ${Math.max(12, u * 0.42)}px Cairo,sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
  const tw = c.measureText(bt).width + 16; rr(c, -tw / 2, -u * 0.3, tw, u * 0.6, u * 0.2, '#fff', '#e53935', Math.max(2, u * 0.06)); c.fillStyle = '#c62828'; c.fillText(bt, 0, 0); c.restore();
}
function draw() {
  if (!GLC.ok) return draw2D();
  const r = run, c = cx2; c.setTransform(DPR, 0, 0, DPR, 0, 0); c.clearRect(0, 0, W, H);
  gl.el.style.display = ''; gl3Render(r);
  c.save(); if (r.shake > 0) c.translate(rnd(-1, 1) * r.shake * 9, rnd(-1, 1) * r.shake * 9);
  for (const q of r.parts) { c.globalAlpha = 1 - q.t / q.life; c.fillStyle = q.c; c.beginPath(); c.arc(q.x, q.y, q.s * (1 - q.t / q.life * 0.5), 0, 6.3); c.fill(); }
  c.globalAlpha = 1; c.restore();
  // تحذير القطط والكلاب القادمة
  for (const o of r.obs) if (o.pet && Math.abs(o.x) > 1.9 && o.z > 4 && o.z < o.cz + 15 + r.speed * 1.6 && o.z < ZMAX) {
    const s = F / (F + o.z), u = U * s, p = toScreen(o.x, 0, o.z); bubble(c, (o.type === 'dog' ? _t('🐶 هو هو!') : _t('🐱 مياو!')) + ' ⚠️', clamp(p[0], 60, W - 60), p[1] - 1.9 * u, u);
  }
  // فقاعة كلام الجزار
  const k = clamp(r.close, 0, 1);
  if (k > 0.45 && r.msg < 1e9 && Math.floor(r.t * 0.7) % 2 === 0) {
    const B = gl.bu, p = toScreen(B.root.position.x, B.root.position.y + 14.2 * 0.104, B.root.position.z); c.save(); c.font = `900 ${Math.max(13, W * 0.04)}px Cairo,sans-serif`; c.textAlign = 'center';
    const tx = _t('تعالَ يا خروف! 🔪'), tw = c.measureText(tx).width + 22, bx = clamp(p[0], tw / 2 + 6, W - tw / 2 - 6), by = p[1] - 10;
    if (by > 70) { rr(c, bx - tw / 2, by - 18, tw, 32, 14, '#fff', '#c0392b', 3); c.fillStyle = '#c0392b'; c.textBaseline = 'middle'; c.fillText(tx, bx, by - 2); } c.restore();
  }
  if (r.flash > 0) { c.fillStyle = `rgba(255,60,60,${r.flash * 0.3})`; c.fillRect(0, 0, W, H); }
  c.font = `900 ${Math.max(16, W * 0.05)}px Cairo,sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  for (const q of r.pops) { c.globalAlpha = 1 - q.t / 0.9; const y = q.y - q.t * 70; c.lineWidth = 5; c.strokeStyle = '#000b'; c.strokeText(q.txt, clamp(q.x, 90, W - 90), y); c.fillStyle = q.col; c.fillText(q.txt, clamp(q.x, 90, W - 90), y); }
  c.globalAlpha = 1;
}
/*3D-END*/
