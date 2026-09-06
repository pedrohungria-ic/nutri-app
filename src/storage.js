import { supabase } from "./supabaseClient.js";

// Reproduz a mesma "forma" do window.storage que existia dentro do Claude
// (get/set/delete com a mesma assinatura), só que gravando no Supabase e
// sempre amarrado ao usuário autenticado — é isso que garante que os dados
// de uma conta nunca aparecem para outra.

async function usuarioAtual() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) throw new Error("Usuário não autenticado.");
  return data.user.id;
}

export function instalarStorage() {
  window.storage = {
    async get(key) {
      const user_id = await usuarioAtual();
      const { data, error } = await supabase
        .from("kv_store")
        .select("value")
        .eq("user_id", user_id)
        .eq("key", key)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return { key, value: data.value, shared: false };
    },

    async set(key, value) {
      const user_id = await usuarioAtual();
      const { error } = await supabase
        .from("kv_store")
        .upsert(
          { user_id, key, value, updated_at: new Date().toISOString() },
          { onConflict: "user_id,key" }
        );
      if (error) throw error;
      return { key, value, shared: false };
    },

    async delete(key) {
      const user_id = await usuarioAtual();
      const { error } = await supabase
        .from("kv_store")
        .delete()
        .eq("user_id", user_id)
        .eq("key", key);
      if (error) throw error;
      return { key, deleted: true, shared: false };
    },
  };
}
