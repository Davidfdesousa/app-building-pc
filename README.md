# Monta PC — comparador de configurações

App mobile-first pra montar e comparar duas configs de PC (CPU/GPU/RAM/placa-mãe/fonte/SSD),
com dataset mockado (KaBuM!, pesquisa fixa) e uma aba de FPS estimado em 10 jogos, em dois
tipos de tela (monitor 34" 144Hz e TV 4K).

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub (ex. `monta-pc`) e suba este projeto:
   ```bash
   git init
   git add .
   git commit -m "primeiro commit"
   git branch -M main
   git remote add origin https://github.com/Davidfdesousa/monta-pc.git
   git push -u origin main
   ```
2. No GitHub, vá em **Settings → Pages** e em "Build and deployment" escolha
   **Source: GitHub Actions** (não "Deploy from a branch").
3. O workflow em `.github/workflows/deploy.yml` já está pronto — a cada push na `main`,
   ele builda e publica sozinho. Depois do primeiro push, o site fica em:
   `https://davidfdesousa.github.io/monta-pc/`
4. **Importante**: o `base` em `vite.config.js` está fixo em `/monta-pc/`. Se você nomear o
   repositório diferente, troque essa linha para bater com o nome real do repositório —
   caso contrário os assets (JS/CSS) não carregam em produção (tela em branco).

## Editar a constante do GitHub no rodapé

Em `src/App.jsx`, procure por `GITHUB_URL` perto do topo do arquivo — já está apontando
para `https://github.com/Davidfdesousa`.
