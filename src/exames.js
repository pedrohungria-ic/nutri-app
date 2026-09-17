// pdf-lib é carregado só quando um PDF é lido (deixa o app inicial mais leve).

// A função /api/claude roda na Vercel, que recusa requisições acima de ~4,5 MB.
// Como o arquivo vai em base64 (+33%), cada parte enviada fica abaixo de ~2,8 MB.
const LIMITE_BYTES_PARTE = 2.8 * 1024 * 1024;
const PAGINAS_POR_PARTE = 3;
const PARTES_EM_PARALELO = 2;

// Checklist usado junto com os nomes que o próprio usuário já tem no catálogo.
const EXAMES_COMUNS = [
  "Hemoglobina", "Hematócrito", "Eritrócitos", "VCM", "HCM", "CHCM", "RDW", "Leucócitos", "Neutrófilos",
  "Linfócitos", "Monócitos", "Eosinófilos", "Basófilos", "Plaquetas", "Glicose", "Hemoglobina Glicada",
  "Insulina", "HOMA-IR", "Colesterol Total", "HDL", "LDL", "VLDL", "Não-HDL", "Triglicerídeos",
  "Apolipoproteína A1", "Apolipoproteína B", "Lipoproteína (a)", "Creatinina", "Ureia", "Ácido Úrico",
  "TFG estimada", "Sódio", "Potássio", "Cálcio", "Magnésio", "Fósforo", "TGO (AST)", "TGP (ALT)",
  "Gama GT", "Fosfatase Alcalina", "Bilirrubina Total", "Bilirrubina Direta", "Bilirrubina Indireta",
  "Albumina", "Proteínas Totais", "CK (CPK)", "LDH", "PCR ultrassensível", "VHS", "Ferritina", "Ferro Sérico",
  "Transferrina", "Saturação de Transferrina", "Vitamina D (25-OH)", "Vitamina B12", "Ácido Fólico", "Zinco",
  "TSH", "T4 Livre", "T3 Livre", "T3 Total", "Testosterona Total", "Testosterona Livre", "Testosterona Biodisponível",
  "Estradiol", "SHBG", "LH", "FSH", "Prolactina", "DHEA-S", "DHT", "Progesterona", "Cortisol", "IGF-1",
  "PSA Total", "PSA Livre", "PTH", "Homocisteína", "Amilase", "Lipase",
];

function paraBase64(bytes) {
  let bin = "";
  const passo = 0x8000;
  for (let i = 0; i < bytes.length; i += passo) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + passo));
  return btoa(bin);
}

async function comprimirImagem(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const max = 2200;
    const esc = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * esc); c.height = Math.round(img.height * esc);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise((res) => c.toBlob(res, "image/jpeg", 0.85));
    return new Uint8Array(await blob.arrayBuffer());
  } finally { URL.revokeObjectURL(url); }
}

// Divide o PDF em partes pequenas (por páginas e por tamanho) para caber no limite do servidor.
async function dividirPdf(file) {
  const { PDFDocument } = await import("pdf-lib");
  const bytes = new Uint8Array(await file.arrayBuffer());
  let doc;
  try { doc = await PDFDocument.load(bytes, { ignoreEncryption: true }); }
  catch {
    if (bytes.length <= LIMITE_BYTES_PARTE) return [{ bytes, de: 1, ate: 1, total: 1 }];
    throw new Error("Não consegui abrir este PDF para dividir em partes (ele pode estar protegido).");
  }
  const total = doc.getPageCount();
  if (total <= PAGINAS_POR_PARTE && bytes.length <= LIMITE_BYTES_PARTE) return [{ bytes, de: 1, ate: total, total }];

  const partes = [];
  let i = 0;
  while (i < total) {
    let n = Math.min(PAGINAS_POR_PARTE, total - i);
    for (;;) {
      const novo = await PDFDocument.create();
      const idx = Array.from({ length: n }, (_, k) => i + k);
      (await novo.copyPages(doc, idx)).forEach((p) => novo.addPage(p));
      const out = await novo.save();
      if (out.length <= LIMITE_BYTES_PARTE) { partes.push({ bytes: out, de: i + 1, ate: i + n, total }); break; }
      if (n === 1) throw new Error(`A página ${i + 1} sozinha é grande demais para leitura (provavelmente uma digitalização em altíssima resolução). Tente fotografar essa página com o botão "Fotografar exame".`);
      n = Math.max(1, Math.floor(n / 2));
    }
    i += n;
  }
  return partes;
}

