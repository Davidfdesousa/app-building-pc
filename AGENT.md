# AGENT.md — contexto do projeto "Monta PC"

Guia para qualquer agente/dev que for trabalhar neste repositório. Leia antes de editar.

## O que é

App **mobile-first** (React + Vite + Tailwind) que compara duas configurações de PC
(**Config A** vs **Config B**) montadas com peças reais do KaBuM!, e estima FPS em 20 jogos.
Publicado como site **estático** no GitHub Pages. Sem backend.

- **Público-alvo / autor**: David Ferreira (`GITHUB_URL` no código).
- **Peças cobertas**: 6 categorias — `cpu`, `gpu`, `ram`, `mobo`, `psu`, `ssd`.
- **Foco de hardware**: Intel Core Ultra 7/9 (LGA1851) + RTX 5070 / 5070 Ti.

## Stack e comandos

- React 18 + Vite + TailwindCSS + `lucide-react` (ícones). Lint: **oxlint**.
- `npm run dev` → `http://localhost:5173/app-building-pc/`
- `npm run build` → `dist/`  ·  `npm run lint`  ·  `npm run preview`
- Deploy: push na `main` → `.github/workflows/deploy.yml` builda e publica no GitHub Pages.

## Arquitetura — quase tudo em `src/App.jsx`

É um **único arquivo** grande, organizado em seções por comentários de bloco:

1. **`DB`** — dataset de peças por categoria. Cada item: `id`, `name`, `brand`, `specs`,
   `price` (preço PIX / à vista), `link`, `inStock`, e opcionalmente breakdown de cartão
   (`priceOriginal`, `pixDiscountPct`, `cardPrice`, `cardInstallment`, `cardDiscountPct`),
   `note`, badges (`tag`, `line`, `size`, `pair`, etc.).
   - CPUs têm **`cpuGameIndex`** (índice de gaming, 285K=1.00).
   - RAMs têm **`mtps` + `cl`** (para latência efetiva).
2. **`GAMES`** — 20 jogos "mais bonitos" por consenso da comunidade (inclui Cyberpunk 2077 PT,
   Alan Wake 2, RDR2, Ghost of Tsushima…). Cada um: `fps5070Ti` (base @1440p), `gap5070`
   (razão 5070÷5070Ti), `source`, `note`, `tags`, `studio`, `released`.
3. **Modelo de FPS** — `RESOLUTIONS`, `ramIndex`, `platformFactor`, `estimateFps`,
   `fpsTier` (verde/âmbar/vermelho = Fluido/Jogável/Trava, ≥60/30-59/<30 — convenção
   padrão de calculadoras de FPS) e `demandTier` (Leve/Médio/Pesado/Extremo, bucket
   honesto sobre o próprio `fps5070Ti` — não é dado novo, só rótulo sobre dado existente).
4. **`annotateValueBadges`** — marca "melhor custo-benefício" por linha de GPU / tier de RAM.
5. **Importação por link** — `importFromKabumLink` e helpers.
6. **Persistência** — `loadFromStorage` / `saveToStorage` (localStorage) + simulador de
   flutuação de preços (`apiRequestRefresh`).
7. **Componentes de UI** — `OptionCard`, `CategoryAccordion`, `LinkImportInput`,
   `ConfigBuilder`, `CompareView`, `GameFpsCard`, `GamesView`, `Footer`, e o root
   `PCConfigComparator`.

## Modelo de FPS (o coração — e o mais sensível)

```
FPS = fps5070Ti[jogo] × razãoGPU × platformFactor(CPU,RAM) × resFactor
```

- **razãoGPU**: `1` para RTX 5070 Ti; `gap5070 × gap5070Adjust` para a 5070 (o gap alarga em 4K).
- **platformFactor**: `1 - (1 - cpuGameIndex×ramIndex) × cpuSensitivity[res]`.
  O gap de CPU/RAM é o **máximo a 1080p** e é atenuado por `cpuSensitivity` conforme a
  resolução (em 4K quase some — GPU-bound).
- **ramIndex**: latência efetiva `(cl/mtps)×2000` ns; melhor kit (~10ns) neutro; ~0,4%/ns.
  **Capacidade é ignorada de propósito** (não muda FPS médio em jogos).

### Princípio inegociável: dados reais, sem inventar

