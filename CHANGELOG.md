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

---

## [0.1.0] - 2024-03-15
### Initial Release
- Basic Behave framework setup.
- HTTPBin example tests.
