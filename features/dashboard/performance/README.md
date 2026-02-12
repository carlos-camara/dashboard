# ⚡ Performance Testing Engine

Welcome to the **QA Hub Performance Layer**. We utilize **Locust**, a modern, distributed load testing framework, to ensure our services maintain surgical precision under high-concurrency environments.

## 🏗 Overview

The performance suite is designed to simulate realistic user behavior and endpoint consumption. It validates both **throughput stability** and **latency SLAs**.

### Key Objective
- Establish a performance baseline for the Dashboard API.
- Detect regression spikes and latency drifts.
- Validate system behavior under concurrent load.

---

## 🚀 Execution

### Headless (CI Mode)
Recommended for automated pipelines and quick verification:
```bash
locust -f features/dashboard/performance/locustfile.py --headless -u 10 -r 2 --run-time 1m --host http://localhost:3001
```

### Interactive Web UI
For deep-dive analysis and real-time visualization:
```bash
locust -f features/dashboard/performance/locustfile.py --host http://localhost:3001
```
> [!NOTE]
> Access the Locust control panel at **[http://localhost:8089](http://localhost:8089)**.

---

## 📊 Metric Collection & Intelligence

The performance results are automatically captured and analyzed:
- **Drift Awareness**: Automatic detection of performance degradation vs. technical baselines.
- **Mermaid Visualization**: Dynamic generation of latency trend diagrams in reports.
- **Location**: `reports/performance_run/`
- **Output**: JSON distribution data and aggregate statistics.
- **Reporting**: Performance trends are embedded into the **QA Command Center** dashboard for historical analysis.

---

## 🛠 Load Profile Configuration

Modify `locustfile.py` to adjust:
- **Users (u)**: Total concurrent swarm size.
- **Spawn Rate (r)**: Users added per second.
- **Tasks**: Weighting of specific endpoint interactions.

---

