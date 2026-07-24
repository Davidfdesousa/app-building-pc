import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  Search,
  Star,
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
   pages on KaBuM! during a research pass on 23/07/2026 — prices, PIX/cartão
   conditions, stock and discounts are all sourced only from KaBuM! now (no
   Mercado Livre). The app does NOT hit KaBuM live on every load — it reads
   this frozen snapshot. Tapping "Atualizar pesquisa" simulates calling the
   API again; a true refresh (new live prices) has to be requested from
   Claude in the chat, since this sandbox can't reach kabum.com.br directly.
============================================================================ */

const RESEARCH_DATE = "2026-07-23";
const SOURCES = ["KaBuM!"];
// Bumped to v2 after the 23/07/2026 price/stock refresh — the old cached
// snapshot under v1 would otherwise mask the new prices for returning users.
const STORAGE_KEY = "monta-pc:v2";
const GITHUB_URL = "https://github.com/Davidfdesousa";

const DB = {
  cpu: [
    {
      id: "u9-285k",
      name: "Core Ultra 9 285K",
      brand: "Intel",
      specs: "24 núcleos (8P+16E) · até 5.7GHz · desbloqueado p/ OC · LGA1851",
      tag: "Overclock",
      // Índice de gaming (1080p, quanto mais CPU-bound mais aparece). Referência = 285K = 1.00.
      // Base: 285K 144.9 fps vs 265K 138.8 fps (geomean 16 jogos, Tom's Hardware/Tech4Gamers).
      cpuGameIndex: 1.0,
      price: 3999.99,
      priceOriginal: 5547.05,
      pixDiscountPct: 15,
      cardPrice: 4705.87,
      cardInstallment: "10x R$ 470,58",
      cardDiscountPct: 10,
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
      // ~2% abaixo do 285K em jogos (clocks de boost menores, mesma config de núcleos) — interpolado.
      cpuGameIndex: 0.98,
      price: 2999.99,
      priceOriginal: 5247.05,
      pixDiscountPct: 15,
      cardPrice: 3529.40,
      cardInstallment: "10x R$ 352,94",
      cardDiscountPct: 10,
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
      // 138.8/144.9 = 0.958 vs 285K (geomean 16 jogos 1080p, Tom's Hardware/Tech4Gamers).
      cpuGameIndex: 0.958,
      price: 1999.99,
      priceOriginal: 3529.40,
      pixDiscountPct: 15,
      cardPrice: 2352.93,
      cardInstallment: "10x R$ 235,29",
      cardDiscountPct: 10,
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
      // ~1.5% abaixo do 265K em jogos (boost menor, sem OC) — interpolado.
      cpuGameIndex: 0.945,
      price: 3034.07,
      pixDiscountPct: 8,
      cardPrice: 3297.90,
      cardInstallment: "10x R$ 329,79",
      cardDiscountPct: 8,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/928069/processador-intel-265-core-ultra-7-1851-3-9-ghz-box-turbo-5-5-ghz-bx80768265",
      inStock: true,
      note: "Preço acima do 265K nesta oferta pontual — vale conferir no site antes de fechar.",
    },
  ],
  gpu: [
    // --- MSI Ventus (both tiers ainda em estoque) ---
    {
      id: "gpu-msi-5070-ventus2x",
      name: "GeForce RTX 5070 Ventus 2X OC",
      brand: "MSI",
      line: "RTX 5070",
      specs: "12GB GDDR7 · 192-bit · 6144 CUDA · PCIe 5.0",
      price: 6000.00,
      pixDiscountPct: 15,
      cardPrice: 7058.82,
      cardInstallment: "10x R$ 705,88",
      cardDiscountPct: 10,
      units: null,
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
      price: 9999.00,
      installment: "10x R$ 999,90",
      units: null,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/726011/placa-de-video-rtx-5070-ti-16gb-gddr7-256bits-ventus-3x-oc-msi-912-v531-092",
      inStock: true,
      pair: true,
    },
    // --- Asus (Prime OC do 5070 em estoque; Prime OC do Ti esgotado) ---
    {
      id: "gpu-asus-5070-prime-oc",
      name: "GeForce RTX 5070 Prime OC",
      brand: "Asus",
      line: "RTX 5070",
      specs: "12GB GDDR7 · 192-bit · Blackwell · DLSS4 · PCIe 5.0",
      price: 4499.99,
      priceOriginal: 7612.22,
      pixDiscountPct: 10,
      cardPrice: 4999.99,
      cardInstallment: "10x R$ 499,99",
      cardDiscountPct: 10,
      units: null,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/706476/placa-de-video-asus-prime-rtx-5070-o12g-nvidia-geforce-12gb-gddr7-blackwell-e-dlss4-ray-tracing-edicao-oc-90yv0m10-m0na00",
      inStock: true,
    },
    // --- Galax (só o 5070 em estoque) ---
    {
      id: "gpu-galax-5070",
      name: "GeForce RTX 5070 1-Click OC 2X",
      brand: "Galax",
      line: "RTX 5070",
      specs: "12GB GDDR7 · 192-bit · 6144 CUDA · PCIe 5.0",
      price: 5199.00,
      priceOriginal: 6598.78,
      pixDiscountPct: 10,
      cardPrice: 5776.67,
      cardInstallment: "10x R$ 577,66",
      cardDiscountPct: 10,
      units: null,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/816883/placa-de-video-rtx-5070-1-click-oc-2x-nvidia-galax-12gb-192-bits-3x-displayport-hdmi-57non7mdbroc",
      inStock: true,
      note: "A RTX 5070 Ti da Galax (EX Gamer 1-Click OC) está esgotada no KaBuM agora — sem par da marca disponível nessa linha hoje.",
    },
    // --- Gigabyte (só o 5070 em estoque) ---
    {
      id: "gpu-gigabyte-5070",
      name: "GeForce RTX 5070 Gaming OC",
      brand: "Gigabyte",
      line: "RTX 5070",
      specs: "12GB GDDR7 · 192-bit · Windforce · PCIe 5.0",
      price: 6231.07,
      pixDiscountPct: 8,
      cardPrice: 6772.90,
      cardInstallment: "10x R$ 677,29",
      cardDiscountPct: 8,
      units: null,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/754152/placa-de-video-gigabyte-geforce-rtx-5070-gaming-oc-12gb-gddr7-192-bits-gv-n5070gaming-oc-12gd",
      inStock: true,
      note: "As RTX 5070 Ti da Gigabyte (Gaming OC, Eagle, Windforce SFF) estão todas esgotadas no KaBuM agora — sem par da marca disponível nessa linha hoje.",
    },
    // --- Esgotados no KaBuM em 23/07/2026 (mantidos p/ referência de preço) ---
    {
      id: "gpu-zotac-5070-solid",
      name: "GeForce RTX 5070 Solid OC",
      brand: "Zotac",
      line: "RTX 5070",
      specs: "12GB GDDR7 · 192-bit · 6144 CUDA · PCIe 5.0",
      price: 5435.76,
      installment: "10x R$ 617,70",
      units: 0,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/886743/placa-de-video-zotac-rtx-5070-12gb-gaming-solid-oc-ddr7-zt-b50700j-10p",
      inStock: false,
    },
    {
      id: "gpu-zotac-5070ti-solid",
      name: "GeForce RTX 5070 Ti Solid OC",
      brand: "Zotac",
      line: "RTX 5070 Ti",
      specs: "16GB GDDR7 · 256-bit · 8960 CUDA · PCIe 5.0",
      price: 8999.99,
      installment: "10x R$ 999,99",
      units: 0,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/747493/placa-de-video-zotac-rtx-5070-ti-solid-oc-dlss-4-16gb-gddr7-256-bit-pcie-preto",
      inStock: false,
    },
    {
      id: "gpu-asus-5070-tuf",
      name: "GeForce RTX 5070 TUF Gaming",
      brand: "Asus",
      line: "RTX 5070",
      specs: "12GB GDDR7 · 192-bit · Axial-tech · PCIe 5.0",
      price: 6740.00,
      installment: "10x R$ 748,88",
      units: 0,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/1006301/placa-de-video-asus-rtx-5070-tuf-gaming-nvidia-geforce-blackwell-12gb-gddr7-dlss4-90yv0lz1-m0na00",
      inStock: false,
    },
    {
      id: "gpu-asus-5070ti-prime",
      name: "GeForce RTX 5070 Ti Prime OC",
      brand: "Asus",
      line: "RTX 5070 Ti",
      specs: "16GB GDDR7 · 256-bit · Axial-tech · PCIe 5.0",
      price: 8869.99,
      installment: "10x R$ 985,55",
      units: 0,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/781985/placa-de-video-asus-prime-rtx-5070-ti-16gb-gddr7-256-bits-3x-dp-1x-hdmi-prime-rtx5070ti-16g",
      inStock: false,
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
      mtps: 6000,
      cl: 38, // latência efetiva ≈ 12.67ns
      price: 3199.99,
      priceOriginal: 5822.11,
      pixDiscountPct: 10,
      cardPrice: 3555.54,
      cardInstallment: "10x R$ 355,55",
      cardDiscountPct: 10,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/988585/memoria-ram-corsair-vengeance-32gb-2x16gb-6000mhz-ddr5-cl38-intel-xmp-preto-cmk32gx5m2b6000c38",
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
      mtps: 6000,
      cl: 40, // latência efetiva ≈ 13.33ns
      price: 7899.90,
      priceOriginal: 9082.24,
      pixDiscountPct: 15,
      cardPrice: 9294.00,
      cardInstallment: "10x R$ 929,40",
      cardDiscountPct: 10,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/452736/memoria-ram-kingston-fury-beast-64gb-4x16gb-6000mhz-ddr5-cl40-para-intel-xmp-preto-kf560c40bbk4-64",
      inStock: true,
      note: "4 pentes ocupam todos os slots da placa-mãe — confirme no manual se o kit é validado em 6000MHz com 4 módulos (às vezes o XMP só fecha em clock um pouco menor com todos os slots preenchidos).",
    },
    {
      id: "ram-64-2x32",
      name: "Vengeance 64GB (2x32GB)",
      brand: "Corsair",
      size: "64GB",
      sizeGB: 64,
      sticks: 2,
      specs: "DDR5-6000 · CL30 · preta · Intel XMP 3.0",
      mtps: 6000,
      cl: 30, // latência efetiva ≈ 10.0ns (melhor kit)
      price: 13329.29,
      installment: "10x R$ 1.332,92",
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/469049/memoria-ram-corsair-vengeance-64gb-2x32gb-6000mhz-ddr5-cl30-preto-cmk64gx5m2b6000c30",
      inStock: false,
    },
  ],
  mobo: [
    {
      id: "mobo-b860-gigabyte",
      name: "B860 DS3H WIFI6E",
      brand: "Gigabyte",
      specs: "Chipset B860 · ATX · Wi-Fi 6E + Bluetooth · LGA1851",
      price: 1199.99,
      priceOriginal: 1666.66,
      pixDiscountPct: 10,
      cardPrice: 1333.32,
      cardInstallment: "10x R$ 133,33",
      cardDiscountPct: 10,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/723239/placa-mae-gigabyte-b860-ds3h-wifi6e-intel-atx-ddr5-wi-fi-6e-bluetooth-preto-b86d3h6-00",
      inStock: true,
    },
    {
      id: "mobo-b860-msi",
      name: "B860 Gaming Plus WIFI",
      brand: "MSI",
      specs: "Chipset B860 · ATX · Wi-Fi 7 + Bluetooth · LGA1851",
      price: 1899.99,
      priceOriginal: 2388.78,
      pixDiscountPct: 10,
      cardPrice: 2111.10,
      cardInstallment: "10x R$ 211,11",
      cardDiscountPct: 10,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/701355/placa-mae-msi-b860-gaming-plus-wifi-intel-atx-ddr5-udimm-wi-fi-7-preto-b860gpluswifi",
      inStock: true,
    },
    {
      id: "mobo-nzxt-n7-z890",
      name: "N7 Z890",
      brand: "NZXT",
      specs: "Chipset Z890 · ATX · Wi-Fi + Bluetooth · cover metálica · LGA1851",
      price: 2999.99,
      priceOriginal: 3666.66,
      pixDiscountPct: 10,
      cardPrice: 3333.32,
      cardInstallment: "10x R$ 333,33",
      cardDiscountPct: 10,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/909150/placa-mae-gaming-nzxt-n7-z890-intel-z890-lga-1851-atx-ddr5-com-wi-fi-e-cover-preta-n7-z89xt-b1",
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
      inStock: false,
    },
  ],
  psu: [
    {
      id: "psu-cm-850",
      name: "MWE Gold 850 V3",
      brand: "Cooler Master",
      specs: "850W · 80 Plus Gold · ATX 3.1 · conector 12V-2x6 nativo",
      price: 339.99,
      priceOriginal: 444.43,
      pixDiscountPct: 10,
      cardPrice: 377.77,
      cardInstallment: "10x R$ 37,77",
      cardDiscountPct: 10,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/895040/fonte-cooler-master-mwe-gold-850-v3-850w-80-plus-ouro-atx-3-1-pfc-ativo-preto-mpe-8506-acag-bbr",
      inStock: true,
      note: "850W cobre com folga tanto a RTX 5070 (mín. 650W) quanto a 5070 Ti (mín. 750W).",
    },
    {
      id: "psu-gigabyte-ud850gm",
      name: "UD850GM",
      brand: "Gigabyte",
      specs: "850W · 80 Plus Gold · modular · PFC ativo",
      price: 569.99,
      priceOriginal: 777.77,
      pixDiscountPct: 10,
      cardPrice: 633.32,
      cardInstallment: "10x R$ 63,33",
      cardDiscountPct: 10,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/907601/fonte-gigabyte-ud850gm-850w-80-plus-gold-modular-pfc-ativo-preto-28200-ud850g-1arr",
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
      price: 1773.20,
      pixDiscountPct: 12,
      cardPrice: 2015.00,
      cardInstallment: "10x R$ 201,50",
      cardDiscountPct: 10,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/386844/ssd-xpg-s70-blade-1tb-pcie-gen4-m-2-nvme-leitura-7400mb-s-e-gravacao-5500mb-s-para-pc-e-ps5-agammixs70b-1t-cs",
      inStock: true,
    },
    {
      id: "ssd-sandisk-sn7100-2tb",
      name: "SanDisk SN7100 2TB",
      brand: "Sandisk",
      size: "2TB",
      specs: "NVMe PCIe Gen4 · 7250/6900 MB/s · M.2 2280",
      price: 3179.90,
      pixDiscountPct: 15,
      cardPrice: 3741.06,
      cardInstallment: "10x R$ 374,10",
      cardDiscountPct: 10,
      source: "KaBuM!",
      link: "https://www.kabum.com.br/produto/729817/ssd-sandisk-sn7100-nvme-2tb-m-2-pcle-gen4-leitura-7-250mb-s-e-gravacao-6-900mb-s-wds200t4x0e",
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
      inStock: false,
    },
  ],
};

