# Quick Sort Arena (versão local)

Jogo de competição para ensinar **Quick Sort** em sala de aula, rodando no seu próprio computador, com banco de dados próprio. Não precisa de internet, conta em nenhum serviço nem instalação de bibliotecas.

## O que você precisa

- [Node.js](https://nodejs.org) 18 ou mais novo.
- Computador do professor e alunos na **mesma rede Wi-Fi**.

## Como iniciar

**No Windows:** dê dois cliques em `iniciar.bat`.

**Em qualquer sistema**, dentro desta pasta:

```bash
node server.js
```

Ao iniciar, o terminal mostra os endereços:

```
Professor (neste computador): http://localhost:3000/#admin
Alunos (mesma rede Wi-Fi):
  http://192.168.0.15:3000
```

- O **professor** abre o endereço com `/#admin` no final.
- Os **alunos** abrem o endereço da rede (o IP do computador do professor) no celular ou no computador deles.

Para encerrar, feche a janela do terminal ou aperte `Ctrl + C`.

## Como usar

1. O professor abre `/#admin`, escolhe o formato da partida (melhor caso, pior caso, tipo de pivô, tamanho do vetor) e clica em **Gerar código da partida**.
2. Mostra o código de 9 números, como `222-333-777`, na tela.
3. Os alunos digitam nome e código e jogam. Ao terminar, o resultado entra sozinho no ranking.
4. O professor acompanha as partidas ao vivo e o ranking, com o pódio dos 3 melhores.
5. Para a próxima rodada: **Limpar ranking**, depois **Limpar código** e gere um código novo.

## Se os alunos não conseguirem abrir o endereço

- **Firewall do Windows:** na primeira execução, o Windows pergunta se o Node.js pode receber conexões. Permita em **Redes privadas**.
- **Wi-Fi da escola:** algumas redes bloqueiam a comunicação entre aparelhos. Nesse caso, ligue o hotspot do celular do professor e conecte o computador e os alunos nele.
- Confira se o endereço usado é o IP mostrado no terminal, com `:3000` no final.

## Banco de dados

Os dados ficam no arquivo `data/db.json`, criado automaticamente na primeira partida. Ele guarda o código ativo, o ranking e as partidas ao vivo.

- Para zerar tudo, feche o servidor e apague a pasta `data`.
- Para guardar o ranking de uma aula, copie o arquivo `data/db.json` antes de limpar.
- Ele é um arquivo de texto, não um banco SQL. Para uma turma de dezenas de alunos funciona bem.

## Configurações opcionais

| Variável    | Para que serve             | Padrão    |
| ----------- | -------------------------- | --------- |
| `PORT`      | Porta do servidor          | `3000`    |
| `ADMIN_PIN` | Senha da tela do professor | sem senha |

No Windows (Prompt de Comando), antes de iniciar:

```
set PORT=3001
set ADMIN_PIN=minhasenha
node server.js
```

Sem `ADMIN_PIN`, qualquer aluno que souber o endereço com `/#admin` acessa a tela do professor e pode limpar o ranking.

## Estrutura

```
quicksort-arena-local/
├── index.html     tela do aluno e tela do professor
├── server.js      servidor e banco de dados em arquivo
├── iniciar.bat    atalho para iniciar no Windows
├── package.json
└── data/          criada sozinha, guarda o banco (db.json)
```

## Como o código de 9 números funciona

Os 5 primeiros dígitos guardam o formato da partida (caso, pivô, tamanho, vetores e perguntas) e os 4 últimos são a semente que gera os vetores. Todos os alunos recebem os mesmos vetores, e resultados de códigos que não são o ativo são recusados.

## Limitações

- A pontuação é calculada no navegador do aluno. Um aluno com conhecimento técnico poderia alterá-la. O painel de partidas ao vivo ajuda a acompanhar.
- Se o mesmo nome aparecer duas vezes na mesma rodada, vale o melhor resultado.
- O melhor e o pior caso valem para pivô último, primeiro ou do meio. Nas demais escolhas de pivô, os vetores são aleatórios.
