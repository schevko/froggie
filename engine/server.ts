import { SeoSpiderEngine, type FilterKey } from "./crawler";
import { estimateSerpPixelWidth } from "./algorithms";
import { join, dirname } from "path";
import { mkdirSync } from "fs";
import embeddedIndexHtml from "../ui/index.html" with { type: "file" };
import embeddedStylesCss from "../ui/styles.css" with { type: "file" };
import embeddedAppJs from "../ui/app.js" with { type: "file" };

const isCompiledBinary = !import.meta.dir.includes("engine");
const ROOT_DIR = isCompiledBinary ? dirname(process.execPath) : join(import.meta.dir, "..");
const UI_DIR = join(ROOT_DIR, "ui");
const DATA_DIR = join(ROOT_DIR, "data");
try {
  mkdirSync(DATA_DIR, { recursive: true });
} catch {}
const PORT = Number(process.env.PORT || 4321);

const wsClients = new Set<any>();
let broadcastTimer: Timer | null = null;

const spider = new SeoSpiderEngine(DATA_DIR, () => {
  if (broadcastTimer) return;
  broadcastTimer = setTimeout(() => {
    broadcastTimer = null;
    const payload = JSON.stringify({
      type: "status_update",
      data: spider.getStatusSummary(),
      issues: spider.getIssuesReport(),
    });
    for (const ws of wsClients) {
      try {
        ws.send(payload);
      } catch {}
    }
  }, 140);
});

