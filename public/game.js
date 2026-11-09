import * as THREE from 'three';

/* ============================================================
   DATEN: Schwerter, Welten, Missionen, Bausteine
   ============================================================ */
const SWORD_TYPES = [
  { id: 'dolch',    name: 'Dolch',         len: 0.45, w: 0.06, dmg: 6,  price: 20,   cd: 0.25, reach: 1.9 },
  { id: 'kurz',     name: 'Kurzschwert',   len: 0.70, w: 0.08, dmg: 9,  price: 50,   cd: 0.32, reach: 2.2 },
  { id: 'rapier',   name: 'Rapier',        len: 1.15, w: 0.05, dmg: 12, price: 150,  cd: 0.22, reach: 2.6 },
  { id: 'lang',     name: 'Langschwert',   len: 1.00, w: 0.10, dmg: 14, price: 120,  cd: 0.40, reach: 2.5 },
  { id: 'katana',   name: 'Katana',        len: 1.10, w: 0.07, dmg: 17, price: 220,  cd: 0.35, reach: 2.6 },
  { id: 'saebel',   name: 'Säbel',         len: 0.95, w: 0.13, dmg: 16, price: 180,  cd: 0.38, reach: 2.4 },
  { id: 'breit',    name: 'Breitschwert',  len: 1.20, w: 0.17, dmg: 24, price: 380,  cd: 0.50, reach: 2.8 },
  { id: 'claymore', name: 'Claymore',      len: 1.60, w: 0.20, dmg: 34, price: 750,  cd: 0.65, reach: 3.2 },
  { id: 'riese',    name: 'Riesenschwert', len: 2.20, w: 0.30, dmg: 52, price: 1600, cd: 0.90, reach: 3.9 },
  { id: 'koloss',   name: 'Koloss-Klinge', len: 3.00, w: 0.45, dmg: 85, price: 4200, cd: 1.20, reach: 4.8 },
];
const SWORD_COLORS = [
  { id: 'stahl',    name: 'Stahl',    c: 0xc9d1d9, m: 1.0 },
  { id: 'bronze',   name: 'Bronze',   c: 0xcd7f32, m: 1.1 },
  { id: 'gold',     name: 'Gold',     c: 0xffd34d, m: 1.5 },
  { id: 'rubin',    name: 'Rubin',    c: 0xe02b3c, m: 1.8 },
  { id: 'smaragd',  name: 'Smaragd',  c: 0x2ecc71, m: 1.8 },
  { id: 'saphir',   name: 'Saphir',   c: 0x3a7bff, m: 1.8 },
  { id: 'amethyst', name: 'Amethyst', c: 0xb04bff, m: 2.2 },
  { id: 'obsidian', name: 'Obsidian', c: 0x1a1a26, m: 2.5, glow: 0x3a1a6a },
  { id: 'feuer',    name: 'Feuer',    c: 0xff6a00, m: 3.0, glow: 0xff3300 },
  { id: 'eis',      name: 'Eis',      c: 0x8be9ff, m: 3.0, glow: 0x3fb8ff },
];
const T_BY = Object.fromEntries(SWORD_TYPES.map(t => [t.id, t]));
const C_BY = Object.fromEntries(SWORD_COLORS.map(c => [c.id, c]));
const hex = (n) => '#' + n.toString(16).padStart(6, '0');
function swordInfo(id) {
  const [t, c] = id.split(':');
  const T = T_BY[t] || T_BY.kurz, C = C_BY[c] || C_BY.stahl;
  return { id: T.id + ':' + C.id, T, C, name: `${C.name}-${T.name}`, dmg: Math.round(T.dmg * (1 + (C.m - 1) * 0.2)), price: Math.round(T.price * C.m), cd: T.cd, reach: T.reach };
}
const sellPrice = (id) => Math.floor(swordInfo(id).price / 2);

const ARMORS = { stahl: ['Stahl', 0x9aa5b1], rot: ['Rot', 0xb3262e], blau: ['Blau', 0x2f5fd0], gruen: ['Grün', 0x2a8f4b], schwarz: ['Schwarz', 0x2b2b35], gold: ['Gold', 0xd9a521] };

const BLOCKS = {
  holz:   { name: 'Holz',   c: 0x8b5a2b, price: 3 },
  stein:  { name: 'Stein',  c: 0x8a8a8a, price: 5 },
  ziegel: { name: 'Ziegel', c: 0xa64b3c, price: 8 },
  gold:   { name: 'Gold',   c: 0xffd34d, price: 30 },
  lampe:  { name: 'Lampe',  c: 0xfff2a8, price: 12, glow: true },
};
const BLOCK_IDS = Object.keys(BLOCKS);

const WORLDS = {
  wiese:  { name: 'Grüne Wiese',   desc: 'Goblins & Bäume', sky: 0x8fd0ff, fog: 0xbfe6ff, ground: [0x4caf50, 0x3f9a44], deco: 'baum',    mob: 'Goblin',   mobC: 0x5aa02c, boss: 'Goblin-König',   css: 'linear-gradient(135deg,#3a9d46,#7fd36e)' },
  wueste: { name: 'Heiße Wüste',   desc: 'Mumien & Kakteen', sky: 0xf6dc9d, fog: 0xf3d9a5, ground: [0xe0c070, 0xd2b062], deco: 'kaktus',  mob: 'Mumie',    mobC: 0xd8c79a, boss: 'Pharao',          css: 'linear-gradient(135deg,#d9a441,#f6dc9d)' },
  schnee: { name: 'Eiswelt',       desc: 'Frostwichte & Tannen', sky: 0xcfe8ff, fog: 0xe4f1ff, ground: [0xf2f7ff, 0xdbe8f8], deco: 'tanne',   mob: 'Frostwicht', mobC: 0x7fc8ff, boss: 'Eisriese',     css: 'linear-gradient(135deg,#7fb6e8,#eaf4ff)' },
  lava:   { name: 'Lavawelt',      desc: 'Feuerdämonen & Lava!', sky: 0x2a0a0a, fog: 0x4a1408, ground: [0x3a2a2a, 0x2e2121], deco: 'fels',    mob: 'Feuerdämon', mobC: 0xff5a1f, boss: 'Lavadrache',   css: 'linear-gradient(135deg,#7a1c0c,#ff6a00)' },
  kristall: { name: 'Kristall-Void', desc: 'Schatten & Kristalle', sky: 0x120a2e, fog: 0x1d1245, ground: [0x2a2150, 0x231b44], deco: 'kristall', mob: 'Schatten', mobC: 0xb04bff, boss: 'Void-Wächter',  css: 'linear-gradient(135deg,#2a1a6a,#b04bff)' },
};
const WORLD_IDS = Object.keys(WORLDS);
const ARENA = 42;

// Level 0 = freier Modus; 1-5 Missionen
const LEVELS = [
  { title: 'Freier Modus – bauen & erkunden', type: 'free' },
  { title: 'Erste Schritte', type: 'kill', n: 6, reward: 100 },
  { title: 'Kristallsammler', type: 'collect', n: 8, enemies: 4, reward: 200 },
  { title: 'Horde', type: 'kill', n: 14, reward: 350 },
  { title: 'Überleben', type: 'survive', secs: 60, reward: 500 },
  { title: 'Der Boss', type: 'boss', reward: 1000 },
];

/* ============================================================
   SPEICHERSTAND
   ============================================================ */
const DEFAULT_SAVE = { gold: 150, swords: ['kurz:stahl'], equipped: 'kurz:stahl', blocks: { holz: 20, stein: 0, ziegel: 0, gold: 0, lampe: 0 }, progress: {}, name: '', armor: 'stahl', world: 'wiese', level: 1 };
let save;
try { save = { ...DEFAULT_SAVE, ...JSON.parse(localStorage.getItem('sw_save') || '{}') }; } catch { save = { ...DEFAULT_SAVE }; }
save.blocks = { ...DEFAULT_SAVE.blocks, ...save.blocks };
const persist = () => { try { localStorage.setItem('sw_save', JSON.stringify(save)); } catch {} };
const unlocked = (w) => save.progress[w] || 1; // höchstes freigeschaltetes Level

