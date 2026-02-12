
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = "qa_hub.db";
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

export function initDb() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS runs (
            id TEXT PRIMARY KEY,
            source_folder TEXT,
            timestamp TEXT,
            project TEXT,
            passed INTEGER DEFAULT 0,
            failed INTEGER DEFAULT 0,
            total INTEGER DEFAULT 0,
            duration REAL DEFAULT 0,
            tags TEXT
        );
    `);

    // Migration for existing tables
    try { db.prepare("ALTER TABLE runs ADD COLUMN duration REAL DEFAULT 0").run(); } catch (e) { }

    db.exec(`
        CREATE TABLE IF NOT EXISTS endpoints(
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
        CREATE TABLE IF NOT EXISTS scenarios(
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

    try { db.exec("ALTER TABLE endpoints ADD COLUMN last_failure_at TEXT"); } catch (e) { }
    try { db.exec("ALTER TABLE runs ADD COLUMN tags TEXT"); } catch (e) { }
    try { db.exec("ALTER TABLE scenarios ADD COLUMN raw_logs TEXT"); } catch (e) { }
    try { db.exec("ALTER TABLE scenarios ADD COLUMN tags TEXT"); } catch (e) { }
    try { db.exec("ALTER TABLE scenarios ADD COLUMN steps TEXT"); } catch (e) { }
    try { db.exec("ALTER TABLE scenarios ADD COLUMN feature_name TEXT"); } catch (e) { }
    try { db.exec("ALTER TABLE scenarios ADD COLUMN hostname TEXT"); } catch (e) { }
    try { db.exec("ALTER TABLE scenarios ADD COLUMN source_file TEXT"); } catch (e) { }

    // Seed system endpoints
    const systemEndpoints = [
        { method: 'GET', path: '/api/health', service: 'dashboard-system' },
        { method: 'GET', path: '/api/runs', service: 'dashboard-system' },
        { method: 'GET', path: '/api/endpoints', service: 'dashboard-system' },
        { method: 'POST', path: '/api/upload', service: 'dashboard-system' }
    ];

    const insertEp = db.prepare(`
        INSERT OR IGNORE INTO endpoints (id, method, path, normalized_path, service, last_seen, pass_count) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    systemEndpoints.forEach(ep => {
        const id = `system-${ep.method}-${ep.path}`;
        insertEp.run(id, ep.method, ep.path, ep.path, ep.service, new Date().toISOString(), 1);
    });
}

export default db;
