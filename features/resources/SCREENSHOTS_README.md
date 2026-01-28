# Visual Evidence & Screenshot Engine

We believe that **visual proof** is non-negotiable for high-quality GUI automation. Our framework captures high-definition evidence for every critical interaction.

## 📸 Automated Capture Modes

### 1. Programmatic Screenshots
You can trigger a screenshot at any time in your feature files:
```gherkin
Then I take a screenshot named "user_profile_modal"
Then I take a full page screenshot named "dashboard_complete"
```

### 2. Failure Auto-Surveillance
> [!IMPORTANT]
> **Safety Net**: If a test fails, the framework automatically captures the browser's state at the exact millisecond of the failure.
> - **Filename**: `FAILED_{scenario_name}_{timestamp}.png`
> - **Visibility**: The screenshot path is printed directly in the test log for immediate discovery.

---

## 📂 Storage Architecture

All evidence is stored in a dedicated resource directory:
```text
features/resources/screenshots/
├── dashboard_home_20260128_163000.png
├── FAILED_Navigation_Flow_20260128_163210.png
└── ...
```

---

## 📊 Integration with Dashboards

### Local HTML Reports
Run tests with the HTML formatter to see screenshots embedded directly in the results:
```bash
behave features/dashboard --tags=@gui -f html -o reports/gui_report.html
```

### GitHub Actions CI/CD
Our pipelines manage visual evidence automatically:
1. **Unified Test Suite**: Captures screenshots and uploads them as temporary artifacts.
2. **Result Upload Pipeline**: Downloads the artifacts and **commits** them back to the repository under `features/resources/screenshots/`.

> [!TIP]
> This ensures that after every successful merge, you can browse the repository to see the latest visual state of the application.

---

## 🛠 Troubleshooting
- **Missing Screenshots**: Ensure the `features/resources/screenshots/` folder exists or the runner has write permissions.
- **Blurry Images**: This usually happens if the browser is closed before the disk write completes. The framework uses a 500ms safety buffer to prevent this.
