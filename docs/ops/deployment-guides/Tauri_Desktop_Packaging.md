# Tauri Desktop Packaging Guide

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Platforms:** macOS, Windows, Linux

---

## 1. Overview

This guide covers packaging FerroUI as a desktop application using Tauri. Tauri
provides:

- Native performance with WebKit rendering
- Small bundle size (~5MB)
- Native OS integrations
- Local LLM support (privacy)

---

## 2. Prerequisites

### 2.1 System Requirements

| Platform | Requirements        |
| -------- | ------------------- |
| macOS    | macOS 10.13+, Xcode |
| Windows  | Windows 10+, MSVC   |
| Linux    | GTK 3, WebKit2GTK   |

### 2.2 Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 2.3 Install Tauri CLI

```bash
cargo install tauri-cli
```

---

## 3. Project Structure

```
apps/desktop/
├── src/                    # React frontend
│   ├── main.tsx
│   └── App.tsx
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── main.rs         # Entry point
│   │   ├── lib.rs          # Library exports
│   │   ├── engine.rs       # Orchestration engine
│   │   ├── tools.rs        # Tool registry
│   │   └── llm/            # LLM providers
│   │       ├── mod.rs
│   │       ├── ollama.rs
│   │       └── llamacpp.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
└── vite.config.ts
```

---

## 4. Configuration

### 4.1 tauri.conf.json

```json
{
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devPath": "http://localhost:5173",
    "distDir": "../dist"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "shell": {
        "all": false,
        "open": true
      },
      "fs": {
        "all": false,
        "readFile": true,
        "writeFile": true,
        "createDir": true
      },
      "http": {
        "all": false,
        "request": true
      }
    },
    "bundle": {
      "active": true,
      "category": "DeveloperTool",
      "copyright": "© 2026 FerroUI",
      "deb": {
        "depends": []
      },
      "externalBin": [],
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "identifier": "dev.ferroui.desktop",
      "longDescription": "AI-powered server-driven UI framework",
      "macOS": {
        "entitlements": null,
        "exceptionDomain": "",
        "frameworks": [],
        "providerShortName": null,
        "signingIdentity": null
      },
      "resources": [],
      "shortDescription": "FerroUI Desktop",
      "targets": ["dmg", "msi", "deb", "appimage"],
      "windows": {
        "certificateThumbprint": null,
        "digestAlgorithm": "sha256",
        "timestampUrl": ""
      }
    },
    "security": {
      "csp": "default-src 'self'; connect-src 'self' http://localhost:* https://api.openai.com"
    },
    "updater": {
      "active": true,
      "endpoints": [
        "https://releases.ferroui.dev/{{target}}/{{current_version}}"
      ],
      "dialog": true,
      "pubkey": "YOUR_UPDATER_PUBLIC_KEY"
    },
    "windows": [
      {
        "fullscreen": false,
        "height": 900,
        "resizable": true,
        "title": "FerroUI",
        "width": 1440
      }
    ]
  }
}
```

### 4.2 Cargo.toml

```toml
[package]
name = "ferroui-desktop"
version = "1.0.0"
edition = "2021"

[dependencies]
tauri = { version = "1.6", features = ["shell-open"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.35", features = ["full"] }
reqwest = { version = "0.11", features = ["json"] }
ollama-rs = "0.1"
llama-cpp-rs = "0.3"
zod = "0.1"

[features]
default = ["custom-protocol"]
custom-protocol = ["tauri/custom-protocol"]
```

---

## 5. Rust Implementation

### 5.1 Main Entry Point

```rust
// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Initialize local LLM
            let engine = ferroui_engine::Engine::new_local();
            app.manage(engine);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            generate_layout,
            register_tool,
            list_components,
            set_provider,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn generate_layout(
    prompt: String,
    engine: tauri::State<'_, ferroui_engine::Engine>,
) -> Result<String, String> {
    engine.generate_layout(&prompt).await
        .map(|layout| serde_json::to_string(&layout).unwrap())
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn set_provider(
    provider: String,
    engine: tauri::State<'_, ferroui_engine::Engine>,
) -> Result<(), String> {
    engine.set_provider(&provider).await
        .map_err(|e| e.to_string())
}
```

### 5.2 Local LLM Provider

```rust
// src-tauri/src/llm/ollama.rs
use ollama_rs::Ollama;

pub struct OllamaProvider {
    client: Ollama,
    model: String,
}

impl OllamaProvider {
    pub fn new() -> Self {
        Self {
            client: Ollama::default(),
            model: "llama2".to_string(),
        }
    }

    pub async fn generate(&self, prompt: &str) -> Result<String, Box<dyn std::error::Error>> {
        let response = self.client
            .generate(self.model.clone(), prompt.to_string())
            .await?;

        Ok(response.response)
    }
}
```

---

## 6. Building

### 6.1 Development Build

```bash
cd apps/desktop
npm install
npm run tauri dev
```

### 6.2 Production Build

```bash
# macOS
npm run tauri build -- --target universal-apple-darwin

# Windows
npm run tauri build -- --target x86_64-pc-windows-msvc

# Linux
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

### 6.3 Output

```
src-tauri/target/release/bundle/
├── dmg/                    # macOS DMG
│   └── ferroui-ui_1.0.0_universal.dmg
├── msi/                    # Windows installer
│   └── ferroui-ui_1.0.0_x64_en-US.msi
├── deb/                    # Debian package
│   └── ferroui-ui_1.0.0_amd64.deb
└── appimage/               # Linux AppImage
    └── ferroui-ui_1.0.0_amd64.AppImage
```

---

## 7. Code Signing

### 7.1 macOS

```bash
# Create certificate signing request
# Upload to Apple Developer
# Download certificate

# Sign
 codesign --force --options runtime --sign "Developer ID" \
   src-tauri/target/release/bundle/dmg/*.dmg

# Notarize
xcrun altool --notarize-app \
  --primary-bundle-id "dev.ferroui.desktop" \
  --username "your@email.com" \
  --password "@keychain:AC_PASSWORD" \
  --file src-tauri/target/release/bundle/dmg/*.dmg
```

### 7.2 Windows

```bash
# Obtain code signing certificate
# Install to Windows Certificate Store

# Sign
signtool sign /f certificate.pfx /p password \
  /tr http://timestamp.digicert.com \
  /td sha256 \
  src-tauri/target/release/bundle/msi/*.msi
```

---

## 8. Auto-Updater

### 8.1 Release Server

```bash
# Upload release artifacts
curl -X POST https://releases.ferroui.dev/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@ferroui-ui_1.0.0_universal.dmg" \
  -F "version=1.0.0" \
  -F "platform=darwin-universal"
```

### 8.2 Update Check

The Tauri updater automatically checks for updates on app launch.

---

## 9. Troubleshooting

| Issue              | Solution                                        |
| ------------------ | ----------------------------------------------- |
| Build fails        | Check Rust version, update with `rustup update` |
| Large bundle size  | Enable LTO in Cargo.toml                        |
| Slow startup       | Preload critical resources                      |
| Code signing fails | Verify certificate validity                     |

---

## 10. Related Documents

- [Edge Workers Provisioning](./Edge_Workers_Provisioning.md)
- [Web SaaS Containerization](./Web_SaaS_Containerization.md)
- [Observability & Telemetry Dictionary](../Observability_Telemetry_Dictionary.md)

---

## 11. Document History

| Version | Date       | Author        | Changes         |
| ------- | ---------- | ------------- | --------------- |
| 1.0     | 2025-04-10 | Platform Team | Initial release |
