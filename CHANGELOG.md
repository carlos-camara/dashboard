# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 🚀 Added
- **Dashboard**: New React 19 Frontend with real-time analytics.
- **Swagger Inspector**: "Beautiful" visualization for OpenAPI specs with Schema & Example viewer.
- **Node Backend**: Express server with SQLite integration for persisting test results.
- **SendGrid Mock**: High-fidelity local mock service for email testing.
- **Documentation**: Premium READMEs and Contributing guide.

### 🛠️ Changed
- **Architecture**: Migrated from simple XML reports to a database-driven reporting engine.
- **Reporting**: API and GUI tests now feed directly into `qa_hub.db`.

### 🐛 Fixed
- Fixed redundant API calls in `server.js`.
- Resolved path resolution issues for uploaded artifacts.
- Corrected absolute paths in various README files.
- **Testing**: Fixed `BAD_FORMAT=html` error by registering the HTML formatter in `behave.ini`.
- **Testing**: Resolved "undefined step" errors by implementing missing GUI and PDF verification steps.
- **Testing**: Fixed Locust performance test failure by adding the missing `--host` argument.
- **Testing**: Improved local test reliability by automating XML report seeding in `environment.py`.
- **Visuals**: Updated visual regression baselines to match the current UI version.
- **GUI**: Corrected `actions_export_button` selector and implemented dynamic date handling for report exports.

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
