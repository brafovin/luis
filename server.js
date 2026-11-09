// Schwerter-Welten – Server: statische Dateien + WebSocket-Mehrspieler
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

function resolveFile(url) {
  const p = decodeURIComponent(url.split('?')[0]);
  if (p.startsWith('/vendor/three/')) return path.join(__dirname, 'node_modules/three/build', p.slice(14));
  const f = p === '/' ? '/index.html' : p;
  return path.join(__dirname, 'public', f);
}

const server = http.createServer((req, res) => {
  const file = path.normalize(resolveFile(req.url));
  if (!file.startsWith(__dirname)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

// rooms: key -> { clients:Map(id->ws), blocks:Map("x,y,z"->{x,y,z,t}) }
const rooms = new Map();
let nextId = 1;
const MAX_BLOCKS = 4000;
const MAX_PLAYERS = 8;

function send(ws, msg) { if (ws.readyState === 1) ws.send(JSON.stringify(msg)); }
function broadcast(room, msg, except) {
  const s = JSON.stringify(msg);
  for (const [id, c] of room.clients) if (id !== except && c.readyState === 1) c.send(s);
}
const num = (v, d = 0) => (Number.isFinite(v) ? v : d);
const clean = (s, n) => String(s ?? '').replace(/[<>&"]/g, '').slice(0, n);

const wss = new WebSocketServer({ server });
wss.on('connection', (ws) => {
  const id = nextId++;
  let room = null, key = null, info = null;

  ws.on('message', (raw) => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (m.t === 'join' && !room) {
      key = clean(m.world, 12) + ':' + clean(m.room, 16).toUpperCase();
      room = rooms.get(key);
      if (!room) rooms.set(key, room = { clients: new Map(), blocks: new Map() });
      if (room.clients.size >= MAX_PLAYERS) { send(ws, { t: 'full' }); ws.close(); return; }
      info = { name: clean(m.name, 14) || 'Krieger', sword: clean(m.sword, 24), armor: clean(m.armor, 8) };
      ws.info = info;
      send(ws, {
        t: 'welcome', id,
        players: [...room.clients].map(([i, c]) => ({ id: i, ...c.info })),
        blocks: [...room.blocks.values()],
      });
      room.clients.set(id, ws);
      broadcast(room, { t: 'join', id, ...info }, id);
    } else if (!room) return;
    else if (m.t === 'state') {
      broadcast(room, { t: 'state', id, x: num(m.x), y: num(m.y), z: num(m.z), yaw: num(m.yaw), pitch: num(m.pitch), swing: !!m.swing }, id);
    } else if (m.t === 'info') {
      info.sword = clean(m.sword, 24); info.armor = clean(m.armor, 8);
      broadcast(room, { t: 'info', id, sword: info.sword, armor: info.armor }, id);
    } else if (m.t === 'place') {
      const b = { x: Math.round(num(m.x)), y: Math.round(num(m.y)), z: Math.round(num(m.z)), b: clean(m.b, 10) };
      const k = `${b.x},${b.y},${b.z}`;
      if (room.blocks.size < MAX_BLOCKS && !room.blocks.has(k) && b.y >= 0 && b.y < 30) {
        room.blocks.set(k, b);
        broadcast(room, { t: 'place', ...b }, id);
      }
    } else if (m.t === 'remove') {
      const k = `${Math.round(num(m.x))},${Math.round(num(m.y))},${Math.round(num(m.z))}`;
      if (room.blocks.delete(k)) broadcast(room, { t: 'remove', x: Math.round(m.x), y: Math.round(m.y), z: Math.round(m.z) }, id);
    } else if (m.t === 'chat') {
      broadcast(room, { t: 'chat', id, name: info.name, text: clean(m.text, 120) });
    }
  });

  ws.on('close', () => {
    if (!room) return;
    room.clients.delete(id);
    broadcast(room, { t: 'leave', id });
    if (room.clients.size === 0) setTimeout(() => { if (rooms.get(key)?.clients.size === 0) rooms.delete(key); }, 10 * 60 * 1000);
  });
});

server.listen(PORT, () => console.log(`Schwerter-Welten läuft auf http://localhost:${PORT}`));
