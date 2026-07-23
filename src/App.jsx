import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Cpu,
  Zap,
  MemoryStick,
  CircuitBoard,
  BatteryCharging,
  HardDrive,
  ExternalLink,
  RefreshCw,
  Check,
  ChevronDown,
  AlertTriangle,
  Scale,
  Info,
  Gamepad2,
  Tag,
  PackageCheck,
  PackageX,
} from "lucide-react";

// lucide-react dropped brand/logo icons (Github included) some versions back,
// so the GitHub mark is a tiny inline SVG instead of a package import.
function GithubMark({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56
        0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7
        -1.04-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96
        .1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.09
        -.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.02 11.02 0 0 1 5.79 0
        c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09
        0 4.43-2.69 5.41-5.26 5.7.41.36.78 1.07.78 2.15 0 1.55-.01 2.8-.01 3.18
        0 .31.21.67.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z"/>
    </svg>
  );
}

/* ============================================================================
   MOCK API LAYER
   ----------------------------------------------------------------------------
   This simulates a backend. The dataset below was captured from real product
   pages on KaBuM! during a research pass on 20/07/2026 — prices, PIX/cartão
   conditions, stock and discounts are all sourced only from KaBuM! now (no
   Mercado Livre). The app does NOT hit KaBuM live on every load — it reads
   this frozen snapshot. Tapping "Atualizar pesquisa" simulates calling the
   API again; a true refresh (new live prices) has to be requested from
   Claude in the chat, since this sandbox can't reach kabum.com.br directly.
============================================================================ */

const RESEARCH_DATE = "2026-07-20";
const SOURCES = ["KaBuM!"];
const GITHUB_URL = "https://github.com/Davidfdesousa";

