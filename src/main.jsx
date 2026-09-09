import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { supabase, configFaltando } from "./supabaseClient.js";
import { instalarStorage } from "./storage.js";
import Login from "./Login.jsx";
import App from "./App.jsx";

function AvisoConfig() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "sans-serif", background: "#F5F6FA" }}>
      <div style={{ maxWidth: 420, background: "#fff", borderRadius: 16, padding: 26, boxShadow: "0 6px 24px rgba(27,37,89,.08)" }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#1B2559", marginBottom: 10 }}>Falta configurar o .env</div>
        <div style={{ fontSize: 13.5, color: "#4A5568", lineHeight: 1.6 }}>
          O arquivo <code>.env</code> não está com <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> preenchidos.
          <br /><br />
          1. Copie <code>.env.example</code> e renomeie a cópia para <code>.env</code><br />
          2. Cole a URL e a chave "Publishable" do seu projeto Supabase (Project Settings → API Keys)<br />
          3. Salve o arquivo, pare o servidor (Ctrl+C no terminal) e rode <code>npm run dev</code> de novo
        </div>
      </div>
    </div>
  );
}

function Raiz() {
  const [sessao, setSessao] = useState(undefined); // undefined = ainda carregando

  useEffect(() => {
    if (configFaltando) return;
    supabase.auth.getSession().then(({ data }) => setSessao(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (configFaltando) return <AvisoConfig />;

  if (sessao === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#7C87A3", fontFamily: "sans-serif" }}>
        carregando…
      </div>
    );
  }

  if (!sessao) return <Login />;

  instalarStorage();

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => supabase.auth.signOut()}
        style={{
          position: "fixed", top: 10, right: 10, zIndex: 999,
          background: "rgba(27,37,89,.06)", border: 0, borderRadius: 999,
          padding: "6px 12px", fontSize: 11, color: "#7C87A3", cursor: "pointer",
        }}
      >
        sair
      </button>
      <App />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Raiz />
  </React.StrictMode>
);
