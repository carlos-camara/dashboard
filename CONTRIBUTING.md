# Contributing to QA Hub

First off, thank you for considering contributing to QA Hub! It's people like you that make it a great tool for the community. 🎉

> [!NOTE]
> These are guidelines, not rigid rules. Use your best judgment and feel free to propose changes to this document.

## 🛠️ Development Environment Setup

Follow these steps to get your local environment ready for contribution.

### Prerequisites
* **Node.js**: v18 or higher (v20+ recommended)
* **Python**: 3.10 or higher
* **Git**: Latest version

### 1. Initialize the Core Services
The dashboard requires both a backend (mock API/DB) and a frontend to function locally.

```bash
# Install all dependencies
npm install

# In terminal A: Start the Backend
npm run start-backend

# In terminal B: Start the UI
npm run dev
```

### 2. Prepare the Automation Engine
The test logic is powered by Python and Behave.

```powershell
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install automation requirements
pip install -r requirements.txt
```

---

## 🎨 Engineering Standards

### TypeScript & React
* **Styling**: Always use **TailwindCSS**. Avoid inline styles or custom CSS files unless strictly necessary.
* **Icons**: Use **Lucide React** for consistency.
* **Typing**: All components and functions must be strictly typed. No `any` allowed.

### Python & BDD (Behave)
* **Feature Files**: Must follow clean **Gherkin** syntax. Use `Background` for common setup steps.
* **Step Definitions**: Document all `context` variables within the step file.
* **Locators**: Never hardcode selectors in Python. Use the YAML-driven locator system in `features/page_objects/locators.yaml`.

---

## 🔄 The Contribution Workflow

1. **Find an Issue**: Browse the issues or create one to discuss your proposed change.
2. **Branching Strategy**:
   - Feature: `feat/amazing-feature`
   - Fix: `fix/critical-bug`
3. **Quality Check**:
   - Run `npm run lint` to check for style issues.
   - Run `.\run_api_smoke_reports.ps1` to ensure no core regressions.
4. **Submitting a Pull Request**:
   - Target the `main` or `devel` branch as specified in the issue.
   - Include screenshots or recordings for UI changes.
   - Link the PR to the relevant issue.
   - **Note**: PRs are automatically labeled based on the files changed (e.g., `QA` for features, `DevOps` for workflows, `documentation` for .md files).

---

## 🐞 Reporting Bugs

> [!WARNING]
> Before reporting a bug, please search existing issues to see if it has already been reported.

When opening an issue, please provide:
* **Context**: What were you trying to achieve?
* **Reproduce**: Exact steps to trigger the bug.
* **Evidence**: Screenshots, console logs, or `server.log` snippets.
* **Environment**: OS, Node version, and Browser.

---
> Happy coding! 🚀
