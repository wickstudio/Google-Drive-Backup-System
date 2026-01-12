import { config } from './config';
import { DriveAuth } from './auth';
import { ArchiverService } from './zip';
import { DriveService } from './drive';
import { DiscordService } from './discord';
import logger from './logger';
import fs from 'fs-extra';
import schedule from 'node-schedule';

async function performBackup() {
    const timestamp = new Date().toISOString();
    logger.info(`[${timestamp}] Starting Backup Operation...`);
    
    const discord = new DiscordService();
    await discord.send('Backup Started', `Initiating backup job at ${timestamp}`, 'info');

    try {
        if (config.backupPaths.length === 0) {
            logger.warn('No backup paths configured in config.ts');
            return;
        }

        const auth = new DriveAuth();
        const authClient = await auth.getClient();
        const driveService = new DriveService(authClient);

        const canUpload = await driveService.verifyDestination(config.driveFolderId);
        if (!canUpload) {
            throw new Error("Cannot upload to the specified folder.");
        }

        logger.info('Creating local backup archive...');
        const archiver = new ArchiverService();
        const zipPath = await archiver.createZip(config.backupPaths, config.compression);
        const zipSize = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(2);

        logger.info('Uploading to Google Drive...');
        await driveService.uploadFile(zipPath, config.driveFolderId);

        logger.info('Removing local temporary archive...');
        await fs.remove(zipPath);

        if (config.retentionCount > 0) {
            logger.info('Checking retention policy...');
            await driveService.cleanupOldBackups(config.driveFolderId, config.retentionCount);
        }

        logger.info('=== Backup Completed Successfully ===');
        
        await discord.send(
            'Backup Successful', 
            `**Size:** ${zipSize} MB\n**Status:** Uploaded & Verified\n**Retention:** Checked`, 
            'success'
        );

    } catch (error) {
        logger.error('Backup Process Failed:', error);
        
        await discord.send(
            'Backup Failed', 
            `**Error:** ${error instanceof Error ? error.message : String(error)}`, 
            'error'
        );
    }
}

function parseSchedule(input: string): string {
    const clean = input.trim().toLowerCase();
    
    const simpleRegex = /^(\d+)([dhm])$/;
    const match = clean.match(simpleRegex);

    if (match) {
        const value = parseInt(match[1], 10);
        const unit = match[2];

        if (unit === 'm') {
            return `*/${value} * * * *`;
        } else if (unit === 'h') {
            return `0 */${value} * * *`;
        } else if (unit === 'd') {
            return `0 0 */${value} * *`;
        }
    }

    return input;
}

async function main() {
    logger.info('=== Starting Wick Backup System ===');

    if (config.schedule && config.schedule.trim() !== "") {
        logger.info(`Scheduling Mode Active.`);
        
        const cronExpression = parseSchedule(config.schedule);
        logger.info(`Config: "${config.schedule}" -> Cron: "${cronExpression}"`);
        
        const job = schedule.scheduleJob(cronExpression, performBackup);

        if (job) {
             logger.info(`Next run: ${job.nextInvocation()}`);
             logger.info('Running in background mode. Press Ctrl+C to stop.');
        } else {
            logger.error('Invalid Schedule Pattern. Usage examples: "1d", "6h", "30m" or Cron.');
        }

    } else {
        logger.info('Manual Mode. Running backup now...');
        await performBackup();
        logger.info('Exiting.');
    }
}

main();