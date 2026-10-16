// Froggie v2.2 — Multi-Language Workbench + Full PageSpeed CWV + MIT Open Source
// Author: schevko (schevko) <schevko@hotmail.com>

const savedLang = localStorage.getItem("openfrog_lang") || "tr";
const savedPsiKey = localStorage.getItem("openfrog_psi_key") || "";
const savedPsiStrategy = localStorage.getItem("openfrog_psi_strategy") || "mobile";

const state = {
  lang: savedLang,
  mode: "spider",
  activeTab: "internal",
  activeFilter: "internal",
  searchQuery: "",
  pages: [],
  selectedPageId: null,
  selectedInspectorTab: "details",
  inspectorData: null,
  counts: {},
  issues: [],
  status: "idle",
  proxyMode: "direct",
  psiApiKey: savedPsiKey,
  psiStrategy: savedPsiStrategy,
  urlList: [
    "https://books.toscrape.com/",
    "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html",
    "https://books.toscrape.com/catalogue/tipping-the-velvet_999/index.html",
    "https://books.toscrape.com/catalogue/soumission_998/index.html",
    "https://books.toscrape.com/catalogue/sharp-objects_997/index.html",
  ],
  customSearchRules: [
    {
      id: "rule_1",
      name: "In Stock Kontrolü",
      pattern: "In stock",
      mode: "contains",
      scope: "html",
    },
  ],
  customExtractionRules: [
    {
      id: "ext_1",
      name: "Ürün Fiyatı",
      selector: ".price_color",
      type: "css_text",
    },
  ],
};

// Extensible Multi-Language Registry (New languages can be added here as modular objects)
const LOCALE_REGISTRY = {
  tr: {
    code: "tr",
    badge: "TR",
    flag: "🇹🇷",
    nativeName: "Türkçe",
    regionName: "Türkiye (Varsayılan)",
    btnStart: "Başlat",
    btnPause: "Duraklat",
    btnResume: "Devam Et",
    btnStop: "Durdur",
    btnClear: "Temizle",
    lblEditListBtn: "URL Listesi",
    lblDiffBtn: "Karşılaştır",
    lblConfigBtn: "Ayarlar",
    lblAboutBtn: "Hakkında",
    modeSpider: "Site Tarama (Spider)",
    modeList: "Liste Modu (List)",
    modeSitemap: "Site Haritası (Sitemap)",
    urlPlaceholder: "Taranacak web sitesini girin (örn. https://books.toscrape.com)...",
    sitemapPlaceholder: "XML Sitemap adresini girin (örn. https://site.com/sitemap.xml)...",
    lblFilterSelect: "Filtre:",
    searchPlaceholder: "Tabloda ara (URL, Başlık, H1, Durum Kodu)...",
    lblShownRows: "Gösterilen:",
    lblSidebarOverview: "Genel Bakış (49 BitSet)",
    lblSidebarIssues: "SEO Sorunları",
    lblMetricCrawled: "Taranan",
    lblMetricQueued: "Kuyruk",
    lblMetricSpeed: "Hız (URL/sn)",
    emptyTitle: "Froggie v2.2 — Teknik SEO Tarayıcısı",
    emptyDesc: "Yukarıdaki adres çubuğuna taranacak web sitesini yazıp <strong>Başlat</strong> düğmesine basın. Dil seçimi, Proxy havuzu ve PageSpeed API ayarlarını sağ üstteki <strong>Ayarlar</strong> menüsünden yönetebilirsiniz.",
    proxyDirect: "Bağlantı: Doğrudan (Kendi IP'niz)",
    proxySingle: "Bağlantı: Tekil Proxy Aktif",
    proxyRotating: "Bağlantı: Dönen Proxy Havuzu Aktif",
    lblSettingsModalTitle: "Ayarlar, Dil Seçimi, Proxy Havuzu & Özel Kurallar",
    lblSettingsLangHeader: "Arayüz Dili (Language & Locale)",
    lblSettingsLangHint: "Uygulama arayüz dilini seçin. Seçiminiz anında uygulanır ve otomatik kaydedilir:",
    lblSettingsCrawlHeader: "Tarama Limitleri & Bot Davranışı",
    lblSettingsProxyHeader: "Proxy & Bağlantı Yönlendirme (Direct IP vs. Proxy Pool)",
    lblSettingsPsiHeader: "Google PageSpeed Insights & Core Web Vitals",
    lblSaveConfigBtn: "Ayarları Kaydet",
    lblBulkPsiBtn: "Tüm Sayfalarda PageSpeed Testi Çalıştır",
    optPsiMobile: "Mobil (CWV)",
    optPsiDesktop: "Masaüstü (CWV)",
    tabs: {
      internal: "İç Bağlantılar",
      external: "Dış Bağlantılar",
      security: "Güvenlik",
      response_codes: "Durum Kodları",
      url_quality: "URL Kalitesi",
      page_titles: "Sayfa Başlıkları",
      meta_description: "Meta Açıklama",
      h1: "H1 Başlıkları",
      h2: "H2 Başlıkları",
      canonicals: "Canonical",
      hreflang: "Hreflang & Sayfalama",
      images: "Görseller",
      directives: "Direktifler",
      structured_data: "Yapısal Veri",
      near_duplicates: "Kopya İçerik",
      custom: "Özel Arama & Kazıma",
      pagespeed: "PageSpeed & CWV",
      force_graph: "Link Grafiği",
    },
    itabs: {
      details: "URL Detayları",
      inlinks: "Gelen Linkler (Inlinks)",
      outlinks: "Çıkan Linkler (Outlinks)",
      serp: "Canlı SERP Editörü",
      ai: "AI SEO & PageSpeed",
      security: "Güvenlik & Başlıklar",
      images: "Görseller",
      duplicates: "Yakın Kopyalar",
      schema: "Schema JSON-LD",
    },
  },
  en: {
    code: "en",
    badge: "EN",
    flag: "🇬🇧",
    nativeName: "English",
    regionName: "International",
    btnStart: "Start",
    btnPause: "Pause",
    btnResume: "Resume",
    btnStop: "Stop",
    btnClear: "Clear",
    lblEditListBtn: "URL List",
    lblDiffBtn: "Crawl Diff",
    lblConfigBtn: "Settings",
    lblAboutBtn: "About",
    modeSpider: "Spider Mode",
    modeList: "List Mode",
    modeSitemap: "Sitemap Mode",
    urlPlaceholder: "Enter website URL to crawl (e.g. https://books.toscrape.com)...",
    sitemapPlaceholder: "Enter XML Sitemap URL (e.g. https://site.com/sitemap.xml)...",
    lblFilterSelect: "Filter:",
    searchPlaceholder: "Search table (URL, Title, H1, Status Code)...",
    lblShownRows: "Showing:",
    lblSidebarOverview: "Overview (49 BitSet)",
    lblSidebarIssues: "SEO Issues",
    lblMetricCrawled: "Crawled",
    lblMetricQueued: "Queued",
    lblMetricSpeed: "Speed (URL/s)",
    emptyTitle: "Froggie v2.2 — Technical SEO Crawler",
    emptyDesc: "Enter any website URL in the top bar and click <strong>Start</strong>. Manage UI Language, Rotating Proxy Pool, and PageSpeed API in <strong>Settings</strong>.",
    proxyDirect: "Routing: Direct (Local Machine IP)",
    proxySingle: "Routing: Single HTTP/HTTPS Proxy Active",
    proxyRotating: "Routing: Rotating Proxy Pool Active",
    lblSettingsModalTitle: "Settings, Language, Proxy Pool & Custom Rules",
    lblSettingsLangHeader: "Interface Language (Locale)",
    lblSettingsLangHint: "Select your preferred interface language. Changes apply immediately and persist automatically:",
    lblSettingsCrawlHeader: "Crawl Limits & Spider Behavior",
    lblSettingsProxyHeader: "Proxy & Network Routing (Direct IP vs. Proxy Pool)",
    lblSettingsPsiHeader: "Google PageSpeed Insights & Core Web Vitals",
    lblSaveConfigBtn: "Save Settings",
    lblBulkPsiBtn: "Run Bulk PageSpeed Audit",
    optPsiMobile: "Mobile (CWV)",
    optPsiDesktop: "Desktop (CWV)",
    tabs: {
      internal: "Internal",
      external: "External",
      security: "Security",
      response_codes: "Response Codes",
      url_quality: "URL Quality",
      page_titles: "Page Titles",
      meta_description: "Meta Description",
      h1: "H1",
      h2: "H2",
      canonicals: "Canonicals",
      hreflang: "Hreflang & Pagination",
      images: "Images",
      directives: "Directives",
      structured_data: "Structured Data",
      near_duplicates: "Near Duplicates",
      custom: "Custom Search/Extract",
      pagespeed: "PageSpeed & CWV",
      force_graph: "Force Link Graph",
    },
    itabs: {
      details: "URL Details",
      inlinks: "Inlinks",
      outlinks: "Outlinks",
      serp: "Live SERP Editor",
      ai: "AI SEO & PageSpeed",
      security: "Security & Headers",
      images: "Images",
      duplicates: "Near Duplicates",
      schema: "Schema JSON-LD",
    },
  },
  de: {
    code: "de",
    badge: "DE",
    flag: "🇩🇪",
    nativeName: "Deutsch",
    regionName: "Deutschland / DACH",
    btnStart: "Starten",
    btnPause: "Pause",
    btnResume: "Fortsetzen",
    btnStop: "Stopp",
    btnClear: "Leeren",
    lblEditListBtn: "URL-Liste",
    lblDiffBtn: "Vergleich",
    lblConfigBtn: "Einstellungen",
    lblAboutBtn: "Über",
    modeSpider: "Spider-Modus",
    modeList: "Listen-Modus",
    modeSitemap: "Sitemap-Modus",
    urlPlaceholder: "Website-URL eingeben (z.B. https://books.toscrape.com)...",
    sitemapPlaceholder: "XML-Sitemap-URL eingeben...",
    lblFilterSelect: "Filter:",
    searchPlaceholder: "Tabelle durchsuchen (URL, Titel, H1, Status)...",
    lblShownRows: "Angezeigt:",
    lblSidebarOverview: "Übersicht (49 BitSet)",
    lblSidebarIssues: "SEO-Probleme",
    lblMetricCrawled: "Gecrawlt",
    lblMetricQueued: "Warteschlange",
    lblMetricSpeed: "Tempo (URL/s)",
    emptyTitle: "Froggie v2.2 — Technischer SEO-Crawler",
    emptyDesc: "Geben Sie oben eine URL ein und klicken Sie auf <strong>Starten</strong>. Sprache, Proxy-Pool und PageSpeed finden Sie unter <strong>Einstellungen</strong>.",
    proxyDirect: "Verbindung: Direkt (Lokale IP)",
    proxySingle: "Verbindung: Einzel-Proxy Aktiv",
    proxyRotating: "Verbindung: Rotierender Proxy-Pool Aktiv",
    lblSettingsModalTitle: "Einstellungen, Sprache, Proxy-Pool & Regeln",
    lblSettingsLangHeader: "Oberflächensprache (Language & Locale)",
    lblSettingsLangHint: "Wählen Sie die Sprache der Benutzeroberfläche. Änderungen werden sofort übernommen:",
    lblSettingsCrawlHeader: "Crawl-Limits & Bot-Verhalten",
    lblSettingsProxyHeader: "Proxy & Netzwerk-Routing",
    lblSettingsPsiHeader: "Google PageSpeed Insights & Core Web Vitals",
    lblSaveConfigBtn: "Einstellungen speichern",
    lblBulkPsiBtn: "Bulk-PageSpeed-Test starten",
    optPsiMobile: "Mobil (CWV)",
    optPsiDesktop: "Desktop (CWV)",
    tabs: {
      internal: "Intern",
      external: "Extern",
      security: "Sicherheit",
      response_codes: "Statuscodes",
      url_quality: "URL-Qualität",
      page_titles: "Seitentitel",
      meta_description: "Meta-Beschreibung",
      h1: "H1",
      h2: "H2",
      canonicals: "Canonicals",
      hreflang: "Hreflang & Paginierung",
      images: "Bilder",
      directives: "Direktiven",
      structured_data: "Strukturierte Daten",
      near_duplicates: "Duplikate",
      custom: "Eigene Suche/Extraktion",
      pagespeed: "PageSpeed & CWV",
      force_graph: "Link-Graph",
    },
    itabs: {
      details: "URL-Details",
      inlinks: "Eingehende Links",
      outlinks: "Ausgehende Links",
      serp: "Live-SERP-Editor",
      ai: "KI-SEO & PageSpeed",
      security: "Sicherheit & Header",
      images: "Bilder",
      duplicates: "Ähnliche Seiten",
      schema: "Schema JSON-LD",
    },
  },
  es: {
    code: "es",
    badge: "ES",
    flag: "🇪🇸",
    nativeName: "Español",
    regionName: "España / LATAM",
    btnStart: "Iniciar",
    btnPause: "Pausar",
    btnResume: "Reanudar",
    btnStop: "Detener",
    btnClear: "Limpiar",
    lblEditListBtn: "Lista URL",
    lblDiffBtn: "Comparar",
    lblConfigBtn: "Ajustes",
    lblAboutBtn: "Acerca de",
    modeSpider: "Modo Rastreador (Spider)",
    modeList: "Modo Lista",
    modeSitemap: "Modo Sitemap",
    urlPlaceholder: "Ingrese la URL del sitio web (ej. https://books.toscrape.com)...",
    sitemapPlaceholder: "Ingrese la URL del Sitemap XML...",
    lblFilterSelect: "Filtro:",
    searchPlaceholder: "Buscar en la tabla (URL, Título, H1, Estado)...",
    lblShownRows: "Mostrando:",
    lblSidebarOverview: "Resumen (49 BitSet)",
    lblSidebarIssues: "Problemas SEO",
    lblMetricCrawled: "Rastreadas",
    lblMetricQueued: "En cola",
    lblMetricSpeed: "Velocidad (URL/s)",
    emptyTitle: "Froggie v2.2 — Rastreador SEO Técnico",
    emptyDesc: "Ingrese una URL arriba y presione <strong>Iniciar</strong>. Puede cambiar el idioma, el pool de proxies y PageSpeed en <strong>Ajustes</strong>.",
    proxyDirect: "Conexión: Directa (IP Local)",
    proxySingle: "Conexión: Proxy Único Activo",
    proxyRotating: "Conexión: Pool de Proxies Rotativos Activo",
    lblSettingsModalTitle: "Ajustes, Idioma, Pool de Proxies y Reglas",
    lblSettingsLangHeader: "Idioma de la Interfaz (Language & Locale)",
    lblSettingsLangHint: "Seleccione el idioma de la aplicación. El cambio se aplica al instante:",
    lblSettingsCrawlHeader: "Límites de Rastreo y Bot",
    lblSettingsProxyHeader: "Proxy y Enrutamiento de Red",
    lblSettingsPsiHeader: "Google PageSpeed Insights y Core Web Vitals",
    lblSaveConfigBtn: "Guardar Ajustes",
    lblBulkPsiBtn: "Ejecutar Prueba PageSpeed Masiva",
    optPsiMobile: "Móvil (CWV)",
    optPsiDesktop: "Escritorio (CWV)",
    tabs: {
      internal: "Internos",
      external: "Externos",
      security: "Seguridad",
      response_codes: "Códigos HTTP",
      url_quality: "Calidad URL",
      page_titles: "Títulos de Página",
      meta_description: "Meta Descripción",
      h1: "Encabezados H1",
      h2: "Encabezados H2",
      canonicals: "Canonicals",
      hreflang: "Hreflang y Paginación",
      images: "Imágenes",
      directives: "Directivas",
      structured_data: "Datos Estructurados",
      near_duplicates: "Duplicados",
      custom: "Búsqueda/Extracción",
      pagespeed: "PageSpeed y CWV",
      force_graph: "Grafo de Enlaces",
    },
    itabs: {
      details: "Detalles de URL",
      inlinks: "Enlaces Entrantes",
      outlinks: "Enlaces Salientes",
      serp: "Editor SERP en Vivo",
      ai: "IA SEO y PageSpeed",
      security: "Seguridad y Cabeceras",
      images: "Imágenes",
      duplicates: "Páginas Similares",
      schema: "Schema JSON-LD",
    },
  },
};