const DB = {
  cpu: [
    {
      id: "u9-285k",
      name: "Core Ultra 9 285K",
      brand: "Intel",
      specs: "24 núcleos (8P+16E) · até 5.7GHz · desbloqueado p/ OC · LGA1851",
      tag: "Overclock",
      price: 3569.99,
      installment: "10x R$ 419,99",
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/645177/processador-intel-core-ultra-9-285k-5-7ghz-ate-24-nucleos-com-suporte-a-pcie-5-0-e-4-0-e-suporte-a-ddr5-bx80768285k",
      inStock: true,
    },
    {
      id: "u9-285",
      name: "Core Ultra 9 285",
      brand: "Intel",
      specs: "24 núcleos (8P+16E) · até 5.6GHz · multiplicador travado · LGA1851",
      tag: "Normal",
      price: 3411.75,
      installment: "10x R$ 341,17",
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/696996/processador-intel-core-ultra-9-desktop-processor-285-bx80768285",
      inStock: true,
    },
    {
      id: "u7-265k",
      name: "Core Ultra 7 265K",
      brand: "Intel",
      specs: "20 núcleos (8P+12E) · até 5.5GHz · desbloqueado p/ OC · LGA1851",
      tag: "Overclock",
      price: 1899.99,
      installment: "10x R$ 223,52",
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/645178/processador-intel-core-ultra-7-265k-5-5ghz-ate-20-nucleos-com-suporte-a-pcie-5-0-e-4-0-e-suporte-a-ddr5-bx80768265k",
      inStock: true,
    },
    {
      id: "u7-265",
      name: "Core Ultra 7 265",
      brand: "Intel",
      specs: "20 núcleos (8P+12E) · até 5.3GHz · multiplicador travado · LGA1851",
      tag: "Normal",
      price: 3845.90,
      installment: "10x R$ 384,59",
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/928069/processador-intel-265-core-ultra-7-1851-3-9-ghz-box-turbo-5-5-ghz-bx80768265",
      inStock: true,
      note: "Preço acima do 265K nesta oferta pontual — vale conferir no site antes de fechar.",
    },
  ],
  gpu: [
    // --- MSI Ventus (both tiers in stock — best discount on the 5070) ---
    {
      id: "gpu-msi-5070-ventus2x",
      name: "GeForce RTX 5070 Ventus 2X OC",
      brand: "MSI",
      line: "RTX 5070",
      specs: "12GB GDDR7 · 192-bit · 6144 CUDA · PCIe 5.0",
      price: 4599.99,
      priceOriginal: 7058.82,
      pixDiscountPct: 15,
      cardPrice: 5411.75,
      cardInstallment: "10x R$ 541,17",
      cardDiscountPct: 10,
      units: 26,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/725587/placa-de-video-msi-geforce-rtx-5070-12g-ventus-2x-oc-12-gb-gddr7-28gbps-nvidia-geforce-rtx-5070-g5070-12v2c",
      inStock: true,
      pair: true,
    },
    {
      id: "gpu-msi-5070ti-ventus3x",
      name: "GeForce RTX 5070 Ti Ventus 3X OC",
      brand: "MSI",
      line: "RTX 5070 Ti",
      specs: "16GB GDDR7 · 256-bit · 8960 CUDA · PCIe 5.0",
      price: 10899.00,
      cardPrice: 10899.00,
      cardInstallment: "10x R$ 1.089,90",
      units: null,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/726011/placa-de-video-rtx-5070-ti-16gb-gddr7-256bits-ventus-3x-oc-msi-912-v531-092",
      inStock: true,
      pair: true,
    },
    // --- Zotac (both tiers, same "Solid OC" sub-line) ---
    {
      id: "gpu-zotac-5070-solid",
      name: "GeForce RTX 5070 Solid OC",
      brand: "Zotac",
      line: "RTX 5070",
      specs: "12GB GDDR7 · 192-bit · 6144 CUDA · PCIe 5.0",
      price: 5435.76,
      cardPrice: 5435.76,
      cardInstallment: "10x R$ 617,70",
      units: null,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/886743/placa-de-video-zotac-rtx-5070-12gb-gaming-solid-oc-ddr7-zt-b50700j-10p",
      inStock: true,
      pair: true,
    },
    {
      id: "gpu-zotac-5070ti-solid",
      name: "GeForce RTX 5070 Ti Solid OC",
      brand: "Zotac",
      line: "RTX 5070 Ti",
      specs: "16GB GDDR7 · 256-bit · 8960 CUDA · PCIe 5.0",
      price: 8999.99,
      cardPrice: 8999.99,
      cardInstallment: "10x R$ 999,99",
      units: null,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/747493/placa-de-video-zotac-rtx-5070-ti-solid-oc-dlss-4-16gb-gddr7-256-bit-pcie-preto",
      inStock: true,
      pair: true,
    },
    // --- Asus (TUF on the 5070, Prime OC on the Ti) ---
    {
      id: "gpu-asus-5070-tuf",
      name: "GeForce RTX 5070 TUF Gaming",
      brand: "Asus",
      line: "RTX 5070",
      specs: "12GB GDDR7 · 192-bit · Axial-tech · PCIe 5.0",
      price: 6740.00,
      cardPrice: 6740.00,
      cardInstallment: "10x R$ 748,88",
      units: null,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/1006301/placa-de-video-asus-rtx-5070-tuf-gaming-nvidia-geforce-blackwell-12gb-gddr7-dlss4-90yv0lz1-m0na00",
      inStock: true,
      pair: true,
    },
    {
      id: "gpu-asus-5070ti-prime",
      name: "GeForce RTX 5070 Ti Prime OC",
      brand: "Asus",
      line: "RTX 5070 Ti",
      specs: "16GB GDDR7 · 256-bit · Axial-tech · PCIe 5.0",
      price: 8869.99,
      cardPrice: 8869.99,
      units: null,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/781985/placa-de-video-asus-prime-rtx-5070-ti-16gb-gddr7-256-bits-3x-dp-1x-hdmi-prime-rtx5070ti-16g",
      inStock: true,
      pair: true,
    },
    // --- Galax (only the 5070 confirmed in stock right now) ---
    {
      id: "gpu-galax-5070",
      name: "GeForce RTX 5070 1-Click OC 2X",
      brand: "Galax",
      line: "RTX 5070",
      specs: "12GB GDDR7 · 192-bit · 6144 CUDA · PCIe 5.0",
      price: 5119.98,
      pixDiscountPct: 10,
      cardPrice: 5688.87,
      cardInstallment: "10x R$ 568,88",
      cardDiscountPct: 10,
      units: null,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/816883/placa-de-video-rtx-5070-1-click-oc-2x-nvidia-galax-12gb-192-bits-3x-displayport-hdmi-57non7mdbroc",
      inStock: true,
      note: "A RTX 5070 Ti da Galax (EX Gamer 1-Click OC) está esgotada no KaBuM agora — sem par da marca disponível nessa linha hoje.",
    },
    // --- Gigabyte (only the 5070 confirmed in stock right now) ---
    {
      id: "gpu-gigabyte-5070",
      name: "GeForce RTX 5070 Gaming OC",
      brand: "Gigabyte",
      line: "RTX 5070",
      specs: "12GB GDDR7 · 192-bit · Windforce · PCIe 5.0",
      price: 6772.90,
      cardPrice: 6772.90,
      cardInstallment: "10x R$ 677,29",
      cardDiscountPct: 8,
      units: null,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/754152/placa-de-video-gigabyte-geforce-rtx-5070-gaming-oc-12gb-gddr7-192-bits-gv-n5070gaming-oc-12gd",
      inStock: true,
      note: "As RTX 5070 Ti da Gigabyte (Gaming OC, Eagle, Windforce SFF) estão todas esgotadas no KaBuM agora — sem par da marca disponível nessa linha hoje.",
    },
  ],
  ram: [
    {
      id: "ram-32",
      name: "Vengeance 32GB (2x16GB)",
      brand: "Corsair",
      size: "32GB",
      sizeGB: 32,
      sticks: 2,
      specs: "DDR5-6000 · CL38 · preta · Intel XMP 3.0",
      price: 3555.54,
      installment: "10x R$ 355,55",
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/988585/memoria-ram-corsair-vengeance-32gb-2x16gb-6000mhz-ddr5-cl38-intel-xmp-preto-cmk32gx5m2b6000c38",
      inStock: true,
    },
    {
      id: "ram-64-2x32",
      name: "Vengeance 64GB (2x32GB)",
      brand: "Corsair",
      size: "64GB",
      sizeGB: 64,
      sticks: 2,
      specs: "DDR5-6000 · CL30 · preta · Intel XMP 3.0",
      price: 13329.29,
      installment: "10x R$ 1.332,92",
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/469049/memoria-ram-corsair-vengeance-64gb-2x32gb-6000mhz-ddr5-cl30-preto-cmk64gx5m2b6000c30",
      inStock: true,
    },
    {
      id: "ram-64-4x16",
      name: "Fury Beast 64GB (4x16GB)",
      brand: "Kingston",
      size: "64GB",
      sizeGB: 64,
      sticks: 4,
      specs: "DDR5-6000 · CL40 · preta · Intel XMP 3.0",
      price: 7899.90,
      pixDiscountPct: 15,
      cardPrice: 9294.00,
      cardInstallment: "10x R$ 929,40",
      cardDiscountPct: 10,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/452736/memoria-ram-kingston-fury-beast-64gb-4x16gb-6000mhz-ddr5-cl40-para-intel-xmp-preto-kf560c40bbk4-64",
      inStock: true,
      note: "4 pentes ocupam todos os slots da placa-mãe — confirme no manual se o kit é validado em 6000MHz com 4 módulos (às vezes o XMP só fecha em clock um pouco menor com todos os slots preenchidos).",
    },
  ],
  mobo: [
    {
      id: "mobo-b860-gigabyte",
      name: "B860 DS3H WIFI6E",
      brand: "Gigabyte",
      specs: "Chipset B860 · ATX · Wi-Fi 6E + Bluetooth · LGA1851",
      price: 1666.66,
      installment: "10x R$ 166,66",
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/723239/placa-mae-gigabyte-b860-ds3h-wifi6e-intel-atx-ddr5-wi-fi-6e-bluetooth-preto-b86d3h6-00",
      inStock: true,
    },
    {
      id: "mobo-b860-msi",
      name: "B860 Gaming Plus WIFI",
      brand: "MSI",
      specs: "Chipset B860 · ATX · Wi-Fi 7 + Bluetooth · LGA1851",
      price: 1733.32,
      installment: "10x R$ 173,33",
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/701355/placa-mae-msi-b860-gaming-plus-wifi-intel-atx-ddr5-udimm-wi-fi-7-preto-b860gpluswifi",
      inStock: true,
    },
    {
      id: "mobo-z890-gigabyte",
      name: "Z890 Eagle WIFI7",
      brand: "Gigabyte",
      specs: "Chipset Z890 · ATX · Wi-Fi 7 + Bluetooth 5.4 · LGA1851",
      price: 2233.22,
      installment: "10x R$ 223,32",
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/630272/placa-mae-gigabyte-z890-eagle-wifi7-intel-atx-ddr5-rgb-wi-fi-7-bluetooth-preto-z890-eagle-wifi7",
      inStock: true,
    },
  ],
  psu: [
    {
      id: "psu-cm-850",
      name: "MWE Gold 850 V3",
      brand: "Cooler Master",
      specs: "850W · 80 Plus Gold · ATX 3.1 · conector 12V-2x6 nativo",
      price: 389.99,
      installment: "10x R$ 43,33",
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/895040/fonte-cooler-master-mwe-gold-850-v3-850w-80-plus-ouro-atx-3-1-pfc-ativo-preto-mpe-8506-acag-bbr",
      inStock: true,
      note: "850W cobre com folga tanto a RTX 5070 (mín. 650W) quanto a 5070 Ti (mín. 750W).",
    },
  ],
  ssd: [
    {
      id: "ssd-1tb",
      name: "XPG S70 Blade 1TB",
      brand: "Adata / XPG",
      size: "1TB",
      specs: "NVMe PCIe Gen4x4 · 7400/5500 MB/s · M.2 2280",
      price: 1299.99,
      installment: "10x R$ 152,94",
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/386844/ssd-xpg-s70-blade-1tb-pcie-gen4-m-2-nvme-leitura-7400mb-s-e-gravacao-5500mb-s-para-pc-e-ps5-agammixs70b-1t-cs",
      inStock: true,
    },
    {
      id: "ssd-2tb",
      name: "XPG S70 Blade 2TB",
      brand: "Adata / XPG",
      size: "2TB",
      specs: "NVMe PCIe Gen4x4 · 7400/6800 MB/s · M.2 2280",
      price: 2449.99,
      installment: "10x R$ 288,23",
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/169968/ssd-xpg-s70-blade-2tb-pcie-gen4x4-m-2-nvme-leitura-7400mb-s-e-gravacao-6400mb-s-3d-nand-preto-agammixs70b-2t-cs",
      inStock: true,
    },
  ],
};

