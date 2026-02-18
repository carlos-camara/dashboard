# <div align="center">🏗️ REGISTRY-DRIVEN PAGE OBJECTS</div>

<div align="center">
  <p><i>Decoupled locator orchestration for high-resiliency verification.</i></p>
</div>

---

The **Registry Intelligence Layer** ensures that our verification logic remains independent of presentation-tier churn. By utilizing a **YAML-driven Locator System**, we achieve surgical precision in element resolution without the overhead of traditional Python page classes.

## 🚀 Architectural Advantages

> [!NOTE]
> By strictly separating the **"Technical Address"** (the selector) from the **"Behavioral Logic"** (the BDD steps), we achieve:
> - **Zero-Code Resiliency**: Fix verification breakages by updating a single YAML entry—zero Python changes required.
> - **Surgical Abstraction**: Feature files utilize descriptive aliases that map directly to high-fidelity locators.
> - **Multi-Protocol Targeting**: Seamlessly pivot between ID, XPath, and CSS strategies without altering step definitions.

---

## 📂 Registry Ecosystem

The locator orchestration is consumed by the **QA Hub Framework** to provide dynamic, self-healing resolution:

```text
features/
├── page_objects/
│   ├── locators/               # 🚩 The Single Source of Truth
│   │   ├── dashboard.yaml      # Dashboard Page Registry
│   │   └── ...                 # View-Specific Registries
│   └── README.md               # This Briefing
├── steps/
│   └── step_gui_interactions.py # Business Logic Orchestration
```

---

## 📝 Orchestrating New Locators

1. **Surgical Isolation**: Identify the target element using high-fidelity browser diagnostics.
2. **Registry Injection**: Append the entry to the relevant YAML asset using flattened naming conventions.
   ```yaml
   stats_passed_card: "xpath://div[@data-testid='stat-passed']"
   stats_total_runs: "#total-runs-card"
   ```
3. **Behavioral Consumption**: Invoke the alias directly within the Gherkin scenario.
   ```gherkin
   Then the "stats_passed_card" should manifest with HSL accuracy
   ```

---

## ✅ Engineering Standards

- **Semantic Naming**: Utilize `snake_case` with logical component prefixes.
- **Precision Selectors**: Always prioritize **data-testid** or **IDs** over fragile hierarchical XPaths.
- **View-Level Atomicity**: Maintain a 1:1 mapping between application views and YAML registries.
- **Declarative Strategy**: Avoid Python-heavy page objects; leverage the framework's registry lookups.

<br/>

<div align="center">
  <i>Abstraction. Resiliency. Intelligence.</i>
</div>
