# Nutri · Pedro

App pessoal de nutrição, treino, medições e exames — migrado do artifact do Claude para um projeto React independente.

## Status da migração

- [x] **Passo 1** — Código organizado como projeto React (Vite), builda sem erros.
- [x] **Passo 2** — Banco de dados (Supabase) + login por conta, com dados isolados por usuário.
- [x] **Passo 3** — Chave da Anthropic escondida numa função-servidor (nunca exposta ao navegador).
- [ ] **Passo 4** — Publicar (GitHub + Vercel).
- [ ] **Passo 5** — Domínio próprio e PWA instalável.
- [ ] **Passo 6** — Migrar os dados que já existem hoje.
- [ ] **Passo 7** — Teste final.

**Importante:** neste momento (fim do Passo 3), todas as partes que dependiam da API do Claude — voz, sugestão de refeição, leitura de exame, código de barras — já usam sua própria chave, escondida no servidor. Mas isso só funciona **depois de publicado na Vercel** (Passo 4); rodando só com `npm run dev` no seu computador, essas funções ainda vão dar erro, porque a função-servidor (`api/claude.js`) só roda de verdade no ambiente da Vercel. Ver seção abaixo se quiser testar isso localmente antes de publicar.

## Configurando a chave da Anthropic (uma vez só)

1. Crie uma conta em [console.anthropic.com](https://console.anthropic.com) — é separada da sua conta do claude.ai, não compartilha nada.
2. Em **Settings → Billing**, adicione um cartão e carregue um saldo (mínimo US$5).
3. Em **API Keys**, crie uma chave nova.
4. Copie `.env.example` para `.env` (se ainda não tiver feito) e cole a chave na linha `ANTHROPIC_API_KEY=` — **sem** o prefixo `VITE_`. Isso é intencional: variáveis com `VITE_` ficam visíveis no navegador; esta aqui só a função-servidor lê.
5. Quando publicar na Vercel (Passo 4), essa mesma variável precisa ser adicionada lá também, no painel do projeto — o `.env` local não viaja com o código.

### Testando localmente com a função-servidor (opcional)

O comando `npm run dev` sozinho não roda a pasta `api/`. Se quiser testar voz e leitura de exame **antes** de publicar, use o CLI da Vercel:

```bash
npm install -g vercel
vercel dev
```

Ele pede pra logar e "linkar" a pasta ao projeto na Vercel (só na primeira vez), e aí sim roda tudo junto — front-end e função-servidor — localmente. Se preferir, pode pular isso e testar só depois de publicado; as funções da Vercel funcionam automaticamente lá.

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
