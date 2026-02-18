# <div align="center">📸 VISUAL EVIDENCE ARCHITECTURE</div>

<div align="center">
  <p><i>High-definition proof and surgical-grade surveillance for the Presentation Tier.</i></p>
</div>

---

We believe that **visual proof** is non-negotiable for high-fidelity engineering. Our framework orchestrates a high-definition evidence engine that captures critical interactions and anomalies across all verification layers.

## 🚀 Evidence Orchestration Modes

### 1. Programmatic Capture
Inject surgical evidence capture at any point within the BDD scenarios:
```gherkin
Then I take a high-fidelity screenshot named "user_profile_modal"
Then I take a full-stack screenshot named "dashboard_complete"
```

### 2. Failure Auto-Surveillance
> [!IMPORTANT]
> **Orchestrated Safety Net**: If a verification step fails, the framework automatically triggers an immediate capture of the presentation state.
> - **Registry Mapping**: Filenames are scenario-mapped and collision-resistant.
> - **Telemetry Invisibility**: Capture occurs with surgical precision, including full DOM visibility.

### 3. Visual Regression Intelligence
To ensure 100% stability, we implement **Granular Asset Masking** to isolate dynamic signals (timestamps, stochastic charts, etc.) from visual comparisons.
- **Protocol**: Masking occurs in-memory before the comparison algorithm executes.
- **Registry**: Baselines are established at `features/resources/screenshots/baselines/`.

---

## 🏛️ Storage Architecture

All intelligence assets are synchronized within a dedicated resource hierarchy:
```text
features/resources/screenshots/
├── dashboard_home_2026_02_18.png
├── FAILED_Navigation_Flow_Anomaly.png
└── baselines/                  # Technical Baselines
```

---

## 📊 Dashboard Orchestration

### High-Fidelity Reports
Execute verification with the HTML formatter to manifest embedded screenshots:
```bash
behave features/dashboard --tags=@gui -f html -o reports/gui_report_html
```

### CI/CD Integration
Our intelligence pipelines manage visual assets with zero manual intervention:
1. **Verification Phase**: Captures and uploads assets as temporary artifacts.
2. **Synchronization Phase**: Orchestrates the commit of evidence back to the repository registry.

> [!TIP]
> This ensures that after every successful merge, you can audit the high-fidelity visual state of the application directly from the repository.

---

## 🔧 Engineering Triage
- **Registry Permissions**: Ensure the runner has write-access to the `features/resources/` hierarchy.
- **Latency Buffering**: The framework utilizes a 500ms safety-gate to ensure the browser buffers are flushed before capture.

<br/>

<div align="center">
  <i>Evidence. Transparency. Precision.</i>
</div>
