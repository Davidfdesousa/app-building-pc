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
3. **Modelo de FPS** — `RESOLUTIONS`, `ramIndex`, `platformFactor`, `estimateFps`.
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

## Gotcha de Tailwind (não repetir bug antigo)

O runtime usa uma folha Tailwind **pré-buildada, sem JIT**. Qualquer classe com colchetes
(`bg-[#10141C]`, `text-[12px]`, `bg-white/[0.03]`, `shadow-[...]`) **falha silenciosamente**.
Cores/superfícies escuras vão por `style` inline (constantes `BG`, `SURFACE`, `BRAND_*`).

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
