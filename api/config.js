// POST (professor): define ou limpa o código da partida ativo.
const { r, isAdmin, body } = require("./_lib");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "método não permitido" });
  if (!isAdmin(req)) return res.status(401).json({ error: "PIN incorreto" });
  try {
    const { code } = body(req);
    if (code && !/^\d{3}-\d{3}-\d{3}$/.test(code)) return res.status(400).json({ error: "código inválido" });
    if (code) await r(["SET", "qs:cfg", code]);
    else await r(["DEL", "qs:cfg"]);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
