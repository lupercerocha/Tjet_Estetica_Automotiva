# Base completa de veículos (FIPE)

Substitui a lista compacta (1.834 modelos-base, sem trim) por **9.344 versões
completas** — nomes exatamente como a FIPE registra, incluindo motorização e
trim: *"Tiggo 8 PRO 1.5 Turbo (Híbrido)"*, não só *"Tiggo 8"*.

## Por que Supabase, e não uma API ao vivo nem embutido no app

Testei os três caminhos antes de decidir:

**DETRAN** — não serve para isso. DETRAN guarda registros de veículos
individuais (placa, dono, restrições), não um catálogo de modelos. Acesso é
restrito a órgãos autorizados.

**API da FIPE ao vivo, uma chamada a cada letra digitada** — funciona, mas
depende de internet no exato momento em que o atendente está digitando, no
balcão, com o cliente esperando. Se a rede cai, a busca para.

**Base própria, atualizada de tempos em tempos** — é o que constrói e mantém
a promessa central deste app: funcionar mesmo sem sinal. Nomes de modelo
mudam pouco (a FIPE atualiza preço todo mês, mas marca/modelo/versão novos
aparecem só algumas vezes por ano), então uma base atualizada periodicamente
não fica desatualizada na prática.

**A decisão**: a base mora no Supabase (mesma conta que você já configurou),
o app baixa uma vez e guarda no aparelho. Depois disso, funciona **offline**,
igual a tudo mais no T-Jet.

## Instalar (uma vez)

1. Abra o **SQL Editor** do seu projeto Supabase.
2. Abra o arquivo `base_veiculos_fipe.sql` desta entrega, copie tudo, cole lá.
3. Clique em **Run**. São ~9.344 linhas em 19 lotes — leva alguns segundos.

Isso cria a tabela `tjet_veiculos_fipe` (marca, modelo, porte), com leitura
liberada para o app e sem exigir nenhuma mudança no `config.js` — usa a
mesma URL e chave que você já tem configuradas para a nuvem.

## Como o app carrega

- **Primeira vez com a nuvem já configurada**: baixa sozinho, em segundo
  plano, um pouco depois de abrir — sem travar a tela, sem avisar nada se
  falhar (a base compacta embarcada segue valendo até dar certo).
- **Depois disso**: usa o que já baixou, guardado no aparelho. Funciona sem
  internet.
- **Botão "Atualizar lista"** (ao lado do campo Modelo, na Entrada): busca de
  novo a qualquer momento, mostra quantos modelos baixou.
- **Sem Supabase configurado**: a base compacta (1.834) continua funcionando
  normalmente — só não tem o nível de detalhe por trim/motorização.

## Formato de exibição

Na lista de sugestões, o nome aparece como você pediu — modelo primeiro,
marca depois, numa linha só:

```
Tiggo 8 PRO 1.5 Turbo (Híbrido) Chery                    [SUV]
```

O porte fica num selo separado à direita, sem disputar espaço com o nome.

Por trás, os dados ficam limpos e separados (marca="Chery",
modelo="Tiggo 8 PRO 1.5 Turbo (Híbrido)") — o texto concatenado é só para
exibição. Isso importa para os rankings de marca nos indicadores continuarem
corretos.

## Atualizar no futuro

Quando a FIPE tiver modelos novos que valha a pena incluir, me avise — gero
um `base_veiculos_fipe.sql` novo (o script já limpa nomes de marca
duplicados, como os três códigos que a FIPE usa para "Chery", e classifica o
porte de cada versão automaticamente). Rodar de novo no SQL Editor substitui
a base inteira sem duplicar nada.
