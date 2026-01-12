import { google, drive_v3 } from 'googleapis';
import fs from 'fs-extra';
import path from 'path';
import { OAuth2Client } from 'google-auth-library';
import logger from './logger';

export class DriveService {
    private drive: drive_v3.Drive;

    constructor(authClient: OAuth2Client) {
        this.drive = google.drive({ version: 'v3', auth: authClient });
    }

    public async uploadFile(filePath: string, folderId: string): Promise<void> {
        const fileName = path.basename(filePath);

        logger.info(`Uploading: ${fileName}`);

        try {
            const res = await this.drive.files.create({
                requestBody: {
                    name: fileName,
                    parents: [folderId],
                },
                media: {
                    mimeType: 'application/zip',
                    body: fs.createReadStream(filePath),
                },
            });

            logger.info(`Upload Success: ${res.data.id}`);
        } catch (error) {
            logger.error('Upload failed:', error);
            throw error;
        }
    }

    public async cleanupOldBackups(folderId: string, retentionCount: number): Promise<void> {
        if (!retentionCount || retentionCount <= 0) return;

        try {
            const res = await this.drive.files.list({
                q: `'${folderId}' in parents and mimeType = 'application/zip' and trashed = false`,
                fields: 'files(id, name, createdTime)',
                orderBy: 'createdTime desc',
            });

            const files = res.data.files || [];
            if (files.length <= retentionCount) return;

            const filesToDelete = files.slice(retentionCount);
            logger.info(`Rotating backups: Cleaning ${filesToDelete.length} old files.`);

            for (const file of filesToDelete) {
                if (file.id) {
                    await this.drive.files.delete({ fileId: file.id });
                }
            }
        } catch (error) {
            logger.warn('Cleanup warning:', error);
        }
    }

    public async verifyDestination(folderId: string): Promise<boolean> {
        try {
            const res = await this.drive.files.get({
                fileId: folderId,
                fields: 'id, name, capabilities',
            });
            
            if (res.data.capabilities?.canAddChildren) {
               logger.info(`Destination verified: ${res.data.name}`);
               return true;
            } else {
                logger.error('Destination folder is not writable.');
                return false;
            }
        } catch (error) {
            logger.error(`Could not verify destination folder ${folderId}:`, error);
            return false;
        }
    }
}