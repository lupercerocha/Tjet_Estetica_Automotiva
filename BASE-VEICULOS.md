# Base de veículos completa e automática

Hoje o app tem 1.834 **modelos base** embarcados: `Tiggo 8`, `Corolla`, `Hilux`.
Depois desta configuração ele passa a ter os **nomes completos da FIPE**:
`Tiggo 8 PRO 1.5 Turbo (Híbrido)`, `Corolla Cross XRE 2.0 16V Flex Aut.` —
cerca de 10 mil, atualizados sozinhos todo mês.

A lista embarcada **não sai do app**. Ela continua sendo a reserva para quando
não há internet, o Supabase está pausado, ou antes de você configurar isto.

---

## Como fica funcionando

| Momento | O que acontece |
|---|---|
| Dia 2 de cada mês, 4h | O Supabase busca a FIPE sozinho e publica a base nova |
| App abre | Usa a base já baixada, guardada no aparelho — sem esperar rede |
| 6s depois de abrir | Confere se há versão nova, **no máximo uma vez por semana** |
| Achou versão nova | Troca em silêncio e avisa: *"Base de veículos atualizada"* |
| Sem internet | Segue com o que tem. Nada trava |
| Botão **Atualizar lista** | Confere na hora, ignorando o prazo de uma semana |

Você não precisa fazer nada depois que configurar. Nem republicar o app.

---

## O que fazer no Supabase

Cerca de 15 minutos, uma vez só. Custo: R$ 0.

### 1. Criar a função

No painel: **Edge Functions → Deploy a new function**

- Nome: **`fipe-sync`** (exatamente assim)
- Cole todo o conteúdo do arquivo **`supabase/fipe-sync.ts`** que veio nesta entrega
- **Deploy**

> A função é grande (~35 KB) porque carrega dentro dela a tabela que classifica
> o porte do veículo — é o que faz o app saber que "Corolla Cross" é SUV e
> "Corolla" é médio, e aplicar a faixa de preço certa. Sem isso todo carro
> entraria como "Médio".

### 2. Liberar a chamada sem login

Ainda na função, aba **Details** (ou **Settings**): desmarque **Verify JWT**.

Sem isso o agendamento do passo 4 recebe 401 e a base nunca atualiza.

### 3. Rodar a primeira vez

Na própria tela da função, botão **Invoke** (ou **Run**).

**Demora de 3 a 5 minutos** — são cerca de 190 consultas à FIPE, uma por marca,
com pausa entre elas para não tomar bloqueio. Espere terminar.

A resposta de sucesso é assim:

```json
{ "ok": true, "versao": 202608, "modelos": 10431, "bytes": 389204 }
```

Se `modelos` vier abaixo de 3.000 a função aborta de propósito e **não publica
nada** — melhor manter a base antiga boa do que gravar uma coleta pela metade.

### 4. Agendar todo mês

Menu **SQL Editor → New query**. Troque `SEUPROJETO` pela sua URL e rode:

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'fipe-mensal',
  '0 4 2 * *',                       -- dia 2 de cada mês, às 4h
  $$
  select net.http_post(
    url := 'https://SEUPROJETO.supabase.co/functions/v1/fipe-sync',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);
```

Para conferir depois que agendou:

```sql
select jobname, schedule, active from cron.job;
```

A FIPE publica a tabela nova sempre no começo do mês, por isso o dia 2.

### 5. Ver no app

Abra a **Entrada** e toque em **Atualizar lista**, ao lado do campo Modelo.
Deve responder *"10.431 modelos · atualizada agora"*.

Digite `tiggo 8` e os nomes completos aparecem.

---

## Sobre o consumo da API

A função usa a API pública da FIPE (parallelum), que dá **500 requisições
gratuitas por dia**. Cada execução gasta cerca de **190** — uma por marca de
carro e de moto, porque a FIPE devolve todos os modelos da marca de uma vez.

Rodando uma vez por mês, o consumo é irrelevante. Mesmo que você aperte
**Invoke** algumas vezes num dia de testes, continua dentro do limite.

Se a API responder 429 (pedindo calma), a função espera e tenta de novo,
até três vezes por marca. Uma marca que falhe de vez é pulada — o resto da
coleta segue normalmente.

---

## Onde a base fica guardada

Numa linha só da tabela `tjet_registros` que você já criou. Não precisa de
tabela nova:

| Coluna | Valor |
|---|---|
| `loja` | `_global` |
| `colecao` | `fipe` |
| `chave` | `base` |
| `dados` | `{ versao, txt, modelos, geradoEm }` |

`loja = '_global'` é de propósito: a base é a mesma para qualquer loja, então
não fica presa a `principal`.

**`versao` é o que decide a troca.** É o ano e mês (`202608`). O app só
substitui se o número for maior que o dele — publicar com número igual ou menor
é ignorado, o que evita voltar atrás por engano.

Para conferir o que está publicado:

```sql
select dados->>'versao' as versao,
       dados->>'modelos' as modelos,
       dados->>'geradoEm' as gerado_em
from tjet_registros
where loja='_global' and colecao='fipe' and chave='base';
```

---

## Se precisar publicar à mão

O formato é uma linha por marca e porte, separado por tabulação:

```
Marca<TAB>PORTE<TAB>Modelo|Modelo|Modelo
```

Códigos de porte: `P` pequeno, `M` médio, `S` SUV, `G` grande, `K` pickup,
`O` moto. O separador dos modelos é o **pipe** (`|`), não vírgula, porque os
nomes da FIPE têm vírgula: `Tiggo 7 1.5, 16V`.

O app também continua entendendo o formato antigo (`Marca|P:Modelo,Modelo`),
então nada quebra.

---

## Segurança

A policy que você rodou na instalação libera escrita para a chave `anon`, e
essa chave fica visível no `config.js`. Na prática, quem tiver o endereço do
app conseguiria alterar a linha da base de veículos.

O estrago possível é pequeno (a próxima execução mensal sobrescreve, e o app
recusa base com menos de 200 modelos), mas se quiser fechar só essa linha:

```sql
create policy tjet_fipe_somente_leitura on tjet_registros
  for update to anon
  using (loja <> '_global');
```

A função continua gravando normalmente, porque ela usa a `service_role`, que
fica guardada no servidor e nunca sai de lá.

---

## Se algo não funcionar

| Sintoma | O que olhar |
|---|---|
| App diz *"sem base na nuvem"* | A função nunca rodou com sucesso — aperte **Invoke** e veja a resposta |
| Função responde 401 | Falta desmarcar **Verify JWT** (passo 2) |
| Função responde *faltam SUPABASE_URL* | Raro: essas variáveis são automáticas. Refaça o deploy |
| `modelos` veio baixo e nada publicou | A FIPE estava instável. Rode de novo mais tarde |
| Agendamento não dispara | Confira `select * from cron.job;` e se as extensões foram criadas |

Em qualquer um desses casos **o atendimento continua normal** — o app usa a
lista embarcada e o atendente também pode digitar o modelo à mão.
