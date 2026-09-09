// Roda no servidor da Vercel, nunca no navegador — é aqui, e só aqui, que a
// chave da API fica visível. O app manda a requisição pra cá (mesmo formato
// de sempre) e esta função repassa pra Anthropic com a chave anexada.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "ANTHROPIC_API_KEY não configurada no servidor." });
    return;
  }

  try {
    const resposta = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const dados = await resposta.json();
    res.status(resposta.status).json(dados);
  } catch (erro) {
    res.status(502).json({ error: "Falha ao falar com a Anthropic.", detalhe: String(erro) });
  }
}
