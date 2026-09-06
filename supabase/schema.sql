-- Rode isto no painel do Supabase: seu projeto > SQL Editor > New query > colar > Run.
-- Cria a tabela onde TODOS os dados do app ficam (substituindo o window.storage do Claude),
-- e as regras que garantem que cada conta só enxerga os próprios dados.

create table if not exists kv_store (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value text not null,
  updated_at timestamptz not null default now(),
  unique (user_id, key)
);

alter table kv_store enable row level security;

create policy "cada um vê só o seu"
  on kv_store for select
  using (auth.uid() = user_id);

create policy "cada um grava só o seu"
  on kv_store for insert
  with check (auth.uid() = user_id);

create policy "cada um atualiza só o seu"
  on kv_store for update
  using (auth.uid() = user_id);

create policy "cada um apaga só o seu"
  on kv_store for delete
  using (auth.uid() = user_id);

-- Índice para as consultas por usuário+chave (a maioria dos acessos do app).
create index if not exists kv_store_user_key_idx on kv_store (user_id, key);