Os números vêm de benchmarks publicados (comentados no código com a fonte). O modelo é
**dominado pela GPU**; CPU muda ~1-4% (some em 4K) e RAM <1% — porque é **assim na vida real**.
Nunca exagere a reatividade de CPU/RAM para "parecer" que importam mais. Fontes principais:
TechPowerUp, Notebookcheck, Windows Central, Sportskeeda (GPU); Tom's Hardware, Tech4Gamers
(CPU: 285K 144,9 vs 265K 138,8 fps, geomean 16 jogos 1080p → 265K=0,958). Entradas sem
benchmark direto são marcadas como "Estimativa por escalonamento" no `source`.

## Importação por link (KaBuM!)

App estático ⇒ o navegador **não** acessa kabum.com.br direto (CORS). Solução: proxy leitor
**`r.jina.ai`** (`importViaJinaReader`) que busca a página server-side e devolve markdown —
extrai título, preço `#### R$…` (PIX) e specs. Fallback: HTML via `api.allorigins.win` +
JSON-LD (`importViaHtmlProxy`). Ambos são serviços de terceiros gratuitos → podem cair; por
isso há preenchimento manual no `LinkImportInput`. `corsproxy.io` **não** funciona (bloqueia
requests server-side no plano free) — não reintroduzir.

## Preços e cache — GOTCHA importante

- `RESEARCH_DATE` = data do snapshot de preços; `STORAGE_KEY` = chave do cache no localStorage.
- **Ao atualizar preços/estoque no `DB`, BUMPE `STORAGE_KEY`** (ex. `monta-pc:v2` → `v3`).
  Senão, usuários com cache antigo continuam vendo os preços velhos (o `apiFetchAll` prioriza
  o cache). Esse bug já aconteceu uma vez.
- Preços conferidos por consistência: `cardPrice = precoPIX ÷ (1 - desconto)` (é como o KaBuM
  calcula). Itens esgotados ficam com `inStock: false` (vão pro fim da lista, badge "Esgotado")
  e mantêm o último preço conhecido.
- **Config A/B defaults** (`DEFAULT_A`, `DEFAULT_B`) devem apontar só para itens `inStock`.

## Gotcha de flex/grid + truncate (não repetir bug antigo)

Um item flex ou grid **não encolhe abaixo do min-content do próprio conteúdo** por padrão
(`min-width: auto`), mesmo que o filho tenha `truncate`. Se o texto usa `white-space: nowrap`
(parte do `truncate`), o min-content vira a largura da linha inteira sem quebrar — isso
"empurra" a largura pra cima por TODOS os níveis de flex/grid aninhados até achar um que
tenha `min-w-0` explícito. Já causou overflow real (linhas de config na aba Jogos vazando
pro fora do card). Regra: qualquer `<span className="truncate">` dentro de um `flex`/`grid`
precisa de `min-w-0` **em si e em cada container flex/grid ancestral** até a largura ficar
de fato limitada — não basta pôr `min-w-0` só no elemento com `truncate`.

## Busca por nome (todas as categorias) — link colado está desativado

Único jeito de adicionar peça fora do catálogo hoje é digitar o nome (`NameSearchInput`, ex:
"RTX 5070", "Ryzen 7 7800X3D") e escolher entre sugestões reais do KaBuM. `LinkImportInput`
(colar link) foi **comentado** em 2026-07-23 — a função ainda existe no arquivo (bloco `/* ... */`
logo acima de `CategoryAccordion`), só não é renderizada. Pra reativar: descomentar o bloco,
o `<LinkImportInput .../>` no `CategoryAccordion`, e restaurar o import `Link as LinkIcon`
de `lucide-react`.

**Como funciona**: `searchKabumProducts` lê `kabum.com.br/busca/<query>` via `r.jina.ai` e
faz regex sobre os links markdown `](https://www.kabum.com.br/produto/ID/slug)`, extraindo o
texto logo antes de cada link como nome+preço. `CATEGORY_MATCHERS[catKey]` (include/exclude
por regex) filtra o ruído — notebooks, "PC Gamer" completo, kits de upgrade que só
*mencionam* a peça — por categoria; `searchKabumByCategory(catKey, query, signal)` aplica o
filtro certo. Testado contra várias queries reais por categoria (cpu/gpu/ram/mobo/psu/ssd),
~95%+ de precisão. Escolher uma sugestão roda `importFromKabumLink` na URL encontrada — a
busca é só descoberta, a extração final usa o mesmo pipeline confiável de sempre.

