# 🔌 Core API Verification Logic

The **Automation Engineering Intelligence** layer for backend validation. We utilize **Behave (BDD)** to ensure our services adhere to strict contract requirements and domain logic.

---

## 🏛️ Architecture

Our API testing strategy is powered by the **[QA Hub Framework](https://github.com/carlos-camara/qa-hub-framework)** and built on **decoupled assertions**:
- **Behavior Driven**: Scenarios described in Gherkin for absolute transparency.
- **Contract Enforcement**: Automated JSON schema validation and HTTP status code verification.
- **Stateless Verification**: Scenarios are designed to be independent and idempotent.

---

## 📂 Feature Coverage

| Feature | Objective | Validations |
| :--- | :--- | :--- |
| **`api_health.feature`** | Reliability | Service availability, system health response. |
| **`api_sync.feature`** | Data Flow | S3 synchronization logic, state persistence. |
| **`api_runs.feature`** | Inventory | Execution history, project aggregation. |

---

## 🏃 Execution Guide

### 🛡️ Smoke Sweep
Quickly validate service availability in a target environment:
```bash
behave features/dashboard/api --tags=@smoke
```

### ⚡ Full Contract Audit
Execute the entire suite with detailed JUnit XML export:
```bash
qa-hub run --env staging --tags api --junit-dir reports/test_run/api_audit
```

---

## 📊 Reporting & Visibility

API test results are standardized for executive consumption.
- **Aggregation**: Results are automatically synced to the **Unified Dashboard**.
- **Traceability**: Detailed request/response logs are available for all failed scenarios in the BDD reports.
- **SLA Tracking**: Execution duration is measured to identify latent performance regressions.

---

<div align="center">
  <i>"Precision in every transaction."</i>
</div>
