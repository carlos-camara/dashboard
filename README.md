# QA Hub: Automation Dashboard

> [!IMPORTANT]
> **The ultimate command center for Multi-Project Test Orchestration & Validation.**
> Bridge the gap between technical execution and executive visibility with clinical precision.

[![Python Version](https://img.shields.io/badge/Python-3.11%2B-blue?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Node Version](https://img.shields.io/badge/Node.js-20%2B-green?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Lint Status](https://github.com/carlos-camara/dashboard/actions/workflows/lint.yml/badge.svg?branch=devel)](https://github.com/carlos-camara/dashboard/actions/workflows/lint.yml)
[![Test Suite Status](https://github.com/carlos-camara/dashboard/actions/workflows/test_suite.yml/badge.svg?branch=devel)](https://github.com/carlos-camara/dashboard/actions/workflows/test_suite.yml)

![Hero Image](features/resources/screenshots/dashboard_complete_view_fullpage.png)

## 🌟 Executive Overview

This is a **high-performance, ultra-premium QA ecosystem** designed for modern engineering teams. Built with a state-of-the-art **Glassmorphism UI**, it provides real-time insights into your multi-project quality landscape, moving beyond simple test pass/fail metrics.

### 🚀 Key Pillars
- **Unified Vision**: One dashboard for API (Behave) and GUI (Selenium) test suites across all your repositories.
- **Smart Diagnostics**: Identifies failure patterns and provides immersive visual proof (screenshots) for every step.
- **Micro-Services Ready**: Professional-grade assertion engine for complex REST flows and contract validation.
- **Enterprise Aesthetics**: Immersive dark mode, fluid transitions, and a mobile-responsive interface.

---

## 🌐 Live Demonstration

Experience the future of test reporting. The dashboard is live and accessible globally:

> **[View Live Dashboard](https://carlos-camara.github.io/dashboard/)**

---

## 📸 Visual Core

The dashboard is structured into specialized views designed for different engineering needs.

<table border="0">
  <tr>
    <td width="33%" align="center">
      <h3>📈 Main Insights</h3>
      <img src="features/resources/screenshots/dashboard_stats_grid.png" alt="Stats Grid" />
      <p><i>Real-time KPIs and system health metrics at a glance.</i></p>
    </td>
    <td width="33%" align="center">
      <h3>📂 Execution Archives</h3>
      <img src="features/resources/screenshots/test_runs_search_results.png" alt="Archives" />
      <p><i>Historical data exploration with project-based grouping.</i></p>
    </td>
    <td width="33%" align="center">
      <h3>📡 Endpoint Catalog</h3>
      <img src="features/resources/screenshots/endpoints_deep_detail.png" alt="Endpoints" />
      <p><i>Technical registry of all infrastructure endpoints and their status.</i></p>
    </td>
  </tr>
</table>

### 🔍 Surgical Diagnostics
When a test fails, the **Run Detail View** allows you to drill down into specific failures, viewing headers, bodies, and visual proof simultaneously.

![Run Detail](features/resources/screenshots/run_detail_full_view.png)

---

## ☁️ Deployment Strategy

Our infrastructure leverages a decoupled architecture for maximum performance and reliability.

### **Frontend: GitHub Pages**
The React-based dashboard interface is statically generated and hosted on **GitHub Pages**. This ensures:
- **Global Edge Delivery**: Lightning-fast load times worldwide.
- **Zero-Downtime Updates**: Atomic deployments triggered automatically by our CI pipelines.
- **Security**: Hardened static assets with no server-side attack surface.

### **Backend: Render**
The reporting API and data aggregation layer run on **Render Cloud**. This provides:
- **Scalable Compute**: Automatically adjusts resources based on test suite load.
- **Persistent Data**: SQlite/PostgreSQL integrations for long-term historical analysis.
- **Health Checks**: Automated liveness probes to ensure reporting availability.

---

## 🏗 System Architecture

We utilize a modern stack to ensure scalability and developer comfort.

```mermaid
graph TD
    A["GitHub Actions CI"] -->|Triggers| B("Python Behave")
    A -->|Triggers| C("Selenium GUI")
    B -->|Logs| D["REST API Validation"]
    C -->|Captures| E["Visual Evidence (Screenshots)"]
    D & E -->|Generate| F["JUnit XML & JSON Reports"]
    F -->|Ingested by| G["Render Backend API"]
    G -->|Served to| H["GitHub Pages Frontend"]
    H -->|Presents| I{"Executive Insights"}
    
    style G fill:#6d28d9,color:#fff
    style H fill:#2563eb,color:#fff
    style I fill:#059669,color:#fff
```

---

## 🛠 Feature Showcase

### 🔍 Technical API Validation
- **Contract & Schema**: Automatic validation of response structures against YAML definitions.
- **SLA Monitoring**: Integrated performance benchmarking for response times.
- **Traceability**: Comprehensive logging of headers and payloads for every request.

### 🌐 Advanced GUI Automation
- **YAML Locator Engine**: Maintainable tests with descriptive element references.
- **Smart Waits**: Industrial-grade synchronization for dynamic modern web apps.
- **Evidence Collection**: High-resolution screenshots on every interaction and failure.

---

## 🚦 Getting Started

### 📋 Prerequisites
- **Python 3.11+**
- **Node.js 20+**
- **Chrome / Chromedriver** (for local GUI tests)

### 💻 Local Setup

1. **Clone & Browse**:
   ```bash
   git clone https://github.com/carlos-camara/dashboard.git
   cd dashboard
   ```

2. **Backend & Test Logic**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend Dashboard**:
   ```bash
   npm install
   ```

---

## 🏃 Execution Commands

| Mode | Command | Description |
| :--- | :--- | :--- |
| **Development** | `npm run dev` | Spins up the dashboard UI locally |
| **API Smoke** | `./run_api_smoke_reports.ps1` | Rapid validation of core endpoints |
| **GUI Smoke** | `./run_gui_smoke_reports.ps1` | Visual verification of critical paths |
| **Backend** | `npm run start-backend` | Starts the mock API and database services |

---

## 🛡️ CI/CD Workflow
Our **GitHub Actions** pipeline orchestrates the entire lifecycle:
1. **Linting**: Enforces strict code quality standards for Python and TypeScript.
2. **Unified Suite**: Runs API and GUI tests in parallel within a headless environment.
3. **Auto-Publishing**: Merges artifacts and deploys the frontend to GitHub Pages.

> [!TIP]
> Use the `workflow_dispatch` event to manually trigger a full suite validation from the GitHub UI.

---
> Created by [Carlos Camara](https://github.com/carlos-camara)