// ----------------------------------------------------------------------------
// Performance model: each game stores a real/benchmark-derived FPS baseline
// measured on an RTX 5070 Ti at 1440p (max preset, RT/PT as noted, DLSS4
// Quality, no frame generation). Selecting a different GPU/CPU in a config
// recalculates the estimate live via estimateFps() below — nothing here is
// hardcoded per "Config A/B", it reacts to whatever part is actually picked.
//
// Game list = the 10 most visually acclaimed titles from 2025 up to today,
// mixing the Steam community's own Steam Awards 2025 vote (category:
// "Estilo Visual Excepcional" / Excellence in Visual Style) with Digital
// Foundry's "Best Graphics of 2025" ranking and general critical/community
// reception for 2026 releases not yet eligible for a Steam Award.
//
// Scaling-ratio sources (RTX 5070 vs RTX 5070 Ti):
// - Sportskeeda GPU benchmark of Resident Evil Requiem on RTX 5070 Ti,
//   1440p Max preset (raster ~121fps, RT ~20% hit, path tracing ~20% further)
// - Notebookcheck RTX 5070 Ti vs RTX 5070 head-to-head (Ti ~19% faster)
// - Windows Central 16-game 1440p Ultra suite (RTX 5070 avg 80.4 fps)
// - BestGPUsForGaming 1440p Ultra comparison (Ti leads 10-20%, more on
//   heavier RT/PT titles, less on lighter/well-optimized ones)
// ----------------------------------------------------------------------------
const GAMES = [
  {
    id: "doom-dark-ages",
    name: "DOOM: The Dark Ages",
    studio: "id Software · id Tech 8",
    released: "mai/2025",
    tags: ["RT obrigatório", "id Tech 8"],
    fps5070Ti: 130,
    gap5070: 0.85, // id Tech 8 é historicamente muito bem otimizado
    source: "Digital Foundry — #1 em \"Melhores Gráficos de 2025\"",
    note: "RT global obrigatório em todas as plataformas, mas a id Tech 8 é tão bem otimizada que sobra fps mesmo assim.",
  },
  {
    id: "ac-shadows",
    name: "Assassin's Creed Shadows",
    studio: "Ubisoft · Anvil",
    released: "mar/2025",
    tags: ["RTGI", "Mundo aberto"],
    fps5070Ti: 85,
    gap5070: 0.78, // jogos Ubisoft de mundo aberto historicamente pesam mais
    source: "Digital Foundry — #2 em \"Melhores Gráficos de 2025\"",
    note: "Iluminação global com ray tracing e vegetação densa cobram seu preço — é o mais pesado da lista.",
  },
  {
    id: "silent-hill-f",
    name: "Silent Hill f",
    studio: "Konami · Unreal Engine 5",
    released: "set/2025",
    tags: ["UE5", "Direção de arte"],
    fps5070Ti: 110,
    gap5070: 0.82,
    source: "Steam Awards 2025 — vencedor de \"Estilo Visual Excepcional\" (voto da comunidade)",
    note: "Prêmio literalmente escolhido pela comunidade Steam — folclore japonês com direção de arte impressionante.",
  },
  {
    id: "clair-obscur",
    name: "Clair Obscur: Expedition 33",
    studio: "Sandfall Interactive · UE5",
    released: "abr/2025",
    tags: ["UE5", "Direção de arte"],
    fps5070Ti: 140,
    gap5070: 0.85,
    source: "Aclamado pela comunidade Steam (\"Overwhelmingly Positive\") e pela crítica",
    note: "RPG por turnos — mais leve que os jogos de ação/mundo aberto da lista, sobra bastante fps.",
  },
  {
    id: "kcd2",
    name: "Kingdom Come: Deliverance II",
    studio: "Warhorse Studios · CryEngine",
    released: "fev/2025",
    tags: ["CryEngine", "Fotorrealismo"],
    fps5070Ti: 120,
    gap5070: 0.83,
    source: "Recepção crítica + comunidade Steam (visual medieval fotorrealista)",
    note: "CryEngine historicamente escala bem entre gerações de GPU; boiêmia medieval com iluminação natural muito elogiada.",
  },
  {
    id: "mafia-old-country",
    name: "Mafia: The Old Country",
    studio: "Hangar 13",
    released: "ago/2025",
    tags: ["Cinemático", "Linear"],
    fps5070Ti: 115,
    gap5070: 0.82,
    source: "Recepção crítica (ambientação siciliana elogiada visualmente)",
    note: "Jogo mais linear (não é mundo aberto), o que ajuda a manter os fps altos mesmo com visual denso.",
  },
  {
    id: "hell-is-us",
    name: "Hell is Us",
    studio: "Rogue Factor · UE5",
    released: "set/2025",
    tags: ["UE5", "Iluminação dinâmica"],
    fps5070Ti: 105,
    gap5070: 0.83,
    source: "NG+ — lista \"10 jogos com os melhores gráficos de 2025\"",
    note: "UE5 com iluminação dinâmica que muda a atmosfera dos cenários ao longo da narrativa.",
  },
  {
    id: "re-requiem",
    name: "Resident Evil Requiem",
    studio: "Capcom · RE Engine",
    released: "fev/2026",
    tags: ["Path Tracing", "DLSS 4"],
    fps5070Ti: 97, // 1440p Max + RT (raster ~121, RT ~-20%)
    gap5070: 0.80,
    source: "Sportskeeda — benchmark real 1440p Max+RT na RTX 5070 Ti",
    note: "Com path tracing puro (sem RT parcial) a 5070 Ti cai para ~78 fps — ative RT em vez de PT se quiser folga.",
  },
  {
    id: "crimson-desert",
    name: "Crimson Desert",
    studio: "Pearl Abyss · Unreal Engine 5",
    released: "mar/2026",
    tags: ["Nanite", "Lumen"],
    fps5070Ti: 100,
    gap5070: 0.84, // Lumen GI é mais leve que path tracing total
    source: "Estimativa por escalonamento (Lumen custa menos que PT total)",
    note: "Mundo aberto fotorrealista; iluminação Lumen é mais leve que path tracing total, então a folga entre as placas encolhe.",
  },
  {
    id: "forza-horizon-6",
    name: "Forza Horizon 6",
    studio: "Playground Games",
    released: "mai/2026",
    tags: ["RT reflexos", "Mundo aberto"],
    fps5070Ti: 115,
    gap5070: 0.86, // RT só nos reflexos, jogo mais leve
    source: "Estimativa por escalonamento (RT parcial, jogo bem otimizado)",
    note: "RT só nos reflexos da carroceria (não é path tracing total), então os fps ficam mais altos.",
  },
];