**Gotcha de parsing (busca)**: o limite entre "markdown da imagem anterior" e "início do nome
do produto" NÃO pode ser "o último `)` antes do link" — nomes de produto costumam ter
parênteses próprios (ex: "32GB**(2x16GB)**"), o que cortava o nome ali por engano. A extração
usa o último match completo de `\]\([^)]*\)` (fechamento real de um link/imagem markdown) como
fronteira. Também há uma checagem de sanidade (nome precisa ter espaço e não pode conter
`http`/`.com`) pra descartar os raros casos em que nem isso resolve (URL de imagem longa
demais pra caber na janela de 400 chars analisada).

**Card consistency (2026-07-23)**: item importado (por busca ou pelo `LinkImportInput`
comentado) precisa renderizar **exatamente** como um item curado do `DB` — mesma marca, specs
concisas, e o mesmo breakdown PIX/Cartão de duas colunas (`OptionCard` só mostra esse
breakdown quando `item.cardPrice != null`). Três peças fazem isso funcionar:
- `guessBrandFromName`: o fallback (quando nenhum `KNOWN_BRANDS` bate) pula palavras genéricas
  via `BRAND_STOPWORDS` ("placa", "de", "vídeo", "gaming"...) em vez de pegar cegamente a
  2ª palavra do título — isso pegava "De" como marca em "Placa De Vídeo Vinik Rx 580...".
  `KNOWN_BRANDS` também ganhou marcas nativas do KaBuM (Vinik, Husky, Inno3D...).
- `extractSpecsFromPage`: prioriza a seção **"Resumo gerado por IA"** do próprio KaBuM (2-3
  frases curtas e coerentes, presente na maioria das páginas) em vez da tabela
  "Especificações Técnicas" crua (formatação inconsistente entre categorias — vira uma
  parede de texto cortada no meio da palavra quando achatada). Cai pro fallback da tabela
  técnica só quando não há resumo de IA (visto em algumas páginas de CPU).
- `extractPricingFromPage`: extrai o bloco de preço inteiro — `pixDiscountPct`, `cardPrice`,
  `cardInstallment`, `cardDiscountPct`, `priceOriginal` — não só o preço PIX. Sem isso, item
  importado sempre caía no branch "preço único" do `OptionCard`, visualmente diferente do
  branch "PIX/Cartão" que os itens curados usam.

**Cache de página de produto**: `productImportCache` (Map por URL, só de sessão) em
`importFromKabumLink` — clicar na mesma sugestão duas vezes, ou reimportar o mesmo link, não
refaz o fetch. Complementa o `searchResultsCache` (que só cacheia a *listagem* da busca, não
o fetch da página de detalhe do produto que acontece ao escolher uma sugestão).

**Performance da busca**: `r.jina.ai` cacheia agressivamente do lado deles — uma query
repetida volta em ~1s, mas a **primeira vez que qualquer query exata é buscada pode levar até
~10s** (ele renderiza a página do zero). Isso é o gargalo dominante e não dá pra eliminar do
nosso lado; em vez disso: `X-Timeout: 8` limita o pior caso, `searchResultsCache` deixa buscas
repetidas/backspace instantâneas, `productImportCache` evita refetch de página de produto, e
`NameSearchInput` cancela buscas obsoletas quando o usuário continua digitando. Se a proxy
cair, `NameSearchInput` mostra fallback manual (nome+preço).

**Gotcha corrigido — segunda busca "travava"**: o `searchFn` passado a `NameSearchInput` era
uma arrow function recriada a cada render do `CategoryAccordion` (identidade nova toda hora),
e a lógica de debounce/abort dependia só do estado do `AbortController` pra decidir se um
resultado ainda era válido — havia brecha de corrida onde uma busca antiga podia, em teoria,
sobrescrever o estado de uma busca mais nova (ou simplesmente nada parecer acontecer na 2ª
busca). Correção: `searchFn` agora é memoizado (`useCallback` no `CategoryAccordion`, preso
só a `catKey`) e `NameSearchInput` usa um contador monotônico (`requestIdRef`) como guarda
autoritativa — só a busca com o id mais alto pode commitar estado, `AbortController` só
cancela o fetch de rede (otimização, não é mais a fonte de verdade). `results` também é
limpo no INÍCIO de cada busca nova, não só no sucesso, pra nunca mostrar resultado de query
antiga enquanto uma nova está carregando.

