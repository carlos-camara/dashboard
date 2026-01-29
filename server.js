import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import xml2js from 'xml2js';
const { Parser } = xml2js;
import dotenv from 'dotenv';
import multer from 'multer';
import yaml from 'js-yaml';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORTS_DIR = "reports";
// Use absolute path
const SWAGGERS_DIR = path.join(__dirname, "swaggers");
const UPLOADS_DIR = path.join(__dirname, "uploads");
const SCREENSHOTS_DIR = path.join(__dirname, "features", "resources", "screenshots");
const DB_PATH = "qa_hub.db";

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

const app = express();
const port = process.env.PORT || 3001;
const upload = multer({ dest: UPLOADS_DIR });

app.use(cors());
app.use(express.json());

// Serve screenshots statically
// Access via: http://localhost:3001/screenshots/filename.png
app.use('/screenshots', express.static(SCREENSHOTS_DIR));

// ... (code omitted) ...

// NEW: Get project-level Swagger file (e.g., dashboard.yaml, petstore.json)
app.get("/api/spec/project/:projectName", (req, res) => {
    const { projectName } = req.params;
    if (!projectName) return res.status(400).json({ error: "Missing project name" });

    // Try both .yaml and .json extensions
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

    console.log(`[Project Spec Lookup] Project: ${projectName}`);
    console.log(`[Project Spec Lookup] File Path: ${filePath}`);

    if (filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            let parsed;

            if (fileExt === '.json') {
                parsed = JSON.parse(content);
            } else {
                // Parse YAML
                parsed = yaml.load(content);
            }

            return res.json({ found: true, content: parsed });
        } catch (e) {
            console.error(`[Project Spec Lookup] Parse error for ${filePath}:`, e);
            return res.status(500).json({ error: "Failed to parse spec file" });
        }
    } else {
        console.log(`[Project Spec Lookup] Not found. Available files in ${SWAGGERS_DIR}:`);
        try {
            const files = fs.readdirSync(SWAGGERS_DIR);
            console.log(files.join(", "));
        } catch (e) {
            console.log("Could not list directory.");
        }
    }

    res.json({ found: false });
});

