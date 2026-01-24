# Linting Guide (Super-Linter)

This repository uses *GitHub Super-Linter* to enforce consistent code quality checks in CI.
The goal is to catch common issues early (style, formatting, invalid YAML, broken workflows, etc.)
and keep the codebase clean for reliable test execution and dashboard reporting.

---

## What is Super-Linter?

*Super-Linter* is an official GitHub Action that bundles multiple linters under one workflow.
In this repo, it is configured to validate:

- *Python* source files
- *GitHub Actions* workflow files
- *YAML* files
- *Markdown* files

---

## Where is it configured?

The lint workflow lives here:

- .github/workflows/lint.yml

This workflow runs automatically on:

- push to any branch
- pull_request to any branch
- manual runs via workflow_dispatch

---

## What does it validate?

The workflow enables these validators:

- VALIDATE_PYTHON=true
- VALIDATE_GITHUB_ACTIONS=true
- VALIDATE_YAML=true
- VALIDATE_MARKDOWN=true

It also excludes generated/irrelevant folders to reduce noise, e.g.:

- .venv/
- __pycache__/
- reports/
- .pytest_cache/
- node_modules/

(See FILTER_REGEX_EXCLUDE in the workflow file.)

---

## Changed-files vs full repository

By default, the workflow is configured to lint only the files changed in the PR/push:

- VALIDATE_ALL_CODEBASE=false

This makes lint faster and provides quicker feedback.

If you want to lint the entire repository on every run, change it to:

- VALIDATE_ALL_CODEBASE=true

---

## How to run the linter in GitHub Actions (manually)

1. Go to the *Actions* tab in GitHub
2. Select *Lint - Super-Linter*
3. Click *Run workflow*

---

## How to fix lint failures

When Super-Linter fails, open the failed job logs and locate the validator output.
Common fixes include:

### Python
- Fix syntax errors, unused imports, or style violations flagged by the Python linter.
- Keep step files readable and consistent (especially features/steps/*).

### GitHub Actions / YAML
- Validate indentation (spaces matter).
- Ensure correct keys and correct YAML structure.

### Markdown
- Fix trailing spaces, missing final newline, or formatting issues.

---

## Local linting (optional)

CI uses Super-Linter. Locally, you may use the Makefile target:

```bash
make lint