/* ============================================================
   HILFSFUNKTIONEN
   ============================================================ */
const $ = (id) => document.getElementById(id);
const rnd = (a, b) => a + Math.random() * (b - a);
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };

let actx;
function beep(f = 440, d = 0.08, type = 'square', vol = 0.05, slide = 0) {
  try {
    actx ||= new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, actx.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), actx.currentTime + d);
    g.gain.setValueAtTime(vol, actx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + d);
    o.connect(g).connect(actx.destination); o.start(); o.stop(actx.currentTime + d);
  } catch {}
}
const sfx = { swing: () => beep(300, 0.1, 'sawtooth', 0.03, -150), hit: () => beep(160, 0.12, 'square', 0.06, -80), coin: () => beep(880, 0.12, 'triangle', 0.06, 400), hurt: () => beep(120, 0.2, 'sawtooth', 0.07, -60), place: () => beep(220, 0.06, 'square', 0.04), win: () => { beep(523, .15, 'triangle', .07); setTimeout(() => beep(659, .15, 'triangle', .07), 150); setTimeout(() => beep(784, .3, 'triangle', .07), 300); } };

/* ============================================================
   THREE.JS GRUNDAUFBAU
   ============================================================ */
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.05, 200);
camera.rotation.order = 'YXZ';
scene.add(camera);
function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

const matCache = new Map();
const mat = (c, o = {}) => { const k = c + JSON.stringify(o); if (!matCache.has(k)) matCache.set(k, new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, metalness: 0, ...o })); return matCache.get(k); };
const box = (w, h, d, c, o) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c, o));

/* ---------- Schwert-Modell ---------- */
function makeSword(id) {
  const { T, C } = swordInfo(id);
  const g = new THREE.Group();
  const o = { metalness: 0.7, roughness: 0.25 };
  if (C.glow) { o.emissive = C.glow; o.emissiveIntensity = 0.7; }
  const bladeMat = mat(C.c, o);
  const gripLen = 0.2 + T.len * 0.05, gh = 0.06;
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, gripLen, 8), mat(0x4a2a12));
  grip.position.y = -gripLen / 2 + 0.02; g.add(grip);
  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.04 + T.w * 0.12, 8, 6), mat(0xd9b13a, { metalness: 0.8, roughness: 0.3 }));
  pommel.position.y = -gripLen + 0.02; g.add(pommel);
  const guard = box(0.12 + T.w * 1.6, gh * 0.8, 0.07, 0xd9b13a, { metalness: 0.8, roughness: 0.3 });
  guard.position.y = 0.04; g.add(guard);
  const bl = T.len;
  const blade = new THREE.Mesh(new THREE.BoxGeometry(T.w, bl, Math.max(0.015, T.w * 0.22)), bladeMat);
  blade.position.y = 0.07 + bl / 2; g.add(blade);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(T.w * 0.72, T.w * 1.6, 4), bladeMat);
  tip.rotation.y = Math.PI / 4; tip.scale.z = 0.3; tip.position.y = 0.07 + bl + T.w * 0.8; g.add(tip);
  // Blutrinne / Mittelstreifen
  const fuller = box(T.w * 0.25, bl * 0.8, Math.max(0.02, T.w * 0.26), 0x000000, { metalness: 0.5, roughness: 0.5, transparent: true, opacity: 0.25 });
  fuller.position.y = 0.07 + bl * 0.45; g.add(fuller);
  g.userData.total = bl + 0.3;
  return g;
}

/* ---------- Spieler-/Krieger-Modell ---------- */
function makeWarrior(armorId, swordId, name) {
  const A = ARMORS[armorId] || ARMORS.stahl;
  const g = new THREE.Group();
  const body = new THREE.Group(); g.add(body);
  const metal = { metalness: 0.5, roughness: 0.45 };
  const torso = box(0.62, 0.7, 0.34, A[1], metal); torso.position.y = 1.05; body.add(torso);
  const belt = box(0.64, 0.1, 0.36, 0x4a2a12); belt.position.y = 0.72; body.add(belt);
  const skirt = box(0.6, 0.25, 0.32, 0x5a3a1a); skirt.position.y = 0.58; body.add(skirt);
  const head = box(0.42, 0.42, 0.42, 0xe0b48a); head.position.y = 1.62; body.add(head);
  const helm = box(0.48, 0.28, 0.48, A[1], metal); helm.position.y = 1.74; body.add(helm);
  const visor = box(0.34, 0.07, 0.04, 0x111111); visor.position.set(0, 1.64, -0.23); body.add(visor);
  const crest = box(0.06, 0.2, 0.4, 0xc0262e); crest.position.y = 1.98; body.add(crest);
  for (const s of [-1, 1]) { const horn = box(0.07, 0.22, 0.07, 0xf0e8d0); horn.position.set(s * 0.26, 1.92, 0); horn.rotation.z = -s * 0.5; body.add(horn); }
  const pad = [-1, 1].map(s => { const p = box(0.26, 0.14, 0.4, A[1], metal); p.position.set(s * 0.42, 1.34, 0); body.add(p); return p; });
  const cape = box(0.55, 0.95, 0.05, 0xb01e2a); cape.position.set(0, 0.98, 0.21); body.add(cape);
  const legL = new THREE.Group(), legR = new THREE.Group();
  for (const [lg, s] of [[legL, -1], [legR, 1]]) { lg.position.set(s * 0.16, 0.5, 0); const l = box(0.22, 0.5, 0.24, 0x3b3b48); l.position.y = -0.25; lg.add(l); const b = box(0.24, 0.12, 0.3, 0x2a1a0e); b.position.set(0, -0.5, -0.03); lg.add(b); body.add(lg); }
  const armL = new THREE.Group(); armL.position.set(-0.42, 1.3, 0);
  const aL = box(0.2, 0.55, 0.2, A[1], metal); aL.position.y = -0.25; armL.add(aL);
  const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 12), mat(0xc0262e)); shield.rotation.x = Math.PI / 2; shield.position.set(-0.12, -0.35, -0.12); armL.add(shield);
  const boss = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), mat(0xffd34d, { metalness: 0.8 })); boss.position.set(-0.12, -0.35, -0.16); armL.add(boss);
  body.add(armL);
  const armR = new THREE.Group(); armR.position.set(0.42, 1.3, 0);
  const aR = box(0.2, 0.55, 0.2, A[1], metal); aR.position.y = -0.25; armR.add(aR);
  const hand = new THREE.Group(); hand.position.set(0, -0.55, 0); armR.add(hand); body.add(armR);
  const sw = new THREE.Group(); hand.add(sw);
  g.userData = { body, legL, legR, armL, armR, sw, swordId: null, armorId, name, cape };
  setSwordOnPlayer(g, swordId);
  if (name) { const tag = nameTag(name); tag.position.y = 2.5; g.add(tag); }
  return g;
}
function setSwordOnPlayer(g, swordId) {
  const u = g.userData; if (u.swordId === swordId) return;
  u.swordId = swordId; u.sw.clear();
  const m = makeSword(swordId); m.rotation.x = -Math.PI / 2; u.sw.add(m);
}
function nameTag(text) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64;
  const x = c.getContext('2d'); x.font = 'bold 34px system-ui'; x.textAlign = 'center';
  x.fillStyle = '#0008'; x.fillRect(0, 8, 256, 48); x.fillStyle = '#fff'; x.fillText(text, 128, 45);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false, transparent: true }));
  s.scale.set(1.6, 0.4, 1); s.renderOrder = 10; return s;
}

