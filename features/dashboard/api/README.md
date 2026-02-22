# <div align="center">🔌 API ENGINEERING INTELLIGENCE</div>

<div align="center">
  <p><i>Surgical-grade contract validation and service-tier orchestration.</i></p>
</div>

---

The **API Engineering Layer** serves as the mission-critical foundation for service tier integrity. We leverage the **[QA Hub Framework](https://github.com/carlos-camara/qa-hub-framework)** to orchestrate high-fidelity BDD scenarios ensuring 100% contract adherence.

## 🏗️ Technical Architecture

Our strategy balances **BDD Transparency** with **Surgical Verification**:
- **Behavior Driven**: Scenarios established in Gherkin for radical stakeholder transparency.
- **Framework Core**: Standardized logic for JSON schema validation and environment health.
- **Modular Logic**: Project-specific step extensions for complex business orchestration.

---

## 📂 Intelligence Coverage

We maintain 100% vigilance across the following critical paths:
- **[api_health.feature](api_health.feature)**: Real-time service availability and health telemetry.
- **[api_sync.feature](api_sync.feature)**: Data synchronization logic and state persistence integrity.
- **[api_endpoints.feature](api_endpoints.feature)**: Surgical contract validation for high-traffic assets.
- **[api_runs.feature](api_runs.feature)**: Execution chronology and result management logic.

### 🔗 Jira End-to-End Traceability
All API scenarios are deeply integrated with our Atlassian Jira instance:
- **Test Plan ➡️ Feature ➡️ Scenario**: Every `.feature` file maps to a Jira Feature Task under a master Test Plan Epic. Every scenario maps to a Sub-task.
- **Zero-Touch Task Creation**: Missing coverage is automatically detected during CI orchestration. The `jira-auto-tagger` action creates the corresponding hierarchy in Jira and dynamically injects `@CC-XXX` tags back into the codebase.
- **Live Status Triggers**: API test step failures or successes are posted back to the Jira issue's comment thread, updating the Parent Feature Task's historical execution table status natively in the Kanban board.

---

## 🏃 Execution Protocol

Execute the full suite with surgical precision using the standard CLI orchestration:

```bash
# Full Suite Baseline
behave features/dashboard/api --tags=@smoke

# Critical Path Validation
behave features/dashboard/api --tags=@critical
```

---

## 📊 Reporting & Transparency

Every execution generates high-fidelity **JUnit XML** artifacts that are ingested by the **Unified Dashboard**.
- **Aggregator**: Seamless integration into the Glassmorphism Presentation Tier.
- **Diagnostics**: Detailed request/response payloads available for immediate failure analysis.

### Jira Bi-Directional Linking
The artifact engine connects `JUnit XML` results directly to **Jira REST API v3**. Test failures append a stacktrace inside the Jira issue's comment thread, notifying developers instantly without requiring them to check GitHub Actions.


<br/>

<div align="center">
  <i>Precision. Integrity. Stability.</i>
</div>
