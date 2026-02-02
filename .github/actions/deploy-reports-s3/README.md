# ☁️ Deploy QA Reports to S3

<div align="center">

![AWS S3](https://img.shields.io/badge/AWS%20S3-Deployed-orange?style=for-the-badge&logo=amazon-s3)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Automated-blue?style=for-the-badge&logo=github-actions)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)

**A unified, drop-in GitHub Action to deploy standardized QA Hub test reports to AWS S3.**

</div>

---

## 🚀 Overview

This action standardizes the continuous deployment of Quality Assurance artifacts. It automatically identifies, downloads, and organizes test reports (API, GUI, Performance) from a workflow run and synchronizes them to a centralized S3 bucket for permanent storage and hosting.

### Key Features
- **📦 Smart Artifact Retrieval**: Automatically fetches `api-reports`, `gui-reports`, and `performance-reports`.
- **🎛️ Conditional Uploads**: Selective logic to upload only the report types relevant to your project (e.g., API-only).
- **🔒 Secure Deployment**: Handles AWS authentication internally.
- **📂 Structured storage**: Organizes uploads by `project-name` to keep the bucket clean.

---

## 🛠️ Usage

### Full Stack Application (API + GUI + Perf)
```yaml
name: Deploy Reports
on:
  workflow_run:
    workflows: ["Unified Test Suite"]
    types: [completed]

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    steps:
      - uses: carlos-camara/qa-hub-actions/deploy-reports-s3@main
        with:
          project-name: "dashboard-app"
          s3-bucket: ${{ secrets.AWS_S3_BUCKET }}
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          run-id: ${{ github.event.workflow_run.id }}
```

### Microservice / API Only
```yaml
      - uses: carlos-camara/qa-hub-actions/deploy-reports-s3@main
        with:
          project-name: "users-api"
          # ... credentials ...
          run-id: ${{ github.event.workflow_run.id }}
          # Disable irrelevant artifacts
          upload-gui: "false"
          upload-perf: "false"
```

---

## ⚙️ Configuration

| Input | Description | Required | Default |
|-------|-------------|:--------:|:-------:|
| `project-name` | Unique identifier for the project. Used as S3 subfolder. | ✅ | - |
| `s3-bucket` | Target AWS S3 Bucket Name. | ✅ | - |
| `run-id` | GitHub Workflow Run ID to source artifacts from. | ✅ | - |
| `aws-access-key-id` | AWS IAM Access Key. | ✅ | - |
| `aws-secret-access-key` | AWS IAM Secret Key. | ✅ | - |
| `aws-region` | AWS Region for the bucket. | ❌ | `us-east-1` |
| `upload-api` | Set to `false` to skip API reports. | ❌ | `true` |
| `upload-gui` | Set to `false` to skip GUI reports/screenshots. | ❌ | `true` |
| `upload-perf` | Set to `false` to skip Performance reports. | ❌ | `true` |

---

## 📦 Output Structure
Files will be synchronized to S3 using the following hierarchy:

```text
s3://<s3-bucket>/
└── <project-name>/
    ├── api/                 # API Smoke/Regression HTML Reports
    ├── gui/                 # Playwright/Selenium HTML Reports
    ├── screenshots/         # Captured failure screenshots
    └── performance_run/     # Locust/K6 High-Density Dossiers
```

---
