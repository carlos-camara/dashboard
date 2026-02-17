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
The test logic is powered by Python and the **[QA Hub Framework](https://github.com/carlos-camara/qa-hub-framework)**.

```powershell
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install automation requirements (includes the framework)
pip install -r requirements.txt
```

---

## 🎨 Engineering Standards

### TypeScript & React
* **Styling**: Always use **TailwindCSS 4**. Avoid inline styles or custom CSS files unless strictly necessary.
* **Aesthetics**: Adhere to the **Glassmorphism** design system (+ vibrancy, + transparency).
* **Icons**: Use **Lucide React**.
* **Typing**: All components and functions must be strictly typed. No `any` allowed.

### Python & BDD (Behave)
* **Framework First**: Always check if a step or utility exists in the **[QA Hub Framework](https://github.com/carlos-camara/qa-hub-framework)** before implementing locally.
* **Generic Steps**: We have migrated common logic (Text Validation, File Downloads, Visual Matching) to the core framework. Avoid creating custom steps unless absolutely necessary.
* **Feature Files**: Follow clean **Gherkin** syntax. Use `Background` for common setup.
* **Wait Logic**: Never use `time.sleep()`. Use the framework's stability wait steps (e.g., `And I wait for "dashboard" to be stable`).
* **Locators**: Use the YAML-driven locator system. Never hardcode selectors.

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
   - **Automated Lifecycle**:
     - **Labeling**: PRs are automatically categorized (e.g., `DevOps`, `QA`, `Frontend`) based on file changes.
     - **Summarization**: `Reviewer Intelligence` will automatically generate a grouped and collapsible summary of your changes.
     - **Checklists**: CI will automatically check the `Automated Tests` and `Linting` boxes in your PR description upon success.

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