/* ---------- Ego-Perspektive: Hand + Schwert ---------- */
const hand = new THREE.Group(); camera.add(hand);
const handArm = box(0.11, 0.6, 0.11, 0x9aa5b1, { metalness: 0.5, roughness: 0.45 });
let heldSword = null;
hand.position.set(0.42, -0.5, -0.75);
function refreshHeld() {
  if (heldSword) hand.remove(heldSword);
  hand.remove(handArm);
  heldSword = makeSword(save.equipped);
  const s = Math.min(1, 1.15 / heldSword.userData.total) * 0.75 + 0.25;
  heldSword.scale.setScalar(Math.min(0.75, s));
  hand.add(heldSword);
  handArm.material = mat((ARMORS[save.armor] || ARMORS.stahl)[1], { metalness: 0.5, roughness: 0.45 });
  handArm.position.set(0, -0.38, 0.02);
  hand.add(handArm);
}

/* ============================================================
   WELT-STATE
   ============================================================ */
let worldGroup = null, blockGroup, enemyGroup, playerGroup, itemGroup, fxGroup;
let worldId = 'wiese', levelNo = 1, roomCode = 'SOLO';
let circles = [];          // statische Hindernisse
let lavaPatches = [];
const blocks = new Map();  // "x,y,z" -> {mesh,t}
const enemies = [];
const crystals = [];
const fx = [];
const remote = new Map();
let ws = null, myId = 0, netOk = false;
let state = 'menu';        // menu | play
let shopOpen = false, chatOpen = false;
let buildMode = false, buildSel = 0;
const P = { pos: new THREE.Vector3(0, 0, 4), vy: 0, yaw: 0, pitch: 0, ground: true, hp: 100, max: 100, swing: -1, cdUntil: 0, hurtAt: 0, spawn: new THREE.Vector3(0, 0, 4) };
let M = null;              // aktuelle Mission
const keys = new Set();
let locked = false;

const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const blockMats = {};
for (const id of BLOCK_IDS) { const b = BLOCKS[id]; blockMats[id] = new THREE.MeshStandardMaterial({ color: b.c, roughness: b.glow ? 0.4 : 0.85, metalness: id === 'gold' ? 0.8 : 0, emissive: b.glow ? 0xffd860 : 0x000000, emissiveIntensity: b.glow ? 0.9 : 0 }); }
const ghost = new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true }));
ghost.scale.setScalar(1.02); ghost.visible = false;

function buildWorld(wid) {
  if (worldGroup) { scene.remove(worldGroup); worldGroup.traverse(o => { if (o.geometry && !o.userData.shared) o.geometry.dispose?.(); }); }
  const W = WORLDS[wid];
  worldGroup = new THREE.Group(); scene.add(worldGroup);
  scene.background = new THREE.Color(W.sky);
  scene.fog = new THREE.Fog(W.fog, 25, 95);
  worldGroup.add(new THREE.HemisphereLight(0xffffff, W.ground[1], wid === 'lava' || wid === 'kristall' ? 0.7 : 1.0));
  const sun = new THREE.DirectionalLight(wid === 'lava' ? 0xff9a60 : 0xffffff, wid === 'kristall' ? 0.8 : 1.1);
  sun.position.set(30, 50, 20); worldGroup.add(sun);

  // Boden mit Pixel-Textur
  const tc = document.createElement('canvas'); tc.width = tc.height = 32;
  const tx = tc.getContext('2d');
  const r = mulberry32(hash(wid));
  for (let y = 0; y < 32; y += 4) for (let x = 0; x < 32; x += 4) { tx.fillStyle = hex(W.ground[r() < 0.5 ? 0 : 1]); tx.fillRect(x, y, 4, 4); }
  const tex = new THREE.CanvasTexture(tc); tex.magFilter = THREE.NearestFilter; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(60, 60); tex.colorSpace = THREE.SRGBColorSpace;
  const ground = new THREE.Mesh(new THREE.CircleGeometry(ARENA + 60, 48), new THREE.MeshStandardMaterial({ map: tex, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.name = 'ground'; worldGroup.add(ground);
  worldGroup.userData.ground = ground;

  // Arenarand: Säulen
  for (let i = 0; i < 40; i++) {
    const a = i / 40 * Math.PI * 2, pil = box(1.2, 5 + (i % 3), 1.2, W.deco === 'kristall' ? 0x40307a : 0x777788);
    pil.position.set(Math.cos(a) * (ARENA + 1), 2.5, Math.sin(a) * (ARENA + 1)); worldGroup.add(pil);
  }
  // Spawn-Plattform
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 0.1, 24), mat(0x9a9aaa)); pad.position.set(0, 0.05, 4); worldGroup.add(pad);

  circles = []; lavaPatches = [];
  const R = mulberry32(hash('deco' + wid));
  const n = 70;
  for (let i = 0; i < n; i++) {
    const a = R() * Math.PI * 2, d = 9 + R() * (ARENA - 12);
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    const m = makeDeco(W.deco, R); m.position.set(x, 0, z); worldGroup.add(m);
    circles.push({ x, z, r: W.deco === 'fels' ? 0.9 : 0.6 });
  }
  if (wid === 'lava') {
    for (let i = 0; i < 7; i++) {
      const a = R() * Math.PI * 2, d = 10 + R() * 26, rad = 2 + R() * 2.5;
      const l = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, 0.06, 20), new THREE.MeshBasicMaterial({ color: 0xff5a00 }));
      l.position.set(Math.cos(a) * d, 0.04, Math.sin(a) * d); worldGroup.add(l);
      lavaPatches.push({ x: l.position.x, z: l.position.z, r: rad });
    }
  }
  blockGroup = new THREE.Group(); enemyGroup = new THREE.Group(); playerGroup = new THREE.Group(); itemGroup = new THREE.Group(); fxGroup = new THREE.Group();
  worldGroup.add(blockGroup, enemyGroup, playerGroup, itemGroup, fxGroup, ghost);
  blocks.clear(); enemies.length = 0; crystals.length = 0; fx.length = 0; remote.clear();
}

function makeDeco(kind, R) {
  const g = new THREE.Group(), s = 0.8 + R() * 0.8;
  if (kind === 'baum') {
    const t = box(0.4, 1.6 * s, 0.4, 0x6b4423); t.position.y = 0.8 * s; g.add(t);
    const l1 = box(1.8 * s, 1.2 * s, 1.8 * s, 0x2e8b3d); l1.position.y = 2.0 * s; g.add(l1);
    const l2 = box(1.1 * s, 1.0 * s, 1.1 * s, 0x3aa84a); l2.position.y = 3.0 * s; g.add(l2);
  } else if (kind === 'kaktus') {
    const t = box(0.5, 2.4 * s, 0.5, 0x3a8f3a); t.position.y = 1.2 * s; g.add(t);
    const a = box(0.9, 0.35, 0.35, 0x3a8f3a); a.position.set(0.5, 1.4 * s, 0); g.add(a);
    const b = box(0.35, 0.8, 0.35, 0x3a8f3a); b.position.set(0.85, 1.7 * s, 0); g.add(b);
  } else if (kind === 'tanne') {
    const t = box(0.35, 1.0, 0.35, 0x5a3a20); t.position.y = 0.5; g.add(t);
    for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(1.3 * s - i * 0.3, 1.6, 6), mat(i === 2 ? 0xffffff : 0x2f6b4a)); c.position.y = 1.6 + i * 1.0; g.add(c); }
  } else if (kind === 'fels') {
    const r = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9 * s, 0), mat(0x2a2224, { flatShading: true })); r.position.y = 0.6 * s; r.rotation.set(R(), R(), R()); g.add(r);
    if (R() < 0.4) { const e = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25, 0), new THREE.MeshBasicMaterial({ color: 0xff5a00 })); e.position.set(0.5, 0.9, 0.3); g.add(e); }
  } else {
    const col = R() < 0.5 ? 0xb04bff : 0x4be0ff;
    const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.7 * s, 0), mat(col, { emissive: col, emissiveIntensity: 0.8, flatShading: true })); c.scale.y = 2.2; c.position.y = 1.4 * s; g.add(c);
  }
  return g;
}