app.get("/api/spec", (req, res) => {
    const { method, path: epPath } = req.query;
    if (!method || !epPath) return res.status(400).json({ error: "Missing method or path" });

    // Try to find matching file: method-normalized_path.json
    // Example: post-v3-mail-send.json
    const cleanPath = epPath.replace(/^\//, '').replace(/\//g, '-');
    const filename = `${method.toLowerCase()}-${cleanPath}.json`;
    const filePath = path.join(SWAGGERS_DIR, filename);

    console.log(`[Spec Lookup] Method: ${method}, Path: ${epPath}`);
    console.log(`[Spec Lookup] Normalized Filename: ${filename}`);
    console.log(`[Spec Lookup] Full Path: ${filePath}`);

    if (fs.existsSync(filePath)) {
        try {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            return res.json({ found: true, content });
        } catch (e) {
            console.error(`[Spec Lookup] Parse error for ${filePath}:`, e);
            return res.status(500).json({ error: "Failed to parse spec file" });
        }
    } else {
        console.log(`[Spec Lookup] Not found. Available files in ${SWAGGERS_DIR}:`);
        try {
            const files = fs.readdirSync(SWAGGERS_DIR);
            console.log(files.join(", "));
        } catch (e) {
            console.log("Could not list directory.");
        }
    }

    res.json({ found: false });
});

// Initialize Database
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

function initDb() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS runs (
            id TEXT PRIMARY KEY,
            source_folder TEXT,
            timestamp TEXT,
            project TEXT,
            passed INTEGER DEFAULT 0,
            failed INTEGER DEFAULT 0,
            total INTEGER DEFAULT 0,
            tags TEXT
        );
        CREATE TABLE IF NOT EXISTS endpoints (
            id TEXT PRIMARY KEY,
            method TEXT,
            path TEXT,
            normalized_path TEXT,
            service TEXT,
            avg_duration REAL DEFAULT 0,
            pass_count INTEGER DEFAULT 0,
            fail_count INTEGER DEFAULT 0,
            last_seen TEXT,
            last_failure_at TEXT
        );
        CREATE TABLE IF NOT EXISTS scenarios (
            id TEXT PRIMARY KEY,
            run_id TEXT,
            name TEXT,
            status TEXT,
            error_message TEXT,
            duration REAL DEFAULT 0,
            timestamp TEXT,
            raw_logs TEXT,
            tags TEXT,
            steps TEXT,
            feature_name TEXT,
            hostname TEXT,
            source_file TEXT,
            FOREIGN KEY(run_id) REFERENCES runs(id)
        );
    `);

    // Migrations
    try { db.exec("ALTER TABLE endpoints ADD COLUMN last_failure_at TEXT"); } catch (e) { }
    try { db.exec("ALTER TABLE runs ADD COLUMN tags TEXT"); } catch (e) { }
    try { db.exec("ALTER TABLE scenarios ADD COLUMN raw_logs TEXT"); } catch (e) { }
    try { db.exec("ALTER TABLE scenarios ADD COLUMN tags TEXT"); } catch (e) { }
    try { db.exec("ALTER TABLE scenarios ADD COLUMN steps TEXT"); } catch (e) { }
    try { db.exec("ALTER TABLE scenarios ADD COLUMN feature_name TEXT"); } catch (e) { }
    try { db.exec("ALTER TABLE scenarios ADD COLUMN hostname TEXT"); } catch (e) { }
    try { db.exec("ALTER TABLE scenarios ADD COLUMN source_file TEXT"); } catch (e) { }
}

initDb();

function normalizePath(p) {
    p = p.replace(/\/[0-9a-fA-F-]{36}/g, '/{uuid}');
    p = p.replace(/\/\d+/g, '/{id}');
    return p;
}

async function parseXmlContent(content, runId, projectName, discoveredTags, metadataScenarios = [], sourceFile = "unknown.xml") {
    const parser = new Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(content);

    // Suite Metadata
    const suite = result.testsuite || (result.testsuites && result.testsuites.testsuite ? (Array.isArray(result.testsuites.testsuite) ? result.testsuites.testsuite[0] : result.testsuites.testsuite) : {});
    const featureName = suite.$.name || projectName;

    let testcases = [];
    if (result.testsuite && result.testsuite.testcase) {
        testcases = Array.isArray(result.testsuite.testcase) ? result.testsuite.testcase : [result.testsuite.testcase];
    } else if (result.testsuites && result.testsuites.testsuite) {
        const suites = Array.isArray(result.testsuites.testsuite) ? result.testsuites.testsuite : [result.testsuites.testsuite];
        suites.forEach(s => {
            if (s.testcase) {
                testcases.push(...(Array.isArray(s.testcase) ? s.testcase : [s.testcase]));
            }
        });
    }

    let stats = { passed: 0, failed: 0, total: 0 };
    let inferredProject = projectName;

    for (const tc of testcases) {
        const tcName = tc.$.name || "Unnamed Scenario";
        const className = tc.$.classname || "";
        const duration = parseFloat(tc.$.time || 0);
        const failure = tc.failure || tc.error;
        const status = failure ? "FAILED" : "PASSED";
        const errorTxt = failure ? (failure._ || failure.$?.message || JSON.stringify(failure)) : null;

        const systemOut = tc['system-out'] || "";
        const systemErr = tc['system-err'] || "";
        const combinedLog = (typeof systemOut === 'string' ? systemOut : (systemOut._ || "")) + "\n" + (typeof systemErr === 'string' ? systemErr : (systemErr._ || ""));
        const trimmedLog = combinedLog.trim();

        const scenarioTags = new Set();
        const logLines = trimmedLog.split('\n');

        // ULTRA-STRICT TAG EXTRACTION: Extract only what's between @scenario.begin and Scenario:
        // Source: <system-out> content (trimmedLog)
        const beginMarker = "@scenario.begin";
        const scenarioLabel = "Scenario:";

        const beginIdx = combinedLog.indexOf(beginMarker);
        const scenarioIdx = combinedLog.indexOf(scenarioLabel, beginIdx);

        if (beginIdx !== -1 && scenarioIdx !== -1 && scenarioIdx > beginIdx) {
            const rawTagSection = combinedLog.substring(beginIdx + beginMarker.length, scenarioIdx);
            const tagsFound = rawTagSection.match(/@\w+/g);
            if (tagsFound) {
                tagsFound.forEach(tag => {
                    const cleanTag = tag.trim();
                    if (cleanTag && cleanTag !== '@scenario' && cleanTag !== '@begin') {
                        scenarioTags.add(cleanTag);
                    }
                });
            }
        }

        // Secondary check removed to enforce strict system-out sourcing as requested.

        // Project Inference from Classname
        if (className && (inferredProject === "Auto-discovered" || !inferredProject)) {
            const parts = className.split('.');
            inferredProject = parts[0];
        }

        // Parse Steps with block content
        const parsedSteps = [];
        const stepRegex = /^\s*(Given|When|Then|And|But)\s+(.+?)\s*\.\.\.\s*(passed|failed|skipped|undefined)(?:\s+in\s+([\d.]+)s)?/i;

        let currentStep = null;

        for (const line of logLines) {
            const match = line.match(stepRegex);
            if (match) {
                if (currentStep) parsedSteps.push(currentStep);

                const keyword = match[1];
                const stepName = match[2];
                const statusStr = match[3].toLowerCase();
                const stepDuration = match[4] ? parseFloat(match[4]) : undefined;
                const stepStatus = statusStr === 'passed' ? 'PASSED' : statusStr === 'failed' ? 'FAILED' : 'SKIPPED';

                currentStep = {
                    keyword,
                    name: stepName,
                    status: stepStatus,
                    duration: stepDuration,
                    log: ""
                };
            } else if (currentStep) {
                // Check if it's a table or docstring or just indented content
                const trimmedLine = line.trim();
                if (trimmedLine && !trimmedLine.includes('@scenario')) {
                    currentStep.log += line + '\n';
                }
            }
        }
        if (currentStep) parsedSteps.push(currentStep);

        if (status === "PASSED") stats.passed++;
        else stats.failed++;
        stats.total++;

        // Discover Endpoint
        let endpointInfo = null;
        const methodPathMatch = tcName.match(/(GET|POST|PUT|DELETE|PATCH)\s+(\/[^\s]+)/i);

        if (!methodPathMatch && metadataScenarios) {
            const sc = metadataScenarios.find(s => s.name === tcName);
            if (sc) endpointInfo = sc.endpoint;
        }

        if (!methodPathMatch && !endpointInfo) {
            const match = trimmedLog.match(/I send a "?(GET|POST|PUT|DELETE|PATCH)"? request to "([^"]+)"/i);
            if (match) {
                endpointInfo = { method: match[1].toUpperCase(), path: match[2] };
            }
        }

        if (methodPathMatch) {
            endpointInfo = { method: methodPathMatch[1].toUpperCase(), path: methodPathMatch[2] };
        }

        if (endpointInfo) {
            const { method, path: fullPath } = endpointInfo;
            const normPath = normalizePath(fullPath);
            const epId = `${inferredProject}-${method}-${normPath}`;
            const nowStr = new Date().toISOString();

            db.prepare(`
                INSERT OR IGNORE INTO endpoints (id, method, path, normalized_path, service, last_seen) 
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(epId, method, fullPath, normPath, inferredProject, nowStr);

            db.prepare(`
                UPDATE endpoints SET 
                pass_count = pass_count + ?, 
                fail_count = fail_count + ?,
                last_seen = ?,
                last_failure_at = CASE WHEN ? = 'FAILED' THEN ? ELSE last_failure_at END,
                avg_duration = (avg_duration * (pass_count + fail_count) + ?) / (pass_count + fail_count + 1)
                WHERE id = ?
            `).run(status === "PASSED" ? 1 : 0, status === "FAILED" ? 1 : 0, nowStr, status, nowStr, duration * 1000, epId);
        }

        db.prepare(`
            INSERT INTO scenarios (id, run_id, name, status, error_message, duration, timestamp, raw_logs, tags, steps, feature_name, source_file)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            `${runId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            runId,
            tcName,
            status,
            errorTxt,
            duration,
            new Date().toISOString(),
            trimmedLog,
            JSON.stringify(Array.from(scenarioTags)),
            JSON.stringify(parsedSteps),
            featureName,
            sourceFile
        );
    }
    return { stats, inferredProject };
}

