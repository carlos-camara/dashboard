# Dashboard Page Objects - Locator Framework

We use a **YAML-driven Locator System** to ensure our tests are resilient to UI changes and easy to maintain by non-developers.

## 🚀 Why YAML Locators?

> [!NOTE]
> By separating the **"What"** (the selector) from the **"How"** (the Python logic), we achieve:
> - **Zero Code Maintenance**: Fix broken tests by updating a single YAML file instead of hunting through Python scripts.
> - **Unified Language**: Feature files can use descriptive aliases that map directly to technical locators.
> - **Multi-Targeting**: Easily switch between ID, XPath, and CSS without changing the step definitions.

## 🛠 Usage in Python

The Page Object class automatically loads the YAML file. You access locators using their logical keys.

```python
# features/page_objects/dashboard_page.py

class DashboardPage(BasePage):
    def click_sync_button(self):
        # 'sync_button' is a key defined in locators.yaml
        self.click_element("sync_button")
```

---

## 📂 System Structure

```text
features/
├── page_objects/
│   ├── locators.yaml         # 🚩 The Single Source of Truth
│   ├── base_page.py          # Core Selenium wrapper methods
│   └── dashboard_page.py     # Screen-specific logical actions
└── steps/
    └── step_gui_interactions.py
```

---

## 📝 Adding New Locators

1. **Identify the element** using Chrome DevTools.
2. **Open** `features/page_objects/locators.yaml`.
3. **Add** the entry under the appropriate section:
   ```yaml
   dashboard:
     new_feature_btn: "xpath://button[contains(@class, 'new-feat')]"
   ```
4. **Use it** in your Page Object or directly in a generic step.

---

## ✅ Best Practices

- **Naming**: Use `snake_case` for locator keys (e.g., `login_error_msg`).
- **Specificity**: Prefer **IDs** or **data-testid** attributes over long, fragile XPaths.
- **Grouping**: Keep locators organized by screen or component within the YAML file.
- **Uniqueness**: Ensure each key is unique to avoid collision during lookups.

> [!IMPORTANT]
> If a developer changes a CSS class name, ONLY `locators.yaml` needs to be updated. Your tests will remain green without a single line of Python code changing.