function getDict() {
  return LOCALE_REGISTRY[state.lang] || LOCALE_REGISTRY.tr;
}

function L(tr, en) {
  return state.lang === "tr" ? tr : en;
}

const TAB_SUBFILTERS = {
  internal: [
    { value: "internal", tr: "Tüm İç Bağlantılar (All Internal)", en: "All Internal" },
    { value: "indexable", tr: "İndekslenebilir (Indexable)", en: "Indexable" },
    { value: "non_indexable", tr: "İndekslenemez (Non-Indexable)", en: "Non-Indexable" },
  ],
  external: [{ value: "external", tr: "Tüm Dış Bağlantılar", en: "All External" }],
  security: [
    { value: "internal", tr: "Tüm Güvenlik Denetimleri", en: "All Security Audited URLs" },
    { value: "sec_http", tr: "HTTP (SSL Olmayan Güvensiz)", en: "HTTP (Non-Secure) URLs" },
    { value: "sec_mixed_content", tr: "Mixed Content (Karışık İçerik)", en: "Mixed Content (HTTP Assets on HTTPS)" },
    { value: "sec_missing_hsts", tr: "Eksik HSTS Başlığı", en: "Missing HSTS Header" },
    { value: "sec_missing_csp", tr: "Eksik Content-Security-Policy", en: "Missing Content-Security-Policy" },
    { value: "sec_missing_xcto", tr: "Eksik X-Content-Type-Options", en: "Missing X-Content-Type-Options" },
    { value: "sec_missing_xfo", tr: "Eksik X-Frame-Options", en: "Missing X-Frame-Options" },
    { value: "sec_unsafe_target_blank", tr: "Güvensiz target=_blank Linkler", en: "Unsafe Cross-Origin Links (target=_blank)" },
  ],
  response_codes: [
    { value: "all", tr: "Tüm Durum Kodları", en: "All Response Codes" },
    { value: "status_2xx", tr: "Başarılı (2xx OK)", en: "Success (2xx)" },
    { value: "status_3xx", tr: "Yönlendirme (3xx Redirect)", en: "Redirection (3xx)" },
    { value: "status_4xx", tr: "İstemci Hatası / Kırık Link (4xx)", en: "Client Error (4xx)" },
    { value: "status_5xx", tr: "Sunucu Hatası (5xx / Timeout)", en: "Server Error (5xx) / No Response" },
    { value: "blocked_robots", tr: "Robots.txt Tarafından Engellenen", en: "Blocked by Robots.txt" },
  ],
  url_quality: [
    { value: "internal", tr: "Tüm URL'ler", en: "All URLs" },
    { value: "url_uppercase", tr: "Büyük Harf İçeren (Uppercase)", en: "Uppercase" },
    { value: "url_underscores", tr: "Alt Çizgi (_) İçeren", en: "Underscores (_)" },
    { value: "url_parameters", tr: "Parametreli (?query=)", en: "Parameters (?)" },
    { value: "url_non_ascii", tr: "ASCII Dışı / Türkçe Karakter", en: "Non-ASCII Characters" },
    { value: "url_multiple_slashes", tr: "Çift Eğik Çizgi (//)", en: "Multiple Slashes (//)" },
    { value: "url_over_115", tr: "115 Karakterden Uzun", en: "Over 115 Characters" },
  ],
  page_titles: [
    { value: "internal", tr: "Tüm Sayfa Başlıkları", en: "All Page Titles" },
    { value: "title_missing", tr: "Eksik (Missing)", en: "Missing" },
    { value: "title_duplicate", tr: "Tekrarlanan (Duplicate)", en: "Duplicate" },
    { value: "title_over_60", tr: "60 Karakterden Uzun", en: "Over 60 Characters" },
    { value: "title_below_30", tr: "30 Karakterden Kısa", en: "Below 30 Characters" },
    { value: "title_over_561px", tr: "561 Pikselden Geniş (SERP Kesilen)", en: "Over 561 Pixels (SERP Truncated)" },
  ],
  meta_description: [
    { value: "internal", tr: "Tüm Meta Açıklamaları", en: "All Meta Descriptions" },
    { value: "meta_missing", tr: "Eksik (Missing)", en: "Missing" },
    { value: "meta_duplicate", tr: "Tekrarlanan (Duplicate)", en: "Duplicate" },
    { value: "meta_over_155", tr: "155 Karakterden Uzun", en: "Over 155 Characters" },
    { value: "meta_below_70", tr: "70 Karakterden Kısa", en: "Below 70 Characters" },
    { value: "meta_over_985px", tr: "985 Pikselden Geniş", en: "Over 985 Pixels" },
  ],
  h1: [
    { value: "internal", tr: "Tüm H1 Başlıkları", en: "All H1" },
    { value: "h1_missing", tr: "Eksik (Missing H1)", en: "Missing" },
    { value: "h1_duplicate", tr: "Tekrarlanan (Duplicate H1)", en: "Duplicate" },
    { value: "h1_multiple", tr: "Birden Fazla H1 (Multiple)", en: "Multiple" },
  ],
  h2: [
    { value: "internal", tr: "Tüm H2 Başlıkları", en: "All H2" },
    { value: "h2_missing", tr: "Eksik (Missing H2)", en: "Missing" },
  ],
  canonicals: [
    { value: "internal", tr: "Tüm Canonical Kayıtları", en: "All Canonicals" },
    { value: "canonical_contains", tr: "Canonical Etiketi Olanlar", en: "Contains Canonical" },
    { value: "canonical_missing", tr: "Canonical Etiketi Eksik", en: "Missing" },
    { value: "canonical_self", tr: "Kendine İşaret Eden (Self-Referencing)", en: "Self Referencing" },
    { value: "canonical_canonicalised", tr: "Başka URL'ye İşaret Eden (Canonicalised)", en: "Canonicalised (Other URL)" },
  ],
  hreflang: [
    { value: "internal", tr: "Tüm Sayfalar", en: "All Pages" },
    { value: "hreflang_contains", tr: "Hreflang İçerenler", en: "Contains Hreflang" },
    { value: "hreflang_missing_xdefault", tr: "Hreflang Hatası / x-default Eksik", en: "Hreflang Issues / Missing x-default" },
    { value: "pagination_contains", tr: "Sayfalama İçerenler (rel=next/prev)", en: "Contains Pagination (rel=next/prev)" },
  ],
  images: [
    { value: "images_missing_alt", tr: "Eksik Alt Etiketi Olan Sayfalar", en: "Pages with Missing Alt Text" },
    { value: "internal", tr: "Tüm İç Sayfalar", en: "All Internal Pages" },
  ],
  directives: [
    { value: "directives_noindex", tr: "Noindex Direktifi Olanlar", en: "Noindex" },
    { value: "directives_nofollow", tr: "Nofollow Direktifi Olanlar", en: "Nofollow" },
    { value: "internal", tr: "Tüm Direktifler", en: "All Directives" },
  ],
  structured_data: [
    { value: "structured_data_has", tr: "JSON-LD Schema İçerenler", en: "Contains Structured Data (JSON-LD)" },
    { value: "structured_data_error", tr: "JSON-LD Doğrulama Hatası Olanlar", en: "Validation Errors" },
    { value: "internal", tr: "Tüm İç Sayfalar", en: "All Internal Pages" },
  ],
  near_duplicates: [
    { value: "near_duplicates", tr: "Yakın Kopya Sayfalar (>= %75 MinHash)", en: "Near Duplicates (>= 75% MinHash)" },
    { value: "internal", tr: "Tüm İç Sayfalar", en: "All Internal Pages" },
  ],
  custom: [
    { value: "custom_search_matched", tr: "Özel Arama Eşleşenler (Aho-Corasick)", en: "Custom Search Matches (Aho-Corasick)" },
    { value: "custom_extraction_matched", tr: "Özel Veri Kazıma Eşleşenler", en: "Custom Extraction Matches" },
    { value: "internal", tr: "Tüm İç Sayfalar", en: "All Internal Pages" },
  ],
  pagespeed: [{ value: "internal", tr: "Tüm İç Sayfalar (PageSpeed & Link Puanı)", en: "All Internal Pages (PageSpeed & Link Score)" }],
  force_graph: [{ value: "internal", tr: "İç Bağlantı Grafiği", en: "Internal Link Graph" }],
};

