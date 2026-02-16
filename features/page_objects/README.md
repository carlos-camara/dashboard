# Dashboard Page Objects - Locator Framework

We use a **YAML-driven Locator System** to ensure our tests are resilient to UI changes and easy to maintain by non-developers.

## 🚀 Why YAML Locators?

> [!NOTE]
> By separating the **"What"** (the selector) from the **"How"** (the Python logic), we achieve:
> - **Zero Code Maintenance**: Fix broken tests by updating a single YAML file instead of hunting through Python scripts.
> - **Unified Language**: Feature files can use descriptive aliases that map directly to technical locators.
> - **Multi-Targeting**: Easily switch between ID, XPath, and CSS without changing the step definitions.

## 📂 System Structure

The locator registry is consumed by the **QA Hub Framework** to provide dynamic element resolution:

```text
features/
├── page_objects/
│   ├── locators/               # 🚩 The Single Source of Truth
│   │   ├── dashboard.yaml      # Dashboard page locators
│   │   └── ...                 # One YAML per page/view
│   └── README.md               # This file
├── steps/
│   └── step_gui_interactions.py # Project-specific interaction logic
```

## 📝 Adding New Locators

1. **Identify the element** using Chrome DevTools.
2. **Open** the appropriate YAML file in `locators/` (e.g., `dashboard.yaml`).
3. **Add** the entry using flattened naming:
   ```yaml
   stats_passed_card: "xpath://div[@data-testid='stat-passed']"
   stats_total_runs: "#total-runs-card"
   ```
4. **Use it** in your feature file:
   ```gherkin
   Then the "stats_passed_card" should be visible
   ```

## ✅ Best Practices

- **Naming**: Use `snake_case` with component prefixes (e.g., `timeline_toggle_volume`).
- **Specificity**: Prefer **IDs** or **data-testid** attributes over long, fragile XPaths.
- **One YAML per page**: Keep locators organized by screen/view.
- **No Python page classes needed**: The framework handles everything via YAML lookups.

> [!IMPORTANT]
> If a developer changes a CSS class name, ONLY the YAML file needs to be updated. Your tests will remain green without a single line of Python code changing.
