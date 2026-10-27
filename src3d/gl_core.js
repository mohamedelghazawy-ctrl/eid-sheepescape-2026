/*3D-BEGIN*/
/* ======================== العالم ثلاثي الأبعاد (Three.js) ======================== */
/* نفس إسقاط المنظور القديم تماماً: الكاميرا خلف الخروف بمسافة F وعلى ارتفاع (BASE-HOR)/LW،
   فتبقى كل إحداثيات الشاشة (الجسيمات والنصوص) متطابقة مع العالم الحقيقي. */
const HU = 0.517;                       // وحدة الارتفاع (h) بوحدات الحارة
const GLC = { ok: false };
const T = (typeof THREE !== 'undefined') ? THREE : null;
let gl = null;
const lam = (color, o) => new T.MeshLambertMaterial(Object.assign({ color }, o || {}));
const bas = (color, o) => new T.MeshBasicMaterial(Object.assign({ color }, o || {}));
function mkCanvas(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; }
function mkTex(cvs, rep) { const t = new T.CanvasTexture(cvs); if (rep) t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = gl ? gl.aniso : 1; return t; }
function hexN(h) { return parseInt(h.slice(1), 16); }
function setCol(m, h) { m.color.setHex(hexN(h)); }
function ellip(rx, ry, rz, mat, seg) { const m = new T.Mesh(new T.SphereGeometry(1, seg || 12, Math.max(6, (seg || 12) * 0.7 | 0)), mat); m.scale.set(rx, ry, rz); return m; }
function box(w, h, d, mat) { return new T.Mesh(new T.BoxGeometry(w, h, d), mat); }
function cyl(rt, rb, h, mat, seg) { return new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg || 14), mat); }
function shiftUV(geo, faceVerts, su, sv) { const uv = geo.attributes.uv; for (const i of faceVerts) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv); uv.needsUpdate = true; }


/* ---------- دمج المجسّمات لتقليل عدد استدعاءات الرسم (مهم للهواتف) ---------- */
let _vcm = null;
function VCM() { return _vcm || (_vcm = new T.MeshLambertMaterial({ vertexColors: true })); }
function mergeGeos(list) {
  let nV = 0, nI = 0; for (const it of list) { const a = it.geo.attributes.position.count; nV += a; nI += it.geo.index ? it.geo.index.count : a; }
  const pos = new Float32Array(nV * 3), nor = new Float32Array(nV * 3), col = new Float32Array(nV * 3), idx = new Uint32Array(nI); let vo = 0, io = 0;
  for (const it of list) {
    const g = it.geo, p = g.attributes.position, n = g.attributes.normal, cnt = p.count; pos.set(p.array, vo * 3); if (n) nor.set(n.array, vo * 3);
    for (let i = 0; i < cnt; i++) { col[(vo + i) * 3] = it.rgb[0]; col[(vo + i) * 3 + 1] = it.rgb[1]; col[(vo + i) * 3 + 2] = it.rgb[2]; }
    if (g.index) { const ia = g.index.array; for (let i = 0; i < ia.length; i++) idx[io + i] = ia[i] + vo; io += ia.length; } else { for (let i = 0; i < cnt; i++) idx[io + i] = vo + i; io += cnt; }
    vo += cnt; g.dispose();
  }
  const out = new T.BufferGeometry(); out.setAttribute('position', new T.BufferAttribute(pos, 3)); out.setAttribute('normal', new T.BufferAttribute(nor, 3)); out.setAttribute('color', new T.BufferAttribute(col, 3)); out.setIndex(new T.BufferAttribute(idx, 1));
  return out;
}
/* يدمج كل المجسّمات غير المزخرفة داخل المجموعة في مجسّم واحد بألوان رؤوس. userData.noBake يمنع دمج العنصر/فرعه (للأجزاء المتحركة). */
function bakeGroup(group, filter) {
  group.updateMatrixWorld(true);
  const inv = new T.Matrix4().copy(group.matrixWorld).invert(), list = [], src = [], mm = new T.Matrix4();
  group.traverse(o => {
    if (o === group || !o.isMesh) return;
    const m = o.material; if (Array.isArray(m) || !m.isMeshLambertMaterial || m.map || m.transparent || m.side !== T.FrontSide || m.emissiveMap || m.vertexColors) return;
    for (let p = o; p && p !== group; p = p.parent) if (p.userData.noBake) return;
    if (filter && !filter(o)) return;
    const g = o.geometry.clone(); g.applyMatrix4(mm.multiplyMatrices(inv, o.matrixWorld));
    const c = m.color, e = m.emissive, k = 0.6 * (m.emissiveIntensity == null ? 1 : m.emissiveIntensity);
    list.push({ geo: g, rgb: [Math.min(1, c.r + e.r * k), Math.min(1, c.g + e.g * k), Math.min(1, c.b + e.b * k)] }); src.push(o);
  });
  if (!list.length) return null;
  src.forEach(o => { o.parent.remove(o); });
  const mesh = new T.Mesh(mergeGeos(list), VCM()); group.add(mesh); return mesh;
}

