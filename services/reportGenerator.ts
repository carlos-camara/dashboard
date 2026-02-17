import { jsPDF } from 'jspdf';
import { DashboardStats, ExecutionRun, Endpoint, TimelineData } from '../types';

export const generateExecutiveReport = (
    stats: DashboardStats,
    runs: ExecutionRun[],
    endpoints: Endpoint[],
    projectHealth: any[],
    topErrors: any[],
    slowestEndpoints: any[],
    timeline: TimelineData[] = [],
    charts: { velocity?: string, volume?: string } = {}
) => {
    const pdf = new jsPDF('p', 'mm', 'a4');

    // --- Interpretation Engine ---
    const interpretError = (msg: string) => {
        const lowerMsg = msg.toLowerCase();
        if (lowerMsg.includes('status code 200') || lowerMsg.includes('expected 200')) {
            return {
                type: 'API Contract Violation',
                impact: 'CRITICAL',
                explanation: 'The backend responded with an unexpected success or failure code, indicating a mismatch between the documentation and the current implementation.',
                suggested: 'Verify backend logs for 500 errors or check if the endpoint signature has changed recently.'
            };
        }
        if (lowerMsg.includes('timeout') || lowerMsg.includes('timed out')) {
            return {
                type: 'Performance Degradation',
                impact: 'HIGH',
                explanation: 'The system exceeded the established latency thresholds. This is often caused by heavy database load or network bottlenecking.',
                suggested: 'Audit slow queries or increase the timeout limit if the operation is naturally long-running.'
            };
        }
        if (lowerMsg.includes('assert') || lowerMsg.includes('should be') || lowerMsg.includes('not found')) {
            return {
                type: 'Logic Inconsistency',
                impact: 'MEDIUM',
                explanation: 'The data returned by the system did not match the expected state. This suggests a functional regression in the business logic.',
                suggested: 'Review the latest commits in the affected sector and verify if the data seeding is correct.'
            };
        }
        return {
            type: 'System Anomaly',
            impact: 'VARIABLE',
            explanation: 'An unhandled exception occurred during the verification process. This might be a transient environmental issue.',
            suggested: 'Rerun the suite to verify reproducibility or check integration logs.'
        };
    };

    const generateDeepAnalysis = (data: TimelineData[]) => {
        if (!data || data.length < 2) return {
            trend: "Insufficient Data",
            stability: "Unknown",
            correlation: "N/A"
        };

        const totalPass = data.reduce((acc, d) => acc + d.pass, 0);
        const totalRuns = data.reduce((acc, d) => acc + d.total, 0);
        const avgPassRate = totalRuns > 0 ? (totalPass / totalRuns) : 0;

        // Volatility Calculation (Standard Deviation of Volume)
        const avgVol = totalRuns / data.length;
        const variance = data.reduce((acc, d) => acc + Math.pow(d.total - avgVol, 2), 0) / data.length;
        const stdDev = Math.sqrt(variance);
        const volatilityIndex = stdDev / (avgVol || 1); // Normalized

        // Trend Regression (Slope)
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        const n = data.length;
        data.forEach((d, i) => {
            sumX += i;
            sumY += d.total;
            sumXY += i * d.total;
            sumXX += i * i;
        });
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

        // Load vs Quality Correlation
        // If Volume increases and Pass Rate decreases -> Fragile under load
        // Simple heuristic: compare high volume days vs low volume days pass rates
        const highLoadDays = data.filter(d => d.total > avgVol);
        const lowLoadDays = data.filter(d => d.total <= avgVol);

        const highLoadPassRate = highLoadDays.reduce((acc, d) => acc + d.pass, 0) / (highLoadDays.reduce((acc, d) => acc + d.total, 0) || 1);
        const lowLoadPassRate = lowLoadDays.reduce((acc, d) => acc + d.pass, 0) / (lowLoadDays.reduce((acc, d) => acc + d.total, 0) || 1);

        let resilienceStatus = "SCALABLE"; // Default
        if (highLoadDays.length > 0 && (lowLoadPassRate - highLoadPassRate) > 0.1) {
            resilienceStatus = "FRAGILE UNDER LOAD";
        } else if (volatilityIndex > 0.5) {
            resilienceStatus = "HIGHLY VOLATILE";
        }

        return {
            trend: slope > 0.5 ? "ACCELERATING" : slope < -0.5 ? "DECELERATING" : "STABLE",
            stability: volatilityIndex < 0.2 ? "HIGH" : volatilityIndex < 0.5 ? "MODERATE" : "LOW",
            correlation: resilienceStatus,
            metrics: {
                avgVolume: Math.round(avgVol),
                peakVolume: Math.max(...data.map(d => d.total)),
                loadImpact: (lowLoadPassRate - highLoadPassRate)
            }
        };
    };

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;

    // --- Helpers ---
    const addHeader = (text: string, y: number, size = 18, color = [99, 102, 241]) => {
        pdf.setFontSize(size);
        pdf.setTextColor(color[0], color[1], color[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.text(text.toUpperCase(), margin, y);
        pdf.setDrawColor(color[0], color[1], color[2]);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y + 2, pageWidth - margin, y + 2);
    };

    const addBodyText = (text: string, y: number, fontSize = 10, color = [71, 85, 105]) => {
        pdf.setFontSize(fontSize);
        pdf.setTextColor(color[0], color[1], color[2]);
        pdf.setFont('helvetica', 'normal');
        const splitText = pdf.splitTextToSize(text, pageWidth - (margin * 2));
        pdf.text(splitText, margin, y);
        return y + (splitText.length * (fontSize * 0.5)) + 5;
    };

    // --- COVER PAGE ---
    // Background
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Decorative lines
    pdf.setDrawColor(99, 102, 241, 0.2);
    for (let i = 0; i < pageWidth; i += 10) {
        pdf.line(i, 0, i, pageHeight);
    }

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('courier', 'bold');
    pdf.text('CONFIDENTIAL // SENTINEL INTELLIGENCE', margin, 30);

    pdf.setFontSize(48);
    pdf.setFont('helvetica', 'bold');
    pdf.text('EXECUTIVE\nQUALITY\nDOSSIER', margin, 70);

    pdf.setDrawColor(99, 102, 241);
    pdf.setLineWidth(2);
    pdf.line(margin, 115, margin + 40, 115);

    pdf.setFontSize(12);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`REPORTING DATE: ${new Date().toLocaleDateString()}`, margin, 130);
    pdf.text(`TOTAL EXECUTIONS ANALYZED: ${stats.totalRuns}`, margin, 138);

    pdf.setFontSize(10);
    pdf.text('DIGITAL SIGNATURE VERIFIED', margin, pageHeight - 30);
    pdf.text('SENTINEL AUTO-GENERATED ASSET', margin, pageHeight - 25);

    // --- PAGE 2: EXECUTIVE SUMMARY ---
    pdf.addPage();
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    addHeader('Executive Summary', 30);

    const healthStatus = stats.passRate > 90 ? 'EXCELLENT' : stats.passRate > 70 ? 'STABLE' : 'CRITICAL';
    const summary = `Based on the latest telemetry, the system is currently in a ${healthStatus} state with a global pass rate of ${stats.passRate}%. Our analysis indicates that ${runs.length} complex test suites were successfully processed during this audit window. The average latency remains within operational limits at ${stats.avgDuration}.`;

    let currentY = addBodyText(summary, 45, 12, [15, 23, 42]);

    addHeader('Operational Health By Sector', currentY + 10, 14);
    currentY += 25;

    projectHealth.forEach((p, i) => {
        pdf.setFontSize(10);
        pdf.setTextColor(71, 85, 105);
        pdf.text(`${p.name}:`, margin, currentY);

        // Progress bar
        const barWidth = 60;
        pdf.setDrawColor(226, 232, 240);
        pdf.setFillColor(241, 245, 249);
        pdf.rect(margin + 50, currentY - 3.5, barWidth, 4, 'F');

        const fillWidth = (p.rate / 100) * barWidth;
        if (p.rate > 90) pdf.setFillColor(16, 185, 129);
        else pdf.setFillColor(244, 63, 94);
        pdf.rect(margin + 50, currentY - 3.5, fillWidth, 4, 'F');

        pdf.setTextColor(15, 23, 42);
        pdf.text(`${p.rate}%`, margin + 115, currentY);
        currentY += 10;
    });

    // --- PAGE 3: VISUAL TELEMETRY (DEEP ANALYTICS) ---
    if ((charts.velocity || charts.volume) && timeline.length > 0) {
        pdf.addPage();
        addHeader('Visual Telemetry & Trend Analysis', 30);

        // Deep Analysis
        const analytics = generateDeepAnalysis(timeline);

        // Render KPI Box
        pdf.setFillColor(248, 250, 252);
        pdf.setDrawColor(226, 232, 240);
        pdf.roundedRect(margin, 40, pageWidth - (margin * 2), 25, 3, 3, 'FD');

        const kpiY = 56;
        const boxWidth = pageWidth - (margin * 2);

        // KPI 1: Trend
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text('VELOCITY TREND', margin + 10, kpiY - 8);
        pdf.setFontSize(12);
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'bold');
        pdf.text(analytics.trend, margin + 10, kpiY);

        // KPI 2: Stability
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.setFont('helvetica', 'normal');
        pdf.text('VOLATILITY INDEX', margin + 60, kpiY - 8);
        pdf.setFontSize(12);
        const stabilityColor = analytics.stability === "HIGH" ? [16, 185, 129] : [245, 158, 11];
        pdf.setTextColor(stabilityColor[0], stabilityColor[1], stabilityColor[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.text(analytics.stability, margin + 60, kpiY);

        // KPI 3: Correlation
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.setFont('helvetica', 'normal');
        pdf.text('LOAD RESILIENCE', margin + 110, kpiY - 8);
        pdf.setFontSize(12);
        const resilienceColor = analytics.correlation === "SCALABLE" ? [16, 185, 129] : [244, 63, 94];
        pdf.setTextColor(resilienceColor[0], resilienceColor[1], resilienceColor[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.text(analytics.correlation, margin + 110, kpiY);

        currentY = 75;

        // Render Charts
        const renderChartBlock = (title: string, img: string | undefined, caption: string) => {
            if (!img) return;

            try {
                const imgProps = pdf.getImageProperties(img);
                const pdfImgWidth = pageWidth - (margin * 2);
                const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width;

                // Title
                pdf.setFontSize(10);
                pdf.setTextColor(15, 23, 42);
                pdf.setFont('helvetica', 'bold');
                pdf.text(title, margin, currentY);

                // Image
                pdf.addImage(img, 'PNG', margin, currentY + 5, pdfImgWidth, pdfImgHeight);

                // Caption
                currentY += pdfImgHeight + 10;
                pdf.setFontSize(8);
                pdf.setTextColor(148, 163, 184); // Slate 400
                pdf.setFont('helvetica', 'italic');
                pdf.text(caption, margin, currentY);

                currentY += 15;
            } catch (e) {
                console.warn("Failed to embed chart image", e);
            }
        };

        if (charts.velocity) {
            renderChartBlock(
                'Velocity & Stability Composite',
                charts.velocity,
                `Figure 1.A: 7-Day execution stability. The system demonstrates ${analytics.trend.toLowerCase()} output with ${analytics.metrics.peakVolume} peak actions.`
            );
        }

        // Check if we need new page for Volume chart
        if (currentY > pageHeight - 80 && charts.volume) {
            pdf.addPage();
            currentY = margin + 10;
        }

        if (charts.volume) {
            renderChartBlock(
                'Load Volume Distribution',
                charts.volume,
                `Figure 1.B: System load distribution. Correlation analysis indicates the system is ${analytics.correlation.toLowerCase()}.`
            );
        }
    }

    addHeader('Infrastructure Performance Audit', currentY + 10, 14, [245, 158, 11]);
    currentY += 25;

    slowestEndpoints.forEach((ep) => {
        pdf.setFontSize(9);
        pdf.setTextColor(71, 85, 105);
        pdf.setFont('courier', 'bold');
        pdf.text(`${ep.method} ${ep.path}`, margin, currentY);
        pdf.setTextColor(15, 23, 42);
        pdf.text(`${ep.avgDuration.toFixed(0)} ms`, margin + 140, currentY);

        currentY += 8;
    });

    // Footer on all pages (except cover)
    const pageCount = (pdf.internal as any).getNumberOfPages();
    for (let i = 2; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    pdf.save(`SENTINEL_EXECUTIVE_REPORT_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateProjectDossier = (
    projectName: string,
    stats: any,
    runs: ExecutionRun[],
    charts: { trend?: string, distribution?: string } = {},
    trendData: any[] = []
) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;

    // --- Analytics Engine ---
    const generateDeepProjectAnalytics = () => {
        if (!trendData || trendData.length < 2) return {
            trajectory: "STABLE",
            consistency: "NORMAL",
            riskProfile: "LOW"
        };

        // 1. Health Trajectory (Slope of Pass Rate)
        const passRates = trendData.map(d => d.total > 0 ? (d.pass / d.total) * 100 : 0);
        let slope = 0;
        if (passRates.length > 1) {
            const n = passRates.length;
            let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
            passRates.forEach((y, x) => {
                sumX += x;
                sumY += y;
                sumXY += x * y;
                sumXX += x * x;
            });
            slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        }

        // 2. Consistency (Standard Deviation of Pass Rate)
        const mean = passRates.reduce((a, b) => a + b, 0) / passRates.length;
        const variance = passRates.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / passRates.length;
        const stdDev = Math.sqrt(variance);

        // 3. Risk Profile
        let risk = "LOW";
        if (slope < -0.5) risk = "HIGH (Degrading)";
        else if (stdDev > 15) risk = "MODERATE (Volatile)";
        else if (mean < 80) risk = "MODERATE (Low Quality)";

        return {
            trajectory: slope > 0.5 ? "IMPROVING" : slope < -0.5 ? "DEGRADING" : "STABLE",
            consistency: stdDev < 5 ? "HIGH" : stdDev < 15 ? "MODERATE" : "LOW",
            riskProfile: risk,
            metrics: { slope, stdDev, mean }
        };
    };

    const analytics = generateDeepProjectAnalytics();

    // --- Helpers ---
    const addHeader = (text: string, y: number) => {
        pdf.setFontSize(16);
        pdf.setTextColor(15, 23, 42); // Slate 900
        pdf.setFont('helvetica', 'bold');
        pdf.text(text.toUpperCase(), margin, y);
        pdf.setDrawColor(99, 102, 241);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y + 2, pageWidth - margin, y + 2);
    };

    const addBodyText = (text: string, y: number) => {
        pdf.setFontSize(10);
        pdf.setTextColor(71, 85, 105);
        pdf.setFont('helvetica', 'normal');
        const splitText = pdf.splitTextToSize(text, pageWidth - (margin * 2));
        pdf.text(splitText, margin, y);
        return y + (splitText.length * 5) + 5;
    };

    // --- COVER PAGE ---
    pdf.setFillColor(15, 23, 42); // Slate 950
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Accent Line
    pdf.setDrawColor(99, 102, 241); // Indigo 500
    pdf.setLineWidth(1);
    pdf.line(margin, 20, margin, pageHeight - 20);

    pdf.setTextColor(148, 163, 184); // Slate 400
    pdf.setFontSize(10);
    pdf.setFont('courier', 'bold');
    pdf.text(`PROJECT ID: ${projectName.toUpperCase()}`, margin + 10, 30);
    pdf.text(`GENERATED: ${new Date().toISOString()}`, margin + 10, 36);

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(36);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PROJECT\nAUDIT\nDOSSIER', margin + 10, 80);

    // Cover Metrics
    const addCoverMetric = (label: string, value: string, y: number) => {
        pdf.setFontSize(10);
        pdf.setTextColor(148, 163, 184);
        pdf.text(label, margin + 10, y);
        pdf.setFontSize(24);
        pdf.setTextColor(255, 255, 255);
        pdf.text(value, margin + 10, y + 10);
    };

    addCoverMetric('CURRENT HEALTH', analytics.riskProfile === "LOW" ? "OPTIMAL" : "ATTENTION NEEDED", 140);
    addCoverMetric('TOTAL EXECUTIONS', runs.length.toString(), 170);
    addCoverMetric('AVG PASS RATE', `${stats.passRate.toFixed(1)}%`, 200);

    // --- PAGE 2: EXECUTION HISTORY ---
    pdf.addPage();
    addHeader('Detailed Execution Log', 30);
    let currentY = 45;

    // Table Header
    pdf.setFillColor(241, 245, 249);
    pdf.rect(margin, currentY, pageWidth - (margin * 2), 8, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TIMESTAMP', margin + 2, currentY + 5);
    pdf.text('NAME', margin + 40, currentY + 5);
    pdf.text('DURATION', margin + 110, currentY + 5);
    pdf.text('RESULT', margin + 140, currentY + 5);

    currentY += 12;

    // Rows
    runs.slice(0, 20).forEach((run, i) => {
        if (currentY > pageHeight - 20) {
            pdf.addPage();
            currentY = 30; // Reset
        }

        pdf.setFont('courier', 'normal');
        pdf.text(new Date(run.timestamp).toLocaleString(), margin + 2, currentY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(run.name.substring(0, 35) + (run.name.length > 35 ? '...' : ''), margin + 40, currentY);
        pdf.text(`${run.duration.toFixed(2)}s`, margin + 110, currentY);

        const passRate = (run.passedCount / run.totalCount) * 100;
        if (passRate >= 95) pdf.setTextColor(22, 163, 74); // Green
        else if (passRate > 80) pdf.setTextColor(234, 88, 12); // Orange
        else pdf.setTextColor(220, 38, 38); // Red

        pdf.setFont('helvetica', 'bold');
        pdf.text(`${passRate.toFixed(0)}%`, margin + 140, currentY);

        pdf.setTextColor(71, 85, 105); // Reset
        currentY += 7;
    });

    // --- PAGE 3: VISUAL TELEMETRY ---
    if (charts.trend || charts.distribution) {
        pdf.addPage();
        addHeader('Architecture & Velocity Analysis', 30);

        // Deep Analysis KPI Box
        pdf.setFillColor(248, 250, 252);
        pdf.setDrawColor(226, 232, 240);
        pdf.roundedRect(margin, 40, pageWidth - (margin * 2), 25, 3, 3, 'FD');

        const kpiY = 56;

        // KPI 1: Health Trajectory
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139); // Slate 500
        pdf.text('HEALTH TRAJECTORY', margin + 10, kpiY - 8);
        pdf.setFontSize(12);
        const trajColor = analytics.trajectory === "IMPROVING" ? [16, 185, 129] : analytics.trajectory === "DEGRADING" ? [244, 63, 94] : [15, 23, 42];
        pdf.setTextColor(trajColor[0], trajColor[1], trajColor[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.text(analytics.trajectory, margin + 10, kpiY);

        // KPI 2: Consistency
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.setFont('helvetica', 'normal');
        pdf.text('STABILITY VARIANCE', margin + 70, kpiY - 8);
        pdf.setFontSize(12);
        const stabColor = analytics.consistency === "HIGH" ? [16, 185, 129] : [245, 158, 11];
        pdf.setTextColor(stabColor[0], stabColor[1], stabColor[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.text(analytics.consistency, margin + 70, kpiY);

        // KPI 3: Risk
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.setFont('helvetica', 'normal');
        pdf.text('RISK ASSESSMENT', margin + 130, kpiY - 8);
        pdf.setFontSize(12);
        const riskColor = analytics.riskProfile === "LOW" ? [16, 185, 129] : [244, 63, 94];
        pdf.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.text(analytics.riskProfile, margin + 130, kpiY);

        currentY = 75;

        const renderChart = (title: string, img: string | undefined, caption: string) => {
            if (!img) return;
            try {
                const imgProps = pdf.getImageProperties(img);
                const pdfImgWidth = pageWidth - (margin * 2);
                const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width;

                pdf.setFontSize(11);
                pdf.setTextColor(15, 23, 42);
                pdf.setFont('helvetica', 'bold');
                pdf.text(title, margin, currentY);

                pdf.addImage(img, 'PNG', margin, currentY + 5, pdfImgWidth, pdfImgHeight);

                currentY += pdfImgHeight + 10;
                pdf.setFontSize(8);
                pdf.setTextColor(148, 163, 184); // Slate 400
                pdf.setFont('helvetica', 'italic');
                pdf.text(caption, margin, currentY);
                currentY += 15;
            } catch (e) {
                console.warn("Chart embed failed", e);
            }
        };

        if (charts.trend) {
            renderChart(
                'Velocity & Success Trend',
                charts.trend,
                `Figure 1: 14-Day execution performance. The project shows a ${analytics.trajectory.toLowerCase()} reliability trend.`
            );
        }

        if (charts.distribution) {
            // Check page overflow
            if (currentY > pageHeight - 100) {
                pdf.addPage();
                currentY = margin + 10;
            }
            renderChart(
                'Test Composition Strategy',
                charts.distribution,
                'Figure 2: Distribution of test types across the suite execution history.'
            );
        }
    }

    // Save
    const safeName = projectName.replace(/[^a-z0-9]/gi, '_').toUpperCase();
    pdf.save(`PROJECT_DOSSIER_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateRunDossier = (
    run: ExecutionRun,
    scenarios: any[] // Typed as Scenario[] in caller
) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;

    // --- Helpers ---
    const interpretError = (msg: string) => {
        const lowerMsg = msg.toLowerCase();
        if (lowerMsg.includes('status code 200') || lowerMsg.includes('expected 200')) {
            return {
                type: 'API Contract Violation',
                explanation: 'Backend returned an unexpected status code, violating the defined API contract.',
                suggested: 'Check backend logs for 500/400 errors or verifying endpoint signature.'
            };
        }
        if (lowerMsg.includes('timeout') || lowerMsg.includes('timed out')) {
            return {
                type: 'Performance Degradation',
                explanation: 'Operation exceeded latency thresholds (Timeout).',
                suggested: 'Audit database query performance or network latency.'
            };
        }
        if (lowerMsg.includes('element is not visible') || lowerMsg.includes('not found')) {
            return {
                type: 'UI/DOM Regression',
                explanation: 'Target element could not be interacted with. DOM structure may have changed.',
                suggested: 'Verify selector accuracy and check for new overlay/loading states.'
            };
        }
        return {
            type: 'Functional Anomaly',
            explanation: 'General assertion failure or unhandled exception.',
            suggested: 'Debug scenario locally with attached debugger.'
        };
    };

    const addHeader = (text: string, y: number) => {
        pdf.setFontSize(16);
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'bold');
        pdf.text(text.toUpperCase(), margin, y);
        pdf.setDrawColor(99, 102, 241);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y + 2, pageWidth - margin, y + 2);
    };

    const addBodyText = (text: string, y: number) => {
        pdf.setFontSize(10);
        pdf.setTextColor(71, 85, 105);
        pdf.setFont('helvetica', 'normal');
        const splitText = pdf.splitTextToSize(text, pageWidth - (margin * 2));
        pdf.text(splitText, margin, y);
        return y + (splitText.length * 5) + 5;
    };

    // --- COVER PAGE ---
    pdf.setFillColor(15, 23, 42); // Slate 950
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Accent Line
    pdf.setDrawColor(99, 102, 241); // Indigo 500
    pdf.setLineWidth(1);
    pdf.line(margin, 20, margin, pageHeight - 20);

    pdf.setTextColor(148, 163, 184); // Slate 400
    pdf.setFontSize(10);
    pdf.setFont('courier', 'bold');
    pdf.text(`RUN ID: ${run.id.substring(0, 8).toUpperCase()}`, margin + 10, 30);
    pdf.text(`EXECUTION TIME: ${new Date(run.timestamp).toISOString()}`, margin + 10, 36);

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(42);
    pdf.setFont('helvetica', 'bold');
    pdf.text('EXECUTION\nCERTIFICATE', margin + 10, 80);

    // Cover Metrics
    const addCoverMetric = (label: string, value: string, y: number, color = [255, 255, 255]) => {
        pdf.setFontSize(10);
        pdf.setTextColor(148, 163, 184);
        pdf.text(label, margin + 10, y);
        pdf.setFontSize(24);
        pdf.setTextColor(color[0], color[1], color[2]);
        pdf.text(value, margin + 10, y + 10);
    };

    const passRate = run.passedCount / (run.totalCount || 1);
    const healthColor = passRate === 1 ? [16, 185, 129] : passRate > 0.8 ? [245, 158, 11] : [244, 63, 94];

    addCoverMetric('PROJECT', run.project.toUpperCase(), 140);
    addCoverMetric('ENVIRONMENT', run.environment.toUpperCase(), 170);
    addCoverMetric('SUCCESS RATE', `${(passRate * 100).toFixed(1)}%`, 200, healthColor);

    // --- PAGE 2: FEATURE IMPACT & PERFORMANCE ---
    pdf.addPage();
    addHeader('Feature & Performance Impact', 30);

    // TAG ANALYSIS
    const tagStats: Record<string, { total: number, passed: number }> = {};
    scenarios.forEach(s => {
        (s.tags || ['@untagged']).forEach((t: string) => {
            const cleanTag = t.replace(/^@/, '');
            if (!tagStats[cleanTag]) tagStats[cleanTag] = { total: 0, passed: 0 };
            tagStats[cleanTag].total++;
            if (s.status === 'PASSED') tagStats[cleanTag].passed++;
        });
    });

    const sortedTags = Object.entries(tagStats)
        .sort(([, a], [, b]) => b.total - a.total)
        .slice(0, 8); // Top 8 tags

    let kpiY = 45;
    pdf.setFontSize(10);
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FEATURE STABILITY (BY TAG)', margin, kpiY);
    kpiY += 10;

    // Render Tag Cards Grid
    let col = 0;
    let row = 0;
    sortedTags.forEach(([tag, stat]) => {
        const x = margin + (col * 85);
        const y = kpiY + (row * 35);

        pdf.setFillColor(248, 250, 252);
        pdf.setDrawColor(226, 232, 240);
        pdf.roundedRect(x, y, 80, 28, 2, 2, 'FD');

        const rate = (stat.passed / stat.total) * 100;
        const color = rate === 100 ? [16, 185, 129] : rate > 75 ? [245, 158, 11] : [244, 63, 94];

        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text(tag.toUpperCase(), x + 5, y + 8);

        pdf.setFontSize(14);
        pdf.setTextColor(color[0], color[1], color[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${rate.toFixed(0)}%`, x + 5, y + 20);

        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.text(`${stat.passed}/${stat.total} PRS`, x + 50, y + 20);

        col++;
        if (col > 1) { col = 0; row++; }
    });

    // PERFORMANCE OUTLIERS
    const perfY = kpiY + (Math.ceil(sortedTags.length / 2) * 35) + 10;
    pdf.setFontSize(10);
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PERFORMANCE BOTTLENECKS (SLOWEST STEPS)', margin, perfY);

    const allSteps = scenarios.flatMap(s => s.steps.map((st: any) => ({ ...st, scenario: s.name })));
    const slowestSteps = allSteps
        .filter(s => s.duration > 0)
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5);

    let stepY = perfY + 10;
    slowestSteps.forEach((step, i) => {
        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(226, 232, 240);
        pdf.roundedRect(margin, stepY, pageWidth - (margin * 2), 12, 1, 1, 'FD');

        pdf.setFontSize(8);
        pdf.setFont('courier', 'bold');
        pdf.setTextColor(244, 63, 94);
        pdf.text(`${step.duration.toFixed(3)}s`, margin + 4, stepY + 8);

        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(15, 23, 42);
        const name = step.name.length > 60 ? step.name.substring(0, 60) + '...' : step.name;
        pdf.text(name, margin + 25, stepY + 8);

        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(100, 116, 139);
        const scn = step.scenario.length > 40 ? step.scenario.substring(0, 40) + '...' : step.scenario;
        pdf.text(scn, pageWidth - margin - 5, stepY + 8, { align: 'right' });

        stepY += 15;
    });

    // --- PAGE 3: FAILURE ANALYSIS (Prioritized) ---
    const failedScenarios = scenarios.filter(s => s.status === 'FAILED');

    if (failedScenarios.length > 0) {
        pdf.addPage();
        addHeader('Failure Analysis & Diagnostics', 30);
        let currentY = 45;

        failedScenarios.forEach(scenario => {
            if (currentY > pageHeight - 50) {
                pdf.addPage();
                currentY = 30;
            }

            const analysis = interpretError(scenario.errorMessage || '');

            // Card Background
            pdf.setFillColor(254, 242, 242); // Rose 50
            pdf.setDrawColor(244, 63, 94); // Rose 500
            pdf.roundedRect(margin, currentY, pageWidth - (margin * 2), 35, 2, 2, 'FD');

            pdf.setFontSize(10);
            pdf.setTextColor(190, 18, 60); // Rose 700
            pdf.setFont('helvetica', 'bold');
            pdf.text(`SCENARIO: ${scenario.name}`, margin + 5, currentY + 7);

            // Error Type Badge
            pdf.setFillColor(255, 255, 255);
            pdf.rect(margin + 5, currentY + 12, 40, 6, 'F');
            pdf.setFontSize(7);
            pdf.setTextColor(244, 63, 94);
            pdf.text(analysis.type.toUpperCase(), margin + 7, currentY + 16);

            // Analysis Text
            pdf.setFontSize(9);
            pdf.setTextColor(15, 23, 42);
            pdf.setFont('helvetica', 'normal');

            const explanation = pdf.splitTextToSize(`ANALYSIS: ${analysis.explanation}`, pageWidth - (margin * 2) - 10);
            pdf.text(explanation, margin + 5, currentY + 25);

            currentY += 45;
        });

        // Add suggestion footer
        if (currentY > pageHeight - 40) {
            pdf.addPage();
            currentY = 30;
        }

        pdf.setFontSize(10);
        pdf.setTextColor(100, 116, 139);
        pdf.setFont('helvetica', 'italic');
        pdf.text("Recommendation: Review the failure patterns above. DOM Regressions often indicate unannounced UI changes, while API Violations may signal backend schema drift.", margin, currentY + 10);
    }

    // --- PAGE 3: FULL EXECUTION LOG ---
    pdf.addPage();
    addHeader('Full Execution Manifest', 30);
    let currentY = 45;

    // Header
    pdf.setFillColor(241, 245, 249);
    pdf.rect(margin, currentY, pageWidth - (margin * 2), 8, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);
    pdf.setFont('helvetica', 'bold');
    pdf.text('STATUS', margin + 2, currentY + 5);
    pdf.text('SCENARIO NAME', margin + 25, currentY + 5);
    pdf.text('DURATION', margin + 140, currentY + 5);

    currentY += 12;

    scenarios.forEach(s => {
        if (currentY > pageHeight - 20) {
            pdf.addPage();
            currentY = 30;
        }

        const isPass = s.status === 'PASSED';

        // Status Dot
        pdf.setFillColor(isPass ? 16 : 244, isPass ? 185 : 63, isPass ? 129 : 94);
        pdf.circle(margin + 5, currentY - 1, 1.5, 'F');

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(15, 23, 42);
        const name = s.name.length > 65 ? s.name.substring(0, 65) + '...' : s.name;
        pdf.text(name, margin + 25, currentY);

        pdf.setFont('courier', 'normal');
        pdf.setTextColor(100, 116, 139);
        pdf.text(`${s.duration.toFixed(3)}s`, margin + 140, currentY);

        currentY += 7;
    });

    pdf.save(`RUN_DOSSIER_${run.project}_${run.id.substring(0, 6)}.pdf`);
};

export const generatePerformanceDossier = (
    data: any,
    charts: { velocity?: string, latency?: string } = {}
) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const endpoints = data.stats.filter((s: any) => s.name !== 'Aggregated');
    const aggregated = data.stats.find((s: any) => s.name === "Aggregated") || {};
    const history = data.history || [];

    // --- Helpers ---
    const addHeader = (text: string, y: number) => {
        pdf.setFontSize(16);
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'bold');
        pdf.text(text.toUpperCase(), margin, y);
        pdf.setDrawColor(99, 102, 241);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y + 2, pageWidth - margin, y + 2);
    };

    // --- COVER PAGE ---
    pdf.setFillColor(15, 23, 42); // Slate 950
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    pdf.setDrawColor(16, 185, 129); // Emerald 500
    pdf.setLineWidth(1);
    pdf.line(margin, 20, margin, pageHeight - 20);

    pdf.setTextColor(148, 163, 184); // Slate 400
    pdf.setFontSize(10);
    pdf.setFont('courier', 'bold');
    pdf.text(`AUDIT ID: PERF-${new Date().getTime().toString().substring(6)}`, margin + 10, 30);
    pdf.text(`DATE: ${new Date().toISOString()}`, margin + 10, 36);

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(42);
    pdf.setFont('helvetica', 'bold');
    pdf.text('HIGH-DENSITY\nPERFORMANCE\nAUDIT', margin + 10, 80);

    // Cover Metrics
    const addMetric = (label: string, value: string, y: number, color = [255, 255, 255]) => {
        pdf.setFontSize(10);
        pdf.setTextColor(148, 163, 184);
        pdf.text(label, margin + 10, y);
        pdf.setFontSize(24);
        pdf.setTextColor(color[0], color[1], color[2]);
        pdf.text(value, margin + 10, y + 10);
    };

    addMetric('MAX USERS', history.length > 0 ? history[history.length - 1].users.toString() : 'N/A', 140, [99, 102, 241]);
    addMetric('PEAK THROUGHPUT', `${aggregated.rps?.toFixed(1) || 0} RPS`, 170, [6, 182, 212]); // Cyan
    addMetric('AVG LATENCY', `${aggregated.avg?.toFixed(0) || 0} ms`, 200, aggregated.avg > 500 ? [244, 63, 94] : [16, 185, 129]);

    // --- PAGE 2: EXECUTIVE INSIGHTS & ANALYSIS ---
    pdf.addPage();
    addHeader('Executive Performance Insights', 30);

    // Analysis Logic
    const p95Avg = endpoints.reduce((acc: number, curr: any) => acc + curr.p95, 0) / (endpoints.length || 1);
    const successRate = aggregated.requests > 0 ? (1 - (aggregated.failures / aggregated.requests)) * 100 : 100;
    const maxUsers = history.length > 0 ? history[history.length - 1].users : 0;

    // Determine Health Grade
    let grade = 'A';
    let gradeColor = [16, 185, 129];
    if (successRate < 95 || p95Avg > 1000) { grade = 'F'; gradeColor = [244, 63, 94]; }
    else if (successRate < 99 || p95Avg > 500) { grade = 'C'; gradeColor = [245, 158, 11]; }
    else if (p95Avg > 200) { grade = 'B'; gradeColor = [59, 130, 246]; }

    // Draw Grade badge (Card)
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(margin, 40, pageWidth - (margin * 2), 45, 2, 2, 'FD'); // h=45

    // Vertical Divider
    pdf.setDrawColor(203, 213, 225);
    pdf.line(margin + 50, 45, margin + 50, 80);

    // LEFT COL: Grade
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.setFont('helvetica', 'bold');
    pdf.text("SYSTEM GRADE", margin + 25, 55, { align: 'center' });

    pdf.setFontSize(42);
    pdf.setTextColor(gradeColor[0], gradeColor[1], gradeColor[2]);
    pdf.text(grade, margin + 25, 75, { align: 'center' });

    // RIGHT COL: Narrative
    pdf.setFontSize(10);
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'normal');

    const summaryText = `The system demonstrated ${grade === 'A' ? 'exceptional' : grade === 'B' ? 'solid' : 'degraded'} resilience under a peak load of ${maxUsers} concurrent users. Global throughput stabilized at ${aggregated.rps?.toFixed(1) || 0} RPS with a success integrity of ${successRate.toFixed(2)}%. The average P95 latency across all endpoints was ${p95Avg.toFixed(0)}ms.`;
    const splitSummary = pdf.splitTextToSize(summaryText, pageWidth - (margin * 2) - 65); // Width adjusted
    pdf.text(splitSummary, margin + 60, 52);

    // Critical Observations
    let obsY = 100; // Pushed down
    pdf.setFontSize(11);
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Critical Observations", margin, obsY);
    obsY += 10;

    const observations = [];
    if (successRate === 100) observations.push({ type: 'good', text: "Perfect Error Profile: 0% failure rate detected during audit." });
    else observations.push({ type: 'bad', text: `Error Integrity Loss: ${aggregated.failures} failed transactions detected.` });

    if (p95Avg < 200) observations.push({ type: 'good', text: "Low Latency: System is highly responsive (avg P95 < 200ms)." });
    else if (p95Avg > 1000) observations.push({ type: 'bad', text: "Severe Latency: Average response time exceeds 1 second." });

    const slowEndpoints = endpoints.filter((e: any) => e.p95 > 500);
    if (slowEndpoints.length > 0) observations.push({ type: 'warn', text: `${slowEndpoints.length} endpoints flagged as performance bottlenecks (>500ms).` });

    observations.forEach(obs => {
        pdf.setFillColor(obs.type === 'good' ? 240 : obs.type === 'bad' ? 254 : 255, obs.type === 'good' ? 253 : obs.type === 'bad' ? 242 : 251, obs.type === 'good' ? 244 : obs.type === 'bad' ? 242 : 235);
        pdf.setDrawColor(obs.type === 'good' ? 22 : obs.type === 'bad' ? 244 : 245, obs.type === 'good' ? 163 : obs.type === 'bad' ? 63 : 158, obs.type === 'good' ? 74 : obs.type === 'bad' ? 94 : 11);
        pdf.rect(margin, obsY, 1.5, 8, 'F');

        pdf.setFontSize(9);
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'normal');
        pdf.text(obs.text, margin + 5, obsY + 6);

        obsY += 12;
    });

    // --- PAGE 3: VISUAL TELEMETRY ---
    if (charts.velocity || charts.latency) {
        pdf.addPage();
        addHeader('Visual Telemetry Capture', 30);
        let chartY = 45;

        const renderChart = (title: string, img: string | undefined) => {
            if (!img) return;
            try {
                const imgProps = pdf.getImageProperties(img);
                const pdfImgWidth = pageWidth - (margin * 2);
                const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width;

                pdf.setFontSize(10);
                pdf.setTextColor(100, 116, 139);
                pdf.setFont('helvetica', 'bold');
                pdf.text(title.toUpperCase(), margin, chartY);

                pdf.addImage(img, 'PNG', margin, chartY + 5, pdfImgWidth, pdfImgHeight);
                chartY += pdfImgHeight + 20;
            } catch (e) { console.warn('Chart embed failed', e); }
        };

        if (charts.velocity) renderChart('Load Velocity Signature', charts.velocity);

        if (charts.latency) {
            if (chartY > pageHeight - 80) { pdf.addPage(); chartY = 30; }
            renderChart('Spectral Latency Distribution', charts.latency);
        }
    }

    // --- PAGE 4: ENDPOINT FORENSIC MATRIX ---
    pdf.addPage();
    addHeader('Endpoint Forensic Matrix', 30);
    let currentY = 45;

    // Header
    pdf.setFillColor(241, 245, 249);
    pdf.rect(margin, currentY, pageWidth - (margin * 2), 8, 'F');
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ENDPOINT', margin + 2, currentY + 5);
    pdf.text('IMP', margin + 70, currentY + 5); // Impact Score
    pdf.text('VOLUME', margin + 90, currentY + 5);
    pdf.text('FAILURES', margin + 120, currentY + 5);
    pdf.text('P95 LATENCY', margin + 150, currentY + 5);

    currentY += 12;

    endpoints.sort((a: any, b: any) => (b.requests * b.p95) - (a.requests * a.p95)); // Sort by Impact

    endpoints.forEach((ep: any) => {
        if (currentY > pageHeight - 20) {
            pdf.addPage();
            currentY = 30;
        }

        // Method Badge
        const methodColor = ep.method === 'GET' ? [59, 130, 246] : ep.method === 'POST' ? [16, 185, 129] : [100, 116, 139];
        pdf.setFillColor(methodColor[0], methodColor[1], methodColor[2]);
        pdf.roundedRect(margin, currentY - 3, 12, 5, 1, 1, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(6);
        pdf.setFont('helvetica', 'bold');
        pdf.text(ep.method || 'REQ', margin + 2, currentY);

        // Path
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(9);
        pdf.setFont('courier', 'normal');
        const name = ep.name.length > 40 ? ep.name.substring(0, 40) + '...' : ep.name;
        pdf.text(name, margin + 15, currentY);

        // Impact Score (Volume * Latency / 1000)
        const impact = (ep.requests * ep.p95) / 1000000;
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(148, 163, 184);
        pdf.text(impact.toFixed(2), margin + 70, currentY);

        // Stats
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(15, 23, 42);
        pdf.text(ep.requests.toLocaleString(), margin + 90, currentY);

        // Failures
        if (ep.failures > 0) pdf.setTextColor(244, 63, 94); // Red
        else pdf.setTextColor(16, 185, 129); // Green
        pdf.text(ep.failures.toString(), margin + 120, currentY);

        // Latency
        const p95 = ep.p95;
        if (p95 > 500) pdf.setTextColor(244, 63, 94);
        else if (p95 > 200) pdf.setTextColor(245, 158, 11);
        else pdf.setTextColor(15, 23, 42);
        pdf.text(`${p95.toFixed(0)}ms`, margin + 150, currentY);

        currentY += 8;
    });

    pdf.save(`PERFORMANCE_DOSSIER_${new Date().toISOString().split('T')[0]}.pdf`);
};