/* ============================================================
   BLÖCKE (Platzieren)
   ============================================================ */
const bkey = (x, y, z) => `${x},${y},${z}`;
function addBlock(x, y, z, t, silent) {
  const k = bkey(x, y, z); if (blocks.has(k) || !BLOCKS[t]) return false;
  const m = new THREE.Mesh(boxGeo, blockMats[t]); m.position.set(x, y + 0.5, z); m.userData.b = { x, y, z, t };
  blockGroup.add(m); blocks.set(k, { mesh: m, t }); if (!silent) sfx.place(); return true;
}
function delBlock(x, y, z) {
  const k = bkey(x, y, z), b = blocks.get(k); if (!b) return null;
  blockGroup.remove(b.mesh); blocks.delete(k); return b.t;
}
function hitsBlocks(px, py, pz, r, h) {
  const x0 = Math.round(px - r), x1 = Math.round(px + r), z0 = Math.round(pz - r), z1 = Math.round(pz + r);
  const y0 = Math.floor(py + 0.001), y1 = Math.floor(py + h - 0.001);
  for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) for (let y = y0; y <= y1; y++) {
    if (blocks.has(bkey(x, y, z))) {
      // exakte Überlappung prüfen
      if (px + r > x - 0.5 && px - r < x + 0.5 && pz + r > z - 0.5 && pz - r < z + 0.5 && py < y + 1 && py + h > y) return true;
    }
  }
  return false;
}
const ray = new THREE.Raycaster(); ray.far = 7;
let target = null; // {pos:{x,y,z}, hit:{x,y,z}|null}
function updateTarget() {
  target = null; ghost.visible = false;
  if (!buildMode) return;
  ray.setFromCamera({ x: 0, y: 0 }, camera);
  const objs = [...blockGroup.children, worldGroup.userData.ground];
  const hit = ray.intersectObjects(objs, false)[0]; if (!hit) return;
  let pos, del = null;
  if (hit.object.userData.b) {
    const b = hit.object.userData.b; del = { x: b.x, y: b.y, z: b.z };
    const n = hit.face.normal; pos = { x: b.x + Math.round(n.x), y: b.y + Math.round(n.y), z: b.z + Math.round(n.z) };
  } else pos = { x: Math.round(hit.point.x), y: 0, z: Math.round(hit.point.z) };
  target = { pos, del };
  ghost.visible = true; ghost.position.set(pos.x, pos.y + 0.5, pos.z);
  ghost.material.color.set(canPlace(pos) ? 0xffffff : 0xff3030);
}
function canPlace(p) {
  if (p.y < 0 || p.y > 20 || Math.hypot(p.x, p.z) > ARENA - 2 || blocks.has(bkey(p.x, p.y, p.z))) return false;
  if (hitsBlocksAt(p)) return false;
  return true;
}
function hitsBlocksAt(p) { // Block würde Spieler überlappen?
  return P.pos.x + 0.3 > p.x - 0.5 && P.pos.x - 0.3 < p.x + 0.5 && P.pos.z + 0.3 > p.z - 0.5 && P.pos.z - 0.3 < p.z + 0.5 && P.pos.y < p.y + 1 && P.pos.y + 1.7 > p.y;
}
function doBuild(remove) {
  if (!target) return;
  if (remove) {
    if (!target.del) return;
    const t = delBlock(target.del.x, target.del.y, target.del.z);
    if (t) { save.blocks[t]++; persist(); sfx.place(); netSend({ t: 'remove', ...target.del }); refreshHotbar(); }
  } else {
    const id = BLOCK_IDS[buildSel];
    if (save.blocks[id] <= 0) return flash('Keine ' + BLOCKS[id].name + '-Blöcke! Kaufe welche im Shop (E)');
    if (!canPlace(target.pos)) return;
    if (addBlock(target.pos.x, target.pos.y, target.pos.z, id)) { save.blocks[id]--; persist(); netSend({ t: 'place', ...target.pos, b: id }); refreshHotbar(); }
  }
}

/* ============================================================
   GEGNER & MISSIONEN
   ============================================================ */
