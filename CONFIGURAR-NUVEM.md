# Colocar o T-Jet na nuvem

**Você faz isso uma vez só, no computador.** Depois todo celular que abrir o app
já vem conectado — igual ao Escala da Liturgia.

Tempo: cerca de 10 minutos. Custo: R$ 0.

---

## Parte 1 — No Supabase (uma vez na vida)

### 1. Criar a conta

**https://supabase.com/dashboard/sign-up**

GitHub ou e-mail e senha, tanto faz.

### 2. Criar a organização

| Campo | O que colocar |
|---|---|
| Name | `T-Jet` |
| Type | Personal |
| Plan | **Free** |

### 3. Criar o projeto

Botão **New project**.

| Campo | O que colocar |
|---|---|
| Name | `tjet` |
| Database Password | Gere e guarde num lugar seguro |
| Region | **South America (São Paulo)** |

Leva 1 a 2 minutos para subir.

### 4. Criar a tabela

Menu lateral **SQL Editor → New query**. Cole o SQL abaixo e clique em **Run**.
Deve aparecer *Success. No rows returned*.

```sql
create table if not exists tjet_registros (
  loja           text        not null,
  colecao        text        not null,
  chave          text        not null,
  dados          jsonb       not null,
  atualizado_em  timestamptz not null default now(),
  primary key (loja, colecao, chave)
);

create index if not exists tjet_registros_busca
  on tjet_registros (loja, colecao, atualizado_em desc);

alter table tjet_registros enable row level security;

drop policy if exists tjet_acesso on tjet_registros;
create policy tjet_acesso on tjet_registros
  for all to anon using (true) with check (true);
```

(O mesmo SQL está no app em **Admin → Nuvem → Ver SQL**, com botão de copiar.)

### 5. Copiar as credenciais

Engrenagem **Project Settings → API**. Você precisa de dois valores:

- **Project URL** — algo como `https://abcdefgh.supabase.co`
- **Project API keys → `anon` `public`** — chave longa começando com `eyJ`

> ⚠️ Use a **`anon`**. A `service_role` dá acesso total e nunca deve sair do servidor.

---

## Parte 2 — No arquivo config.js (uma vez também)

Abra o `config.js` num editor de texto e preencha:

```js
var TJET_CONFIG = {

  lavajato: {
    nome: 'T-Jet Estética Automotiva',
    tel:  '5583999990000'
  },

  nuvem: {
    ativa:       true,
    url:         'https://abcdefgh.supabase.co',
    chave:       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    loja:        'principal',
    enviarFotos: false,
    auto:        true
  },

  ocr: {
    provedor: 'local',
    token:    '',
    endpoint: ''
  }

};
```

Suba o `config.js` junto com os outros arquivos no GitHub Pages.

**Pronto. Acabou.**

---

## Nos celulares: nada

Abra o endereço do app em qualquer aparelho. Ele já vem conectado — o selo ao lado
da versão, na tela inicial, mostra **na nuvem**.

Nenhuma URL para digitar, nenhuma chave para colar, nenhum passo a repetir.

Em **Admin → Nuvem** os campos aparecem travados com o aviso *"Configurado pelo
arquivo config.js"*. Isso é proposital: assim nenhum aparelho fica apontando para
um lugar diferente por engano.

**Para trocar de projeto depois:** edite o `config.js`, suba de novo, e todos os
aparelhos mudam juntos na próxima abertura.

---

## Leitura de placa por API (opcional)

Mesmo arquivo, seção `ocr`. Crie conta em
[app.platerecognizer.com](https://app.platerecognizer.com) — 2.500 leituras
gratuitas por mês — e preencha:

```js
  ocr: {
    provedor: 'platerecognizer',
    token:    'seu_token_aqui',
    endpoint: ''
  }
```

Quando a API está ligada, ela é consultada primeiro. **Se falhar por qualquer
motivo — sem rede, cota estourada, token errado — o leitor local assume na hora.**
O atendimento não para.

---

## O que saber do plano gratuito

| | Free |
|---|---|
| Banco de dados | 500 MB |
| Requisições | ilimitadas |
| Backup automático | **não tem** |
| Pausa por inatividade | **após 1 semana sem uso** |
| Projetos ativos | 2 |

**Pausa após 7 dias.** Um lava jato que abre todo dia nunca chega perto. Mas se
você configurar hoje e só voltar em duas semanas, o projeto pausa e precisa ser
religado à mão no painel. Os dados não se perdem.

**Não existe backup automático.** A nuvem protege contra perder o celular, não
contra apagar algo por engano. **Continue exportando o JSON** em Admin → Dados uma
vez por semana.

**Fotos.** Uma foto vira ~100 KB codificada. Quinze carros por dia com duas fotos
dão 78 MB por mês: os 500 MB acabam em seis meses. Por isso `enviarFotos` vem
como `false` — as fotos ficam no aparelho e todo o resto sincroniza. As
**assinaturas sempre sobem**, porque são pequenas e é o que tem valor de prova.

---

## Segurança

A policy acima libera leitura e escrita para a chave `anon`, e a chave fica visível
no `config.js` — que é público no GitHub Pages. Adequado **se o endereço do app não
circular**, mas quem tiver o link consegue ler os dados.

Para fechar, é login por e-mail e senha: trocar `to anon` por `to authenticated` na
policy e adicionar a tela de login. Exatamente o que você já fez no Escala da
Liturgia. Me peça quando quiser — não é grande.

---

## Se algo não funcionar

| Mensagem no app | O que fazer |
|---|---|
| *Chave recusada* | Confira a chave — provavelmente veio a `service_role` |
| *A tabela tjet_registros não existe* | O SQL do passo 4 não rodou |
| *Bloqueado pela política de acesso (RLS)* | A parte final do SQL (a policy) não rodou |
| *Sem internet ou biblioteca bloqueada* | Rede. Os dados seguem salvos no aparelho |

**Mesmo com a nuvem fora do ar, o T-Jet funciona igual.** Grava no aparelho
primeiro e sincroniza quando a rede voltar.
