# Como atualizar o app

## Substitua sempre

| Arquivo | Por quê |
|---|---|
| **index.html** | é o app inteiro |
| **sw.js** | carrega o número da versão e limpa o cache antigo |

Só esses dois, na maioria das vezes.

## NUNCA substitua

| Arquivo | Por quê |
|---|---|
| **config.js** | é **seu** — tem a URL, a chave do Supabase e o token da placa |

O `config.js` continua valendo em todas as versões novas. Ele só muda quando
**você** decide mudar (trocar de projeto, incluir um token novo), e aí você gera
outro em **Admin → Nuvem → Gerar o config.js**.

> Por isso o modelo em branco que eu envio se chama **`config.exemplo.js`** —
> nome diferente, impossível sobrescrever o seu por engano. Ele só serve para uma
> instalação do zero.

## Raramente mudam

`manifest.json`, `favicon.ico`, `favicon.svg`, `icons/` — só substitua se eu
avisar que mudaram.

Os arquivos `.md` são documentação. Não afetam o app; atualize se quiser.

---

## Passo a passo no GitHub

1. Abra o repositório no github.com
2. Clique em **index.html** → ícone do **lápis** → apague tudo → cole o novo →
   **Commit changes**
3. Mesma coisa com **sw.js**
4. No celular: **Admin → Dados → Forçar atualização**
5. Confira o número no selo da tela inicial

## Se a nuvem cair depois de uma atualização

Provavelmente o `config.js` foi substituído pelo modelo em branco. O app percebe
sozinho: ao abrir, mostra *"A nuvem foi desligada"* e oferece **Religar a nuvem**
com as credenciais que ele guardou.

Um toque resolve neste aparelho. Depois republique o seu `config.js` para os
outros voltarem também.
