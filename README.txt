FINANCEIRO — versão somente Cloudflare

Esta versão foi preparada para usar o Cloudflare Workers + Workers Static Assets + D1.

Arquivos:
- public/index.html = site do Financeiro
- src/index.js = Worker/API + sincronização D1
- wrangler.toml = configuração do Worker e dos arquivos estáticos

Binding D1 esperado:
- variável: FINANCEIO_DB
- banco: financeiro

O navegador usa /state no mesmo domínio do Worker. Não há Netlify, Supabase ou proxy externo.
