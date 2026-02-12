# Dashboard GUI Testing Suite

This directory contains the visual and functional validation tests for the QA Hub Dashboard, utilizing **Selenium WebDriver** and **Behave (BDD)**.

## 🛠 Architecture
Our GUI tests follow the **Page Object Model (POM)** pattern. Locators are decoupled from logic using a YAML configuration for maximum maintainability.

## 📂 Test Organization

- **`dashboard_visual.feature`**: Focuses on HSL color accuracy, glassmorphism effects, and layout integrity across viewports.
- **`gui_navigation.feature`**: Validates routing, button interactions, and user flow between screens.
- **`gui_smoke.feature`**: Critical path validation to ensure the core dashboard is accessible and functional.

---

## 🏃 Execution Guide

### Run all GUI tests
```bash
behave features/dashboard --tags=@gui
```

### Run only smoke GUI tests
```bash
behave features/dashboard --tags="@gui and @smoke"
```

### Visual Verification
To run tests specifically focused on element visibility and aesthetic integrity:
```bash
behave features/dashboard --tags=@visual
```

---

## 📸 Automated Evidence
All GUI tests automatically capture evidence:
- **Location**: `features/resources/screenshots/`
- **Naming**: `{scenario_name}_{timestamp}.png`
- **Failures**: Any failed step automatically triggers a `FAILED_...` screenshot for instant debugging.

---

## 🔧 Debugging Tips

> [!TIP]
> **Disable Headless Mode**: If a test is failing inexplicably, run it in headed mode to see what the browser is doing.
> Set `HEADLESS=false` in your environment variables.

### Common Issues
1. **Element Not Found**: Check if the ID/XPath in `locators.yaml` matches the current UI build.
2. **Timeout**: If the dashboard is slow, increase the `wait_time` in `environment.py`.
3. **Chromedriver Version**: Ensure your local Chromedriver version matches your installed Chrome browser.

---

## 🧪 Step Registry

GUI-specific steps are powered by the **QA Hub Framework** core:
- **Core Navigation**: `qa_framework.steps.gui_steps`
- **Visual Validation**: `qa_framework.steps.visual_steps`
- **PDF Intelligence**: `qa_framework.steps.pdf_steps` (now feature-rich with self-healing downloads).
- **Custom Logic**: [gui_custom_steps.py](../../../steps/gui_custom_steps.py) (project-specific overrides).
