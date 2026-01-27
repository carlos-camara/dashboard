# Smoke Test Execution & Automated Reporting

This workflow automates the execution of **BDD (Behave) Smoke Tests** and persists the results directly in the repository for historical tracking and easy access.

---

## Configuration & Trigger

- **Workflow**: `.github/workflows/tests.yml`
- **Trigger**: Runs only when a **Pull Request** is opened or updated against the `main` branch.
- **Scope**: Executes scenarios tagged with `@smoke`.

---

## How it works (The Pipeline)

1. **Environment Setup**: Standard Python 3.11 environment with project dependencies.
2. **Execute Tests**: Runs the `run_reports.ps1` PowerShell script.
   - Scans all `features/` for the `@smoke` tag.
   - Generates a **timestamped folder** (e.g., `reports/2026-01-25_20-56-31/`).
   - Produces JUnit XML reports within that folder.
3. **Persist Reports**:
   - The generated folder is automatically committed and pushed back to the PR source branch by the `github-actions[bot]`.
   - This ensures every PR contains its own execution evidence.
4. **Publish Summary**:
   - Uses `dorny/test-reporter` to render a summary directly in the PR's "Checks" tab.
   - Annotates specific code lines where BDD steps failed.
5. **Archive Artifacts**: Uploads the `reports/` directory as a downloadable GitHub artifact.

---

## Local Replication

To run the same suite locally with the exact same reporting structure:

```powershell
./run_reports.ps1
```

The script internally executes:
```bash
behave features --tags smoke --no-capture --junit --junit-directory reports/<timestamp>
```