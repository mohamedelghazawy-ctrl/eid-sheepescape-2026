/* ---------------- العقبات (مجسّمات) ---------------- */
let shadowGeo = null, shadowMat = null;
function shadowBlob(r, a) { if (!shadowGeo) { shadowGeo = new T.PlaneGeometry(1, 1); shadowGeo.rotateX(-Math.PI / 2); shadowMat = new T.MeshBasicMaterial({ map: mkTex(mkCanvas(64, 64, (c) => { const gr = c.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 64); })), transparent: true, depthWrite: false, fog: true }); }
  const m = new T.Mesh(shadowGeo, shadowMat.clone()); m.material.opacity = a == null ? 1 : a; m.scale.set(r * 2, 1, r * 2 * 0.8); m.position.y = 0.025; m.renderOrder = 1; return m;
}
const TEX = {};
function texOnce(k, fn) { return TEX[k] || (TEX[k] = fn()); }
const woodTex = () => texOnce('wood', () => mkTex(mkCanvas(128, 128, (c, w, h) => {
  c.fillStyle = '#c98f4e'; c.fillRect(0, 0, w, h); c.strokeStyle = '#7a4a1f'; c.lineWidth = 3; for (const y of [h * 0.33, h * 0.66]) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
  c.beginPath(); c.moveTo(0, 0); c.lineTo(w, h); c.moveTo(w, 0); c.lineTo(0, h); c.stroke(); c.strokeStyle = '#6b3f17'; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8);
  c.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 30; i++) c.fillRect(Math.random() * w, Math.random() * h, 10 + Math.random() * 20, 2);
})));
const hazardTex = () => texOnce('hz', () => mkTex(mkCanvas(128, 16, (c, w, h) => { c.fillStyle = '#f1c40f'; c.fillRect(0, 0, w, h); c.fillStyle = '#222'; for (let i = -1; i < 9; i++) { c.beginPath(); c.moveTo(i * 16 + 8, h); c.lineTo(i * 16 + 16, h); c.lineTo(i * 16 + 24, 0); c.lineTo(i * 16 + 16, 0); c.closePath(); c.fill(); } })));
const clothTex = (ci) => texOnce('cl' + ci, () => { const cl = CLOTH[ci]; return mkTex(mkCanvas(128, 112, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = cl[0]; c.beginPath(); c.moveTo(0, 0); c.lineTo(w, 0); c.lineTo(w, h * 0.92); for (let i = 5; i >= 0; i--) c.lineTo(w * i / 5, h * (i % 2 ? 0.99 : 0.9)); c.closePath(); c.fill(); c.fillStyle = cl[1]; for (let i = 0; i < 3; i++) c.fillRect(w * (0.05 + i * 0.34), h * 0.07, w * 0.15, h * 0.4); })); });
const awnBannerTex = (ci) => texOnce('ab' + ci, () => mkTex(mkCanvas(128, 112, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = AWN[ci]; for (let i = 0; i < 6; i += 2) c.fillRect(w * i / 6, 0, w / 6, h); })));
const hazardBar = () => { const m = new T.Mesh(new T.BoxGeometry(1.45, 0.14, 0.08), lam(0xffffff, { map: hazardTex() })); return m; };
function wheel(r, th, mat) { const w = cyl(r, r, th, mat, 14); w.rotation.z = Math.PI / 2; return w; }