function gl3Init() {
  if (!T) return false;
  try {
    const el = document.getElementById('gl');
    const rd = new T.WebGLRenderer({ canvas: el, antialias: true, alpha: false, powerPreference: 'high-performance' });
    if (!rd.getContext()) return false;
    const sc0 = new T.Scene(), scene = new T.Group(), cam = new T.PerspectiveCamera(35, 1, 0.3, 520); sc0.add(scene); scene.scale.z = -1;   // z للأمام (عالم اليد اليمنى مقلوب) — الكاميرا خارج المجموعة
    gl = { el, rd, scene, sc: sc0, cam, aniso: Math.min(8, rd.capabilities.getMaxAnisotropy()), camY: 3.4, f: 1000, tmp: new T.Vector3(), W0: 0, H0: 0 };
    sc0.fog = new T.Fog(0xffffff, 26, 112);
    gl.amb = new T.AmbientLight(0xffffff, 0.62); gl.sun = new T.DirectionalLight(0xffffff, 0.42); gl.sun.position.set(6, 9, 8);
    gl.fill = new T.DirectionalLight(0xffffff, 0.2); gl.fill.position.set(-1, 5, -12);
    scene.add(gl.amb, gl.sun, gl.fill);
    buildSky(); buildRoad(); buildGarlands(); buildSheep(); buildButcher(); buildIntro(); buildStage();
    gl.bd = new Map(); gl.ob = new Map(); gl.pk = new Map();
    GLC.ok = true; gl3Resize(); return true;
  } catch (e) { console.error('3D init failed', e); GLC.ok = false; return false; }
}

function gl3Resize() {
  if (!gl) return;
  const g = gl; g.rd.setPixelRatio(Math.min(DPR, 1.75)); g.rd.setSize(W, H, false);
  g.f = LW * F; g.camY = (BASE - HOR) / LW;
  g.cam.fov = 2 * Math.atan((H / 2) / g.f) * 180 / Math.PI; g.cam.aspect = W / H; g.cam.updateProjectionMatrix();
  g.cam.projectionMatrix.elements[9] = 2 * HOR / H - 1; g.cam.projectionMatrixInverse.copy(g.cam.projectionMatrix).invert();
  g.cam.position.set(0, g.camY, F);
  layoutSky();
}
/* نقطة في العالم على شعاع بكسل الشاشة (sx,sy) على بُعد D من الكاميرا */
function rayPos(sx, sy, D, out) { const f = gl.f; out.set(((sx - W / 2) / f) * D, gl.camY - ((sy - HOR) / f) * D, D); return out; }
/* إسقاط نقطة عالم إلى الشاشة (لرسوم الـ2D فوق المشهد) */
function toScreen(x, y, z) { const v = gl.tmp.set(x, y, -z).project(gl.cam); return [(v.x * 0.5 + 0.5) * W, (-v.y * 0.5 + 0.5) * H]; }

