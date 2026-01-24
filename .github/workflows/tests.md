# Test Execution in GitHub Actions (with Summary & Failure Details)

This repository runs *Behave (BDD) API tests* in GitHub Actions and publishes a *test summary*
showing:

- How many tests were executed
- How many passed / failed / skipped
- Which scenarios failed and why (failure details)

It achieves this by generating *JUnit XML* reports and using an existing GitHub Action to render
those reports as a *Check* in the Actions/PR UI.

---

## Where it is configured

The test workflow is located at:

- .github/workflows/tests.yml

It runs on:
- push (any branch)
- pull_request (any branch)
- manual trigger (workflow_dispatch)

---

## How it works (high level)

1. *Install dependencies*
2. *Run Behave* and generate *JUnit XML* files under reports/
3. *Publish a test report* using dorny/test-reporter@v1:
   - creates a GitHub Check with totals and failure details
   - annotates failures so they are easy to find in the UI
4. *Upload JUnit XML* as an artifact for download
5. Fail the job if tests failed (so CI becomes red), *after* publishing the report

---

## Why JUnit XML?

Behave can output results in *JUnit XML* format, which is widely supported by CI tooling.
This makes it easy to:
- show totals and failure details in the GitHub UI
- archive reports as artifacts
- feed a future execution dashboard

The workflow runs Behave with:

```bash
behave features -t @smoke --no-capture --junit --junit-directory reports