// ----------------------------------------------------------------------------
// Performance model (grounded in published benchmarks — see estimateFps below)
// ----------------------------------------------------------------------------
// Each game stores a real/benchmark-derived FPS baseline measured on an RTX
// 5070 Ti at 1440p (max preset, RT/PT as noted, DLSS4 Quality, no frame gen).
// estimateFps() then reacts LIVE to the GPU, CPU and RAM actually picked —
// nothing is hardcoded per "Config A/B". The model is intentionally
// GPU-dominant: at 1440p/4K these games are GPU-bound, so CPU/RAM move the
// number only a little (that's the real physics, not a limitation).
//
// Game list = 20 of the most visually acclaimed titles by community consensus
// — the 2025/2026 showcase releases plus enduring "prettiest games" favorites
// (Cyberpunk 2077 PT, Alan Wake 2, RDR2, Ghost of Tsushima, etc.), mixing the
// Steam Awards 2025 community vote ("Estilo Visual Excepcional"), Digital
// Foundry's "Best Graphics of 2025" ranking and broad critical reception.
//
// GPU scaling (RTX 5070 vs RTX 5070 Ti) — sources:
// - Sportskeeda benchmark of Resident Evil Requiem on RTX 5070 Ti 1440p Max
// - Notebookcheck 5070 Ti vs 5070 head-to-head (Ti ~19% faster @1440p)
// - Windows Central 16-game suite (5070 Ti 100.3 vs 5070 80.4 @1440p;
//   61.2 vs 46.7 @4K — gap widens at 4K, modeled via gap5070Adjust)
// - BestGPUsForGaming 1440p Ultra (Ti leads more on heavy RT/PT titles)
// gap5070 per game = the 1440p 5070/5070Ti ratio, wider on RT/PT-heavy games.
//
// CPU gaming index (cpuGameIndex in the CPU DB) — sources:
// - Tom's Hardware / Tech4Gamers: Ultra 9 285K 144.9 fps vs Ultra 7 265K
//   138.8 fps (geomean, 16 games, 1080p) => 265K = 0.958 of 285K. That ~4%
//   is the MAX (fully CPU-bound @1080p); it shrinks toward 0 at 1440p/4K.
// RAM index (cl + mtps in the RAM DB): effective latency (CL/MT/s) drives a
//   sub-1% effect at these resolutions. Capacity (32 vs 64GB) has ~0 effect on
//   average FPS above the game's working set, so it is deliberately NOT modeled.
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
  // ----- + 10 clássicos "mais bonitos" segundo a comunidade (incl. Cyberpunk) -----
  {
    id: "cyberpunk-2077",
    name: "Cyberpunk 2077: Phantom Liberty",
    studio: "CD Projekt RED · REDengine",
    released: "set/2023",
    tags: ["Path Tracing", "DLSS 4"],
    fps5070Ti: 62, // 1440p, Path Tracing (RT Overdrive) + DLSS4 Q, sem frame gen
    gap5070: 0.78, // PT alarga a distância entre as placas
    source: "Benchmark real RTX 5070 Ti 1440p (Vortex/NoobFeed) — PT + DLSS4 Q",
    note: "Número no modo Path Tracing (RT Overdrive). Só com RT (sem PT) sobe pra ~105 fps; com Frame Generation o FPS exibido praticamente dobra.",
  },
  {
    id: "alan-wake-2",
    name: "Alan Wake 2",
    studio: "Remedy · Northlight",
    released: "out/2023",
    tags: ["Path Tracing", "DLSS 4"],
    fps5070Ti: 70, // 1440p Full RT (PT) + DLSS4 Q, sem frame gen
    gap5070: 0.80,
    source: "Derivado de benchmark 1440p Full RT + DLSS (thefpsreview/Nvidia)",
    note: "Um dos path tracings mais pesados que existem; sem frame generation exige DLSS Qualidade pra passar de 60 fps.",
  },
  {
    id: "black-myth-wukong",
    name: "Black Myth: Wukong",
    studio: "Game Science · Unreal Engine 5",
    released: "ago/2024",
    tags: ["Full RT", "UE5"],
    fps5070Ti: 64, // 1440p Very High RT + DLSS Q
    gap5070: 0.80,
    source: "Benchmark real RTX 5070 Ti 1440p (~64 fps, Very High RT + DLSS Q)",
    note: "Com Full Ray Tracing ligado é bem pesado; a benchmark do Cinematic usa DLSS Qualidade pra manter jogável.",
  },
  {
    id: "hellblade-2",
    name: "Hellblade II: Senua's Saga",
    studio: "Ninja Theory · Unreal Engine 5",
    released: "mai/2024",
    tags: ["UE5", "Cinemático"],
    fps5070Ti: 95,
    gap5070: 0.84, // UE5 com Lumen, sem PT total
    source: "Estimativa por escalonamento (UE5 Lumen, referência de mesma classe)",
    note: "Cinematográfico e linear (21:9 nativo); Lumen pesa, mas sem path tracing total sobra fps.",
  },
  {
    id: "rdr2",
    name: "Red Dead Redemption 2",
    studio: "Rockstar · RAGE",
    released: "nov/2019",
    tags: ["Rasterização", "Mundo aberto"],
    fps5070Ti: 150,
    gap5070: 0.86, // sem RT, escala bem e roda alto
    source: "Estimativa por escalonamento (rasterização pura, muito otimizado)",
    note: "Sem ray tracing — envelheceu como um dos mundos abertos mais bonitos e roda folgado nessas placas.",
  },
  {
    id: "horizon-forbidden-west",
    name: "Horizon Forbidden West",
    studio: "Guerrilla · Decima",
    released: "mar/2024",
    tags: ["Rasterização", "Mundo aberto"],
    fps5070Ti: 120,
    gap5070: 0.85,
    source: "Estimativa por escalonamento (Decima, sem RT pesado)",
    note: "Port de PC muito bem otimizado; vegetação e iluminação de tirar o fôlego sem depender de RT.",
  },
  {
    id: "star-wars-outlaws",
    name: "Star Wars Outlaws",
    studio: "Massive · Snowdrop",
    released: "ago/2024",
    tags: ["RTGI", "Mundo aberto"],
    fps5070Ti: 85,
    gap5070: 0.82, // RTGI sempre ligado pesa
    source: "Estimativa por escalonamento (Snowdrop com RTGI de fábrica)",
    note: "Iluminação global por ray tracing sempre ativa — pesa parecido com os jogos Ubisoft de mundo aberto.",
  },
  {
    id: "spider-man-2",
    name: "Marvel's Spider-Man 2",
    studio: "Insomniac · Nixxes",
    released: "jan/2025",
    tags: ["RT reflexos", "Mundo aberto"],
    fps5070Ti: 110,
    gap5070: 0.84,
    source: "Estimativa por escalonamento (RT de reflexos, port Nixxes)",
    note: "Reflexos por ray tracing na cidade inteira; port bem otimizado mantém os fps altos mesmo em travessia rápida.",
  },
  {
    id: "ghost-of-tsushima",
    name: "Ghost of Tsushima",
    studio: "Sucker Punch · Nixxes",
    released: "mai/2024",
    tags: ["Rasterização", "Direção de arte"],
    fps5070Ti: 140,
    gap5070: 0.86,
    source: "Estimativa por escalonamento (sem RT, port Nixxes exemplar)",
    note: "Direção de arte premiada e um dos ports mais bem otimizados do PC — roda muito alto sem ray tracing.",
  },
  {
    id: "msfs-2024",
    name: "Microsoft Flight Simulator 2024",
    studio: "Asobo Studio",
    released: "nov/2024",
    tags: ["Streaming", "Mundo real"],
    fps5070Ti: 70,
    gap5070: 0.88, // gargalo mais em CPU/streaming que em GPU pura
    source: "Estimativa por escalonamento (limitado por CPU/streaming, não só GPU)",
    note: "Planeta inteiro em streaming — costuma ser mais limitado por CPU e disco que pela GPU, então a diferença entre placas encolhe.",
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
// Each resolution carries three factors, all grounded in observed behavior:
//  - factor: GPU FPS scaling vs the 1440p baseline (DLSS4 Quality softens 4K).
//  - cpuSensitivity: how much of the (1080p) CPU/RAM gap survives at this res.
//    More pixels => more GPU-bound => CPU/RAM matter less (→ smaller number).
//  - gap5070Adjust: the 5070-vs-5070Ti gap widens slightly at 4K (Windows
//    Central: ~24% @1440p → ~31% @4K), so the 5070's ratio is nudged down.
const RESOLUTIONS = [
  { id: "uw144", label: '34" 144Hz (UWQHD)', refreshCap: 144, factor: 0.85, cpuSensitivity: 0.30, gap5070Adjust: 1.0 },
  { id: "tv4k", label: "TV 4K (UHD)", refreshCap: null, factor: 0.60, cpuSensitivity: 0.12, gap5070Adjust: 0.95 },
];
// Reference (internal 1440p, resolutionId = null) used by the value-badge math.
const REF_CPU_SENSITIVITY = 0.35;

// RAM index: effective latency in ns = (CL / MT/s) × 2000. Best available kit
// (DDR5-6000 CL30 ≈ 10ns) is neutral; each extra ns costs ~0.4% at the fully
// CPU-bound limit — which then gets scaled way down by cpuSensitivity below.
// Capacity is intentionally ignored: it doesn't move average FPS in games.
function ramIndex(ram) {
  if (!ram?.cl || !ram?.mtps) return 1;
  const latNs = (ram.cl / ram.mtps) * 2000;
  return 1 - Math.max(0, latNs - 10) * 0.004;
}

// Platform (CPU + RAM) factor. The raw CPU/RAM gap is the fully-CPU-bound
// (1080p) delta; cpuSensitivity attenuates it for the actual resolution, so at
// 4K the whole platform barely moves the number — matching real benchmarks.
function platformFactor(cpu, ram, cpuSensitivity) {
  const idx = (cpu?.cpuGameIndex ?? 1) * ramIndex(ram);
  return 1 - (1 - idx) * cpuSensitivity;
}

// Core estimator: baseline (measured on 5070 Ti @1440p) × GPU tier ratio ×
// platform (CPU+RAM) factor × resolution factor. Pass resolutionId = null for
// the underlying 1440p reference number (used internally for value-badge math).
function estimateFps(game, gpu, cpu, ram, resolutionId) {
  const res = RESOLUTIONS.find((r) => r.id === resolutionId);
  const resFactor = res ? res.factor : 1;
  const cpuSensitivity = res ? res.cpuSensitivity : REF_CPU_SENSITIVITY;
  const gapAdjust = res ? res.gap5070Adjust : 1;
  const gpuRatio = gpu?.line === "RTX 5070 Ti" ? 1 : game.gap5070 * gapAdjust;
  return Math.round(
    game.fps5070Ti * gpuRatio * platformFactor(cpu, ram, cpuSensitivity) * resFactor
  );
}

// FPS tier — the standard green/amber/red convention used across FPS
// calculators (e.g. pc-builds.com): ≥60 reads as smooth, 30–59 as playable
// but choppy, <30 as struggling. Colors match BRAND_GREEN and the app's
// existing amber/red vocabulary (Badge tones).
function fpsTier(fps) {
  if (fps >= 60) return { label: "Fluido", color: BRAND_GREEN };
  if (fps >= 30) return { label: "Jogável", color: "#FBBF24" };
  return { label: "Trava", color: "#F87171" };
}

// Demand tier — how heavy the game itself is, independent of your config.
// Bucketed directly from fps5070Ti (our real, sourced 1440p baseline) — not
// a new number, just a readable label over data that's already there.
function demandTier(fps5070Ti) {
  if (fps5070Ti >= 130) return { label: "Leve", color: BRAND_GREEN };
  if (fps5070Ti >= 100) return { label: "Médio", color: "#A3E635" };
  if (fps5070Ti >= 70) return { label: "Pesado", color: "#FBBF24" };
  return { label: "Extremo", color: "#F87171" };
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
    const fpsList = GAMES.map((game) => estimateFps(game, g, null, null, null));
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

// ----------------------------------------------------------------------------
// localStorage persistence
// ----------------------------------------------------------------------------
function loadFromStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.data || !parsed?.lastUpdated) return null;
    return parsed;
  } catch {
    return null; // private browsing / storage disabled / corrupted entry
  }
}

