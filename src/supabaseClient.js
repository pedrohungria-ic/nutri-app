import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const configFaltando = !url || !anonKey;

if (configFaltando) {
  console.warn(
    "Faltam VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY no arquivo .env — veja .env.example."
  );
}

// Usa valores de placeholder quando faltar configuração, só para não quebrar
// a inicialização do cliente — a tela de aviso (main.jsx) cuida do resto.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder"
);
