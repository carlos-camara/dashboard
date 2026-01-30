import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('qa_hub.db');
console.log('Cleaning up negative endpoints...');
db.prepare("DELETE FROM endpoints WHERE path = '/api/sync' AND method IN ('GET', 'PUT', 'DELETE', 'PATCH')").run();
const endpoints = db.prepare("SELECT * FROM endpoints WHERE path LIKE '%/api/sync%'").all();
console.log('--- Endpoints (/api/sync) after cleanup ---');
console.log(JSON.stringify(endpoints, null, 2));

const reportsDir = path.join(__dirname, 'reports');
if (fs.existsSync(reportsDir)) {
    console.log('\n--- Reports Directory ---');
    console.log(fs.readdirSync(reportsDir));
} else {
    console.log('\n--- Reports Directory NOT FOUND ---');
}