function saveToStorage(data, lastUpdated) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, lastUpdated }));
    return true;
  } catch {
    return false; // quota exceeded / storage disabled — app still works, just won't persist
  }
}

// ----------------------------------------------------------------------------
// Link import — the app is static (GitHub Pages, no backend), so a real
// browser fetch to kabum.com.br is blocked by CORS. Reading a pasted link
// goes through r.jina.ai's read-only proxy (fetches the page server-side and
// returns clean text/markdown with permissive CORS headers) — verified
// working against KaBuM product pages, unlike the generic CORS proxies
// (allorigins/corsproxy.io), which either timed out or blocked non-browser
// origins outright when tested against this exact site. A raw-HTML +
// schema.org JSON-LD proxy is kept as a second attempt in case jina is ever
// down, since KaBuM pages do carry a Product JSON-LD block.
// ----------------------------------------------------------------------------
const JINA_READER_PREFIX = "https://r.jina.ai/";
const FALLBACK_HTML_PROXY = (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

// Common component brands, checked against the title so a real brand ("Asus",
// "Corsair"...) wins over the generic Portuguese category noun that normally
// leads a KaBuM title ("Placa de Vídeo...", "Processador...", "Fonte...").
const KNOWN_BRANDS = [
  "Intel", "AMD", "Asus", "MSI", "Gigabyte", "Zotac", "Galax", "Palit",
  "PNY", "EVGA", "Sapphire", "PowerColor", "XFX", "Corsair", "Kingston",
  "Adata", "XPG", "Sandisk", "WD", "WD_Black", "Samsung", "Crucial",
  "Cooler Master", "NZXT", "be quiet!", "Thermaltake", "DeepCool",
  "Lian Li", "Biostar", "ASRock", "Pichau", "Rise Mode", "T-Force",
  "G.Skill", "Seagate", "Hikvision", "Redragon", "Logitech", "HyperX",
  "Vinik", "Husky", "Inno3D", "Gainward", "PCYes", "Bluecase", "K-Mex",
  "Duex", "Multilaser", "C3Tech", "Vx Gaming",
];

// Generic Portuguese category/connector words that lead a KaBuM title and
// must never be mistaken for the brand (the old fallback picked "De" out of
// "Placa De Vídeo Vinik Rx 580..." because it just took the 2nd word).
const BRAND_STOPWORDS = new Set([
  "placa", "de", "do", "da", "video", "vídeo", "mãe", "mae", "memória",
  "memoria", "ram", "processador", "fonte", "ssd", "gpu", "gaming", "para",
  "com", "e", "notebook",
]);

function guessBrandFromName(name) {
  // Pick whichever known brand appears earliest in the title, not the first
  // match in KNOWN_BRANDS — titles often carry a second/compatibility brand
  // later on (e.g. "...DDR5... Intel XMP..." on a Corsair RAM kit).
  let best = null;
  let bestIndex = Infinity;
  for (const b of KNOWN_BRANDS) {
    const re = new RegExp(`\\b${b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    const m = re.exec(name);
    if (m && m.index < bestIndex) {
      best = b;
      bestIndex = m.index;
    }
  }
  if (best) return best;
  // Fallback: first word that isn't a generic category/connector word —
  // avoids picking "De"/"Para"/"Gaming" out of "Placa De Vídeo Gaming X...".
  const words = name.trim().split(/\s+/).map((w) => w.replace(/[,.:;]+$/, ""));
  const firstReal = words.find((w) => w && !BRAND_STOPWORDS.has(w.toLowerCase()));
  return firstReal || words[0] || "KaBuM!";
}

function parsePriceValue(raw) {
  if (raw == null) return null;
  if (typeof raw === "number") return raw;
  let s = String(raw).replace(/[^\d.,]/g, "");
  if (!s) return null;
  if (s.includes(",") && s.includes(".")) {
    s = s.replace(/\./g, "").replace(",", "."); // "3.569,99" -> "3569.99"
  } else if (s.includes(",")) {
    s = s.replace(",", ".");
  }
  const n = parseFloat(s);
  return Number.isNaN(n) ? null : n;
}

function stripMarkdown(s) {
  return s
    .replace(/\*\*/g, "")
    .replace(/^\s*[*-]\s+/gm, "")
    .replace(/[#`]/g, "")
    .replace(/\s*\n+\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function truncateAtWord(s, maxLen) {
  if (s.length <= maxLen) return s;
  const cut = s.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > maxLen * 0.6 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}

// Specs: prefer KaBuM's own "Resumo gerado por IA" bullets (short, coherent
// marketing sentences, present on most product pages) over the raw
// "Especificações Técnicas" table — that table's formatting is inconsistent
// across categories (sometimes clean "Label: Value" bullets, sometimes
// unbulleted prose that reads as a run-on dump once flattened to one line).
// Falls back to the technical table when there's no AI summary (some CPU
// pages), then to a generic placeholder.
function extractSpecsFromPage(text) {
  const summaryIdx = text.indexOf("Resumo gerado por IA");
  if (summaryIdx >= 0) {
    const window = text.slice(summaryIdx, summaryIdx + 700);
    const bullets = [...window.matchAll(/\n\*\s+(.+)/g)]
      .map((m) => stripMarkdown(m[1]))
      .filter(Boolean);
    if (bullets.length) {
      return bullets.slice(0, 2).map((b) => truncateAtWord(b, 80)).join(" · ");
    }
  }

  const specMatch = text.match(/Especifica[cç][õo]es? T[ée]cnicas?\**:?\s*([\s\S]{0,800}?)(?:\n\*\*|\n#{2,3}\s|$)/);
  if (specMatch) {
    const bulletLines = specMatch[1]
      .split(/\n\s*[-*]\s+/)
      .map((s) => stripMarkdown(s).trim())
      .filter(Boolean);
    if (bulletLines.length) {
      return bulletLines.slice(0, 3).map((b) => truncateAtWord(b, 55)).join(" · ");
    }
  }

  return "";
}

// Pricing: mirrors the catalog DB's own shape (price/priceOriginal/
// pixDiscountPct/cardPrice/cardInstallment/cardDiscountPct) so an imported
// item renders with the same PIX-vs-cartão two-column breakdown as a
// curated one, instead of falling back to a bare single price + installment.
function extractPricingFromPage(text) {
  const priceIdx = text.search(/####\s*R\$/);
  if (priceIdx < 0) return { price: null };
  const block = text.slice(Math.max(0, priceIdx - 120), priceIdx + 400);

  const pixMatch = block.match(/####\s*R\$\s?([\d.,]+)/);
  const pixDiscMatch = block.match(/PIX com\*{0,2}(\d+)% de desconto/);
  const cardMatch = block.match(/\*{2}R\$\s?([\d.,]+)\*{2,4}em até (\d+) ?x de\*{2,4}R\$\s?([\d.,]+)/);
  const cardDiscMatch = block.match(/1x com\*{0,2}(\d+)% de desconto.{0,10}no cart[aã]o/);
  const originalMatch = block.match(/R\$\s?([\d.,]+)\s*\n+\s*####/);

  return {
    price: parsePriceValue(pixMatch?.[1]),
    priceOriginal: parsePriceValue(originalMatch?.[1]) ?? undefined,
    pixDiscountPct: pixDiscMatch ? Number(pixDiscMatch[1]) : undefined,
    cardPrice: parsePriceValue(cardMatch?.[1]) ?? undefined,
    cardInstallment: cardMatch ? `${cardMatch[2]}x R$ ${cardMatch[3]}` : undefined,
    cardDiscountPct: cardDiscMatch ? Number(cardDiscMatch[1]) : undefined,
  };
}

// Primary path: r.jina.ai returns the page as readable markdown. KaBuM's
// product price renders as a "#### R$X.XXX,XX" heading, held steady across
// every category tested (CPU/GPU/RAM/mobo/PSU/SSD).
async function importViaJinaReader(url) {
  const res = await fetch(JINA_READER_PREFIX + url);
  if (!res.ok) throw new Error(`jina respondeu ${res.status}`);
  const text = await res.text();

  const titleMatch = text.match(/^Title:\s*(.+)$/m);
  const name = titleMatch?.[1]?.trim();
  if (!name) throw new Error("sem título");

  const pricing = extractPricingFromPage(text);
  const specs = extractSpecsFromPage(text);
  const outOfStock = /Produto indispon[íi]vel|Esgotado/i.test(text.slice(0, text.indexOf("Sobre o produto") + 1 || 4000));

  return {
    name,
    specs: specs || "Importado do link — sem specs detalhadas.",
    inStock: !outOfStock,
    ...pricing,
  };
}

// Fallback path: raw HTML through a generic CORS proxy, reading the page's
// own schema.org Product JSON-LD block.
async function importViaHtmlProxy(url) {
  const res = await fetch(FALLBACK_HTML_PROXY(url));
  if (!res.ok) throw new Error(`proxy respondeu ${res.status}`);
  const html = await res.text();
  if (!html || html.length < 200) throw new Error("resposta vazia");

  const doc = new DOMParser().parseFromString(html, "text/html");
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
  let product = null;
  for (const script of scripts) {
    let parsed;
    try {
      parsed = JSON.parse(script.textContent);
    } catch {
      continue; // malformed JSON-LD block on the page — skip it
    }
    const candidates = Array.isArray(parsed) ? parsed : [parsed];
    for (const c of candidates) {
      const graphNodes = Array.isArray(c?.["@graph"]) ? c["@graph"] : [c];
      const found = graphNodes.find((n) => {
        const type = n?.["@type"];
        return type === "Product" || (Array.isArray(type) && type.includes("Product"));
      });
      if (found) product = found;
    }
  }

  const ogTitle = doc.querySelector('meta[property="og:title"]')?.content;
  const name = product?.name || ogTitle?.replace(/\s*\|\s*KaBuM.*/i, "").trim();
  if (!name) throw new Error("sem título");

  const offer = Array.isArray(product?.offers) ? product.offers[0] : product?.offers;
  const metaPrice = doc.querySelector('meta[property="product:price:amount"]')?.content;
  const price = parsePriceValue(offer?.price ?? metaPrice);

  const description = product?.description || doc.querySelector('meta[name="description"]')?.content || "";

  return {
    name,
    price,
    specs: description.trim().slice(0, 160) || "Importado do link — sem specs detalhadas.",
    inStock: true,
  };
}

// Session-only cache of fully-resolved imports, keyed by URL — a search
// suggestion clicked twice (or picked again after a previous cache hit
// elsewhere) skips the network entirely instead of re-fetching the product
// page. Complements `searchResultsCache` (which only caches the search
// listing, not the per-product detail fetch that happens on pick).
const productImportCache = new Map();

async function importFromKabumLink(rawUrl) {
  const url = rawUrl.trim();
  if (!/kabum\.com\.br\/produto\//i.test(url)) {
    throw new Error("Isso não parece um link de produto do KaBuM! (precisa ter kabum.com.br/produto/...).");
  }
  if (productImportCache.has(url)) return productImportCache.get(url);

  let extracted;
  try {
    extracted = await importViaJinaReader(url);
  } catch {
    try {
      extracted = await importViaHtmlProxy(url);
    } catch {
      throw new Error("Não consegui ler essa página agora (proxies indisponíveis). Tente de novo em instantes.");
    }
  }

  const idMatch = url.match(/produto\/(\d+)/);
  const id = `custom-${idMatch ? idMatch[1] : Date.now()}`;
  const price = extracted.price ?? 0;

  const item = {
    id,
    name: extracted.name,
    brand: guessBrandFromName(extracted.name),
    specs: extracted.specs,
    price,
    installment: price ? `10x ${formatBRL(price / 10)}` : "—",
    // Same PIX/cartão breakdown fields the catalog DB uses — when present,
    // OptionCard renders the two-column price block instead of a bare price,
    // so an imported item looks exactly like a curated one.
    priceOriginal: extracted.priceOriginal,
    pixDiscountPct: extracted.pixDiscountPct,
    cardPrice: extracted.cardPrice,
    cardInstallment: extracted.cardInstallment,
    cardDiscountPct: extracted.cardDiscountPct,
    source: "KaBuM!",
    link: url,
    inStock: extracted.inStock,
    imported: true,
  };
  productImportCache.set(url, item);
  return item;
}

// ----------------------------------------------------------------------------
// Search-by-name — lets the user type "RTX 5070" instead of pasting a link.
// Reads KaBuM's own search results page (kabum.com.br/busca/<query>) through
// the same r.jina.ai reader used for single product pages, then regex-parses
// the markdown link list. Tested against several real queries per category
// (rtx 5070, rx 9070, rtx 5060 ti, ryzen 7 7800x3d, ddr5 32gb…) — see
// conversation/commit history for the validation.
//
// The listing mixes real matches with notebooks, "PC Gamer" bundles and kits
// that merely *mention* a part (e.g. a notebook listing that has "RTX 5070"
// in its title), so CATEGORY_MATCHERS filters those out by keyword per
// category. This step is discovery only — picking a suggestion still runs
// the full `importFromKabumLink` against its URL, so the actual add gets the
// same extraction (specs, accurate price) as pasting a link by hand.
//
// Perf note: r.jina.ai caches aggressively — a repeated query resolves in
// ~1s, but the FIRST time any exact query string is looked up (cold cache on
// their end) can take up to ~10s, since it's rendering the KaBuM page fresh.
// That's the dominant cost and can't be eliminated client-side, so instead:
// `X-Timeout` caps the worst case, `searchResultsCache` makes repeat/backspace
// searches instant within the session, and NameSearchInput aborts superseded
// in-flight requests so fast typing doesn't pile up several ~10s fetches.
// ----------------------------------------------------------------------------
const CATEGORY_MATCHERS = {
  cpu: {
    include: /processador\b/i,
    exclude: /notebook|placa.m[aã]e|cooler\b|water cooler|fonte\b/i,
  },
  gpu: {
    include: /placa de v[ií]deo|^gpu\b|gddr(5|6x|6|7)/i,
    exclude: /notebook|desktop\b|pc gamer|kit upgrade|processador\b|monitor\b|mouse\b|teclado\b|headset\b|cadeira\b|fonte\b|placa.m[aã]e/i,
  },
  ram: {
    include: /mem[oó]ria ram|\bddr[345]\b/i,
    exclude: /notebook|so-?dimm|placa.m[aã]e|\bssd\b|ps5|xbox|pendrive/i,
  },
  mobo: {
    include: /placa[- ]?m[aã]e\b/i,
    exclude: /notebook|water cooler/i,
  },
  psu: {
    include: /\bfonte\b/i,
    exclude: /notebook|carregador|nobreak|alimenta[cç][ãa]o (do |de )?notebook/i,
  },
  ssd: {
    include: /\bssd\b/i,
    exclude: /adaptador|gaveta\b|case\b.*ssd/i,
  },
};

const SEARCH_PLACEHOLDERS = {
  cpu: "Ex: Ryzen 7 7800X3D, Core Ultra 9 285K…",
  gpu: "Ex: RTX 5070, RX 9070 XT…",
  ram: "Ex: Corsair Vengeance 32GB, DDR5 6000…",
  mobo: "Ex: B850, Z890 Aorus…",
  psu: "Ex: fonte 850W Gold…",
  ssd: "Ex: SSD NVMe 2TB…",
};

function matchesCategory(catKey, name) {
  const matcher = CATEGORY_MATCHERS[catKey];
  if (!matcher) return true;
  const n = name.toLowerCase();
  if (matcher.exclude?.test(n)) return false;
  return matcher.include.test(n);
}

async function searchKabumProducts(query, signal) {
  const url = `https://www.kabum.com.br/busca/${encodeURIComponent(query)}`;
  let text;
  try {
    const res = await fetch(JINA_READER_PREFIX + url, {
      headers: { "X-Timeout": "8" }, // cap worst-case cold-cache render time
      signal,
    });
    if (!res.ok) throw new Error(`jina respondeu ${res.status}`);
    text = await res.text();
  } catch (err) {
    if (err.name === "AbortError") throw err; // superseded by a newer search — caller ignores this
    throw new Error("Não consegui buscar agora (proxy indisponível). Tente de novo em instantes.");
  }

  const linkRe = /\]\((https:\/\/www\.kabum\.com\.br\/produto\/(\d+)\/[a-z0-9-]+)\)/gi;
  const results = [];
  const seenIds = new Set();
  let m;
  while ((m = linkRe.exec(text)) && results.length < 60) {
    const id = m[2];
    if (seenIds.has(id)) continue;
    seenIds.add(id);
    const link = m[1];

    const windowText = text.slice(Math.max(0, m.index - 400), m.index);
    // Boundary = end of the preceding image markdown `](url)`, NOT just the
    // last literal ")" — product names routinely contain their own parens
    // (e.g. "32GB(2x16GB)"), which would otherwise get mistaken for the
    // image's closing paren and truncate the name right after them.
    const imgCloseRe = /\]\([^)]*\)/g;
    let imgCloseEnd = -1;
    let imgMatch;
    while ((imgMatch = imgCloseRe.exec(windowText))) {
      imgCloseEnd = imgMatch.index + imgMatch[0].length;
    }
    let nameChunk = (imgCloseEnd >= 0 ? windowText.slice(imgCloseEnd) : windowText)
      .replace(/Avalia[cç][ãa]o[^R]*?\d\.\d de 5\.0/gi, "")
      .replace(/Produto Patrocinado/gi, "")
      .replace(/Frete gr[aá]tis\*?/gi, "")
      .replace(/Selo:[A-Z0-9 ]+/gi, "")
      .trim();

    const priceMatches = [...nameChunk.matchAll(/R\$\s?([\d.,]+)/g)];
    const nameEndIdx = nameChunk.search(/R\$/);
    const name = (nameEndIdx > 0 ? nameChunk.slice(0, nameEndIdx) : nameChunk).trim();
    // Sanity check — on rare entries the image markdown boundary isn't found
    // within the window (very long image URL), leaving a raw URL fragment
    // instead of a real product name. Real names always have spaces; leaked
    // URLs/slugs don't.
    if (!name || name.length < 4 || /https?:\/\/|\.com(\.br)?\b/i.test(name) || !name.includes(" ")) continue;

    const hasDiscount = /Desconto/i.test(nameChunk);
    const priceRaw = priceMatches.length
      ? (hasDiscount && priceMatches[1] ? priceMatches[1][1] : priceMatches[0][1])
      : null;

    results.push({ id, name, link, price: parsePriceValue(priceRaw) });
  }
  return results;
}

// Session-only cache (resolved results, not promises — an aborted/failed
// lookup never gets cached, so it's retried next time) so repeat or
// backspace-then-retype searches within the same visit skip the network
// entirely instead of re-paying the cold-cache cost.
const searchResultsCache = new Map();

async function searchKabumByCategory(catKey, query, signal) {
  const cacheKey = `${catKey}::${query.trim().toLowerCase()}`;
  if (searchResultsCache.has(cacheKey)) return searchResultsCache.get(cacheKey);
  const raw = await searchKabumProducts(query, signal);
  const filtered = raw.filter((r) => matchesCategory(catKey, r.name));
  searchResultsCache.set(cacheKey, filtered);
  return filtered;
}

// ----------------------------------------------------------------------------
// Market-fluctuation simulator — used by "Atualizar pesquisa". This sandbox
// has no way to actually re-scrape KaBuM from the browser (CORS + no
// backend), so a refresh instead nudges prices/stock in plausible ways
// (small price jitter, occasional restock/sellout, unit counts moving) and
// re-runs the cost-benefit calculation on the result — then persists it, so
// the "researched" values genuinely change and survive a reload, same as a
// real re-scrape would produce a slightly different dataset each time.
// ----------------------------------------------------------------------------
function jitterPrice(price) {
  const delta = (Math.random() * 0.11 - 0.06); // -6% .. +5%, mild downward bias (promos)
  return Math.round(price * (1 + delta) * 100) / 100;
}

function simulateFluctuation(db) {
  const next = JSON.parse(JSON.stringify(db)); // deep clone, don't mutate cached state
  Object.keys(next).forEach((catKey) => {
    next[catKey].forEach((item) => {
      const ratio = item.cardPrice ? item.cardPrice / item.price : null;
      item.price = jitterPrice(item.price);
      if (ratio) item.cardPrice = Math.round(item.price * ratio * 100) / 100;
      // GPUs are the volatile category in practice — occasionally flip stock
      if (catKey === "gpu") {
        if (Math.random() < 0.12) item.inStock = !item.inStock;
        if (typeof item.units === "number") {
          item.units = Math.max(0, item.units + Math.round((Math.random() - 0.5) * 8));
        }
      }
      // clear any stale computed badge; annotateValueBadges recomputes below
      delete item.valueBadge;
      delete item.valueRatio;
    });
  });
  return annotateValueBadges(next);
}

// Simulated network latency so it genuinely feels like an API call.
function apiFetchAll() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const cached = loadFromStorage();
      if (cached) {
        resolve({ data: cached.data, lastUpdated: cached.lastUpdated, sources: SOURCES });
        return;
      }
      const data = annotateValueBadges(DB);
      saveToStorage(data, RESEARCH_DATE);
      resolve({ data, lastUpdated: RESEARCH_DATE, sources: SOURCES });
    }, 300);
  });
}

