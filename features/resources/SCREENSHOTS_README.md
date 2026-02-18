# 📸 Visual Evidence Engine

We believe that **visual proof** is the ultimate source of truth in GUI automation. Our framework captures high-definition evidence for every critical interaction, ensuring total transparency during verification.

---

## 🚀 Capture Orchestration

### 1. Programmatic Snapshots
Trigger high-resolution captures at strategic points within your BDD scenarios:
```gherkin
Then I take a screenshot named "kpi_grid_verification"
Then I take a full page screenshot named "portal_responsive_state"
```

### 2. Failure Auto-Surveillance
> [!IMPORTANT]
> **Safety Net**: Upon step failure, the framework automatically triggers an instantaneous capture of the browser's DOM state.
> - **Filename**: `FAILED_{scenario_name}_{timestamp}.png`
> - **Traceability**: The absolute path is injected into the execution logs for rapid debugging.

---

## 🕵️ Visual Regression Masking

To maintain stability across environments, we implement **Granular Element Masking** to isolate dynamic UI fragments during comparisons.

- **Objective**: Prevent false positives from fluctuating data (timestamps, chart animations).
- **Control**: Managed via the `without elements` parameter in Gherkin steps.
- **Archive**: Golden baselines are commit-protected in `features/resources/screenshots/baselines/`.

---

## 📂 Vault Structure

All captured artifacts are organized in a dedicated resource vault:

```text
features/resources/screenshots/
├── baselines/          # 🏆 Golden Master images for regression
├── kpi_verification.png 
├── FAILED_Login_Flow.png
└── portal_state.png
```

---

## ☁️ CI/CD Integration

Our **Unified Pipelines** manage the visual lifecycle automatically:
1. **Harvest**: Captures are bundled during test execution.
2. **Persistence**: Artifacts are uploaded to AWS S3 and conditionally committed back to the repository for historical tracking.

---

<div align="center">
  <i>"Verifying the invisible. Capturing the truth."</i>
</div>
