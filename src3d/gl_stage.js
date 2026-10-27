/* ---------------- مشهدا الإمساك والنهاية (3D) ---------------- */
function softTex() { return mkTex(mkCanvas(64, 64, c => { const gr = c.createRadialGradient(32, 32, 2, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 64); })); }
function buildStage() {
  const g = gl, K = g.kit = new T.Group(); K.visible = false; g.scene.add(K);
  // جدران ومطبخ مظلم
  const pl = mkTex(mkCanvas(256, 256, (c, w, h) => { c.fillStyle = '#3b2315'; c.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) { c.fillStyle = `hsl(24,38%,${14 + (i * 5) % 9}%)`; c.fillRect(i * w / 6 + 2, 0, w / 6 - 4, h); } }), true); pl.repeat.set(4, 2);
  const wall = new T.Mesh(new T.PlaneGeometry(14, 8), lam(0xffffff, { map: pl })); wall.position.set(0, 3.5, 2.6); wall.rotation.y = Math.PI; K.add(wall);
  const fl = new T.Mesh(new T.PlaneGeometry(14, 12), lam(0x2a180e)); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.17, -3); K.add(fl);
  for (const [x, L] of [[-1.15, 1.8], [1.35, 2.2], [0.1, 0.6]]) {
    const ch = box(0.02, L, 0.02, lam(0x777777)); ch.position.set(x, 4.2 - L / 2 - 0.2, 2.3); K.add(ch);
    const mt = ellip(0.09, 0.14, 0.09, lam(0x8e2b2b, { emissive: 0x2a0808 }), 8); mt.position.set(x, 4.2 - L - 0.3, 2.3); K.add(mt);
  }
  // القدر
  const C = g.pot = new T.Group(); C.position.set(-0.5, 0.17, 0); K.add(C);
  const prof = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI * 0.62; prof.push(new T.Vector2(0.02 + Math.sin(a) * 0.62, 0.55 - Math.cos(a) * 0.55 + 0.02)); }
  const pot = new T.Mesh(new T.LatheGeometry(prof, 24), lam(0x20202a, { side: T.DoubleSide })); pot.position.y = 0.22; C.add(pot);
  const rim = new T.Mesh(new T.TorusGeometry(0.62, 0.05, 8, 24), lam(0x4a4a55)); rim.rotation.x = Math.PI / 2; rim.position.y = 0.77; C.add(rim);
  g.soup = new T.Mesh(new T.CircleGeometry(0.58, 24), new T.MeshBasicMaterial({ color: 0xc98a3b })); g.soup.rotation.x = -Math.PI / 2; g.soup.position.y = 0.72; C.add(g.soup);
  g.fl = []; for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28, f = new T.Mesh(new T.ConeGeometry(0.1, 0.4, 6), new T.MeshBasicMaterial({ color: i % 2 ? 0xffb02e : 0xff6a1a, transparent: true, opacity: 0.9 })); f.position.set(Math.cos(a) * 0.38, 0.2, Math.sin(a) * 0.38); C.add(f); g.fl.push(f); }
  g.bub = []; for (let i = 0; i < 8; i++) { const b = ellip(0.06, 0.06, 0.06, new T.MeshBasicMaterial({ color: 0xe8b45d }), 8); C.add(b); g.bub.push(b); }
  g.steam = []; const st = softTex(); for (let i = 0; i < 9; i++) { const s = new T.Sprite(new T.SpriteMaterial({ map: st, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, fog: false })); C.add(s); g.steam.push(s); }
  g.fire = new T.PointLight(0xff8a30, 1.3, 7); g.fire.position.set(0, 0.5, -0.9); C.add(g.fire);
  // حبل (قطعة أسطوانية موجهة)
  const rp = g.rope = new T.Mesh(new T.CylinderGeometry(0.022, 0.022, 1, 6), lam(0xe0b860, { emissive: 0x4a3510 })); rp.visible = false; g.scene.add(rp);
}
function aimRope(a, b) { const r = gl.rope, d = new T.Vector3().subVectors(b, a), L = d.length(); r.position.copy(a).addScaledVector(d, 0.5); r.scale.set(1, L, 1); r.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()); }
function handPos(arm, len) { return gl.scene.worldToLocal(arm.localToWorld(new T.Vector3(0, len, 0))); }
function reachArm(arm, target, base) {   // يوجّه الذراع نحو الهدف (إحداثيات المشهد)
  const B = gl.bu; B.root.updateMatrixWorld(true); const tw = gl.scene.localToWorld(target.clone()); B.M.worldToLocal(tw);
  const dx = tw.x - arm.position.x, dy = tw.y - arm.position.y; arm.rotation.z = Math.atan2(-dx, dy);
}
function stageCam(r) {
  const g = gl, k = r.stage; if (!k) return null;
  return [0, 1.35, F - 5.0];
}
function stageUpdate(r, t) {
  const g = gl, B = g.bu, S_ = g.sh, kind = r.stage;
  g.kit.visible = kind === 'final'; g.rope.visible = false;
  r.px = 0; r.ls = 0; r.inv = 0; r.fly = 0; r.close = 0; r.units = r.units; r.shake = 0; r.sliding = 0; r.faceY = Math.PI;
  B.root.visible = true; B.root.rotation.y = Math.PI; B.mouth.scale.y = 0.55 + Math.abs(Math.sin(t * 9)) * 0.25;
  if (kind === 'cut') {
    const e0 = easeOut(clamp(t / 0.9, 0, 1)), tied = t > 3.0, pull = easeOut((t - 3.0) / 0.5);
    const sx = -0.55 + (t < 3 ? Math.sin(t * 34) * 0.01 : Math.sin(t * 40) * 0.006) + pull * 0.05;
    r.introZ = 0; r.shx = sx; r.py = 0; r.grounded = true; r.ph = t * 14 * 0.0; r.t = t;
    const bx = lerp(2.0, 0.3, e0), by = 0.46 + Math.abs(Math.sin(t * 9)) * (t > 3 ? 0.03 : 0.012);
    B.root.position.set(bx, by, 0.05); B.M.scale.set(-0.098, 0.098, 0.098);
    const foot = new T.Vector3(sx + 0.2, 0.1, -0.02);
    let target; const rest = new T.Vector3(bx - 0.35, 0.6, 0);
    if (t < 0.9) target = rest; else if (t < 1.6) target = rest.clone().lerp(foot, easeOut((t - 0.9) / 0.7)); else if (t < 3.0) { const a = (t - 1.6) * 9; target = foot.clone().add(new T.Vector3(Math.cos(a) * 0.04, 0.02 + Math.sin(a) * 0.02, 0)); } else target = foot.clone().lerp(new T.Vector3(bx - 0.3, 0.55, 0), pull * 0.85);
    reachArm(B.al, target); B.ar.rotation.z = -0.4 + (t > 3 ? Math.sin(t * 12) * 0.3 : Math.sin(t * 4) * 0.1);
    const hp = handPos(B.al, 4.4); B.root.updateMatrixWorld(true);
    if (t >= 0.9) { const hand = handPos(B.al, 4.4); aimRope(hand, foot.clone().add(new T.Vector3(0, 0.0, 0))); g.rope.visible = true; }
    r.shx = sx;
  } else {
    r.introZ = 0; r.grounded = false; r.t = t; r.ph = t * 22; const lift = Math.sin(t * 3) * 0.03, sx = -0.5 + Math.sin(t * 38) * 0.008;
    r.shx = sx; r.py = (0.82 + lift) / HU; B.root.position.set(0.5, 0.46, -0.1); B.M.scale.set(-0.098, 0.098, 0.098);
    const hold = new T.Vector3(sx + 0.15, 1.42 + lift, -0.05); reachArm(B.al, hold); B.ar.rotation.z = -0.4 + Math.sin(t * 12) * 0.3;
    // لهب وفقاعات وبخار
    g.fl.forEach((f, i) => { const k = 0.85 + 0.35 * Math.sin(t * 11 + i * 2); f.scale.set(1, k, 1); f.position.y = 0.1 + 0.2 * k; });
    g.fire.intensity = 1.2 + Math.sin(t * 9) * 0.3; g.soup.material.color.setHex(0xc98a3b);
    g.bub.forEach((b, i) => { const bt = (t * 0.9 + i * 0.37) % 1; b.position.set((i - 3.5) * 0.14, 0.76 + Math.sin(bt * 3.14) * 0.05, ((i * 5) % 3 - 1) * 0.12); });
    g.steam.forEach((s, i) => { const k = (t * 0.45 + i / 9) % 1; s.position.set((i - 4) * 0.12 + Math.sin(t * 2 + i) * 0.06 * k, 0.9 + k * 2.2, 0); s.scale.setScalar(0.35 + k * 0.9); s.material.opacity = 0.28 * (1 - k); });
  }
  S_.root.visible = true; S_.root.scale.setScalar(kind === 'final' ? 1.5 : 1);
}
function stageOverlayVig(c) { const sp = c.createRadialGradient(W * 0.5, H * 0.55, H * 0.15, W * 0.5, H * 0.55, H * 0.7); sp.addColorStop(0, 'rgba(0,0,0,0)'); sp.addColorStop(1, 'rgba(0,0,0,.6)'); c.fillStyle = sp; c.fillRect(0, 0, W, H); }
function drawCut3D(c, t, r) {
  c.setTransform(DPR, 0, 0, DPR, 0, 0); c.clearRect(0, 0, W, H);
  r.stage = 'cut'; r.stageT = t; gl.el.style.display = ''; gl3Render(r);
  c.fillStyle = 'rgba(25,8,10,.22)'; c.fillRect(0, 0, W, H); stageOverlayVig(c);
  const p = toScreen(r.shx, 1.0, 0);
  if (t > 3.2 && t < 5.4) { const by = Math.max(H * 0.2, p[1] - 10); c.save(); c.font = `900 ${Math.max(14, W * 0.042)}px Cairo,sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; const tx = _t('باااع! 😭'), tw = c.measureText(tx).width + 24, bxx = clamp(p[0], tw / 2 + 6, W - tw / 2 - 6); rr(c, bxx - tw / 2, by - 18, tw, 34, 14, '#fff', '#444', 3); c.fillStyle = '#222'; c.fillText(tx, bxx, by - 1); c.restore(); }
  const bar = H * 0.09 * easeOut(t / 0.5); c.fillStyle = '#000'; c.fillRect(0, 0, W, bar); c.fillRect(0, H - bar, W, bar);
  cutText(c, _t('مسكتك!'), H * 0.17, Math.min(W * 0.17, H * 0.1), t, 3.0, '#ffe14d');
  cutText(c, _t('وهعملك كفتة! 🍖'), H * 0.27, Math.min(W * 0.11, H * 0.07), t, 4.0, '#ffffff');
  if (Math.floor(t * 2) % 2 === 0) { c.fillStyle = '#e53935'; c.beginPath(); c.arc(W * 0.07, bar * 0.5, 5, 0, 6.3); c.fill(); }
  if (t > 1) { c.save(); c.globalAlpha = 0.7; c.fillStyle = '#fff'; c.font = `800 ${Math.max(11, W * 0.032)}px Cairo,sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(_t('اضغط للتخطي ⏭'), W / 2, H - bar * 0.5); c.restore(); }
  if (t > CUT_LEN - 0.5) { c.fillStyle = `rgba(0,0,0,${clamp((t - (CUT_LEN - 0.5)) / 0.5, 0, 1)})`; c.fillRect(0, 0, W, H); }
}
function drawFinal3D(c, t, r) {
  c.setTransform(DPR, 0, 0, DPR, 0, 0); c.clearRect(0, 0, W, H);
  r.stage = 'final'; r.stageT = t; gl.el.style.display = ''; gl3Render(r);
  stageOverlayVig(c); drawFinalBoard(c, t, r);
  if (t < 0.4) { c.fillStyle = `rgba(0,0,0,${1 - t / 0.4})`; c.fillRect(0, 0, W, H); }
}
