-- Rode isto no Supabase: SQL Editor > New query > colar > Run.
-- Cria o repositório privado "arquivos" (usado por Perfil → Meus arquivos e pelos laudos de exame)
-- e as regras que garantem que cada conta só acessa a própria pasta.

insert into storage.buckets (id, name, public, file_size_limit)
values ('arquivos', 'arquivos', false, 52428800)
on conflict (id) do nothing;

create policy "arquivos: ver os seus"
  on storage.objects for select to authenticated
  using (bucket_id = 'arquivos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "arquivos: enviar os seus"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'arquivos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "arquivos: atualizar os seus"
  on storage.objects for update to authenticated
  using (bucket_id = 'arquivos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "arquivos: apagar os seus"
  on storage.objects for delete to authenticated
  using (bucket_id = 'arquivos' and (storage.foldername(name))[1] = auth.uid()::text);
