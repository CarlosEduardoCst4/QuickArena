# Quick Sort Arena

Jogo de competição sobre Quick Sort para a turma, com ranking automático.

## Estrutura

```
quicksort-arena/
├── index.html      tela do aluno e tela do professor (/#admin)
├── package.json
├── README.md
└── api/
    ├── _lib.js     funções compartilhadas
    ├── config.js   professor define e limpa o código da partida
    ├── play.js     aluno envia progresso e resultado final
    └── admin.js    professor lê o ranking e as partidas ao vivo
```

## Como subir na Vercel

1. Coloque esta pasta em um repositório do GitHub (ou rode `npx vercel` dentro dela).
2. Na Vercel, clique em **Add New > Project** e importe o repositório. Não precisa mudar nenhuma configuração de build.
3. Depois do primeiro deploy, abra o projeto e vá em **Storage**. Crie um banco **Upstash Redis** (plano gratuito) e conecte ao projeto. A Vercel adiciona sozinha as variáveis de ambiente do banco.
4. Em **Settings > Environment Variables**, crie `ADMIN_PIN` com o PIN que você quiser. Sem ela, o PIN padrão é `prof123`.
5. Em **Deployments**, faça um **Redeploy** para as variáveis valerem.

## Como usar

- **Alunos:** abrem o link do site, digitam nome e código.
- **Professor:** abre o link com `/#admin` no final, entra com o PIN, escolhe o formato e clica em **Gerar código da partida**. Mostre o código de 9 números (ex.: 222-333-777) na tela.
- O ranking e as partidas ao vivo atualizam sozinhos a cada 4 segundos.
- Próxima rodada: **Limpar ranking**, depois **Limpar código** e gere um código novo.

## Testar no computador

```
npm install -g vercel
vercel link
vercel env pull .env.local
vercel dev
```

## Observações

- Cada aluno só consegue enviar resultado com o código da rodada ativa.
- A pontuação é calculada no navegador do aluno. Para uma sala de aula serve bem, mas um aluno técnico poderia alterá-la.
- Se o mesmo nome aparecer duas vezes, vale o melhor resultado.
