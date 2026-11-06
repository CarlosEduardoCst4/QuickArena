// POST (aluno): envia progresso ("live") ou resultado final ("final").
const { r, seedOf, body } = require("./_lib");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "método não permitido" });
  try {
    const b = body(req), o = b.r || {};
    const name = String(o.n || "").trim().slice(0, 30);
    if (!name || !["s", "t", "g"].every((k) => Number.isFinite(Number(o[k])))) {
      return res.status(400).json({ error: "dados inválidos" });
    }
    const seed = seedOf(await r(["GET", "qs:cfg"]));
    if (!seed || Number(o.g) !== seed) return res.status(409).json({ error: "esta rodada já foi encerrada" });

    const key = name.toLowerCase();
    const s = Math.max(0, Math.min(5000, Math.round(Number(o.s))));

    if (b.type === "live") {
      await r(["HSET", "qs:live", key, JSON.stringify({ n: name, s, i: Number(o.i) || 0, t: Number(o.t) || 0, g: seed, d: o.d ? 1 : 0, ts: Date.now() })]);
      return res.status(200).json({ ok: true });
    }

    if (b.type === "final") {
      const t = Math.max(0, Math.round(Number(o.t)));
      const old = await r(["HGET", "qs:res", key]);
      let keep = true;
      if (old) {
        const p = JSON.parse(old);
        keep = s > p.s || (s === p.s && t < p.t);
      }
      if (keep) await r(["HSET", "qs:res", key, JSON.stringify({ n: name, s, t, g: seed, ts: Date.now() })]);
      await r(["HSET", "qs:live", key, JSON.stringify({ n: name, s, i: 0, t: 0, g: seed, d: 1, ts: Date.now() })]);
      return res.status(200).json({ ok: true });
    }

    res.status(400).json({ error: "tipo inválido" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
