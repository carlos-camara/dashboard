# <div align="center">🛡️ QA COMMAND CENTER</div>

<div align="center">
  <h3>Next-Gen Orchestration & Engineering Intelligence</h3>
  <p><i>A high-performance, ultra-premium observation layer bridging technical execution and executive decision-making.</i></p>
</div>

<div align="center">

[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-0F172A?style=for-the-badge&logo=python&logoColor=38bdf8)](https://www.python.org/)
[![React 19](https://img.shields.io/badge/React-19-0F172A?style=for-the-badge&logo=react&logoColor=61dafb)](https://react.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS_4-Ultramodern-0F172A?style=for-the-badge&logo=tailwindcss&logoColor=38bdf8)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-0F172A?style=for-the-badge&logo=open-source-initiative&logoColor=white)](LICENSE)

[![Lint Status](https://github.com/carlos-camara/dashboard/actions/workflows/lint.yml/badge.svg?branch=devel)](https://github.com/carlos-camara/dashboard/actions/workflows/lint.yml)
[![Test Suite Status](https://github.com/carlos-camara/dashboard/actions/workflows/test_suite.yml/badge.svg?branch=devel)](https://github.com/carlos-camara/dashboard/actions/workflows/test_suite.yml)
[![Deploy Frontend](https://github.com/carlos-camara/dashboard/actions/workflows/deploy_frontend.yml/badge.svg)](https://github.com/carlos-camara/dashboard/actions/workflows/deploy_frontend.yml)

</div>

<br/>

![Main Dashboard View](features/resources/screenshots/baselines/chrome_dashboard_full_view_masked.png)

---

## 🌟 Executive Overview

This is more than a dashboard; it is a **mission-critical ecosystem** for modern engineering teams. Engineered with a **Glassmorphism UI**, it provides surgical-grade insights into your multi-project quality landscape, transforming chaotic logs into actionable intelligence.

> [!IMPORTANT]
> **Unified Intelligence**: Aggregated reporting for API (Behave) and GUI (Selenium) test suites in a single, high-fidelity pane.

### 🚀 The Four Pillars
- **Unified Vision**: Aggregated reporting for API (Behave) and GUI (Selenium) test suites in a single pane.
- **Smart Diagnostics**: Automated failure pattern recognition with immersive visual evidence.
- **Performance Digital Twin**: Real-time signal analysis and regression detection using Recharts analytics.
- **Enterprise-Grade CI**: Fully automated lifecycle from linting to report archival in AWS S3.

---

## 📑 Table of Contents

- [Executive Overview](#-executive-overview)
- [Live Experience](#-live-experience)
- [Features Matrix](#-features-matrix)
- [Cutting-Edge Features](#-cutting-edge-features)
  - [Performance Digital Twin](#-performance-digital-twin)
  - [PR Intelligence](#-pr-intelligence)
- [Architecture](#️-architecture-decoupled-full-stack)
- [CI/CD Ecosystem](#️-performance-driven-cicd)
- [Navigation & Initialization](#-navigation--initialization)
- [Verification Engine](#-verification-engine)
- [Ecosystem Architecture](#-ecosystem-architecture)
- [Collaboration & Support](#-collaboration--support)

---

## 🌐 Live Experience

The future of test reporting is already online. Experience the ultra-premium interface here:

> **[🚀 Access Live Dashboard](https://carlos-camara.github.io/dashboard/)**

---

## 📊 Features Matrix

| Ecosystem | Intelligence Layer | Technology Stack |
| :--- | :--- | :--- |
| **Unified Reporting** | Aggregated Vision for API & GUI | `Behave`, `Selenium`, `Vite` |
| **Performance Digital Twin** | Signal Velocity & Latency Audit | `Recharts`, `Custom Algorithms` |
| **Visual Evidence** | Automated High-Res Evidence Capture | `html2canvas`, `AWS S3` |
| **Intelligent Dossiers** | Executive-Ready PDF Artifacts | `jsPDF`, `Modular Rendering` |
| **Incremental Cloud** | High-Performance S3 Synchronization | `AWS SDK`, `Incremental Sync` |
| **PR Intelligence** | Dynamic Labeling & Smart Summaries | `GitHub Actions`, `gh CLI` |

---

## ✨ Cutting-Edge Features

### 📊 Performance Digital Twin
Go beyond binary pass/fail results. Our **Performance Analytics Engine** establishes a technical baseline for your system's health.
- **Signal Velocity**: Interactive time-series charts visualizing throughput trends.
- **Throughput Chronology**: Surgical detection of regression spikes and latency drifts.
- **Spectral Latency Audit**: A heat-map of system responsiveness and SLA adherence.

![Performance View](features/resources/screenshots/baselines/chrome_final_performance_dashboard_verification.png)

### 🤖 PR Intelligence
Maximize developer focus with an automated pull request management system:
- **Auto-Labeler**: Precise categorization (`DevOps`, `QA`, `Frontend`, `Backend`) based on modified file paths.
- **Enhanced Reviewer Intelligence**: Changed files are automatically grouped and presented in **collapsible sections**.
- **Smart Checklists**: "Automated Tests" and "Linting" boxes in PRs are automatically checked by CI upon success.
- **High-Fidelity Reporting**: Full test results are injected directly into the PR description with a visual summary table.

---

## 🏗️ Architecture: Decoupled Full-Stack

We leverage a modern, decoupled architecture designed for scale and zero-downtime reliability.

```mermaid
graph TD
    subgraph "Verification Tier (Python)"
        A["GitHub Actions CI"] -->|Orchestrates| B("Behave API Logic")
        A -->|Orchestrates| C("Selenium GUI Logic")
        A -->|Orchestrates| L["Locust Performance Logic"]
    end

    subgraph "Intelligence Tier (Actions)"
        D["QA Hub Shared Actions"] -->|Standardizes| A
    end

    subgraph "Persistence Tier (Cloud)"
        B & C & L -->|Artifacts| E["JUnit XML / JSON"]
        E -->|Synchronized| S3["AWS S3 History"]
        E -->|Materialized| DB["SQLite Intelligence DB"]
    end

    subgraph "Presentation Tier (JS)"
        DB -->|Served via| G["Express Backend API"]
        G -->|Consumed by| H["Vite React Dashboard"]
        H -->|Hosted on| P["GitHub Pages (Global CDN)"]
    end
    
    style G fill:#6d28d9,color:#fff
    style P fill:#2563eb,color:#fff
    style D fill:#f59e0b,color:#000
    style H fill:#14b8a6,color:#fff
```

> [!TIP]
> The architecture strictly separates **Execution**, **Persistence**, and **Presentation**, enabling independent scaling and surgical updates without affecting system availability.

---

## 🛠️ Performance-Driven CI/CD

Our pipelines are orchestrated via the **[QA Hub Actions](https://github.com/carlos-camara/qa-hub-actions)** library, ensuring modularity and global standards.

| Status | Pipeline | Operational Responsibility |
| :---: | :--- | :--- |
| `🧹` | **Lint Intelligence** | Super-Linter enforcement for zero-debt documentation and logic. |
| `🛡️` | **Unified Suite** | Surgical execution of API, GUI, and Performance layers. |
| `☁️` | **Incremental Sync** | High-performance report archival with surgical delta detection. |
| `🚀` | **SPA Deployment** | Automated production deployment with native routing support. |
| `🏷️` | **PR Orchestration** | Dynamic labeling, intelligent summarization, and task tracking. |

---

## 🚦 Navigation & Initialization

### 📋 Prerequisites
Prepare your engineering environment with the following dependencies:
- **Node.js**: v20+ (LTS Preferred)
- **Python**: v3.11+
- **Chrome / Chromedriver**: Required for full GUI verification.
- **AWS Infrastructure**: Optional for remote persistent reporting.

### 💻 Full-Stack Setup
1. **Registry Acquisition**:
   ```bash
   git clone https://github.com/carlos-camara/dashboard.git
   cd dashboard
   ```

2. **Ecosystem Initialization**:
   ```bash
   # Presentation & Service Tier Dependencies
   npm install
   
   # Verification Tier (Python BDD)
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```

3. **Service Manifestation**:
   ```bash
   # Terminal A: Intelligence Backend (Express/SQLite)
   npm run start-backend
   
   # Terminal B: Presentation Layer (Vite/React)
   npm run dev
   ```

> [!IMPORTANT]
> The dashboard operates as a **Decoupled SPA**. Ensure both the backend (Port 3000) and frontend (Port 5173) are active for full interactivity.

---

## 🧪 Verification Engine

This project includes a high-fidelity verification layer for API, GUI, and performance validation.

### Registry Execution
```bash
# Activate Python virtual environment
.venv\Scripts\activate  # Windows

# API Integrity Suite
behave features/dashboard/api --tags=@smoke

# GUI Presentation Suite
behave features/dashboard/gui --tags=@smoke

# Performance Baseline Suite
behave features/dashboard/performance
```

---

## 📁 Ecosystem Architecture

```text
dashboard/
├── .github/workflows/          # CI/CD Orchestration
├── components/                 # Presentation Tier (Vite/React)
├── features/                   # Verification Tier (BDD/Python)
│   ├── dashboard/             # Project-Specific Scenarios
│   │   ├── api/               # API Verification
│   │   ├── gui/               # GUI Verification
│   │   └── performance/       # Performance Verification
│   ├── page_objects/          # Registry-Driven POM
│   ├── resources/             # Assets & Screenshots
│   └── steps/                 # Step Logic
├── reports/                    # Intelligence Artifacts
├── services/                   # Service Tier (Node.js/SQLite/S3)
├── server.js                   # Intelligence API Core
└── index.html                  # Presentation Core
```

---

## 🤝 Collaboration & Support

We prioritize high-fidelity engineering standards and open collaboration.
- 📋 [Contributing Guide](CONTRIBUTING.md)
- 📝 [Project Chronology](CHANGELOG.md)
- 🛡️ [Security Policy](SECURITY.md)
- 📜 [Code of Conduct](CODE_OF_CONDUCT.md)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <i>Designed & Engineered with Precision by <b><a href="https://github.com/carlos-camara">Carlos Cámara</a></b></i>
</div>