async function parseRunFolder(folderPath) {
    const folderName = path.basename(folderPath);
    const runId = `RUN-${folderName}`;

    // Clear existing data for this run to allow re-parsing and enrichment
    db.prepare("DELETE FROM scenarios WHERE run_id = ?").run(runId);
    db.prepare("DELETE FROM runs WHERE id = ?").run(runId);

    const metaPath = path.join(folderPath, "run_meta.json");
    let metadata = {};
    if (fs.existsSync(metaPath)) {
        try { metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch (e) { }
    }

    const xmlFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.xml'));
    let totalPassed = 0, totalFailed = 0, totalCount = 0;
    const discoveredTags = new Set(metadata.run_info?.tags || []);
    let projectName = metadata.run_info?.project || "Auto-discovered";

    // Insert placeholder
    db.prepare(`INSERT INTO runs (id, source_folder, timestamp, project, passed, failed, total, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(runId, folderName, new Date().toISOString(), projectName, 0, 0, 0, JSON.stringify([]));

    for (const xmlFile of xmlFiles) {
        try {
            const content = fs.readFileSync(path.join(folderPath, xmlFile), 'utf8');
            const { stats, inferredProject } = await parseXmlContent(content, runId, projectName, discoveredTags, metadata.scenarios, xmlFile);
            totalPassed += stats.passed; totalFailed += stats.failed; totalCount += stats.total;
            projectName = inferredProject;
        } catch (e) {
            console.error(`Error parsing ${xmlFile}:`, e);
        }
    }

    db.prepare(`UPDATE runs SET project = ?, passed = ?, failed = ?, total = ?, tags = ? WHERE id = ?`).run(projectName, totalPassed, totalFailed, totalCount, JSON.stringify([]), runId);
    return true;
}

// Routes
app.post("/api/upload", upload.array('files'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No files uploaded." });
        }

        const runId = `UPLOAD-${Date.now()}`;
        const discoveredTags = new Set();
        let projectName = "Auto-discovered";
        let totalPassed = 0, totalFailed = 0, totalCount = 0;

        db.prepare(`INSERT INTO runs (id, source_folder, timestamp, project, passed, failed, total, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(runId, "UPLOAD", new Date().toISOString(), projectName, 0, 0, 0, JSON.stringify([]));

        for (const file of req.files) {
            const content = fs.readFileSync(file.path, 'utf8');
            const { stats, inferredProject } = await parseXmlContent(content, runId, projectName, discoveredTags);
            totalPassed += stats.passed; totalFailed += stats.failed; totalCount += stats.total;
            projectName = inferredProject;
            fs.unlinkSync(file.path);
        }

        db.prepare(`UPDATE runs SET project = ?, passed = ?, failed = ?, total = ?, tags = ? WHERE id = ?`).run(projectName, totalPassed, totalFailed, totalCount, JSON.stringify([]), runId);

        res.json({ success: true, runId, projectName, totalCount });
    } catch (e) {
        console.error("Upload error:", e);
        res.status(500).json({ error: e.message });
    }
});

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/debug", (req, res) => {
    const reportsPath = path.join(__dirname, REPORTS_DIR);
    const exists = fs.existsSync(reportsPath);
    let structure = [];
    if (exists) {
        structure = fs.readdirSync(reportsPath).map(f => {
            const full = path.join(reportsPath, f);
            const stats = fs.statSync(full);
            return {
                name: f,
                isDir: stats.isDirectory(),
                files: stats.isDirectory() ? fs.readdirSync(full).filter(x => x.endsWith('.xml')).length : 0
            };
        });
    }
    res.json({
        cwd: process.cwd(),
        dirname: __dirname,
        reportsPath,
        exists,
        structure,
        env: {
            NODE_ENV: process.env.NODE_ENV,
            PORT: process.env.PORT
        }
    });
});

