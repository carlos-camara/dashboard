# Contributing to QA Hub

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to **QA Hub & Execution Dashboard**. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## 🛠️ Development Setup

### prerequisites
1.  **Node.js**: v18 or higher (v20 Recommended)
2.  **Python**: 3.10 or higher
3.  **Git**: Latest version

### 1. Frontend & Backend (Node.js)

```bash
# Install dependencies
npm install

# Start Backend (API + DB)
npm run start-backend

# Start Frontend (Vite)
npm run dev
```

### 2. Automation (Python)

```powershell
# Create venv
py -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install Test Dependencies
pip install -r requirements.txt
```

---

## 🎨 Coding Standards

### TypeScript / React
*   We use **Lucide React** for icons.
*   We use **TailwindCSS** for styling. Avoid inline styles where possible.
*   Components should be functional and typed with `React.FC<Props>`.

### Python / Behave
*   Feature files uses standard **Gherkin** syntax.
*   Step definitions should be strictly typed where possible.
*   Use `context` for passing data between steps, but document what you put there.

---

## 🔄 Workflow

1.  **Fork & Branch**: Create a branch for your feature (`feat/cool-new-thing`) or fix (`fix/memory-leak`).
2.  **Commit**: Use descriptive commit messages.
3.  **Verify**:
    *   Run `npm run build` to check for compilation errors.
    *   Run a smoke test `.\run_api_smoke_reports.ps1` to ensure no regression.
4.  **Pull Request**: Submit your PR targeted at the `devel` branch.

---

## 🐞 Reporting Bugs

Bugs are tracked as GitHub issues. When opening an issue, please include:
*   A clear title and description.
*   Steps to reproduce.
*   Screenshots (if applicable).
*   Logs from the generic `server.log` or console output.
