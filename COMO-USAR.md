# T-Jet Sistema v2.0

Arquivo único, sem build e sem dependência de servidor. Os dados ficam no
`localStorage` do próprio aparelho.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | O sistema inteiro |
| `manifest.json` | Instalação como app no Android |
| `sw.js` | Funcionamento offline |
| `icons/` | Ícones do app |

Os quatro precisam ficar **na mesma pasta**.

## Publicar no GitHub Pages

1. Crie um repositório e envie os arquivos mantendo a estrutura.
2. *Settings → Pages → Branch: main / (root)*.
3. Abra o endereço `https://SEUUSUARIO.github.io/REPO/` no celular.
4. Chrome → menu ⋮ → **Adicionar à tela inicial**.

> A câmera **só funciona em HTTPS**. GitHub Pages já é HTTPS.
> Abrindo o arquivo direto por `file://` a leitura de placa não abre a câmera —
> nesse caso use o botão "Digitar a placa".

## Leitura de placa

Toque em **Fotografar placa** → a câmera traseira abre com uma moldura.
Encaixe a placa e toque no botão redondo.

O que acontece por baixo:

1. Recorta só a região da moldura (descarta o resto da cena);
2. Converte para escala de cinza, normaliza contraste e gera duas versões
   (uma binarizada por Otsu, outra só com contraste);
3. Passa as duas pelo OCR e cruza os resultados;
4. Corrige os erros clássicos **por posição** — nas três primeiras casas um `0`
   vira `O`, um `8` vira `B`; nas casas numéricas um `S` vira `5`, um `I` vira `1`;
5. Valida contra o padrão antigo (`ABC1234`) e o Mercosul (`ABC1D23`);
6. Mostra a placa para você confirmar — dá para corrigir na mão antes de seguir.

Confirmando:
- **Placa cadastrada** → carrega cliente, veículo, cor, porte, histórico e
  observações, e pula direto para a escolha dos serviços;
- **Placa nova** → abre o cadastro com a placa preenchida e o foco no nome.

A foto da placa fica anexada à OS.

> O motor de OCR (~4 MB) é baixado na primeira leitura e fica em cache. A partir
> daí funciona offline. A primeira leitura demora uns segundos; as seguintes são
> rápidas porque o worker é reaproveitado.

## Primeiro uso

O sistema começa **vazio**, só com o catálogo de 14 serviços e as formas de
pagamento. Ordem sugerida:

1. **Admin → Configurações**: nome do lava jato, meta do mês, horário, boxes,
   fidelidade e os textos do WhatsApp.
2. **Admin → Serviços**: ajuste os preços **por porte** (Moto a Pickup).
   Preço `0` significa "a combinar" — o sistema pergunta o valor na hora.
3. **Admin → Equipe**: quem lava e o percentual de comissão.
4. **Estoque**: cadastre os insumos e monte a *ficha técnica* de cada serviço.
   É isso que faz a margem aparecer nos indicadores e a baixa acontecer sozinha.
5. **Caixa → Abrir caixa** antes do primeiro atendimento do dia.

Quer ver os relatórios cheios antes de começar de verdade?
**Admin → Dados → Carregar demonstração** cria 45 dias de histórico fictício.
Depois use **Limpar todos os dados** para zerar mantendo serviços e configurações.

## Ciclo do dia

```
Abrir caixa → Entrada (placa/cadastro + vistoria + serviços)
   → Pátio (aguardando → lavando → secando → pronto)
   → Saída (conferência + pagamento + entrega)
   → Fechar caixa
```

Na entrega o sistema lança o recebimento no caixa, dá baixa nos insumos pela
ficha técnica, calcula a comissão do lavador, atualiza o histórico do cliente,
soma o selo de fidelidade e move a OS do pátio para o histórico.

## Backup

**Admin → Dados → Exportar backup** gera um `.json` com tudo. Guarde fora do
aparelho. Trocar de celular, limpar o navegador ou desinstalar o app **apaga os
dados** — o backup é a única rede de proteção. Faça um por semana.
