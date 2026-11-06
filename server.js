// Quick Sort Arena - servidor local (sem dependências). Requer Node.js 18 ou mais novo.
// O banco de dados é um arquivo: data/db.json
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = Number(process.env.PORT) || 3000;
const PIN = process.env.ADMIN_PIN || ""; // opcional: se vazio, /#admin abre sem senha
const DIR = path.join(__dirname, "data");
const FILE = path.join(DIR, "db.json");

// ---------- banco de dados em arquivo ----------
let db = { cfg: "", res: {}, live: {} };
try {
  db = Object.assign(db, JSON.parse(fs.readFileSync(FILE, "utf8")));
} catch (e) {}

let timer = null;
function save() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      fs.mkdirSync(DIR, { recursive: true });
      const tmp = FILE + ".tmp";
      fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
      fs.renameSync(tmp, FILE);
    } catch (e) {
      console.error("Erro ao salvar o banco:", e.message);
    }
  }, 150);
}
process.on("SIGINT", () => { try { fs.mkdirSync(DIR, { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(db, null, 2)); } catch (e) {} process.exit(0); });

// ---------- utilidades ----------
function seedOf(code) {
  const d = String(code || "").replace(/\D/g, "");
  return d.length === 9 ? Number(d) % 10000 : 0;
}
function isAdmin(req) {
  return !PIN || (req.headers["x-admin-pin"] || "") === PIN;
}
function send(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(obj));
}
function readBody(req) {
  return new Promise((resolve) => {
    let s = "";
    req.on("data", (c) => { s += c; if (s.length > 100000) req.destroy(); });
    req.on("end", () => { try { resolve(JSON.parse(s || "{}")); } catch (e) { resolve({}); } });
  });
}

// ---------- rotas da API ----------
async function api(req, res, route) {
  if (route === "play") {
    if (req.method !== "POST") return send(res, 405, { error: "método não permitido" });
    const b = await readBody(req), o = b.r || {};
    const name = String(o.n || "").trim().slice(0, 30);
    if (!name || !["s", "t", "g"].every((k) => Number.isFinite(Number(o[k])))) return send(res, 400, { error: "dados inválidos" });
    const seed = seedOf(db.cfg);
    if (!seed || Number(o.g) !== seed) return send(res, 409, { error: "esta rodada já foi encerrada" });
    const key = name.toLowerCase();
    const s = Math.max(0, Math.min(5000, Math.round(Number(o.s))));
    if (b.type === "live") {
      db.live[key] = { n: name, s, i: Number(o.i) || 0, t: Number(o.t) || 0, g: seed, d: o.d ? 1 : 0, ts: Date.now() };
      save();
      return send(res, 200, { ok: true });
    }
    if (b.type === "final") {
      const t = Math.max(0, Math.round(Number(o.t)));
      const old = db.res[key];
      if (!old || s > old.s || (s === old.s && t < old.t)) db.res[key] = { n: name, s, t, g: seed, ts: Date.now() };
      db.live[key] = { n: name, s, i: 0, t: 0, g: seed, d: 1, ts: Date.now() };
      save();
      return send(res, 200, { ok: true });
    }
    return send(res, 400, { error: "tipo inválido" });
  }

  if (route === "admin") {
    if (!isAdmin(req)) return send(res, 401, { error: "PIN incorreto" });
    if (req.method === "GET") {
      const seed = seedOf(db.cfg), mine = (o) => seed && o.g === seed;
      return send(res, 200, { code: db.cfg, results: Object.values(db.res).filter(mine), live: Object.values(db.live).filter(mine) });
    }
    if (req.method === "DELETE") {
      db.res = {}; db.live = {}; save();
      return send(res, 200, { ok: true });
    }
    return send(res, 405, { error: "método não permitido" });
  }

  if (route === "config") {
    if (req.method !== "POST") return send(res, 405, { error: "método não permitido" });
    if (!isAdmin(req)) return send(res, 401, { error: "PIN incorreto" });
    const { code } = await readBody(req);
    if (code && !/^\d{3}-\d{3}-\d{3}$/.test(code)) return send(res, 400, { error: "código inválido" });
    db.cfg = code || "";
    save();
    return send(res, 200, { ok: true });
  }

  send(res, 404, { error: "rota não encontrada" });
}

// ---------- servidor ----------
const server = http.createServer(async (req, res) => {
  const url = (req.url || "/").split("?")[0];
  try {
    if (url.startsWith("/api/")) return await api(req, res, url.slice(5));
    if (url === "/" || url === "/index.html") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      return res.end(fs.readFileSync(path.join(__dirname, "index.html")));
    }
    res.writeHead(404); res.end("Não encontrado");
  } catch (e) {
    send(res, 500, { error: e.message });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("\n  Quick Sort Arena rodando!\n");
  console.log("  Professor (neste computador): http://localhost:" + PORT + "/#admin");
  console.log("  Alunos (mesma rede Wi-Fi):");
  const ips = [];
  Object.values(os.networkInterfaces()).flat().forEach((n) => { if (n && n.family === "IPv4" && !n.internal) ips.push(n.address); });
  if (!ips.length) console.log("    (nenhuma rede encontrada)");
  ips.forEach((ip) => console.log("    http://" + ip + ":" + PORT));
  console.log("\n  Banco de dados: " + FILE);
  console.log("  Senha do professor: " + (PIN ? "ativada" : "desativada") + "\n");
});
server.on("error", (e) => {
  console.error(e.code === "EADDRINUSE" ? "\n  A porta " + PORT + " já está em uso. Feche o outro programa ou rode com outra porta (set PORT=3001)." : e.message);
  process.exit(1);
});
