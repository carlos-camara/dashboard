# 📤 Upload Test Results to Repo

<div align="center">

![Git](https://img.shields.io/badge/git-SCM-orange?style=for-the-badge&logo=git)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Automated-blue?style=for-the-badge&logo=github-actions)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)

**A unified action to collect test artifacts and commit them back to the repository history.**

</div>

---

## 🚀 Overview

This action serves as the storage mechanism for repositories that want to keep test reports directly in their git history (e.g. for GitHub Pages hosting or documentation). It consolidates scattered artifacts (API, GUI, Performance) into a standard `reports/` folder and pushes the changes.

### Key Features
- **📥 Unified Artifact Collection**: Downloads standardized QA Hub artifacts automatically.
- **🔄 Auto-Merge**: Safely merges new reports into the existing `reports/` directory.
- **🤖 Bot Commits**: Uses the `github-actions[bot]` identity.
- **🎛️ Conditional Processing**: Toggle specific report types on/off.

---

## 🛠️ Usage

### Standard Implementation
```yaml
name: Publish Reports
on:
  workflow_run:
    workflows: ["Unified Test Suite"]
    types: [completed]

jobs:
  publish:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    permissions:
      contents: write # Required to push changes
    steps:
      - uses: actions/checkout@v4
      
      - uses: carlos-camara/qa-hub-actions/upload-results@main
        with:
          run-id: ${{ github.event.workflow_run.id }}
          branch: ${{ github.event.workflow_run.head_branch }}
```

### Custom Implementation
```yaml
      - uses: carlos-camara/qa-hub-actions/upload-results@main
        with:
          run-id: ${{ github.event.workflow_run.id }}
          branch: "main"
          commit-message: "chore: update daily performance baseline"
          upload-gui: "false" # Only update perf reports
```

---

## ⚙️ Configuration

| Input | Description | Required | Default |
|-------|-------------|:--------:|:-------:|
| `run-id` | GitHub Workflow Run ID to source artifacts from. | ✅ | - |
| `branch` | Target branch to push the commit to. | ✅ | - |
| `upload-api` | Include API reports. | ❌ | `true` |
| `upload-gui` | Include GUI reports and screenshots. | ❌ | `true` |
| `upload-perf` | Include Performance dossiers. | ❌ | `true` |
| `commit-message` | Custom message for the commit. | ❌ | `docs: auto-generate...` |

---
<div align="center">
<sub>Powered by QA Hub Actions Ecosystem</sub>
</div>
