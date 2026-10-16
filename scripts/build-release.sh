#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
APP_NAME="Froggie.app"
LOCAL_APP="$ROOT_DIR/$APP_NAME"
USER_APP="/Users/sevketerer/Applications/$APP_NAME"
BUN_BIN="/Users/sevketerer/.local/bin/bun"

mkdir -p "$DIST_DIR" "$LOCAL_APP/Contents/MacOS" "$LOCAL_APP/Contents/Resources"

echo "🔨 [1/5] Froggie macOS Universal Binary derleniyor (Apple Silicon arm64 + Intel Mac x86_64)..."
/usr/bin/swiftc "$ROOT_DIR/macos/main.swift" \
  -target arm64-apple-macosx13.0 \
  -O -o "$DIST_DIR/Froggie-arm64"

/usr/bin/swiftc "$ROOT_DIR/macos/main.swift" \
  -target x86_64-apple-macosx13.0 \
  -O -o "$DIST_DIR/Froggie-x86_64"

/usr/bin/lipo -create \
  "$DIST_DIR/Froggie-arm64" \
  "$DIST_DIR/Froggie-x86_64" \
  -output "$LOCAL_APP/Contents/MacOS/Froggie"

rm -f "$DIST_DIR/Froggie-arm64" "$DIST_DIR/Froggie-x86_64"
chmod +x "$LOCAL_APP/Contents/MacOS/Froggie"

cat > "$LOCAL_APP/Contents/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleExecutable</key>
  <string>Froggie</string>
  <key>CFBundleIdentifier</key>
  <string>com.schevko.froggie</string>
  <key>CFBundleName</key>
  <string>Froggie</string>
  <key>CFBundleDisplayName</key>
  <string>Froggie</string>
  <key>CFBundleVersion</key>
  <string>2.2.0</string>
  <key>CFBundleShortVersionString</key>
  <string>2.2</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleIconFile</key>
  <string>AppIcon</string>
  <key>LSMinimumSystemVersion</key>
  <string>13.0</string>
  <key>NSHighResolutionCapable</key>
  <true/>
  <key>NSHumanReadableCopyright</key>
  <string>Copyright © 2026 Şevket Erer (schevko). MIT License.</string>
</dict>
</plist>
EOF

echo "🎨 [2/5] Froggie uygulama ikonu (AppIcon.icns) hazırlanıyor..."
bash "$ROOT_DIR/scripts/set-icon.sh"

echo "📦 [3/5] /Users/sevketerer/Applications/Froggie.app kuruluyor..."
mkdir -p "/Users/sevketerer/Applications"
rm -rf "$USER_APP"
cp -R "$LOCAL_APP" "$USER_APP"
touch "$USER_APP"

echo "💿 [4/5] macOS Kurulum İmajı (Froggie-v2.2-Universal.dmg) oluşturuluyor..."
DMG_STAGING="$DIST_DIR/dmg-staging"
DMG_OUTPUT="$DIST_DIR/Froggie-v2.2-Universal.dmg"
rm -rf "$DMG_STAGING" "$DMG_OUTPUT"
mkdir -p "$DMG_STAGING"
cp -R "$LOCAL_APP" "$DMG_STAGING/"
ln -s /Applications "$DMG_STAGING/Applications"
hdiutil create -volname "Froggie v2.2" -srcfolder "$DMG_STAGING" -ov -format UDZO "$DMG_OUTPUT" >/dev/null
rm -rf "$DMG_STAGING"

echo "🪟 [5/5] Windows 64-Bit Kurulum Paketi (Froggie.exe + Setup) derleniyor..."
WIN_STAGING="$DIST_DIR/Froggie-Windows-x64"
WIN_ZIP="$DIST_DIR/Froggie-v2.2-Windows-x64-Setup.zip"
rm -rf "$WIN_STAGING" "$WIN_ZIP"
mkdir -p "$WIN_STAGING/ui"

"$BUN_BIN" build "$ROOT_DIR/engine/server.ts" \
  --compile \
  --target=bun-windows-x64 \
  --outfile "$WIN_STAGING/Froggie.exe"

cp -R "$ROOT_DIR/ui/"* "$WIN_STAGING/ui/"
cp "$ROOT_DIR/LICENSE" "$WIN_STAGING/LICENSE.txt"

cat > "$WIN_STAGING/Install-Froggie-Windows.bat" << 'BAT_EOF'
@echo off
chcp 65001 >nul
echo ========================================================
echo   Froggie v2.2 — Windows Kurulum Sihirbazi (MIT License)
echo   Gelistirici: Sevket Erer (schevko)
echo ========================================================
set "INSTALL_DIR=%LOCALAPPDATA%\Programs\Froggie"
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
xcopy /E /I /Y "%~dp0*" "%INSTALL_DIR%\" >nul

powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\Froggie.lnk'); $s.TargetPath = '%INSTALL_DIR%\Froggie.exe'; $s.WorkingDirectory = '%INSTALL_DIR%'; $s.Description = 'Froggie SEO Spider v2.2'; $s.Save()"
powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([Environment]::GetFolderPath('Programs') + '\Froggie.lnk'); $s.TargetPath = '%INSTALL_DIR%\Froggie.exe'; $s.WorkingDirectory = '%INSTALL_DIR%'; $s.Description = 'Froggie SEO Spider v2.2'; $s.Save()"

echo.
echo [OK] Froggie kuruldu ve Masaustu kisayolu olusturuldu!
echo      Konum: %INSTALL_DIR%\Froggie.exe
echo.
start "" "%INSTALL_DIR%\Froggie.exe"
pause
BAT_EOF

(cd "$DIST_DIR" && zip -qr "$WIN_ZIP" "Froggie-Windows-x64")

echo "✅ Tüm Platform Paketleri Tamamlandı!"
echo "   • macOS Universal App : $USER_APP"
echo "   • macOS DMG Kurulum   : $DMG_OUTPUT"
echo "   • Windows x64 Exe     : $WIN_STAGING/Froggie.exe"
echo "   • Windows Setup Zip   : $WIN_ZIP"
