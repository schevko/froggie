import Cocoa
import WebKit

class AppDelegate: NSObject, NSApplicationDelegate, WKUIDelegate, WKNavigationDelegate {
    var window: NSWindow!
    var webView: WKWebView!
    var backendProcess: Process?
    let serverUrl = URL(string: "http://127.0.0.1:4321")!

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        NSApp.appearance = NSAppearance(named: .darkAqua)

        setupMenuBar()
        ensureBackendServerRunning()

        let screenRect = NSScreen.main?.visibleFrame ?? NSRect(x: 0, y: 0, width: 1440, height: 900)
        let winWidth = min(1480, screenRect.width * 0.92)
        let winHeight = min(920, screenRect.height * 0.90)
        let winRect = NSRect(
            x: screenRect.origin.x + (screenRect.width - winWidth) / 2,
            y: screenRect.origin.y + (screenRect.height - winHeight) / 2,
            width: winWidth,
            height: winHeight
        )

        window = NSWindow(
            contentRect: winRect,
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.title = "Froggie v2.2 — MIT Open Source (Şevket Erer)"
        window.backgroundColor = NSColor(calibratedRed: 0.043, green: 0.055, blue: 0.075, alpha: 1.0)
        window.minSize = NSSize(width: 1024, height: 680)

        let config = WKWebViewConfiguration()
        config.preferences.setValue(true, forKey: "developerExtrasEnabled")

        webView = WKWebView(frame: window.contentView!.bounds, configuration: config)
        webView.autoresizingMask = [.width, .height]
        webView.uiDelegate = self
        webView.navigationDelegate = self
        webView.setValue(false, forKey: "drawsBackground")

        window.contentView?.addSubview(webView)
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)

