# �️ Automation & CI/CD Hub

Welcome to the central nervous system of the **QA Hub Dashboard**. This directory houses the GitHub Actions workflows that ensure our software is resilient, consistent, and always ready for deployment.

---

## 🏗️ Technical Architecture

Our CI/CD pipeline is designed for high observability and rapid feedback. We leverage a reactive architecture where specialized pipelines respond to the outcome of the main test suite.

```mermaid
graph TD
    %% Triggers
    Start([Push / Pull Request])
    Manual([Workflow Dispatch])
    Schedule([Schedule / Automation])
    
    style Start fill:#f9f,stroke:#333,stroke-width:4px
    style Manual fill:#f9f,stroke:#333,stroke-width:4px
    style Schedule fill:#fcf,stroke:#333,stroke-width:4px

    %% Main Workflows
    Lint["<b>🧹 Linting & Standards</b><br/>Super-Linter Cluster"]
    UTS["<b>🛡️ Unified Test Suite</b><br/>API, GUI & Performance"]
    
    %% Reactive Flows
    DS3["<b>☁️ S3 Archival</b><br/>Long-term Persistence"]
    RS["<b>🔄 Report Sync</b><br/>S3 to Repository Bridge"]
    DF["<b>🌐 Web Deployment</b><br/>GitHub Pages"]

    Start --> Lint
    Start --> UTS
    Manual --> Lint
    Manual --> UTS
    Manual --> RS
    Manual --> DF
    
    Schedule --> RS

    UTS -- "| on: Success |" --> DS3
    
    RS -- "| on: New Data |" --> DF
    
    subgraph "Quality Cluster"
        Lint
        UTS
    end

    subgraph "Infrastructure & Sync"
        DS3
        RS
    end
```

---

## 📋 Workflow Directory

| Status | Pipeline | Core Responsibility | External Dependency |
| :---: | :--- | :--- | :--- |
| `🧹` | **[Lint Codebase](./lint.yml)** | Static analysis, YAML validation & formatting. | `qa-hub-actions/lint-codebase` |
| `🛡️` | **[Unified Test Suite](./test_suite.yml)** | Multi-layer validation (API, Performance, GUI). | `qa-hub-actions` (Shared Suite) |
| `🔄` | **[Sync Reports from S3](./sync_reports.yml)** | Automated periodic report ingestion from AWS S3. | `services/s3.js` & `sync-s3.js` |
| `🌐` | **[Deploy Frontend](./deploy_frontend.yml)** | Production delivery to GitHub Pages. | `qa-hub-actions/deploy-gh-pages` |
| `☁️` | **[Deploy Reports S3](./deploy_reports_s3.yml)** | Data persistence in AWS S3 infra. | `qa-hub-actions/deploy-reports-s3` |
| `👤` | **[Auto Assign PR](./auto_assign.yml)** | Automated ownership assignment for PRs. | Native `gh` CLI |
| `🏷️` | **[PR Labeler](./pr_labeler.yml)** | Automatic categorization based on file paths. | `actions/labeler` |

---

## � Deep Dive: Core Pipelines

### 🛡️ Unified Test Suite
The flagship validation process. It spins up a temporary instance of the entire dashboard ecosystem to run complex interactive scenarios.
- **Environment**: Ubuntu Latest, Node.js 20, Python 3.11.
- **Services**: Frontend (Vite) + Backend (Node/Express).
- **Validation Layers**:
  - **API**: Behave-driven smoke tests.
  - **Performance**: High-density audit dossiers.
  - **GUI**: Selenium-based interaction flows.

### 🔄 Sync Reports from S3
A scheduled bridge that pulls the latest test results from S3 into the `main` branch. This decouples test execution from repository state updates.
- **Trigger**: Runs every 30 minutes and manually via `workflow_dispatch`.
- **Mechanism**: Executed via the `sync-s3.js` CLI script.
- **Persistence**: Commits any new reports directly to the repository.
- **Automatic Deployment**: Pushing to `main` via this workflow automatically triggers the **Web Deployment** to GitHub Pages.

### 🧹 Lint - Super-Linter
Maintains the aesthetic and structural integrity of our code.
- **Scope**: Python, YAML, Markdown, and GitHub Actions.
- **Rule**: Enforced on every Pull Request. "Green" status is mandatory for merging.

---

## 🛠️ Operational Guide

To trigger any of these workflows manually:
1. Navigate to the **[Actions](https://github.com/carlos-camara/dashboard/actions)** tab.
2. Select your target pipeline from the sidebar.
3. Click **Run workflow** and select your branch.

---
> [!IMPORTANT]
> **Action Migration**
> All workflows have been migrated to use the centralized **[QA Hub Actions](https://github.com/carlos-camara/qa-hub-actions)** repository. This allows for global updates to our automation logic without individual repository modifications.

*Maintained by Carlos Cámara*
