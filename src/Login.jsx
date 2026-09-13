import React, { useState } from "react";
import { supabase } from "./supabaseClient.js";
import Logo from "./Logo.jsx";

const campoStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1.5px solid #EDEFF5",
  fontSize: 14,
  marginBottom: 10,
  boxSizing: "border-box",
  outline: "none",
  fontFamily: "inherit",
};

export default function Login() {
  const [tela, setTela] = useState("login"); // "login" | "cadastro"
  const [modoLogin, setModoLogin] = useState("senha"); // "senha" | "link"

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [confirmarEmail, setConfirmarEmail] = useState(false);
  const [erro, setErro] = useState("");
  const [proc, setProc] = useState(false);

  // campos extras de cadastro
  const [nome, setNome] = useState("");
  const [confSenha, setConfSenha] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [genero, setGenero] = useState("");
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const [telDigitos, setTelDigitos] = useState("55");

  function maskTelefone(digitosBrutos) {
    const d = String(digitosBrutos || "").replace(/\D/g, "").slice(0, 13);
    let out = "+" + d.slice(0, 2);
    if (d.length > 2) out += " (" + d.slice(2, 4);
    if (d.length >= 4) out += ")";
    if (d.length > 4) out += " " + d.slice(4, 9);
    if (d.length > 9) out += "-" + d.slice(9, 13);
    return out;
  }

  async function entrarComSenha() {
    if (!email.trim() || !senha) return;
    setProc(true); setErro("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setProc(false);
    if (error) setErro("E-mail ou senha incorretos.");
  }

  async function enviarLink() {
    if (!email.trim()) return;
    setProc(true); setErro("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setProc(false);
    if (error) setErro("Não deu para enviar o link. Confira o e-mail e tente de novo.");
    else setEnviado(true);
  }

  async function entrarComGoogle() {
    setErro("");
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
    if (error) setErro("Login com Google não está disponível ainda nesta conta.");
  }

  async function criarConta() {
    if (!nome.trim() || !email.trim() || !senha) { setErro("Preencha nome, e-mail e senha."); return; }
    if (senha.length < 6) { setErro("A senha precisa ter pelo menos 6 caracteres."); return; }
    if (senha !== confSenha) { setErro("As senhas não são iguais."); return; }
    setProc(true); setErro("");
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          nome: nome.trim(),
          nascimento: nascimento || null,
          genero: genero || null,
          altura_cm: altura ? Number(altura) : null,
          peso_kg: peso ? Number(peso) : null,
          telefone: telDigitos.length > 2 ? maskTelefone(telDigitos) : null,
        },
      },
    });
    setProc(false);
    if (error) { setErro(error.message.includes("already") ? "Já existe uma conta com esse e-mail." : "Não foi possível criar a conta agora."); return; }
    if (data.session) return; // já entra direto (confirmação de e-mail desativada no projeto)
    setConfirmarEmail(true);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "auto",
        background: "linear-gradient(160deg,#1B2559 0%,#2A2F7A 45%,#F5385D 130%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div style={{ position: "fixed", top: -80, left: -60, width: 260, height: 260, borderRadius: 999, background: "rgba(245,56,93,.28)", filter: "blur(50px)" }} />
      <div style={{ position: "fixed", bottom: -100, right: -70, width: 300, height: 300, borderRadius: 999, background: "rgba(123,97,255,.28)", filter: "blur(60px)" }} />
      <div style={{ position: "fixed", top: "38%", right: "8%", width: 140, height: 140, borderRadius: 999, background: "rgba(255,255,255,.08)", filter: "blur(30px)" }} />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 360,
          background: "rgba(255,255,255,.97)",
          borderRadius: 22,
          padding: 30,
          margin: "24px 0",
          boxShadow: "0 20px 60px rgba(0,0,0,.35)",
          textAlign: "center",
        }}
      >
        <div style={{ margin: "0 auto 14px" }}><Logo size={60} /></div>
        <div style={{ fontSize: 21, fontWeight: 800, color: "#1B2559", marginBottom: 3, letterSpacing: "-.02em" }}>MyFitPath</div>
        <div style={{ fontSize: 13, color: "#7C87A3", marginBottom: 22, lineHeight: 1.5 }}>
          {tela === "login"
            ? (modoLogin === "senha" ? "Entre com seu e-mail e senha." : "Sem senha pra lembrar — a gente manda um link.")
            : "Conte um pouco sobre você pra começar."}
        </div>

        {confirmarEmail ? (
          <div style={{ fontSize: 13.5, color: "#1B2559", lineHeight: 1.6, padding: "8px 0" }}>
            Quase lá! Enviamos um link de confirmação para <b>{email}</b>. Abra seu e-mail e toque nele pra ativar a conta.
          </div>
        ) : enviado ? (
          <div style={{ fontSize: 13.5, color: "#1B2559", lineHeight: 1.6, padding: "8px 0" }}>
            Link enviado para <b>{email}</b>. Abra seu e-mail neste mesmo aparelho e toque no link para entrar.
          </div>
        ) : tela === "login" ? (
          <>
            <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (modoLogin === "senha" ? entrarComSenha() : enviarLink())} style={campoStyle} />
            {modoLogin === "senha" && (
              <input type="password" placeholder="sua senha" value={senha} onChange={(e) => setSenha(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && entrarComSenha()} style={campoStyle} />
            )}
            {erro && <div style={{ fontSize: 12.5, color: "#D31E43", marginBottom: 10, textAlign: "left" }}>{erro}</div>}
            <button onClick={modoLogin === "senha" ? entrarComSenha : enviarLink}
              disabled={proc || !email.trim() || (modoLogin === "senha" && !senha)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: 0, background: "linear-gradient(135deg,#F5385D,#D31E43)", color: "#fff", fontWeight: 600, fontSize: 14.5, cursor: "pointer", opacity: proc || !email.trim() || (modoLogin === "senha" && !senha) ? 0.6 : 1, marginBottom: 12 }}>
              {proc ? "entrando…" : modoLogin === "senha" ? "Entrar" : "Enviar link de acesso"}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "14px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#EDEFF5" }} /><span style={{ fontSize: 11, color: "#A9B1C6" }}>ou</span><div style={{ flex: 1, height: 1, background: "#EDEFF5" }} />
            </div>
            <button onClick={entrarComGoogle} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #EDEFF5", background: "#fff", color: "#1B2559", fontWeight: 600, fontSize: 13.5, cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
              <svg width="17" height="17" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.3c0-.85-.08-1.66-.22-2.44H12v4.62h6.46c-.28 1.5-1.13 2.78-2.4 3.63v3h3.88c2.27-2.1 3.56-5.2 3.56-8.81z" /><path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.94-2.9l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1C3.24 21.3 7.3 24 12 24z" /><path fill="#FBBC05" d="M5.27 14.29c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29v-3.1H1.27C.46 8.19 0 10.04 0 12s.46 3.81 1.27 5.39l4-3.1z" /><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.3 0 3.24 2.7 1.27 6.61l4 3.1C6.22 6.86 8.87 4.75 12 4.75z" /></svg>
              Continuar com Google
            </button>

            <button onClick={() => { setModoLogin(modoLogin === "senha" ? "link" : "senha"); setErro(""); }}
              style={{ background: "transparent", border: 0, color: "#7C87A3", fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "block", margin: "0 auto 10px" }}>
              {modoLogin === "senha" ? "prefiro entrar por link no e-mail" : "prefiro entrar com senha"}
            </button>
            <button onClick={() => { setTela("cadastro"); setErro(""); }}
              style={{ background: "transparent", border: 0, color: "#F5385D", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              ainda não tenho conta — criar agora
            </button>
          </>
        ) : (
          <>
            <input placeholder="nome completo" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="off" style={campoStyle} />
            <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={campoStyle} />
            <div style={{ display: "flex", gap: 8 }}>
              <input type="password" placeholder="senha" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="new-password" style={{ ...campoStyle, flex: 1 }} />
              <input type="password" placeholder="confirmar" value={confSenha} onChange={(e) => setConfSenha(e.target.value)} autoComplete="new-password" style={{ ...campoStyle, flex: 1 }} />
            </div>

            <div style={{ textAlign: "left", fontSize: 11, fontWeight: 700, color: "#7C87A3", margin: "10px 0 5px" }}>Data de nascimento</div>
            <input type="date" value={nascimento} onChange={(e) => setNascimento(e.target.value)} style={campoStyle} />

            <div style={{ textAlign: "left", fontSize: 11, fontWeight: 700, color: "#7C87A3", margin: "4px 0 5px" }}>Gênero</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {[["m", "Masculino"], ["f", "Feminino"], ["o", "Outro"]].map(([k, lb]) => (
                <button key={k} type="button" onClick={() => setGenero(k)}
                  style={{ flex: 1, padding: "9px 4px", borderRadius: 9, fontSize: 12, fontWeight: 700, border: "1.5px solid " + (genero === k ? "#F5385D" : "#EDEFF5"), background: genero === k ? "#FFE8ED" : "#fff", color: genero === k ? "#D31E43" : "#7C87A3" }}>
                  {lb}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#7C87A3", marginBottom: 5 }}>Altura (cm)</div>
                <input inputMode="numeric" placeholder="178" value={altura} onChange={(e) => setAltura(e.target.value.replace(/\D/g, ""))} autoComplete="off" style={campoStyle} />
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#7C87A3", marginBottom: 5 }}>Peso atual (kg)</div>
                <input inputMode="decimal" placeholder="82" value={peso} onChange={(e) => setPeso(e.target.value.replace(",", ".").replace(/[^\d.]/g, ""))} autoComplete="off" style={campoStyle} />
              </div>
            </div>

            <div style={{ textAlign: "left", fontSize: 11, fontWeight: 700, color: "#7C87A3", margin: "10px 0 5px" }}>Celular (opcional)</div>
            <input inputMode="numeric" placeholder="+55 (11) 98765-4321" value={maskTelefone(telDigitos)}
              onChange={(e) => setTelDigitos(e.target.value.replace(/\D/g, ""))} style={campoStyle} />

            {erro && <div style={{ fontSize: 12.5, color: "#D31E43", margin: "8px 0", textAlign: "left" }}>{erro}</div>}

            <button onClick={criarConta} disabled={proc}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: 0, background: "linear-gradient(135deg,#F5385D,#D31E43)", color: "#fff", fontWeight: 600, fontSize: 14.5, cursor: "pointer", opacity: proc ? 0.6 : 1, marginTop: 6, marginBottom: 12 }}>
              {proc ? "criando…" : "Criar minha conta"}
            </button>

            <button onClick={() => { setTela("login"); setErro(""); }}
              style={{ background: "transparent", border: 0, color: "#7C87A3", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
              já tenho conta — entrar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