/* ---------------- السماء ---------------- */
function buildSky() {
  const g = gl, sc = g.scene;
  g.skyG = new T.Group(); sc.add(g.skyG);   // مجموعة السماء تتبع اتجاه الكاميرا (تدور معها وتبقى في مكانها على الشاشة)
  g.domeMat = new T.ShaderMaterial({
    uniforms: { top: { value: new T.Color(0x5bbcff) }, bot: { value: new T.Color(0xffe7b0) } }, side: T.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vP; void main(){ vP=(modelMatrix*vec4(position,1.)).xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 bot; varying vec3 vP; void main(){ vec3 d=normalize(vP-cameraPosition); float t=clamp(d.y/0.2,0.,1.); gl_FragColor=vec4(mix(bot,top,t),1.); }',
  });
  g.dome = new T.Mesh(new T.SphereGeometry(400, 24, 12), g.domeMat); g.dome.renderOrder = -20; g.dome.frustumCulled = false; sc.add(g.dome);
  const glowTex = mkTex(mkCanvas(128, 128, (c) => { const gr = c.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, 128, 128); }));
  const discTex = mkTex(mkCanvas(64, 64, (c) => { c.fillStyle = '#fff'; c.beginPath(); c.arc(32, 32, 31, 0, 6.3); c.fill(); }));
  const moonTex = mkTex(mkCanvas(64, 64, (c) => { c.fillStyle = '#fff'; c.beginPath(); c.arc(32, 32, 31, 0, 6.3); c.fill(); c.fillStyle = 'rgba(150,150,110,.45)'; for (const [dx, dy, r] of [[-10, -8, 8], [12, 10, 6], [6, -14, 5]]) { c.beginPath(); c.arc(32 + dx, 32 + dy, r, 0, 6.3); c.fill(); } }));
  g.sunTex = discTex; g.moonTex = moonTex;
  const sp = (tex, o) => { const m = new T.SpriteMaterial(Object.assign({ map: tex, fog: false, depthWrite: false, depthTest: true, transparent: true }, o || {})); const s = new T.Sprite(m); s.renderOrder = -15; s.frustumCulled = false; g.skyG.add(s); return s; };
  g.sunGlow = sp(glowTex, { color: 0xfff0aa, blending: T.AdditiveBlending, opacity: 0.5 });
  g.sunDisc = sp(discTex, { color: 0xfff3b0 }); g.sunDisc.renderOrder = -14;
  const cloudTex = mkTex(mkCanvas(256, 96, (c) => { c.fillStyle = '#fff'; for (const [x, y, rx, ry] of [[128, 56, 100, 28], [160, 36, 56, 26], [92, 42, 46, 22]]) { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 6.3); c.fill(); } }));
  g.clouds = [0, 1, 2].map(() => sp(cloudTex, { opacity: 0.75 }));
  const sg = new T.BufferGeometry(); g.starPos = new Float32Array(stars.length * 3); sg.setAttribute('position', new T.BufferAttribute(g.starPos, 3));
  g.starMat = new T.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
  g.starPts = new T.Points(sg, g.starMat); g.starPts.renderOrder = -16; g.starPts.frustumCulled = false; g.skyG.add(g.starPts);
  g.sky = new T.Group(); g.skyG.add(g.sky); g.skyMat = bas(0x8a7a90, { fog: false });
}
function layoutSky() {
  const g = gl; if (!g.sky) return;
  for (let i = 0; i < stars.length; i++) rayPos(stars[i][0] * W, stars[i][1] * HOR * 0.8, 380, g.tmp), g.starPos.set([g.tmp.x, g.tmp.y, g.tmp.z], i * 3);
  g.starPts.geometry.attributes.position.needsUpdate = true;
  while (g.sky.children.length) { const o = g.sky.children.pop(); o.geometry && o.geometry.dispose(); }
  const D = 330, k = D / g.f, list = [], mm = new T.Matrix4(), add = (geo, x, y) => { rayPos(x, y, D, g.tmp); geo.applyMatrix4(mm.makeTranslation(g.tmp.x, g.tmp.y, g.tmp.z)); list.push({ geo, rgb: [1, 1, 1] }); };
  skyline.forEach(b => {
    const x = (b.x + b.w / 2) * W, w = b.w * W, h = b.h * H, base = HOR + 24;
    add(new T.BoxGeometry(w * k, (h + 24) * k, 4), x, base - (h + 24) / 2);
    if (b.k === 'dome') add(new T.SphereGeometry(w * 0.45 * k, 12, 6, 0, 6.3, 0, 1.58), x, HOR - h);
    if (b.k === 'minaret') { add(new T.BoxGeometry(w * 0.2 * k, H * 0.05 * k, 3), x, HOR - h - H * 0.025); add(new T.ConeGeometry(w * 0.15 * k, H * 0.035 * k, 4), x, HOR - h - H * 0.0675); }
  });
  const mg = mergeGeos(list); mg.deleteAttribute('color'); const sm_ = new T.Mesh(mg, g.skyMat); sm_.frustumCulled = false; sm_.renderOrder = -10; g.sky.add(sm_);
}
function updateSky(r, env) {
  const g = gl, night = env.night;
  g.domeMat.uniforms.top.value.setHex(hexN(env.top)); g.domeMat.uniforms.bot.value.setHex(hexN(env.bot)); g.dome.position.set(0, g.camY, -F);
  g.sc.fog.color.setHex(hexN(env.bot)); g.rd.setClearColor(hexN(env.bot), 1);
  g.skyMat.color.setHex(hexN(mixH(env.bot, '#4a3350', 0.35 + 0.3 * night)));
  const f = g.f, D = 300, k = D / f, isMoon = night > 0.55, sx = W * 0.74, sy = HOR * (0.38 + night * 0.1);
  rayPos(sx, sy, D, g.sunDisc.position); g.sunGlow.position.copy(g.sunDisc.position);
  g.sunDisc.scale.setScalar(34 * k); g.sunGlow.scale.setScalar(120 * k);
  g.sunDisc.material.map = isMoon ? g.moonTex : g.sunTex; g.sunDisc.material.color.setHex(isMoon ? 0xfffbe0 : 0xfff3b0); g.sunGlow.material.color.setHex(isMoon ? 0xe8f0d0 : 0xfff0aa);
  g.sunDisc.material.needsUpdate = false;
  g.clouds.forEach((c, i) => { const x = ((r.t * (6 + i * 3) + i * 170) % (W + 140)) - 70, y = HOR * (0.18 + i * 0.16); rayPos(x, y, 295, c.position); c.scale.set(110 * k * 1.1, 41 * k * 1.1, 1); c.visible = night < 0.5; c.material.opacity = 0.75 * (1 - night * 1.6); });
  g.starMat.opacity = clamp((night - 0.4) * 1.6, 0, 1) * (0.75 + 0.25 * Math.sin(r.t * 2));
  // إضاءة النهار/الليل
  const nt = night; g.amb.intensity = 0.62 - 0.36 * nt; g.amb.color.setRGB(1 - 0.38 * nt, 1 - 0.3 * nt, 1);
  g.sun.intensity = 0.42 * (1 - nt * 0.92); g.fill.intensity = 0.2 * (1 - nt * 0.5);
  g.emI = clamp((nt - 0.35) * 1.7, 0, 1);
}

