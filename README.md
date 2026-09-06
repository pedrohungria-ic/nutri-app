# Nutri · Pedro

App pessoal de nutrição, treino, medições e exames — migrado do artifact do Claude para um projeto React independente.

## Status da migração

- [x] **Passo 1** — Código organizado como projeto React (Vite), builda sem erros.
- [x] **Passo 2** — Banco de dados (Supabase) + login por conta, com dados isolados por usuário.
- [ ] **Passo 3** — Trocar chamadas de IA pela sua própria chave de API.
- [ ] **Passo 4** — Publicar (GitHub + Vercel).
- [ ] **Passo 5** — Domínio próprio e PWA instalável.
- [ ] **Passo 6** — Migrar os dados que já existem hoje.
- [ ] **Passo 7** — Teste final.

**Importante:** neste momento (fim do Passo 2), o login e o salvamento de dados já funcionam de verdade — cada conta só vê os próprios dados. O que ainda não funciona é voz, sugestão de refeição, leitura de exame e código de barras, porque essas partes ainda chamam a API do jeito que funcionava dentro do Claude. Isso é resolvido no Passo 3.

## Configurando o Supabase (uma vez só)

1. Crie uma conta grátis em [supabase.com](https://supabase.com) e um novo projeto.
2. No painel do projeto, vá em **SQL Editor** → **New query**, cole o conteúdo de `supabase/schema.sql` e rode. Isso cria a tabela de dados e as regras de acesso por conta.
3. Em **Project Settings → API**, copie a **Project URL** e a chave **anon public**.
4. Copie `.env.example` para `.env` e cole esses dois valores em `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
5. Em **Authentication → Providers**, confirme que **Email** está habilitado (vem habilitado por padrão) — é o que permite o login por link mágico, sem senha.

## Como funciona o login

O app usa "link mágico": você digita o e-mail, recebe um link, clica e entra — sem senha pra lembrar ou perder. Cada conta de e-mail tem seus próprios dados, completamente isolados das outras (garantido pelas regras criadas no passo 2 do SQL acima, não só pela interface).

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Build de produção

```bash
npm run build
```

Gera a pasta `dist/` pronta pra hospedar.

## Estrutura

```
nutri-app/
├── index.html
├── package.json
├── vite.config.js
├── .env.example       # variáveis de ambiente (preenchidas no Passo 2/3)
└── src/
    ├── main.jsx        # ponto de entrada
    └── App.jsx         # o app inteiro (o mesmo código de dentro do Claude)
```
