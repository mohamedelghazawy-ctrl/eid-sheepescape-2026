/* ---------------- المباني ---------------- */
const facadeCache = {}, frontTex = {};
function facadeTexSet(kind, cols) {
  const key = kind + cols; if (facadeCache[key]) return facadeCache[key];
  const TW = 256, TH = 512, vy = h => TH - h / 12 * TH;
  const draw = (emis) => mkCanvas(TW, TH, (c) => {
    c.fillStyle = emis ? '#000' : '#fff'; c.fillRect(0, 0, TW, TH);
    if (!emis) { c.fillStyle = '#8d7b66'; c.fillRect(0, vy(0.5), TW, vy(0) - vy(0.5)); c.fillStyle = 'rgba(0,0,0,.07)'; for (let i = 0; i < 26; i++) c.fillRect(Math.random() * TW, Math.random() * TH, 14 + Math.random() * 30, 3 + Math.random() * 6); }
    for (let row = 0; row < 3; row++) for (let k = 0; k < cols; k++) {
      if (kind === 'shop' && row === 0) continue;
      const h0 = 2.2 + row * 3.1, h1 = h0 + 1.7, a0 = (k + 0.25) / cols, a1 = (k + 0.72) / cols, x0 = a0 * TW, x1 = a1 * TW, y1 = vy(h0), y0 = vy(h1), arch = kind !== 'balcony' && (k + row) % 2 === 0;
      const path = (ins) => { c.beginPath(); if (arch) { const r = (x1 - x0) / 2 - ins, cxm = (x0 + x1) / 2; c.moveTo(x0 + ins, y1 - ins); c.lineTo(x0 + ins, y0 + r + ins); c.arc(cxm, y0 + r + ins, r, Math.PI, 0); c.lineTo(x1 - ins, y1 - ins); c.closePath(); } else { c.rect(x0 + ins, y0 + ins, x1 - x0 - 2 * ins, y1 - y0 - 2 * ins); } };
      if (emis) { path(4); c.fillStyle = k % 2 ? '#ffd56b' : '#ffb347'; c.fill(); }
      else {
        path(-4); c.fillStyle = '#5a3a20'; c.fill(); path(0); c.fillStyle = '#2a1a0c'; c.fill();
        c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(x0, y0 + 4, (x1 - x0) * 0.16, y1 - y0 - 4);
        c.strokeStyle = '#5a3a20'; c.lineWidth = 3; c.beginPath(); c.moveTo((x0 + x1) / 2, y0 + 2); c.lineTo((x0 + x1) / 2, y1); c.moveTo(x0, (y0 + y1) / 2 + 6); c.lineTo(x1, (y0 + y1) / 2 + 6); c.stroke();
        c.fillStyle = '#fff'; c.fillRect(x0 - 6, y1 + 2, x1 - x0 + 12, 5); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x0 - 6, y1 + 7, x1 - x0 + 12, 4);
      }
    }
    if (kind === 'shop') { const x0 = TW * 0.06, x1 = TW * 0.94, ya = vy(2.6), yb = vy(0.5); c.fillStyle = emis ? '#6a4a1c' : '#2a1a0c'; c.fillRect(x0, ya, x1 - x0, yb - ya); if (!emis) { c.strokeStyle = '#4b3320'; c.lineWidth = 2; for (let i = 1; i < 9; i++) { c.beginPath(); c.moveTo(x0 + (x1 - x0) * i / 9, ya); c.lineTo(x0 + (x1 - x0) * i / 9, yb); c.stroke(); } } }
    if (kind === 'balcony' && !emis) { c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(0, vy(5.6), TW, 6); }
  });
  const set = { map: mkTex(draw(false)), em: mkTex(draw(true)) }; return facadeCache[key] = set;
}
function frontTexGet() {
  if (frontTex.t) return frontTex.t;
  const c = mkCanvas(128, 512, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); for (let row = 0; row < 2; row++) { const h0 = 2.3 + row * 3.1, y1 = 512 - h0 / 12 * 512, y0 = 512 - (h0 + 1.5) / 12 * 512; for (const x0 of [w * 0.22, w * 0.56]) { g.fillStyle = '#5a3a20'; g.fillRect(x0 - 3, y0 - 3, w * 0.22 + 6, y1 - y0 + 6); g.fillStyle = '#2a1a0c'; g.fillRect(x0, y0, w * 0.22, y1 - y0); g.fillStyle = '#fff'; g.fillRect(x0 - 5, y1 + 3, w * 0.22 + 10, 4); } } });
  return frontTex.t = mkTex(c);
}
const matCache = {};
function facadeMat(col, kind, cols) { const key = col + '_' + kind + cols; if (matCache[key]) return matCache[key]; const s = facadeTexSet(kind, cols); const m = lam(hexN(BCOL[col]), { map: s.map, emissive: 0xffffff, emissiveMap: s.em, emissiveIntensity: 0 }); m.userData.em = 1; return matCache[key] = m; }
const awnTex = {};
function awnTexGet(i) { if (awnTex[i]) return awnTex[i]; const c = mkCanvas(8, 64, (g, w, h) => { for (let k = 0; k < 8; k++) { g.fillStyle = k % 2 ? '#fff' : AWN[i]; g.fillRect(0, k * 8, w, 8); } }); const t = mkTex(c, true); return awnTex[i] = t; }
const sharedMats = {};
function sm(key, fn) { return sharedMats[key] || (sharedMats[key] = fn()); }