// ----------------------------------------------------------------------------
// Resolution model. fps5070Ti above is measured/estimated at 1440p (16:9).
// We derive two extra displays from it:
//  - "uw144": 34" ultrawide 144Hz (3440x1440 / UWQHD) — ~34% more pixels than
//    1440p, but still close enough that DLSS4 Quality keeps the hit modest.
//  - "tv4k": 4K TV (3840x2160) — 2.25x the pixels of 1440p. With DLSS4 Quality
//    the internal render resolution is close to 1440p, so the real-world hit
//    is smaller than raw pixel math would suggest, but RT/PT denoising still
//    runs at output resolution, so heavier titles lose proportionally more.
// These are approximations (general GPU-scaling behavior + DLSS4 internal
// resolution behavior), not per-title 4K benchmarks — flagged as such in UI.
// ----------------------------------------------------------------------------
const RESOLUTIONS = [
  { id: "uw144", label: '34" 144Hz (UWQHD)', refreshCap: 144, factor: 0.85 },
  { id: "tv4k", label: "TV 4K (UHD)", refreshCap: null, factor: 0.60 },
];

// K/OC parts sit a hair ahead of their non-K siblings even at 1440p
// (GPU-bound scenes hide most of it, but NPC-dense/CPU-heavy moments show it).
function cpuFactor(cpu) {
  return cpu?.tag === "Overclock" ? 1.0 : 0.97;
}

// Core estimator: baseline (measured on 5070 Ti @1440p) x GPU tier ratio x
// CPU factor x resolution factor. Pass resolutionId = null/"1440p" for the
// underlying 1440p reference number (used internally for the value-badge math).
function estimateFps(game, gpu, cpu, resolutionId) {
  const gpuRatio = gpu?.line === "RTX 5070 Ti" ? 1 : game.gap5070;
  const res = RESOLUTIONS.find((r) => r.id === resolutionId);
  const resFactor = res ? res.factor : 1;
  return Math.round(game.fps5070Ti * gpuRatio * cpuFactor(cpu) * resFactor);
}

