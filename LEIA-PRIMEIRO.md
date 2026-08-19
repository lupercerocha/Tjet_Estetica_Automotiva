# Antes de qualquer coisa: force a atualização

Se você já abriu o T-Jet neste celular antes, **o navegador está te servindo a
versão antiga**. Foi isso que quebrou a leitura de placa e a busca de veículos —
as funções novas não estavam no arquivo que rodou aí.

## O que fazer agora

1. Suba **todos** os arquivos desta entrega para o GitHub Pages, substituindo os antigos.
2. No celular, abra o T-Jet.
3. Vá em **Admin → Dados → Forçar atualização**.
4. Confirme no rodapé da tela inicial: deve aparecer **v3.3.0**.

Se o botão não existir na tela, você ainda está na versão velha. Nesse caso:

- **Chrome Android**: ⋮ → Configurações → Privacidade → Limpar dados de navegação
  → escolha só *Imagens e arquivos em cache* → Limpar.
- **App instalado na tela inicial**: desinstale o ícone e instale de novo pelo navegador.
- **Teste rápido**: abra o endereço com `?v=1` no fim
  (`https://seuusuario.github.io/tjet/?v=1`). Isso ignora o cache.

A partir desta versão isso não acontece mais: o service worker foi reescrito para
**nunca** servir HTML velho quando há internet, e o app avisa sozinho quando
baixa uma versão nova.

## Se algo não responder

**Admin → Dados → Diagnóstico do sistema** mostra, em tempo real:

- qual versão está rodando;
- se a câmera está liberada (e se o endereço é HTTPS);
- se o leitor de placa foi baixado;
- se a base de veículos carregou (deve dizer 1.834 modelos);
- quantos erros aconteceram na sessão, com a mensagem de cada um.

O botão **Copiar diagnóstico** monta um texto com tudo isso mais o modelo do seu
celular. Cole numa mensagem para mim e eu vejo exatamente o que aconteceu, em vez
de adivinhar.

## Leitura de placa — corrigida na v3.3.0

Até a v2.7.0 a leitura falhava mesmo com a placa perfeitamente enquadrada. A causa
era um erro de coordenadas: a moldura na tela é medida em pixels da **tela**, mas o
vídeo entra com `object-fit: cover` — ampliado e cortado nas laterais. Sem
converter entre os dois sistemas, o recorte enviado ao leitor saía **3,2× mais
largo** que a moldura, e a placa virava um detalhe minúsculo numa faixa larga.

Agora o recorte é calculado corretamente e, dentro dele, o sistema **isola a linha
de caracteres** antes de ler: a faixa azul "BRASIL" fica quase toda escura depois
da binarização e o fundo quase todo claro, então a linha dos caracteres é a única
com densidade intermediária de tinta — é assim que ela é localizada.

O ganho foi medido numa foto real de placa Mercosul:

```
placa inteira        → 'TRLVSHO7'   ✗
linha isolada, psm 8 → 'LRLV3H67'   → normaliza para RLV3H67  ✓
linha isolada, psm11 → 'RLV3H67'    ✓ exato
```

## Se ainda assim não for lida

A câmera abrir e não reconhecer **não é falta de cadastro** — é a leitura da foto
falhando. Agora o sistema diz qual dos dois casos é:

- *"Não enxerguei texto nenhum"* → aproxime até a placa preencher a moldura e
  melhore a luz;
- *"Li caracteres mas não formaram uma placa válida"* → está quase; firme o
  celular e mantenha a placa reta.

Depois de duas tentativas ele abre a digitação sozinho, para você não perder tempo.

Quando a leitura falha, o sistema **mostra o trecho da imagem que analisou** e
pergunta direto: *a placa aparece inteira e nítida aí?*

- **Sim** → o problema é o reconhecimento. Digite a placa e siga; me mande o
  diagnóstico depois.
- **Não** → é enquadramento. Aproxime até a placa preencher a moldura.

Isso responde na hora qual dos dois é, sem adivinhação. Em **Admin → Dados →
Diagnóstico** também fica registrada a linha **Última leitura da câmera** com o
texto bruto de cada tentativa.
