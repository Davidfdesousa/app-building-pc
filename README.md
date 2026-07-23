# Monta PC — comparador de configurações

App mobile-first pra montar e comparar duas configs de PC (CPU / GPU / RAM / placa-mãe /
fonte / SSD) usando preços reais do KaBuM!, com uma aba de **FPS estimado em 20 jogos** —
os títulos mais bonitos segundo a comunidade — reagindo às peças escolhidas, em dois tipos
de tela (monitor 34" 144Hz UWQHD e TV 4K).

## Funcionalidades

- **Config A e Config B** — monta duas builds e compara preço lado a lado.
- **Preços reais do KaBuM!** — snapshot de pesquisa (PIX + cartão + parcelamento), com
  itens esgotados marcados. Data e chave de cache no topo de [`src/App.jsx`](src/App.jsx)
  (`RESEARCH_DATE`, `STORAGE_KEY`).
- **Importar por link** — cole o link de um produto do KaBuM! em qualquer categoria e o app
  reconhece nome/preço/specs automaticamente (via proxy leitor `r.jina.ai`, já que o app é
  estático e não pode acessar o KaBuM direto por CORS). Se falhar, tem preenchimento manual.
- **Aba Jogos** — estimativa de FPS que **reage à GPU, CPU e RAM** de cada config, com busca
  para filtrar/selecionar um jogo específico entre os 20.

## Como o FPS é calculado

O modelo é intencionalmente **dominado pela GPU** (que é o que manda em 1440p/4K). Cada jogo
tem uma base de FPS medida/derivada numa **RTX 5070 Ti @1440p** (preset máx, RT/PT, DLSS 4
Qualidade, sem frame gen). `estimateFps()` aplica:

```
FPS = base_5070Ti × razão_GPU × fator_plataforma(CPU+RAM) × fator_resolução
```

- **GPU**: razão 5070 ÷ 5070 Ti por jogo (alarga em 4K). Fonte: TechPowerUp / Notebookcheck /
  Windows Central / Sportskeeda.
- **CPU**: `cpuGameIndex` de benchmark de gaming (285K = 1.00, 265K = 0.958). O gap é o máximo
  a 1080p e encolhe com a resolução (`cpuSensitivity`) — em 4K quase some.
- **RAM**: latência efetiva (CL/MT/s) → efeito <1%. Capacidade **não** afeta FPS médio (por
  isso é ignorada de propósito).

> É uma estimativa relativa fiel ao comportamento real, **não** um oráculo de FPS absoluto
> (erro inerente de ±10-20% por cena). Detalhes e fontes nos comentários de `src/App.jsx`.

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173/app-building-pc/`.

Outros comandos: `npm run build` (produção → `dist/`), `npm run lint` (oxlint), `npm run preview`.

## Publicar no GitHub Pages

1. Suba o projeto para um repositório no GitHub (ex. `app-building-pc`):
   ```bash
   git init && git add . && git commit -m "primeiro commit"
   git branch -M main
   git remote add origin https://github.com/Davidfdesousa/app-building-pc.git
   git push -u origin main
   ```
2. Em **Settings → Pages → Build and deployment**, escolha **Source: GitHub Actions**.
3. O workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builda e publica a
   cada push na `main`. O site fica em `https://davidfdesousa.github.io/app-building-pc/`.
4. **Importante**: o `base` em [`vite.config.js`](vite.config.js) está fixo em `/app-building-pc/`.
   Se o repositório tiver outro nome, ajuste essa linha — senão os assets não carregam (tela em branco).

## Estrutura

Praticamente tudo vive em [`src/App.jsx`](src/App.jsx) (um único arquivo): dataset `DB`, lista
`GAMES`, modelo de FPS (`estimateFps`), importação por link e todos os componentes de UI.
O contexto completo do projeto está em [`AGENT.md`](AGENT.md).

## Rodapé (GitHub)

A constante `GITHUB_URL` no topo de `src/App.jsx` aponta para `https://github.com/Davidfdesousa`.