const OVERVIEW_GROUPS = [
  {
    titleTr: "Genel Tarama",
    titleEn: "Crawl Overview",
    items: [
      { key: "internal", tab: "internal", tr: "İç Bağlantılar (Internal)", en: "Internal" },
      { key: "external", tab: "external", tr: "Dış Bağlantılar (External)", en: "External" },
      { key: "indexable", tab: "internal", tr: "İndekslenebilir (Indexable)", en: "Indexable" },
      { key: "non_indexable", tab: "internal", tr: "İndekslenemez (Non-Indexable)", en: "Non-Indexable" },
    ],
  },
  {
    titleTr: "Güvenlik (Security & Headers)",
    titleEn: "Security & Headers",
    items: [
      { key: "sec_http", tab: "security", tr: "HTTP (SSL Olmayan)", en: "HTTP (Non-Secure)" },
      { key: "sec_mixed_content", tab: "security", tr: "Karışık İçerik (Mixed Content)", en: "Mixed Content" },
      { key: "sec_missing_hsts", tab: "security", tr: "Eksik HSTS Başlığı", en: "Missing HSTS Header" },
      { key: "sec_missing_csp", tab: "security", tr: "Eksik CSP Başlığı", en: "Missing CSP Header" },
      { key: "sec_missing_xcto", tab: "security", tr: "Eksik X-Content-Type", en: "Missing X-Content-Type" },
      { key: "sec_missing_xfo", tab: "security", tr: "Eksik X-Frame-Options", en: "Missing X-Frame-Options" },
      { key: "sec_unsafe_target_blank", tab: "security", tr: "Güvensiz target=_blank", en: "Unsafe target=_blank" },
    ],
  },
  {
    titleTr: "Durum Kodları (Response Codes)",
    titleEn: "Response Codes",
    items: [
      { key: "status_2xx", tab: "response_codes", tr: "Başarılı (2xx OK)", en: "Success (2xx)" },
      { key: "status_3xx", tab: "response_codes", tr: "Yönlendirme (3xx)", en: "Redirection (3xx)" },
      { key: "status_4xx", tab: "response_codes", tr: "Kırık Link / İstemci Hatası (4xx)", en: "Client Error (4xx)" },
      { key: "status_5xx", tab: "response_codes", tr: "Sunucu Hatası (5xx / Timeout)", en: "Server Error (5xx)" },
      { key: "blocked_robots", tab: "response_codes", tr: "Robots.txt Engeli", en: "Blocked by Robots.txt" },
    ],
  },
  {
    titleTr: "URL Kalitesi",
    titleEn: "URL Quality",
    items: [
      { key: "url_uppercase", tab: "url_quality", tr: "Büyük Harf (Uppercase)", en: "Uppercase" },
      { key: "url_underscores", tab: "url_quality", tr: "Alt Çizgi (_)", en: "Underscores (_)" },
      { key: "url_parameters", tab: "url_quality", tr: "Parametreli (?)", en: "Parameters (?)" },
      { key: "url_non_ascii", tab: "url_quality", tr: "ASCII Dışı Karakter", en: "Non-ASCII Characters" },
      { key: "url_multiple_slashes", tab: "url_quality", tr: "Çift Eğik Çizgi (//)", en: "Multiple Slashes (//)" },
      { key: "url_over_115", tab: "url_quality", tr: "115 Karakterden Uzun", en: "Over 115 Characters" },
    ],
  },
  {
    titleTr: "Sayfa Başlıkları (Page Titles)",
    titleEn: "Page Titles",
    items: [
      { key: "title_missing", tab: "page_titles", tr: "Eksik Başlık (Missing)", en: "Missing" },
      { key: "title_duplicate", tab: "page_titles", tr: "Tekrarlanan (Duplicate)", en: "Duplicate" },
      { key: "title_over_60", tab: "page_titles", tr: "60 Karakterden Uzun", en: "Over 60 Characters" },
      { key: "title_below_30", tab: "page_titles", tr: "30 Karakterden Kısa", en: "Below 30 Characters" },
      { key: "title_over_561px", tab: "page_titles", tr: "561px Üzeri (SERP Kesilen)", en: "Over 561px (Truncated)" },
    ],
  },
  {
    titleTr: "Meta Açıklama (Meta Description)",
    titleEn: "Meta Description",
    items: [
      { key: "meta_missing", tab: "meta_description", tr: "Eksik Açıklama (Missing)", en: "Missing" },
      { key: "meta_duplicate", tab: "meta_description", tr: "Tekrarlanan (Duplicate)", en: "Duplicate" },
      { key: "meta_over_155", tab: "meta_description", tr: "155 Karakterden Uzun", en: "Over 155 Characters" },
      { key: "meta_below_70", tab: "meta_description", tr: "70 Karakterden Kısa", en: "Below 70 Characters" },
    ],
  },
  {
    titleTr: "Başlık Etiketleri (H1 & H2)",
    titleEn: "Headings (H1 & H2)",
    items: [
      { key: "h1_missing", tab: "h1", tr: "H1: Eksik", en: "H1: Missing" },
      { key: "h1_duplicate", tab: "h1", tr: "H1: Tekrarlanan", en: "H1: Duplicate" },
      { key: "h1_multiple", tab: "h1", tr: "H1: Birden Fazla", en: "H1: Multiple" },
      { key: "h2_missing", tab: "h2", tr: "H2: Eksik", en: "H2: Missing" },
    ],
  },
  {
    titleTr: "Canonical, Hreflang & Sayfalama",
    titleEn: "Canonicals, Hreflang & Pagination",
    items: [
      { key: "canonical_contains", tab: "canonicals", tr: "Canonical İçeren", en: "Contains Canonical" },
      { key: "canonical_missing", tab: "canonicals", tr: "Canonical Eksik", en: "Missing Canonical" },
      { key: "canonical_self", tab: "canonicals", tr: "Kendine İşaret Eden", en: "Self Referencing" },
      { key: "canonical_canonicalised", tab: "canonicals", tr: "Başka URL'ye İşaret Eden", en: "Canonicalised" },
      { key: "hreflang_contains", tab: "hreflang", tr: "Hreflang İçeren", en: "Contains Hreflang" },
      { key: "pagination_contains", tab: "hreflang", tr: "rel=next/prev İçeren", en: "Contains rel=next/prev" },
      { key: "directives_noindex", tab: "directives", tr: "Noindex Direktifi", en: "Noindex Directive" },
    ],
  },
  {
    titleTr: "Görsel, Schema & Benzerlik",
    titleEn: "Images, Schema & Duplicates",
    items: [
      { key: "images_missing_alt", tab: "images", tr: "Eksik Alt Etiketi (Images)", en: "Images: Missing Alt Text" },
      { key: "structured_data_has", tab: "structured_data", tr: "JSON-LD Schema Bulunan", en: "Contains JSON-LD Schema" },
      { key: "near_duplicates", tab: "near_duplicates", tr: "Yakın Kopyalar (MinHash)", en: "Near Duplicates (MinHash)" },
      { key: "custom_search_matched", tab: "custom", tr: "Özel Arama Eşleşen", en: "Custom Search Matched" },
      { key: "custom_extraction_matched", tab: "custom", tr: "Özel Veri Kazıma Eşleşen", en: "Custom Extraction Matched" },
    ],
  },
];

let ws = null;
let fetchDebounce = null;

function init() {
  document.getElementById("cfgPsiApiKey").value = state.psiApiKey;
  document.getElementById("cfgPsiStrategy").value = state.psiStrategy;
  document.getElementById("psiStrategySelect").value = state.psiStrategy;

  renderLanguageCards();
  bindEvents();
  updateListCountBadge();
  applyLanguage();
  renderModalRuleLists();
  connectWebSocket();
  fetchInitialStatus();
}

// Render extensible language cards inside Settings modal
function renderLanguageCards() {
  const container = document.getElementById("langCardsContainer");
  if (!container) return;
  container.innerHTML = Object.values(LOCALE_REGISTRY)
    .map(
      (loc) => `
      <button type="button" class="lang-card ${
        state.lang === loc.code ? "active" : ""
      }" data-lang="${loc.code}">
        <span class="lang-flag">${loc.flag}</span>
        <span class="lang-meta">
          <span class="lang-native">${esc(loc.nativeName)}</span>
          <span class="lang-sub">${esc(loc.regionName)}</span>
        </span>
      </button>
    `
    )
    .join("");

  container.querySelectorAll(".lang-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      const code = btn.getAttribute("data-lang");
      if (LOCALE_REGISTRY[code]) {
        state.lang = code;
        localStorage.setItem("openfrog_lang", code);
        renderLanguageCards();
        applyLanguage();
      }
    });
  });
}

function applyLanguage() {
  const dict = getDict();
  document.documentElement.lang = dict.code;

  setText("activeLangBadge", dict.badge);
  setText("lblStartBtn", dict.btnStart);
  setText(
    "btnPause",
    state.status === "paused" ? dict.btnResume : dict.btnPause
  );
  setText("btnStop", dict.btnStop);
  setText("btnClear", dict.btnClear);
  setText("lblEditListBtn", dict.lblEditListBtn);
  setText("lblDiffBtn", dict.lblDiffBtn);
  setText("lblConfigBtn", dict.lblConfigBtn);
  setText("lblAboutBtn", dict.lblAboutBtn);

  setText("optModeSpider", dict.modeSpider);
  setText("optModeList", dict.modeList);
  setText("optModeSitemap", dict.modeSitemap);

  document.getElementById("urlInput").placeholder =
    state.mode === "sitemap" ? dict.sitemapPlaceholder : dict.urlPlaceholder;
  setText("lblFilterSelect", dict.lblFilterSelect);
  document.getElementById("tableSearchInput").placeholder =
    dict.searchPlaceholder;
  setText("lblShownRows", dict.lblShownRows);
  setText("lblSidebarOverview", dict.lblSidebarOverview);
  setText("lblSidebarIssues", dict.lblSidebarIssues);
  setText("lblMetricCrawled", dict.lblMetricCrawled);
  setText("lblMetricQueued", dict.lblMetricQueued);
  setText("lblMetricSpeed", dict.lblMetricSpeed);

  setText("emptyTitle", dict.emptyTitle);
  const emptyDescEl = document.getElementById("emptyDesc");
  if (emptyDescEl) emptyDescEl.innerHTML = dict.emptyDesc;

  setText("lblSettingsModalTitle", dict.lblSettingsModalTitle);
  setText("lblSettingsLangHeader", dict.lblSettingsLangHeader);
  setText("lblSettingsLangHint", dict.lblSettingsLangHint);
  setText("lblSettingsCrawlHeader", dict.lblSettingsCrawlHeader);
  setText("lblSettingsProxyHeader", dict.lblSettingsProxyHeader);
  setText("lblSettingsPsiHeader", dict.lblSettingsPsiHeader);
  setText("btnSaveConfig", dict.lblSaveConfigBtn);
  setText("lblBulkPsiBtn", dict.lblBulkPsiBtn);
  setText("optPsiMobile", dict.optPsiMobile);
  setText("optPsiDesktop", dict.optPsiDesktop);

  // Update Primary Tab Labels
  document.querySelectorAll("[data-i18n-tab]").forEach((el) => {
    const key = el.getAttribute("data-i18n-tab");
    if (dict.tabs[key]) el.textContent = dict.tabs[key];
  });

  // Update Inspector Tab Labels
  document.querySelectorAll("[data-i18n-itab]").forEach((el) => {
    const key = el.getAttribute("data-i18n-itab");
    if (dict.itabs[key]) el.textContent = dict.itabs[key];
  });

  updateProxyStatusFooter();
  populateSubFilterSelect();
  renderOverviewTree();
  renderIssuesList();
  renderDataGrid();
  renderInspectorContent();
}

function updateProxyStatusFooter() {
  const dict = getDict();
  const el = document.getElementById("proxyStatusIndicator");
  if (!el) return;
  if (state.proxyMode === "single") {
    el.textContent = dict.proxySingle;
    el.style.color = "var(--signal-amber)";
  } else if (state.proxyMode === "rotating") {
    el.textContent = dict.proxyRotating;
    el.style.color = "var(--signal-blue)";
  } else {
    el.textContent = dict.proxyDirect;
    el.style.color = "var(--signal-emerald)";
  }
}

// About Modal with schevko & MIT Open Source License (Zero REA mentions)
function renderAboutModalContent() {
  const body = document.getElementById("aboutModalBody");
  const title = document.getElementById("aboutModalTitle");
  const isTr = state.lang === "tr";

  title.textContent = isTr
    ? "Froggie v2.2 — Hakkında, Açık Kaynak Repo & MIT Lisansı"
    : "About Froggie v2.2 — Open Source Repo & MIT License";

  body.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:14px;line-height:1.55;">
      <div style="background:var(--bg-canvas);border:1px solid var(--border-strong);padding:16px;border-radius:8px;display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span class="badge badge-ok" style="font-size:11.5px;padding:2px 8px;">v2.2 Universal</span>
            <span class="badge badge-info" style="font-size:11.5px;padding:2px 8px;">MIT Open Source License</span>
          </div>
          <h3 style="color:var(--text-primary);font-size:15px;margin-bottom:4px;">Froggie</h3>
          <p style="color:var(--text-secondary);font-size:12.5px;max-width:500px;">
            ${
              isTr
                ? "Modern teknik SEO denetimi, gerçek zamanlı Core Web Vitals / PageSpeed analizi, kırık link tespiti, görsel bağlantı grafiği ve SERP simülasyonu için geliştirilmiş yüksek performanslı açık kaynak masaüstü web tarayıcısı."
                : "High-performance open-source desktop technical SEO spider for full-site auditing, real-time Core Web Vitals / PageSpeed analysis, broken link detection, interactive link graphs, and SERP simulation."
            }
          </p>
        </div>
        <div style="background:var(--bg-elevated);border:1px solid var(--border-hairline);border-radius:6px;padding:10px 14px;min-width:210px;">
          <div style="font-size:10.5px;text-transform:uppercase;color:var(--text-muted);font-weight:700;margin-bottom:4px;">
            ${isTr ? "GitHub Repo & Lisans" : "GitHub Repo & License"}
          </div>
          <div style="font-weight:700;color:var(--signal-emerald);font-size:13.5px;">schevko</div>
          <div class="mono-cell" style="color:var(--signal-blue);font-size:11.5px;margin-top:2px;">github.com/schevko/froggie</div>
          <div class="mono-cell" style="color:var(--text-secondary);font-size:11.5px;margin-top:2px;">github.com/schevko</div>
        </div>
      </div>

      <div class="kv-grid">
        <div class="kv-item">
          <span class="kv-label">${isTr ? "Masaüstü Mimarisi" : "Desktop Architecture"}</span>
          <span class="kv-val">macOS Universal (Apple Silicon ARM64 + Intel x86_64) & Windows x64</span>
        </div>
        <div class="kv-item">
          <span class="kv-label">${isTr ? "Tarama & HTML Akış Motoru" : "Streaming HTML Engine"}</span>
          <span class="kv-val">Bun Runtime + Cloudflare lol_html (HTMLRewriter)</span>
        </div>
        <div class="kv-item">
          <span class="kv-label">${isTr ? "İndeksleme & Veritabanı" : "BitSet Index & Storage"}</span>
          <span class="kv-val">49x 32-Bit FastBitSet (O(1) Filtering) + SQLite 3 WAL</span>
        </div>
        <div class="kv-item">
          <span class="kv-label">${isTr ? "SEO & Performans Algoritmaları" : "SEO & CWV Algorithms"}</span>
          <span class="kv-val">64-Hash MinHash + Aho-Corasick + 18-Iter PageRank + Live CWV</span>
        </div>
      </div>

      <div style="background:var(--bg-canvas);border:1px solid var(--border-hairline);padding:12px 14px;border-radius:6px;">
        <div style="font-size:11px;font-weight:700;color:var(--text-secondary);margin-bottom:6px;text-transform:uppercase;">
          MIT License — Copyright (c) 2026 schevko (https://github.com/schevko/froggie)
        </div>
        <pre style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);white-space:pre-wrap;line-height:1.45;">Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.</pre>
      </div>
    </div>
  `;
}

function updateListCountBadge() {
  setText("listUrlCount", state.urlList.length);
}

function connectWebSocket() {
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  ws = new WebSocket(`${proto}//${location.host}/ws`);
  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      if (msg.type === "status_update") {
        handleStatusUpdate(msg.data, msg.issues || []);
      }
    } catch {}
  };
  ws.onclose = () => {
    setTimeout(connectWebSocket, 1500);
  };
}

async function fetchInitialStatus() {
  try {
    const res = await fetch("/api/status");
    const data = await res.json();
    handleStatusUpdate(data, data.issues || []);
  } catch {}
}

