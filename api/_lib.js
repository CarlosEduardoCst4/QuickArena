// Utilitários compartilhados. Arquivos com "_" no início não viram rota na Vercel.
const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

// Executa um comando Redis pela API REST da Upstash, ex.: r(["GET", "chave"])
async function r(cmd) {
  if (!URL_ || !TOKEN) throw new Error("Banco de dados não configurado (veja o README)");
  const resp = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: "Bearer " + TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  const j = await resp.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

// A semente da rodada são os 4 últimos dígitos do código de 9 números
function seedOf(code) {
  const d = String(code || "").replace(/\D/g, "");
  return d.length === 9 ? Number(d) % 10000 : 0;
}

function isAdmin(req) {
  const pin = process.env.ADMIN_PIN || "prof123";
  return (req.headers["x-admin-pin"] || "") === pin;
}

function body(req) {
  try {
    return typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch (e) {
    return {};
  }
}

// HGETALL devolve [campo, valor, campo, valor...]
function parseHash(flat) {
  const out = [];
  for (let i = 0; i < (flat || []).length; i += 2) {
    try { out.push(JSON.parse(flat[i + 1])); } catch (e) {}
  }
  return out;
}

module.exports = { r, seedOf, isAdmin, body, parseHash };
