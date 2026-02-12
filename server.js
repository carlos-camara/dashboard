
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import multer from 'multer';

import db, { initDb } from './services/db.js';
import apiRouter from './routes/api.js';
import { parseXmlContent } from './services/parser.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, "uploads");
const SCREENSHOTS_DIR = path.join(__dirname, "features", "resources", "screenshots");

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

const app = express();
const port = process.env.PORT || 3001;
const upload = multer({ dest: UPLOADS_DIR });

app.use(cors());
app.use(express.json());

// Main Entry
app.get("/", (req, res) => {
    res.send("<h1>QA Command Center API</h1><p>Running in modular mode.</p>");
});

// Static Assets
app.use('/screenshots', express.static(SCREENSHOTS_DIR));

// Modular Routes
app.use("/api", apiRouter);

// Database Initialization
initDb();

// Upload Logic (Keep in main for now for simple multer integration)
app.post("/api/upload", upload.array('files'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No files uploaded." });
        }

        const runId = `UPLOAD-${Date.now()}`;
        const discoveredTags = new Set();
        let projectName = "Auto-discovered";
        let totalPassed = 0, totalFailed = 0, totalCount = 0;

        db.prepare(`INSERT INTO runs(id, source_folder, timestamp, project, passed, failed, total, tags) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`).run(runId, "UPLOAD", new Date().toISOString(), projectName, 0, 0, 0, JSON.stringify([]));

        for (const file of req.files) {
            const content = fs.readFileSync(file.path, 'utf8');
            try {
                const { stats, inferredProject } = await parseXmlContent(content, runId, projectName, discoveredTags, [], file.originalname);
                totalPassed += stats.passed;
                totalFailed += stats.failed;
                totalCount += stats.total;
                projectName = inferredProject;
            } finally {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            }
        }

        const sourceRef = req.files.length === 1 ? req.files[0].originalname : "Batch Upload";
        db.prepare(`UPDATE runs SET project = ?, source_folder = ?, passed = ?, failed = ?, total = ?, tags = ? WHERE id = ? `).run(projectName, sourceRef, totalPassed, totalFailed, totalCount, JSON.stringify([]), runId);

        res.json({ success: true, runId, projectName, totalCount });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(port, () => {
    console.log(`[Server] Command Center API listening at http://localhost:${port}`);
});
