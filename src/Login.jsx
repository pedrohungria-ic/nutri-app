import React, { useState } from "react";
import { supabase } from "./supabaseClient.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [proc, setProc] = useState(false);

  async function enviarLink() {
    if (!email.trim()) return;
    setProc(true);
    setErro("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setProc(false);
    if (error) setErro("Não deu para enviar o link. Confira o e-mail e tente de novo.");
    else setEnviado(true);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F6FA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 340,
          background: "#fff",
          borderRadius: 18,
          padding: 28,
          boxShadow: "0 6px 24px rgba(27,37,89,.08)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            background: "#FFE8ED",
            color: "#D31E43",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 22,
            margin: "0 auto 16px",
          }}
        >
          N
        </div>
        <div style={{ fontSize: 19, fontWeight: 800, color: "#1B2559", marginBottom: 6 }}>Nutri</div>
        <div style={{ fontSize: 13, color: "#7C87A3", marginBottom: 22, lineHeight: 1.5 }}>
          Entre com seu e-mail. A gente manda um link — sem senha pra lembrar.
        </div>

        {enviado ? (
          <div style={{ fontSize: 13.5, color: "#1B2559", lineHeight: 1.6, padding: "8px 0" }}>
            Link enviado para <b>{email}</b>. Abra seu e-mail neste mesmo aparelho e toque no link para entrar.
          </div>
        ) : (
          <>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviarLink()}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1.5px solid #EDEFF5",
                fontSize: 14,
                marginBottom: 12,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            {erro && <div style={{ fontSize: 12.5, color: "#D31E43", marginBottom: 12 }}>{erro}</div>}
            <button
              onClick={enviarLink}
              disabled={proc || !email.trim()}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: 0,
                background: "#F5385D",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14.5,
                cursor: "pointer",
                opacity: proc || !email.trim() ? 0.6 : 1,
              }}
            >
              {proc ? "enviando…" : "Enviar link de acesso"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
