# 🧹 Lint Codebase Standard

<div align="center">

![Super-Linter](https://img.shields.io/badge/Super%20Linter-Enforced-purple?style=for-the-badge)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Automated-blue?style=for-the-badge&logo=github-actions)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)

**A unified quality gate enforcing standard linting rules across all QA Hub projects.**

</div>

---

## 🚀 Overview

This action strictly enforces code quality standards using GitHub's Super-Linter. It comes pre-configured with the "QA Hub Standard" ruleset, ignoring common noise (build artifacts, reports) and validating critical languages (Python, YAML, Markdown, TS).

### Key Features
- **🛡️ Zero-Config Defaults**: Works out of the box with optimal settings.
- **⚡ Optimized Exclusion**: Pre-configured to ignore `.venv`, `node_modules`, `reports/`, etc.
- **🔍 Diff-Only Validation**: By default, verifies only *changed* files in Pull Requests for speed.
- **🔧 Customizable**: Easily toggle languages or extend exclusion patterns.

---

## 🛠️ Usage

### Standard Implementation
Add this to `.github/workflows/lint.yml`:

```yaml
name: Lint Codebase
on: [pull_request, workflow_dispatch]

jobs:
  lint:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      statuses: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - uses: carlos-camara/qa-hub-actions/lint-codebase@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Full Codebase Scan (Weekly)
To run a full audit manually or on schedule:

```yaml
      - uses: carlos-camara/qa-hub-actions/lint-codebase@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          validate-all: "true"
```

---

## ⚙️ Configuration

| Input | Description | Default |
|-------|-------------|:-------:|
| `github-token` | Required for status reporting. | **Required** |
| `validate-all` | Scan all files (`true`) or only changes (`false`). | `false` |
| `validate-python` | Lint Python (Black, Flake8). | `true` |
| `validate-yaml` | Lint YAML files. | `true` |
| `validate-markdown` | Lint Markdown docs. | `true` |
| `validate-ts` | Lint TypeScript/JS/TSX. | `true` |
| `filter-regex-exclude` | Regex for ignored paths. | `standard-excludes` |

---
<div align="center">
<sub>Powered by QA Hub Actions Ecosystem</sub>
</div>
