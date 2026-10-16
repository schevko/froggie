import Cocoa

let size = 1024
let rep = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: size,
    pixelsHigh: size,
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
)!

NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
guard let cg = NSGraphicsContext.current?.cgContext else { exit(1) }

// macOS Squircle Background
let inset: CGFloat = 68
let rect = CGRect(x: inset, y: inset, width: CGFloat(size) - inset * 2, height: CGFloat(size) - inset * 2)
let path = NSBezierPath(roundedRect: rect, xRadius: 195, yRadius: 195)
path.addClip()

// Deep Obsidian Gradient
let colors = [
    CGColor(red: 0.04, green: 0.08, blue: 0.11, alpha: 1.0),
    CGColor(red: 0.07, green: 0.14, blue: 0.18, alpha: 1.0)
] as CFArray
let space = CGColorSpaceCreateDeviceRGB()
let grad = CGGradient(colorsSpace: space, colors: colors, locations: [0.0, 1.0])!
cg.drawLinearGradient(grad, start: CGPoint(x: 512, y: 940), end: CGPoint(x: 512, y: 80), options: [])

// Subtle Radar Rings
cg.setStrokeColor(CGColor(red: 0.06, green: 0.73, blue: 0.51, alpha: 0.18))
cg.setLineWidth(6)
for r in [240.0, 320.0, 395.0] {
    cg.strokeEllipse(in: CGRect(x: 512 - r, y: 512 - r, width: r * 2, height: r * 2))
}

// Outer Emerald Border
cg.setStrokeColor(CGColor(red: 0.06, green: 0.73, blue: 0.51, alpha: 0.55))
cg.setLineWidth(14)
path.lineWidth = 14
path.stroke()

// Stylized Geometric Frog Head & Eyes
cg.setFillColor(CGColor(red: 0.06, green: 0.73, blue: 0.51, alpha: 0.22))
cg.fillEllipse(in: CGRect(x: 272, y: 260, width: 480, height: 420))

cg.setStrokeColor(CGColor(red: 0.08, green: 0.82, blue: 0.58, alpha: 1.0))
cg.setLineWidth(28)
cg.strokeEllipse(in: CGRect(x: 272, y: 260, width: 480, height: 420))

// Left & Right Eye Domes
for cx in [375.0, 649.0] {
    cg.setFillColor(CGColor(red: 0.05, green: 0.11, blue: 0.15, alpha: 1.0))
    cg.fillEllipse(in: CGRect(x: cx - 76, y: 575, width: 152, height: 152))
    cg.setStrokeColor(CGColor(red: 0.08, green: 0.82, blue: 0.58, alpha: 1.0))
    cg.setLineWidth(24)
    cg.strokeEllipse(in: CGRect(x: cx - 76, y: 575, width: 152, height: 152))

    // Glowing Pupil
    cg.setFillColor(CGColor(red: 0.15, green: 0.94, blue: 0.68, alpha: 1.0))
    cg.fillEllipse(in: CGRect(x: cx - 28, y: 623, width: 56, height: 56))
}

// Smile / Crawler Node Arc
cg.setStrokeColor(CGColor(red: 0.15, green: 0.94, blue: 0.68, alpha: 1.0))
cg.setLineWidth(24)
cg.setLineCap(.round)
cg.beginPath()
cg.move(to: CGPoint(x: 375, y: 420))
cg.addQuadCurve(to: CGPoint(x: 649, y: 420), control: CGPoint(x: 512, y: 315))
cg.strokePath()

NSGraphicsContext.restoreGraphicsState()

let outPath = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "assets/icon.png"
if let png = rep.representation(using: .png, properties: [:]) {
    try? FileManager.default.createDirectory(atPath: (outPath as NSString).deletingLastPathComponent, withIntermediateDirectories: true)
    try! png.write(to: URL(fileURLWithPath: outPath))
    print("Generated default icon at \(outPath)")
}
