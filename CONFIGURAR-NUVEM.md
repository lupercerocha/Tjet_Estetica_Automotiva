# Ligar a nuvem (Supabase)

Enquanto isso estiver desligado, **perder o celular é perder tudo**. Ligando, os
dados ficam salvos no Supabase e outro aparelho enxerga o mesmo pátio.

## 1. Criar o projeto

Em [supabase.com](https://supabase.com) crie um projeto. Escolha a região mais
próxima — para o Nordeste, `sa-east-1` (São Paulo) é a melhor.

## 2. Criar a tabela

No app: **Admin → Nuvem → Ver SQL**, copie e cole no **SQL Editor** do Supabase.
Execute uma vez. Ele cria a tabela `tjet_registros`, o índice e a política de acesso.

## 3. Colar as credenciais

No Supabase, em **Settings → API**, copie:

| Campo no T-Jet | Onde achar |
|---|---|
| Project URL | *Project URL* |
| Chave anon public | *Project API keys → `anon` `public`* |
| Identificação da loja | você escolhe (ex.: `principal`) |

Ligue **Sincronizar com a nuvem**, salve e toque em **Sincronizar agora**.

## 4. Segundo aparelho

Repita os passos 3 e 4 no outro celular com **a mesma URL, a mesma chave e a mesma
identificação de loja**. Os dois passam a enxergar os mesmos clientes e o mesmo pátio.

## Como funciona por baixo

O app é **local-first**: tudo grava no aparelho primeiro e a tela nunca espera a
rede. A sincronização acontece uns segundos depois, em segundo plano.

- **Sem internet**, o T-Jet funciona igual. Sincroniza quando a rede voltar.
- **Conflito** (o mesmo registro alterado em dois aparelhos) é resolvido por
  *quem alterou por último vence*. Simples e previsível no balcão.
- O selo ao lado da versão na tela inicial mostra o estado: *na nuvem*,
  *sincronizando*, *falhou* ou *só neste aparelho*.

## Sobre segurança — leia antes de decidir

A política SQL que eu entrego libera leitura e escrita para a chave `anon`. Isso é
simples de configurar e adequado se **o endereço do seu app não é público**.

Se o link do GitHub Pages circular, qualquer pessoa com ele pode ler seus dados.
Para fechar isso, o caminho é login por e-mail e senha (como você já fez no Escala
da Liturgia): troque `to anon` por `to authenticated` na policy e adicione a tela
de login. Me peça quando quiser dar esse passo.

---

# Leitura de placa por API (opcional)

O leitor embarcado funciona offline e acerta em condição boa. Uma API dedicada
acerta em placa suja, contraluz e ângulo torto.

## Plate Recognizer

1. Crie conta em [app.platerecognizer.com](https://app.platerecognizer.com) —
   o plano gratuito cobre 2.500 leituras por mês.
2. Copie o token.
3. No app: **Admin → Configurações → Leitura de placa**, escolha *Plate Recognizer*
   e cole o token.
4. Toque em **Testar leitura da API** para confirmar.

Quando a API está ligada, ela é consultada primeiro. **Se falhar por qualquer
motivo — sem rede, cota estourada, token errado — o leitor local assume na hora.**
O atendimento não para.

## Se o navegador bloquear (CORS)

Alguns serviços não liberam chamada direta do navegador. Nesse caso use
**Endpoint próprio (proxy)**: uma Edge Function no Supabase que recebe a foto,
chama a API com o token guardado no servidor e devolve a resposta.

Vantagem extra: o token deixa de ficar no aparelho. Me peça o código da função
quando chegar nesse ponto.