function makeEnemy(isBoss) {
  const W = WORLDS[worldId], s = isBoss ? 2.4 : 1;
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const c = W.mobC, dark = new THREE.Color(c).multiplyScalar(0.6).getHex();
  const glow = worldId === 'lava' || worldId === 'kristall';
  const mo = glow ? { emissive: c, emissiveIntensity: 0.35 } : {};
  const torso = box(0.7, 0.8, 0.4, c, mo); torso.position.y = 1.0; body.add(torso);
  const head = box(0.55, 0.5, 0.5, c, mo); head.position.y = 1.65; body.add(head);
  for (const x of [-0.13, 0.13]) { const e = box(0.1, 0.1, 0.05, isBoss ? 0xff2020 : 0xffee33, { emissive: isBoss ? 0xff2020 : 0xffee33, emissiveIntensity: 1 }); e.position.set(x, 1.7, -0.26); body.add(e); }
  for (const x of [-0.18, 0.18]) { const ear = box(0.12, 0.3, 0.1, c); ear.position.set(x * 2, 1.9, 0); ear.rotation.z = x * 3; body.add(ear); }
  const armL = new THREE.Group(), armR = new THREE.Group();
  for (const [a, sd] of [[armL, -1], [armR, 1]]) { a.position.set(sd * 0.5, 1.3, 0); const m = box(0.2, 0.7, 0.2, dark); m.position.y = -0.3; a.add(m); body.add(a); }
  const legL = box(0.25, 0.65, 0.25, dark); legL.position.set(-0.18, 0.33, 0); body.add(legL);
  const legR = box(0.25, 0.65, 0.25, dark); legR.position.set(0.18, 0.33, 0); body.add(legR);
  if (isBoss) {
    const crown = box(0.6, 0.2, 0.6, 0xffd34d, { metalness: 0.8 }); crown.position.y = 2.0; body.add(crown);
    for (const x of [-0.25, 0, 0.25]) { const sp = box(0.1, 0.25, 0.1, 0xffd34d, { metalness: 0.8 }); sp.position.set(x, 2.2, 0); body.add(sp); }
  } else { const club = box(0.14, 0.9, 0.14, 0x6b4423); club.position.set(0.5, -0.5, -0.2); armR.add(club); }
  root.scale.setScalar(s);
  // Lebensbalken
  const bar = new THREE.Group(), bg = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.12), new THREE.MeshBasicMaterial({ color: 0x000000, depthTest: false, transparent: true, opacity: 0.6 }));
  const fg = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.08), new THREE.MeshBasicMaterial({ color: 0xff3030, depthTest: false })); fg.position.z = 0.001;
  bg.renderOrder = 11; fg.renderOrder = 12; bar.add(bg, fg); bar.position.y = 2.5;
  root.add(bar);
  return { root, body, armR, armL, legL, legR, bar, fg, s };
}
function spawnEnemy(boss) {
  const lv = Math.max(1, levelNo), wi = WORLD_IDS.indexOf(worldId);
  const e = makeEnemy(boss);
  const a = Math.random() * Math.PI * 2, d = rnd(14, 30);
  let x = P.pos.x + Math.cos(a) * d, z = P.pos.z + Math.sin(a) * d;
  const rr = Math.hypot(x, z); if (rr > ARENA - 3) { x *= (ARENA - 3) / rr; z *= (ARENA - 3) / rr; }
  e.root.position.set(x, 0, z);
  const base = 22 + lv * 10 + wi * 8;
  Object.assign(e, { hp: boss ? base * 9 : base, max: boss ? base * 9 : base, speed: boss ? 3.2 : rnd(2.2, 3.4) + wi * 0.15, dmg: (boss ? 18 : 6) + lv * 2 + wi * 2, cd: 0, boss, kx: 0, kz: 0, r: boss ? 1.3 : 0.5, h: boss ? 3.4 : 1.4, t: Math.random() * 6 });
  enemyGroup.add(e.root); enemies.push(e);
}
function spawnCrystal() {
  const a = Math.random() * Math.PI * 2, d = rnd(6, ARENA - 6);
  const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), new THREE.MeshStandardMaterial({ color: 0x44ffee, emissive: 0x22ddcc, emissiveIntensity: 1, flatShading: true }));
  m.position.set(Math.cos(a) * d, 1.2, Math.sin(a) * d); itemGroup.add(m); crystals.push(m);
}
function startMission(no) {
  levelNo = no; const L = LEVELS[no] || LEVELS[0];
  for (const e of enemies) enemyGroup.remove(e.root); enemies.length = 0;
  for (const c of crystals) itemGroup.remove(c); crystals.length = 0;
  M = { L, no, kills: 0, got: 0, time: 0, spawnT: 0, done: false, bossSpawned: false };
  P.hp = P.max; P.pos.copy(P.spawn); P.vy = 0;
  if (L.type === 'collect') for (let i = 0; i < L.n; i++) spawnCrystal();
  banner(L.type === 'free' ? 'Freier Modus' : `Level ${no}: ${L.title}`, 3000);
  updateHud();
}
function enemyTarget() {
  const L = M.L;
  if (L.type === 'kill') return Math.min(L.n - M.kills, 3 + levelNo + (WORLD_IDS.indexOf(worldId)));
  if (L.type === 'collect') return L.enemies;
  if (L.type === 'survive') return 4 + Math.floor(M.time / 15);
  if (L.type === 'boss') return M.bossSpawned ? Math.min(3, 1 + Math.floor(M.time / 20)) : 0;
  return 0;
}
function missionComplete() {
  M.done = true; const L = M.L;
  save.gold += L.reward; save.progress[worldId] = Math.max(unlocked(worldId), Math.min(LEVELS.length - 1, M.no + 1)); persist();
  sfx.win(); banner(`Mission geschafft!\n+${L.reward} 🪙`, 4000);
  for (const e of enemies) { e.hp = 0; }
  setTimeout(() => { if (state === 'play' && M && M.done) { if (M.no < LEVELS.length - 1) startMission(M.no + 1); else { M = { L: LEVELS[0], no: 0, done: false }; banner('Alle Level dieser Welt geschafft!\nFrei weiterspielen & bauen', 4000); updateHud(); } } }, 4200);
  updateHud();
}
function killEnemy(e) {
  const i = enemies.indexOf(e); if (i < 0) return;
  enemies.splice(i, 1); enemyGroup.remove(e.root);
  const gain = e.boss ? 120 : 4 + levelNo * 2 + WORLD_IDS.indexOf(worldId) * 2;
  save.gold += gain; persist(); sfx.coin();
  burst(e.root.position.x, 1, e.root.position.z, WORLDS[worldId].mobC, e.boss ? 40 : 14);
  if (M && !M.done) {
    M.kills++;
    if (M.L.type === 'kill' && M.kills >= M.L.n) missionComplete();
    if (M.L.type === 'boss' && e.boss) missionComplete();
  }
  updateHud();
}
function burst(x, y, z, color, n) {
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial({ color })); m.scale.setScalar(rnd(0.08, 0.18));
    m.position.set(x, y, z); fxGroup.add(m);
    fx.push({ m, vx: rnd(-3, 3), vy: rnd(1, 5), vz: rnd(-3, 3), life: rnd(0.4, 0.9) });
  }
}

/* ============================================================
   KAMPF
   ============================================================ */
const fwd = new THREE.Vector3();
function attack() {
  const now = performance.now() / 1000, S = swordInfo(save.equipped);
  if (now < P.cdUntil) return;
  P.cdUntil = now + S.cd; P.swing = 0; sfx.swing();
  setTimeout(() => {
    camera.getWorldDirection(fwd);
    const cp = camera.getWorldPosition(new THREE.Vector3());
    let hit = false;
    for (const e of [...enemies]) {
      const c = new THREE.Vector3(e.root.position.x, e.root.position.y + e.h / 2, e.root.position.z).sub(cp);
      const d = c.length(); if (d > S.reach + e.r * 1.5) continue;
      c.normalize(); if (c.dot(fwd) < 0.35) continue;
      let dmg = S.dmg * rnd(0.85, 1.15); const crit = Math.random() < 0.1; if (crit) dmg *= 2;
      e.hp -= dmg; hit = true;
      const kb = e.boss ? 3 : 7; e.kx = c.x * kb; e.kz = c.z * kb;
      burst(e.root.position.x, 1.2, e.root.position.z, crit ? 0xffd34d : 0xffffff, crit ? 8 : 4);
      if (e.hp <= 0) killEnemy(e);
    }
    if (hit) sfx.hit();
  }, S.cd * 1000 * 0.3);
}
function hurt(dmg) {
  if (M && M.done) return;
  P.hp -= dmg; P.hurtAt = performance.now(); sfx.hurt();
  const d = $('damage'); d.style.opacity = 1; setTimeout(() => d.style.opacity = 0, 150);
  if (P.hp <= 0) {
    save.gold = Math.floor(save.gold * 0.9); persist();
    banner('Du wurdest besiegt!\n-10% Gold', 2500);
    startMission(levelNo);
  }
}

/* ============================================================
   MULTIPLAYER
   ============================================================ */
