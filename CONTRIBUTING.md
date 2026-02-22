# <div align="center">🤝 QA HUB CONTRIBUTION BLUEPRINT</div>

<div align="center">
  <p><i>Building the future of Next-Gen Orchestration & Engineering Intelligence.</i></p>
</div>

---

First off, **thank you** for considering contributing to QA Hub Dashboard! Your engineering excellence is what drives this ecosystem forward. Whether you're optimizing a React component, refining a BDD scenario, or polishing documentation, your contributions are invaluable.

> [!NOTE]
> These are guidelines designed to maintain high-fidelity engineering standards while keeping the contribution process friction-free. Use your best judgment and feel free to propose enhancements to this blueprint.

## 📑 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Collaboration Channels](#-collaboration-channels)
- [Engineering Environment Setup](#%EF%B8%8F-engineering-environment-setup)
- [Technical Standards](#-technical-standards)
- [The Contribution Workflow](#-the-contribution-workflow)
- [Verification Protocols](#-verification-protocols)
- [Chronology & Reporting](#-chronology--reporting)

---

## 📜 Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers with surgical detail.

---

## 🤝 Collaboration Channels

### 🐛 Reporting Anomalies
Found a deviation from the expected high-fidelity behavior? Help us surgical fix it! See [Reporting Anomalies](#-reporting-anomalies) below.

### 💡 Engineering Enhancements
Have a vision for a new intelligence layer? We prioritize innovative extensions! See [Engineering Enhancements](#-engineering-enhancements) below.

### 📝 Documentation Polish
Aesthetic integrity is paramount. Contributions to README files, architectural diagrams, or technical briefings are highly encouraged.

### 🔧 Core Contributions
Ready to architect the future? See the [Engineering Environment Setup](#%EF%B8%8F-engineering-environment-setup) and [Contribution Workflow](#-the-contribution-workflow) below.

---

## 🛠️ Engineering Environment Setup

Follow these protocols to initialize your local engineering ecosystem.

### Prerequisites

- **Node.js**: v20+ (LTS Precision)
- **Python**: v3.11+
- **Git**: Global standard
- **Chrome / Chromedriver**: Required for full-stack presentation verification.

### 1. Registry Acquisition

```bash
# Clone the upstream intelligence registry
git clone https://github.com/carlos-camara/dashboard.git
cd dashboard

# Establish upstream synchronization
git remote add upstream https://github.com/carlos-camara/dashboard.git
```

### 2. Full-Stack Initialization

The dashboard orchestrates both an **Intelligence Backend** (Express/SQLite) and a **Presentation Layer** (Vite/React).

```bash
# Install core dependencies
npm install

# Service Tier Manifestation
# Terminal A: Start the Intelligence Backend
npm run start-backend

# Presentation Tier Manifestation
# Terminal B: Start the High-Fidelity Dev Server
npm run dev
```

The ecosystem will be active at <http://localhost:5173> (Frontend) and <http://localhost:3000> (API).

### 3. Verification Engine Setup

The BDD logic is powered by the **[QA Hub Framework](https://github.com/carlos-camara/qa-hub-framework)** within a isolated Python environment.

```powershell
# Windows Orchestration
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

```bash
# Unix/Darwin Orchestration
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

---

## 🎨 Technical Standards

### TypeScript & Presentation Tier (React)

- **Aesthetic Integrity**: Strictly adhere to the **Glassmorphism** design system. Utilize vibrancy, transparency, and background blurs to maintain premium visual fidelity.
- **Styling Orchestration**: Always utilize **Tailwind CSS 4**. Custom CSS is only permitted for complex micro-animations or shaders.
- **Iconography**: Leverage **Lucide React** for all semantic icons.
- **Registry Typing**: All components and state-machines must be strictly typed. `any` is strictly prohibited.
- **Component Architecture**: Utilize functional components with surgical hook orchestration.

### Python & Verification Tier (Behave)

- **Framework Isolation Priority**: Always utilize the **[qa-automation-framework](https://github.com/carlos-camara/qa-hub-framework)** via `pip` package before implementing local logic. This project serves as an orchestrator, not a logic dump.
- **Generic Step Strategy**: Leverage standard framework steps for element interaction (`qa_framework.steps.gui_steps`), REST validation (`qa_framework.steps.api_steps`), and visual audits (`qa_framework.steps.visual_steps`). Local code belongs in `gui_custom_steps.py` merely as an alias.
- **Feature Manifestation**: Follow mission-critical **Gherkin** syntax. Utilize `Background` for state initialization. All `.feature` files must start with a descriptive markdown paragraph to be properly ingested into the Jira Feature Task.
- **Stability Protocol**: Never utilize `time.sleep()`. Leverage the framework's stability wait logic for non-deterministic SPA transitions.
- **Registry-Driven POM**: Externalize all selectors in the YAML-driven locator files `locators.yaml`.

---

## 🔄 The Contribution Workflow

1. **Anomaly Isolation**:
   - Identify an existing [Issue](https://github.com/carlos-camara/dashboard/issues) or create a new technical briefing.
   - Await maintainer alignment before commencing architectural changes.

2. **Branch Orchestration**:
   ```bash
   git checkout -b feat/intelligence-layer  # New features
   git checkout -b fix/presentation-anomaly # Bug fixes
   git checkout -b docs/briefing-polish     # Documentation
   ```

3. **Engineering Implementation**:
   - Adhere to the [Technical Standards](#-technical-standards).
   - Update the Verification Tier to reflect changes.
   - Polish the technical briefings if functionality is altered.

4. **Self-Verification**:
   - Execute the local [Verification Protocols](#-verification-protocols).

5. **Commit Chronology**:
   - Follow the [Chronology & Reporting](#-chronology--reporting) guidelines.
   ```bash
   git add .
   git commit -m "feat: add mission-critical intelligence layer"
   ```

6. **Pull Request Manifestation**:
   - Open a PR against the `devel` branch.
   - Synchronize the PR description with the provided template ensuring it meets the `pr-hygiene-validator` (Conventional Commits, >15 char body).
   - Our `pr-size-labeler` will analyze lines changed, keeping changes modular (Prefer `size/S` or `size/M`).
   - Include high-fidelity screenshots/recordings for presentation-tier changes.

---

## 🧪 Verification Protocols

Before manifestation, ensure your changes adhere to the integrity baseline.

### Registry-Driven Execution

```bash
# Initialize Verification Env
source .venv/bin/activate

# API Integrity Audit
behave features/dashboard/api --tags=@smoke

# Presentation Tier Audit
behave features/dashboard/gui --tags=@smoke

# Performance Baseline Audit
behave features/dashboard/performance
```

### Static Analysis

```bash
# Execute Super-Linter (Matches CI Protocol)
npm run lint
```

---

---

## 📝 Chronology & Reporting

We utilize **Conventional Commits** to maintain a high-fidelity project chronology.

### Protocol
```text
<type>(<scope>): <subject>

<body>

<footer>
```

### Classification
- `feat`: A new intelligence layer or feature.
- `fix`: Resolution of a technical anomaly.
- `docs`: Technical briefing or documentation polish.
- `style`: Aesthetic changes (Glassmorphism, Tailwind).
- `refactor`: Structural changes without functional drift.
- `perf`: Performance optimizations.
- `test`: Verification Tier updates.
- `ci`: Orchestration pipeline changes.

---

## 🐞 Reporting Anomalies

> [!WARNING]
> Before reporting an anomaly, execute a surgical search through [existing briefings](https://github.com/carlos-camara/dashboard/issues).

### The High-Fidelity Anomaly Brief
Utilize the [Anomaly Template](.github/ISSUE_TEMPLATE/bug_report.md) and provide:
- **Architectural Context**: What was the intended orchestration?
- **Surgical Reproduction**: Exact steps to trigger the anomaly.
- **Expected Outcome**: The high-fidelity behavior expected.
- **Actual Outcome**: The technical drift observed.
- **Visual Evidence**: Screenshots, console telemetry, or `server.log` fragments.

---

## 💬 Engineering Enhancements
Have a vision for evolving the QA Hub ecosystem? We prioritize structured feature requests. Use the [Enhancement Template](.github/ISSUE_TEMPLATE/feature_request.md) to outline the problem, proposed architectural solution, and alternative considerations.

---

## 🙏 Recognition
Engineers who contribute to the mission-critical registry will be:
- Immortalized in the [Project Chronology](CHANGELOG.md).
- Recognized in high-fidelity release briefings.
- Forever part of the ecosystem's success story. 🌟

---

<div align="center">
  <i>Thank you for architecting the future of QA Hub Dashboard! 🚀</i>
</div>
