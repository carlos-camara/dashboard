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

### 2. Launch the Portal

The dashboard is a strictly **decoupled Single Page Application (SPA)** that synchronizes data from AWS S3.

```bash
# Install all dependencies
npm install

# Start the Frontend Dev Server
npm run dev
```

The portal will be available at <http://localhost:5173>. Ensure your `.env` is configured with a valid S3 bucket if you want to sync real execution data.

### 3. Prepare the Verification Engine

Test logic is powered by Python and the **[QA Hub Framework](https://github.com/carlos-camara/qa-hub-framework)**.

```bash
# Initialize virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

---

## 🎨 Engineering Standards

### TypeScript & Ultra-Premium UI

- **Styling**: Always use **Tailwind CSS 4**. Avoid custom CSS files.
- **Aesthetics**: Adhere to the **Glassmorphism** design system (vibrancy + transparency + blur).
- **Icons**: Use **Lucide React** for all interface orchestration.
- **Typing**: All components must be strictly typed. **Zero-any** policy.

### BDD & Framework Harmony

- **Framework First**: Always leverage the **[QA Hub Framework](https://github.com/carlos-camara/qa-hub-framework)** steps before implementing local logic.
- **Gherkin Hygiene**: Follow clean syntax. Use `Background` for state preparation.
- **Decoupled Locators**: Never hardcode selectors. Use the YAML registry in `features/page_objects/locators/`.

---

## 🔄 The Contribution Workflow

1. **Issue Identification**: Discuss proposed changes in a GitHub Issue first.
2. **Feature Branching**: Create a branch from `main` (e.g., `feat/analytics-overlay`).
3. **Execution**: Implement changes following the [Engineering Standards](#-engineering-standards).
4. **Verification**: Run local tests (see [Testing Your Changes](#-testing-your-changes)).
5. **PR Orchestration**: Open a PR with a high-fidelity description and visual evidence for UI changes.

---

## 🧪 Testing Your Changes

Before submitting, ensure the critical path remains green:

```bash
# API Verification
behave features/dashboard/api --tags=@smoke

# GUI Verification
behave features/dashboard/gui --tags=@smoke
```

---

## 📝 Commit Standard

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

- `feat`: New capability.
- `fix`: Resolve anomaly.
- `refactor`: Structural optimization.
- `docs`: Documentation improvement.

---

<div align="center">
  <i>Thank you for contributing to the future of Engineering Intelligence! 🚀</i>
</div>