## Gotcha de Tailwind (não repetir bug antigo)

O runtime usa uma folha Tailwind **pré-buildada, sem JIT**. Qualquer classe com colchetes
(`bg-[#1C2836]`, `text-[12px]`, `bg-white/[0.03]`, `shadow-[...]`) **falha silenciosamente**.
Cores/superfícies escuras vão por `style` inline (constantes `BG`, `SURFACE`, `BRAND_*`).

## Sistema visual — Steam (design-system-base.md)

O app segue o design system exportado em [`design-system-base.md`](design-system-base.md)
(baseado na Steam): dark, utilitário, densidade de marketplace, geometria quase quadrada,
accents restritos em azul-acinzentado, sombra mínima — bordas fazem a separação.

- **Tokens** (`src/App.jsx`, perto de `CONFIG_THEME`): `BG` = `#0F1924` (Deep Background Navy),
  `SURFACE` = `#1C2836` (Store Panel Navy), `BORDER_LINE` = `#313943` (Gunmetal Line),
  `TEXT_MIST` = `#C6D4DF` (texto secundário/notas). `BRAND_GREEN` é mantido, mas desaturado —
  a Steam usa cor para sinalizar desconto/sentimento de review, então um verde semântico
  (badge de "melhor custo-benefício", estoque, tiers de FPS) é consistente com o sistema;
  só não pode virar decoração solta.
- **Config A/B**: `CONFIG_THEME.A/B.accent` ficaram dentro da família azul-acinzentada
  (`#4C86AC` / `#93A0AC`) em vez do ciano/laranja neon anterior. Essa distinção A-vs-B foi
  **mantida de propósito** (é funcional — rastreia "qual config" nas barras de preço/FPS pela
  página toda), mas sem sair do restrained palette. `ACCENT_UTILITY` (`#6E92A8`) é a cor
  compartilhada de seções que não são um config (aba Jogos, card em destaque).
- **Border radius**: **squared globalmente** — `rounded-2xl/xl/lg/md/full` viraram `rounded-sm`
  em todo o arquivo (inclui badges, botões, barras de progresso). Steam evita pill shapes;
  não reintroduzir `rounded-full` em componente novo.
- **Header**: sem `backdrop-blur`/glow — fundo sólido `BG` + `border-b` em `BORDER_LINE`,
  seguindo "Flat: no shadow, dark fill, hard edges" do doc.
- **Tipografia**: pesos de heading ficaram em `font-bold` (700), não `font-black` (900) —
  a Steam usa 700 como peso máximo evidenciado.
- Badges semânticos (`Badge` tones ok/warn/value, `fpsTier`, `demandTier`) continuam coloridos
  de propósito — são sinais funcionais (estoque, desconto, performance), não decoração, e a
  própria Steam usa esse padrão (badges de desconto/review coloridos sobre chrome neutro).

## Como fazer tarefas comuns

- **Atualizar preços**: reeditar `DB` (buscar via `r.jina.ai/<link>`), conferir a matemática
  PIX↔cartão, atualizar `inStock`, **bumpar `STORAGE_KEY`** e `RESEARCH_DATE`.
- **Adicionar um jogo**: novo objeto em `GAMES` com `fps5070Ti` (base 5070 Ti @1440p),
  `gap5070`, e `source` real (ou "Estimativa por escalonamento" se derivado). Ele aparece
  automaticamente na busca (datalist) e na lista.
- **Adicionar uma peça**: novo item na categoria certa do `DB`; se tiver desconto PIX, inclua
  o breakdown de cartão para a UI mostrar as duas colunas.

## Limitações conhecidas

- Dataset é um snapshot manual; não há scraping ao vivo do KaBuM (só importação por link, e
  ainda assim via proxy de terceiro).
- FPS é estimativa relativa (±10-20% por cena), não benchmark absoluto por config.
- Não testável via browser headless neste ambiente (sem `chromium-cli`); validar mudanças
  visuais com `npm run dev`.