function montarPrompt({ nomesCatalogo, parte }) {
  const trecho = parte.total > 1
    ? `Você está vendo SÓ as páginas ${parte.de} a ${parte.ate} de um laudo com ${parte.total} páginas — extraia tudo o que estiver nestas páginas.`
    : "Percorra o documento INTEIRO, sem pular nenhuma página nem seção.";
  const catalogo = nomesCatalogo.length ? nomesCatalogo.join("; ") : "(nenhum ainda)";
  return `Este documento é um laudo de exames laboratoriais brasileiro. ${trecho}

Ele pode estar em UM de dois formatos:
(A) "unico": laudo de UMA coleta — cada exame tem um único resultado.
(B) "comparativo": quadro histórico/evolutivo em forma de tabela, em que as LINHAS são exames e as COLUNAS são datas de coleta diferentes (ou o inverso). Cada célula é o resultado daquele exame naquela data. NUNCA junte valores de colunas diferentes numa mesma data — cada coluna é uma data separada.

Regras:
- Extraia TODOS os resultados numéricos medidos. Ignore faixas de referência, texto explicativo, dados do paciente/laboratório e assinaturas.
- Datas sempre no formato AAAA-MM-DD. No formato (A), use a data da COLETA (não a de nascimento, impressão ou liberação). Se não houver data de coleta visível nestas páginas, use a chave "sem_data".
- Números usam vírgula decimal ("15,9") — converta para 15.9. Para "Inferior a X" ou "< X", use X. Células vazias ou "-" ficam de fora.
- Se um exame aparecer repetido, inclua só uma vez por data.
- Nomes: quando o exame for o mesmo de um destes nomes que o paciente já usa, escreva EXATAMENTE este nome: ${catalogo}
- Procure ativamente por estes exames comuns (sem se limitar a eles, e sem inventar os que não existirem): ${EXAMES_COMUNS.join("; ")}
- Não invente exames nem valores.

Responda APENAS com JSON compacto, sem markdown e sem texto antes ou depois. "n" = nome, "u" = unidade como aparece no documento, "r" = resultados por data:
{"formato":"comparativo","itens":[{"n":"Hemoglobina","u":"g/dL","r":{"2025-03-10":15.9,"2025-08-02":16.1}}]}`;
}

function parseResposta(raw) {
  const txt = raw.replace(/```json|```/g, "").trim();
  const ini = txt.indexOf("{");
  if (ini < 0) throw new Error("resposta vazia");
  const corpo = txt.slice(ini);
  try { return JSON.parse(corpo.slice(0, corpo.lastIndexOf("}") + 1)); }
  catch {
    // Resposta cortada no meio: aproveita os itens completos até onde deu.
    const corte = corpo.lastIndexOf("}}");
    if (corte < 0) throw new Error("resposta ilegível");
    return JSON.parse(corpo.slice(0, corte + 2) + "]}");
  }
}

async function lerParte(bloco, prompt) {
  const resp = await fetch("/api/claude", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-5", max_tokens: 16000,
      messages: [{ role: "user", content: [bloco, { type: "text", text: prompt }] }],
    }),
  });
  if (resp.status === 413) throw new Error("Uma parte do arquivo ainda ficou grande demais para o servidor.");
  const j = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error((j.error && (j.error.message || j.error)) || `Erro ${resp.status} ao ler o arquivo.`);
  const raw = (j.content || []).map((c) => c.text || "").join("");
  return parseResposta(raw);
}

const normalizar = (s) => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "");

/**
 * Lê um laudo (PDF ou imagem) e devolve os resultados agrupados por data:
 * [{ data: "2025-03-10", itens: [{ nome, valor, unidade }] }]
 */
export async function lerLaudo(file, { nomesCatalogo = [], dataPadrao, onProgresso = () => {} }) {
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  let partes;
  if (isPdf) {
    onProgresso("preparando o arquivo…");
    partes = (await dividirPdf(file)).map((p) => ({
      ...p, bloco: { type: "document", source: { type: "base64", media_type: "application/pdf", data: paraBase64(p.bytes) } },
    }));
  } else {
    const bytes = await comprimirImagem(file);
    partes = [{ de: 1, ate: 1, total: 1, bloco: { type: "image", source: { type: "base64", media_type: "image/jpeg", data: paraBase64(bytes) } } }];
  }

  const resultados = new Array(partes.length);
  const falhas = [];
  let feitas = 0;
  onProgresso(partes.length > 1 ? `lendo parte 0 de ${partes.length}…` : "lendo…");
  let prox = 0;
  async function trabalhador() {
    while (prox < partes.length) {
      const k = prox++;
      const p = partes[k];
      try { resultados[k] = await lerParte(p.bloco, montarPrompt({ nomesCatalogo, parte: p })); }
      catch (e) {
        try { resultados[k] = await lerParte(p.bloco, montarPrompt({ nomesCatalogo, parte: p })); }
        catch { falhas.push(p.total > 1 ? `págs. ${p.de}–${p.ate}` : "arquivo"); console.error(e); }
      }
      feitas++;
      if (partes.length > 1) onProgresso(`lendo parte ${feitas} de ${partes.length}…`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(PARTES_EM_PARALELO, partes.length) }, trabalhador));

  // Descobre a data do laudo (quando for de coleta única) para as partes que não mostram a data.
  const datasReais = new Set();
  resultados.forEach((r) => (r?.itens || []).forEach((it) => Object.keys(it.r || {}).forEach((d) => { if (/^\d{4}-\d{2}-\d{2}$/.test(d)) datasReais.add(d); })));
  const algumComparativo = resultados.some((r) => r?.formato === "comparativo");
  const dataSemData = !algumComparativo && datasReais.size === 1 ? [...datasReais][0] : dataPadrao;

  const porData = {};
  resultados.forEach((r) => (r?.itens || []).forEach((it) => {
    if (!it || !it.n) return;
    Object.entries(it.r || {}).forEach(([d, v]) => {
      const num = typeof v === "number" ? v : Number(String(v).replace(",", "."));
      if (!Number.isFinite(num)) return;
      const data = /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : dataSemData;
      porData[data] = porData[data] || {};
      const chave = normalizar(it.n);
      if (!porData[data][chave]) porData[data][chave] = { nome: it.n, valor: String(num), unidade: it.u || "" };
    });
  }));

  const grupos = Object.keys(porData).sort().map((d) => ({ data: d, itens: Object.values(porData[d]) }));
  return { grupos, falhas, partes: partes.length };
}
