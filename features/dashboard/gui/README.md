# <div align="center">🎨 GUI VERIFICATION ECOSYSTEM</div>

<div align="center">
  <p><i>High-fidelity visual audit and functional presentation tier orchestration.</i></p>
</div>

---

The **GUI Engineering Layer** ensures the aesthetic and functional integrity of the QA Hub Dashboard. Utilizing **Selenium WebDriver** and **Behave (BDD)**, we orchestrate deep visual audits to maintain the premium Glassmorphism experience.

## 🏛️ Technical Architecture

Our presentation verification follows the **Registry-Driven Page Object Model (POM)**:
- **Decoupled Locators**: Element selectors are externalized in **YAML configuration** for maximum resiliency.
- **Visual Baseline**: High-fidelity matching of HSL color accuracy and layout stability.
- **Stability-First Hooks**: Intelligent wait logic ensures verification only occurs when the SPA is fully stable.

---

## 📂 Intelligence Coverage

We maintain constant vigilance over the Presentation Tier:
- **`gui_dashboard.feature`**: Validation of HSL accuracy, glassmorphism blurs, and responsive breakpoints.
- **`gui_navigation.feature`**: Verification of SPA routing, button interactions, and user flow persistence.
- **`gui_test_runs.feature`**: Critical path audit for historical data visualization and filtration.
- **`gui_endpoints.feature`**: Verification of telemetry rendering and latency visualization assets.

### 🔗 Visual Regression Traceability (Jira Integration)
Our GUI test suite is mapped 1:1 with Jira Tasks:
- **Automated Issue Tracking**: Every visual verification scenario receives a unique `@CC-XXX` Jira identifier.
- **Evidence Injection**: In the event of a frontend failure, the pipeline updates the Jira task's historical Markdown table and injects the failure stack trace so frontend developers have instant context directly in their Agile board.

---

## 🏃 Execution Protocol

Deploy the verification engine across the presentation layer:

```bash
# Full GUI Presentation Audit
behave features/dashboard/gui --tags=@smoke

# Targeted Visual Integrity Check
behave features/dashboard/gui --tags=@visual
```

---

## 📸 Automated Evidence Engine

The system maintains a high-fidelity audit trail for every execution:
- **Asset Hub**: `features/resources/screenshots/`
- **Chronology**: All artifacts are timestamped and scenario-mapped.
- **Failure Isolation**: Automatic high-res capture on step failure for instant diagnostic triage.

---

## 🔧 Engineering Diagnostics

> [!TIP]
> **Orchestrating Visibility**: If a scenario demonstrates non-deterministic behavior, disable headless mode (`HEADLESS=false`) to perform a real-time visual audit.

### 🚩 Critical Triage
1. **Registry Desync**: Verify if selectors in `locators.yaml` align with the latest React build.
2. **Environment Latency**: Adjust framework `wait_time` in `environment.py` for slower network conditions.
3. **Driver Alignment**: Ensure Chromedriver versions match the current production browser build.

---

## 🧪 Step Registry Intelligence

Precision presentation logic powered by the **QA Hub Framework**:
- **Core Orchestration**: `qa_framework.steps.gui_steps`
- **Aesthetic Audit**: `qa_framework.steps.visual_steps`
- **Dossier Generation**: `qa_framework.steps.pdf_steps` (Intelligence-boosted export).

<br/>

<div align="center">
  <i>Aesthetics. Precision. Integrity.</i>
</div>
