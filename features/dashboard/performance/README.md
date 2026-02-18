# <div align="center">⚡ PERFORMANCE TESTING ENGINE</div>

<div align="center">
  <p><i>High-concurrency load intelligence and stochastic latency orchestration.</i></p>
</div>

---

Welcome to the **QA Hub Performance Tier**. We utilize **Locust**, a modern, distributed load testing framework, to ensure our intelligence backend maintains surgical precision under peak concurrency.

## 🏛️ Architectural Overview

The performance suite is designed to simulate realistic orchestration patterns and endpoint consumption. We prioritize the validation of both **Throughput Stability** and **Latency SLA Compliance**.

### Key Mission Objectives
- **Baseline Establishment**: Define the high-fidelity operational baseline for the Dashboard API.
- **Drift Detection**: Identify stochastic latency spikes and regression drifts before production manifestation.
- **Concurrency Verification**: Validate system stability during high-pressure user swarms.

---

## 🚀 Execution Protocol

Deploy the load intelligence engine across the service layer:

### Headless Orchestration (CI-Ready)
Recommended for automated pipelines and mission-critical verification:
```bash
locust -f features/dashboard/performance/locustfile.py --headless -u 10 -r 2 --run-time 1m --host http://localhost:3001
```

### Interactive Decision Center
For deep-dive telemetry analysis and real-time visualization:
```bash
locust -f features/dashboard/performance/locustfile.py --host http://localhost:3001
```
> [!NOTE]
> Access the Locust control panel at **[http://localhost:8089](http://localhost:8089)** for real-time signal diagnostics.

---

## 📊 Intelligence Collection & Awareness

Performance telemetry is automatically ingested and analyzed by the reporting tier:
- **Drift Awareness**: Real-time detection of performance degradation against established baselines.
- **Mermaid Visuals**: Dynamic generation of high-fidelity latency trend diagrams.
- **Asset Hub**: `reports/performance_run/`
- **Signal Processing**: Distribution data and aggregate statistics are exported for dashboard consumption.

---

## 🛠 Load Profile Calibration

Calibrate the `locustfile.py` to refine the stress signature:
- **Users (u)**: Total concurrent swarm magnitude.
- **Spawn Rate (r)**: Rate of user manifestation per second.
- **Task Weighting**: Orchestrate the frequency of specific endpoint interactions.

<br/>

<div align="center">
  <i>Throughput. Latency. Resilience.</i>
</div>

---

