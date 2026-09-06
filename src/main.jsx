import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { supabase } from "./supabaseClient.js";
import { instalarStorage } from "./storage.js";
import Login from "./Login.jsx";
import App from "./App.jsx";

function Raiz() {
  const [sessao, setSessao] = useState(undefined); // undefined = ainda carregando

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessao(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

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
