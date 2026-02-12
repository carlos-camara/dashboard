
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import db from '../services/db.js';
import { syncFromS3 } from '../services/s3.js';
import { parseXmlContent, parseRunFolder } from '../services/parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPORTS_DIR = path.join(__dirname, "..", "reports", "test_run");
const SWAGGERS_DIR = path.join(__dirname, "..", "swaggers");

const router = express.Router();

// Helper to find latest performance run
const getLatestPerfFolder = () => {
    const perfDir = path.join(__dirname, "..", "reports", "performance_run");
    if (!fs.existsSync(perfDir)) return null;

    const folders = fs.readdirSync(perfDir)
        .filter(f => f.startsWith('performance_') && fs.statSync(path.join(perfDir, f)).isDirectory())
        .sort()
        .reverse();

    return folders.length > 0 ? path.join(perfDir, folders[0]) : null;
};

router.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.get("/runs", (req, res) => {
    const rows = db.prepare("SELECT id, source_folder, timestamp, project, passed as passedCount, failed as failedCount, total as totalCount, duration, tags FROM runs ORDER BY timestamp DESC").all();
    const result = rows.map(r => ({
        ...r,
        name: r.source_folder && r.source_folder !== "UPLOAD" ? r.source_folder : `${r.project} (${new Date(r.timestamp).toLocaleTimeString()})`,
        duration: r.duration || 0,
        environment: 'Detected',
        triggeredBy: 'System',
        tags: r.tags ? JSON.parse(r.tags) : [],
        skippedCount: 0
    }));
    res.json(result);
});

router.get("/runs/:run_id/scenarios", (req, res) => {
    const rows = db.prepare("SELECT id, run_id as runId, name, status, error_message as errorMessage, duration, timestamp, raw_logs as rawLogs, tags, steps, feature_name as featureName, hostname, source_file as sourceFile FROM scenarios WHERE run_id = ?").all(req.params.run_id);
    const result = rows.map(r => ({
        ...r,
        rawLogs: r.rawLogs || "",
        tags: r.tags ? JSON.parse(r.tags) : [],
        steps: r.steps ? JSON.parse(r.steps) : [
            { keyword: "Given", name: "API connectivity check", status: "PASSED" },
            { keyword: "When", name: "Scenario logic executed", status: r.status },
            { keyword: "Then", name: "Expectations validated", status: r.status }
        ]
    }));
    res.json(result);
});

router.get("/endpoints", (req, res) => {
    const rows = db.prepare(`
        SELECT id, method, path, normalized_path as normalizedPath, service,
        avg_duration as avgDuration, pass_count as passCount,
        fail_count as failCount, last_seen as lastSeen,
        last_failure_at as lastFailureAt 
        FROM endpoints
    `).all();
    const result = rows.map(r => ({
        ...r,
        projects: [r.service]
    }));
    res.json(result);
});

router.post("/sync", async (req, res) => {
    try {
        await syncFromS3();
        const targetDir = REPORTS_DIR;
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
            return res.json({ new_runs_discovered: 0 });
        }
        const folders = fs.readdirSync(targetDir).filter(f => fs.statSync(path.join(targetDir, f)).isDirectory());
        let count = 0;
        for (const folder of folders) {
            if (await parseRunFolder(path.join(targetDir, folder))) {
                count++;
            }
        }
        res.json({ new_runs_discovered: count, scanned_path: targetDir });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.delete("/runs", (req, res) => {
    try {
        const runId = req.query.id;
        if (!runId) return res.status(400).json({ error: "Missing id parameter" });
        db.prepare("DELETE FROM scenarios WHERE run_id = ?").run(runId);
        db.prepare("DELETE FROM runs WHERE id = ?").run(runId);
        res.json({ success: true, message: `Run ${runId} deleted.` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.delete("/endpoints", (req, res) => {
    try {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: "Missing id parameter" });
        db.prepare("DELETE FROM endpoints WHERE id = ?").run(id);
        res.json({ success: true, message: `Endpoint ${id} deleted.` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get("/performance/latest", (req, res) => {
    const latestDir = getLatestPerfFolder();
    if (!latestDir) return res.json({ found: false, stats: [], history: [] });

    try {
        const statsPath = path.join(latestDir, "seed_stats.csv");
        const historyPath = path.join(latestDir, "seed_stats_history.csv");

        let stats = [];
        if (fs.existsSync(statsPath)) {
            const content = fs.readFileSync(statsPath, 'utf8');
            const lines = content.split('\n').filter(l => l.trim());
            const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));

            stats = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.replace(/"/g, ''));
                return {
                    method: values[0],
                    name: values[1],
                    requests: parseInt(values[2]),
                    failures: parseInt(values[3]),
                    median: parseFloat(values[4]),
                    avg: parseFloat(values[5]),
                    min: parseFloat(values[6]),
                    max: parseFloat(values[7]),
                    contentSize: parseFloat(values[8]),
                    rps: parseFloat(values[9]),
                    failPerSec: parseFloat(values[10]),
                    p50: parseFloat(values[11]),
                    p95: parseFloat(values[16])
                };
            });
        }

        const timestampStr = path.basename(latestDir).replace('performance_', '').replace(/_/g, 'T').replace(/-/g, ':');
        const reportUrl = `/reports/performance_run/${path.basename(latestDir)}/index.html`;

        res.json({
            found: true,
            stats,
            reportUrl,
            timestamp: new Date(timestampStr).toISOString()
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get("/spec", (req, res) => {
    const { method, path: epPath } = req.query;
    if (!method || !epPath) return res.status(400).json({ error: "Missing method or path" });

    const filename = `${method.toLowerCase()}-${epPath.replace(/\//g, '-').replace(/^-/, '')}.json`;
    const fullPath = path.join(SWAGGERS_DIR, filename);

    if (fs.existsSync(fullPath)) {
        try {
            const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
            return res.json({ found: true, content });
        } catch (e) {
            return res.status(500).json({ error: "Failed to parse spec" });
        }
    }
    res.json({ found: false });
});

router.post("/spec", multer({ dest: 'uploads/' }).single('file'), (req, res) => {
    const { method, path: epPath } = req.body;
    if (!req.file || !method || !epPath) return res.status(400).json({ error: "Missing file, method or path" });

    const filename = `${method.toLowerCase()}-${epPath.replace(/\//g, '-').replace(/^-/, '')}.json`;
    const targetPath = path.join(SWAGGERS_DIR, filename);

    if (!fs.existsSync(SWAGGERS_DIR)) fs.mkdirSync(SWAGGERS_DIR);

    fs.renameSync(req.file.path, targetPath);
    res.json({ success: true });
});

router.get("/spec/project/:projectName", (req, res) => {
    const { projectName } = req.params;
    const extensions = ['.yaml', '.yml', '.json'];
    let filePath = null;
    let fileExt = null;

    for (const ext of extensions) {
        const testPath = path.join(SWAGGERS_DIR, `${projectName}${ext}`);
        if (fs.existsSync(testPath)) {
            filePath = testPath;
            fileExt = ext;
            break;
        }
    }

    if (filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            let parsed = fileExt === '.json' ? JSON.parse(content) : yaml.load(content);
            return res.json({ found: true, content: parsed });
        } catch (e) {
            return res.status(500).json({ error: "Failed to parse spec file" });
        }
    }
    res.json({ found: false });
});

export default router;