// ----------------------------------------------------------------------------
// Cost-benefit annotation — runs once on the "backend" (mock) after fetch.
// For GPUs: groups by `line` (RTX 5070 vs RTX 5070 Ti) and flags the card
// with the lowest R$ per average-fps-across-the-10-games within its own tier.
// For RAM: groups by `size` (32GB vs 64GB) and flags the lowest R$/GB within
// its own capacity tier (only meaningful once there's >1 option per tier).
// ----------------------------------------------------------------------------
function annotateValueBadges(db) {
  // GPU: R$ per average fps, computed per line (tier)
  const avgFpsByGpuId = {};
  db.gpu.forEach((g) => {
    const fpsList = GAMES.map((game) => estimateFps(game, g, null));
    avgFpsByGpuId[g.id] = fpsList.reduce((a, b) => a + b, 0) / fpsList.length;
  });
  ["RTX 5070", "RTX 5070 Ti"].forEach((line) => {
    const group = db.gpu.filter((g) => g.line === line);
    if (group.length < 2) return;
    let best = group[0];
    let bestRatio = best.price / avgFpsByGpuId[best.id];
    group.forEach((g) => {
      const ratio = g.price / avgFpsByGpuId[g.id];
      if (ratio < bestRatio) {
        best = g;
        bestRatio = ratio;
      }
    });
    best.valueBadge = `Melhor custo-benefício (${line})`;
    best.valueRatio = bestRatio;
  });

  // RAM: R$/GB, computed per capacity tier
  ["32GB", "64GB"].forEach((size) => {
    const group = db.ram.filter((r) => r.size === size);
    if (group.length < 2) return;
    let best = group[0];
    let bestRatio = best.price / best.sizeGB;
    group.forEach((r) => {
      const ratio = r.price / r.sizeGB;
      if (ratio < bestRatio) {
        best = r;
        bestRatio = ratio;
      }
    });
    best.valueBadge = `Melhor custo-benefício (${size})`;
    best.valueRatio = bestRatio;
  });

  return db;
}

// Simulated network latency so it genuinely feels like an API call.
function apiFetchAll() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = annotateValueBadges(DB);
      resolve({ data, lastUpdated: RESEARCH_DATE, sources: SOURCES });
    }, 300);
  });
}

// Simulated "refresh" — in this sandbox we can't hit KaBuM/ML live, so this
// just re-confirms the frozen snapshot and is honest about that limitation.
function apiRequestRefresh() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: true,
        message:
          "Estes preços são de uma pesquisa fixa (não ao vivo). Para valores atualizados, peça a nova pesquisa no chat com o Claude.",
      });
    }, 900);
  });
}

/* ============================================================================
   CONSTANTS / HELPERS
============================================================================ */

const CATEGORIES = [
  { key: "cpu", label: "Processador", icon: Cpu },
  { key: "gpu", label: "Placa de vídeo", icon: Zap },
  { key: "ram", label: "Memória RAM", icon: MemoryStick },
  { key: "mobo", label: "Placa-mãe", icon: CircuitBoard },
  { key: "psu", label: "Fonte", icon: BatteryCharging },
  { key: "ssd", label: "SSD M.2", icon: HardDrive },
];

const CONFIG_THEME = {
  A: { accent: "#22D3EE", accentSoft: "rgba(34,211,238,0.12)", label: "Config A" },
  B: { accent: "#F5A623", accentSoft: "rgba(245,166,35,0.12)", label: "Config B" },
};

// ----------------------------------------------------------------------------
// Palette — dark surfaces are applied via inline `style`, not Tailwind
// arbitrary-value classes (e.g. `bg-[#10141C]`), because this runtime only
// ships a pre-built Tailwind stylesheet with no JIT compiler: any class using
// square brackets (`bg-[...]`, `shadow-[...]`, `text-[12px]`, `bg-white/[0.03]`)
// silently fails to apply. That was the actual cause of the "transparent
// header on scroll" bug — the header's background/blur never rendered.
//
// BRAND_GREEN below is extracted from ew.academy: near-black background,
// a single vivid neon-green accent for CTAs/highlights/stat numbers, white
// headlines, gray body text, and cyan-ish strikethrough pricing. The exact
// green here (#39E67A) is slightly deeper than the site's raw neon (~#39FF6A)
// specifically so it still reads clearly as *text* at 12-13px on our near-
// black background (raw neon at small sizes gets a slight halation/glare
// that hurts legibility) while keeping full AA/AAA contrast headroom.
// ----------------------------------------------------------------------------
const BG = "#0A0D13";
const SURFACE = "#10141C";
const BRAND_GREEN = "#39E67A";
const BRAND_GREEN_BG = "rgba(57,230,122,0.12)";
const BRAND_GREEN_BORDER = "rgba(57,230,122,0.35)";
const BRAND_CYAN = "#5BC8E8"; // EW's strikethrough/secondary accent

