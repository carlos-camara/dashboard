# 🔌 Core API Testing Suite

The **Automation Engineering Intelligence** layer for API validation. We utilize **Behave (BDD)** to ensure our backend services adhere to strict contract requirements and business logic.

## 🏛 Architecture

Our API testing strategy is powered by the **[QA Hub Framework](https://github.com/carlos-camara/qa-hub-framework)** and built on **decoupled assertions**:
- **Behavior Driven**: Scenarios described in Gherkin for transparency across stakeholders.
- **Framework Core**: Utilizes standard framework steps for JSON validation and system health.
- **Modular Extensions**: Project-specific steps for complex business logic.

---

## 📂 Feature Coverage

- **[api_health.feature](api_health.feature)**: Service availability and system health checks.
- **[api_sync.feature](api_sync.feature)**: Data synchronization logic and state persistence.
- **[api_endpoints.feature](api_endpoints.feature)**: Contract validation for all high-traffic endpoints.
- **[api_runs.feature](api_runs.feature)**: Execution history and result management logic.

---

## 🏃 Execution Guide

Run the full API suite with surgical precision:
```bash
qa-hub run --env staging --tags api
```

### Targeted Execution
```bash
behave features/dashboard/api --tags=@critical
```

---

## 📊 Reporting & Visibility

API test results are standardized into **JUnit XML** format for high-fidelity reporting.
- **Aggregator**: Results are consumed by the **Unified Dashbord**.
- **Evidence**: Detailed request/response logs are available for all failed scenarios.

---
<div align="center">
  <i>Precision. Integrity. Stability.</i>
</div>
