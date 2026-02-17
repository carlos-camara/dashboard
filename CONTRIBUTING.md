# Contributing to QA Hub Dashboard

First off, **thank you** for considering contributing to QA Hub! It's people like you that make it a great tool for the community. 🎉

Whether you're fixing a bug, adding a feature, improving documentation, or suggesting ideas, your contributions are welcome and appreciated!

> [!NOTE]
> These are guidelines, not rigid rules. Use your best judgment and feel free to propose changes to this document.

## 📑 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [How Can I Contribute?](#-how-can-i-contribute)
- [Development Environment Setup](#%EF%B8%8F-development-environment-setup)
- [Engineering Standards](#-engineering-standards)
- [The Contribution Workflow](#-the-contribution-workflow)
- [Testing Your Changes](#-testing-your-changes)
- [Commit Message Guidelines](#-commit-message-guidelines)
- [Reporting Bugs](#-reporting-bugs)
- [Suggesting Enhancements](#-suggesting-enhancements)

---

## 📜 Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

---

## 🤝 How Can I Contribute?

### 🐛 Reporting Bugs
Found a bug? Help us squash it! See [Reporting Bugs](#-reporting-bugs) below.

### 💡 Suggesting Enhancements
Have an idea for a new feature? We'd love to hear it! See [Suggesting Enhancements](#-suggesting-enhancements) below.

### 📝 Improving Documentation
Documentation improvements are always welcome. This includes README files, code comments, or inline documentation.

### 🔧 Code Contributions
Ready to get your hands dirty? See the [Development Environment Setup](#%EF%B8%8F-development-environment-setup) and [Contribution Workflow](#-the-contribution-workflow) below.

---

## 🛠️ Development Environment Setup

Follow these steps to get your local environment ready for contribution.

### Prerequisites

- **Node.js**: v20+ (LTS recommended)
- **Python**: 3.11+ 
- **Git**: Latest version
- **Chrome/Chromedriver**: For GUI automated tests

### 1. Fork & Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/dashboard.git
cd dashboard

# Add upstream remote
git remote add upstream https://github.com/carlos-camara/dashboard.git
```

### 2. Initialize the Core Services

The dashboard requires both a backend (Express API + SQLite) and a frontend to function locally.

```bash
# Install all dependencies
npm install

# Terminal A: Start the Backend API
npm run start-backend

# Terminal B: Start the Frontend Dev Server
npm run dev
```

The dashboard will be available at <http://localhost:5173>, and the API at <http://localhost:3000>.

### 3. Prepare the Automation Engine

The test logic is powered by Python and the **[QA Hub Framework](https://github.com/carlos-camara/qa-hub-framework)**.

```powershell
# Windows
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

```bash
# Linux/Mac
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

---

## 🎨 Engineering Standards

### TypeScript & React

- **Styling**: Always use **Tailwind CSS 4**. Avoid inline styles or custom CSS files unless strictly necessary.
- **Aesthetics**: Adhere to the **Glassmorphism** design system (vibrancy + transparency).
- **Icons**: Use **Lucide React** for all icons.
- **Typing**: All components and functions must be strictly typed. No `any` allowed unless absolutely necessary.
- **Component Structure**: Use functional components with hooks. Avoid class components.

### Python & BDD (Behave)

- **Framework First**: Always check if a step or utility exists in the **[QA Hub Framework](https://github.com/carlos-camara/qa-hub-framework)** before implementing locally.
- **Generic Steps**: We have migrated common logic (Text Validation, File Downloads, Visual Matching) to the core framework. Avoid creating custom steps unless absolutely necessary.
- **Feature Files**: Follow clean **Gherkin** syntax. Use `Background` for common setup.
- **Wait Logic**: Never use `time.sleep()`. Use the framework's stability wait steps (e.g., `And I wait for "dashboard" to be stable`).
- **Locators**: Use the YAML-driven locator system in `features/page_objects/`. Never hardcode selectors.

### Code Quality

- **Linting**: Run `npm run lint` before committing.
- **Formatting**: Code is automatically formatted. Follow existing patterns.
- **Comments**: Write self-documenting code. Use comments only when necessary to explain "why", not "what".

---

## 🔄 The Contribution Workflow

1. **Find or Create an Issue**: 
   - Browse [existing issues](https://github.com/carlos-camara/dashboard/issues) or create one to discuss your proposed change.
   - Wait for maintainer feedback before starting significant work.

2. **Create a Branch**:
   ```bash
   git checkout -b feat/amazing-feature  # For features
   git checkout -b fix/critical-bug      # For bug fixes
   git checkout -b docs/improve-readme   # For documentation
   ```

3. **Make Your Changes**:
   - Follow the [Engineering Standards](#-engineering-standards).
   - Write or update tests as needed.
   - Update documentation if you're changing functionality.

4. **Test Your Changes**:
   - See [Testing Your Changes](#-testing-your-changes) below.

5. **Commit Your Changes**:
   - Follow the [Commit Message Guidelines](#-commit-message-guidelines).
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   ```

6. **Push to Your Fork**:
   ```bash
   git push origin feat/amazing-feature
   ```

7. **Open a Pull Request**:
   - Go to the [repository](https://github.com/carlos-camara/dashboard) on GitHub.
   - Click "New Pull Request" and select your branch.
   - Fill out the PR template with details about your changes.
   - Link the PR to the relevant issue using keywords (e.g., "Closes #123").
   - Include screenshots or recordings for UI changes.

8. **Automated PR Lifecycle**:
   - **Auto-Labeling**: PRs are automatically categorized (e.g., `DevOps`, `QA`, `Frontend`, `Backend`) based on file changes.
   - **Auto-Assignment**: You'll be automatically assigned to your PR.
   - **Milestone Assignment**: PR will be assigned to the latest active milestone.
   - **CI Checks**: GitHub Actions will automatically run linting and tests.
   - **Smart Checklists**: CI will automatically check the `Automated Tests` and `Linting` boxes in your PR description upon success.
   - **PR Summary**: Automated PR summarization will generate a grouped and collapsible summary of your changes.

9. **Address Review Feedback**:
   - Respond to reviewer comments.
   - Make requested changes in your branch and push again.
   - Re-request review when ready.

10. **Merge**:
    - Once approved, a maintainer will merge your PR.
    - Your contribution will be included in the next release!

---

## 🧪 Testing Your Changes

Before submitting a PR, ensure your changes don't break existing functionality.

### Running Tests Locally

```bash
# Activate Python virtual environment (if not already active)
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Run API smoke tests
behave features/dashboard/api --tags=@smoke

# Run GUI smoke tests  
behave features/dashboard/gui --tags=@smoke

# Run performance tests
behave features/dashboard/performance
```

### Linting

```bash
# Run Super-Linter (matches CI)
# Note: This runs in Docker and checks all file types
npm run lint
```

### Manual Testing

For UI changes:
1. Start both backend and frontend (`npm run start-backend` + `npm run dev`)
2. Manually verify your changes in the browser
3. Test on different screen sizes if applicable
4. Capture screenshots or recordings for the PR

---

## 📝 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for clear and structured commit history.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without changing functionality
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system or dependency changes
- `ci`: CI/CD configuration changes
- `chore`: Other changes that don't modify src or test files

### Examples

```bash
# Feature
git commit -m "feat: add PDF export for performance reports"

# Bug fix
git commit -m "fix: resolve screenshot capture timeout issue"

# Documentation
git commit -m "docs: update installation instructions for Windows"

# Refactoring with scope
git commit -m "refactor(frontend): simplify dashboard component structure"

# Breaking change
git commit -m "feat!: redesign API response format

BREAKING CHANGE: API responses now use camelCase instead of snake_case"
```

---

## 🐞 Reporting Bugs

> [!WARNING]
> Before reporting a bug, please search [existing issues](https://github.com/carlos-camara/dashboard/issues) to see if it has already been reported.

### How to Submit a Good Bug Report

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) and provide:

- **Context**: What were you trying to achieve?
- **Steps to Reproduce**: Exact steps to trigger the bug.
- **Expected Behavior**: What you expected to happen.
- **Actual Behavior**: What actually happened.
- **Evidence**: Screenshots, console logs, or `server.log` snippets.
- **Environment**: 
  - OS (e.g., Windows 11, macOS 14, Ubuntu 22.04)
  - Node.js version (`node --version`)
  - Browser and version (for UI bugs)
  - Python version (for test bugs)

---

## 💡 Suggesting Enhancements

Have an idea for making the QA Hub Dashboard even better? We'd love to hear it!

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md) and describe:

- **Problem**: What problem does this enhancement solve?
- **Solution**: Your proposed solution or feature.
- **Alternatives**: Any alternative solutions you've considered.
- **Examples**: Mockups, code snippets, or examples from other tools.

---

## 🙏 Recognition

Contributors who submit merged PRs will be:
- Listed in the [CHANGELOG.md](CHANGELOG.md)
- Recognized in release notes
- Forever part of the project's history 🌟

---

## 📞 Getting Help

- **Questions?** Open a [Discussion](https://github.com/carlos-camara/dashboard/discussions)
- **Stuck?** Ask in your PR or issue
- **Security Issue?** See our [Security Policy](SECURITY.md)

---

<div align="center">
  <i>Thank you for contributing to QA Hub Dashboard! 🚀</i>
</div>
