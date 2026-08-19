# Leitura de placa

## Por que vale ligar a API

O leitor local (Tesseract) precisa **baixar ~15 MB na primeira leitura**. Em
celular com sinal fraco isso demora, e é o que faz a tela ficar parada em
*"preparando o leitor"*.

A API não baixa nada: manda a foto, recebe a placa. Mais rápido e bem mais preciso.

A partir da v3.4.0 o app mostra o progresso do download (*"Baixando o leitor ·
42%"*), tem botão **Cancelar leitura** e desiste sozinho se travar — mas ligar a
API resolve o problema na raiz.

---

# Plate Recognizer — pegar o token

## Onde fica

1. Entre em **https://app.platerecognizer.com**
2. No menu, abra **Snapshot → Cloud API** (ou clique no seu e-mail, no canto
   superior direito, e vá em **Settings**)
3. O **API Token** aparece na tela — uma sequência de ~40 letras e números

É esse valor que você cola no T-Jet.

## A URL você não precisa

O endereço da API (`https://api.platerecognizer.com/v1/plate-reader/`) já está
dentro do app. O campo *URL do endpoint* no T-Jet só é usado se você escolher a
opção **Endpoint próprio (proxy)** — explicada mais abaixo.

Para usar o Plate Recognizer direto, preencha **só o token**.

## Colar no T-Jet

**Admin → Nuvem → Gerar o config.js**, na seção *Leitura de placa*:

| Campo | Valor |
|---|---|
| Como ler | `Plate Recognizer` |
| Token da API | cole aqui |
| URL do endpoint | deixe vazio |

Baixe o `config.js`, suba no GitHub. Todos os aparelhos passam a usar a API.

Para testar antes: **Admin → Configurações → Leitura de placa → Testar leitura da API**.

## Limites do plano gratuito

- **2.500 leituras por mês** — muito acima do que um lava jato usa
- **1 leitura por segundo** — irrelevante no balcão

---

## O alerta que você precisa ouvir

O `config.js` fica **público** no GitHub Pages. Quem abrir o endereço do seu app
consegue ler o token.

A própria documentação do Plate Recognizer desaconselha chamar a API direto do
navegador por esse motivo. O risco concreto: alguém pega seu token e gasta suas
2.500 leituras.

Três caminhos:

### 1. Começar assim mesmo

Enquanto o endereço do app não circular, o risco é baixo. Se um dia a cota
aparecer consumida sem explicação, você gera um token novo no painel deles e sobe
um `config.js` atualizado. Leva dois minutos.

**Para começar hoje e ver se a leitura melhora de verdade, é o caminho razoável.**

### 2. Proxy no Supabase (token fora do aparelho)

Como você já vai ter o Supabase, dá para pôr uma Edge Function no meio. O token
fica guardado no servidor e o app nunca o vê.

**Criar a função:**

No painel do Supabase: **Edge Functions → Deploy a new function**, nome `placa`,
e cole este código:

```ts
// supabase/functions/placa/index.ts
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const token = Deno.env.get('PLATE_TOKEN');
  if (!token) {
    return new Response(JSON.stringify({ error: 'token nao configurado' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const entrada = await req.formData();
    const foto = entrada.get('upload');
    if (!foto) {
      return new Response(JSON.stringify({ error: 'sem imagem' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const envio = new FormData();
    envio.append('upload', foto);
    envio.append('regions', 'br');

    const r = await fetch('https://api.platerecognizer.com/v1/plate-reader/', {
      method: 'POST',
      headers: { Authorization: 'Token ' + token },
      body: envio,
    });

    return new Response(await r.text(), {
      status: r.status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
```

**Guardar o token no servidor:**

Em **Edge Functions → Secrets** (ou *Project Settings → Edge Functions*), crie:

| Nome | Valor |
|---|---|
| `PLATE_TOKEN` | seu token do Plate Recognizer |

**Configurar no T-Jet:**

| Campo | Valor |
|---|---|
| Como ler | `Endpoint próprio (proxy)` |
| Token da API | deixe vazio |
| URL do endpoint | `https://SEUPROJETO.supabase.co/functions/v1/placa` |

O plano gratuito do Supabase cobre 500.000 execuções por mês.

### 3. Repositório privado

GitHub Pages a partir de repositório privado exige plano pago. Só vale se você já
tiver.

---

## Como o app se comporta

Com a API ligada, ela é consultada **primeiro**. Se falhar por qualquer motivo —
sem rede, cota estourada, token recusado, servidor fora do ar — **o leitor local
assume na hora e o atendimento não para**.

O motivo da falha fica registrado em **Admin → Dados → Diagnóstico**.
