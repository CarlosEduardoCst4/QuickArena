# Quick Sort Arena

Jogo de competição para ensinar **Quick Sort** em sala de aula. Cada aluno ordena um vetor inteiro, passo a passo, e disputa um ranking em tempo real. O professor escolhe o formato da partida (melhor caso, pior caso, tipo de pivô) e acompanha tudo por uma tela própria.

> Feito para rodar na [Vercel](https://vercel.com) com um banco Redis gratuito (Upstash). Não usa framework nem etapa de build.

## Recursos

- **Quick Sort completo:** o aluno particiona o vetor e repete o processo em cada lado até tudo ficar na posição final.
- **Pivô, `i` e `j` na tela:** o pivô aparece em destaque, o `j` percorre o trecho e o `i` marca o último número colocado no lado dos menores.
- **Formato escolhido pelo professor:**
  - tipo de caso: aleatório, melhor caso ou pior caso;
  - pivô: último, primeiro, do meio, mediana de três, aleatório ou escolhido pelo aluno;
  - tamanho do vetor, quantidade de vetores e perguntas de teoria.
- **Mesmos vetores para todos:** a partida é gerada a partir do código, então a disputa é justa.
- **Código curto de 9 números**, como `222-333-777`, para digitar rápido.
- **Tela do professor** com partidas ao vivo, ranking com pódio dos 3 melhores e botões para limpar o ranking e o código entre rodadas.
- **Pontuação:** +10 por acerto, −5 por erro, bônus de velocidade e +25 por pergunta de teoria correta. Empates são decididos pelo menor tempo.

## Estrutura do projeto

```
quicksort-arena/
├── index.html      tela do aluno e tela do professor (/#admin)
├── package.json
├── README.md
└── api/
    ├── _lib.js     funções compartilhadas (Redis, PIN, código)
    ├── config.js   professor define e limpa o código da partida
    ├── play.js     aluno envia progresso e resultado final
    └── admin.js    professor lê o ranking e as partidas ao vivo
```

O front-end é um único `index.html` com HTML, CSS e JavaScript puros. O back-end são três funções serverless da Vercel que falam com o Redis pela API REST da Upstash, sem dependências instaladas.

## Como subir na Vercel

1. Faça um fork deste repositório ou coloque a pasta em um repositório seu no GitHub.
2. Na Vercel, clique em **Add New > Project** e importe o repositório. Não é preciso mudar nenhuma configuração de build.
3. Depois do primeiro deploy, abra o projeto, vá em **Storage**, crie um banco **Upstash Redis** (há plano gratuito) e conecte ao projeto. A Vercel adiciona sozinha as variáveis de ambiente do banco.
4. Em **Settings > Environment Variables**, crie a variável `ADMIN_PIN` com o PIN do professor.
5. Em **Deployments**, faça um **Redeploy** para as variáveis passarem a valer.

Também dá para subir pela linha de comando, dentro da pasta do projeto:

```bash
npx vercel
```

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `ADMIN_PIN` | Recomendada | PIN da tela do professor. Se não for definida, o PIN padrão é `prof123`. |
| `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` | Sim | Endereço e token do banco. A integração da Vercel preenche automaticamente. |
| `KV_REST_API_URL` e `KV_REST_API_TOKEN` | Alternativa | Nomes antigos das mesmas variáveis. O projeto aceita os dois pares. |

**Troque o PIN padrão antes de usar com a turma.**

## Como usar

1. O professor abre o endereço do site com `/#admin` no final e entra com o PIN.
2. Escolhe o formato da partida e clica em **Gerar código da partida**.
3. Mostra o código na tela. Os alunos abrem o endereço normal, digitam nome e código e jogam.
4. O professor acompanha as partidas ao vivo e o ranking, que atualizam a cada 4 segundos.
5. Para a próxima rodada, clica em **Limpar ranking** e **Limpar código** e gera um código novo.

Cada código só pode ser usado uma vez por aparelho. Para jogar de novo, o aluno precisa de um código novo.

## Como o código de 9 números funciona

O código guarda o formato da partida e uma semente:

- os 5 primeiros dígitos combinam tipo de caso, pivô, tamanho do vetor, quantidade de vetores e quantidade de perguntas;
- os 4 últimos dígitos são a semente que gera os vetores.

Com o mesmo código, todos os alunos recebem exatamente os mesmos vetores. A semente também identifica a rodada: o servidor recusa resultados de códigos que não são o ativo.

## API

| Rota | Método | Quem usa | O que faz |
|---|---|---|---|
| `/api/play` | `POST` | Aluno | Envia progresso (`type: "live"`) ou resultado final (`type: "final"`). |
| `/api/admin` | `GET` | Professor | Devolve o código ativo, as partidas ao vivo e o ranking. |
| `/api/admin` | `DELETE` | Professor | Limpa o ranking e as partidas ao vivo. |
| `/api/config` | `POST` | Professor | Define o código ativo, ou o limpa quando enviado vazio. |

As rotas do professor exigem o cabeçalho `x-admin-pin`.

Chaves usadas no Redis: `qs:cfg` (código ativo), `qs:res` (resultados finais) e `qs:live` (partidas ao vivo).

## Testar no computador

```bash
npm install -g vercel
vercel link
vercel env pull .env.local
vercel dev
```

Abra `http://localhost:3000`. A tela do professor fica em `http://localhost:3000/#admin`.

## Limitações

- A pontuação é calculada no navegador do aluno. Em sala de aula funciona bem, mas um aluno com conhecimento técnico poderia alterá-la. O painel de partidas ao vivo ajuda a acompanhar.
- Se o mesmo nome aparecer duas vezes na mesma rodada, vale o melhor resultado.
- O melhor e o pior caso valem para pivô último, primeiro ou do meio. Nas demais escolhas de pivô, os vetores são aleatórios.
- O `i` mostrado na tela marca o último número colocado no lado dos menores. Os números não trocam de posição a cada passo, como na partição de Lomuto.

## Licença

Defina aqui a licença do projeto, por exemplo MIT.
