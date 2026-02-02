# 🚀 Deploy to GitHub Pages

<div align="center">

![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Deployed-blue?style=for-the-badge&logo=github)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Automated-blue?style=for-the-badge&logo=github-actions)
![Node.js](https://img.shields.io/badge/Node.js-Build-green?style=for-the-badge&logo=node.js)

**End-to-end automation for building and hosting static sites on GitHub Pages.**

</div>

---

## 🚀 Overview

This action strictly encapsulates the entire frontend delivery pipeline. It sets up the Node.js environment, installs dependencies, executes the build script, and securely pushes the artifacts to GitHub Pages using OpenID Connect (OIDC).

### Key Features
- **📦 Zero-Config Build**: Defaults to standard `npm ci` and `npm run build`.
- **⚡ Fast Optimization**: Caches NPM dependencies automatically.
- **🔒 Secure OIDC**: Uses token-based authentication (no long-lived secrets needed).
- **🔧 Framework Agnostic**: Works with Vite, Next.js (Static), React, Vue, etc.

---

## 🛠️ Usage

### Prerequisites
Your workflow **MUST** have these permissions:
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### Implementation

```yaml
name: Deploy Frontend
on:
  push:
    branches: ["main"]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      
      - uses: carlos-camara/qa-hub-actions/deploy-gh-pages@main
        with:
          vite-api-url: ${{ secrets.VITE_API_URL }}
```

---

## ⚙️ Configuration

| Input | Description | Default |
|-------|-------------|:-------:|
| `node-version` | Node.js version to use. | `20` |
| `install-command` | Command to install libs. | `npm ci` |
| `build-command` | Command to compile app. | `npm run build` |
| `dist-dir` | Folder to publish (dist/build). | `./dist` |
| `vite-api-url` | Optional VITE_API_URL env var. | - |

---
<div align="center">
<sub>Powered by QA Hub Actions Ecosystem</sub>
</div>
