#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_PNG="${1:-"$ROOT_DIR/assets/icon.png"}"

if [ ! -f "$SOURCE_PNG" ]; then
  echo "🎨 Varsayılan 1024x1024 Froggie ikonu üretiliyor..."
  /usr/bin/swift "$ROOT_DIR/scripts/generate-default-icon.swift" "$SOURCE_PNG"
fi

ICONSET_DIR="$ROOT_DIR/assets/AppIcon.iconset"
ICNS_PATH="$ROOT_DIR/assets/AppIcon.icns"
rm -rf "$ICONSET_DIR"
mkdir -p "$ICONSET_DIR"

echo "🖼 PNG ikonu macOS Retina .icns formatına dönüştürülüyor: $SOURCE_PNG"
sips -z 16 16     "$SOURCE_PNG" --out "$ICONSET_DIR/icon_16x16.png" >/dev/null
sips -z 32 32     "$SOURCE_PNG" --out "$ICONSET_DIR/icon_16x16@2x.png" >/dev/null
sips -z 32 32     "$SOURCE_PNG" --out "$ICONSET_DIR/icon_32x32.png" >/dev/null
sips -z 64 64     "$SOURCE_PNG" --out "$ICONSET_DIR/icon_32x32@2x.png" >/dev/null
sips -z 128 128   "$SOURCE_PNG" --out "$ICONSET_DIR/icon_128x128.png" >/dev/null
sips -z 256 256   "$SOURCE_PNG" --out "$ICONSET_DIR/icon_128x128@2x.png" >/dev/null
sips -z 256 256   "$SOURCE_PNG" --out "$ICONSET_DIR/icon_256x256.png" >/dev/null
sips -z 512 512   "$SOURCE_PNG" --out "$ICONSET_DIR/icon_256x256@2x.png" >/dev/null
sips -z 512 512   "$SOURCE_PNG" --out "$ICONSET_DIR/icon_512x512.png" >/dev/null
sips -z 1024 1024 "$SOURCE_PNG" --out "$ICONSET_DIR/icon_512x512@2x.png" >/dev/null

iconutil -c icns "$ICONSET_DIR" -o "$ICNS_PATH"
rm -rf "$ICONSET_DIR"

for APP_BUNDLE in "$ROOT_DIR/Froggie.app" "/Users/sevketerer/Applications/Froggie.app"; do
  if [ -d "$APP_BUNDLE" ]; then
    mkdir -p "$APP_BUNDLE/Contents/Resources"
    cp "$ICNS_PATH" "$APP_BUNDLE/Contents/Resources/AppIcon.icns"
    touch "$APP_BUNDLE"
    echo "✅ İkon uygulandı: $APP_BUNDLE"
  fi
done
