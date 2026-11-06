# QuickSort Arena

Projeto desenvolvido para uma atividade acadêmica sobre o método de ordenação **Quick Sort**. A aplicação funciona como uma pequena competição: os participantes enviam seu progresso e resultado, enquanto o professor pode acompanhar as partidas e consultar o ranking.

O código foi desenvolvido com auxílio do **Claude** e foi utilizado como apoio para a apresentação da atividade.

## Objetivo

Demonstrar o funcionamento do Quick Sort de uma maneira interativa e competitiva, permitindo acompanhar o desempenho dos participantes durante uma rodada.

## Tecnologias e serviços

- **JavaScript (Node.js):** implementação das funções da API.
- **Vercel Functions:** execução dos arquivos como funções serverless.
- **Upstash Redis:** armazenamento dos dados da rodada, do progresso e dos resultados.
- **Claude:** ferramenta de inteligência artificial utilizada como auxílio no desenvolvimento.

## Estrutura dos arquivos

| Arquivo | Responsabilidade |
|---|---|
| `_lib.js` | Reúne funções compartilhadas: comunicação com o Redis, validação do PIN, leitura do corpo das requisições e tratamento dos dados. |
| `config.js` | Permite ao professor definir ou encerrar o código da rodada. |
| `play.js` | Recebe o progresso dos participantes e registra os resultados finais. |
| `admin.js` | Permite consultar o código ativo, partidas em andamento e ranking; também permite limpar os dados de partidas. |
| `package.json` | Contém os metadados e a configuração básica do projeto. |

> **Observação:** este ZIP contém os arquivos da API. Caso exista uma interface visual do jogo, ela não está incluída neste pacote.

## Como funciona

1. O professor configura um código para iniciar uma rodada.
2. Os participantes enviam atualizações de progresso enquanto jogam.
3. Ao terminar, cada participante envia sua pontuação e seu tempo.
4. A API registra o melhor resultado de cada participante.
5. O professor consulta as partidas em andamento e o ranking.
6. Ao encerrar a atividade, o professor pode limpar os registros.

### Regras do ranking

- A pontuação é limitada ao intervalo de 0 a 5000.
- Para o mesmo participante, uma pontuação maior substitui a anterior.
- Em caso de empate na pontuação, o menor tempo é considerado melhor.
- Os dados são associados à rodada ativa por meio de uma semente derivada dos quatro últimos dígitos do código de nove números.

## Configuração para execução

Este projeto foi estruturado para ser publicado na **Vercel**, utilizando o Redis REST da **Upstash**.

### 1. Organize os arquivos

Na estrutura de um projeto Vercel, coloque as funções dentro da pasta `api`:

```text
projeto/
├── api/
│   ├── _lib.js
│   ├── admin.js
│   ├── config.js
│   └── play.js
└── package.json
```

### 2. Configure o banco de dados

Crie um banco Redis no Upstash e obtenha a URL REST e o token de acesso.

Configure as seguintes variáveis de ambiente no projeto da Vercel:

| Variável | Descrição |
|---|---|
| `UPSTASH_REDIS_REST_URL` | URL REST do banco Redis. |
| `UPSTASH_REDIS_REST_TOKEN` | Token de acesso ao Redis. |
| `ADMIN_PIN` | PIN utilizado para autorizar as operações administrativas. |

O código também reconhece `KV_REST_API_URL` e `KV_REST_API_TOKEN` como alternativas para a URL e o token do Redis.

**Segurança:** defina um valor próprio e forte para `ADMIN_PIN` antes de publicar. Se a variável não for configurada, o código utiliza `prof123` como valor padrão. Não compartilhe os tokens do Redis nem o PIN administrativo.

### 3. Publique na Vercel

1. Envie o projeto para um repositório Git.
2. Importe o repositório na Vercel.
3. Cadastre as variáveis de ambiente descritas acima.
4. Faça o deploy.
5. Verifique se as funções estão disponíveis nos caminhos `/api/config`, `/api/play` e `/api/admin`.

## Rotas da API

As rotas abaixo consideram que os arquivos estão dentro da pasta `api`.

| Rota | Método | Uso |
|---|---|---|
| `/api/config` | `POST` | Define ou remove o código da rodada. Requer o PIN administrativo no cabeçalho `x-admin-pin`. |
| `/api/play` | `POST` | Recebe o progresso (`live`) ou o resultado final (`final`) de um participante. |
| `/api/admin` | `GET` | Consulta o código ativo, o progresso das partidas e os resultados da rodada. Requer o PIN administrativo. |
| `/api/admin` | `DELETE` | Apaga os registros de resultados e partidas em andamento. Requer o PIN administrativo. |

### Exemplos de requisição

**Configurar uma rodada** — `POST /api/config`

```json
{
  "code": "123-456-789"
}
```

Envie também o cabeçalho `x-admin-pin` com o PIN administrativo. Para encerrar a rodada, envie um corpo sem o campo `code` ou com `code` vazio.

**Enviar progresso** — `POST /api/play`

```json
{
  "type": "live",
  "r": {
    "n": "Participante",
    "s": 1200,
    "i": 4,
    "t": 35,
    "g": 6789,
    "d": false
  }
}
```

**Enviar resultado final** — `POST /api/play`

```json
{
  "type": "final",
  "r": {
    "n": "Participante",
    "s": 1500,
    "t": 42,
    "g": 6789
  }
}
```

Nos exemplos, `g` representa a semente da rodada: os quatro últimos dígitos do código de nove números, sem considerar os hífens. Portanto, para o código `123-456-789`, o valor de `g` é `6789`.

## Tratamento de erros

A API utiliza códigos HTTP para indicar o resultado das operações. Entre as respostas previstas estão:

- `200`: operação realizada com sucesso.
- `400`: dados ou tipo de operação inválidos.
- `401`: PIN administrativo incorreto.
- `405`: método HTTP não permitido.
- `409`: rodada encerrada ou código da rodada incompatível.
- `500`: erro interno ou falha na comunicação com o Redis.

## Sobre o Quick Sort

O **Quick Sort** é um algoritmo de ordenação baseado na estratégia de divisão e conquista. De forma geral, ele:

1. Escolhe um elemento chamado pivô.
2. Reorganiza os elementos, colocando os menores de um lado e os maiores do outro, conforme a regra de partição utilizada.
3. Aplica o mesmo processo recursivamente às partes resultantes.
4. Conclui a ordenação quando as partes ficam pequenas o suficiente.

Em média, sua complexidade de tempo é **O(n log n)**. No pior caso, pode chegar a **O(n²)**, dependendo das escolhas de pivô e da distribuição dos dados.

## Finalidade acadêmica

Este projeto foi utilizado como recurso de apoio em uma apresentação de atividade sobre o algoritmo Quick Sort. A proposta é tornar o conteúdo mais dinâmico, relacionando o conceito de ordenação com uma experiência prática de participação e comparação de resultados.

---

**Projeto acadêmico — Método de Ordenação Quick Sort**