function regroupBox(geo, roadIdx) {   // يعيد ترتيب وجوه الصندوق إلى 3 مجموعات: واجهة الطريق، الواجهة الأمامية، الباقي
  const ia = geo.index.array, ch = []; for (let f = 0; f < 6; f++) ch.push(Array.from(ia.slice(f * 6, f * 6 + 6)));
  const order = [roadIdx, 5].concat([0, 1, 2, 3, 4].filter(i => i !== roadIdx)), out = []; order.forEach(f => out.push(...ch[f]));
  geo.setIndex(out); geo.clearGroups(); geo.addGroup(0, 6, 0); geo.addGroup(6, 6, 1); geo.addGroup(12, 24, 2);
}
function makeBuilding(b, side) {
  const g = new T.Group(), toR = -side, xs = side * (WALLX - b.pb), hW = b.h * HU, cx = xs + side * b.D / 2;
  const geo = new T.BoxGeometry(b.D, hW, b.len), road = side < 0 ? 0 : 1;   // +x للمباني اليسرى، -x لليمنى
  const uv = geo.attributes.uv; for (const f of [road, 5]) for (let i = f * 4; i < f * 4 + 4; i++) uv.setY(i, uv.getY(i) * (b.h / 12));
  regroupBox(geo, road);
  const wall = sm('wall' + b.col, () => lam(hexN(mixH(BCOL[b.col], '#2a1a0c', 0.06))));
  const fm = facadeMat(b.col, b.kind === 'minaret' ? 'plain' : b.kind, b.cols);
  const frm = sm('front' + b.col, () => lam(hexN(mixH(BCOL[b.col], '#2a1a0c', 0.14)), { map: frontTexGet() }));
  const body = new T.Mesh(geo, [fm, frm, wall]); body.position.set(cx, hW / 2, b.len / 2); g.add(body);
  const trim = new T.Group(); g.add(trim);
  const put = (w, h, d, mat, x, y, z) => { const m = box(w, h, d, mat); m.position.set(x, y, z); trim.add(m); return m; };
  put(0.34, 0.55 * HU, b.len + 0.1, sm('cornice', () => lam(0x8a5d36)), xs + toR * 0.17, (b.h - 0.28) * HU, b.len / 2);
  put(0.1, 0.5 * HU, b.len + 0.05, sm('plinth', () => lam(0x5d3d22)), xs + toR * 0.05, 0.25 * HU, b.len / 2);
  if (b.kind === 'shop') {
    const aw = 0.6, L = Math.hypot(aw, 0.8 * HU), ang = Math.atan2(-0.8 * HU, toR * aw);
    const tex = awnTexGet(b.awn).clone(); tex.needsUpdate = true; tex.repeat.set(1, Math.max(2, Math.round((b.len - 1) / 0.9) / 8));
    const m = new T.Mesh(new T.BoxGeometry(L, 0.05, b.len - 1), lam(0xffffff, { map: tex })); m.position.set(xs + toR * aw / 2, 3.4 * HU, b.len / 2); m.rotation.z = ang; g.add(m);
    put(0.04, 0.22 * HU, b.len - 1, sm('awnL', () => lam(0xf4ead2)), xs + toR * aw, 2.9 * HU, b.len / 2);
  }
  if (b.kind === 'balcony') {
    for (let k = 0; k < b.cols; k += 2) {
      const a0 = (k + 0.25) / b.cols, a1 = (k + 0.72) / b.cols, zc = b.len * (a0 + a1) / 2, zl = b.len * (a1 - a0) + 0.5, bt = 5.2 * HU;
      put(0.7, 0.16, zl, sm('bslab', () => lam(0x6b4a2a)), xs + toR * 0.35, bt, zc);
      put(0.05, 0.5 * HU * 1.6, zl, sm('brail', () => lam(0x3a2412)), xs + toR * 0.68, bt + 0.34 * HU * 1.2, zc);
      put(0.05, 0.5, 0.05, sm('brail', () => lam(0x3a2412)), xs + toR * 0.68, bt + 0.25, zc - zl / 2 + 0.03);
      put(0.05, 0.5, 0.05, sm('brail', () => lam(0x3a2412)), xs + toR * 0.68, bt + 0.25, zc + zl / 2 - 0.03);
    }
  }
  if (b.kind === 'minaret') {
    const zm0 = b.len * 0.42, zm1 = b.len * 0.58, zc = (zm0 + zm1) / 2, mh = 4.5 * HU, tw = 1.5;
    put(tw, mh, zm1 - zm0, sm('mint', () => lam(0xe9d3a8)), xs + side * tw / 2, hW + mh / 2, zc);
    put(tw + 0.3, 0.12, zm1 - zm0 + 0.3, sm('minr', () => lam(0x2e9c8f)), xs + side * tw / 2, hW + mh - 0.55, zc);
    const cone = new T.Mesh(new T.ConeGeometry((zm1 - zm0) * 0.78, 1.7 * HU * 1.8, 4), sm('minc', () => lam(0x2e9c8f))); cone.rotation.y = Math.PI / 4; cone.position.set(xs + side * tw / 2, hW + mh + 0.8, zc); trim.add(cone);
  }
  bakeGroup(trim);
  return g;
}
function syncBuildings(r) {
  const g = gl, seen = new Set();
  for (const [side, L] of [[-1, r.bl], [1, r.br]]) for (const b of L) {
    if (b.z > ZMAX + 30 || b.z + b.len < -9) continue;
    let o = g.bd.get(b); if (!o) { o = makeBuilding(b, side); g.bd.set(b, o); g.scene.add(o); }
    o.position.z = b.z; seen.add(b);
  }
  for (const [b, o] of g.bd) if (!seen.has(b)) { g.scene.remove(o); o.traverse(m => { if (m.isMesh && m.geometry) m.geometry.dispose(); }); g.bd.delete(b); }
  const I = g.emI || 0; for (const k in matCache) matCache[k].emissiveIntensity = I;
}