const server = Bun.serve({
  port: PORT,
  hostname: "127.0.0.1",
  async fetch(req, server) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === "/ws") {
      if (server.upgrade(req)) return;
      return new Response("WebSocket upgrade failed", { status: 400 });
    }

    if (path === "/api/status" && req.method === "GET") {
      return Response.json({
        ...spider.getStatusSummary(),
        issues: spider.getIssuesReport(),
        config: spider.config,
        snapshots: spider.listSnapshots(),
      });
    }

    if (path === "/api/crawl/start" && req.method === "POST") {
      try {
        const body = await req.json();
        await spider.startCrawl(body);
        return Response.json({ ok: true, status: spider.getStatusSummary() });
      } catch (e: any) {
        return Response.json(
          { error: e?.message || "Geçersiz tarama isteği" },
          { status: 400 }
        );
      }
    }

    if (path === "/api/crawl/pause" && req.method === "POST") {
      spider.pauseCrawl();
      return Response.json({ ok: true, status: spider.getStatusSummary() });
    }

    if (path === "/api/crawl/resume" && req.method === "POST") {
      spider.resumeCrawl();
      return Response.json({ ok: true, status: spider.getStatusSummary() });
    }

    if (path === "/api/crawl/stop" && req.method === "POST") {
      spider.stopCrawl();
      return Response.json({ ok: true, status: spider.getStatusSummary() });
    }

    if (path === "/api/crawl/clear" && req.method === "POST") {
      spider.clear();
      return Response.json({ ok: true, status: spider.getStatusSummary() });
    }

    if (path === "/api/pages" && req.method === "GET") {
      const filter = (url.searchParams.get("filter") || "all") as FilterKey;
      const search = url.searchParams.get("search") || "";
      const limit = Number(url.searchParams.get("limit") || 2000);
      const offset = Number(url.searchParams.get("offset") || 0);
      return Response.json(
        spider.queryPages({ filter, search, limit, offset })
      );
    }

    if (path.startsWith("/api/page/") && req.method === "GET") {
      const id = Number(path.replace("/api/page/", ""));
      const detail = spider.getPageInspector(id);
      if (!detail) {
        return Response.json({ error: "Page not found" }, { status: 404 });
      }
      return Response.json(detail);
    }

    // Live SERP Simulator & Pixel Calculator
    if (path === "/api/serp/update" && req.method === "POST") {
      const body = await req.json();
      const updated = spider.updatePageSerpDraft(
        Number(body.id),
        String(body.title1 || ""),
        String(body.metaDescription1 || "")
      );
      return Response.json({
        ok: true,
        page: updated,
        titlePx: estimateSerpPixelWidth(String(body.title1 || ""), "title"),
        descPx: estimateSerpPixelWidth(
          String(body.metaDescription1 || ""),
          "description"
        ),
      });
    }

    // Google PageSpeed Insights v5 API & Live CWV Engine
    if (path === "/api/pagespeed" && req.method === "POST") {
      const body = await req.json();
      const metrics = await spider.fetchPageSpeedForUrl(
        Number(body.pageId),
        body.apiKey,
        body.strategy === "desktop" ? "desktop" : "mobile"
      );
      return Response.json({ ok: true, metrics });
    }

    if (path === "/api/pagespeed/bulk" && req.method === "POST") {
      const body = await req.json();
      const summary = await spider.runBulkPageSpeed(
        body.apiKey,
        body.strategy === "desktop" ? "desktop" : "mobile",
        Number(body.maxPages || 15)
      );
      return Response.json({ ok: true, ...summary });
    }

    // AI SEO Optimizer (Local Ollama / OpenAI / Smart Heuristic Fallback)
    if (path === "/api/ai/optimize" && req.method === "POST") {
      const body = await req.json();
      const detail = spider.getPageInspector(Number(body.pageId));
      if (!detail) {
        return Response.json({ error: "Sayfa bulunamadı" }, { status: 404 });
      }
      const p = detail.page;
      const slugWords = p.url
        .split("/")
        .filter(Boolean)
        .pop()
        ?.replace(/[-_.\d]+/g, " ")
        .replace(/html?|php|aspx/gi, "")
        .trim();

      const topic = p.h1_1 || p.title1 || slugWords || "Ana Sayfa";
      let domainBrand = "Marka";
      try {
        const host = new URL(p.url).hostname.replace(/^www\./, "").split(".")[0];
        domainBrand = host.charAt(0).toUpperCase() + host.slice(1);
      } catch {}

      let aiResult: any = null;

      // Try local Ollama if available
      if (body.provider === "ollama") {
        try {
          const res = await fetch("http://127.0.0.1:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: body.model || "llama3.2",
              stream: false,
              prompt: `You are an expert technical SEO specialist. Optimize this webpage for Google SERP (Title max 58 chars, Meta Description 130-150 chars):\nURL: ${p.url}\nCurrent Title: ${p.title1}\nCurrent H1: ${p.h1_1}\nRespond in JSON with keys: suggestedTitle, suggestedMeta, suggestedH1, auditNote.`,
            }),
            signal: AbortSignal.timeout(8000),
          });
          if (res.ok) {
            const d: any = await res.json();
            aiResult = d.response;
          }
        } catch {}
      }

      const cleanTopic = topic.slice(0, 42).trim();
      const suggestedTitle = `${cleanTopic} | ${domainBrand}`;
      const suggestedMeta = `${cleanTopic} hakkında detaylı bilgiler, güncel özellikler ve incelemeler ${domainBrand} güvencesiyle. Hemen keşfedin ve karşılaştırın.`;
      const suggestedH1 = cleanTopic;

      const diagnosis: string[] = [];
      if (!p.title1) diagnosis.push("Sayfada <title> etiketi tamamen eksik.");
      else if (p.title1PixelWidth > 561)
        diagnosis.push(
          `Mevcut başlık ${p.title1PixelWidth}px genişliğinde (Google 561px sınırını aşıyor ve '...' ile kesiliyor).`
        );
      if (!p.metaDescription1)
        diagnosis.push(
          "Meta Description etiketi eksik; organik tıklama oranını (CTR) artırmak için 120-155 karakter arası açıklama önerildi."
        );
      if (p.h1Count === 0) diagnosis.push("Sayfada H1 ana başlığı bulunmuyor.");
      else if (p.h1Count > 1)
        diagnosis.push(
          `Sayfada ${p.h1Count} adet H1 var; tek bir birincil H1 kullanılması önerilir.`
        );
      if (p.imagesMissingAltCount > 0)
        diagnosis.push(
          `${p.imagesMissingAltCount} görselde 'alt' etiketi eksik (Önerilen alt: "${cleanTopic} görseli").`
        );
      if (!p.canonicalLinkElement)
        diagnosis.push(
          `Self-referencing canonical etiketi (<link rel="canonical" href="${p.url}">) eklenmeli.`
        );

      return Response.json({
        ok: true,
        suggestedTitle,
        suggestedTitlePx: estimateSerpPixelWidth(suggestedTitle, "title"),
        suggestedMeta,
        suggestedMetaPx: estimateSerpPixelWidth(suggestedMeta, "description"),
        suggestedH1,
        diagnosis:
          diagnosis.length > 0
            ? diagnosis
            : ["Sayfanın temel on-page SEO metrikleri optimum aralıkta."],
        rawAiNote: aiResult,
      });
    }

    // Crawl Snapshots & Comparison (Crawl Diff)
    if (path === "/api/snapshots" && req.method === "GET") {
      return Response.json({ snapshots: spider.listSnapshots() });
    }

    if (path === "/api/snapshots/save" && req.method === "POST") {
      const body = await req.json();
      const snap = spider.saveSnapshotAutomatically(body.name);
      return Response.json({
        ok: !!snap,
        snapshot: snap,
        snapshots: spider.listSnapshots(),
      });
    }

    if (path === "/api/snapshots/compare" && req.method === "GET") {
      const a = Number(url.searchParams.get("a"));
      const b = Number(url.searchParams.get("b"));
      const diff = spider.compareSnapshots(a, b);
      if (!diff) {
        return Response.json(
          { error: "Karşılaştırılacak iki tarama kaydı seçin." },
          { status: 400 }
        );
      }
      return Response.json(diff);
    }

    if (path === "/api/graph" && req.method === "GET") {
      const maxNodes = Number(url.searchParams.get("maxNodes") || 180);
      return Response.json(spider.getForceGraphData(maxNodes));
    }

    if (path === "/api/issues" && req.method === "GET") {
      return Response.json({ issues: spider.getIssuesReport() });
    }

    if (path === "/api/robots" && req.method === "GET") {
      const testUrl = url.searchParams.get("testUrl") || "";
      const rp = spider.robotsParser;
      return Response.json({
        rawContent: rp?.rawContent || "",
        sitemaps: rp?.sitemaps || [],
        rulesCount: rp?.rules.length || 0,
        rules:
          rp?.rules.map((r) => ({
            pattern: r.pattern,
            allow: r.allow,
          })) || [],
        testResult:
          testUrl && rp ? { url: testUrl, allowed: rp.isAllowed(testUrl) } : null,
      });
    }

    if (path === "/api/export/csv" && req.method === "GET") {
      const filter = (url.searchParams.get("filter") || "all") as FilterKey;
      const csv = spider.generateCsvExport(filter);
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="froggie_${filter}_export.csv"`,
        },
      });
    }

    if (path === "/api/export/sitemap" && req.method === "GET") {
      const xml = spider.generateXmlSitemap();
      return new Response(xml, {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Content-Disposition": `attachment; filename="sitemap.xml"`,
        },
      });
    }

    if (path === "/api/mcp" && req.method === "POST") {
      const body = await req.json();
      const tool = body.tool;
      const args = body.arguments || {};
      if (tool === "start_crawl") {
        await spider.startCrawl(args);
        return Response.json({ result: spider.getStatusSummary() });
      }
      if (tool === "crawl_progress") {
        return Response.json({ result: spider.getStatusSummary() });
      }
      if (tool === "list_issues") {
        return Response.json({ result: spider.getIssuesReport() });
      }
      if (tool === "query_pages") {
        return Response.json({
          result: spider.queryPages({
            filter: args.filter || "all",
            search: args.search || "",
            limit: args.limit || 50,
          }),
        });
      }
      return Response.json({
        tools: [
          "start_crawl",
          "crawl_progress",
          "list_issues",
          "query_pages",
        ],
      });
    }

    const filePath =
      path === "/" ? join(UI_DIR, "index.html") : join(UI_DIR, path);
    const diskFile = Bun.file(filePath);
    if (await diskFile.exists()) {
      return new Response(diskFile);
    }

    // Fallback to embedded UI assets inside compiled single-file .exe / binary
    if (path === "/" || path === "/index.html") {
      return new Response(Bun.file(embeddedIndexHtml), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    if (path === "/styles.css") {
      return new Response(Bun.file(embeddedStylesCss), {
        headers: { "Content-Type": "text/css; charset=utf-8" },
      });
    }
    if (path === "/app.js") {
      return new Response(Bun.file(embeddedAppJs), {
        headers: { "Content-Type": "application/javascript; charset=utf-8" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
  websocket: {
    open(ws) {
      wsClients.add(ws);
      ws.send(
        JSON.stringify({
          type: "status_update",
          data: spider.getStatusSummary(),
          issues: spider.getIssuesReport(),
        })
      );
    },
    close(ws) {
      wsClients.delete(ws);
    },
    message() {},
  },
});

console.log(`🐸 Froggie v2.2 Full Suite listening at http://127.0.0.1:${server.port}`);

// On Windows standalone execution, automatically open Froggie in a native frameless desktop window
if (process.platform === "win32" && !process.env.FROGGIE_HEADLESS) {
  const appUrl = `http://127.0.0.1:${server.port}`;
  try {
    Bun.spawn(
      ["cmd", "/c", "start", "", "msedge", `--app=${appUrl}`, "--window-size=1460,900"],
      { stdout: "ignore", stderr: "ignore" }
    );
  } catch {
    try {
      Bun.spawn(["cmd", "/c", "start", "", appUrl], {
        stdout: "ignore",
        stderr: "ignore",
      });
    } catch {}
  }
}
