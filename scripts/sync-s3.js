import { syncFromS3 } from '../services/s3.js';
import dotenv from 'dotenv';
import db, { initDb } from '../services/db.js';
import { parseRunFolder } from '../services/parser.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPORTS_DIR = path.join(__dirname, "..", "reports", "test_run");

async function main() {
    console.log("🚀 Starting S3 Report Synchronization...");

    // Ensure DB is initialized
    initDb();

    try {
        const downloadedCount = await syncFromS3();
        console.log(`✅ S3 sync completed. Downloaded ${downloadedCount || 0} files.`);

        if (downloadedCount > 0) {
            console.log("🔍 Scanning for new runs to index in database...");
            const targetDir = REPORTS_DIR;
            if (fs.existsSync(targetDir)) {
                const folders = fs.readdirSync(targetDir).filter(f => fs.statSync(path.join(targetDir, f)).isDirectory());
                let indexCount = 0;
                for (const folder of folders) {
                    if (await parseRunFolder(path.join(targetDir, folder))) {
                        indexCount++;
                    }
                }
                console.log(`✨ Indexed ${indexCount} new runs.`);
            }
        }
    } catch (error) {
        console.error("❌ Sync failed:", error);
        process.exit(1);
    }
}

main();