function buildObsModel(type, c) {
  const g = new T.Group();
  switch (type) {
    case 'crate': { const m = new T.Mesh(new T.BoxGeometry(1.67, 1.15, 1.5), lam(0xffffff, { map: woodTex() })); m.position.y = 0.575; g.add(m); g.userData.sh = 0.95; break; }
    case 'barrel': {
      const pts = [[0.02, 0], [0.38, 0], [0.43, 0.1], [0.47, 0.45], [0.43, 0.88], [0.38, 0.95], [0.02, 0.95]].map(p => new T.Vector2(p[0] * 1.35, p[1] * 1.35));
      const m = new T.Mesh(new T.LatheGeometry(pts, 16), lam(0x8d5524)); g.add(m);
      for (const y of [0.3, 0.72]) { const t = new T.Mesh(new T.TorusGeometry(0.455 * 1.35 - (y > 0.5 ? 0.02 : 0), 0.03, 6, 20), lam(0x4a4a52)); t.rotation.x = Math.PI / 2; t.position.y = y * 1.35; g.add(t); }
      const top = new T.Mesh(new T.CircleGeometry(0.4 * 1.35, 16), lam(0xa9703a)); top.rotation.x = -Math.PI / 2; top.position.y = 0.951 * 1.35; g.add(top); g.userData.sh = 0.8; break;
    }
    case 'tuktuk': {
      const col = c % 2 ? 0x2ecc71 : 0xf5c518, dk = lam(0x222222), body = lam(col);
      for (const x of [-0.66, 0.66]) { const w = wheel(0.27, 0.2, dk); w.position.set(x, 0.27, -0.5); g.add(w); }
      const fw = wheel(0.27, 0.18, dk); fw.position.set(0, 0.27, 0.9); g.add(fw);
      const low = box(1.44, 0.7, 2.1, body); low.position.set(0, 0.6, 0.15); g.add(low);
      const nose = box(0.9, 0.55, 0.5, body); nose.position.set(0, 0.6, 1.3); g.add(nose);
      const gm = lam(0x9fd3ff, { transparent: true, opacity: 0.2, depthWrite: false }), pm = lam(0x2d3436);
      for (const x of [-0.62, 0.62]) for (const z of [-0.8, 0.7]) { const pl = box(0.07, 1.35, 0.07, pm); pl.position.set(x, 1.67, z); g.add(pl); }
      const gl_ = box(1.3, 1.3, 1.5, gm); gl_.position.set(0, 1.67, -0.05); gl_.userData.noBake = true; g.add(gl_);
      const seat = box(1.1, 0.25, 0.5, lam(0x1e2a38)); seat.position.set(0, 1.08, -0.5); g.add(seat);
      const roof = box(1.7, 0.1, 2.0, lam(0x2d3436, { transparent: true, opacity: 0.55, depthWrite: false })); roof.position.set(0, 2.38, 0); roof.userData.noBake = true; g.add(roof);
      for (const x of [-0.55, 0.55]) {
        const tl = box(0.3, 0.2, 0.08, bas(0xff1208)); tl.position.set(x, 0.72, -0.94); g.add(tl);
        const core = box(0.16, 0.1, 0.09, bas(0xffd0c0)); core.position.set(x, 0.72, -0.96); g.add(core);
        const gs = glowSprite('clover', 1); gs.material = gs.material.clone(); gs.material.color.set(0xff2a14); gs.material.opacity = 0.95; gs.material.fog = false; gs.scale.setScalar(0.85); gs.position.set(x, 0.72, -1.0); g.add(gs);
      }
      g.userData.sh = 1.0; break;
    }
    case 'cart': {
      const dk = lam(0x222222);
      for (const x of [-0.8, 0.8]) { const w = wheel(0.3, 0.12, dk); w.position.set(x, 0.3, 0); g.add(w); const hub = wheel(0.1, 0.14, lam(0x888888)); hub.position.set(x, 0.3, 0); g.add(hub); }
      const b = box(1.44, 0.7, 1.6, lam(0x2a7fb8)); b.position.set(0, 0.7, 0); g.add(b);
      const load = new T.Mesh(new T.SphereGeometry(0.58, 14, 8, 0, 6.3, 0, 1.57), lam(0xc77d35)); load.scale.set(1, 0.7, 1.15); load.position.y = 1.05; g.add(load);
      const lx = ellip(0.16, 0.08, 0.16, lam(0xf0b060)); lx.position.set(-0.2, 1.4, 0.1); g.add(lx);
      const pole = cyl(0.03, 0.03, 0.85, lam(0x5d3d22), 6); pole.position.set(0.6, 1.45, -0.6); g.add(pole);
      const fl = new T.Mesh(new T.BufferGeometry(), new T.MeshBasicMaterial({ color: 0xe74c3c, side: T.DoubleSide })); fl.geometry.setAttribute('position', new T.Float32BufferAttribute([0.6, 1.85, -0.6, 0.6, 1.55, -0.6, 0.6, 1.7, -0.6 + 0.0 - 0.45], 3)); g.add(fl);
      g.userData.sh = 1.0; break;
    }
    case 'laundry': case 'awning': {
      const pm = lam(0x6b4a2b);
      for (const x of [-0.65, 0.65]) { const p = box(0.1, 2.4, 0.1, pm); p.position.set(x, 1.2, 0); g.add(p); }
      const bar = box(1.4, 0.07, 0.08, pm); bar.position.set(0, 2.35, 0); g.add(bar);
      if (type === 'laundry') { const cl = new T.Mesh(new T.PlaneGeometry(1.3, 1.14), lam(0xffffff, { map: clothTex(c), side: T.DoubleSide, alphaTest: 0.5 })); cl.position.set(0, 1.78, 0); cl.name = 'cloth'; g.add(cl); }
      else { const cl = new T.Mesh(new T.PlaneGeometry(1.5, 1.12), lam(0xffffff, { map: awnBannerTex(c), side: T.DoubleSide })); cl.position.set(0, 1.76, 0); cl.name = 'cloth'; g.add(cl); const rf = box(1.7, 0.07, 0.6, lam(hexN(AWN[c]))); rf.position.set(0, 2.38, 0); rf.rotation.x = 0.2; g.add(rf); }
      const hb = hazardBar(); hb.position.set(0, 1.2, 0); g.add(hb); g.userData.sh = 0.8; break;
    }
    case 'cat': case 'dog': {
      const dog = type === 'dog', col = dog ? ['#9c6b3c', '#6e4520', '#e0bd88'] : (c % 2 ? ['#e08a2e', '#a85a14', '#f7d09a'] : ['#8b8f98', '#565a62', '#d3d6dc']);
      const m0 = lam(hexN(col[0])), m1 = lam(hexN(col[1])), m2 = lam(hexN(col[2])), blk = lam(0x111111);
      const body = ellip(0.6, 0.29, 0.3, m0); body.position.y = 0.62; g.add(body);
      const belly = ellip(0.4, 0.14, 0.27, m2); belly.position.set(0.04, 0.5, 0); g.add(belly);
      const head = ellip(0.25, 0.23, 0.23, m0); head.position.set(0.66, 0.84, 0); g.add(head);
      for (const z of [-0.1, 0.1]) { const e = ellip(0.045, 0.045, 0.03, blk, 8); e.position.set(0.82, 0.88, z * 1.1); g.add(e); }
      if (dog) {
        const sn = ellip(0.17, 0.12, 0.13, m2); sn.position.set(0.88, 0.78, 0); g.add(sn); const ns = ellip(0.05, 0.04, 0.05, blk, 8); ns.position.set(1.03, 0.82, 0); g.add(ns);
        for (const z of [-0.2, 0.2]) { const ear = ellip(0.09, 0.2, 0.06, m1); ear.position.set(0.55, 0.8, z); ear.rotation.z = 0.3; g.add(ear); }
        const tg = new T.Group(); tg.name = 'tail'; tg.position.set(-0.58, 0.68, 0); const tl = cyl(0.04, 0.06, 0.45, m0, 6); tl.position.y = 0.2; tl.rotation.z = 0; tg.add(tl); tg.rotation.z = 0.7; g.add(tg);
      } else {
        for (const z of [-0.12, 0.12]) { const ear = new T.Mesh(new T.ConeGeometry(0.08, 0.2, 4), m0); ear.position.set(0.6, 1.06, z); g.add(ear); }
        const ns = ellip(0.04, 0.03, 0.04, lam(0xf08a9a), 8); ns.position.set(0.9, 0.82, 0); g.add(ns);
        const tg = new T.Group(); tg.name = 'tail'; tg.position.set(-0.58, 0.66, 0); const tl = cyl(0.035, 0.05, 0.62, m0, 6); tl.position.y = 0.28; tg.add(tl); tg.rotation.z = 0.35; g.add(tg);
      }
      [['legFL', 0.4, 0.13], ['legFR', 0.4, -0.13], ['legBL', -0.4, 0.13], ['legBR', -0.4, -0.13]].forEach(([n, x, z]) => { const lg = new T.Group(); lg.name = n; lg.position.set(x, 0.5, z); const l = cyl(0.055, 0.045, 0.5, m1, 6); l.position.y = -0.25; lg.add(l); g.add(lg); });
      g.userData.pet = dog ? 1 : 0.8; g.userData.sh = 0.7; break;
    }
  }
  g.traverse(o => { if (o.name === 'tail' || /^leg/.test(o.name) || o.name === 'cloth') o.userData.noBake = true; });
  bakeGroup(g);
  return g;
}
const obsTpl = {};
function obsEntry(o) {
  const v = (o.type === 'tuktuk' ? o.c % 2 : (o.type === 'laundry' || o.type === 'awning') ? o.c : (o.type === 'cat' ? o.c % 2 : 0)), key = o.type + v;
  if (!obsTpl[key]) obsTpl[key] = buildObsModel(o.type, o.c);
  const m = obsTpl[key].clone(true), root = new T.Group(); m.scale.setScalar(HU); root.add(m);
  const pet = obsTpl[key].userData.pet; if (pet) m.scale.setScalar(HU * pet);
  const sh = shadowBlob((obsTpl[key].userData.sh || 0.8) * HU, 0.9); root.add(sh);
  gl.scene.add(root); return { root, m, pet: !!pet };
}
function syncObstacles(r) {
  const g = gl, t = r.t, seen = new Set();
  for (const o of r.obs) {
    if (o.z > ZMAX + 6 || o.z < -9) continue; seen.add(o);
    let e = g.ob.get(o); if (!e) { e = obsEntry(o); g.ob.set(o, e); }
    e.root.position.set(o.x, 0, o.z);
    if (e.pet) {
      e.m.rotation.y = o.dir > 0 ? 0 : Math.PI; const T_ = t * 15 + o.c, S_ = (a) => Math.sin(T_ + a) * 0.7;
      const set = (n, a) => { const l = e.m.getObjectByName(n); if (l) l.rotation.z = a; };
      const dsgn = 1; set('legFL', S_(0) * dsgn); set('legBR', S_(0) * dsgn); set('legFR', S_(Math.PI) * dsgn); set('legBL', S_(Math.PI) * dsgn);
      const tl = e.m.getObjectByName('tail'); if (tl) tl.rotation.x = Math.sin(T_ * 0.7) * 0.5;
      e.m.position.y = Math.abs(Math.sin(T_)) * 0.04;
    } else if (o.type === 'laundry' || o.type === 'awning') { const cl = e.m.getObjectByName('cloth'); if (cl) cl.rotation.z = Math.sin(t * 2.3 + o.c) * 0.04; }
  }
  for (const [o, e] of g.ob) if (!seen.has(o)) { g.scene.remove(e.root); g.ob.delete(o); }
}