function handleStatusUpdate(summary, issues) {
  state.status = summary.status;
  state.counts = summary.counts || {};
  state.issues = issues;
  if (summary.proxyMode) state.proxyMode = summary.proxyMode;
  updateProxyStatusFooter();

  const dict = getDict();
  const isRunning = summary.status === "running";
  const isPaused = summary.status === "paused";
  document.getElementById("btnStart").disabled = isRunning;
  const btnPause = document.getElementById("btnPause");
  btnPause.disabled = !isRunning && !isPaused;
  btnPause.textContent = isPaused ? dict.btnResume : dict.btnPause;
  document.getElementById("btnStop").disabled = !isRunning && !isPaused;

  document.getElementById("mCrawled").textContent = summary.crawled || 0;
  document.getElementById("mQueued").textContent = summary.queued || 0;
  document.getElementById("mSpeed").textContent = summary.urlsPerSec || 0;

  const dot = document.getElementById("statusDot");
  dot.className = "status-dot" + (isRunning ? " running" : "");

  const statusLabelsTr = {
    idle: "Hazır — Tarama bekleniyor",
    running: `Taranıyor [${(summary.mode || "spider").toUpperCase()}]: ${summary.startUrl} (${summary.crawled} URL, ${summary.activeWorkers} worker)`,
    paused: `Duraklatıldı (${summary.crawled} URL)`,
    completed: `Tamamlandı — ${summary.crawled} URL ${summary.elapsedSec} sn içinde analiz edildi (${summary.urlsPerSec} URL/sn)`,
    stopped: `Durduruldu — ${summary.crawled} URL`,
  };
  const statusLabelsEn = {
    idle: "Ready — Waiting for crawl",
    running: `Crawling [${(summary.mode || "spider").toUpperCase()}]: ${summary.startUrl} (${summary.crawled} URLs, ${summary.activeWorkers} workers)`,
    paused: `Paused (${summary.crawled} URLs)`,
    completed: `Completed — ${summary.crawled} URLs analyzed in ${summary.elapsedSec}s (${summary.urlsPerSec} URL/s)`,
    stopped: `Stopped — ${summary.crawled} URLs`,
  };
  const labels = state.lang === "tr" ? statusLabelsTr : statusLabelsEn;
  document.getElementById("statusText").textContent =
    labels[summary.status] || summary.status;

  document.getElementById("progressBar").style.width = `${summary.progressPct || 0}%`;
  document.getElementById("progressLabel").textContent = `${summary.progressPct || 0}%`;

  const c = state.counts;
  setText("tc-internal", c.internal ?? 0);
  setText("tc-external", c.external ?? 0);
  setText(
    "tc-security",
    (c.sec_http ?? 0) + (c.sec_mixed_content ?? 0) + (c.sec_missing_hsts ?? 0)
  );
  setText("tc-all", c.all ?? 0);
  setText(
    "tc-url",
    (c.url_uppercase ?? 0) + (c.url_underscores ?? 0) + (c.url_parameters ?? 0)
  );
  setText("tc-titles", c.internal ?? 0);
  setText("tc-meta", c.internal ?? 0);
  setText("tc-h1", c.internal ?? 0);
  setText("tc-h2", c.internal ?? 0);
  setText("tc-canonicals", c.internal ?? 0);
  setText(
    "tc-hreflang",
    (c.hreflang_contains ?? 0) + (c.pagination_contains ?? 0)
  );
  setText("tc-images", c.images_missing_alt ?? 0);
  setText("tc-directives", c.directives_noindex ?? 0);
  setText("tc-schema", c.structured_data_has ?? 0);
  setText("tc-dups", c.near_duplicates ?? 0);
  setText(
    "tc-custom",
    (c.custom_search_matched ?? 0) + (c.custom_extraction_matched ?? 0)
  );

  renderOverviewTree();
  renderIssuesList();
  scheduleTableRefresh();
}

function scheduleTableRefresh() {
  if (fetchDebounce) return;
  fetchDebounce = setTimeout(async () => {
    fetchDebounce = null;
    await loadTableRows();
  }, 160);
}

async function loadTableRows() {
  if (state.activeTab === "force_graph") return;
  try {
    const params = new URLSearchParams({
      filter: state.activeFilter,
      search: state.searchQuery,
      limit: "1500",
    });
    const res = await fetch(`/api/pages?${params}`);
    const data = await res.json();
    state.pages = data.items || [];
    document.getElementById("shownCount").textContent =
      data.total ?? state.pages.length;

    const emptyEl = document.getElementById("emptyState");
    if ((state.counts.all || 0) === 0) {
      emptyEl.classList.remove("hidden");
    } else {
      emptyEl.classList.add("hidden");
    }

    renderDataGrid();
  } catch {}
}

function renderDataGrid() {
  const head = document.getElementById("gridHead");
  const body = document.getElementById("gridBody");

  const cols = getColumnsForTab(state.activeTab);
  head.innerHTML = `<tr>${cols
    .map((c) => `<th style="width:${c.width || "auto"}">${c.label}</th>`)
    .join("")}</tr>`;

  if (state.pages.length === 0) {
    const emptyMsg =
      state.lang === "tr"
        ? "Bu filtre için eşleşen URL bulunamadı."
        : "No matching URLs found for this filter.";
    body.innerHTML =
      (state.counts.all || 0) > 0
        ? `<tr><td colspan="${cols.length}" style="text-align:center;color:var(--text-muted);padding:20px;">${emptyMsg}</td></tr>`
        : "";
    return;
  }

  const rowsHtml = [];
  for (let i = 0; i < state.pages.length; i++) {
    const p = state.pages[i];
    const selectedClass = p.id === state.selectedPageId ? "selected" : "";
    const cells = cols.map((col) => col.render(p, i + 1)).join("");
    rowsHtml.push(`<tr class="${selectedClass}" data-id="${p.id}">${cells}</tr>`);
  }
  body.innerHTML = rowsHtml.join("");
}

function scoreBadgeClass(score) {
  if (score >= 85) return "badge-ok";
  if (score >= 55) return "badge-warn";
  return "badge-err";
}

