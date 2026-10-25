/* ---------------- الخروف (مجسّم) ---------------- */
function buildSheep() {
  const g = gl, root = new T.Group(), inner = new T.Group(), pose = new T.Group(); inner.scale.setScalar(HU * 0.75); root.add(inner); inner.add(pose); g.scene.add(root);
  const wool = lam(0xffffff, { emissive: 0x2a3140 }), woolS = lam(0xe3e8f1, { emissive: 0x20283a }), skin = lam(0xf9dccd, { emissive: 0x2a1a14 }), pink = lam(0xf2b8a8), leg = lam(0xcfd3dc), hoof = lam(0x8f8e98), blk = lam(0x1a1a1a);
  const S = g.sh = { root, inner, pose, slide: 0, legs: {} };
  const bodyG = new T.Group(); pose.add(bodyG); S.body = bodyG;
  const core = ellip(0.5, 0.4, 0.68, wool, 16); core.position.y = 0.92; bodyG.add(core);
  for (let i = 0; i < 14; i++) { const th = i / 14 * 6.2832, y = 0.92 + ((i % 3) - 1) * 0.16, s = ellip(0.27 + 0.03 * (i % 2), 0.27, 0.27, y < 0.7 ? woolS : wool, 10); s.position.set(Math.cos(th) * 0.5, y, Math.sin(th) * 0.64); bodyG.add(s); }
  for (const [x, z] of [[-0.28, -0.35], [0.28, -0.35], [0, 0], [-0.25, 0.3], [0.25, 0.3], [0, -0.6], [0, 0.55]]) { const s = ellip(0.26, 0.25, 0.26, wool, 10); s.position.set(x, 1.26, z); bodyG.add(s); }
  for (const x of [-0.2, 0, 0.2]) { const s = ellip(0.27, 0.27, 0.27, wool, 10); s.position.set(x, 1.08, -0.66); bodyG.add(s); }
  // الأرجل
  [['FL', -0.2, 0.42, 0.08], ['FR', 0.2, 0.42, 0.08], ['BL', -0.27, -0.4, 0.1], ['BR', 0.27, -0.4, 0.1]].forEach(([n, x, z, r]) => { const lg = new T.Group(); lg.position.set(x, 0.66, z); const l = cyl(r, r * 0.85, 0.6, leg, 8); l.position.y = -0.33; const h = box(r * 2.3, 0.11, r * 3, hoof); h.position.set(0, -0.62, r * 0.4); lg.add(l, h); pose.add(lg); S.legs[n] = lg; });
  // الذيل
  const tail = new T.Group(); tail.position.set(0, 0.8, -0.8); bodyG.add(tail); S.tail = tail;
  for (const [x, y, z, r] of [[-0.11, 0, 0, 0.17], [0.11, 0, 0, 0.17], [0, 0.08, -0.05, 0.15], [0, -0.1, 0.02, 0.14]]) { const s = ellip(r, r, r, wool, 10); s.position.set(x, y, z); tail.add(s); }
  // الرأس
  const head = new T.Group(); head.position.set(0, 1.5, 0.64); pose.add(head); S.head = head;
  const hs = ellip(0.27, 0.27, 0.26, skin, 16); head.add(hs);
  for (const sd of [-1, 1]) { const e = ellip(0.17, 0.075, 0.05, pink, 8); e.position.set(sd * 0.3, 0.02, 0); e.rotation.z = sd * 0.5; e.name = 'ear'; e.userData.sd = sd; head.add(e); S['ear' + sd] = e; }
  for (const [x, y, r] of [[-0.16, 0.2, 0.13], [0, 0.26, 0.14], [0.16, 0.2, 0.13]]) { const s = ellip(r, r, r, wool, 10); s.position.set(x, y, -0.02); head.add(s); }
  for (const sd of [-1, 1]) { const w = ellip(0.088, 0.088, 0.05, lam(0xffffff), 10); w.position.set(sd * 0.11, 0.03, 0.235); head.add(w); const p = ellip(0.045, 0.045, 0.03, blk, 8); p.position.set(sd * 0.11, 0.025, 0.27); head.add(p); S['pup' + sd] = p; const br = box(0.16, 0.025, 0.02, lam(0x6b4a3a)); br.position.set(sd * 0.115, 0.15, 0.24); br.rotation.z = -sd * 0.18; head.add(br); }
  const nose = ellip(0.06, 0.04, 0.04, lam(0xf08a9a), 8); nose.position.set(0, -0.07, 0.26); head.add(nose);
  const mouth = ellip(0.06, 0.045, 0.03, lam(0x7a2a2a), 8); mouth.position.set(0, -0.16, 0.225); head.add(mouth); S.mouth = mouth;
  // الإكسسوارات
  const acc = S.acc = {};
  const fez = new T.Group(); { const f = cyl(0.13, 0.18, 0.3, lam(0xc0392b), 14); f.position.y = 0.4; const tp = ellip(0.13, 0.03, 0.13, lam(0x962d22), 10); tp.position.y = 0.55; const ts = cyl(0.015, 0.015, 0.24, blk, 5); ts.position.set(0.14, 0.45, 0); ts.rotation.z = -0.5; const tb = ellip(0.035, 0.05, 0.035, blk, 6); tb.position.set(0.2, 0.32, 0); fez.add(f, tp, ts, tb); } acc.fez = fez;
  const turban = new T.Group(); { const t = ellip(0.28, 0.16, 0.28, lam(0xf5f5f0), 14); t.position.y = 0.3; const t2 = ellip(0.22, 0.12, 0.22, lam(0xe8e8e0), 12); t2.position.y = 0.4; const gem = ellip(0.04, 0.04, 0.03, lam(0xe74c3c), 8); gem.position.set(0, 0.32, 0.27); turban.add(t, t2, gem); } acc.turban = turban;
  const cap = new T.Group(); { const c = new T.Mesh(new T.SphereGeometry(0.23, 14, 8, 0, 6.3, 0, 1.57), lam(0x1e88e5)); c.position.y = 0.2; const v = box(0.32, 0.04, 0.22, lam(0x0d47a1)); v.position.set(0, 0.22, 0.26); cap.add(c, v); } acc.cap = cap;
  const crown = new T.Group(); { const b0 = cyl(0.2, 0.22, 0.14, lam(0xf1c40f, { emissive: 0x5a4400 }), 12); b0.position.y = 0.32; crown.add(b0); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28, sp = new T.Mesh(new T.ConeGeometry(0.06, 0.22, 4), lam(0xf1c40f, { emissive: 0x5a4400 })); sp.position.set(Math.cos(a) * 0.18, 0.5, Math.sin(a) * 0.18); crown.add(sp); const gm = ellip(0.025, 0.025, 0.025, lam(0xe53935), 6); gm.position.set(Math.cos(a) * 0.205, 0.33, Math.sin(a) * 0.205); crown.add(gm); } } acc.crown = crown;
  const shades = new T.Group(); { const gm = lam(0xe0a030, { transparent: true, opacity: 0.72, emissive: 0x4a2a00 }), rm = lam(0x6b4210); for (const sd of [-1, 1]) { const l = ellip(0.1, 0.09, 0.03, gm, 12); l.position.set(sd * 0.115, 0.03, 0.27); const rg = new T.Mesh(new T.TorusGeometry(0.098, 0.014, 6, 16), rm); rg.scale.set(1, 0.9, 1); rg.position.copy(l.position); const ar = box(0.03, 0.02, 0.28, rm); ar.position.set(sd * 0.225, 0.05, 0.14); shades.add(l, rg, ar); } const br = box(0.06, 0.02, 0.02, rm); br.position.set(0, 0.05, 0.28); shades.add(br); } acc.shades = shades;
  const bow = new T.Group(); { const bm = lam(0xe91e63, { emissive: 0x3a0818 }); for (const sd of [-1, 1]) { const c = new T.Mesh(new T.ConeGeometry(0.1, 0.18, 4), bm); c.rotation.z = sd * Math.PI / 2; c.position.set(sd * 0.1, -0.3, 0.14); bow.add(c); } const kn = ellip(0.05, 0.05, 0.05, lam(0xad1457), 8); kn.position.set(0, -0.3, 0.14); bow.add(kn); } acc.bow = bow;
  for (const k of ['fez', 'turban', 'cap', 'crown', 'shades', 'bow']) { acc[k].visible = false; head.add(acc[k]); }
  const cape = new T.Group(); { const cm = new T.Mesh(new T.PlaneGeometry(0.95, 0.9), lam(0xe74c3c, { side: T.DoubleSide, emissive: 0x3a0a08 })); cm.position.y = -0.4; cape.add(cm); const ed = box(0.97, 0.04, 0.02, lam(0xf1c40f)); ed.position.y = -0.86; cape.add(ed); const cc = box(0.5, 0.05, 0.03, lam(0xf1c40f)); cc.position.y = 0; cape.add(cc); } cape.position.set(0, 1.35, -0.86); cape.visible = false; pose.add(cape); acc.cape = cape;
  // درع (فقاعة) + حلقات المغناطيس
  S.bub = new T.Mesh(new T.SphereGeometry(1, 20, 14), new T.MeshBasicMaterial({ color: 0x78c8ff, transparent: true, opacity: 0.2, depthWrite: false })); S.bub.scale.set(1.0, 1.2, 1.18); S.bub.position.y = 0.85; S.bub.visible = false; inner.add(S.bub);
  S.bub2 = new T.Mesh(new T.SphereGeometry(1, 20, 14), new T.MeshBasicMaterial({ color: 0xaaebff, transparent: true, opacity: 0.45, depthWrite: false, side: T.BackSide })); S.bub2.scale.set(1.04, 1.24, 1.22); S.bub2.position.y = 0.85; S.bub2.visible = false; inner.add(S.bub2);
  S.rings = new T.Group(); for (let i = 0; i < 3; i++) { const t = new T.Mesh(new T.TorusGeometry(0.9, 0.025, 6, 20, 1.0), bas(0xff7878, { transparent: true, opacity: 0.7 })); t.rotation.x = Math.PI / 2; t.position.y = 0.55 + i * 0.3; t.rotation.z = i * 2.1; S.rings.add(t); } S.rings.visible = false; inner.add(S.rings);
  // دمج الأجزاء الثابتة لتقليل الاستدعاءات
  tail.userData.noBake = true; bakeGroup(tail); delete tail.userData.noBake; tail.userData.noBake = true;
  for (const k of ['fez', 'turban', 'cap', 'crown', 'shades', 'bow']) { bakeGroup(acc[k]); acc[k].userData.noBake = true; }
  acc.cape.userData.noBake = true; S['ear-1'].userData.noBake = S['ear1'].userData.noBake = mouth.userData.noBake = true;
  bakeGroup(bodyG); Object.values(S.legs).forEach(lg => bakeGroup(lg)); bakeGroup(head);
  S.shadow = shadowBlob(0.48 * HU * 1.0, 0.9); g.scene.add(S.shadow);
}
function updateSheep(r, dt) {
  const g = gl, S_ = g.sh, eq = S.equip, ph = r.ph, air = !r.grounded, t = r.t;
  const slT = r.sliding > 0 ? 1 : 0; S_.slide += (slT - S_.slide) * Math.min(1, dt * 16); const sl = S_.slide;
  const zz = r.introZ || 0, sxx = r.stage ? r.shx : r.px; S_.root.position.set(sxx, r.py * HU, zz); S_.root.rotation.y = r.faceY || 0;
  const bob = Math.abs(Math.sin(ph)) * 0.06 * (1 - sl) * (air ? 0 : 1), sway = air ? 0 : Math.sin(ph) * 0.025 * (1 - sl);
  S_.pose.scale.set(1 + 0.12 * sl, 1 - 0.42 * sl, 1 + 0.18 * sl); S_.pose.position.set(sway, bob, 0);
  const runA = (1 - sl) * (air ? 0 : 1), sw = Math.sin(ph) * 0.75 * runA;
  S_.legs.FL.rotation.x = air ? -0.75 : sw; S_.legs.BR.rotation.x = air ? 0.75 : sw; S_.legs.FR.rotation.x = air ? -0.6 : -sw; S_.legs.BL.rotation.x = air ? 0.6 : -sw;
  S_.tail.rotation.y = Math.sin(ph) * 0.18 * runA; S_.tail.position.y = 0.8 + Math.abs(Math.sin(ph * 2)) * 0.015;
  const ls = clamp(r.ls || 0, 0, 1); S_.head.rotation.y = ls * Math.PI; S_.head.rotation.x = Math.sin(ls * Math.PI) * -0.08; S_.head.position.set(0, 1.5 - 0.06 * sl, 0.64 - ls * 0.05);
  for (const sd of [-1, 1]) { const e = S_['ear' + sd]; e.rotation.z = sd * (0.2 + 0.35 * ls + Math.sin(t * 12 + sd) * 0.12); }
  S_.mouth.scale.y = 0.045 + Math.abs(Math.sin(t * 10)) * 0.02;
  for (const k of ['fez', 'turban', 'cap', 'crown']) S_.acc[k].visible = eq.head === k;
  S_.acc.shades.visible = eq.face === 'shades'; S_.acc.bow.visible = eq.neck === 'bow';
  S_.acc.cape.visible = eq.back === 'cape'; S_.tail.visible = eq.back !== 'cape'; if (eq.back === 'cape') S_.acc.cape.rotation.x = 0.15 + Math.sin(t * 14) * 0.12 + (air ? 0.25 : 0);
  S_.root.visible = !(((r.inv > 0 && !r.caught && Math.floor(t * 14) % 2) || (r.fly > 0 && r.fly < 3 && Math.floor(t * 8) % 2)));
  const sh = r.shield > 0; S_.bub.visible = S_.bub2.visible = sh && !(r.shield < 2 && Math.floor(t * 8) % 2); if (sh) { const k = 1 + Math.sin(t * 6) * 0.03; S_.bub.scale.set(k, 1.2 * k, 1.18 * k); }
  S_.rings.visible = r.magnet > 0 || r.fly > 0; if (S_.rings.visible) S_.rings.rotation.y = t * 4;
  const sr = 0.48 * HU * (1 - clamp(r.py / 3, 0, 0.5)); S_.shadow.position.set(sxx, 0.03, zz); S_.shadow.scale.set(sr * 2, 1, sr * 2 * 1.4);
}

