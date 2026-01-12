export interface BackupConfig {
    /** Target directories or files for backup. Supports absolute paths. */
    backupPaths: string[];

    /** Google Drive Folder ID (extracted from the folder URL). */
    driveFolderId: string;

    /** Number of historical archives to retain. Set to 0 to disable rotation. */
    retentionCount: number;

    /** Compression level (0-9). Recommended: 9 for max efficiency. */
    compression: number;

    /**
     * Backup Schedule.
     *
     * Simple usage:
     * - '0 0 * * *'  : Daily at midnight
     * - '0 0/6 * * *': Every 6 hours
     * - '0/30 * * * *': Every 30 minutes
     */
    schedule?: string;

    discordWebhookUrl?: string;
}

export const config: BackupConfig = {
    backupPaths: [
        // "",
        // ""
    ],

    driveFolderId: "",

    retentionCount: 5,

    compression: 9,

    // Example: "1d" (Daily), "6h" (Every 6 hours), "30m" (Every 30 mins)
    schedule: "6h", 

    // Optional: Paste your Discord Webhook URL here
    discordWebhookUrl: "",
};