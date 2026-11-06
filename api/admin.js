// GET (professor): código ativo, partidas ao vivo e ranking. DELETE: limpa o ranking.
const { r, seedOf, isAdmin, parseHash } = require("./_lib");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!isAdmin(req)) return res.status(401).json({ error: "PIN incorreto" });
  try {
    if (req.method === "GET") {
      const code = (await r(["GET", "qs:cfg"])) || "";
      const seed = seedOf(code);
      const [rf, lf] = await Promise.all([r(["HGETALL", "qs:res"]), r(["HGETALL", "qs:live"])]);
      const mine = (o) => seed && o.g === seed;
      res.status(200).json({ code, results: parseHash(rf).filter(mine), live: parseHash(lf).filter(mine) });
    } else if (req.method === "DELETE") {
      await r(["DEL", "qs:res"]);
      await r(["DEL", "qs:live"]);
      res.status(200).json({ ok: true });
    } else {
      res.status(405).json({ error: "método não permitido" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