/* ---------------- الجزار بسيوني (مجسّم) ---------------- */
function buildButcher() {
  const g = gl, root = new T.Group(), M = new T.Group(); M.scale.setScalar(0.104); root.add(M); root.rotation.y = Math.PI; g.scene.add(root);
  const skin = lam(0xe3a77a, { emissive: 0x2a1408 }), blk = lam(0x111111), wht = lam(0xffffff, { emissive: 0x555555 });
  const rt = mkTex(mkCanvas(128, 16, (c, w, h) => { c.fillStyle = '#d8c7a4'; c.fillRect(0, 0, w, h); c.fillStyle = '#5d6d82'; for (let i = 0; i < 8; i++) c.fillRect(i * 16 + 3, 0, 7, h); }), true);
  const B = g.bu = { root, M };
  const robe = new T.Mesh(new T.CylinderGeometry(3.3, 4.2, 6.2, 18, 1, true), lam(0xffffff, { map: rt, side: T.DoubleSide })); robe.position.y = 3.1; M.add(robe);
  const belt = cyl(3.45, 3.75, 0.8, lam(0x7a1f1f), 18); belt.position.y = 3.0; M.add(belt);
  for (const sd of [-1, 1]) { const l = cyl(1.2, 1.3, 4.2, lam(0x2a2a30), 10); l.position.set(sd * 1.5, -2.0, 0); M.add(l); const sh = box(2.2, 0.9, 3.2, blk); sh.position.set(sd * 1.5, -4.2, 0.5); M.add(sh); }
  const shoulder = cyl(3.4, 3.3, 0.6, lam(0xd8c7a4), 18); shoulder.position.y = 6.2; M.add(shoulder);
  // ذراع يمنى بالساطور
  const ar = new T.Group(); ar.position.set(3.3, 5.6, 0); M.add(ar); B.ar = ar;
  { const sl = cyl(0.8, 0.9, 4.2, lam(0xd8c7a4), 10); sl.position.y = 2.1; const hd = ellip(0.9, 0.9, 0.9, skin, 10); hd.position.y = 4.4; const hn = box(0.5, 2.4, 0.5, lam(0x6b3f17)); hn.position.y = 5.6; const bl = box(3.0, 3.0, 0.3, lam(0xa9b6bf, { emissive: 0x1d2326 })); bl.position.set(1.4, 7.7, 0); const hole = ellip(0.35, 0.35, 0.4, lam(0x37474f), 8); hole.position.set(2.5, 8.6, 0); ar.add(sl, hd, hn, bl, hole); }
  const al = new T.Group(); al.position.set(-3.3, 5.6, 0); M.add(al); B.al = al;
  { const sl = cyl(0.8, 0.9, 4.2, lam(0xd8c7a4), 10); sl.position.y = 2.1; const hd = ellip(1.0, 1.0, 1.0, skin, 10); hd.position.y = 4.4; al.add(sl, hd); al.rotation.z = 0.75; }
  // الرأس
  const head = new T.Group(); head.position.y = 8.6; M.add(head); B.head = head;
  head.add(ellip(2.5, 2.5, 2.4, skin, 18));
  for (const sd of [-1, 1]) { const e = ellip(0.5, 0.8, 0.4, skin, 8); e.position.set(sd * 2.45, 0, 0); head.add(e); }
  const tb = cyl(1.45, 1.9, 2.8, lam(0xa01818), 14); tb.position.y = 3.2; head.add(tb); const tt = ellip(1.45, 0.3, 1.45, lam(0x7a1010), 12); tt.position.y = 4.6; head.add(tt);
  const tas = cyl(0.12, 0.12, 2.4, blk, 5); tas.position.set(1.7, 4.0, 0); tas.rotation.z = -0.8; head.add(tas); const tbd = ellip(0.28, 0.45, 0.28, blk, 6); tbd.position.set(2.5, 2.9, 0); head.add(tbd);
  for (const sd of [-1, 1]) {
    const w = ellip(0.66, 0.54, 0.3, wht, 10); w.position.set(sd * 0.98, 0.45, 2.2); head.add(w);
    const ir = ellip(0.24, 0.24, 0.15, lam(0xbb0000, { emissive: 0x550000 }), 8); ir.position.set(sd * 0.98, 0.4, 2.42); head.add(ir);
    const pp = ellip(0.12, 0.12, 0.1, blk, 6); pp.position.set(sd * 0.98, 0.4, 2.52); head.add(pp);
    const br = box(2.0, 0.34, 0.4, blk); br.position.set(sd * 1.0, 1.55, 2.2); br.rotation.z = sd * -0.4; head.add(br);
    const ms = ellip(1.7, 0.5, 0.5, blk, 8); ms.position.set(sd * 1.3, -0.95, 2.1); ms.rotation.z = sd * 0.35; head.add(ms);
  }
  const mouth = ellip(0.95, 0.55, 0.3, lam(0x3a0d0d), 10); mouth.position.set(0, -1.45, 2.15); head.add(mouth); B.mouth = mouth; const teeth = box(1.1, 0.24, 0.1, lam(0xffffff)); teeth.position.set(0, -1.05, 2.4); head.add(teeth);
  B.ar.userData.noBake = B.al.userData.noBake = mouth.userData.noBake = true; bakeGroup(ar); bakeGroup(al); bakeGroup(head); bakeGroup(M);
  root.visible = false;
}
function updateButcher(r) {
  const B = gl.bu, k = clamp(r.close, 0, 1); B.root.visible = k > 0.02; if (!B.root.visible) return;
  const t = r.t, rise = easeOut(clamp(k * 1.6, 0, 1)), bob = Math.abs(Math.sin(t * 9)) * 0.1;
  B.root.position.set(r.px * 0.6 + Math.sin(t * 7) * 0.04, 0.0 - (1 - rise) * 2.3 + bob, -5.4 - (1 - k) * 0.2);
  const sw = Math.sin(t * 8) * 0.25; B.ar.rotation.z = -0.35 - sw; B.al.rotation.z = 0.75 - sw * 0.5; B.mouth.scale.y = 0.55 + Math.abs(Math.sin(t * 9)) * 0.25;
}