// Simulated "refresh": can't hit KaBuM live from the browser, so this
// simulates a fresh research pass on top of whatever is currently loaded,
// then persists the result to localStorage (so it survives a reload) and
// hands the new dataset back to the UI so everything updates immediately.
function apiRequestRefresh(currentDb) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = simulateFluctuation(currentDb);
      const lastUpdated = new Date().toISOString().slice(0, 10);
      saveToStorage(data, lastUpdated);
      resolve({
        ok: true,
        data,
        lastUpdated,
        message:
          "Simulei uma nova rodada de preços/estoque (este ambiente não acessa o KaBuM ao vivo) e salvei no localStorage — os valores acima já são os novos.",
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

// Config A/B keep two distinguishable identities because that color-coding is
// functional (tracking "which build" across price/FPS bars), not decorative —
// but both stay inside the Steam system's restrained blue-gray family instead
// of the old cyan/orange pairing. A = Action Blue lightened for text legibility
// on dark surfaces; B = Steel Slate lightened, same family, cooler/neutral.
const CONFIG_THEME = {
  A: { accent: "#4C86AC", accentSoft: "rgba(76,134,172,0.12)", label: "Config A" },
  B: { accent: "#93A0AC", accentSoft: "rgba(147,160,172,0.12)", label: "Config B" },
};
// Shared identity for section tabs that aren't a config (Comparar/Jogos) — a
// third restrained stop in the same family, not a config color.
const ACCENT_UTILITY = "#6E92A8";

// ----------------------------------------------------------------------------
// Palette — mapped from design-system-base.md (Steam design system export).
// Dark surfaces are applied via inline `style`, not Tailwind arbitrary-value
// classes (e.g. `bg-[#1C2836]`), because this runtime only ships a pre-built
// Tailwind stylesheet with no JIT compiler: any class using square brackets
// (`bg-[...]`, `shadow-[...]`, `text-[12px]`, `bg-white/[0.03]`) silently
// fails to apply. That was the actual cause of the "transparent header on
// scroll" bug — the header's background/blur never rendered.
//
// Steam is a dark, utilitarian, commerce-driven marketplace UI: deep navy
// backgrounds, square/low-radius components, restrained blue-gray accents,
// minimal shadow, borders doing most of the separation work. BG/SURFACE/
// BORDER_LINE below are the doc's literal tokens (Deep Background Navy,
// Store Panel Navy, Gunmetal Line). BRAND_GREEN is kept but desaturated from
// the old neon SaaS green — Steam itself uses colored badges for discounts/
// review sentiment, so a semantic green (value badge, in-stock, FPS tiers)
// is consistent with the system; it's just toned down to feel less neon.
// ----------------------------------------------------------------------------
const BG = "#0F1924"; // Deep Background Navy
const SURFACE = "#1C2836"; // Store Panel Navy
const BORDER_LINE = "#313943"; // Gunmetal Line
const BRAND_GREEN = "#4CAF7C";
const BRAND_GREEN_BG = "rgba(76,175,124,0.12)";
const BRAND_GREEN_BORDER = "rgba(76,175,124,0.35)";
const TEXT_MIST = "#C6D4DF"; // Mist Text — softer secondary text/notes

function formatBRL(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// Config A = build "topo" (Ultra 9 285K + RTX 5070 Ti). Os defaults originais
// (Asus 5070 Ti Prime, Z890 Eagle, XPG S70 2TB) ficaram esgotados no KaBuM em
// 23/07/2026, então foram repontados para os equivalentes em estoque mais
// próximos (5070 Ti da MSI, único Z890 em estoque = NZXT N7, SSD 2TB SanDisk).
const DEFAULT_A = {
  cpu: "u9-285k",
  gpu: "gpu-msi-5070ti-ventus3x",
  ram: "ram-64-4x16",
  mobo: "mobo-nzxt-n7-z890",
  psu: "psu-cm-850",
  ssd: "ssd-sandisk-sn7100-2tb",
};

// Config B = exatamente os 6 produtos dos links enviados pelo David.
const DEFAULT_B = {
  cpu: "u7-265k",
  gpu: "gpu-asus-5070-prime-oc",
  ram: "ram-32",
  mobo: "mobo-nzxt-n7-z890",
  psu: "psu-gigabyte-ud850gm",
  ssd: "ssd-sandisk-sn7100-2tb",
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
      className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-xs font-medium tracking-wide ${tones[tone]}`}
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
      className={`w-full text-left rounded-sm border p-3 transition-colors ${
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
            {(item.pixDiscountPct || item.cardDiscountPct) && (
              <Badge tone="warn">
                <Tag size={9} className="inline -mt-px mr-0.5" />
                Promoção {item.pixDiscountPct ? `${item.pixDiscountPct}% OFF` : ""}
              </Badge>
            )}
            {item.valueBadge && (
              <Badge tone="value">
                <Tag size={9} className="inline -mt-px mr-0.5" />
                {item.valueBadge}
              </Badge>
            )}
            {item.imported && <Badge tone="ok">Importado do link</Badge>}
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
              className="inline-flex items-center justify-center h-5 w-5 rounded-sm mb-1"
              style={{ background: accent }}
            >
              <Check size={12} className="text-slate-900" strokeWidth={3} />
            </span>
          )}
        </div>
      </div>

      {hasCardBreakdown ? (
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <div className="rounded-sm bg-white/5 border border-white/5 px-2 py-1.5">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              PIX {item.pixDiscountPct ? `· ${item.pixDiscountPct}% OFF` : ""}
            </div>
            <div className="font-mono text-sm font-bold text-emerald-300">
              {formatBRL(item.price)}
            </div>
            {item.priceOriginal && (
              <div className="font-mono text-xs line-through" style={{ color: TEXT_MIST }}>
                {formatBRL(item.priceOriginal)}
              </div>
            )}
          </div>
          <div className="rounded-sm bg-white/5 border border-white/5 px-2 py-1.5">
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
          className="inline-flex items-center gap-1 rounded-sm border border-white/10 px-2 py-1 text-xs text-slate-300 active:bg-white/10"
        >
          {item.source}
          <ExternalLink size={11} />
        </a>
      </div>
    </button>
  );
}

// Search-by-name input — type "RTX 5070" instead of pasting a link. Debounced
// live search against searchFn (e.g. searchKabumGpus), showing name+price
// suggestions; picking one runs the full importFromKabumLink against its URL
// so the added item gets the same extraction quality as a pasted link.
function NameSearchInput({ accent, onAdd, searchFn, placeholder }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | searching | error
  const [errorMsg, setErrorMsg] = useState("");
  const [importingId, setImportingId] = useState(null);
  const [manual, setManual] = useState({ name: "", price: "" });
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  // Monotonic counter — the search that "owns" the current highest id is the
  // only one allowed to commit state. This is the authoritative guard (not
  // AbortController, which only cancels the network call): even if abort()
  // ever fails to stop a stale fetch in time, its result still can't clobber
  // a newer search's state, so a second/third search can never appear stuck.
  const requestIdRef = useRef(0);

  useEffect(() => {
    const q = query.trim();
    clearTimeout(debounceRef.current);
    if (q.length < 3) {
      requestIdRef.current += 1; // invalidate any in-flight search
      if (abortRef.current) abortRef.current.abort();
      setResults([]);
      setStatus("idle");
      return undefined;
    }
    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const myRequestId = ++requestIdRef.current;
      setStatus("searching");
      setErrorMsg("");
      setResults([]); // clear the previous query's results immediately, not just on success
      try {
        const list = await searchFn(q, controller.signal);
        if (requestIdRef.current !== myRequestId) return; // superseded by a newer search
        setResults(list.slice(0, 8));
        setStatus("idle");
      } catch (err) {
        if (requestIdRef.current !== myRequestId) return;
        setResults([]);
        setErrorMsg(err.message || "Não consegui buscar agora.");
        setStatus("error");
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, searchFn]);

  const handlePick = async (result) => {
    setImportingId(result.id);
    setErrorMsg("");
    try {
      const item = await importFromKabumLink(result.link);
      onAdd(item);
      setQuery("");
      setResults([]);
      setStatus("idle");
    } catch (err) {
      setErrorMsg(err.message || "Não consegui importar esse produto.");
      setStatus("error");
    } finally {
      setImportingId(null);
    }
  };

  const handleManualAdd = () => {
    const name = manual.name.trim();
    if (!name) return;
    const price = parsePriceValue(manual.price) ?? 0;
    onAdd({
      id: `custom-${Date.now()}`,
      name,
      brand: guessBrandFromName(name),
      specs: "Adicionado manualmente (busca não encontrou o produto).",
      price,
      installment: price ? `10x ${formatBRL(price / 10)}` : "—",
      source: "KaBuM!",
      link: "",
      inStock: true,
      imported: true,
    });
    setManual({ name: "", price: "" });
    setQuery("");
    setResults([]);
    setStatus("idle");
  };

  return (
    <div className="rounded-sm border border-white/10 bg-white/5 p-2.5 space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Search size={12} />
        <span>Buscar por nome no KaBuM!</span>
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-sm border border-white/10 bg-black/20 px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-white/30"
      />

      {status === "searching" && (
        <div className="text-xs text-slate-400">
          buscando no KaBuM!… (a primeira busca de um termo novo pode levar alguns segundos)
        </div>
      )}

      {status === "error" && (
        <div className="space-y-2">
          <div className="flex items-start gap-1 text-xs text-amber-300/90">
            <AlertTriangle size={12} className="mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <div className="text-xs text-slate-400">Ou preencha na mão:</div>
          <input
            placeholder="Nome do produto"
            value={manual.name}
            onChange={(e) => setManual((m) => ({ ...m, name: e.target.value }))}
            className="w-full rounded-sm border border-white/10 bg-black/20 px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <input
            placeholder="Preço (ex: 1299,99)"
            value={manual.price}
            onChange={(e) => setManual((m) => ({ ...m, price: e.target.value }))}
            className="w-full rounded-sm border border-white/10 bg-black/20 px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            onClick={handleManualAdd}
            disabled={!manual.name.trim()}
            className="w-full rounded-sm py-1.5 text-xs font-bold disabled:opacity-50"
            style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}50` }}
          >
            Adicionar mesmo assim
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => handlePick(r)}
              disabled={importingId !== null}
              className="w-full flex items-center justify-between gap-2 rounded-sm border border-white/10 bg-black/20 px-2.5 py-1.5 text-left active:bg-white/10 disabled:opacity-50"
            >
              <span className="min-w-0 flex-1 truncate text-xs text-slate-200">{r.name}</span>
              {importingId === r.id ? (
                <RefreshCw size={12} className="shrink-0 animate-spin" style={{ color: accent }} />
              ) : (
                <span className="shrink-0 font-mono text-xs font-bold" style={{ color: accent }}>
                  {r.price ? formatBRL(r.price) : "—"}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {status === "idle" && query.trim().length >= 3 && results.length === 0 && (
        <div className="text-xs text-slate-500">Nenhum resultado pra "{query.trim()}".</div>
      )}
    </div>
  );
}

// Busca por link colado — desativada em 2026-07-23 em favor da busca por nome
// (NameSearchInput), que já cobre todas as categorias e não exige que o
// usuário ache/copie o link do KaBuM primeiro. Mantido comentado (não
// removido) caso precise voltar a oferecer a opção de colar link direto —
// nesse caso, restaurar também o import `Link as LinkIcon` de "lucide-react".
/*
function LinkImportInput({ onAdd, accent }) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [errorMsg, setErrorMsg] = useState("");
  const [manual, setManual] = useState({ name: "", price: "" });

  const runImport = useCallback(
    async (rawUrl) => {
      const trimmed = rawUrl.trim();
      if (!trimmed || status === "loading") return;
      setStatus("loading");
      setErrorMsg("");
      try {
        const item = await importFromKabumLink(trimmed);
        onAdd(item);
        setUrl("");
        setManual({ name: "", price: "" });
        setStatus("idle");
      } catch (err) {
        setErrorMsg(err.message || "Não consegui ler esse link.");
        setStatus("error");
      }
    },
    [onAdd, status]
  );

  const handleManualAdd = () => {
    const name = manual.name.trim();
    if (!name) return;
    const price = parsePriceValue(manual.price) ?? 0;
    onAdd({
      id: `custom-${Date.now()}`,
      name,
      brand: guessBrandFromName(name),
      specs: "Adicionado manualmente a partir do link colado.",
      price,
      installment: price ? `10x ${formatBRL(price / 10)}` : "—",
      source: "KaBuM!",
      link: url.trim(),
      inStock: true,
      imported: true,
    });
    setUrl("");
    setManual({ name: "", price: "" });
    setStatus("idle");
  };

  return (
    <div className="rounded-sm border border-white/10 bg-white/5 p-2.5 space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <LinkIcon size={12} />
        <span>Colar link do produto (KaBuM!) para reconhecer automaticamente</span>
      </div>
      <div className="flex gap-1.5">
        <input
          type="url"
          inputMode="url"
          placeholder="https://www.kabum.com.br/produto/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData("text");
            if (pasted) {
              setUrl(pasted);
              runImport(pasted);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") runImport(url);
          }}
          className="flex-1 min-w-0 rounded-sm border border-white/10 bg-black/20 px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-white/30"
        />
        <button
          onClick={() => runImport(url)}
          disabled={status === "loading" || !url.trim()}
          className="shrink-0 rounded-sm px-3 py-1.5 text-xs font-bold disabled:opacity-50"
          style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}50` }}
        >
          {status === "loading" ? (
            <RefreshCw size={12} className="animate-spin" />
          ) : (
            "Buscar"
          )}
        </button>
      </div>

      {status === "loading" && (
        <div className="text-xs text-slate-400">buscando dados do produto…</div>
      )}

      {status === "error" && (
        <div className="space-y-2">
          <div className="flex items-start gap-1 text-xs text-amber-300/90">
            <AlertTriangle size={12} className="mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <div className="text-xs text-slate-400">Ou preencha na mão a partir desse link:</div>
          <input
            placeholder="Nome do produto"
            value={manual.name}
            onChange={(e) => setManual((m) => ({ ...m, name: e.target.value }))}
            className="w-full rounded-sm border border-white/10 bg-black/20 px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <input
            placeholder="Preço (ex: 1299,99)"
            value={manual.price}
            onChange={(e) => setManual((m) => ({ ...m, price: e.target.value }))}
            className="w-full rounded-sm border border-white/10 bg-black/20 px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            onClick={handleManualAdd}
            disabled={!manual.name.trim()}
            className="w-full rounded-sm py-1.5 text-xs font-bold disabled:opacity-50"
            style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}50` }}
          >
            Adicionar mesmo assim
          </button>
        </div>
      )}
    </div>
  );
}
*/

function CategoryAccordion({ catKey, label, Icon, items, selectedId, onSelect, onAddCustomItem, accent, openKey, setOpenKey }) {
  const isOpen = openKey === catKey;
  const selectedItem = items.find((i) => i.id === selectedId);
  // Stable reference across re-renders (only changes if catKey does, which
  // never happens for a mounted instance) — an inline arrow here would get a
  // new identity every render, which is wasted work at best and a footgun
  // at worst if anything downstream keys off it (see NameSearchInput's
  // effect, which lists it as a dependency).
  const categorySearchFn = useCallback((q, signal) => searchKabumByCategory(catKey, q, signal), [catKey]);
  // Cheapest first, always — out-of-stock items sink to the bottom regardless
  // of price so the person isn't led to pick something they can't buy today.
  const sortedItems = [...items].sort((a, b) => {
    if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
    return a.price - b.price;
  });

  return (
    <div className="rounded-sm border border-white/10 overflow-hidden" style={{ background: SURFACE }}>
      <button
        onClick={() => setOpenKey(isOpen ? null : catKey)}
        className="w-full flex items-center gap-3 p-3.5 active:bg-white/5"
      >
        <span
          className="flex h-9 w-9 items-center justify-center rounded-sm shrink-0"
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
          <NameSearchInput
            accent={accent}
            searchFn={categorySearchFn}
            placeholder={SEARCH_PLACEHOLDERS[catKey]}
            onAdd={(item) => onAddCustomItem(catKey, item)}
          />
          {/* Busca por link colado — desativada em favor da busca por nome acima.
              O componente continua definido (LinkImportInput) caso precise voltar. */}
          {/* <LinkImportInput accent={accent} onAdd={(item) => onAddCustomItem(catKey, item)} /> */}
          {catKey === "gpu" && (
            <div className="flex items-start gap-1.5 text-xs text-slate-400 leading-relaxed px-1 pb-1">
              <Info size={11} className="mt-0.5 shrink-0" />
              <span>
                Ordenado do mais barato pro mais caro (qualquer marca). "Melhor
                custo-benefício" = menor R$ por fps médio nos jogos da aba Jogos,
                calculado separadamente para RTX 5070 e RTX 5070 Ti.
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
          {sortedItems.map((item) => (
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

function ConfigBuilder({ label, accent, config, setConfig, db, onAddCustomItem }) {
  const [openKey, setOpenKey] = useState(null);

  const handleSelect = useCallback(
    (catKey, id) => {
      setConfig((prev) => ({ ...prev, [catKey]: id }));
    },
    [setConfig]
  );

  const handleAddCustomItem = useCallback(
    (catKey, item) => {
      onAddCustomItem(catKey, item);
      setConfig((prev) => ({ ...prev, [catKey]: item.id }));
    },
    [onAddCustomItem, setConfig]
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
        className="rounded-sm p-4 border"
        style={{ background: `${accent}12`, borderColor: `${accent}40` }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide" style={{ color: accent }}>
            {label}
          </span>
          <Scale size={16} style={{ color: accent }} />
        </div>
        <div className="mt-1 font-mono text-3xl font-bold text-slate-50 tabular-nums">
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
            onAddCustomItem={handleAddCustomItem}
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
      <div className="rounded-sm border border-white/10 p-4" style={{ background: SURFACE }}>
        <div className="text-xs uppercase tracking-wider text-slate-400 mb-3">
          Diferença de preço
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-6 font-mono text-xs font-bold" style={{ color: CONFIG_THEME.A.accent }}>A</span>
            <div className="flex-1 h-3 rounded-sm bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-sm transition-all"
                style={{ width: `${pctA}%`, background: CONFIG_THEME.A.accent }}
              />
            </div>
            <span className="font-mono text-xs text-slate-300 w-24 text-right shrink-0">
              {formatBRL(totalA)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 font-mono text-xs font-bold" style={{ color: CONFIG_THEME.B.accent }}>B</span>
            <div className="flex-1 h-3 rounded-sm bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-sm transition-all"
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
            className="rounded-sm border p-4"
            style={{ borderColor: `${theme.accent}40`, background: `${theme.accent}0A` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold" style={{ color: theme.accent }}>
                {theme.label}
              </span>
              <span className="font-mono text-lg font-bold text-slate-50">
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

// Single game row: two FPS bars (Config A/B) plus its note and source.
// `featured` gives it the pink accent used for the first result in the list.
// Bar fill + fps text are colored by fpsTier() (green/amber/red — smooth/
// playable/struggling), the "A"/"B" letter keeps the config's identity color.
function GameFpsCard({ game, maxFps, refreshCap, featured }) {
  const cappedA = !!(refreshCap && game.fpsA >= refreshCap);
  const cappedB = !!(refreshCap && game.fpsB >= refreshCap);
  const rows = [
    { key: "A", fps: game.fpsA, capped: cappedA, accent: CONFIG_THEME.A.accent },
    { key: "B", fps: game.fpsB, capped: cappedB, accent: CONFIG_THEME.B.accent },
  ];
  const demand = demandTier(game.fps5070Ti);
  return (
    <div
      className="rounded-sm border p-4"
      style={{
        background: SURFACE,
        borderColor: featured ? `${ACCENT_UTILITY}70` : "rgba(255,255,255,0.10)",
        boxShadow: featured ? `0 0 0 1px ${ACCENT_UTILITY}40` : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {featured && (
            <div className="mb-0.5 inline-flex items-center gap-1 text-xs font-bold" style={{ color: ACCENT_UTILITY }}>
              <Star size={11} className="fill-current" />
              Em destaque
            </div>
          )}
          <div className="text-sm font-bold text-slate-100">{game.name}</div>
          <div className="text-xs text-slate-400">
            {game.studio} · {game.released}
          </div>
        </div>
        <div className="flex gap-1 shrink-0 flex-wrap justify-end" style={{ maxWidth: "45%" }}>
          <span
            className="inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium"
            style={{ color: demand.color, borderColor: `${demand.color}40`, background: `${demand.color}14` }}
          >
            {demand.label}
          </span>
          {game.tags.map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {rows.map((r) => {
          const tier = fpsTier(r.fps);
          return (
            <div key={r.key} className="flex items-center gap-2">
              <span className="w-6 font-mono text-xs font-bold shrink-0" style={{ color: r.accent }}>
                {r.key}
              </span>
              <div className="flex-1 h-2.5 rounded-sm bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all"
                  style={{
                    width: `${(Math.min(r.fps, refreshCap ?? r.fps) / maxFps) * 100}%`,
                    background: tier.color,
                  }}
                />
              </div>
              <span
                className="font-mono text-xs w-28 text-right shrink-0"
                style={{ color: tier.color }}
              >
                {r.fps} fps · {tier.label}{r.capped ? " 🔒" : ""}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-2.5 text-xs text-slate-400 leading-relaxed">{game.note}</div>
      <div className="mt-1 text-xs font-mono text-slate-400">fonte: {game.source}</div>
    </div>
  );
}

function GamesView({ configA, configB, db }) {
  const [resolution, setResolution] = useState("uw144");
  const [query, setQuery] = useState("");

  const gpuA = db.gpu.find((g) => g.id === configA.gpu);
  const gpuB = db.gpu.find((g) => g.id === configB.gpu);
  const cpuA = db.cpu.find((c) => c.id === configA.cpu);
  const cpuB = db.cpu.find((c) => c.id === configB.cpu);
  const ramA = db.ram.find((r) => r.id === configA.ram);
  const ramB = db.ram.find((r) => r.id === configB.ram);
  const resMeta = RESOLUTIONS.find((r) => r.id === resolution);

  const rows = GAMES.map((game) => ({
    ...game,
    fpsA: estimateFps(game, gpuA, cpuA, ramA, resolution),
    fpsB: estimateFps(game, gpuB, cpuB, ramB, resolution),
  }));

  // Interactive game search — matches name, studio or tag. When something is
  // typed the list narrows to the picked game(s); the first result is featured.
  const q = query.trim().toLowerCase();
  const filtered = q
    ? rows.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.studio.toLowerCase().includes(q) ||
          g.tags.some((t) => t.toLowerCase().includes(q))
      )
    : rows;
  const maxFps = Math.max(...filtered.map((g) => Math.max(g.fpsA, g.fpsB)), 1);

  const configLines = [
    { key: "A", accent: CONFIG_THEME.A.accent, cpu: cpuA, gpu: gpuA, ram: ramA },
    { key: "B", accent: CONFIG_THEME.B.accent, cpu: cpuB, gpu: gpuB, ram: ramB },
  ];

  return (
    <div className="space-y-3">
      {/* ---------- Header card (hierarquia: título → base → resolução → configs → nota) ---------- */}
      <div className="rounded-sm border border-white/10 p-4 space-y-3" style={{ background: SURFACE }}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-sm shrink-0"
              style={{ background: `${ACCENT_UTILITY}1A`, color: ACCENT_UTILITY }}
            >
              <Gamepad2 size={16} />
            </span>
            <div>
              <div className="text-sm font-bold tracking-tight text-slate-100">Desempenho em jogos</div>
              <div className="text-xs text-slate-400 -mt-0.5">estimativa que reage às suas peças</div>
            </div>
          </div>
          <span className="rounded-sm border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-bold text-slate-300">
            {GAMES.length} jogos
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Base medida em <strong className="text-slate-300">RTX 5070 Ti @1440p</strong> · preset máx · RT/PT ·
          DLSS 4 Qualidade · sem frame gen. A escala entre placas vem de benchmarks
          (TechPowerUp / Notebookcheck / Windows Central).
        </p>

        {/* Resolução — controle segmentado */}
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-1.5">Resolução da tela</div>
          <div className="grid grid-cols-2 gap-1.5">
            {RESOLUTIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => setResolution(r.id)}
                className="rounded-sm py-1.5 text-xs font-bold border transition-colors"
                style={
                  resolution === r.id
                    ? { background: `${ACCENT_UTILITY}20`, borderColor: `${ACCENT_UTILITY}60`, color: ACCENT_UTILITY }
                    : { borderColor: "rgba(255,255,255,0.08)", color: "#94A3B8" }
                }
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Config A/B em destaque */}
        <div className="grid gap-1.5">
          {configLines.map((c) => (
            <div
              key={c.key}
              className="min-w-0 flex items-center gap-2 rounded-sm border px-2.5 py-1.5"
              style={{ borderColor: `${c.accent}33`, background: `${c.accent}0F` }}
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-sm font-mono text-xs font-bold shrink-0"
                style={{ background: c.accent, color: BG }}
              >
                {c.key}
              </span>
              <span className="min-w-0 flex-1 text-xs text-slate-200 truncate">
                {c.cpu?.name} · {c.gpu?.brand} {c.gpu?.name} · {c.ram?.size}
              </span>
            </div>
          ))}
        </div>

        {/* Nota de honestidade + cap de 144Hz */}
        <div className="flex items-start gap-1.5 text-xs leading-relaxed" style={{ color: TEXT_MIST }}>
          <Info size={12} className="mt-0.5 shrink-0" />
          <span>
            Nestas resoluções o FPS é <strong>dominado pela GPU</strong>. Entre estas CPUs (Ultra 7/9) a
            diferença em jogos é de ~1–4% e some quase toda em 4K; a RAM mexe menos de 1% no FPS médio
            (capacidade não muda o médio, só evita travadas). Trocar CPU/RAM aqui move pouco — é o
            comportamento real.
            {resMeta?.refreshCap ? " 🔒 = travando no teto de 144Hz do monitor." : ""}
          </span>
        </div>
      </div>

      {/* ---------- Busca interativa de jogo ---------- */}
      <div className="rounded-sm border border-white/10 p-3 space-y-2" style={{ background: SURFACE }}>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            list="games-list"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar um jogo (ex: Cyberpunk, UE5, Path Tracing)…"
            className="w-full rounded-sm border border-white/10 bg-black/20 pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-white/30"
          />
          <datalist id="games-list">
            {GAMES.map((g) => (
              <option key={g.id} value={g.name} />
            ))}
          </datalist>
        </div>
        <div className="flex items-center justify-between px-0.5 text-xs text-slate-500">
          <span>
            mostrando <strong className="text-slate-300">{filtered.length}</strong> de {GAMES.length} jogos
          </span>
          {q && (
            <button onClick={() => setQuery("")} className="text-slate-400 underline underline-offset-2">
              limpar
            </button>
          )}
        </div>
      </div>

      {/* ---------- Lista (primeiro resultado = card em destaque) ---------- */}
      {filtered.length === 0 ? (
        <div className="rounded-sm border border-white/10 p-6 text-center text-sm text-slate-400" style={{ background: SURFACE }}>
          Nenhum jogo encontrado para “{query}”.
        </div>
      ) : (
        filtered.map((game, i) => (
          <GameFpsCard
            key={game.id}
            game={game}
            maxFps={maxFps}
            refreshCap={resMeta?.refreshCap}
            featured={i === 0}
          />
        ))
      )}
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
        className="inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors"
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

  const handleAddCustomItem = useCallback((catKey, item) => {
    setDb((prev) => {
      const cloned = JSON.parse(JSON.stringify(prev)); // don't mutate cached state in place
      const withoutDup = (cloned[catKey] || []).filter((i) => i.id !== item.id);
      cloned[catKey] = [...withoutDup, item];
      const next = annotateValueBadges(cloned);
      saveToStorage(next, lastUpdated);
      return next;
    });
  }, [lastUpdated]);

  const handleRefresh = () => {
    setRefreshing(true);
    setRefreshMsg("");
    apiRequestRefresh(db).then((res) => {
      setRefreshing(false);
      setDb(res.data);
      setLastUpdated(res.lastUpdated);
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
        className="sticky top-0 z-20 border-b px-4 pt-4 pb-3"
        style={{ background: BG, borderColor: BORDER_LINE }}
      >
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-bold tracking-tight shrink-0">PC&nbsp;Builder</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1 shrink-0 rounded-sm border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium text-slate-300 active:bg-white/10 disabled:opacity-60"
          >
            <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "checando…" : "Atualizar"}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 truncate">
          comparador de configurações · Ultra 9/7 + RTX 5070/Ti
        </p>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <Info size={11} />
          pesquisa fixa de {formatDate(lastUpdated)} · fontes: {SOURCES.join(" + ")}
        </div>

        {refreshMsg && (
          <div className="mt-2 rounded-sm border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            {refreshMsg}
          </div>
        )}

        {/* Tabs */}
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {[
            { key: "A", label: "Config A", color: CONFIG_THEME.A.accent },
            { key: "B", label: "Config B", color: CONFIG_THEME.B.accent },
            { key: "compare", label: "Comparar", color: "#94A3B8" },
            { key: "games", label: "Jogos", color: ACCENT_UTILITY },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="rounded-sm py-2 text-xs font-bold border transition-colors"
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
            onAddCustomItem={handleAddCustomItem}
          />
        )}
        {tab === "B" && (
          <ConfigBuilder
            label={CONFIG_THEME.B.label}
            accent={CONFIG_THEME.B.accent}
            config={configB}
            setConfig={setConfigB}
            db={db}
            onAddCustomItem={handleAddCustomItem}
          />
        )}
        {tab === "compare" && (
          <CompareView configA={configA} configB={configB} db={db} />
        )}
        {tab === "games" && (
          <GamesView configA={configA} configB={configB} db={db} />
        )}

        <div className="mt-6 mb-4 rounded-sm border border-white/5 bg-white/5 p-3 text-xs leading-relaxed text-slate-400">
          Preços "de vitrine" (à vista/PIX quando disponível), só produtos novos —
          nenhum item aqui é open box. Estoque de placa de vídeo no KaBuM muda em
          minutos: confira o link antes de comprar.
        </div>
      </main>

      <Footer />
    </div>
  );
}