        waitForServerAndLoad(retries: 25)
    }

    func ensureBackendServerRunning() {
        let checkUrl = URL(string: "http://127.0.0.1:4321/api/status")!
        let sem = DispatchSemaphore(value: 0)
        var isUp = false

        var req = URLRequest(url: checkUrl)
        req.timeoutInterval = 0.4
        URLSession.shared.dataTask(with: req) { _, resp, _ in
            if let http = resp as? HTTPURLResponse, http.statusCode == 200 {
                isUp = true
            }
            sem.signal()
        }.resume()
        _ = sem.wait(timeout: .now() + 0.5)

        if isUp { return }

        let proc = Process()
        proc.executableURL = URL(fileURLWithPath: "/Users/sevketerer/.local/bin/bun")
        proc.arguments = ["run", "/Users/sevketerer/.gemini/antigravity/scratch/openfrog-seo-spider/engine/server.ts"]
        proc.currentDirectoryURL = URL(fileURLWithPath: "/Users/sevketerer/.gemini/antigravity/scratch/openfrog-seo-spider")
        do {
            try proc.run()
            self.backendProcess = proc
        } catch {
            print("Failed to start Bun backend: \(error)")
        }
    }

    func waitForServerAndLoad(retries: Int) {
        let checkUrl = URL(string: "http://127.0.0.1:4321/api/status")!
        var req = URLRequest(url: checkUrl)
        req.timeoutInterval = 0.5

        URLSession.shared.dataTask(with: req) { _, resp, _ in
            if let http = resp as? HTTPURLResponse, http.statusCode == 200 {
                DispatchQueue.main.async {
                    self.webView.load(URLRequest(url: self.serverUrl))
                }
            } else if retries > 0 {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                    self.waitForServerAndLoad(retries: retries - 1)
                }
            }
        }.resume()
    }

    func webView(
        _ webView: WKWebView,
        createWebViewWith configuration: WKWebViewConfiguration,
        for navigationAction: WKNavigationAction,
        windowFeatures: WKWindowFeatures
    ) -> WKWebView? {
        if let targetUrl = navigationAction.request.url {
            NSWorkspace.shared.open(targetUrl)
        }
        return nil
    }

    @objc func menuOpenAbout() {
        webView.evaluateJavaScript("window.openFrogMenuAction && window.openFrogMenuAction('about')", completionHandler: nil)
    }

    @objc func menuOpenSettings() {
        webView.evaluateJavaScript("window.openFrogMenuAction && window.openFrogMenuAction('settings')", completionHandler: nil)
    }

    @objc func menuNewCrawl() {
        webView.evaluateJavaScript("window.openFrogMenuAction && window.openFrogMenuAction('new_crawl')", completionHandler: nil)
    }

    @objc func menuOpenDiff() {
        webView.evaluateJavaScript("window.openFrogMenuAction && window.openFrogMenuAction('diff')", completionHandler: nil)
    }

    @objc func menuExportCsv() {
        webView.evaluateJavaScript("window.openFrogMenuAction && window.openFrogMenuAction('export_csv')", completionHandler: nil)
    }

    @objc func menuExportSitemap() {
        webView.evaluateJavaScript("window.openFrogMenuAction && window.openFrogMenuAction('export_sitemap')", completionHandler: nil)
    }

    @objc func menuOpenPageSpeed() {
        webView.evaluateJavaScript("window.openFrogMenuAction && window.openFrogMenuAction('pagespeed_tab')", completionHandler: nil)
    }

    func setupMenuBar() {
        let mainMenu = NSMenu()

        // 1. Application Menu
        let appMenuItem = NSMenuItem()
        mainMenu.addItem(appMenuItem)
        let appMenu = NSMenu()
        appMenu.addItem(withTitle: "About Froggie", action: #selector(menuOpenAbout), keyEquivalent: "")
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Settings / Ayarlar & Dil...", action: #selector(menuOpenSettings), keyEquivalent: ",")
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(
            withTitle: "Quit Froggie",
            action: #selector(NSApplication.terminate(_:)),
            keyEquivalent: "q"
        )
        appMenuItem.submenu = appMenu

        // 2. File / Dosya Menu
        let fileMenuItem = NSMenuItem()
        mainMenu.addItem(fileMenuItem)
        let fileMenu = NSMenu(title: "File")
        fileMenu.addItem(withTitle: "New Crawl / Temizle", action: #selector(menuNewCrawl), keyEquivalent: "n")
        fileMenu.addItem(withTitle: "Compare Crawls (Crawl Diff)...", action: #selector(menuOpenDiff), keyEquivalent: "d")
        fileMenu.addItem(NSMenuItem.separator())
        fileMenu.addItem(withTitle: "Export Current Table (CSV)", action: #selector(menuExportCsv), keyEquivalent: "e")
        fileMenu.addItem(withTitle: "Export XML Sitemap", action: #selector(menuExportSitemap), keyEquivalent: "s")
        fileMenuItem.submenu = fileMenu

        // 3. Edit / Düzen Menu
        let editMenuItem = NSMenuItem()
        mainMenu.addItem(editMenuItem)
        let editMenu = NSMenu(title: "Edit")
        editMenu.addItem(withTitle: "Cut", action: #selector(NSText.cut(_:)), keyEquivalent: "x")
        editMenu.addItem(withTitle: "Copy", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
        editMenu.addItem(withTitle: "Paste", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
        editMenu.addItem(withTitle: "Select All", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")
        editMenuItem.submenu = editMenu

        // 4. Audit / Denetim Menu
        let auditMenuItem = NSMenuItem()
        mainMenu.addItem(auditMenuItem)
        let auditMenu = NSMenu(title: "Audit")
        auditMenu.addItem(withTitle: "PageSpeed & Core Web Vitals", action: #selector(menuOpenPageSpeed), keyEquivalent: "p")
        auditMenu.addItem(withTitle: "Language & Proxy Settings...", action: #selector(menuOpenSettings), keyEquivalent: "")
        auditMenuItem.submenu = auditMenu

        // 5. Window Menu
        let winMenuItem = NSMenuItem()
        mainMenu.addItem(winMenuItem)
        let winMenu = NSMenu(title: "Window")
        winMenu.addItem(withTitle: "Minimize", action: #selector(NSWindow.performMiniaturize(_:)), keyEquivalent: "m")
        winMenu.addItem(withTitle: "Zoom", action: #selector(NSWindow.performZoom(_:)), keyEquivalent: "")
        winMenuItem.submenu = winMenu

        NSApp.mainMenu = mainMenu
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }

    func applicationWillTerminate(_ notification: Notification) {
        if let proc = backendProcess, proc.isRunning {
            proc.terminate()
        }
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