/* ---------------- الطريق ---------------- */
function scrollOff(units, zc, L) { const o = -(zc + units) / 6 - L / 12; return ((o % 1) + 1) % 1; }
function buildRoad() {
  const g = gl, sc = g.scene, L = 150, zc = 61;
  const ground = new T.Mesh(new T.PlaneGeometry(300, 560), lam(0xc8a77a)); ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.02, 250); sc.add(ground);
  const roadC = mkCanvas(128, 256, (c, w, h) => {
    c.fillStyle = '#c9a574'; c.fillRect(0, 0, w, h / 2); c.fillStyle = '#bf996a'; c.fillRect(0, h / 2, w, h / 2);
    for (let i = 0; i < 380; i++) { const x = Math.random() * w, y = Math.random() * h; c.fillStyle = Math.random() < 0.5 ? 'rgba(255,240,210,.10)' : 'rgba(90,60,30,.10)'; c.fillRect(x, y, 3 + Math.random() * 5, 2 + Math.random() * 3); }
    c.fillStyle = '#f1dcb2'; for (const lx of [-0.5, 0.5]) { const px = (lx / ROAD * 0.5 + 0.5) * w; c.fillRect(px - 1.8, 0, 3.6, h / 2); }
    c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(0, h / 2 - 2, w, 2); c.fillRect(0, h - 2, w, 2);
  });
  g.roadTex = mkTex(roadC, true); g.roadTex.repeat.set(1, L / 6);
  const road = new T.Mesh(new T.PlaneGeometry(ROAD * 2, L), lam(0xffffff, { map: g.roadTex })); road.rotation.x = -Math.PI / 2; road.position.set(0, 0, zc); sc.add(road);
  const swC = mkCanvas(32, 256, (c, w, h) => { c.fillStyle = '#9a7650'; c.fillRect(0, 0, w, h / 2); c.fillStyle = '#85633f'; c.fillRect(0, h / 2, w, h / 2); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(0, h / 2 - 2, w, 2); c.fillRect(0, h - 2, w, 2); });
  g.swTex = mkTex(swC, true); g.swTex.repeat.set(1, L / 6);
  const curb = lam(0x6e5236);
  for (const sd of [-1, 1]) {
    const top = new T.Mesh(new T.PlaneGeometry(WALLX - ROAD, L), lam(0xffffff, { map: g.swTex })); top.rotation.x = -Math.PI / 2; top.position.set(sd * (ROAD + WALLX) / 2, 0.11, zc); sc.add(top);
    const face = new T.Mesh(new T.PlaneGeometry(L, 0.11), curb); face.rotation.y = -sd * Math.PI / 2; face.position.set(sd * ROAD, 0.055, zc); sc.add(face);
  }
  g.roadL = L; g.roadZc = zc;
}
/*3D-END-CORE*/