function formatBRL(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const DEFAULT_A = {
  cpu: "u9-285k",
  gpu: "gpu-asus-5070ti-prime",
  ram: "ram-64-4x16",
  mobo: "mobo-z890-gigabyte",
  psu: "psu-cm-850",
  ssd: "ssd-2tb",
};

const DEFAULT_B = {
  cpu: "u7-265k",
  gpu: "gpu-msi-5070-ventus2x",
  ram: "ram-32",
  mobo: "mobo-b860-msi",
  psu: "psu-cm-850",
  ssd: "ssd-1tb",
};

/* ============================================================================
   SMALL UI PIECES
============================================================================ */

function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-white/5 text-slate-300 border-white/10",
    ok: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    warn: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    value: "bg-lime-500/10 text-lime-300 border-lime-500/25",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function OptionCard({ item, selected, onSelect, accent }) {
  const hasCardBreakdown = item.cardPrice != null;
  return (
    <button
      onClick={() => onSelect(item.id)}
      className={`w-full text-left rounded-xl border p-3 transition-colors ${
        selected
          ? "border-transparent"
          : "border-white/10 bg-white/5 active:bg-white/5"
      }`}
      style={
        selected
          ? { background: `${accent}14`, borderColor: `${accent}55` }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-400">
              {item.brand}
            </span>
            {item.line && <Badge>{item.line}</Badge>}
            {item.size && <Badge>{item.size}</Badge>}
            {item.sticks && <Badge>{item.sticks} pentes</Badge>}
            {item.tag && <Badge tone={item.tag === "Overclock" ? "ok" : "neutral"}>{item.tag}</Badge>}
            {item.pair && <Badge>Par completo na marca</Badge>}
            {item.valueBadge && (
              <Badge tone="value">
                <Tag size={9} className="inline -mt-px mr-0.5" />
                {item.valueBadge}
              </Badge>
            )}
          </div>
          <div className="mt-0.5 text-sm font-semibold text-slate-100 truncate">
            {item.name}
          </div>
          <div className="mt-0.5 text-xs text-slate-400 leading-snug">
            {item.specs}
          </div>

          {/* Stock */}
          <div className="mt-1 flex items-center gap-1 text-xs">
            {item.inStock ? (
              <span className="inline-flex items-center gap-1 text-emerald-300/90">
                <PackageCheck size={12} />
                {item.units ? `Restam ${item.units} un.` : "Em estoque"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-rose-300/90">
                <PackageX size={12} />
                Esgotado
              </span>
            )}
          </div>

          {item.note && (
            <div className="mt-1 flex items-start gap-1 text-xs text-amber-300/90">
              <AlertTriangle size={12} className="mt-0.5 shrink-0" />
              <span>{item.note}</span>
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          {selected && (
            <span
              className="inline-flex items-center justify-center h-5 w-5 rounded-full mb-1"
              style={{ background: accent }}
            >
              <Check size={12} className="text-slate-900" strokeWidth={3} />
            </span>
          )}
        </div>
      </div>

      {hasCardBreakdown ? (
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white/5 border border-white/5 px-2 py-1.5">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              PIX {item.pixDiscountPct ? `· ${item.pixDiscountPct}% OFF` : ""}
            </div>
            <div className="font-mono text-sm font-bold text-emerald-300">
              {formatBRL(item.price)}
            </div>
            {item.priceOriginal && (
              <div className="font-mono text-xs line-through" style={{ color: BRAND_CYAN }}>
                {formatBRL(item.priceOriginal)}
              </div>
            )}
          </div>
          <div className="rounded-lg bg-white/5 border border-white/5 px-2 py-1.5">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Cartão {item.cardDiscountPct ? `· ${item.cardDiscountPct}% à vista` : ""}
            </div>
            <div className="font-mono text-sm font-bold text-slate-100">
              {formatBRL(item.cardPrice)}
            </div>
            <div className="font-mono text-xs text-slate-400">
              {item.cardInstallment}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-2 flex items-end justify-between">
          <div>
            <div className="font-mono text-base font-bold text-slate-50">
              {formatBRL(item.price)}
            </div>
            <div className="font-mono text-xs text-slate-400">
              {item.installment}
            </div>
          </div>
        </div>
      )}

      <div className="mt-2 flex justify-end">
        <a
          href={item.link}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-300 active:bg-white/10"
        >
          {item.source}
          <ExternalLink size={11} />
        </a>
      </div>
    </button>
  );
}

function CategoryAccordion({ catKey, label, Icon, items, selectedId, onSelect, accent, openKey, setOpenKey }) {
  const isOpen = openKey === catKey;
  const selectedItem = items.find((i) => i.id === selectedId);

  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: SURFACE }}>
      <button
        onClick={() => setOpenKey(isOpen ? null : catKey)}
        className="w-full flex items-center gap-3 p-3.5 active:bg-white/5"
      >
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
          style={{ background: `${accent}1A`, color: accent }}
        >
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1 text-left">
          <div className="text-xs uppercase tracking-wider text-slate-400">
            {label}
          </div>
          <div className="text-sm font-semibold text-slate-100 truncate">
            {selectedItem ? selectedItem.name : "Selecionar…"}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono text-sm font-bold text-slate-100">
            {selectedItem ? formatBRL(selectedItem.price) : "—"}
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`text-slate-400 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="border-t border-white/10 p-3 space-y-2 bg-black/20">
          {catKey === "gpu" && (
            <div className="flex items-start gap-1.5 text-xs text-slate-400 leading-relaxed px-1 pb-1">
              <Info size={11} className="mt-0.5 shrink-0" />
              <span>
                "Melhor custo-benefício" = menor R$ por fps médio nos 10 jogos da aba
                Jogos, calculado separadamente para RTX 5070 e RTX 5070 Ti.
              </span>
            </div>
          )}
          {catKey === "ram" && (
            <div className="flex items-start gap-1.5 text-xs text-slate-400 leading-relaxed px-1 pb-1">
              <Info size={11} className="mt-0.5 shrink-0" />
              <span>
                "Melhor custo-benefício" = menor R$ por GB, comparado só entre kits da
                mesma capacidade (32GB entre si, 64GB entre si).
              </span>
            </div>
          )}
          {items.map((item) => (
            <OptionCard
              key={item.id}
              item={item}
              selected={item.id === selectedId}
              onSelect={(id) => {
                onSelect(catKey, id);
                setOpenKey(null);
              }}
              accent={accent}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ConfigBuilder({ label, accent, config, setConfig, db }) {
  const [openKey, setOpenKey] = useState(null);

  const handleSelect = useCallback(
    (catKey, id) => {
      setConfig((prev) => ({ ...prev, [catKey]: id }));
    },
    [setConfig]
  );

  const total = useMemo(() => {
    return CATEGORIES.reduce((sum, c) => {
      const item = db[c.key]?.find((i) => i.id === config[c.key]);
      return sum + (item ? item.price : 0);
    }, 0);
  }, [config, db]);

  return (
    <div className="space-y-3">
      <div
        className="rounded-2xl p-4 border"
        style={{ background: `${accent}12`, borderColor: `${accent}40` }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide" style={{ color: accent }}>
            {label}
          </span>
          <Scale size={16} style={{ color: accent }} />
        </div>
        <div className="mt-1 font-mono text-3xl font-black text-slate-50 tabular-nums">
          {formatBRL(total)}
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          soma dos 6 componentes selecionados
        </div>
      </div>

      <div className="space-y-2.5">
        {CATEGORIES.map((c) => (
          <CategoryAccordion
            key={c.key}
            catKey={c.key}
            label={c.label}
            Icon={c.icon}
            items={db[c.key] || []}
            selectedId={config[c.key]}
            onSelect={handleSelect}
            accent={accent}
            openKey={openKey}
            setOpenKey={setOpenKey}
          />
        ))}
      </div>
    </div>
  );
}

function CompareView({ configA, configB, db }) {
  const buildLines = (config) =>
    CATEGORIES.map((c) => {
      const item = db[c.key]?.find((i) => i.id === config[c.key]);
      return { cat: c.label, item };
    });

  const totalA = buildLines(configA).reduce((s, l) => s + (l.item?.price || 0), 0);
  const totalB = buildLines(configB).reduce((s, l) => s + (l.item?.price || 0), 0);
  const max = Math.max(totalA, totalB, 1);
  const pctA = (totalA / max) * 100;
  const pctB = (totalB / max) * 100;
  const diff = Math.abs(totalA - totalB);
  const cheaper = totalA === totalB ? null : totalA < totalB ? "A" : "B";

  return (
    <div className="space-y-4">
      {/* Signature diff meter */}
      <div className="rounded-2xl border border-white/10 p-4" style={{ background: SURFACE }}>
        <div className="text-xs uppercase tracking-wider text-slate-400 mb-3">
          Diferença de preço
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-6 font-mono text-xs font-bold" style={{ color: CONFIG_THEME.A.accent }}>A</span>
            <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pctA}%`, background: CONFIG_THEME.A.accent }}
              />
            </div>
            <span className="font-mono text-xs text-slate-300 w-24 text-right shrink-0">
              {formatBRL(totalA)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 font-mono text-xs font-bold" style={{ color: CONFIG_THEME.B.accent }}>B</span>
            <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pctB}%`, background: CONFIG_THEME.B.accent }}
              />
            </div>
            <span className="font-mono text-xs text-slate-300 w-24 text-right shrink-0">
              {formatBRL(totalB)}
            </span>
          </div>
        </div>
        {cheaper && (
          <div className="mt-3 text-center text-sm">
            <span className="text-slate-400">Config </span>
            <span
              className="font-bold"
              style={{ color: cheaper === "A" ? CONFIG_THEME.A.accent : CONFIG_THEME.B.accent }}
            >
              {cheaper}
            </span>
            <span className="text-slate-400"> é </span>
            <span className="font-mono font-bold text-slate-100">{formatBRL(diff)}</span>
            <span className="text-slate-400"> mais barata</span>
          </div>
        )}
      </div>

      {/* Line by line */}
      {[
        { key: "A", config: configA, total: totalA },
        { key: "B", config: configB, total: totalB },
      ].map(({ key, config, total }) => {
        const theme = CONFIG_THEME[key];
        const lines = buildLines(config);
        return (
          <div
            key={key}
            className="rounded-2xl border p-4"
            style={{ borderColor: `${theme.accent}40`, background: `${theme.accent}0A` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold" style={{ color: theme.accent }}>
                {theme.label}
              </span>
              <span className="font-mono text-lg font-black text-slate-50">
                {formatBRL(total)}
              </span>
            </div>
            <div className="divide-y divide-white/5">
              {lines.map((l, i) => (
                <div key={i} className="flex items-center justify-between py-2 gap-2">
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      {l.cat}
                    </div>
                    <div className="text-xs text-slate-200 truncate">
                      {l.item ? `${l.item.brand} · ${l.item.name}` : "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs text-slate-300">
                      {l.item ? formatBRL(l.item.price) : "—"}
                    </span>
                    {l.item && (
                      <a
                        href={l.item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GamesView({ configA, configB, db }) {
  const [resolution, setResolution] = useState("uw144");
  const gpuA = db.gpu.find((g) => g.id === configA.gpu);
  const gpuB = db.gpu.find((g) => g.id === configB.gpu);
  const cpuA = db.cpu.find((c) => c.id === configA.cpu);
  const cpuB = db.cpu.find((c) => c.id === configB.cpu);
  const resMeta = RESOLUTIONS.find((r) => r.id === resolution);

  const rows = GAMES.map((game) => ({
    ...game,
    fpsA: estimateFps(game, gpuA, cpuA, resolution),
    fpsB: estimateFps(game, gpuB, cpuB, resolution),
  }));
  const maxFps = Math.max(...rows.map((g) => Math.max(g.fpsA, g.fpsB)), 1);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/10 p-4" style={{ background: SURFACE }}>
        <div className="flex items-center gap-2 mb-1">
          <Gamepad2 size={16} className="text-slate-400" />
          <span className="text-xs uppercase tracking-wider text-slate-400">
            10 jogos mais bonitos de 2025 até hoje
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          FPS recalculado ao vivo a partir da <strong className="text-slate-300">GPU e CPU que você escolheu</strong>{" "}
          em cada config — preset máximo, Ray/Path Tracing, DLSS 4 Qualidade, sem frame generation.
        </p>

        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {RESOLUTIONS.map((r) => (
            <button
              key={r.id}
              onClick={() => setResolution(r.id)}
              className="rounded-lg py-1.5 text-xs font-bold border transition-colors"
              style={
                resolution === r.id
                  ? { background: "#F472B620", borderColor: "#F472B660", color: "#F472B6" }
                  : { borderColor: "rgba(255,255,255,0.08)", color: "#94A3B8" }
              }
            >
              {r.label}
            </button>
          ))}
        </div>
        {resMeta?.refreshCap && (
          <div className="mt-2 flex items-start gap-1 text-xs text-slate-400 leading-relaxed">
            <Info size={12} className="mt-0.5 shrink-0" />
            <span>Monitor de 144Hz — fps acima disso não trazem quadros extras na tela, só folga de latência (🔒 = travando no teto do monitor).</span>
          </div>
        )}

        <div className="mt-2 flex flex-col gap-0.5 text-xs font-mono">
          <span style={{ color: CONFIG_THEME.A.accent }}>
            A · {cpuA?.name} + {gpuA?.brand} {gpuA?.name}
          </span>
          <span style={{ color: CONFIG_THEME.B.accent }}>
            B · {cpuB?.name} + {gpuB?.brand} {gpuB?.name}
          </span>
        </div>
      </div>

      {rows.map((game) => {
        const cappedA = !!(resMeta?.refreshCap && game.fpsA >= resMeta.refreshCap);
        const cappedB = !!(resMeta?.refreshCap && game.fpsB >= resMeta.refreshCap);
        return (
        <div
          key={game.id}
          className="rounded-2xl border border-white/10 p-4" style={{ background: SURFACE }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-bold text-slate-100">
                {game.name}
              </div>
              <div className="text-xs text-slate-400">
                {game.studio} · {game.released}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              {game.tags.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className="w-6 font-mono text-xs font-bold shrink-0"
                style={{ color: CONFIG_THEME.A.accent }}
              >
                A
              </span>
              <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(Math.min(game.fpsA, resMeta?.refreshCap ?? game.fpsA) / maxFps) * 100}%`,
                    background: CONFIG_THEME.A.accent,
                  }}
                />
              </div>
              <span className="font-mono text-xs text-slate-300 w-20 text-right shrink-0">
                {game.fpsA} fps{cappedA ? " 🔒" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-6 font-mono text-xs font-bold shrink-0"
                style={{ color: CONFIG_THEME.B.accent }}
              >
                B
              </span>
              <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(Math.min(game.fpsB, resMeta?.refreshCap ?? game.fpsB) / maxFps) * 100}%`,
                    background: CONFIG_THEME.B.accent,
                  }}
                />
              </div>
              <span className="font-mono text-xs text-slate-300 w-20 text-right shrink-0">
                {game.fpsB} fps{cappedB ? " 🔒" : ""}
              </span>
            </div>
          </div>

          <div className="mt-2.5 flex items-start gap-1 text-xs text-slate-400 leading-relaxed">
            <Info size={12} className="mt-0.5 shrink-0" />
            <span>{game.note}</span>
          </div>
          <div className="mt-1 text-xs font-mono text-slate-400">
            fonte: {game.source}
          </div>
        </div>
        );
      })}
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-2 mb-4 flex flex-col items-center gap-3 px-4 py-5 border-t border-white/10 text-center">
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
        style={{
          borderColor: BRAND_GREEN_BORDER,
          background: BRAND_GREEN_BG,
          color: BRAND_GREEN,
        }}
      >
        <GithubMark size={13} />
        {GITHUB_URL.replace(/^https?:\/\//, "")}
      </a>
      <p className="text-xs text-slate-400">
        David Ferreira · Todos os direitos reservados
      </p>
    </footer>
  );
}

/* ============================================================================
   ROOT APP
============================================================================ */

export default function PCConfigComparator() {
  const [db, setDb] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(RESEARCH_DATE);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState("");
  const [tab, setTab] = useState("A"); // 'A' | 'B' | 'compare'

  const [configA, setConfigA] = useState(DEFAULT_A);
  const [configB, setConfigB] = useState(DEFAULT_B);

  useEffect(() => {
    apiFetchAll().then((res) => {
      setDb(res.data);
      setLastUpdated(res.lastUpdated);
      setLoading(false);
    });
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setRefreshMsg("");
    apiRequestRefresh().then((res) => {
      setRefreshing(false);
      setRefreshMsg(res.message);
    });
  };

  if (loading || !db) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <div className="flex items-center gap-2 text-slate-400 font-mono text-sm">
          <RefreshCw size={16} className="animate-spin" />
          carregando peças…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 pb-24" style={{ background: BG }}>
      {/* Header */}
      <header
        className="sticky top-0 z-20 backdrop-blur-2xl border-b border-white/10 px-4 pt-4 pb-3"
        style={{
          background: "rgba(10,13,19,0.92)",
          WebkitBackdropFilter: "blur(24px)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 8px 24px -8px rgba(0,0,0,0.6)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black tracking-tight">Monta&nbsp;PC</h1>
            <p className="text-xs text-slate-400 -mt-0.5">
              comparador de configurações · Ultra 9/7 + RTX 5070/Ti
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 active:bg-white/10 disabled:opacity-60"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "checando…" : "Atualizar pesquisa"}
          </button>
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <Info size={11} />
          pesquisa fixa de {formatDate(lastUpdated)} · fontes: {SOURCES.join(" + ")}
        </div>

        {refreshMsg && (
          <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            {refreshMsg}
          </div>
        )}

        {/* Tabs */}
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {[
            { key: "A", label: "Config A", color: CONFIG_THEME.A.accent },
            { key: "B", label: "Config B", color: CONFIG_THEME.B.accent },
            { key: "compare", label: "Comparar", color: "#94A3B8" },
            { key: "games", label: "Jogos", color: "#F472B6" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="rounded-xl py-2 text-xs font-bold border transition-colors"
              style={
                tab === t.key
                  ? { background: `${t.color}20`, borderColor: `${t.color}60`, color: t.color }
                  : { borderColor: "rgba(255,255,255,0.08)", color: "#94A3B8" }
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Body */}
      <main className="px-4 pt-4 max-w-md mx-auto">
        {tab === "A" && (
          <ConfigBuilder
            label={CONFIG_THEME.A.label}
            accent={CONFIG_THEME.A.accent}
            config={configA}
            setConfig={setConfigA}
            db={db}
          />
        )}
        {tab === "B" && (
          <ConfigBuilder
            label={CONFIG_THEME.B.label}
            accent={CONFIG_THEME.B.accent}
            config={configB}
            setConfig={setConfigB}
            db={db}
          />
        )}
        {tab === "compare" && (
          <CompareView configA={configA} configB={configB} db={db} />
        )}
        {tab === "games" && (
          <GamesView configA={configA} configB={configB} db={db} />
        )}

        <div className="mt-6 mb-4 rounded-xl border border-white/5 bg-white/5 p-3 text-xs leading-relaxed text-slate-400">
          Preços "de vitrine" (à vista/PIX quando disponível), só produtos novos —
          nenhum item aqui é open box. Estoque de placa de vídeo no KaBuM muda em
          minutos: confira o link antes de comprar.
        </div>
      </main>

      <Footer />
    </div>
  );
}
