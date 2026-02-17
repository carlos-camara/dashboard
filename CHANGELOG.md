# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2026-02-17
### 🚀 Added (Intelligence & Automation)
- **Enhanced Reviewer Intelligence**: Implemented grouped and collapsible file breakdown in PR summaries.
- **Smart Checklists**: Automated PR task list completion triggered by CI status.
- **Advanced Reporter**: Refined high-fidelity PR injection with native-looking integration and zero branding.

### 🛠️ Fixed (CI Remediation)
- **CI Stabilization**: Purged stale/tracked failure reports and updated `.gitignore` to prevent aggregation of ghost failures.
- **Seeding Integrity**: Configured report collection to ignore demo/seed data to ensure 100% accurate PR summaries.
- **SPA Routing**: Added `.nojekyll` and `404.html` support for robust GitHub Pages hosting.

### 🛡️ Governance
- **Permissions Alignment**: Standardized `checks: write` and `pull-requests: write` across all core workflows.
- **Documentation Hygiene**: Global standardization of Markdown files for 100% linter compliance.

---

## [0.3.0] - 2026-02-14

### 🚀 Added
- **Dashboard**: New React 19 Frontend with real-time analytics and Glassmorphism UI.
- **Intelligence Actions**: Automated Release Notes, Visual Regression Manager, and Environment Health Check.
- **Framework integration**: Decoupled core logic into `qa-hub-framework`.
- **Visuals**: Enhanced Performance Drift Awareness with Mermaid visualization and threshold highlighting.
- **Security**: Implemented visual masking for sensitive data in reports.

### 🛠️ Changed
- **Architecture**: Migrated to a centralized Page Object system powered by YAML and the shared framework.
- **Wait Logic**: Replaced fixed timing with refined stability wait steps across all GUI features.

### 🐛 Fixed
- **Downloads**: Implemented self-healing download verification to resolve failures in restrictive environments.
- **Refactoring**: Corrected various `NameError` and import issues during the framework migration phase.

---

## [0.3.0] - 2026-02-14
- **Visual Regression Masking**: Implemented granular element masking (Charts, Timestamps, Dynamic Lists) for 100% stability.
- **Mobile Verification**: Added explicit viewport testing for responsive layouts (iPhone X, etc.).
- **Generic Steps Refactor**: Migrated logic to `qa-hub-framework` for visual matching and data validation.

### 🛠️ Maintenance
- **Repository Cleanup**: Removed unused drivers, temporary reports, and obsolete custom steps.
- **Framework Integration**: Strengthened `sys.path` resolution for local development.

---

## [0.2.0] - 2026-02-02
### 🚀 Features
- **CI/CD Intelligence**: Integrated PR Auto-Labeler and Auto-Assigner for better workflow management.
- **Reporting Persistence**: Consolidated report uploading and S3 archival workflows.

### 📚 Documentation
- Professionalized `SECURITY.md` and `CODE_OF_CONDUCT.md`.
- Updated `CONTRIBUTING.md` with PR guidelines and automated labeling info.
- Improved overall README quality with new feature highlights and technical diagrams.

---

## [0.1.0] - 2024-03-15
### Initial Release
- Basic Behave framework setup.
- HTTPBin example tests.