app.post("/api/sync", async (req, res) => {
    const reportsPath = req.query.reports_path || REPORTS_DIR;
    const targetDir = path.isAbsolute(reportsPath) ? reportsPath : path.join(__dirname, reportsPath);

    if (!fs.existsSync(targetDir)) {
        if (req.query.reports_path) {
            return res.status(400).json({ detail: `Custom path '${reportsPath}' does not exist.` });
        }
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
});

app.get("/api/runs", (req, res) => {
    const rows = db.prepare("SELECT id, source_folder, timestamp, project, passed as passedCount, failed as failedCount, total as totalCount, tags FROM runs ORDER BY timestamp DESC").all();
    const result = rows.map(r => ({
        ...r,
        name: r.source_folder && r.source_folder !== "UPLOAD" ? r.source_folder : `${r.project} (${new Date(r.timestamp).toLocaleTimeString()})`,
        duration: 0,
        environment: 'Detected',
        triggeredBy: 'System',
        tags: r.tags ? JSON.parse(r.tags) : [],
        skippedCount: 0
    }));
    res.json(result);
});

app.get("/api/runs/:run_id/scenarios", (req, res) => {
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

app.get("/api/endpoints", (req, res) => {
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

// Delete a single run and its associated scenarios
app.delete("/api/runs", (req, res) => {
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

// Delete an entire project (all runs, scenarios and project-specific endpoints)
app.delete("/api/projects", (req, res) => {
    try {
        const projectName = req.query.name;
        if (!projectName) return res.status(400).json({ error: "Missing name parameter" });

        // 1. Delete scenarios for all runs of this project
        db.prepare(`
            DELETE FROM scenarios 
            WHERE run_id IN (SELECT id FROM runs WHERE project = ?)
        `).run(projectName);

        // 2. Delete runs of this project
        db.prepare("DELETE FROM runs WHERE project = ?").run(projectName);

        // 3. Delete endpoints belonging to this project (where service = project)
        db.prepare("DELETE FROM endpoints WHERE service = ?").run(projectName);

        res.json({ success: true, message: `Project ${projectName} and all its data deleted.` });
    } catch (e) {
        console.error("Delete project error:", e);
        res.status(500).json({ error: e.message });
    }
});

// Delete an endpoint
app.delete("/api/endpoints", (req, res) => {
    try {
        const epId = req.query.id;
        if (!epId) return res.status(400).json({ error: "Missing id parameter" });
        db.prepare("DELETE FROM endpoints WHERE id = ?").run(epId);
        res.json({ success: true, message: `Endpoint ${epId} deleted.` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Swagger/Spec Management
if (!fs.existsSync(SWAGGERS_DIR)) {
    fs.mkdirSync(SWAGGERS_DIR);
}


app.post("/api/spec", upload.single('file'), (req, res) => {
    try {
        console.log(`[Spec Upload] Body:`, req.body);
        console.log(`[Spec Upload] File:`, req.file);

        const { method, path: epPath } = req.body;
        if (!req.file || !method || !epPath) {
            console.error("[Spec Upload] Missing fields");
            return res.status(400).json({ error: "Missing file or metadata" });
        }

        const cleanPath = epPath.replace(/^\//, '').replace(/\//g, '-');
        const filename = `${method.toLowerCase()}-${cleanPath}.json`;
        const targetPath = path.join(SWAGGERS_DIR, filename);

        // Move/Rename uploaded file
        fs.renameSync(req.file.path, targetPath);

        res.json({ success: true, filename });
    } catch (e) {
        console.error("Spec upload error:", e);
        res.status(500).json({ error: e.message });
    }
});

// Auto-sync function to run on startup
async function autoSyncOnStartup() {
    const targetDir = path.join(__dirname, REPORTS_DIR);
    if (!fs.existsSync(targetDir)) return;

    console.log(`[Auto-Sync] Scanning for reports in ${targetDir}...`);
    const folders = fs.readdirSync(targetDir).filter(f => fs.statSync(path.join(targetDir, f)).isDirectory());
    for (const folder of folders) {
        await parseRunFolder(path.join(targetDir, folder));
    }
    console.log(`[Auto-Sync] Sync complete. Processed ${folders.length} folders.`);
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    autoSyncOnStartup().catch(err => console.error("[Auto-Sync] Failed:", err));
});
