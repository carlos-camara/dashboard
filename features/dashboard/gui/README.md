# 🖼️ GUI Verification Engine

An ultra-premium verification layer designed to validate the **visual integrity**, **interactivity**, and **responsiveness** of the QA Hub Dashboard. Powered by **Selenium WebDriver** and the **QA Hub Framework**.

---

## 🏛️ Architecture & POM

We utilize a strictly decoupled **Page Object Model (POM)** strategy:
- **Logic**: Python classes encapsulated in `features/steps/`.
- **Selectors**: Centralized YAML locators in `features/page_objects/locators/`.
- **Hooks**: Strategic setup/teardown in `features/environment.py`.

---

## 📂 Feature Coverage

| Feature | Scope | Key Validations |
| :--- | :--- | :--- |
| **`gui_dashboard.feature`** | Core Portal | HSL accuracy, glassmorphism UI, KPI grid. |
| **`gui_navigation.feature`** | Routing | Inter-screen transitions, mobile menu, sidebar. |
| **`gui_test_runs.feature`** | Archives | Run filtering, status indicators, detail expansion. |
| **`gui_project_detail.feature`**| Projects | Project-specific stats, run history, back navigation. |
| **`gui_run_detail.feature`** | Reports | Scenario logs, failure context, PDF generation. |

---

## 🏃 Execution Manual

### 🛡️ Smoke Verification
Quickly validate the critical path in the current environment:
```bash
behave features/dashboard --tags="@gui and @smoke"
```

### 📸 Visual Integrity Audit
Ensure CSS transitions and layout stability across viewports:
```bash
behave features/dashboard --tags=@visual
```

### ⚡ Full Tactical Sweep
Execute the entire GUI suite with parallel reporting:
```bash
qa-hub run --env staging --tags gui --junit-dir reports/test_run/gui_audit
```

---

## 📸 Evidence Ecosystem

The framework automatically harvests high-resolution evidence for every execution.

- **Storage**: `features/resources/screenshots/`
- **Baseline Masking**: Visual comparisons utilize masked baselines to ignore dynamic timestamps.
- **Fail-Safe Capture**: Any failure automatically generates a `FAILED_...` trace for rapid root cause analysis.

---

## 🔧 Engineering Standards

> [!IMPORTANT]
> **Headless Execution**: CI runs in headless mode. Ensure local tests are debugged with `HEADLESS=false` in `.env` if visual anomalies are detected.

### Common Troubleshooting
1. **Synchronization**: Tests use **Fluent Waits**. If elements are missed, verify the `wait_load: true` flag in the YAML locator.
2. **Viewport Scaling**: Tests are designed for 1920x1080. Responsive tests utilize specific `@mobile` tags to override the window size.

---

<div align="center">
  <i>"Pixels are the pixels of truth."</i>
</div>