/* ---------------- الزينة المعلّقة: حبل مستمر على الجانبين مع أعمدة ---------------- */
function buildGarlands() {
  const g = gl, P_ = 30, STEP = 1.5, n = Math.round(P_ / STEP), pos = [], col = [], rope = [];
  const hR = k => (6.4 - 0.9 * Math.sin(Math.PI * k / n)) * HU;
  for (let k = 0; k <= n; k++) rope.push(new T.Vector3(0, hR(k), k * STEP));
  const tube = new T.TubeGeometry(new T.CatmullRomCurve3(rope), 40, 0.022, 5, false), pole = new T.CylinderGeometry(0.045, 0.06, 6.4 * HU, 6); pole.translate(0, 3.2 * HU, 0);
  const trimG = mergeGeos([{ geo: tube, rgb: [0.29, 0.2, 0.13] }, { geo: pole, rgb: [0.42, 0.29, 0.17] }]);
  for (let k = 0; k < n; k++) { const z = (k + 0.5) * STEP, y = hR(k + 0.5), hw = 0.2, hh = 0.42, c = new T.Color(hexN(FLAGS[k % 6])); pos.push(0, y, z - hw, 0, y, z + hw, 0, y - hh, z); for (let i = 0; i < 3; i++) col.push(c.r, c.g, c.b); }
  const fg = new T.BufferGeometry(); fg.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); fg.setAttribute('color', new T.Float32BufferAttribute(col, 3));
  const fm = new T.MeshBasicMaterial({ vertexColors: true, side: T.DoubleSide });
  g.gar = [];
  for (const sd of [-1, 1]) for (let i = 0; i < 5; i++) {
    const grp = new T.Group(); grp.add(new T.Mesh(trimG, VCM()), new T.Mesh(fg, fm));
    grp.position.x = sd * (ROAD + 0.1); g.scene.add(grp); g.gar.push(grp);
  }
}
function syncGarlands(r) {
  const P_ = 30, m = ((r.units % P_) + P_) % P_; let i = 0;
  for (const grp of gl.gar) { grp.position.z = (i % 5) * P_ - P_ - m; i++; }
}