function getColumnsForTab(tab) {
  const colIndex = {
    label: "#",
    width: "42px",
    render: (_p, idx) => `<td class="mono-cell">${idx}</td>`,
  };
  const colAddress = {
    label: L("Adres (URL)", "Address (URL)"),
    width: "265px",
    render: (p) => `<td class="mono-cell" title="${esc(p.url)}">${esc(p.url)}</td>`,
  };
  const colStatus = {
    label: L("Durum", "Status"),
    width: "85px",
    render: (p) => `<td class="mono-cell">${renderStatusBadge(p.statusCode, p.statusText)}</td>`,
  };
  const colIndexability = {
    label: L("İndekslenebilirlik", "Indexability"),
    width: "115px",
    render: (p) =>
      `<td>${
        p.indexability === "Indexable"
          ? `<span class="badge badge-ok">${L("İndekslenebilir", "Indexable")}</span>`
          : `<span class="badge badge-warn">${L("İndekslenemez", "Non-Indexable")}</span>`
      }</td>`,
  };
  const colIndexReason = {
    label: L("İndeks Durum Nedeni", "Indexability Status"),
    width: "145px",
    render: (p) => `<td>${esc(p.indexabilityStatus)}</td>`,
  };

  if (tab === "security") {
    return [
      colIndex,
      colAddress,
      {
        label: L("Protokol", "Protocol"),
        width: "90px",
        render: (p) =>
          `<td class="mono-cell">${
            p.security?.isHttps
              ? `<span class="badge badge-ok">HTTPS</span>`
              : `<span class="badge badge-err">HTTP</span>`
          }</td>`,
      },
      {
        label: "Mixed Content",
        width: "120px",
        render: (p) =>
          `<td class="mono-cell">${
            (p.security?.mixedContentUrls || []).length > 0
              ? `<span class="badge badge-err">${p.security.mixedContentUrls.length} Mixed</span>`
              : `<span class="badge badge-ok">0</span>`
          }</td>`,
      },
      {
        label: "HSTS",
        width: "85px",
        render: (p) =>
          `<td>${
            p.security?.hasHsts
              ? `<span class="badge badge-ok">OK</span>`
              : `<span class="badge badge-warn">${L("Eksik", "Missing")}</span>`
          }</td>`,
      },
      {
        label: "CSP",
        width: "85px",
        render: (p) =>
          `<td>${
            p.security?.hasCsp
              ? `<span class="badge badge-ok">OK</span>`
              : `<span class="badge badge-warn">${L("Eksik", "Missing")}</span>`
          }</td>`,
      },
      {
        label: "X-Content-Type",
        width: "115px",
        render: (p) =>
          `<td>${
            p.security?.hasXContentTypeOptions
              ? `<span class="badge badge-ok">nosniff</span>`
              : `<span class="badge badge-warn">${L("Eksik", "Missing")}</span>`
          }</td>`,
      },
      {
        label: "X-Frame-Options",
        width: "115px",
        render: (p) =>
          `<td>${
            p.security?.hasXFrameOptions
              ? `<span class="badge badge-ok">OK</span>`
              : `<span class="badge badge-warn">${L("Eksik", "Missing")}</span>`
          }</td>`,
      },
      {
        label: L("Çıkış IP / Proxy", "Via Proxy"),
        width: "140px",
        render: (p) => `<td class="mono-cell">${esc(p.viaProxy || "Direct")}</td>`,
      },
    ];
  }

  if (tab === "url_quality") {
    return [
      colIndex,
      colAddress,
      {
        label: L("Uzunluk", "Length"),
        width: "90px",
        render: (p) =>
          `<td class="mono-cell">${
            (p.urlLength || p.url.length) > 115
              ? `<span class="badge badge-warn">${p.url.length} (>115)</span>`
              : `${p.url.length} chars`
          }</td>`,
      },
      {
        label: L("Büyük Harf", "Uppercase"),
        width: "95px",
        render: (p) =>
          `<td>${
            p.urlQuality?.hasUppercase
              ? `<span class="badge badge-warn">${L("Var", "Yes")}</span>`
              : L("Yok", "No")
          }</td>`,
      },
      {
        label: L("Alt Çizgi (_)", "Underscores (_)"),
        width: "110px",
        render: (p) =>
          `<td>${
            p.urlQuality?.hasUnderscores
              ? `<span class="badge badge-warn">${L("Var", "Yes")}</span>`
              : L("Yok", "No")
          }</td>`,
      },
      {
        label: L("Parametre (?)", "Parameters (?)"),
        width: "110px",
        render: (p) =>
          `<td>${
            p.urlQuality?.hasParameters
              ? `<span class="badge badge-warn">${L("Var", "Yes")}</span>`
              : L("Yok", "No")
          }</td>`,
      },
      {
        label: "Non-ASCII",
        width: "95px",
        render: (p) =>
          `<td>${
            p.urlQuality?.hasNonAscii
              ? `<span class="badge badge-err">${L("Var", "Yes")}</span>`
              : L("Yok", "No")
          }</td>`,
      },
      {
        label: L("Çift Slash (//)", "Multi Slashes (//)"),
        width: "115px",
        render: (p) =>
          `<td>${
            p.urlQuality?.hasMultipleSlashes
              ? `<span class="badge badge-warn">${L("Var", "Yes")}</span>`
              : L("Yok", "No")
          }</td>`,
      },
    ];
  }

  if (tab === "hreflang") {
    return [
      colIndex,
      colAddress,
      {
        label: L("Hreflang Sayısı", "Hreflang Count"),
        width: "115px",
        render: (p) => `<td class="mono-cell">${(p.hreflangs || []).length}</td>`,
      },
      {
        label: L("Diller", "Languages"),
        width: "180px",
        render: (p) =>
          `<td class="mono-cell">${esc(
            (p.hreflangs || []).map((h) => h.lang).join(", ") || "—"
          )}</td>`,
      },
      {
        label: L("Hreflang Durumu", "Hreflang Status"),
        width: "210px",
        render: (p) =>
          `<td>${
            (p.hreflangIssues || []).length > 0
              ? `<span class="badge badge-warn">${esc(p.hreflangIssues[0])}</span>`
              : (p.hreflangs || []).length > 0
              ? `<span class="badge badge-ok">OK</span>`
              : "—"
          }</td>`,
      },
      {
        label: "rel=next",
        width: "180px",
        render: (p) => `<td class="mono-cell">${esc(p.relNext || "—")}</td>`,
      },
      {
        label: "rel=prev",
        width: "180px",
        render: (p) => `<td class="mono-cell">${esc(p.relPrev || "—")}</td>`,
      },
    ];
  }

  if (tab === "pagespeed") {
    return [
      colIndex,
      colAddress,
      {
        label: L("Link Puanı", "Link Score"),
        width: "95px",
        render: (p) =>
          `<td class="mono-cell"><span class="badge badge-ok">${
            p.linkScore ?? 50
          } / 100</span></td>`,
      },
      {
        label: L("Performans", "Performance"),
        width: "110px",
        render: (p) =>
          p.pageSpeed
            ? `<td class="mono-cell"><span class="badge ${scoreBadgeClass(
                p.pageSpeed.performanceScore
              )}">${p.pageSpeed.performanceScore} / 100</span></td>`
            : `<td><button class="pill-btn" onclick="event.stopPropagation();runPageSpeedForRow(${p.id}, this)">⚡ ${L("Ölç", "Measure")}</button></td>`,
      },
      {
        label: L("SEO / Erişilebilirlik", "SEO / A11y"),
        width: "130px",
        render: (p) =>
          p.pageSpeed
            ? `<td class="mono-cell"><span class="badge ${scoreBadgeClass(
                p.pageSpeed.seoScore ?? 90
              )}">SEO ${p.pageSpeed.seoScore ?? 90}</span> <span class="badge badge-info">A11y ${
                p.pageSpeed.accessibilityScore ?? 90
              }</span></td>`
            : `<td class="mono-cell">—</td>`,
      },
      {
        label: "LCP",
        width: "95px",
        render: (p) => `<td class="mono-cell">${esc(p.pageSpeed?.lcp || "—")}</td>`,
      },
      {
        label: "CLS",
        width: "80px",
        render: (p) => `<td class="mono-cell">${esc(p.pageSpeed?.cls || "—")}</td>`,
      },
      {
        label: "FCP / TBT",
        width: "130px",
        render: (p) =>
          `<td class="mono-cell">${
            p.pageSpeed ? `${p.pageSpeed.fcp} / ${p.pageSpeed.tbt}` : "—"
          }</td>`,
      },
      {
        label: "TTFB",
        width: "90px",
        render: (p) =>
          `<td class="mono-cell">${esc(
            p.pageSpeed?.ttfb || `${p.responseTimeMs} ms`
          )}</td>`,
      },
      {
        label: L("JS / CSS", "JS / CSS"),
        width: "105px",
        render: (p) =>
          `<td class="mono-cell">${p.jsCount || 0} JS / ${p.cssCount || 0} CSS</td>`,
      },
    ];
  }

  if (tab === "page_titles") {
    return [
      colIndex,
      colAddress,
      colIndexability,
      {
        label: L("Sayfa Başlığı (Title 1)", "Title 1"),
        width: "280px",
        render: (p) =>
          `<td title="${esc(p.title1)}">${
            p.title1
              ? esc(p.title1)
              : `<span class="badge badge-err">${L("Eksik", "Missing")}</span>`
          }</td>`,
      },
      {
        label: L("Karakter Sayısı", "Title 1 Length"),
        width: "110px",
        render: (p) => `<td class="mono-cell">${p.title1Length} chars</td>`,
      },
      {
        label: L("Piksel Genişliği", "Title 1 Pixel Width"),
        width: "130px",
        render: (p) =>
          `<td class="mono-cell">${
            p.title1PixelWidth > 561
              ? `<span class="badge badge-warn">${p.title1PixelWidth} px (>561)</span>`
              : `${p.title1PixelWidth} px`
          }</td>`,
      },
    ];
  }

  if (tab === "meta_description") {
    return [
      colIndex,
      colAddress,
      colIndexability,
      {
        label: L("Meta Açıklama 1", "Meta Description 1"),
        width: "320px",
        render: (p) =>
          `<td title="${esc(p.metaDescription1)}">${
            p.metaDescription1
              ? esc(p.metaDescription1)
              : `<span class="badge badge-warn">${L("Eksik", "Missing")}</span>`
          }</td>`,
      },
      {
        label: L("Uzunluk", "Length"),
        width: "95px",
        render: (p) => `<td class="mono-cell">${p.metaDescription1Length} chars</td>`,
      },
      {
        label: L("Piksel Genişliği", "Pixel Width"),
        width: "120px",
        render: (p) => `<td class="mono-cell">${p.metaDescription1PixelWidth} px</td>`,
      },
    ];
  }

  if (tab === "h1") {
    return [
      colIndex,
      colAddress,
      colIndexability,
      {
        label: L("H1-1 Ana Başlık", "H1-1"),
        width: "290px",
        render: (p) =>
          `<td title="${esc(p.h1_1)}">${
            p.h1_1
              ? esc(p.h1_1)
              : `<span class="badge badge-err">${L("H1 Eksik", "Missing H1")}</span>`
          }</td>`,
      },
      {
        label: L("Uzunluk", "H1-1 Length"),
        width: "100px",
        render: (p) => `<td class="mono-cell">${p.h1_1Length}</td>`,
      },
      {
        label: L("H1 Adedi", "H1 Count"),
        width: "95px",
        render: (p) =>
          `<td class="mono-cell">${
            p.h1Count > 1
              ? `<span class="badge badge-warn">${p.h1Count} (${L("Çoklu", "Multiple")})</span>`
              : p.h1Count
          }</td>`,
      },
    ];
  }

  if (tab === "h2") {
    return [
      colIndex,
      colAddress,
      colIndexability,
      {
        label: "H2-1",
        width: "300px",
        render: (p) => `<td title="${esc(p.h2_1)}">${esc(p.h2_1 || "—")}</td>`,
      },
      {
        label: L("H2 Adedi", "H2 Count"),
        width: "95px",
        render: (p) => `<td class="mono-cell">${p.h2Count}</td>`,
      },
    ];
  }

  if (tab === "canonicals") {
    return [
      colIndex,
      colAddress,
      colStatus,
      colIndexability,
      colIndexReason,
      {
        label: L("Canonical Link Etiketi", "Canonical Link Element 1"),
        width: "300px",
        render: (p) =>
          `<td class="mono-cell" title="${esc(p.canonicalLinkElement)}">${esc(
            p.canonicalLinkElement || "—"
          )}</td>`,
      },
    ];
  }

  if (tab === "images") {
    return [
      colIndex,
      colAddress,
      {
        label: L("Toplam Görsel", "Total Images"),
        width: "110px",
        render: (p) => `<td class="mono-cell">${p.imagesCount}</td>`,
      },
      {
        label: L("Eksik Alt Etiketi Sayısı", "Missing Alt Count"),
        width: "140px",
        render: (p) =>
          `<td class="mono-cell">${
            p.imagesMissingAltCount > 0
              ? `<span class="badge badge-warn">${p.imagesMissingAltCount} ${L("Eksik Alt", "Missing Alt")}</span>`
              : `<span class="badge badge-ok">0</span>`
          }</td>`,
      },
      {
        label: L("Örnek Eksik Alt Görseli", "Sample Image Without Alt"),
        width: "300px",
        render: (p) => {
          const firstMissing = (p.images || []).find((img) => img.missingAlt);
          return `<td class="mono-cell">${esc(firstMissing ? firstMissing.src : "—")}</td>`;
        },
      },
    ];
  }

  if (tab === "structured_data") {
    return [
      colIndex,
      colAddress,
      {
        label: "Schema.org @type",
        width: "220px",
        render: (p) =>
          `<td class="mono-cell">${
            (p.schemaTypes || []).length > 0
              ? esc(p.schemaTypes.join(", "))
              : "—"
          }</td>`,
      },
      {
        label: L("JSON-LD Sayısı", "JSON-LD Blocks"),
        width: "110px",
        render: (p) => `<td class="mono-cell">${(p.schemaRaw || []).length}</td>`,
      },
      {
        label: L("Doğrulama", "Validation"),
        width: "160px",
        render: (p) =>
          `<td>${
            (p.schemaErrors || []).length > 0
              ? `<span class="badge badge-err">${p.schemaErrors.length} Error</span>`
              : (p.schemaRaw || []).length > 0
              ? `<span class="badge badge-ok">Valid JSON-LD</span>`
              : "—"
          }</td>`,
      },
    ];
  }

  if (tab === "near_duplicates") {
    return [
      colIndex,
      colAddress,
      {
        label: L("MinHash Benzerliği", "Max MinHash Similarity"),
        width: "155px",
        render: (p) =>
          `<td class="mono-cell">${
            p.maxSimilarity >= 75
              ? `<span class="badge badge-warn">%${p.maxSimilarity}</span>`
              : `%${p.maxSimilarity}`
          }</td>`,
      },
      {
        label: L("En Benzer Kopya URL", "Closest Matching URL"),
        width: "300px",
        render: (p) => {
          const top = (p.nearDuplicates || [])[0];
          return `<td class="mono-cell">${esc(top ? top.otherUrl : "—")}</td>`;
        },
      },
      {
        label: L("Kelime Sayısı", "Word Count"),
        width: "100px",
        render: (p) => `<td class="mono-cell">${p.wordCount}</td>`,
      },
      {
        label: "Content SHA-1",
        width: "130px",
        render: (p) => `<td class="mono-cell">${esc(p.contentHash || "—")}</td>`,
      },
    ];
  }

  if (tab === "custom") {
    return [
      colIndex,
      colAddress,
      {
        label: L("Aho-Corasick Özel Arama Eşleşmeleri", "Aho-Corasick Search Matches"),
        width: "240px",
        render: (p) => {
          const entries = Object.entries(p.customSearchMatches || {});
          return `<td class="mono-cell">${
            entries.length > 0
              ? esc(entries.map(([k, v]) => `${k}: ${v}`).join(" | "))
              : "—"
          }</td>`;
        },
      },
      {
        label: L("Özel Veri Kazıma (CSS/Regex)", "Custom Extractions (CSS/Regex)"),
        width: "280px",
        render: (p) => {
          const entries = Object.entries(p.customExtractions || {});
          return `<td class="mono-cell">${
            entries.length > 0
              ? esc(entries.map(([k, v]) => `${k}: ${v}`).join(" | "))
              : "—"
          }</td>`;
        },
      },
    ];
  }

  if (tab === "response_codes") {
    return [
      colIndex,
      colAddress,
      colStatus,
      {
        label: L("Durum Açıklaması", "Status Text"),
        width: "140px",
        render: (p) => `<td>${esc(p.statusText)}</td>`,
      },
      colIndexability,
      {
        label: L("Yönlendirme Hedefi (Redirect URL)", "Redirect URL"),
        width: "240px",
        render: (p) => `<td class="mono-cell">${esc(p.redirectUrl || "—")}</td>`,
      },
      {
        label: L("Yanıt Süresi", "Response Time"),
        width: "110px",
        render: (p) => `<td class="mono-cell">${p.responseTimeMs} ms</td>`,
      },
    ];
  }

  // Default: Internal / External / Directives
  return [
    colIndex,
    colAddress,
    colStatus,
    colIndexability,
    {
      label: L("Link Puanı", "Link Score"),
      width: "85px",
      render: (p) =>
        `<td class="mono-cell"><span class="badge badge-ok">${p.linkScore ?? 50}</span></td>`,
    },
    {
      label: L("Başlık (Title 1)", "Title 1"),
      width: "200px",
      render: (p) => `<td title="${esc(p.title1)}">${esc(p.title1 || "—")}</td>`,
    },
    {
      label: "H1-1",
      width: "170px",
      render: (p) => `<td title="${esc(p.h1_1)}">${esc(p.h1_1 || "—")}</td>`,
    },
    {
      label: L("Kelime", "Words"),
      width: "70px",
      render: (p) => `<td class="mono-cell">${p.wordCount}</td>`,
    },
    {
      label: L("Derinlik", "Depth"),
      width: "65px",
      render: (p) => `<td class="mono-cell">${p.crawlDepth}</td>`,
    },
    {
      label: "Inlinks",
      width: "70px",
      render: (p) => `<td class="mono-cell">${p.inlinksCount}</td>`,
    },
    {
      label: "Outlinks",
      width: "70px",
      render: (p) => `<td class="mono-cell">${p.outlinksCount}</td>`,
    },
    {
      label: L("Süre", "Time"),
      width: "75px",
      render: (p) => `<td class="mono-cell">${p.responseTimeMs} ms</td>`,
    },
  ];
}

window.runPageSpeedForRow = async (pageId, btnEl) => {
  if (btnEl) {
    btnEl.disabled = true;
    btnEl.textContent = L("Ölçülüyor...", "Measuring...");
  }
  await fetch("/api/pagespeed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pageId,
      apiKey: state.psiApiKey,
      strategy: state.psiStrategy,
    }),
  });
  await loadTableRows();
  if (state.selectedPageId === pageId) {
    await selectPageRow(pageId);
  }
};

function renderStatusBadge(code, text) {
  if (code >= 200 && code < 300) {
    return `<span class="badge badge-ok">${code}</span>`;
  }
  if (code >= 300 && code < 400) {
    return `<span class="badge badge-warn">${code}</span>`;
  }
  if (code >= 400 || code === 0) {
    return `<span class="badge badge-err">${code || "ERR"}</span>`;
  }
  return `<span class="badge">${code} ${esc(text)}</span>`;
}

function renderOverviewTree() {
  const container = document.getElementById("overviewTree");
  const totalInternal = state.counts.internal || 0;

  let html = "";
  for (const group of OVERVIEW_GROUPS) {
    const gTitle = state.lang === "tr" ? group.titleTr : group.titleEn;
    html += `<div class="tree-group"><div class="tree-group-title">${esc(
      gTitle
    )}</div>`;
    for (const item of group.items) {
      const count = state.counts[item.key] ?? 0;
      const pct =
        totalInternal > 0 && item.key !== "external"
          ? ` (${Math.min(100, Math.round((count / totalInternal) * 100))}%)`
          : "";
      const active =
        state.activeFilter === item.key && state.activeTab === item.tab
          ? "active"
          : "";
      const lbl = state.lang === "tr" ? item.tr : item.en;
      html += `
        <div class="tree-item ${active}" data-tab="${item.tab}" data-filter="${item.key}">
          <span>${esc(lbl)}</span>
          <span class="tree-count">${count}${pct}</span>
        </div>
      `;
    }
    html += `</div>`;
  }
  container.innerHTML = html;
}

function renderIssuesList() {
  const nonZeroIssues = (state.issues || []).filter((i) => i.count > 0);
  document.getElementById("issueCountBadge").textContent = nonZeroIssues.length;

  const container = document.getElementById("issuesList");
  if (nonZeroIssues.length === 0) {
    container.innerHTML = `<div style="color:var(--text-muted);text-align:center;padding:20px;">${L(
      "Henüz tespit edilen SEO sorunu yok.",
      "No SEO issues detected yet."
    )}</div>`;
    return;
  }

  container.innerHTML = nonZeroIssues
    .map((iss) => {
      const badgeClass =
        iss.severity === "High"
          ? "badge-err"
          : iss.severity === "Medium"
          ? "badge-warn"
          : "badge-ok";
      const title =
        state.lang === "tr"
          ? iss.titleTr || iss.titleEn || iss.title
          : iss.titleEn || iss.title;
      const desc =
        state.lang === "tr"
          ? iss.descTr || iss.descEn || iss.description
          : iss.descEn || iss.description;
      return `
      <div class="issue-card" data-filter="${iss.id}">
        <div class="issue-top">
          <span class="issue-title">${esc(title)}</span>
          <span class="badge ${badgeClass}">${iss.severity} (${iss.count})</span>
        </div>
        <div class="issue-desc">${esc(desc)}</div>
      </div>
    `;
    })
    .join("");
}

async function selectPageRow(id) {
  state.selectedPageId = Number(id);
  document.querySelectorAll("#gridBody tr").forEach((tr) => {
    tr.classList.toggle("selected", Number(tr.dataset.id) === state.selectedPageId);
  });

  try {
    const res = await fetch(`/api/page/${state.selectedPageId}`);
    if (!res.ok) return;
    state.inspectorData = await res.json();
    const { page, inlinks, outlinks } = state.inspectorData;

    document.getElementById("inspectorSelectedUrl").textContent = page.url;
    setText("ic-inlinks", inlinks.length);
    setText("ic-outlinks", outlinks.length);
    setText("ic-images", (page.images || []).length);
    setText("ic-dups", (page.nearDuplicates || []).length);
    setText("ic-schema", (page.schemaRaw || []).length);

    renderInspectorContent();
  } catch {}
}

function renderPsiInspectorCard(ps) {
  if (!ps) return "";
  return `
    <div class="psi-score-strip">
      <div class="psi-gauge-card">
        <span class="psi-gauge-label">Performance (${esc(ps.strategy?.toUpperCase() || "MOBILE")})</span>
        <span class="badge ${scoreBadgeClass(ps.performanceScore)} psi-gauge-val">${ps.performanceScore}/100</span>
      </div>
      <div class="psi-gauge-card">
        <span class="psi-gauge-label">SEO Score</span>
        <span class="badge ${scoreBadgeClass(ps.seoScore ?? 92)} psi-gauge-val">${ps.seoScore ?? 92}/100</span>
      </div>
      <div class="psi-gauge-card">
        <span class="psi-gauge-label">Accessibility</span>
        <span class="badge ${scoreBadgeClass(ps.accessibilityScore ?? 88)} psi-gauge-val">${ps.accessibilityScore ?? 88}/100</span>
      </div>
      <div class="psi-gauge-card">
        <span class="psi-gauge-label">Best Practices</span>
        <span class="badge ${scoreBadgeClass(ps.bestPracticesScore ?? 95)} psi-gauge-val">${ps.bestPracticesScore ?? 95}/100</span>
      </div>
    </div>
    <div class="kv-grid" style="margin-bottom:8px;">
      <div class="kv-item">
        <span class="kv-label">Core Web Vitals (LCP / CLS / FCP)</span>
        <span class="kv-val">LCP: ${esc(ps.lcp)} • CLS: ${esc(ps.cls)} • FCP: ${esc(ps.fcp)}</span>
      </div>
      <div class="kv-item">
        <span class="kv-label">Interactivity & Server (TBT / TTFB / SI)</span>
        <span class="kv-val">TBT: ${esc(ps.tbt)} • TTFB: ${esc(ps.ttfb || "—")} • Speed Index: ${esc(ps.speedIndex || "—")}</span>
      </div>
      <div class="kv-item">
        <span class="kv-label">${L("PageSpeed Teşhis & Öneriler", "PageSpeed Diagnostics")} (${esc(ps.source || "CWV Engine")})</span>
        <span class="kv-val">${(ps.diagnostics || []).map(esc).join("<br>• ")}</span>
      </div>
    </div>
  `;
}

