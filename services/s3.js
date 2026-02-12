
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function syncFromS3() {
    const bucketName = process.env.AWS_S3_BUCKET;
    const region = process.env.AWS_REGION || 'us-east-1';
    const projectName = "dashboard";

    console.log(`[S3 Sync] Environment Check - BUCKET: ${bucketName || 'MISSING'}, REGION: ${region}`);

    if (!bucketName || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.warn("[S3 Sync] Missing AWS credentials or bucket name. Skipping S3 sync.");
        return;
    }

    const s3Client = new S3Client({
        region,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    });

    try {
        console.log(`[S3 Sync] Authenticated. Listing s3://${bucketName}/${projectName}/reports/...`);

        let continuationToken = undefined;
        let downloadedCount = 0;

        do {
            const listCommand = new ListObjectsV2Command({
                Bucket: bucketName,
                Prefix: `${projectName}/reports/`,
                ContinuationToken: continuationToken
            });

            const listedObjects = await s3Client.send(listCommand);

            if (listedObjects.Contents) {
                for (const object of listedObjects.Contents) {
                    const s3Key = object.Key;
                    if (s3Key.endsWith('/')) continue;

                    const relativePath = s3Key.replace(`${projectName}/`, "");
                    // Paths are relative to the root of the project, so we need to go up from services/
                    const localPath = path.join(__dirname, '..', relativePath);

                    if (fs.existsSync(localPath)) continue;

                    console.log(`[S3 Sync] Downloading ${s3Key} -> ${localPath}`);
                    const getCommand = new GetObjectCommand({
                        Bucket: bucketName,
                        Key: s3Key
                    });

                    const response = await s3Client.send(getCommand);
                    const parentDir = path.dirname(localPath);
                    if (!fs.existsSync(parentDir)) {
                        fs.mkdirSync(parentDir, { recursive: true });
                    }

                    const bodyStream = response.Body;
                    const writer = fs.createWriteStream(localPath);
                    await new Promise((resolve, reject) => {
                        if (!bodyStream) return reject("No body stream");
                        bodyStream.pipe(writer);
                        writer.on('finish', resolve);
                        writer.on('error', reject);
                    });
                    downloadedCount++;
                }
            }
            continuationToken = listedObjects.NextContinuationToken;
        } while (continuationToken);

        return downloadedCount;
    } catch (err) {
        console.error("[S3 Sync] Error during S3 synchronization:", err);
        throw err;
    }
}
