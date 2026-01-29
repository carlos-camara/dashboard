
import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';
import { ExecutionRun, Scenario, TestStatus } from '../types';

export class PdfGeneratorService {

    /**
     * Generates a "Professional Dossier" PDF for a given test run.
     */
    async generateRunDossier(run: ExecutionRun, scenarios: Scenario[]): Promise<Uint8Array> {
        const doc = await PDFDocument.create();

        // Embed fonts
        const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
        const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

        // --- COVER PAGE ---
        const page1 = doc.addPage([595.28, 841.89]); // A4
        const { width, height } = page1.getSize();

        // Background Header
        page1.drawRectangle({
            x: 0, y: height - 150, width, height: 150,
            color: rgb(0.1, 0.1, 0.2) // Dark Navy
        });

        // Title
        page1.drawText('TEST EXECUTION DOSSIER', {
            x: 50, y: height - 80, size: 24, font: fontBold, color: rgb(1, 1, 1)
        });

        page1.drawText(`CONFIDENTIAL // ${run.environment.toUpperCase()}`, {
            x: 50, y: height - 105, size: 10, font: fontRegular, color: rgb(0.7, 0.7, 0.8)
        });

        // Pass Rate Circle (Simplified visual)
        const passRate = run.passedCount / (run.totalCount || 1);
        const scoreColor = passRate === 1 ? rgb(0, 0.8, 0.4) : passRate > 0.8 ? rgb(1, 0.7, 0) : rgb(0.9, 0.2, 0.2);

        page1.drawText(`${Math.round(passRate * 100)}%`, {
            x: width - 120, y: height - 90, size: 40, font: fontBold, color: scoreColor
        });
        page1.drawText('SUCCESS RATE', {
            x: width - 120, y: height - 110, size: 8, font: fontBold, color: rgb(0.8, 0.8, 0.8)
        });

        // Metadata Table
        let yPos = height - 200;
        this.drawRow(page1, 'Project Identity', run.project, fontBold, fontRegular, yPos); yPos -= 25;
        this.drawRow(page1, 'Run ID', run.id, fontBold, fontRegular, yPos); yPos -= 25;
        this.drawRow(page1, 'Triggered By', run.triggeredBy, fontBold, fontRegular, yPos); yPos -= 25;
        this.drawRow(page1, 'Timestamp', new Date(run.timestamp).toLocaleString(), fontBold, fontRegular, yPos); yPos -= 40;

        // Stats Grid
        this.drawSectionHeader(page1, 'EXECUTIVE SUMMARY', yPos, fontBold); yPos -= 30;

        page1.drawText(`Total Tests: ${run.totalCount}`, { x: 50, y: yPos, size: 12, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
        page1.drawText(`Passed: ${run.passedCount}`, { x: 200, y: yPos, size: 12, font: fontRegular, color: rgb(0, 0.6, 0.3) });
        page1.drawText(`Failed: ${run.failedCount}`, { x: 350, y: yPos, size: 12, font: fontRegular, color: rgb(0.8, 0, 0) });

        // --- DETAILED FAILURE ANALYSIS ---
        const failedScenarios = scenarios.filter(s => s.status === TestStatus.FAILED);
        if (failedScenarios.length > 0) {
            let currentPage = doc.addPage([595.28, 841.89]);
            let cy = height - 50;

            this.drawSectionHeader(currentPage, 'DETAILED FAILURE ANALYSIS', cy, fontBold); cy -= 40;

            for (const scenario of failedScenarios) {
                if (cy < 150) {
                    currentPage = doc.addPage([595.28, 841.89]);
                    cy = height - 50;
                    this.drawSectionHeader(currentPage, 'DETAILED FAILURE ANALYSIS (Cont.)', cy, fontBold); cy -= 40;
                }

                // Scenario Title
                currentPage.drawText(`Scenario: ${scenario.name}`, { x: 50, y: cy, size: 12, font: fontBold, color: rgb(0.8, 0, 0) });
                cy -= 20;

                // Find Failing Step
                const failStep = scenario.steps.find(s => s.status === TestStatus.FAILED);
                if (failStep) {
                    currentPage.drawText(`Failed Step: ${failStep.keyword} ${failStep.name}`, { x: 50, y: cy, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
                    cy -= 20;
                }

                // Error Message (Wrapped)
                if (scenario.errorMessage) {
                    currentPage.drawText('Error Details:', { x: 50, y: cy, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
                    cy -= 15;

                    const lines = this.wrapText(scenario.errorMessage, fontRegular, 10, 500);
                    for (const line of lines) {
                        if (cy < 40) { currentPage = doc.addPage(); cy = height - 40; }
                        currentPage.drawText(line, { x: 50, y: cy, size: 9, font: fontRegular, color: rgb(0.4, 0, 0) });
                        cy -= 12;
                    }
                }

                cy -= 30; // Spacing between failures
            }
        }


        // --- SCENARIO DETAILS ---
        // Create new pages as needed
        let currentPage = doc.addPage([595.28, 841.89]);
        let cy = height - 50;

        this.drawSectionHeader(currentPage, 'SCENARIO LOG', cy, fontBold); cy -= 30;

        scenarios.forEach(scenario => {
            if (cy < 50) {
                currentPage = doc.addPage([595.28, 841.89]);
                cy = height - 50;
            }

            const isPass = scenario.status === TestStatus.PASSED;
            const icon = isPass ? '[ PASS ]' : '[ FAIL ]';
            const iconColor = isPass ? rgb(0, 0.6, 0.3) : rgb(0.8, 0, 0);

            currentPage.drawText(icon, { x: 50, y: cy, size: 10, font: fontBold, color: iconColor });
            currentPage.drawText(scenario.name, { x: 110, y: cy, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
            currentPage.drawText(`${scenario.duration.toFixed(2)}s`, { x: 500, y: cy, size: 10, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });

            cy -= 20;

            // If failed, show error
            if (!isPass && scenario.errorMessage) {
                if (cy < 50) { currentPage = doc.addPage(); cy = height - 50; }
                const errorMsg = scenario.errorMessage.split('\n')[0].substring(0, 90) + '...';
                currentPage.drawText(`Error: ${errorMsg}`, { x: 110, y: cy, size: 9, font: fontRegular, color: rgb(0.8, 0, 0) });
                cy -= 20;
            }
        });

        // Number pages
        const pages = doc.getPages();
        pages.forEach((p, idx) => {
            p.drawText(`Page ${idx + 1} of ${pages.length}`, {
                x: width / 2 - 20, y: 20, size: 9, font: fontRegular, color: rgb(0.6, 0.6, 0.6)
            });
        });

        return await doc.save();
    }

    private drawRow(page: any, label: string, value: string, fontLabel: PDFFont, fontValue: PDFFont, y: number) {
        page.drawText(label.toUpperCase(), { x: 50, y, size: 10, font: fontLabel, color: rgb(0.5, 0.5, 0.5) });
        page.drawText(value, { x: 200, y, size: 10, font: fontValue, color: rgb(0.2, 0.2, 0.2) });
    }

    private wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
        const lines: string[] = [];
        const paragraphs = text.split('\n');

        for (const paragraph of paragraphs) {
            let currentLine = '';
            const words = paragraph.split(' ');

            for (const word of words) {
                const width = font.widthOfTextAtSize(currentLine + ' ' + word, fontSize);
                if (width < maxWidth) {
                    currentLine += (currentLine ? ' ' : '') + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            if (currentLine) lines.push(currentLine);
        }
        return lines;
    }

    private drawSectionHeader(page: any, title: string, y: number, font: PDFFont) {
        page.drawRectangle({ x: 50, y: y - 5, width: 500, height: 20, color: rgb(0.95, 0.95, 0.95) });
        page.drawText(title, { x: 60, y, size: 11, font, color: rgb(0.2, 0.2, 0.3) });
    }
}

export const pdfGenerator = new PdfGeneratorService();
