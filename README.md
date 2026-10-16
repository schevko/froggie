<div align="center">

# 🐸 Froggie v2.2

**High-Speed Open-Source Technical SEO Spider, Core Web Vitals Auditor & Internal Link Authority Suite**

[![License: MIT](https://img.shields.io/badge/License-MIT-10b981.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Release-v2.2.0-38bdf8.svg)](https://github.com/schevko/froggie/releases)
[![macOS Universal](https://img.shields.io/badge/macOS-Universal%20(arm64%20%2B%20x86__64)-white.svg)](https://github.com/schevko/froggie/releases)
[![Windows x64](https://img.shields.io/badge/Windows-10%2F11%2064--Bit%20(.exe)-0078d4.svg)](https://github.com/schevko/froggie/releases)

<p align="center">
  Leave bloated, expensive Java-based desktop crawlers behind.<br/>
  <strong>Froggie</strong> combines a streaming HTML tokenizer, a <strong>49× 32-Bit O(1) FastBitSet filter engine</strong>, live <strong>Google PageSpeed & Core Web Vitals</strong> auditing, <strong>64-Hash MinHash</strong> duplicate detection, <strong>Aho-Corasick</strong> multi-pattern search, and <strong>18-iteration PageRank</strong> link graphs in one lightweight native desktop application.
</p>

[Download macOS (.dmg)](https://github.com/schevko/froggie/releases/latest/download/Froggie-v2.2-Universal.dmg) •
[Download Windows (.zip / .exe)](https://github.com/schevko/froggie/releases/latest/download/Froggie-v2.2-Windows-x64-Setup.zip) •
[Architecture](#architecture--algorithms) •
[Features](#core-features) •
[Build from Source](#quick-start--building-from-source)

</div>

---

## ✨ Why Froggie?

Traditional desktop SEO spiders load entire DOM trees into a heavy Java Virtual Machine (JVM) heap and lock basic features behind a **$259/year** paywall (or a strict 500-URL cap).

**Froggie v2.2** is **100% free and open-source (MIT)** with **unlimited URL crawling**, engineered around modern streaming and bitwise data structures:

| Capability / Benchmark | 🐸 Froggie v2.2 (MIT) | Legacy Java SEO Spiders |
| :--- | :--- | :--- |
| **License & URL Limit** | **$0 — 100% Free & Unlimited URLs (MIT)** | $259 / Year (500 URL cap on free tier) |
| **10,000 URL RAM Footprint** | **~140 MB** (`Int32Array` 32-Bit BitSet) | 2.4 GB – 8.0 GB (JVM Heap) |
| **Cold Start Time** | **~0.3 Seconds** (Native WKWebView + Bun) | 6 – 14 Seconds (JVM Bootstrap) |
| **49-Filter Switching Speed** | **0.08 ms** (`O(1)` Bitwise AND / POPCNT) | 40 – 350 ms (Table Re-indexing) |
| **PageSpeed & Core Web Vitals** | **Hybrid:** Google PSI API v5 + Keyless Local Lab | Requires external API key configuration |
| **Native Binary Size** | **1.2 MB** macOS `.dmg` / Standalone Windows `.exe` | ~650 MB (Bundled JRE) |

---

## 🚀 Core Features

### 1. 🕷️ Three Crawl Modes: Spider, URL List & XML Sitemap
- **Spider Mode:** Deep recursive crawling with configurable max URLs, max depth, concurrency pool (`1–32` workers), and subdomain scoping.
- **List Mode:** Batch-audit a pasted or imported list of URLs with zero link-discovery overhead.
- **Sitemap Mode:** Parse standard `<urlset>` and recursive `<sitemapindex>` XML files automatically.

### 2. ⚡ 49× 32-Bit `FastBitSet` Engine (`O(1)` Filtering)
Every crawled URL row is indexed across **49 distinct technical SEO slices** stored in compact 32-bit `Uint32Array` bitmasks:
- **Response Codes:** `2xx Success`, `3xx Redirect`, `4xx Client Error`, `5xx Server Error`
- **Page Titles & Meta Descriptions:** Missing, Duplicate, Over `580px` / `920px` Google SERP pixel width, Below `30 chr` / `70 chr`, Multiple tags
- **Headings (`H1` / `H2`):** Missing, Duplicate, Over `70 chr`, Multiple `H1` tags
- **Content & Duplicates:** Low Word Count (`< 200 words`), Exact Hash Duplicate (FNV-1a), Near-Duplicate (`≥ 80%` Jaccard similarity via 64-Hash MinHash)
- **Canonicals & Directives:** Missing Canonical, Self-Referencing, Canonicalized (`URL ≠ Canonical`), `noindex`, `nofollow`
- **Images & Links:** Missing `alt` attributes, Over `100 KB` assets, Redirect Chains (`≥ 2 hops`), Redirect Loops, Orphan Pages
- **Security & Protocol:** HTTP (Non-HTTPS), Mixed Content, Missing `HSTS`, Missing `CSP`, Missing `X-Frame-Options`, Missing `X-Content-Type-Options`

### 3. 📊 Live Google PageSpeed Insights & Core Web Vitals Lab
- **Hybrid Architecture:** Queries the official **Google PageSpeed Insights v5 API** (Lighthouse + Chrome UX Report field telemetry) for both **Desktop** and **Mobile** strategies.
- **Keyless Local Fallback Engine:** Works out-of-the-box without an API key using a built-in synthetic lab analyzer that measures real **TTFB**, **LCP**, **CLS**, **FCP**, **TBT/INP**, render-blocking scripts/stylesheets, unoptimized images, and DOM complexity.

### 4. 🧬 64-Hash MinHash Near-Duplicate Detection
- Tokenizes body text into normalized 3-word shingles (`3-grams`) and computes **64 independent FNV-1a hash signatures** per page.
- Calculates pairwise Jaccard similarity across crawled pages to detect cannibalization and near-duplicate content (`≥ 80%` match).

### 5. 🕸️ 18-Iteration PageRank Link Score & Interactive Force-Directed Graph
- Runs **18 iterations of PageRank (`d = 0.85`)** across the internal link graph after each crawl, normalizing every URL onto a `0–100` logarithmic **Link Score** scale.
- Includes an interactive, draggable **2D Force-Directed Link Graph** visualizing internal authority flow, hub pages, 404 dead ends, and orphan URLs.

### 6. 🔎 Aho-Corasick Custom Search & CSS / Regex Custom Extraction
- **Custom Search:** High-speed multi-pattern **Aho-Corasick** automaton supporting both `Contains` and `Does Not Contain` rules across raw HTML or visible text.
- **Custom Extraction:** Scrape structured data across an entire site using **CSS Selectors** (`Text`, `InnerHTML`, or `Attribute`) or **Regular Expressions** (`Regex` with capture groups).

### 7. 🔍 Real-Time Google SERP Pixel Width Simulator
- Measures actual rendered pixel width (`580px` Title / `920px` Meta Description) using Google's desktop font metrics instead of rough character counts.
- Live editable Title & Description sandbox with instant truncation preview.

### 8. 🛡️ Direct IP vs. Round-Robin Rotating Proxy Pool
- **Direct Mode:** Crawls directly from your machine's network interface with zero middleman latency.
- **Rotating Proxy Pool:** Configure a list of `http://` or `https://` proxies (`host:port` or `user:pass@host:port`) to automatically rotate outbound IPs per request via Round-Robin scheduling.

### 9. 🔄 Crawl Diff (Snapshot Comparison) & One-Click Exports
- Compare any two crawl snapshots side-by-side to identify **Added URLs**, **Removed URLs**, **Status Code Changes**, **Title Modifications**, and **Word Count Deltas**.
- Export full audits to **CSV**, **JSON**, or standards-compliant **XML Sitemaps**.

### 10. 🌍 Multi-Language Desktop Interface (`TR` / `EN` / `DE` / `ES`)
- Instant language switching inside the Settings modal with persistent localization across all menus, tables, filters, and drawers.

---

## 📦 Native Installers (macOS & Windows)

Download pre-built native packages from the [**Releases**](https://github.com/schevko/froggie/releases) page:

- **🍎 macOS Universal (`.dmg`):** `Froggie-v2.2-Universal.dmg` — Native **Universal Binary** (`arm64` Apple Silicon M1/M2/M3/M4 + `x86_64` Intel Mac) wrapped in a native `Cocoa` / `WKWebView` bundle.
- **🪟 Windows 10/11 64-Bit (`.zip` / `.exe`):** `Froggie-v2.2-Windows-x64-Setup.zip` — Includes the standalone `Froggie.exe` executable plus `Install-Froggie-Windows.bat` which automatically installs Froggie and creates Desktop & Start Menu shortcuts.

---

## 🛠️ Quick Start & Building from Source

### Prerequisites
- [Bun](https://bun.sh) `>= 1.1.0`
- *(Optional for macOS `.app` compilation)* Xcode Command Line Tools (`swiftc`, `lipo`, `iconutil`)

### 1. Clone & Run Development Server
```bash
git clone https://github.com/schevko/froggie.git
cd froggie
bun start
```
Froggie's engine will start at `http://127.0.0.1:4321`.

### 2. Build macOS Universal `.app` & `.dmg`
```bash
bash scripts/build-universal-app.sh
```

### 3. Build Windows 64-Bit Standalone `.exe` & Installer `.zip`
```bash
bash scripts/build-windows.sh
```

### 4. Customize Application Icon
```bash
bash scripts/set-icon.sh /path/to/your-logo.png
```

---

## 🏗️ Project Structure

```text
froggie/
├── engine/
│   ├── crawler.ts                # Streaming HTMLRewriter spider, 49-BitSet, MinHash, PageRank, CWV Lab
│   └── server.ts                 # Bun HTTP + WebSocket real-time telemetry & SQLite WAL server
├── ui/
│   ├── index.html                # Desktop workbench UI shell
│   ├── styles.css                # Precision dark/light desktop design system
│   └── app.js                    # Virtualized grid, Force Graph, SERP simulator, i18n (TR/EN/DE/ES)
├── macos/
│   └── main.swift                # Native macOS Cocoa + WKWebView wrapper & process lifecycle manager
└── scripts/
    ├── build-universal-app.sh    # Compiles arm64 + x86_64 Universal macOS .app & .dmg
    ├── build-windows.sh          # Cross-compiles standalone Windows x64 Froggie.exe & Setup .zip
    ├── generate_icon.swift       # Procedural 1024x1024 retina .icns generator
    └── set-icon.sh               # 1-command custom PNG-to-.icns icon replacer
```

---

## 📄 License

Released under the [**MIT License**](LICENSE).  
Copyright © 2026 [**schevko**](https://github.com/schevko).
