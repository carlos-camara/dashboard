# 💎 Ultra-Premium QA Automation Dashboard
> **The ultimate command center for Multi-Project Test Orchestration & Validation.**

[![Build Status](https://img.shields.io/github/actions/workflow/status/carlos-camara/dashboard/test_suite.yml?branch=main&style=for-the-badge&logo=github-actions&logoColor=white&label=CI%20Pipeline)](https://github.com/carlos-camara/dashboard/actions)
[![License](https://img.shields.io/github/license/carlos-camara/dashboard?style=for-the-badge&color=blue)](LICENSE)
[![Python Version](https://img.shields.io/badge/Python-3.11%2B-blue?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Node Version](https://img.shields.io/badge/Node.js-20%2B-green?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

![Hero Image](features/resources/screenshots/dashboard_complete_view_fullpage.png)

## 🌟 Executive Overview

This is not just another test runner. This is a **high-performance, ultra-premium QA ecosystem** designed to bridge the gap between technical BDD execution and executive-level visibility. Built with a state-of-the-art **Glassmorphism UI**, it provides real-time insights into your multi-project quality landscape.

### 🚀 Key Pillars
- **Unified Vision**: One dashboard for API (Behave) and GUI (Selenium) test suites.
- **Micro-Services Ready**: Validates complex REST flows with professional-grade diagnostics.
- **Real-Time Analytics**: Instant visualization of success rates, volume trends, and failure patterns.
- **Enterprise-Grade UI**: immersive dark mode, fluid responsiveness, and premium aesthetics.

---

## 🎨 Design & Experience

Our dashboard is built with a focus on **visual excellence** and **user experience**.

| Glassmorphism Excellence | Data-Driven Insights |
| :--- | :--- |
| ![Stats Grid](features/resources/screenshots/dashboard_stats_grid.png) | ![Timeline Chart](features/resources/screenshots/dashboard_timeline_chart.png) |
| **Precision Statistics**: High-level overview of success rates and test volume. | **Execution Trends**: Track your quality stability over time. |

### 📱 Fully Responsive
Whether you are on a 4K monitor or a mobile device, the dashboard adapts perfectly.
![Responsiveness](features/resources/screenshots/dashboard_responsiveness.png)

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
- **Visual Proof**: Automated screenshots on failure (or on demand).

### 📊 Integrated Catalog
Maintain a clean inventory of all your endpoints and their health status.
![Endpoints Catalog](features/resources/screenshots/dashboard_endpoints_catalog.png)

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
> Created with by Carlos Camara
