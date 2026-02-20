
import fs from 'fs';
import path from 'path';
import xml2js from 'xml2js';
const { Parser } = xml2js;
import db from './db.js';

export function normalizePath(p) {
    p = p.replace(/\/[0-9a-fA-F-]{36}/g, '/{uuid}');
    p = p.replace(/\/\d+/g, '/{id}');
    return p;
}

export async function parseXmlContent(content, runId, projectName, discoveredTags, metadataScenarios = [], sourceFile = "unknown.xml") {
    const parser = new Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(content);

    const suite = result.testsuite || (result.testsuites && result.testsuites.testsuite ? (Array.isArray(result.testsuites.testsuite) ? result.testsuites.testsuite[0] : result.testsuites.testsuite) : {});
    const featureName = suite.$.name || projectName;
    const suiteTime = parseFloat(suite.$.time || 0);

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

    let suiteTimestamp = new Date().toISOString();
    if (suite.$.timestamp) {
        suiteTimestamp = new Date(suite.$.timestamp).toISOString();
    }

    let stats = { passed: 0, failed: 0, total: 0, duration: 0 };
    let inferredProject = (projectName && projectName !== "Auto-discovered") ? projectName : "";

    const suiteName = suite.$.name || "";
    if (!inferredProject && suiteName) {
        if (suiteName.toLowerCase().startsWith('dashboard')) {
            inferredProject = 'dashboard';
        } else if (!suiteName.toLowerCase().includes('suite')) {
            inferredProject = suiteName;
        }
    }

    for (const tc of testcases) {
        const tcName = tc.$.name || "Unnamed Scenario";
        const className = tc.$.classname || "";
        const duration = parseFloat(tc.$.time || 0);
        stats.duration += duration;
        const failure = tc.failure || tc.error;
        const status = failure ? "FAILED" : "PASSED";
        const errorTxt = failure ? (failure._ || failure.$?.message || JSON.stringify(failure)) : null;

        const systemOut = tc['system-out'] || "";
        const systemErr = tc['system-err'] || "";
        const combinedLog = (typeof systemOut === 'string' ? systemOut : (systemOut._ || "")) + "\n" + (typeof systemErr === 'string' ? systemErr : (systemErr._ || ""));
        const trimmedLog = combinedLog.trim();

        const scenarioTags = new Set();
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

        if (className && (inferredProject === "Auto-discovered" || !inferredProject)) {
            const parts = className.split('.');
            inferredProject = parts[0];
        }

        const parsedSteps = [];
        const stepRegex = /^\s*(Given|When|Then|And|But)\s+(.+?)\s*\.\.\.\s*(passed|failed|skipped|undefined)(?:\s+in\s+([\d.]+)s)?/i;

        let currentStep = null;
        for (const line of trimmedLog.split('\n')) {
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

        scenarioTags.forEach(t => discoveredTags.add(t));

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

        if (endpointInfo && !scenarioTags.has('@negative')) {
            const { method, path: fullPath } = endpointInfo;
            const normPath = normalizePath(fullPath);
            const epId = `${inferredProject}-${method}-${normPath}`;
            const nowStr = suiteTimestamp;

            db.prepare(`
                INSERT OR IGNORE INTO endpoints(id, method, path, normalized_path, service, last_seen)
                VALUES(?, ?, ?, ?, ?, ?)
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
            INSERT INTO scenarios(id, run_id, name, status, error_message, duration, timestamp, raw_logs, tags, steps, feature_name, source_file)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            `${runId}-${Date.now()}-${Math.random().toString(36).substr(3, 5)}`,
            runId,
            tcName,
            status,
            errorTxt,
            duration,
            suiteTimestamp,
            trimmedLog,
            JSON.stringify(Array.from(scenarioTags)),
            JSON.stringify(parsedSteps),
            featureName,
            sourceFile
        );
    }
    return { stats: { ...stats, duration: Math.max(suiteTime, stats.duration) }, inferredProject, timestamp: suiteTimestamp };
}

export async function parseRunFolder(folderPath, force = false) {
    const folderName = path.basename(folderPath);
    const runId = `RUN-${folderName}`;

    if (!force) {
        const existing = db.prepare("SELECT id FROM runs WHERE id = ?").get(runId);
        if (existing) {
            return false; // Skip parsing
        }
    }

    db.prepare("DELETE FROM scenarios WHERE run_id = ?").run(runId);
    db.prepare("DELETE FROM runs WHERE id = ?").run(runId);

    const metaPath = path.join(folderPath, "run_meta.json");
    let metadata = {};
    if (fs.existsSync(metaPath)) {
        try { metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch (e) { }
    }

    const xmlFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.xml'));
    let totalPassed = 0, totalFailed = 0, totalCount = 0, totalRunDuration = 0;
    const discoveredTags = new Set(metadata.run_info?.tags || []);
    let projectName = metadata.run_info?.project || "Auto-discovered";

    if (projectName === "Auto-discovered") {
        // [NEW] Robust project inference from folder name (prefix before first underscore)
        const folderPrefix = folderName.split('_')[0];
        if (folderPrefix && folderPrefix !== folderName) {
            projectName = folderPrefix;
        } else if (folderName.toLowerCase().includes('dashboard')) {
            projectName = "dashboard";
        }
    }

    let earliestTimestamp = new Date().toISOString();
    let isFirstFile = true;

    db.prepare(`INSERT INTO runs(id, source_folder, timestamp, project, passed, failed, total, duration, tags) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(runId, folderName, earliestTimestamp, projectName, 0, 0, 0, 0, JSON.stringify([]));

    for (const xmlFile of xmlFiles) {
        try {
            const content = fs.readFileSync(path.join(folderPath, xmlFile), 'utf8');
            const { stats, inferredProject, timestamp } = await parseXmlContent(content, runId, projectName, discoveredTags, metadata.scenarios, xmlFile);
            totalPassed += stats.passed; totalFailed += stats.failed; totalCount += stats.total;
            totalRunDuration += stats.duration || 0;

            if (inferredProject && inferredProject !== "Auto-discovered") {
                projectName = inferredProject;
            }

            if (timestamp) {
                if (isFirstFile || new Date(timestamp) < new Date(earliestTimestamp)) {
                    earliestTimestamp = timestamp;
                    isFirstFile = false;
                }
            }

            if (xmlFile.toLowerCase().includes('api')) discoveredTags.add('API');
            if (xmlFile.toLowerCase().includes('gui')) discoveredTags.add('GUI');

        } catch (e) {
            console.error(`Error parsing ${xmlFile}: `, e);
        }
    }

    db.prepare(`UPDATE runs SET project = ?, passed = ?, failed = ?, total = ?, tags = ?, timestamp = ?, duration = ? WHERE id = ? `).run(projectName, totalPassed, totalFailed, totalCount, JSON.stringify([...discoveredTags]), earliestTimestamp, totalRunDuration, runId);
    return true;
}
