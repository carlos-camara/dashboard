# QA Execution Dashboard (BDD Automation) — Multi-Project Validation
[![Lint (devel)](https://github.com/carlos-camara/dashboard/actions/workflows/lint.yml/badge.svg?branch=devel)](https://github.com/carlos-camara/dashboard/actions/workflows/lint.yml?query=branch%3Adevel)
[![Tests (devel)](https://github.com/carlos-camara/dashboard/actions/workflows/tests.yml/badge.svg?branch=devel)](https://github.com/carlos-camara/dashboard/actions/workflows/tests.yml?query=branch%3Adevel)

This repository is a *QA Dashboard/Framework* designed to *validate and visualize test executions* across *multiple projects, with a strong focus on **API testing* using *BDD (Behave)* in Python.

It provides a scalable foundation to:
- execute standardized BDD suites,
- validate REST endpoints with professional assertions and diagnostics,
- generate CI-friendly artifacts (JUnit),
- and evolve into a *central execution dashboard* (trends, stability, recurring failures, performance signals).

> The httpbin suite is included as a *reference implementation* and sandbox for endpoint validation patterns.

---

## Repository Goals

- Run *BDD (Behave)* suites in a consistent and reusable way.
- Validate *HTTP methods* (GET/POST/PUT/DELETE/OPTIONS) with robust checks:
  - status codes
  - JSON paths and types
  - contract checks (keys, nulls, empty payloads)
  - response time thresholds
  - header validation (case-insensitive, HTTP-compliant)
- Produce *CI artifacts* (JUnit XML) for reporting and dashboard ingestion.
- Support *multi-project testing* (multiple targets/services) by organizing features by domain/project.

---

## Key Features

- *Reusable Steps + Helpers*
  - Shared request/response state stored in Behave context
  - Dedicated assertion steps with clear failure messages and request traceability (context.last_request)
- *Debugging Support*
  - Steps to print request headers / response JSON to speed up investigation
- *CI-ready*
  - Lint pipeline (Super-Linter)
  - Test pipeline (Behave) producing *JUnit XML*
  - Test run summary in GitHub via a reusable action (*dorny/test-reporter*)

---

---

## Requirements

- *Python 3.10+*
- Internet access (for httpbin sample tests)
- (Optional) Browser tooling if UI tests are added later (Selenium)

---

## Installation

### Windows (PowerShell)
```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt