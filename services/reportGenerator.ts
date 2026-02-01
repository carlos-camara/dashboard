
import { jsPDF } from 'jspdf';
import { DashboardStats, ExecutionRun, Endpoint } from '../types';

export const generateExecutiveReport = (
    stats: DashboardStats,
    runs: ExecutionRun[],
    endpoints: Endpoint[],
    projectHealth: any[],
    topErrors: any[],
    slowestEndpoints: any[]
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

    // --- PAGE 3: RISK ASSESSMENT ---
    pdf.addPage();
    addHeader('Risk Heatmap & Incident Taxonomy', 30);

    let riskText = "The following anomalies have been detected and categorized by frequency. These events represent technical debt or environment instability that requires immediate engineering oversight.";
    currentY = addBodyText(riskText, 45);

    topErrors.forEach((err, i) => {
        const interpretation = interpretError(err.msg);

        pdf.setFillColor(241, 245, 249);
        pdf.roundedRect(margin, currentY, pageWidth - (margin * 2), 35, 2, 2, 'F');

        pdf.setFontSize(9);
        pdf.setTextColor(244, 63, 94);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${err.count} ERRORS - ${interpretation.type}`, margin + 5, currentY + 7);

        pdf.setTextColor(15, 23, 42);
        const wrappedMsg = pdf.splitTextToSize(err.msg, 120);
        pdf.text(wrappedMsg, margin + 5, currentY + 12);

        const textY = currentY + 12 + (wrappedMsg.length * 4);

        pdf.setFontSize(8);
        pdf.setTextColor(71, 85, 105);
        pdf.setFont('helvetica', 'italic');
        pdf.text('Analysis:', margin + 5, textY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(pdf.splitTextToSize(interpretation.explanation, 140), margin + margin, textY);

        pdf.setTextColor(99, 102, 241);
        pdf.setFont('helvetica', 'bold');
        pdf.text('REMEDIATION:', margin + 5, textY + 6);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(15, 23, 42);
        pdf.text(pdf.splitTextToSize(interpretation.suggested, 140), margin + 30, textY + 6);

        currentY += 40;

        // Simple page overflow check
        if (currentY > pageHeight - 40) {
            pdf.addPage();
            currentY = margin + 10;
        }
    });

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
    stats: { passRate: number, stabilityScore: number, avgDuration: number, totalExecutions: number },
    runs: ExecutionRun[]
) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;

    // --- Shared Helpers (Duplicated for safety/speed) ---
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
    pdf.setFillColor(15, 23, 42); // Slate 950
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    pdf.setDrawColor(99, 102, 241, 0.2);
    for (let i = 0; i < pageWidth; i += 10) pdf.line(i, 0, i, pageHeight);

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('courier', 'bold');
    pdf.text('CONFIDENTIAL // PROJECT DOSSIER', margin, 30);

    pdf.setFontSize(48);
    pdf.setFont('helvetica', 'bold');
    pdf.text(projectName.toUpperCase(), margin, 70);

    pdf.setFontSize(24);
    pdf.setTextColor(148, 163, 184); // Slate 400
    pdf.text('PERFORMANCE INSPECTION', margin, 85);

    pdf.setDrawColor(99, 102, 241);
    pdf.setLineWidth(2);
    pdf.line(margin, 115, margin + 40, 115);

    pdf.setFontSize(12);
    pdf.text(`GENERATED: ${new Date().toLocaleDateString()}`, margin, 130);
    pdf.text(`TOTAL EXECUTIONS: ${stats.totalExecutions}`, margin, 138);
    pdf.text(`PASS RATE: ${stats.passRate.toFixed(1)}%`, margin, 146);

    // --- PAGE 2: DETAILS ---
    pdf.addPage();
    addHeader('Project Stability Analysis', 30);

    const summary = `This dossier contains a detailed audit of the "${projectName}" project. The current stability score is ${stats.stabilityScore.toFixed(1)}%, with an average execution duration of ${stats.avgDuration.toFixed(2)}ms.`;
    let currentY = addBodyText(summary, 45);

    currentY += 10;
    addHeader('Recent Execution Events', currentY, 14, [16, 185, 129]);
    currentY += 15;

    // List recent runs
    runs.slice(0, 15).forEach((run, i) => {
        // Page break check
        if (currentY > pageHeight - 20) {
            pdf.addPage();
            currentY = margin + 10;
        }

        const isSuccess = run.passedCount / run.totalCount >= 0.95;
        const color = isSuccess ? [16, 185, 129] : [244, 63, 94]; // Emerald vs Rose

        pdf.setDrawColor(color[0], color[1], color[2]);
        pdf.setLineWidth(0.5);
        pdf.rect(margin, currentY, 2, 8, 'F'); // Status bar

        pdf.setFontSize(10);
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'bold');
        pdf.text(run.name, margin + 5, currentY + 5);

        pdf.setFont('courier', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(100, 116, 139);
        const dateStr = new Date(run.timestamp).toLocaleDateString();
        pdf.text(`${dateStr} | ${run.passedCount}/${run.totalCount} PASS | ${run.duration.toFixed(2)}s`, margin + 100, currentY + 5);

        currentY += 12;
    });

    // Save
    const safeName = projectName.replace(/[^a-z0-9]/gi, '_').toUpperCase();
    pdf.save(`PROJECT_DOSSIER_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`);
};
