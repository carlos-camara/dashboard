# QA Hub: Automation Dashboard
> **The ultimate command center for Multi-Project Test Orchestration & Validation.**

[![Tests Status](https://img.shields.io/github/actions/workflow/status/carlos-camara/dashboard/test_suite.yml?branch=main&style=for-the-badge&logo=github-actions&logoColor=white&label=Tests)](https://github.com/carlos-camara/dashboard/actions/workflows/test_suite.yml?query=branch%3Amain)
[![Linter Status](https://img.shields.io/github/actions/workflow/status/carlos-camara/dashboard/lint.yml?branch=main&style=for-the-badge&logo=github-actions&logoColor=white&label=Linter)](https://github.com/carlos-camara/dashboard/actions/workflows/lint.yml?query=branch%3Amain)
[![Python Version](https://img.shields.io/badge/Python-3.11%2B-blue?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Node Version](https://img.shields.io/badge/Node.js-20%2B-green?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

![Hero Image](features/resources/screenshots/dashboard_header_status.png)

## 🌟 Executive Overview

This is not just another test runner. This is a **high-performance, ultra-premium QA ecosystem** designed to bridge the gap between technical BDD execution and executive-level visibility. Built with a state-of-the-art **Glassmorphism UI**, it provides real-time insights into your multi-project quality landscape.

### 🚀 Key Pillars
- **Unified Vision**: One dashboard for API (Behave) and GUI (Selenium) test suites.
- **Micro-Services Ready**: Validates complex REST flows with professional-grade diagnostics.
- **Real-Time Analytics**: Instant visualization of success rates, volume trends, and failure patterns.
- **Enterprise-Grade UI**: Immersive dark mode, fluid responsiveness, and premium aesthetics.

---

## 📸 The Visual Ecosystem

Explore the depth of our dashboard through its specialized views, each designed for maximum clarity and technical detail.

<table border="0">
  <tr>
    <td width="33%">
      <h3>📈 Main Insights</h3>
      <img src="features/resources/screenshots/dashboard_stats_grid.png" alt="Stats Grid" />
      <p><i>Real-time KPIs and system health metrics at a glance.</i></p>
    </td>
    <td width="33%">
      <h3>📂 Execution Archives</h3>
      <img src="features/resources/screenshots/archives_search_results.png" alt="Archives" />
      <p><i>Deep search and project-based grouping for historical data.</i></p>
    </td>
    <td width="33%">
      <h3>📡 Endpoint Catalog</h3>
      <img src="features/resources/screenshots/endpoints_advanced_filters.png" alt="Endpoints" />
      <p><i>Integrated API registry with advanced infrastructure filtering.</i></p>
    </td>
  </tr>
</table>

### 🔍 Precision Run Exploration
When a failure occurs, the **Run Detail View** provides surgical precision for diagnostics, allowing you to filter by status and view detailed scenario metrics.

![Run Detail](features/resources/screenshots/run_detail_full_view.png)

---

## 🛠 Feature Showcase

### 🔍 Deep API Validation
Leverage Python's **Behave** to write human-readable tests while performing deep technical assertions:
- **Contract Testing**: Automatic schema and type validation.
- **Performance Benchmarking**: Monitor response times against SLA thresholds.
- **Traced Requests**: Full headers and body logging for friction-less debugging.

### 🌐 Scalable GUI Automation
Custom **Page Object Model (POM)** implementation with centralized locators:
- **YAML-driven Locators**: Maintain tests without touching code.
- **Automatic Syncing**: Reliable element interaction with intelligent waits.
- **Visual Proof**: Automated screenshots on every step of the validation flow.

### 📱 Fully Responsive Experience
Engineered for the modern workforce. Access your quality metrics from any device without compromising on the premium aesthetic.
![Responsiveness](features/resources/screenshots/dashboard_responsiveness.png)

---

## 🏗 Project Architecture

```mermaid
graph TD
    A[GitHub Actions CI] -->|Executes| B(Python Behave)
    A -->|Executes| C(Selenium GUI)
    B -->|Generates| D[JUnit XML Reports]
    C -->|Generates| D
    D -->|Ingested by| E[Next.js Dashboard]
    E -->|Visualizes| F{Insights}
```

---

## 🚦 Getting Started

### 📋 Prerequisites
- **Python 3.11+**
- **Node.js 20+**
- **Chromedriver** (for GUI tests)

### 💻 Local Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/carlos-camara/dashboard.git
   cd dashboard
   ```

2. **Setup Python Environment**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Setup Dashboard**:
   ```bash
   npm install
   ```

---

## 🏃 Execution Commands

| Task | Command |
| :--- | :--- |
| **Run API Tests** | `./run_api_smoke_reports.ps1` |
| **Run GUI Tests** | `./run_gui_smoke_reports.ps1` |
| **Start Dashboard** | `npm run dev` |
| **Full CI Simulation** | `npm test` |

---

## 🛡️ Robust CI/CD
Our **GitHub Actions** pipeline ensures every PR is validated:
- **Linting**: Enforces strict code quality.
- **Functional Testing**: Runs the unified test suite.
- **Auto-Publishing**: Test reports are automatically merged and pushed back to the docs.

---
> Created with by [Carlos Camara](https://github.com/carlos-camara)