async function renderInspectorContent() {
  const body = document.getElementById("inspectorBody");
  const itab = state.selectedInspectorTab;

  if (itab === "robots") {
    const res = await fetch("/api/robots");
    const rdata = await res.json();
    body.innerHTML = `
      <div class="kv-grid">
        <div class="kv-item">
          <span class="kv-label">${L("Ayrıştırılan Kural Sayısı", "Parsed Rules Count")}</span>
          <span class="kv-val">${rdata.rulesCount}</span>
        </div>
        <div class="kv-item">
          <span class="kv-label">${L("Bulunan Sitemap'ler", "Discovered Sitemaps")}</span>
          <span class="kv-val">${esc((rdata.sitemaps || []).join(", ") || "—")}</span>
        </div>
      </div>
      <pre style="margin-top:10px;padding:10px;background:var(--bg-canvas);border:1px solid var(--border-hairline);border-radius:4px;font-family:var(--font-mono);font-size:11.5px;white-space:pre-wrap;">${esc(
        rdata.rawContent || L("robots.txt bulunamadı veya boş.", "robots.txt not found or empty.")
      )}</pre>
    `;
    return;
  }

  if (!state.inspectorData) {
    body.innerHTML = `<div class="inspector-placeholder">${L(
      "Detayları, Inlinks/Outlinks bağlantılarını, Canlı SERP simülatörünü ve PageSpeed/AI analizini görmek için tablodan bir URL seçin.",
      "Click any URL row in the table above to inspect its details, Inlinks, Outlinks, Live SERP Preview, and PageSpeed/AI Audit."
    )}</div>`;
    return;
  }

  const { page, inlinks, outlinks } = state.inspectorData;

  if (itab === "details") {
    body.innerHTML = `
      <div class="kv-grid">
        <div class="kv-item"><span class="kv-label">URL (${page.url.length} chars)</span><span class="kv-val">${esc(page.url)}</span></div>
        <div class="kv-item"><span class="kv-label">${L("Durum, İndeks & Link Puanı", "Status, Indexability & Link Score")}</span><span class="kv-val">${page.statusCode} ${esc(page.statusText)} • ${esc(page.indexability)} • Link Score: ${page.linkScore}/100</span></div>
        <div class="kv-item"><span class="kv-label">Title 1 (${page.title1Length} chars / ${page.title1PixelWidth} px)</span><span class="kv-val">${esc(page.title1 || "—")}</span></div>
        <div class="kv-item"><span class="kv-label">Meta Description (${page.metaDescription1Length} chars / ${page.metaDescription1PixelWidth} px)</span><span class="kv-val">${esc(page.metaDescription1 || "—")}</span></div>
        <div class="kv-item"><span class="kv-label">H1 (${page.h1Count})</span><span class="kv-val">${esc((page.h1All || []).join(" | ") || "—")}</span></div>
        <div class="kv-item"><span class="kv-label">H2 (${page.h2Count})</span><span class="kv-val">${esc((page.h2All || []).slice(0, 5).join(" | ") || "—")}</span></div>
        <div class="kv-item"><span class="kv-label">Canonical / Via Proxy</span><span class="kv-val">Canonical: ${esc(page.canonicalLinkElement || "—")} | IP: ${esc(page.viaProxy || "Direct")}</span></div>
        <div class="kv-item"><span class="kv-label">${L("Kelime / Metin Oranı / Kaynaklar", "Words / Text Ratio / Assets")}</span><span class="kv-val">${page.wordCount} words • %${page.textRatio} • ${page.jsCount} JS / ${page.cssCount} CSS</span></div>
      </div>
    `;
    return;
  }

  if (itab === "security") {
    const s = page.security || {};
    body.innerHTML = `
      <div class="kv-grid">
        <div class="kv-item"><span class="kv-label">Protocol (HTTPS)</span><span class="kv-val">${s.isHttps ? "HTTPS (Encrypted)" : "HTTP (Unencrypted)"}</span></div>
        <div class="kv-item"><span class="kv-label">Strict-Transport-Security (HSTS)</span><span class="kv-val">${s.hasHsts ? "Present (OK)" : "Missing"}</span></div>
        <div class="kv-item"><span class="kv-label">Content-Security-Policy (CSP)</span><span class="kv-val">${s.hasCsp ? "Present (OK)" : "Missing"}</span></div>
        <div class="kv-item"><span class="kv-label">X-Content-Type-Options</span><span class="kv-val">${s.hasXContentTypeOptions ? "nosniff (OK)" : "Missing"}</span></div>
        <div class="kv-item"><span class="kv-label">X-Frame-Options</span><span class="kv-val">${s.hasXFrameOptions ? "Protected (OK)" : "Missing"}</span></div>
        <div class="kv-item"><span class="kv-label">Mixed Content & Unsafe Links</span><span class="kv-val">${(s.mixedContentUrls || []).length} Mixed • ${s.unsafeCrossOriginLinks || 0} Unsafe target=_blank</span></div>
      </div>
    `;
    return;
  }

  if (itab === "serp") {
    const titlePxPct = Math.min(100, Math.round((page.title1PixelWidth / 561) * 100));
    const descPxPct = Math.min(
      100,
      Math.round((page.metaDescription1PixelWidth / 985) * 100)
    );
    const displayTitle =
      page.title1PixelWidth > 561
        ? page.title1.slice(0, 58) + "..."
        : page.title1 || L("(Başlık Etiketi Eksik)", "(Missing Title Tag)");
    const displayDesc =
      page.metaDescription1PixelWidth > 985
        ? page.metaDescription1.slice(0, 155) + "..."
        : page.metaDescription1 ||
          L(
            "Meta açıklama etiketi bulunamadı. Sağdaki kutudan canlı yazarak test edebilirsiniz.",
            "Meta description missing. Type in the live editor to test SERP pixel width."
          );

    body.innerHTML = `
      <div class="serp-preview-wrap">
        <div class="serp-card">
          <div class="serp-url">${esc(page.url)}</div>
          <div class="serp-title" id="liveSerpTitlePreview">${esc(displayTitle)}</div>
          <div class="serp-desc" id="liveSerpDescPreview">${esc(displayDesc)}</div>
        </div>
        <div class="serp-meters">
          <div class="meter-box">
            <div class="meter-header">
              <span>${L("Canlı Title Düzenleyici", "Live Title Editor")}</span>
              <strong class="mono-cell" id="liveTitlePxLabel">${page.title1Length} chars • ${page.title1PixelWidth} / 561 px</strong>
            </div>
            <input type="text" id="liveTitleInput" value="${esc(page.title1)}" style="width:100%;height:28px;background:var(--bg-panel);border:1px solid var(--border-strong);color:var(--text-primary);padding:0 8px;border-radius:4px;margin-bottom:6px;font-size:12px;" />
            <div class="meter-track">
              <div class="meter-fill" id="liveTitleMeter" style="width:${titlePxPct}%;background:${
      page.title1PixelWidth > 561 ? "var(--signal-amber)" : "var(--signal-emerald)"
    }"></div>
            </div>
          </div>
          <div class="meter-box">
            <div class="meter-header">
              <span>${L("Canlı Meta Description Düzenleyici", "Live Meta Description Editor")}</span>
              <strong class="mono-cell" id="liveDescPxLabel">${page.metaDescription1Length} chars • ${page.metaDescription1PixelWidth} / 985 px</strong>
            </div>
            <input type="text" id="liveDescInput" value="${esc(page.metaDescription1)}" style="width:100%;height:28px;background:var(--bg-panel);border:1px solid var(--border-strong);color:var(--text-primary);padding:0 8px;border-radius:4px;margin-bottom:6px;font-size:12px;" />
            <div class="meter-track">
              <div class="meter-fill" id="liveDescMeter" style="width:${descPxPct}%;background:${
      page.metaDescription1PixelWidth > 985
        ? "var(--signal-amber)"
        : "var(--signal-emerald)"
    }"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    const tInput = document.getElementById("liveTitleInput");
    const dInput = document.getElementById("liveDescInput");
    const syncSerp = async () => {
      const res = await fetch("/api/serp/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: page.id,
          title1: tInput.value,
          metaDescription1: dInput.value,
        }),
      });
      const d = await res.json();
      if (d.ok && d.page) {
        Object.assign(page, d.page);
        document.getElementById("liveSerpTitlePreview").textContent =
          page.title1PixelWidth > 561
            ? page.title1.slice(0, 58) + "..."
            : page.title1 || "(Empty)";
        document.getElementById("liveSerpDescPreview").textContent =
          page.metaDescription1PixelWidth > 985
            ? page.metaDescription1.slice(0, 155) + "..."
            : page.metaDescription1 || "(Empty)";
        document.getElementById("liveTitlePxLabel").textContent = `${page.title1Length} chars • ${page.title1PixelWidth} / 561 px`;
        document.getElementById("liveDescPxLabel").textContent = `${page.metaDescription1Length} chars • ${page.metaDescription1PixelWidth} / 985 px`;
        document.getElementById("liveTitleMeter").style.width = `${Math.min(100, Math.round((page.title1PixelWidth / 561) * 100))}%`;
        document.getElementById("liveDescMeter").style.width = `${Math.min(100, Math.round((page.metaDescription1PixelWidth / 985) * 100))}%`;
        renderDataGrid();
      }
    };
    tInput.addEventListener("input", syncSerp);
    dInput.addEventListener("input", syncSerp);
    return;
  }

  if (itab === "ai") {
    body.innerHTML = `
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap;">
        <button type="button" class="btn btn-primary" id="btnRunPsiMobile">
          ⚡ ${L("PageSpeed & CWV Testi (Mobil)", "Run PageSpeed & CWV (Mobile)")}
        </button>
        <button type="button" class="btn btn-secondary" id="btnRunPsiDesktop">
          ⚡ ${L("PageSpeed & CWV Testi (Masaüstü)", "Run PageSpeed & CWV (Desktop)")}
        </button>
        <button type="button" class="btn btn-secondary" id="btnRunAiOptimize">
          ✨ ${L("AI ile Başlık & Meta Önerisi Üret", "Generate AI Title & Meta Suggestion")}
        </button>
      </div>
      <div id="psiInspectorOutput">
        ${renderPsiInspectorCard(page.pageSpeed)}
      </div>
      <div id="aiOutputBox" class="kv-grid"></div>
    `;

    const triggerPsi = async (strat) => {
      state.psiStrategy = strat;
      const out = document.getElementById("psiInspectorOutput");
      out.innerHTML = `<div style="color:var(--signal-emerald);padding:8px 0;">${L(
        `PageSpeed & Core Web Vitals (${strat.toUpperCase()}) ölçülüyor...`,
        `Measuring PageSpeed & Core Web Vitals (${strat.toUpperCase()})...`
      )}</div>`;
      await window.runPageSpeedForRow(page.id);
    };

    document.getElementById("btnRunPsiMobile").onclick = () => triggerPsi("mobile");
    document.getElementById("btnRunPsiDesktop").onclick = () => triggerPsi("desktop");

    document.getElementById("btnRunAiOptimize").onclick = async () => {
      const box = document.getElementById("aiOutputBox");
      box.innerHTML = `<div style="color:var(--signal-emerald);">${L("Analiz ediliyor...", "Analyzing...")}</div>`;
      const res = await fetch("/api/ai/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: page.id, provider: "ollama" }),
      });
      const d = await res.json();
      if (d.ok) {
        box.innerHTML = `
          <div class="kv-item">
            <span class="kv-label">${L("Önerilen Title", "Suggested Title")} (${d.suggestedTitlePx} px <= 561px)</span>
            <span class="kv-val">${esc(d.suggestedTitle)}</span>
          </div>
          <div class="kv-item">
            <span class="kv-label">${L("Önerilen Meta Description", "Suggested Meta Description")} (${d.suggestedMetaPx} px <= 985px)</span>
            <span class="kv-val">${esc(d.suggestedMeta)}</span>
          </div>
          <div class="kv-item">
            <span class="kv-label">${L("Teşhis Edilen Eksikler", "Diagnosed Issues")}</span>
            <span class="kv-val">${(d.diagnosis || []).map(esc).join("<br>• ")}</span>
          </div>
          <div class="kv-item" style="justify-content:center;align-items:flex-start;">
            <button type="button" class="btn btn-primary" id="btnApplyAiTags">${L("Bu Önerileri Sayfaya Uygula", "Apply Suggestions to Page")}</button>
          </div>
        `;
        document.getElementById("btnApplyAiTags").onclick = async () => {
          await fetch("/api/serp/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: page.id,
              title1: d.suggestedTitle,
              metaDescription1: d.suggestedMeta,
            }),
          });
          await selectPageRow(page.id);
          await loadTableRows();
        };
      }
    };
    return;
  }

  if (itab === "inlinks" || itab === "outlinks") {
    const list = itab === "inlinks" ? inlinks : outlinks;
    if (list.length === 0) {
      body.innerHTML = `<div class="inspector-placeholder">${L(
        `Bu sayfa için ${itab} kaydı bulunamadı.`,
        `No ${itab} found for this URL.`
      )}</div>`;
      return;
    }
    body.innerHTML = `
      <table class="data-grid">
        <thead>
          <tr>
            <th style="width:45px">#</th>
            <th style="width:280px">${itab === "inlinks" ? L("Kaynak URL (From)", "From URL") : L("Hedef URL (To)", "To URL")}</th>
            <th style="width:220px">Anchor Text</th>
            <th style="width:100px">DOM Region</th>
            <th style="width:90px">Follow / Rel</th>
            <th style="width:90px">Type</th>
          </tr>
        </thead>
        <tbody>
          ${list
            .map(
              (edge, i) => `
            <tr>
              <td class="mono-cell">${i + 1}</td>
              <td class="mono-cell">${esc(itab === "inlinks" ? edge.fromUrl : edge.toUrl)}</td>
              <td>${esc(edge.anchorText)}</td>
              <td><span class="badge">${esc(edge.linkPosition)}</span></td>
              <td class="mono-cell">${edge.nofollow ? `<span class="badge badge-warn">nofollow</span>` : `<span class="badge badge-ok">follow</span>`}</td>
              <td>${edge.internal ? "Internal" : "External"}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    return;
  }

  if (itab === "images") {
    const imgs = page.images || [];
    if (imgs.length === 0) {
      body.innerHTML = `<div class="inspector-placeholder">${L("Bu sayfada görsel bulunamadı.", "No images found on this page.")}</div>`;
      return;
    }
    body.innerHTML = `
      <table class="data-grid">
        <thead>
          <tr>
            <th style="width:45px">#</th>
            <th style="width:360px">Image Source URL</th>
            <th style="width:260px">Alt Text</th>
            <th style="width:110px">Status</th>
          </tr>
        </thead>
        <tbody>
          ${imgs
            .map(
              (img, idx) => `
            <tr>
              <td class="mono-cell">${idx + 1}</td>
              <td class="mono-cell">${esc(img.src)}</td>
              <td>${esc(img.alt || "—")}</td>
              <td>${
                img.missingAlt
                  ? `<span class="badge badge-err">Missing Alt</span>`
                  : `<span class="badge badge-ok">OK (${img.altLength} chars)</span>`
              }</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    return;
  }

  if (itab === "duplicates") {
    const dups = page.nearDuplicates || [];
    if (dups.length === 0) {
      body.innerHTML = `<div class="inspector-placeholder">${L(
        "Bu sayfa için >= %75 MinHash benzerliğine sahip yakın kopya sayfa tespit edilmedi.",
        "No near-duplicate pages (>= 75% MinHash similarity) detected for this URL."
      )}</div>`;
      return;
    }
    body.innerHTML = `
      <table class="data-grid">
        <thead>
          <tr>
            <th style="width:50px">#</th>
            <th style="width:150px">MinHash Similarity</th>
            <th>Matching URL</th>
          </tr>
        </thead>
        <tbody>
          ${dups
            .map(
              (d, idx) => `
            <tr>
              <td class="mono-cell">${idx + 1}</td>
              <td class="mono-cell"><span class="badge badge-warn">%${d.similarity}</span></td>
              <td class="mono-cell">${esc(d.otherUrl)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    return;
  }

  if (itab === "schema") {
    const rawList = page.schemaRaw || [];
    if (rawList.length === 0) {
      body.innerHTML = `<div class="inspector-placeholder">${L("JSON-LD Structured Data bulunamadı.", "No JSON-LD Structured Data found.")}</div>`;
      return;
    }
    body.innerHTML = rawList
      .map(
        (json, idx) => `
        <div style="margin-bottom:8px;">
          <div style="font-size:11px;color:var(--signal-emerald);margin-bottom:4px;">JSON-LD Block #${
            idx + 1
          } (${esc((page.schemaTypes || []).join(", "))})</div>
          <pre style="padding:10px;background:var(--bg-canvas);border:1px solid var(--border-hairline);border-radius:4px;font-family:var(--font-mono);font-size:11px;white-space:pre-wrap;">${esc(
            json
          )}</pre>
        </div>
      `
      )
      .join("");
  }
}

let graphAnimId = null;
async function loadAndRenderForceGraph() {
  const canvas = document.getElementById("forceGraphCanvas");
  const ctx = canvas.getContext("2d");
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height - 38;

  const res = await fetch("/api/graph?maxNodes=140");
  const { nodes, links } = await res.json();

  if (graphAnimId) cancelAnimationFrame(graphAnimId);

  const width = canvas.width;
  const height = canvas.height;
  const nodeMap = new Map();

  nodes.forEach((n, idx) => {
    const angle = (idx / Math.max(1, nodes.length)) * Math.PI * 2;
    const radius = n.depth === 0 ? 0 : Math.min(width, height) * 0.12 * n.depth;
    n.x = width / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 30;
    n.y = height / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 30;
    n.vx = 0;
    n.vy = 0;
    nodeMap.set(n.id, n);
  });

  let draggedNode = null;

  canvas.onmousedown = (e) => {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    for (const n of nodes) {
      if (Math.hypot(n.x - mx, n.y - my) < 12) {
        draggedNode = n;
        selectPageRow(n.id);
        break;
      }
    }
  };
  canvas.onmousemove = (e) => {
    if (!draggedNode) return;
    const r = canvas.getBoundingClientRect();
    draggedNode.x = e.clientX - r.left;
    draggedNode.y = e.clientY - r.top;
  };
  canvas.onmouseup = () => {
    draggedNode = null;
  };

  let ticks = 0;
  function step() {
    ticks++;
    if (ticks < 240) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = b.x - a.x || 0.1;
          const dy = b.y - a.y || 0.1;
          const distSq = dx * dx + dy * dy + 80;
          const force = 950 / distSq;
          a.vx -= dx * force * 0.05;
          a.vy -= dy * force * 0.05;
          b.vx += dx * force * 0.05;
          b.vy += dy * force * 0.05;
        }
      }
      for (const l of links) {
        const s = nodeMap.get(l.source);
        const t = nodeMap.get(l.target);
        if (!s || !t) continue;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        s.vx += dx * 0.004;
        s.vy += dy * 0.004;
        t.vx -= dx * 0.004;
        t.vy -= dy * 0.004;
      }
      for (const n of nodes) {
        if (n === draggedNode) continue;
        n.vx += (width / 2 - n.x) * 0.002;
        n.vy += (height / 2 - n.y) * 0.002;
        n.vx *= 0.82;
        n.vy *= 0.82;
        n.x = Math.max(24, Math.min(width - 24, n.x + n.vx));
        n.y = Math.max(24, Math.min(height - 24, n.y + n.vy));
      }
    }

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(148, 163, 184, 0.18)";
    ctx.lineWidth = 1;
    for (const l of links) {
      const s = nodeMap.get(l.source);
      const t = nodeMap.get(l.target);
      if (!s || !t) continue;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);
      ctx.stroke();
    }

    for (const n of nodes) {
      const r =
        n.depth === 0
          ? 9
          : Math.max(4.5, Math.min(9, 3.5 + (n.linkScore || 50) / 18));
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      if (n.status >= 400 || n.status === 0) ctx.fillStyle = "#ef4444";
      else if (!n.indexable || n.status >= 300) ctx.fillStyle = "#f59e0b";
      else ctx.fillStyle = "#10b981";
      ctx.fill();

      if (n.depth <= 1 || n.id === state.selectedPageId) {
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "10px JetBrains Mono, monospace";
        ctx.fillText(n.label.slice(0, 26), n.x + r + 4, n.y + 3);
      }
    }

    graphAnimId = requestAnimationFrame(step);
  }
  step();
}

function populateSubFilterSelect() {
  const select = document.getElementById("subFilterSelect");
  const options = TAB_SUBFILTERS[state.activeTab] || [
    { value: "all", tr: "Tümü", en: "All" },
  ];
  select.innerHTML = options
    .map(
      (o) =>
        `<option value="${o.value}">${esc(
          state.lang === "tr" ? o.tr : o.en
        )}</option>`
    )
    .join("");
  select.value = state.activeFilter;
}

function renderModalRuleLists() {
  const sList = document.getElementById("customSearchList");
  sList.innerHTML = state.customSearchRules
    .map(
      (r, idx) => `
      <div class="rule-row">
        <input type="text" placeholder="Kural Adı" value="${esc(r.name)}" onchange="updateSearchRule(${idx}, 'name', this.value)" style="width:150px" />
        <select onchange="updateSearchRule(${idx}, 'mode', this.value)">
          <option value="contains" ${r.mode === "contains" ? "selected" : ""}>İçerir (Contains)</option>
          <option value="does_not_contain" ${r.mode === "does_not_contain" ? "selected" : ""}>İçermez (Does Not Contain)</option>
          <option value="regex" ${r.mode === "regex" ? "selected" : ""}>Regex</option>
        </select>
        <input type="text" placeholder="Aranacak metin veya Regex" value="${esc(r.pattern)}" onchange="updateSearchRule(${idx}, 'pattern', this.value)" style="flex:1" />
        <button type="button" class="btn btn-ghost" onclick="removeSearchRule(${idx})">Sil</button>
      </div>
    `
    )
    .join("");

  const eList = document.getElementById("customExtractList");
  eList.innerHTML = state.customExtractionRules
    .map(
      (r, idx) => `
      <div class="rule-row">
        <input type="text" placeholder="Alan Adı" value="${esc(r.name)}" onchange="updateExtractRule(${idx}, 'name', this.value)" style="width:150px" />
        <select onchange="updateExtractRule(${idx}, 'type', this.value)">
          <option value="css_text" ${r.type === "css_text" ? "selected" : ""}>CSS Selector (Text)</option>
          <option value="regex" ${r.type === "regex" ? "selected" : ""}>Regex Grup 1</option>
        </select>
        <input type="text" placeholder="CSS Seçici (örn: .price_color) veya Regex" value="${esc(r.selector)}" onchange="updateExtractRule(${idx}, 'selector', this.value)" style="flex:1" />
        <button type="button" class="btn btn-ghost" onclick="removeExtractRule(${idx})">Sil</button>
      </div>
    `
    )
    .join("");
}

window.updateSearchRule = (idx, field, val) => {
  state.customSearchRules[idx][field] = val;
};
window.removeSearchRule = (idx) => {
  state.customSearchRules.splice(idx, 1);
  renderModalRuleLists();
};
window.updateExtractRule = (idx, field, val) => {
  state.customExtractionRules[idx][field] = val;
};
window.removeExtractRule = (idx) => {
  state.customExtractionRules.splice(idx, 1);
  renderModalRuleLists();
};

async function refreshDiffSnapshotsDropdowns() {
  const res = await fetch("/api/snapshots");
  const { snapshots } = await res.json();
  const selA = document.getElementById("diffSelectA");
  const selB = document.getElementById("diffSelectB");
  if (!snapshots || snapshots.length === 0) {
    const emptyOpt = `<option value="">${L("Henüz kayıtlı tarama yok", "No saved snapshots yet")}</option>`;
    selA.innerHTML = emptyOpt;
    selB.innerHTML = emptyOpt;
    return;
  }
  const opts = snapshots
    .map(
      (s) =>
        `<option value="${s.id}">#${s.id} — ${esc(s.name)} (${new Date(
          s.createdAt
        ).toLocaleTimeString()})</option>`
    )
    .join("");
  selA.innerHTML = opts;
  selB.innerHTML = opts;
  if (snapshots.length > 1) {
    selA.value = snapshots[1].id;
    selB.value = snapshots[0].id;
  }
}

// Native macOS Menu Bar Bridge (callable from WKWebView evaluateJavaScript)
window.openFrogMenuAction = async (action) => {
  if (action === "about") {
    renderAboutModalContent();
    document.getElementById("aboutModal").classList.remove("hidden");
  } else if (action === "settings") {
    renderLanguageCards();
    document.getElementById("configModal").classList.remove("hidden");
  } else if (action === "diff") {
    await refreshDiffSnapshotsDropdowns();
    document.getElementById("diffModal").classList.remove("hidden");
  } else if (action === "new_crawl") {
    document.getElementById("btnClear").click();
    document.getElementById("urlInput").focus();
  } else if (action === "export_csv") {
    document.getElementById("btnExportCsv").click();
  } else if (action === "export_sitemap") {
    document.getElementById("btnExportSitemap").click();
  } else if (action === "pagespeed_tab") {
    jumpToTabAndFilter("pagespeed", "internal");
  }
};

function bindEvents() {
  // About Modal
  const aboutModal = document.getElementById("aboutModal");
  document.getElementById("btnAboutModal").addEventListener("click", () => {
    renderAboutModalContent();
    aboutModal.classList.remove("hidden");
  });
  document
    .getElementById("btnCloseAboutModal")
    .addEventListener("click", () => aboutModal.classList.add("hidden"));

  // Crawl Mode Selector
  const modeSel = document.getElementById("crawlModeSelect");
  const urlWrap = document.getElementById("urlInputContainer");
  const btnList = document.getElementById("btnOpenListModal");
  const prefixLbl = document.getElementById("urlPrefixLabel");
  const urlInp = document.getElementById("urlInput");

  modeSel.addEventListener("change", () => {
    state.mode = modeSel.value;
    const dict = getDict();
    if (state.mode === "list") {
      urlWrap.classList.add("hidden");
      btnList.classList.remove("hidden");
    } else if (state.mode === "sitemap") {
      urlWrap.classList.remove("hidden");
      btnList.classList.add("hidden");
      prefixLbl.textContent = "SITEMAP";
      urlInp.placeholder = dict.sitemapPlaceholder;
    } else {
      urlWrap.classList.remove("hidden");
      btnList.classList.add("hidden");
      prefixLbl.textContent = "URL";
      urlInp.placeholder = dict.urlPlaceholder;
    }
  });

  // List Mode Modal
  const listModal = document.getElementById("listModeModal");
  btnList.addEventListener("click", () => listModal.classList.remove("hidden"));
  document
    .getElementById("btnCloseListModal")
    .addEventListener("click", () => listModal.classList.add("hidden"));
  document
    .getElementById("btnSaveListMode")
    .addEventListener("click", async () => {
      const lines = document
        .getElementById("listModeTextarea")
        .value.split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
      state.urlList = lines;
      updateListCountBadge();
      listModal.classList.add("hidden");
      await startCrawlWithUrl(lines[0] || "");
    });

  // Crawl Diff Modal
  const diffModal = document.getElementById("diffModal");
  document
    .getElementById("btnDiffModal")
    .addEventListener("click", async () => {
      await refreshDiffSnapshotsDropdowns();
      diffModal.classList.remove("hidden");
    });
  document
    .getElementById("btnCloseDiffModal")
    .addEventListener("click", () => diffModal.classList.add("hidden"));

  document
    .getElementById("btnSaveSnapshot")
    .addEventListener("click", async () => {
      const name = document.getElementById("snapNameInput").value.trim();
      await fetch("/api/snapshots/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      document.getElementById("snapNameInput").value = "";
      await refreshDiffSnapshotsDropdowns();
    });

  document.getElementById("btnRunDiff").addEventListener("click", async () => {
    const a = document.getElementById("diffSelectA").value;
    const b = document.getElementById("diffSelectB").value;
    const container = document.getElementById("diffResultsContainer");
    if (!a || !b) return;
    const res = await fetch(`/api/snapshots/compare?a=${a}&b=${b}`);
    const diff = await res.json();
    if (diff.error) {
      container.innerHTML = `<div style="color:var(--signal-crimson)">${esc(diff.error)}</div>`;
      return;
    }
    container.innerHTML = `
      <div class="metric-summary-row" style="grid-template-columns:repeat(4,1fr);margin-bottom:10px;">
        <div class="mcard"><span class="mcard-label">${L("Yeni Eklenen URL", "Added URLs")}</span><strong class="mcard-val" style="color:var(--signal-emerald)">+${diff.summary.addedCount}</strong></div>
        <div class="mcard"><span class="mcard-label">${L("Silinen URL", "Removed URLs")}</span><strong class="mcard-val" style="color:var(--signal-crimson)">-${diff.summary.removedCount}</strong></div>
        <div class="mcard"><span class="mcard-label">${L("HTTP Kodu Değişen", "Status Changed")}</span><strong class="mcard-val" style="color:var(--signal-amber)">${diff.summary.statusChangedCount}</strong></div>
        <div class="mcard"><span class="mcard-label">${L("Başlığı Değişen", "Title Changed")}</span><strong class="mcard-val" style="color:var(--signal-blue)">${diff.summary.titleChangedCount}</strong></div>
      </div>
      <div style="max-height:280px;overflow:auto;border:1px solid var(--border-hairline);border-radius:4px;">
        <table class="data-grid">
          <thead>
            <tr>
              <th style="width:130px">${L("Değişim Türü", "Change Type")}</th>
              <th>URL</th>
              <th style="width:240px">${L("Önceki → Yeni Değer", "Before → After")}</th>
            </tr>
          </thead>
          <tbody>
            ${diff.added
              .map(
                (p) =>
                  `<tr><td><span class="badge badge-ok">+ Added</span></td><td class="mono-cell">${esc(p.url)}</td><td class="mono-cell">HTTP ${p.statusCode}</td></tr>`
              )
              .join("")}
            ${diff.removed
              .map(
                (p) =>
                  `<tr><td><span class="badge badge-err">- Removed</span></td><td class="mono-cell">${esc(p.url)}</td><td class="mono-cell">HTTP ${p.statusCode}</td></tr>`
              )
              .join("")}
            ${diff.statusChanged
              .map(
                (c) =>
                  `<tr><td><span class="badge badge-warn">Status</span></td><td class="mono-cell">${esc(c.url)}</td><td class="mono-cell">${c.before} → ${c.after}</td></tr>`
              )
              .join("")}
            ${diff.titleChanged
              .map(
                (c) =>
                  `<tr><td><span class="badge badge-warn">Title</span></td><td class="mono-cell">${esc(c.url)}</td><td>${esc(c.before)} → ${esc(c.after)}</td></tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  });

  document.getElementById("crawlForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const startUrl = document.getElementById("urlInput").value.trim();
    await startCrawlWithUrl(startUrl);
  });

  document.getElementById("btnPause").addEventListener("click", async () => {
    const endpoint =
      state.status === "paused" ? "/api/crawl/resume" : "/api/crawl/pause";
    await fetch(endpoint, { method: "POST" });
  });

  document.getElementById("btnStop").addEventListener("click", async () => {
    await fetch("/api/crawl/stop", { method: "POST" });
  });

  document.getElementById("btnClear").addEventListener("click", async () => {
    await fetch("/api/crawl/clear", { method: "POST" });
    state.pages = [];
    state.selectedPageId = null;
    state.inspectorData = null;
    renderDataGrid();
    renderInspectorContent();
  });

  document.getElementById("primaryTabs").addEventListener("click", (e) => {
    const btn = e.target.closest(".ptab");
    if (!btn) return;
    document.querySelectorAll(".ptab").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    state.activeTab = btn.dataset.tab;
    state.activeFilter = btn.dataset.defaultFilter || "internal";

    const psiToolbar = document.getElementById("psiToolbarGroup");
    if (psiToolbar) {
      psiToolbar.classList.toggle("hidden", state.activeTab !== "pagespeed");
    }

    const graphWrap = document.getElementById("forceGraphWrapper");
    if (state.activeTab === "force_graph") {
      graphWrap.classList.remove("hidden");
      loadAndRenderForceGraph();
    } else {
      graphWrap.classList.add("hidden");
      populateSubFilterSelect();
      loadTableRows();
    }
  });

  // PageSpeed Toolbar Strategy & Bulk Runner
  document.getElementById("psiStrategySelect").addEventListener("change", (e) => {
    state.psiStrategy = e.target.value;
    document.getElementById("cfgPsiStrategy").value = state.psiStrategy;
    localStorage.setItem("openfrog_psi_strategy", state.psiStrategy);
  });

  document.getElementById("btnBulkPageSpeed").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    const lbl = document.getElementById("lblBulkPsiBtn");
    const origText = lbl.textContent;
    lbl.textContent = L("PageSpeed Testleri Çalışıyor...", "Running Bulk PageSpeed...");
    try {
      await fetch("/api/pagespeed/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: state.psiApiKey,
          strategy: state.psiStrategy,
          maxPages: 25,
        }),
      });
      await loadTableRows();
      if (state.selectedPageId) await selectPageRow(state.selectedPageId);
    } finally {
      btn.disabled = false;
      lbl.textContent = origText;
    }
  });

  document
    .getElementById("btnRefreshGraph")
    .addEventListener("click", loadAndRenderForceGraph);

  document.getElementById("subFilterSelect").addEventListener("change", (e) => {
    state.activeFilter = e.target.value;
    renderOverviewTree();
    loadTableRows();
  });

  document.getElementById("tableSearchInput").addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    scheduleTableRefresh();
  });

  document.getElementById("gridBody").addEventListener("click", (e) => {
    const tr = e.target.closest("tr[data-id]");
    if (!tr) return;
    selectPageRow(tr.dataset.id);
  });

  document.querySelector(".inspector-tabs").addEventListener("click", (e) => {
    const btn = e.target.closest(".itab");
    if (!btn) return;
    document.querySelectorAll(".itab").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.selectedInspectorTab = btn.dataset.itab;
    renderInspectorContent();
  });

  document.querySelector(".sidebar-tabs").addEventListener("click", (e) => {
    const btn = e.target.closest(".stab");
    if (!btn) return;
    document.querySelectorAll(".stab").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.stab;
    document
      .getElementById("sidebarOverview")
      .classList.toggle("hidden", tab !== "overview");
    document
      .getElementById("sidebarIssues")
      .classList.toggle("hidden", tab !== "issues");
  });

  document.getElementById("overviewTree").addEventListener("click", (e) => {
    const item = e.target.closest(".tree-item");
    if (!item) return;
    jumpToTabAndFilter(item.dataset.tab, item.dataset.filter);
  });

  document.getElementById("issuesList").addEventListener("click", (e) => {
    const card = e.target.closest(".issue-card");
    if (!card) return;
    const filter = card.dataset.filter;
    const tabMap = {
      status_4xx: "response_codes",
      status_5xx: "response_codes",
      status_3xx: "response_codes",
      sec_http: "security",
      sec_mixed_content: "security",
      sec_missing_hsts: "security",
      sec_missing_csp: "security",
      url_underscores: "url_quality",
      url_uppercase: "url_quality",
      title_missing: "page_titles",
      title_duplicate: "page_titles",
      title_over_561px: "page_titles",
      h1_missing: "h1",
      meta_missing: "meta_description",
      images_missing_alt: "images",
      near_duplicates: "near_duplicates",
      canonical_missing: "canonicals",
    };
    jumpToTabAndFilter(tabMap[filter] || "internal", filter);
  });

  document.getElementById("btnExportCsv").addEventListener("click", () => {
    window.open(
      `/api/export/csv?filter=${encodeURIComponent(state.activeFilter)}`,
      "_blank"
    );
  });

  document.getElementById("btnExportSitemap").addEventListener("click", () => {
    window.open(`/api/export/sitemap`, "_blank");
  });

  const modal = document.getElementById("configModal");
  document.getElementById("btnConfigModal").addEventListener("click", () => {
    renderLanguageCards();
    modal.classList.remove("hidden");
  });
  document.getElementById("btnCloseModal").addEventListener("click", () => {
    modal.classList.add("hidden");
  });
  document.getElementById("btnSaveConfig").addEventListener("click", () => {
    state.proxyMode = document.getElementById("cfgProxyMode").value;
    state.psiApiKey = document.getElementById("cfgPsiApiKey").value.trim();
    state.psiStrategy = document.getElementById("cfgPsiStrategy").value;
    document.getElementById("psiStrategySelect").value = state.psiStrategy;
    localStorage.setItem("openfrog_psi_key", state.psiApiKey);
    localStorage.setItem("openfrog_psi_strategy", state.psiStrategy);
    updateProxyStatusFooter();
    modal.classList.add("hidden");
  });

  document.getElementById("btnAddSearchRule").addEventListener("click", () => {
    state.customSearchRules.push({
      id: "rule_" + Date.now(),
      name: `Arama ${state.customSearchRules.length + 1}`,
      pattern: "",
      mode: "contains",
      scope: "html",
    });
    renderModalRuleLists();
  });

  document.getElementById("btnAddExtractRule").addEventListener("click", () => {
    state.customExtractionRules.push({
      id: "ext_" + Date.now(),
      name: `Veri ${state.customExtractionRules.length + 1}`,
      selector: "",
      type: "css_text",
    });
    renderModalRuleLists();
  });
}

function jumpToTabAndFilter(tabName, filterKey) {
  state.activeTab = tabName;
  state.activeFilter = filterKey;
  document.querySelectorAll(".ptab").forEach((b) => {
    b.classList.toggle("active", b.dataset.tab === tabName);
  });
  const psiToolbar = document.getElementById("psiToolbarGroup");
  if (psiToolbar) {
    psiToolbar.classList.toggle("hidden", tabName !== "pagespeed");
  }
  document.getElementById("forceGraphWrapper").classList.add("hidden");
  populateSubFilterSelect();
  document.getElementById("subFilterSelect").value = filterKey;
  renderOverviewTree();
  loadTableRows();
}

async function startCrawlWithUrl(startUrl) {
  const proxyMode = document.getElementById("cfgProxyMode").value;
  const proxyUrl = document.getElementById("cfgProxyUrl").value.trim();
  const proxyList = document
    .getElementById("cfgProxyList")
    .value.split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  state.proxyMode = proxyMode;
  updateProxyStatusFooter();

  const payload = {
    mode: state.mode,
    startUrl,
    sitemapUrl: startUrl,
    urlList: state.urlList,
    maxUrls: Number(document.getElementById("cfgMaxUrls").value || 500),
    concurrency: Number(document.getElementById("cfgConcurrency").value || 8),
    maxDepth: Number(document.getElementById("cfgMaxDepth").value || 6),
    requestDelayMs: Number(
      document.getElementById("cfgRequestDelayMs").value || 0
    ),
    proxyMode,
    proxyUrl,
    proxyList,
    userAgent: document.getElementById("cfgUserAgent").value,
    includePattern: document.getElementById("cfgInclude").value.trim(),
    excludePattern: document.getElementById("cfgExclude").value.trim(),
    respectRobotsTxt: document.getElementById("cfgRespectRobots").checked,
    crawlExternalLinks: document.getElementById("cfgExternalLinks").checked,
    renderJs: document.getElementById("cfgRenderJs").checked,
    customSearchRules: state.customSearchRules.filter((r) => r.pattern.trim()),
    customExtractionRules: state.customExtractionRules.filter((r) =>
      r.selector.trim()
    ),
  };

  await fetch("/api/crawl/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

document.addEventListener("DOMContentLoaded", init);
