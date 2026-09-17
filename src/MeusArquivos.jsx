import React, { useState } from "react";
import { supabase } from "./supabaseClient.js";

export const BUCKET = "arquivos";
export const PASTA_EXAMES = "exames-sangue";

const novoId = () => Math.random().toString(36).slice(2, 10);

export function indiceArquivos(data) {
  const a = (data && data.arquivos) || {};
  const pastas = a.pastas || [];
  const fixa = { id: PASTA_EXAMES, nome: "Exames de sangue", fixa: true };
  return {
    pastas: pastas.some((p) => p.id === PASTA_EXAMES) ? pastas : [fixa, ...pastas],
    itens: a.itens || [],
  };
}

function erroAmigavel(e) {
  const m = String((e && (e.message || e.error)) || e || "");
  if (/bucket not found/i.test(m)) return "O repositório de arquivos ainda não foi criado no Supabase (rode o supabase/storage.sql).";
  if (/row-level security|unauthorized|403/i.test(m)) return "O Supabase recusou o envio — confira se as regras do supabase/storage.sql foram aplicadas.";
  if (/exceeded|too large|413/i.test(m)) return "Arquivo grande demais (limite de 50 MB).";
  return "Não foi possível enviar o arquivo agora.";
}

export async function enviarArquivo(file, pastaId, extra = {}) {
  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) throw new Error("Usuário não autenticado.");
  const seguro = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w.-]+/g, "_").slice(-80);
  const path = `${u.user.id}/${pastaId}/${Date.now()}-${seguro}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type || "application/octet-stream" });
  if (error) throw error;
  return { id: novoId(), pastaId, nome: file.name, path, tipo: file.type || "", tamanho: file.size, criadoEm: new Date().toISOString(), ...extra };
}

export async function removerArquivosStorage(paths) {
  if (!paths.length) return;
  for (let i = 0; i < paths.length; i += 100) await supabase.storage.from(BUCKET).remove(paths.slice(i, i + 100));
}

async function abrir(item) {
  const janela = window.open("", "_blank"); // abre já no toque, senão o iPhone bloqueia
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(item.path, 600);
  if (error || !data) { if (janela) janela.close(); throw error || new Error("sem link"); }
  if (janela) janela.location.href = data.signedUrl;
  else window.location.href = data.signedUrl;
}

const tamanho = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const icone = (t, nome) => (/pdf/.test(t) || /\.pdf$/i.test(nome) ? "📄" : /^image\//.test(t) ? "🖼️" : "📎");
const dataCurta = (s) => new Date(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

export default function MeusArquivos({ data, persist, flash }) {
  const [aberto, setAberto] = useState(false);
  const [pastaId, setPastaId] = useState(null);
  const [novaPasta, setNovaPasta] = useState(null);
  const [enviando, setEnviando] = useState("");
  const [erro, setErro] = useState("");
  const [acoes, setAcoes] = useState(null);

  const idx = indiceArquivos(data);
  const pasta = idx.pastas.find((p) => p.id === pastaId);
  const itensPasta = idx.itens.filter((i) => i.pastaId === pastaId).sort((a, b) => (b.criadoEm || "").localeCompare(a.criadoEm || ""));
  const salvarIdx = (novo) => persist({ ...data, arquivos: novo });

  async function adicionar(files) {
    setErro("");
    const novos = [];
    for (let k = 0; k < files.length; k++) {
      setEnviando(`enviando ${k + 1} de ${files.length}…`);
      try { novos.push(await enviarArquivo(files[k], pastaId)); }
      catch (e) { setErro(erroAmigavel(e)); break; }
    }
    setEnviando("");
    if (novos.length) { salvarIdx({ ...idx, itens: [...idx.itens, ...novos] }); flash(`${novos.length} arquivo(s) guardado(s)`); }
  }

  function criarPasta() {
    const nome = (novaPasta || "").trim();
    if (!nome) return;
    const p = { id: novoId(), nome };
    salvarIdx({ ...idx, pastas: [...idx.pastas, p] });
    setNovaPasta(null);
  }

  async function excluirItem(it) {
    if (!window.confirm(`Excluir "${it.nome}"?`)) return;
    try { await removerArquivosStorage([it.path]); } catch { /* segue e limpa o índice */ }
    salvarIdx({ ...idx, itens: idx.itens.filter((x) => x.id !== it.id) });
    setAcoes(null);
  }

  async function excluirPasta() {
    const n = itensPasta.length;
    if (!window.confirm(n ? `Excluir a pasta "${pasta.nome}" e os ${n} arquivo(s) dentro dela?` : `Excluir a pasta "${pasta.nome}"?`)) return;
    try { await removerArquivosStorage(itensPasta.map((i) => i.path)); } catch { /* segue */ }
    salvarIdx({ pastas: idx.pastas.filter((p) => p.id !== pastaId), itens: idx.itens.filter((i) => i.pastaId !== pastaId) });
    setPastaId(null);
  }

  function mover(it, destino) {
    // O caminho no storage continua o mesmo; a pasta é organização do índice.
    salvarIdx({ ...idx, itens: idx.itens.map((x) => (x.id === it.id ? { ...x, pastaId: destino } : x)) });
    setAcoes(null);
    flash("Arquivo movido");
  }

  return (
    <div className="strip" style={{ marginBottom: 11 }}>
      <button className="stripBtn" onClick={() => setAberto(!aberto)}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 14 }}>📁</span>
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>Meus arquivos</span>
          <span className="pill" style={{ background: "var(--rule)", color: "var(--ink2)" }}>{idx.itens.length}</span>
        </div>
        <span style={{ color: "var(--ink3)", fontSize: 12 }}>{aberto ? "▲" : "▼"}</span>
      </button>

      {aberto && !pasta && (
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {idx.pastas.map((p) => {
              const n = idx.itens.filter((i) => i.pastaId === p.id).length;
              return (
                <button key={p.id} onClick={() => { setPastaId(p.id); setErro(""); }}
                  style={{ textAlign: "left", padding: "11px 12px", borderRadius: 12, border: "1.5px solid var(--rule)", background: "var(--surface)", color: "var(--ink)" }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{p.fixa ? "🩸" : "🗂️"}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nome}</div>
                  <div className="eb">{n} arquivo{n === 1 ? "" : "s"}</div>
                </button>
              );
            })}
          </div>
          {novaPasta == null ? (
            <button className="ghost" style={{ width: "100%", marginTop: 9 }} onClick={() => setNovaPasta("")}>+ Nova pasta</button>
          ) : (
            <div style={{ display: "flex", gap: 6, marginTop: 9 }}>
              <input autoFocus placeholder="Nome da pasta" value={novaPasta} onChange={(e) => setNovaPasta(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && criarPasta()} style={{ flex: 1, fontSize: 13.5 }} />
              <button className="ghost" onClick={criarPasta} disabled={!novaPasta.trim()}>criar</button>
              <button className="mini" onClick={() => setNovaPasta(null)}>✕</button>
            </div>
          )}
        </div>
      )}

      {aberto && pasta && (
        <div style={{ marginTop: 10 }}>
          <div className="row" style={{ marginBottom: 9 }}>
            <button className="mini" style={{ paddingLeft: 0 }} onClick={() => { setPastaId(null); setAcoes(null); }}>← pastas</button>
            {!pasta.fixa && <button className="mini" style={{ color: "var(--coral-d)", fontSize: 12.5 }} onClick={excluirPasta}>excluir pasta</button>}
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 9 }}>{pasta.fixa ? "🩸" : "🗂️"} {pasta.nome}</div>

          <label className="cta" style={{ display: "block", textAlign: "center", marginBottom: 10, opacity: enviando ? 0.6 : 1 }}>
            {enviando || "Adicionar arquivo"}
            <input type="file" multiple accept="application/pdf,image/*" style={{ display: "none" }} disabled={!!enviando}
              onChange={(e) => { const f = Array.from(e.target.files || []); e.target.value = ""; if (f.length) adicionar(f); }} />
          </label>
          {pasta.fixa && <div className="eb" style={{ marginBottom: 10, lineHeight: 1.5 }}>Os laudos lidos em Evolução → Exames são guardados aqui automaticamente.</div>}
          {erro && <div className="card" style={{ padding: 11, marginBottom: 10, fontSize: 12, color: "var(--coral-d)", background: "var(--coral-s)" }}>{erro}</div>}

          {itensPasta.length === 0 && <div className="eb" style={{ padding: "6px 0" }}>Nenhum arquivo nesta pasta ainda.</div>}
          {itensPasta.map((it, i) => (
            <div key={it.id} style={{ borderTop: i ? "1px solid var(--rule)" : 0, padding: "9px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <button onClick={() => abrir(it).catch(() => setErro("Não consegui abrir este arquivo agora."))}
                  style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 9, background: "transparent", padding: 0, textAlign: "left", color: "var(--ink)" }}>
                  <span style={{ fontSize: 20 }}>{icone(it.tipo, it.nome)}</span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.nome}</span>
                    <span className="eb">{dataCurta(it.criadoEm)} · {tamanho(it.tamanho || 0)}{it.exameDatas && it.exameDatas.length ? ` · exame de ${it.exameDatas.length > 1 ? `${it.exameDatas.length} datas` : it.exameDatas[0].split("-").reverse().join("/")}` : ""}</span>
                  </span>
                </button>
                <button className="mini" aria-label="Opções" onClick={() => setAcoes(acoes === it.id ? null : it.id)}>⋯</button>
              </div>
              {acoes === it.id && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                  {idx.pastas.filter((p) => p.id !== pastaId).map((p) => (
                    <button key={p.id} className="chip" onClick={() => mover(it, p.id)}>mover p/ {p.nome}</button>
                  ))}
                  <button className="chip" style={{ color: "var(--coral-d)" }} onClick={() => excluirItem(it)}>excluir</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