/* ---------------- المقتنيات ---------------- */
const GLOW = { clover: 0x7cfc00, corn: 0xffd63c, shield: 0x7fd4ff, pepper: 0xff4628, x2: 0xffd63c };
let glowTexS = null;
function glowSprite(k, size) { if (!glowTexS) glowTexS = mkTex(mkCanvas(64, 64, (c) => { const gr = c.createRadialGradient(32, 32, 1, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 64); }));
  const s = new T.Sprite(new T.SpriteMaterial({ map: glowTexS, color: GLOW[k], blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55, fog: true })); s.scale.setScalar(size * 0.7); return s; }
const pkTpl = {};
function buildPick(k) {
  const g = new T.Group();
  if (k === 'clover') {
    const pm = lam(0x22b14c, { emissive: 0x0c5a24 }), dm = lam(0x0d6b2a);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4, x = Math.cos(a) * 0.17, y = Math.sin(a) * 0.17; const o = ellip(0.19, 0.19, 0.06, dm, 10); o.position.set(x, y, 0.03); g.add(o); const p = ellip(0.165, 0.165, 0.07, pm, 10); p.position.set(x, y, -0.005); g.add(p); }
    const c = ellip(0.085, 0.085, 0.07, lam(0x7cfc00, { emissive: 0x3a7a00 }), 8); c.position.z = -0.03; g.add(c);
    bakeGroup(g);
  } else if (k === 'corn') {
    const kt = mkTex(mkCanvas(32, 64, (c, w, h) => { c.fillStyle = '#ffd43b'; c.fillRect(0, 0, w, h); c.fillStyle = '#e0a800'; for (let i = 0; i < 4; i++) for (let j = 0; j < 8; j++) c.fillRect(i * 8 + 1, j * 8 + 1, 6, 6); }));
    const cob = new T.Mesh(new T.SphereGeometry(1, 12, 10), lam(0xffffff, { map: kt, emissive: 0x6a4a00 })); cob.scale.set(0.17, 0.36, 0.17); g.add(cob);
    for (const sd of [-1, 1]) { const lf = ellip(0.09, 0.34, 0.04, lam(0x4caf50), 8); lf.position.set(sd * 0.13, -0.08, -0.02); lf.rotation.z = -sd * 0.25; g.add(lf); }
    bakeGroup(g); g.rotation.z = -0.3; const hold = new T.Group(); hold.add(g); hold.add(glowSprite(k, 2.6)); hold.scale.setScalar(2); return hold;
  } else if (k === 'pepper') {
    const rm = lam(0xd62318, { emissive: 0x5a0a05 }); const P_ = [[-0.12, 0.18, 0.15], [0, 0.12, 0.17], [0.08, 0.02, 0.17], [0.12, -0.1, 0.15], [0.1, -0.22, 0.11], [0.05, -0.32, 0.07], [-0.02, -0.4, 0.035]];
    P_.forEach(p => { const s = ellip(p[2], p[2], p[2], rm, 10); s.position.set(p[0], p[1], 0); g.add(s); });
    const hl = ellip(0.04, 0.1, 0.03, bas(0xffb0a8), 6); hl.position.set(0.05, 0.1, -0.15); hl.rotation.z = 0.5; g.add(hl);
    const cap = ellip(0.15, 0.07, 0.15, lam(0x2e9b3c), 8); cap.position.set(-0.14, 0.3, 0); g.add(cap); const st = cyl(0.025, 0.035, 0.22, lam(0x2e9b3c), 6); st.position.set(-0.2, 0.42, 0); st.rotation.z = 0.5; g.add(st);
    bakeGroup(g); g.rotation.z = -0.5; const hold = new T.Group(); hold.add(g); hold.add(glowSprite(k, 2.6)); hold.scale.setScalar(2); return hold;
  } else if (k === 'shield') {
    const rings = [[0.3, 0xd4a017, 0.1], [0.25, 0x1565c0, 0.13], [0.15, 0xffffff, 0.16], [0.09, 0x42a5f5, 0.19], [0.04, 0x000000, 0.22]];
    rings.forEach(r_ => { const d = cyl(r_[0], r_[0], 0.05, lam(r_[1], { emissive: r_[1] === 0xffffff ? 0x666666 : 0x111111 }), 20); d.rotation.x = Math.PI / 2; d.position.z = -(r_[2] - 0.1); g.add(d); });
    bakeGroup(g); const hold = new T.Group(); hold.add(g); hold.add(glowSprite(k, 2.6)); hold.scale.setScalar(2); return hold;
  } else {
    const sh = new T.Shape(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r_ = i % 2 ? 0.15 : 0.34, x = Math.cos(a) * r_, y = -Math.sin(a) * r_; i ? sh.lineTo(x, y) : sh.moveTo(x, y); } sh.closePath();
    const st = new T.Mesh(new T.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025, bevelSegments: 1 }), lam(0xffd43b, { emissive: 0x7a5a00 })); st.position.z = -0.05; g.add(st);
    const tx = new T.Mesh(new T.PlaneGeometry(0.34, 0.2), new T.MeshBasicMaterial({ map: mkTex(mkCanvas(128, 64, (c, w, h) => { c.fillStyle = '#7a4a00'; c.font = '900 52px Cairo,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('×2', w / 2, h / 2 + 2); })), transparent: true, side: T.DoubleSide })); tx.position.set(0, 0.0, -0.1); g.add(tx); bakeGroup(g);
    const hold = new T.Group(); hold.add(g); hold.add(glowSprite(k, 2.6)); hold.scale.setScalar(2); return hold;
  }
  return g;
}
function syncPickups(r) {
  const g = gl, t = r.t, seen = new Set();
  for (const p of r.pk) {
    if (p.z > ZMAX + 6 || p.z < -9 || p.taken) continue; seen.add(p);
    let e = g.pk.get(p); if (!e) { if (!pkTpl[p.k]) pkTpl[p.k] = buildPick(p.k); const m = pkTpl[p.k].clone(true), root = new T.Group(); root.add(m); root.scale.setScalar(HU); gl.scene.add(root); e = { root, m }; g.pk.set(p, e); }
    const extra = p.k === 'clover' ? 0 : 0.3;
    e.root.position.set(p.x, (p.h + 0.08 * Math.sin(t * 5 + p.ph) + extra) * HU, p.z);
    e.m.rotation.y = Math.sin(t * 3 + p.ph) * (p.k === 'clover' ? 0.7 : 0.9);
  }
  for (const [p, e] of g.pk) if (!seen.has(p)) { g.scene.remove(e.root); g.pk.delete(p); }
}