function netSend(o) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); }
function connect() {
  netOk = false;
  try { ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`); } catch { return; }
  ws.onopen = () => netSend({ t: 'join', room: roomCode, world: worldId, name: save.name, sword: save.equipped, armor: save.armor });
  ws.onclose = () => { netOk = false; updateRoomInfo(); };
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.t === 'welcome') { myId = m.id; netOk = true; m.players.forEach(addRemote); m.blocks.forEach(b => addBlock(b.x, b.y, b.z, b.b, true)); updateRoomInfo(); }
    else if (m.t === 'full') { flash('Raum ist voll (max. 8)'); }
    else if (m.t === 'join') { addRemote(m); chat('', `${m.name} ist beigetreten`); }
    else if (m.t === 'leave') { const r = remote.get(m.id); if (r) { chat('', `${r.name} hat verlassen`); playerGroup.remove(r.g); remote.delete(m.id); updateRoomInfo(); } }
    else if (m.t === 'state') { const r = remote.get(m.id); if (r) { r.tx = m.x; r.ty = m.y; r.tz = m.z; r.tyaw = m.yaw; r.pitch = m.pitch; if (m.swing && r.swingT < 0) r.swingT = 0; } }
    else if (m.t === 'info') { const r = remote.get(m.id); if (r) setSwordOnPlayer(r.g, m.sword); }
    else if (m.t === 'place') addBlock(m.x, m.y, m.z, m.b);
    else if (m.t === 'remove') delBlock(m.x, m.y, m.z);
    else if (m.t === 'chat') chat(m.name, m.text);
  };
}
function addRemote(p) {
  const g = makeWarrior(p.armor, p.sword, p.name); playerGroup.add(g);
  remote.set(p.id, { g, name: p.name, tx: 0, ty: 0, tz: 0, tyaw: 0, pitch: 0, swingT: -1, init: false });
  updateRoomInfo();
}
function updateRoomInfo() {
  $('roominfo').innerHTML = `${WORLDS[worldId].name} · Raum <b>${roomCode}</b><br>${netOk ? '🟢 online' : '⚪ Solo (kein Server)'}`;
  $('players').innerHTML = `<div>⚔ ${save.name || 'Krieger'} (du)</div>` + [...remote.values()].map(r => `<div>⚔ ${r.name}</div>`).join('');
}

/* ============================================================
   HUD / UI
   ============================================================ */
let bannerT;
function banner(txt, ms = 2500) { const b = $('banner'); b.textContent = txt; b.style.opacity = 1; clearTimeout(bannerT); bannerT = setTimeout(() => b.style.opacity = 0, ms); }
function flash(t) { banner(t, 1800); }
function chat(name, text) {
  const d = document.createElement('div'); d.textContent = name ? `${name}: ${text}` : text; if (!name) d.style.color = '#9fb4ff';
  $('chatlog').appendChild(d); setTimeout(() => d.remove(), 9000);
  while ($('chatlog').children.length > 6) $('chatlog').firstChild.remove();
}
function bladeDiv(id, scale = 60, max = 90) {
  const { T, C } = swordInfo(id);
  const h = Math.min(max, Math.max(18, T.len * scale)), w = Math.max(5, Math.min(26, T.w * scale * 1.3));
  return `<div class="blade" style="width:${w}px;height:${h}px;background:linear-gradient(90deg,${hex(C.c)},#fff6 50%,${hex(C.c)});${C.glow ? `box-shadow:0 0 8px ${hex(C.glow)};` : ''}"></div>`;
}
function refreshHotbar() {
  const hb = $('hotbar'); let h = '';
  if (buildMode) {
    BLOCK_IDS.forEach((id, i) => { h += `<div class="slot ${i === buildSel ? 'sel' : ''}"><span class="k">${i + 1}</span><div class="cube" style="background:${hex(BLOCKS[id].c)}"></div><span class="n">${save.blocks[id]}</span></div>`; });
  } else {
    save.swords.slice(0, 9).forEach((id, i) => { h += `<div class="slot ${id === save.equipped ? 'sel' : ''}"><span class="k">${i + 1}</span>${bladeDiv(id, 22, 44)}</div>`; });
  }
  hb.innerHTML = h;
  $('mode').textContent = buildMode ? '🧱 BAUMODUS – Linksklick: setzen · Rechtsklick: abbauen · B: zurück' : '';
}
function updateHud() {
  $('goldtxt').textContent = `🪙 ${save.gold}   ·   ⚔ ${swordInfo(save.equipped).name} (Schaden ${swordInfo(save.equipped).dmg})`;
  $('hpfill').style.width = Math.max(0, P.hp / P.max * 100) + '%'; $('hptext').textContent = `${Math.ceil(Math.max(0, P.hp))} / ${P.max}`;
  if (!M) return;
  const L = M.L; let t = '';
  if (L.type === 'free') t = '<b>Freier Modus</b><br>Bauen, Handeln, Erkunden.';
  else {
    t = `<b>Level ${M.no}: ${L.title}</b><br>`;
    if (L.type === 'kill') t += `Besiege ${WORLDS[worldId].mob}s: ${M.kills}/${L.n}`;
    if (L.type === 'collect') t += `Sammle Kristalle: ${M.got}/${L.n}`;
    if (L.type === 'survive') t += `Überlebe: ${Math.max(0, Math.ceil(L.secs - M.time))}s`;
    if (L.type === 'boss') t += `Besiege ${WORLDS[worldId].boss}!${M.bossSpawned ? '' : ' (kommt gleich…)'}`;
    t += `<br>Belohnung: ${L.reward} 🪙`;
  }
  $('mission').innerHTML = t;
}

/* ---------- Shop ---------- */
let shopTab = 'swords';
function renderShop() {
  $('shopgold').textContent = save.gold;
  document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === shopTab));
  let h = '';
  if (shopTab === 'swords') {
    for (const T of SWORD_TYPES) {
      h += `<div class="item"><div class="prev">${bladeDiv(T.id + ':stahl', 30, 84)}</div><div class="info"><b>${T.name}</b><small>Länge ${T.len.toFixed(2)} m · Basis-Schaden ${T.dmg} · Tempo ${(1 / T.cd).toFixed(1)}/s · Reichweite ${T.reach}</small><div class="chips">`;
      for (const C of SWORD_COLORS) {
        const id = T.id + ':' + C.id, s = swordInfo(id), own = save.swords.includes(id);
        h += `<button class="chip ${own ? 'own' : ''} ${!own && s.price > save.gold ? 'cant' : ''}" data-buy="${id}" title="${s.name} – Schaden ${s.dmg}" style="background:linear-gradient(${hex(C.c)},${hex(C.c)}cc)">${own ? '✓' : s.price + '🪙'}</button>`;
      }
      h += `</div></div></div>`;
    }
  } else if (shopTab === 'inv') {
    for (const id of save.swords) {
      const s = swordInfo(id), eq = id === save.equipped;
      h += `<div class="item"><div class="prev">${bladeDiv(id, 30, 84)}</div><div class="info"><b>${s.name}</b>${eq ? '<span class="tag">ausgerüstet</span>' : ''}<small>Schaden ${s.dmg} · Länge ${s.T.len.toFixed(2)} m</small></div>
      <button data-equip="${id}" ${eq ? 'disabled' : ''}>Ausrüsten</button><button data-sell="${id}" ${save.swords.length <= 1 ? 'disabled' : ''}>Verkaufen +${sellPrice(id)}🪙</button></div>`;
    }
  } else {
    for (const id of BLOCK_IDS) {
      const b = BLOCKS[id];
      h += `<div class="item"><div class="prev" style="height:60px"><div style="width:34px;height:34px;background:${hex(b.c)};border:2px solid #0006;${b.glow ? 'box-shadow:0 0 12px #ffe27a' : ''}"></div></div><div class="info"><b>${b.name}-Block</b><small>Du hast: ${save.blocks[id]} · Preis ${b.price}🪙 / Verkauf ${Math.floor(b.price / 2)}🪙</small></div>
      <button data-bb="${id}" ${save.gold < b.price * 10 ? 'disabled' : ''}>10× kaufen (${b.price * 10}🪙)</button><button data-bs="${id}" ${save.blocks[id] < 10 ? 'disabled' : ''}>10× verkaufen (+${Math.floor(b.price / 2) * 10})</button></div>`;
    }
  }
  $('shopbody').innerHTML = h;
}
$('shopbody').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  const d = b.dataset;
  if (d.buy) {
    const s = swordInfo(d.buy);
    if (save.swords.includes(d.buy)) { equip(d.buy); }
    else if (save.gold >= s.price) { save.gold -= s.price; save.swords.push(d.buy); sfx.coin(); equip(d.buy); }
    else flash('Nicht genug Gold!');
  } else if (d.equip) equip(d.equip);
  else if (d.sell) { if (save.swords.length > 1) { save.swords = save.swords.filter(i => i !== d.sell); save.gold += sellPrice(d.sell); if (save.equipped === d.sell) equip(save.swords[0]); sfx.coin(); } }
  else if (d.bb) { const p = BLOCKS[d.bb].price * 10; if (save.gold >= p) { save.gold -= p; save.blocks[d.bb] += 10; sfx.coin(); } }
  else if (d.bs) { if (save.blocks[d.bs] >= 10) { save.blocks[d.bs] -= 10; save.gold += Math.floor(BLOCKS[d.bs].price / 2) * 10; sfx.coin(); } }
  persist(); renderShop(); refreshHotbar(); updateHud();
});
document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => { shopTab = b.dataset.tab; renderShop(); });
function equip(id) { save.equipped = id; persist(); refreshHeld(); netSend({ t: 'info', sword: id, armor: save.armor }); refreshHotbar(); updateHud(); }
function openShop() { shopOpen = true; $('shop').classList.remove('hidden'); $('pause').classList.add('hidden'); renderShop(); document.exitPointerLock?.(); }
function closeShop() { shopOpen = false; $('shop').classList.add('hidden'); if (state === 'play') requestLock(); }
$('closeshop').onclick = closeShop; $('openshop').onclick = openShop;

/* ---------- Hauptmenü ---------- */
function buildMenu() {
  $('name').value = save.name; const sel = $('armor');
  sel.innerHTML = Object.entries(ARMORS).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join(''); sel.value = save.armor;
  const qs = new URLSearchParams(location.search);
  if (qs.get('world') && WORLDS[qs.get('world')]) save.world = qs.get('world');
  $('room').value = (qs.get('room') || '').toUpperCase();
  renderWorlds();
}
function renderWorlds() {
  $('worlds').innerHTML = WORLD_IDS.map(id => `<div class="card ${id === save.world ? 'sel' : ''}" data-w="${id}" style="background:${WORLDS[id].css}">${WORLDS[id].name}<small>${WORLDS[id].desc}</small></div>`).join('');
  const un = unlocked(save.world);
  $('levels').innerHTML = LEVELS.map((L, i) => { const lock = i > un; return `<div class="card ${i === save.level ? 'sel' : ''} ${lock ? 'lock' : ''}" data-l="${i}">${i === 0 ? '🧱 Frei' : (lock ? '🔒 ' : '') + 'Level ' + i}<small>${i === 0 ? 'Bauen & erkunden' : L.title}</small></div>`; }).join('');
  if (save.level > un) save.level = un;
}
$('worlds').onclick = (e) => { const c = e.target.closest('.card'); if (c) { save.world = c.dataset.w; renderWorlds(); } };
$('levels').onclick = (e) => { const c = e.target.closest('.card'); if (c && !c.classList.contains('lock')) { save.level = +c.dataset.l; renderWorlds(); } };
$('play').onclick = () => {
  save.name = ($('name').value || 'Krieger').trim().slice(0, 14); save.armor = $('armor').value;
  roomCode = ($('room').value || Math.random().toString(36).slice(2, 6)).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'SOLO';
  persist(); startGame(save.world, save.level);
};
$('resume').onclick = () => requestLock();
$('tomenu').onclick = () => leaveGame();

/* ============================================================
   SPIELSTART / ENDE
   ============================================================ */
function startGame(wid, lvl) {
  worldId = wid; state = 'play';
  $('menu').classList.add('hidden'); $('hud').classList.remove('hidden');
  buildWorld(wid); refreshHeld();
  P.pos.copy(P.spawn); P.yaw = 0; P.pitch = 0; P.hp = P.max;
  buildMode = false; startMission(lvl);
  history.replaceState(null, '', `?world=${wid}&room=${roomCode}`);
  connect(); updateRoomInfo(); refreshHotbar(); updateHud(); requestLock();
  chat('', `Raum-Code: ${roomCode} – teile den Link mit Freunden!`);
}
function leaveGame() {
  state = 'menu'; if (ws) { ws.onclose = null; ws.close(); ws = null; }
  document.exitPointerLock?.();
  $('hud').classList.add('hidden'); $('pause').classList.add('hidden'); $('menu').classList.remove('hidden'); renderWorlds();
}
function requestLock() { if (state === 'play' && !shopOpen) { shopOpen = false; $('shop').classList.add('hidden'); canvas.requestPointerLock?.(); } }
document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === canvas;
  if (state === 'play') $('pause').classList.toggle('hidden', locked || shopOpen || chatOpen);
});

/* ============================================================
   EINGABE
   ============================================================ */
addEventListener('keydown', (e) => {
  if (chatOpen) {
    if (e.key === 'Enter') { const v = $('chatinput').value.trim(); if (v) { netSend({ t: 'chat', text: v }); chat(save.name || 'Du', v); } closeChat(); }
    else if (e.key === 'Escape') closeChat();
    return;
  }
  if (state !== 'play') return;
  if (e.code === 'KeyE') { shopOpen ? closeShop() : openShop(); e.preventDefault(); return; }
  if (shopOpen) { if (e.key === 'Escape') closeShop(); return; }
  if (e.code === 'KeyT') { e.preventDefault(); openChat(); return; }
  keys.add(e.code);
  if (e.code === 'KeyB') { buildMode = !buildMode; refreshHotbar(); }
  const n = parseInt(e.key);
  if (n >= 1 && n <= 9) {
    if (buildMode) { if (n <= BLOCK_IDS.length) buildSel = n - 1; } else if (save.swords[n - 1]) equip(save.swords[n - 1]);
    refreshHotbar();
  }
});
addEventListener('keyup', (e) => keys.delete(e.code));
addEventListener('blur', () => keys.clear());
function openChat() { chatOpen = true; $('chatinput').classList.remove('hidden'); $('chatinput').value = ''; document.exitPointerLock?.(); setTimeout(() => $('chatinput').focus(), 0); }
function closeChat() { chatOpen = false; $('chatinput').classList.add('hidden'); $('chatinput').blur(); requestLock(); }
addEventListener('mousemove', (e) => {
  if (!locked) return;
  P.yaw -= e.movementX * 0.0022; P.pitch = Math.max(-1.5, Math.min(1.5, P.pitch - e.movementY * 0.0022));
});
addEventListener('mousedown', (e) => {
  if (state !== 'play' || !locked) return;
  if (buildMode) doBuild(e.button === 2); else if (e.button === 0) attack();
});
addEventListener('contextmenu', (e) => e.preventDefault());
addEventListener('wheel', (e) => {
  if (state !== 'play' || !locked) return;
  const dir = e.deltaY > 0 ? 1 : -1;
  if (buildMode) buildSel = (buildSel + dir + BLOCK_IDS.length) % BLOCK_IDS.length;
  else { const i = save.swords.indexOf(save.equipped); equip(save.swords[(i + dir + save.swords.length) % save.swords.length]); }
  refreshHotbar();
});

/* ============================================================
   HAUPTSCHLEIFE
   ============================================================ */
function movePlayer(dt) {
  const f = (keys.has('KeyW') ? 1 : 0) - (keys.has('KeyS') ? 1 : 0), s = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0);
  const sp = keys.has('ShiftLeft') || keys.has('ShiftRight') ? 8.5 : 5.2;
  let dx = 0, dz = 0;
  if (f || s) {
    const l = Math.hypot(f, s), sin = Math.sin(P.yaw), cos = Math.cos(P.yaw);
    dx = (-sin * f + cos * s) / l * sp * dt; dz = (-cos * f - sin * s) / l * sp * dt;
  }
  const R = 0.3, H = 1.7;
  if (!hitsBlocks(P.pos.x + dx, P.pos.y, P.pos.z, R, H)) P.pos.x += dx;
  if (!hitsBlocks(P.pos.x, P.pos.y, P.pos.z + dz, R, H)) P.pos.z += dz;
  for (const c of circles) { const ox = P.pos.x - c.x, oz = P.pos.z - c.z, d = Math.hypot(ox, oz), m = c.r + R; if (d < m && d > 0.001) { P.pos.x = c.x + ox / d * m; P.pos.z = c.z + oz / d * m; } }
  const rr = Math.hypot(P.pos.x, P.pos.z); if (rr > ARENA - 0.8) { P.pos.x *= (ARENA - 0.8) / rr; P.pos.z *= (ARENA - 0.8) / rr; }
  if (keys.has('Space') && P.ground) { P.vy = 7.6; P.ground = false; }
  P.vy -= 22 * dt; P.vy = Math.max(P.vy, -30);
  let remain = P.vy * dt; const step = 0.1; P.ground = false;
  while (Math.abs(remain) > 1e-5) {
    const st = Math.sign(remain) * Math.min(Math.abs(remain), step); remain -= st;
    const ny = P.pos.y + st;
    if (ny <= 0) { P.pos.y = 0; if (P.vy < 0) { P.vy = 0; P.ground = true; } break; }
    if (hitsBlocks(P.pos.x, ny, P.pos.z, R, H)) { if (st < 0) P.ground = true; P.vy = 0; break; }
    P.pos.y = ny;
  }
  // Rausdrücken falls eingeklemmt
  if (hitsBlocks(P.pos.x, P.pos.y, P.pos.z, R, H)) P.pos.y += 1;
}

function updateEnemies(dt, t) {
  for (const e of enemies) {
    const p = e.root.position, dx = P.pos.x - p.x, dz = P.pos.z - p.z, dist = Math.hypot(dx, dz);
    e.t += dt;
    let mx = 0, mz = 0;
    if (dist > 1.3 * e.s) { mx = dx / dist * e.speed; mz = dz / dist * e.speed; }
    mx += e.kx; mz += e.kz; e.kx *= 0.85; e.kz *= 0.85;
    const nx = p.x + mx * dt, nz = p.z + mz * dt;
    if (!hitsBlocks(nx, 0.01, p.z, e.r, e.h)) p.x = nx;
    if (!hitsBlocks(p.x, 0.01, nz, e.r, e.h)) p.z = nz;
    // gegenseitig abstoßen
    for (const o of enemies) if (o !== e) { const ox = p.x - o.root.position.x, oz = p.z - o.root.position.z, d = Math.hypot(ox, oz); if (d < 0.9 * e.s && d > 0.01) { p.x += ox / d * dt * 2; p.z += oz / d * dt * 2; } }
    e.body.rotation.y = Math.atan2(-dx, -dz);
    const walk = Math.hypot(mx, mz) > 0.5 ? Math.sin(e.t * 9) * 0.6 : 0;
    e.legL.rotation.x = walk; e.legR.rotation.x = -walk; e.armL.rotation.x = -walk * 0.6;
    e.cd -= dt;
    if (dist < 1.5 * e.s && Math.abs(P.pos.y - p.y) < 1.8 && e.cd <= 0) { e.cd = e.boss ? 1.2 : 1.0; e.armR.rotation.x = -1.6; hurt(e.dmg); }
    e.armR.rotation.x += (0 - e.armR.rotation.x) * Math.min(1, dt * 8);
    e.bar.quaternion.copy(camera.quaternion);
    e.fg.scale.x = Math.max(0.001, e.hp / e.max); e.fg.position.x = -(1 - e.fg.scale.x) * 0.525;
  }
}

function updateMission(dt) {
  if (!M || M.done || M.L.type === 'free') return;
  M.time += dt;
  if (M.L.type === 'boss' && !M.bossSpawned && M.time > 3) { M.bossSpawned = true; spawnEnemy(true); banner(`${WORLDS[worldId].boss} erscheint!`, 2500); updateHud(); }
  if (M.L.type === 'survive' && M.time >= M.L.secs) return missionComplete();
  M.spawnT -= dt;
  if (M.spawnT <= 0) {
    M.spawnT = 1.2;
    const want = enemyTarget(), alive = enemies.filter(e => !e.boss).length;
    if (alive < want) spawnEnemy(false);
  }
  // Kristalle
  for (let i = crystals.length - 1; i >= 0; i--) {
    const c = crystals[i]; c.rotation.y += dt * 2; c.position.y = 1.2 + Math.sin(performance.now() / 400 + i) * 0.15;
    if (Math.hypot(c.position.x - P.pos.x, c.position.z - P.pos.z) < 1.3) {
      itemGroup.remove(c); crystals.splice(i, 1); M.got++; save.gold += 10; persist(); sfx.coin();
      if (M.got >= M.L.n) missionComplete();
    }
  }
  if (M.L.type === 'survive' || M.L.type === 'boss' || M.L.type === 'collect' || M.L.type === 'kill') updateHud();
}

let last = performance.now(), netT = 0, regenT = 0;
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000); last = now; const t = now / 1000;
  if (state === 'play' && worldGroup) {
    const active = locked || chatOpen;
    if (active) {
      movePlayer(dt); updateEnemies(dt, t); updateMission(dt);
      // Lava
      if (worldId === 'lava' && P.pos.y < 0.4) for (const l of lavaPatches) if (Math.hypot(P.pos.x - l.x, P.pos.z - l.z) < l.r) { hurt(12 * dt); break; }
      // Regeneration
      if (performance.now() - P.hurtAt > 5000 && P.hp < P.max) { P.hp = Math.min(P.max, P.hp + 3 * dt); }
      if (Math.floor(t * 4) !== regenT) { regenT = Math.floor(t * 4); updateHud(); }
    }
    // Kamera
    camera.position.set(P.pos.x, P.pos.y + 1.6 + Math.sin(t * 10) * (keys.has('KeyW') && P.ground ? 0.03 : 0), P.pos.z);
    camera.rotation.set(P.pitch, P.yaw, 0);
    // Schwertschwung (Ego)
    if (P.swing >= 0) {
      const dur = swordInfo(save.equipped).cd; P.swing += dt / Math.max(0.25, dur);
      if (P.swing >= 1) P.swing = -1;
    }
    const sw = P.swing >= 0 ? Math.sin(P.swing * Math.PI) : 0, idle = Math.sin(t * 2) * 0.01;
    hand.position.set(0.42 - sw * 0.6, -0.5 + idle + sw * 0.1, -0.75 - sw * 0.1);
    hand.rotation.set(-0.15 - sw * 1.0, 0.1 + sw * 0.4, -0.25 + sw * 1.4);
    // Partikel
    for (let i = fx.length - 1; i >= 0; i--) { const f = fx[i]; f.life -= dt; f.vy -= 12 * dt; f.m.position.x += f.vx * dt; f.m.position.y = Math.max(0.05, f.m.position.y + f.vy * dt); f.m.position.z += f.vz * dt; if (f.life <= 0) { fxGroup.remove(f.m); f.m.material.dispose(); fx.splice(i, 1); } }
    // andere Spieler
    for (const r of remote.values()) {
      if (!r.init && (r.tx || r.tz)) { r.g.position.set(r.tx, r.ty, r.tz); r.init = true; }
      r.g.position.x += (r.tx - r.g.position.x) * Math.min(1, dt * 12); r.g.position.y += (r.ty - r.g.position.y) * Math.min(1, dt * 12); r.g.position.z += (r.tz - r.g.position.z) * Math.min(1, dt * 12);
      let dyaw = r.tyaw - r.g.rotation.y; dyaw = Math.atan2(Math.sin(dyaw), Math.cos(dyaw)); r.g.rotation.y += dyaw * Math.min(1, dt * 12);
      const u = r.g.userData, moving = Math.hypot(r.tx - r.g.position.x, r.tz - r.g.position.z) > 0.05;
      const w = moving ? Math.sin(t * 10) * 0.6 : 0; u.legL.rotation.x = w; u.legR.rotation.x = -w; u.armL.rotation.x = -w * 0.5;
      if (r.swingT >= 0) { r.swingT += dt * 3; if (r.swingT > 1) r.swingT = -1; }
      u.armR.rotation.x = r.swingT >= 0 ? -1.2 - Math.sin(r.swingT * Math.PI) * 1.3 : -0.5 + (moving ? w * 0.3 : 0);
    }
    if (buildMode) updateTarget(); else ghost.visible = false;
    // Netzwerk 15 Hz
    netT += dt; if (netT > 1 / 15) { netT = 0; netSend({ t: 'state', x: P.pos.x, y: P.pos.y, z: P.pos.z, yaw: P.yaw, pitch: P.pitch, swing: P.swing >= 0 }); }
    renderer.render(scene, camera);
  } else if (worldGroup) { renderer.render(scene, camera); }
}

buildMenu();
requestAnimationFrame(loop);
window.__g = { P, save, enemies, startGame, get M() { return M; }, get blocks() { return blocks; }, doBuild, get remote() { return remote; }, keys };
